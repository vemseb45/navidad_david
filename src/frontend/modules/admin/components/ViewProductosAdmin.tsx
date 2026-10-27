'use client';

import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, X } from 'lucide-react';
import { StoreSection, StoreProduct } from '@/types/domain.types';

interface ViewProductosAdminProps {
  sections: StoreSection[];
  onRefresh: () => void;
}

export function ViewProductosAdmin({
  sections,
  onRefresh,
}: ViewProductosAdminProps) {
  const [selectedSectionSlug, setSelectedSectionSlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);

  // Formulario Modal
  const [targetSectionId, setTargetSectionId] = useState<string>(
    sections[0]?.id ? String(sections[0].id) : ''
  );
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precioBase, setPrecioBase] = useState<number>(0);
  const [precioComparacion, setPrecioComparacion] = useState<number | undefined>(undefined);
  const [badgeTop, setBadgeTop] = useState('');
  const [badgeBottom, setBadgeBottom] = useState('');
  const [variantsString, setVariantsString] = useState('1.80m:420000, 2.10m:580000, 2.40m:750000');
  const [imagesFiles, setImagesFiles] = useState<FileList | null>(null);
  const [saving, setSaving] = useState(false);

  // Filtrado
  const allProducts = sections.flatMap((sec) =>
    sec.products.map((p) => ({ ...p, sectionTitle: sec.title, sectionSlug: sec.slug }))
  );

  const filteredProducts = allProducts.filter((prod) => {
    const matchesSection = selectedSectionSlug === 'all' || prod.sectionSlug === selectedSectionSlug;
    const matchesSearch =
      searchQuery.trim() === '' ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setTargetSectionId(sections[0]?.id ? String(sections[0].id) : '');
    setNombre('');
    setDescripcion('');
    setPrecioBase(0);
    setPrecioComparacion(undefined);
    setBadgeTop('');
    setBadgeBottom('');
    setVariantsString('1.80m:420000, 2.10m:580000, 2.40m:750000');
    setImagesFiles(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: StoreProduct) => {
    setEditingProduct(prod);
    setTargetSectionId(String(prod.sectionId));
    setNombre(prod.name);
    setDescripcion(prod.description);
    setPrecioBase(prod.basePrice);
    setPrecioComparacion(prod.compareAtPrice ? Number(prod.compareAtPrice) : undefined);
    setBadgeTop(prod.badgeTop || '');
    setBadgeBottom(prod.badgeBottom || '');
    const vStr = prod.variants.map((v) => `${v.label}:${v.price}`).join(', ');
    setVariantsString(vStr);
    setImagesFiles(null);
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nombre,
            description: descripcion,
            basePrice: precioBase,
            compareAtPrice: precioComparacion,
            badgeTop: badgeTop || null,
            badgeBottom: badgeBottom || null,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } else {
        const formData = new FormData();
        formData.append('type', 'product');
        formData.append('sectionId', targetSectionId);
        formData.append('name', nombre);
        formData.append('description', descripcion);
        formData.append('basePrice', String(precioBase));
        if (precioComparacion) formData.append('compareAtPrice', String(precioComparacion));
        if (badgeTop) formData.append('badgeTop', badgeTop);
        if (badgeBottom) formData.append('badgeBottom', badgeBottom);

        if (variantsString.trim()) {
          const parsed = variantsString.split(',').map((part) => {
            const [label, priceStr] = part.split(':');
            return {
              label: label.trim(),
              price: Number(priceStr?.trim() || precioBase),
            };
          });
          formData.append('variants', JSON.stringify(parsed));
        }

        if (imagesFiles) {
          for (let i = 0; i < imagesFiles.length; i++) {
            formData.append('images', imagesFiles[i]);
          }
        }

        const res = await fetch('/api/catalog', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}" y todos sus binarios WebP?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* HEADER BAR CON ACCIÓN NUEVO PRODUCTO */}
      <div className="bg-[#081a13] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#22c55e]">
            Inventario & Catálogo
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
            Gestión de Productos Navideños
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Las fotos subidas se convierten a binarios .webp optimizados fuera de Git con Sharp.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#040d0a] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
        >
          <Plus size={16} />
          <span>Añadir Producto</span>
        </button>
      </div>

      {/* FILTROS Y BUSCADOR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#081a13] p-4 rounded-2xl border border-white/10 shadow-xl">
        {/* BUSCADOR */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, SKU o descripción..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-[#0d281e] border border-white/10 text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e] focus:border-[#22c55e] focus:outline-none"
          />
        </div>

        {/* SELECTOR DE SECCIÓN */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedSectionSlug('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedSectionSlug === 'all'
                ? 'bg-[#22c55e] text-[#040d0a] shadow-sm'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            Todas ({allProducts.length})
          </button>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSectionSlug(sec.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedSectionSlug === sec.slug
                  ? 'bg-[#22c55e] text-[#040d0a] shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {sec.title} ({sec.products.length})
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO DE PRODUCTOS EN DARK LUXURY */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-[#081a13] rounded-2xl border border-white/10">
          <p className="text-sm font-bold text-slate-400">No se encontraron productos coincidentes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-[#081a13] rounded-2xl p-5 border border-white/10 shadow-xl hover:border-[#22c55e]/30 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* PREVIEW DE IMAGEN */}
                <div className="relative aspect-[4/3] rounded-xl bg-[#05140e] overflow-hidden mb-4 border border-white/10">
                  <img
                    src={prod.images[0]?.storagePath || '/placeholder-tree.svg'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%2305140e'><rect width='100' height='100'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2322c55e' font-size='14'>Navidad David</text></svg>";
                    }}
                  />
                  {prod.badgeTop && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#ef4444] text-white text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      {prod.badgeTop}
                    </span>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-sm text-slate-300 text-[10px] font-mono border border-white/10">
                    {prod.images.length} foto(s) WebP
                  </span>
                </div>

                {/* INFO */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{prod.sku}</span>
                    <span className="text-[10px] font-bold text-[#22c55e] bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {prod.sectionTitle}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-white leading-tight">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{prod.description}</p>
                </div>

                {/* VARIANTES */}
                {prod.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-white/5">
                    {prod.variants.map((v) => (
                      <span
                        key={v.id}
                        className="text-[10px] font-semibold bg-[#0d281e] border border-white/5 px-2 py-0.5 rounded-md text-slate-300"
                      >
                        {v.label}: <strong className="text-[#ffe088]">${Number(v.price).toLocaleString('es-CO')}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* FOOTER CON PRECIO Y ACCIONES */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-[#22c55e]">
                    ${prod.basePrice.toLocaleString('es-CO')} <span className="text-xs text-slate-400 font-normal">COP</span>
                  </span>
                  {prod.compareAtPrice && (
                    <span className="text-xs text-slate-500 line-through ml-1.5 block">
                      ${Number(prod.compareAtPrice).toLocaleString('es-CO')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(prod)}
                    className="p-2 rounded-xl bg-[#0d281e] hover:bg-[#123427] hover:text-[#22c55e] border border-white/10 text-slate-300 transition-colors"
                    title="Editar producto"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                    className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR / EDITAR PRODUCTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#081a13] border border-white/15 rounded-t-[28px] sm:rounded-2xl max-w-xl w-full p-5 sm:p-8 shadow-2xl max-h-[94vh] sm:max-h-[92vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Las imágenes se optimizan automáticamente a binarios WebP.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-3.5">
              {!editingProduct && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Sección de Catálogo</label>
                  <select
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-white/10 text-xs bg-[#0d281e] text-white focus:ring-1 focus:ring-[#22c55e]"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#081a13] text-white">
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Producto</label>
                <input
                  required
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Pino Nevado de Lujo..."
                  className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Precio Base (COP)</label>
                  <input
                    required
                    type="number"
                    value={precioBase || ''}
                    onChange={(e) => setPrecioBase(Number(e.target.value))}
                    placeholder="420000"
                    className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Precio Anterior (Opcional)</label>
                  <input
                    type="number"
                    value={precioComparacion || ''}
                    onChange={(e) =>
                      setPrecioComparacion(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="520000"
                    className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Badge Superior</label>
                  <input
                    type="text"
                    value={badgeTop}
                    onChange={(e) => setBadgeTop(e.target.value)}
                    placeholder="Más Vendido"
                    className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Badge Inferior</label>
                  <input
                    type="text"
                    value={badgeBottom}
                    onChange={(e) => setBadgeBottom(e.target.value)}
                    placeholder="Efecto Nieve"
                    className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles sobre materiales, densidad, etc..."
                  className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
                />
              </div>

              {!editingProduct && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Variantes de Altura (Formato: Etiqueta:Precio)
                  </label>
                  <input
                    type="text"
                    value={variantsString}
                    onChange={(e) => setVariantsString(e.target.value)}
                    placeholder="1.80m:420000, 2.10m:580000, 2.40m:750000"
                    className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs font-mono focus:ring-1 focus:ring-[#22c55e]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Subir Imágenes (Sharp las convertirá a .webp fuera de Git)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImagesFiles(e.target.files)}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0d281e] file:text-[#22c55e] file:border file:border-white/10"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  disabled={saving}
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#040d0a] text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-md"
                >
                  {saving ? 'Guardando...' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
