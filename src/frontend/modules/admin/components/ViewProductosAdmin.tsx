'use client';

import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Search, Image as ImageIcon, Sparkles, Filter, X } from 'lucide-react';
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
  const [targetSectionId, setTargetSectionId] = useState(sections[0]?.id || '');
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
    setTargetSectionId(sections[0]?.id || '');
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
    setTargetSectionId(prod.sectionId);
    setNombre(prod.name);
    setDescripcion(prod.description);
    setPrecioBase(prod.basePrice);
    setPrecioComparacion(prod.compareAtPrice ? Number(prod.compareAtPrice) : undefined);
    setBadgeTop(prod.badgeTop || '');
    setBadgeBottom(prod.badgeBottom || '');
    setImagesFiles(null);
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || precioBase <= 0) {
      alert('Nombre y precio base válidos son requeridos');
      return;
    }

    setSaving(true);
    try {
      if (editingProduct) {
        // Actualizar producto existente
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nombre,
            description: descripcion,
            basePrice: precioBase,
            compareAtPrice: precioComparacion,
            badgeTop,
            badgeBottom,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        // Si subió imágenes nuevas durante la edición
        if (imagesFiles && imagesFiles.length > 0) {
          for (let i = 0; i < imagesFiles.length; i++) {
            const imgFormData = new FormData();
            imgFormData.append('image', imagesFiles[i]);
            await fetch(`/api/products/${editingProduct.id}`, {
              method: 'POST',
              body: imgFormData,
            });
          }
        }
      } else {
        // Crear nuevo producto con Sharp WebP
        const formData = new FormData();
        formData.append('sectionId', targetSectionId);
        formData.append('name', nombre);
        formData.append('description', descripcion);
        formData.append('basePrice', precioBase.toString());
        if (precioComparacion) formData.append('compareAtPrice', precioComparacion.toString());
        if (badgeTop) formData.append('badgeTop', badgeTop);
        if (badgeBottom) formData.append('badgeBottom', badgeBottom);

        // Parsear variantes si existen
        if (variantsString.trim()) {
          const parsed = variantsString.split(',').map((item) => {
            const [label, priceStr] = item.split(':');
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

  const handleDeleteProduct = async (id: string, name: string) => {
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
      <div className="bg-white p-6 rounded-[28px] border border-[#e4e2de] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#b90d1c]">
            Inventario & Catálogo
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#002718]">
            Gestión de Productos Navideños
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Las fotos subidas se convierten a binarios .webp optimizados fuera de Git con Sharp.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 rounded-2xl bg-[#133e2b] hover:bg-[#002718] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-98"
        >
          <Plus size={16} />
          <span>Añadir Producto</span>
        </button>
      </div>

      {/* FILTROS Y BUSCADOR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e4e2de]">
        {/* BUSCADOR */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, SKU o descripción..."
            className="w-full h-10 pl-10 pr-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#133e2b] focus:outline-none"
          />
        </div>

        {/* SELECTOR DE SECCIÓN */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedSectionSlug('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedSectionSlug === 'all'
                ? 'bg-[#133e2b] text-white shadow-xs'
                : 'bg-[#efeeea] text-[#414943] hover:text-black'
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
                  ? 'bg-[#133e2b] text-white shadow-xs'
                  : 'bg-[#efeeea] text-[#414943] hover:text-black'
              }`}
            >
              {sec.title} ({sec.products.length})
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO DE PRODUCTOS (Estilo Barber_Tech_BF/ViewServicios.tsx) */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#e4e2de]">
          <p className="text-sm font-bold text-gray-600">No se encontraron productos coincidentes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-[28px] p-5 border border-[#e4e2de] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* PREVIEW DE IMAGEN */}
                <div className="relative aspect-[4/3] rounded-2xl bg-[#efeeea] overflow-hidden mb-4 border border-gray-200">
                  <img
                    src={prod.images[0]?.storagePath || '/placeholder-tree.svg'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23002718'><rect width='100' height='100'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23ffe088' font-size='14'>Navidad David</text></svg>";
                    }}
                  />
                  {prod.badgeTop && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#b90d1c] text-white text-[9px] font-bold uppercase tracking-wider">
                      {prod.badgeTop}
                    </span>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono">
                    {prod.images.length} foto(s) WebP
                  </span>
                </div>

                {/* INFO */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-gray-400">{prod.sku}</span>
                    <span className="text-[10px] font-bold text-[#133e2b] bg-[#133e2b]/10 px-2 py-0.5 rounded-full">
                      {prod.sectionTitle}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#002718] leading-tight">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{prod.description}</p>
                </div>

                {/* VARIANTES */}
                {prod.variants.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-gray-100">
                    {prod.variants.map((v) => (
                      <span
                        key={v.id}
                        className="text-[10px] font-semibold bg-[#efeeea] px-2 py-0.5 rounded-md text-gray-700"
                      >
                        {v.label}: ${Number(v.price).toLocaleString('es-CO')}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* FOOTER CON PRECIO Y ACCIONES */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-[#002718]">
                    ${prod.basePrice.toLocaleString('es-CO')}
                  </span>
                  {prod.compareAtPrice && (
                    <span className="text-xs text-gray-400 line-through ml-1.5">
                      ${Number(prod.compareAtPrice).toLocaleString('es-CO')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(prod)}
                    className="p-2 rounded-xl bg-[#efeeea] hover:bg-[#133e2b] hover:text-white text-gray-700 transition-colors"
                    title="Editar producto"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#002718]">
                  {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
                </h3>
                <p className="text-xs text-gray-500">
                  Las imágenes se optimizan automáticamente a binarios WebP.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#efeeea] flex items-center justify-center text-gray-600 hover:text-black"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-3.5">
              {!editingProduct && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Sección de Catálogo</label>
                  <select
                    value={targetSectionId}
                    onChange={(e) => setTargetSectionId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nombre del Producto</label>
                <input
                  required
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Pino Nevado de Lujo..."
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Precio Base (COP)</label>
                  <input
                    required
                    type="number"
                    value={precioBase || ''}
                    onChange={(e) => setPrecioBase(Number(e.target.value))}
                    placeholder="420000"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Precio Anterior (Opcional)</label>
                  <input
                    type="number"
                    value={precioComparacion || ''}
                    onChange={(e) =>
                      setPrecioComparacion(e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="520000"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Badge Superior</label>
                  <input
                    type="text"
                    value={badgeTop}
                    onChange={(e) => setBadgeTop(e.target.value)}
                    placeholder="Más Vendido"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Badge Inferior</label>
                  <input
                    type="text"
                    value={badgeBottom}
                    onChange={(e) => setBadgeBottom(e.target.value)}
                    placeholder="Efecto Nieve"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalles sobre materiales, densidad, etc..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              {!editingProduct && (
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Variantes de Altura (Formato: Etiqueta:Precio)
                  </label>
                  <input
                    type="text"
                    value={variantsString}
                    onChange={(e) => setVariantsString(e.target.value)}
                    placeholder="1.80m:420000, 2.10m:580000, 2.40m:750000"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Subir Imágenes (Sharp las convertirá a .webp fuera de Git)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImagesFiles(e.target.files)}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#efeeea] file:text-[#002718]"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  disabled={saving}
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#133e2b] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
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
