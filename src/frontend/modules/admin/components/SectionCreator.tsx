'use client';

import React, { useState } from 'react';
import { StoreSection } from '@/types/domain.types';

export function SectionCreator({
  sections,
  onCreated,
}: {
  sections: StoreSection[];
  onCreated: () => void;
}) {
  // Estado para crear sección
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSubtitle, setSectionSubtitle] = useState('');
  const [badgeText, setBadgeText] = useState('Nueva Colección');
  const [iconName, setIconName] = useState('redeem');
  const [hasVariants, setHasVariants] = useState(false);
  const [hasSubcategories, setHasSubcategories] = useState(false);
  const [creatingSection, setCreatingSection] = useState(false);

  // Estado para añadir producto
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id ? String(sections[0].id) : ''
  );
  const [prodName, setProdName] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodBasePrice, setProdBasePrice] = useState<number>(0);
  const [prodComparePrice, setProdComparePrice] = useState<number | undefined>(undefined);
  const [badgeTop, setBadgeTop] = useState('');
  const [badgeBottom, setBadgeBottom] = useState('');
  const [prodImages, setProdImages] = useState<FileList | null>(null);
  const [creatingProduct, setCreatingProduct] = useState(false);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    setCreatingSection(true);
    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'section',
          title: sectionTitle,
          subtitle: sectionSubtitle,
          badgeText,
          iconName,
          hasHeightVariants: hasVariants,
          hasSubcategories,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      alert('¡Nueva sección creada con auto-organización exitosa!');
      setSectionTitle('');
      setSectionSubtitle('');
      onCreated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear sección');
    } finally {
      setCreatingSection(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    setCreatingProduct(true);
    try {
      const formData = new FormData();
      formData.append('type', 'product');
      formData.append('sectionId', selectedSectionId);
      formData.append('name', prodName);
      formData.append('description', prodDescription);
      formData.append('basePrice', String(prodBasePrice));
      if (prodComparePrice) formData.append('compareAtPrice', String(prodComparePrice));
      if (badgeTop) formData.append('badgeTop', badgeTop);
      if (badgeBottom) formData.append('badgeBottom', badgeBottom);

      if (prodImages) {
        for (let i = 0; i < prodImages.length; i++) {
          formData.append('images', prodImages[i]);
        }
      }

      const res = await fetch('/api/catalog', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      alert('¡Producto creado con éxito y binarios WebP optimizados!');
      setProdName('');
      setProdDescription('');
      setProdBasePrice(0);
      setProdComparePrice(undefined);
      setProdImages(null);
      onCreated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear producto');
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-in fade-in duration-300">
      {/* CREADOR INTELIGENTE DE SECCIONES */}
      <div className="bg-[#081a13] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl space-y-4 text-white">
        <div className="border-b border-white/10 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e]">
            Arquitectura de Secciones
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
            Creador Inteligente de Secciones
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Calcula automáticamente el orden de despliegue e infiere el tipo de layout según las variantes.
          </p>
        </div>

        <form onSubmit={handleCreateSection} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Título de la Sección (Ej: &quot;Pesebres y Villas Navideñas&quot;)
            </label>
            <input
              required
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Nombre de la sección..."
              className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Subtítulo Descriptivo</label>
            <input
              type="text"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              placeholder="Breve frase que describe la categoría..."
              className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Badge Text</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white text-xs focus:ring-1 focus:ring-[#22c55e]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Ícono Material</label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-white/10 text-xs bg-[#0d281e] text-white focus:ring-1 focus:ring-[#22c55e]"
              >
                <option value="forest">🌲 forest (Árboles)</option>
                <option value="lightbulb">💡 lightbulb (Luces/Fibra)</option>
                <option value="celebration">🎉 celebration (Adornos)</option>
                <option value="redeem">🎁 redeem (Regalos)</option>
                <option value="church">⛪ church (Pesebres)</option>
                <option value="auto_awesome">✨ auto_awesome (Especial)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="rounded text-[#22c55e] focus:ring-[#22c55e] bg-[#0d281e] border-white/10"
              />
              <span>Infiere layout VARIANT_CARDS (Selector de alturas para árboles)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSubcategories}
                onChange={(e) => setHasSubcategories(e.target.checked)}
                className="rounded text-[#22c55e] focus:ring-[#22c55e] bg-[#0d281e] border-white/10"
              />
              <span>Infiere layout FILTERABLE_CHIPS (Píldoras para subcategorías)</span>
            </label>
          </div>

          <button
            disabled={creatingSection}
            type="submit"
            className="w-full h-10 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#040d0a] font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md"
          >
            {creatingSection ? 'Creando Sección...' : 'Guardar Nueva Sección Dinámica'}
          </button>
        </form>
      </div>

      {/* AÑADIR PRODUCTO A SECCIÓN EXISTENTE */}
      <div className="bg-[#081a13] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl space-y-4 text-white">
        <div className="border-b border-white/10 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffe088]">
            Procesamiento Sharp
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
            Añadir Producto a una Sección
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sube fotos crudas: se convierten automáticamente a binarios WebP en el volumen local.
          </p>
        </div>

        <form onSubmit={handleCreateProduct} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Sección de Destino</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-white/10 text-xs bg-[#0d281e] text-white focus:ring-1 focus:ring-[#22c55e]"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#081a13] text-white">
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Nombre del Producto</label>
            <input
              required
              type="text"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              placeholder="Ej: Pino Frondoso Real 1.80m..."
              className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Precio Base (COP)</label>
              <input
                required
                type="number"
                value={prodBasePrice || ''}
                onChange={(e) => setProdBasePrice(Number(e.target.value))}
                placeholder="420000"
                className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Precio Antes (Opcional)</label>
              <input
                type="number"
                value={prodComparePrice || ''}
                onChange={(e) =>
                  setProdComparePrice(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="520000"
                className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Descripción</label>
            <textarea
              rows={2}
              value={prodDescription}
              onChange={(e) => setProdDescription(e.target.value)}
              placeholder="Detalles sobre follaje, materiales, etc..."
              className="w-full p-2.5 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Subir Imágenes Crudas (Serán procesadas con Sharp a .webp)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setProdImages(e.target.files)}
              className="w-full text-xs text-slate-400 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0d281e] file:text-[#ffe088] file:border file:border-white/10"
            />
          </div>

          <button
            disabled={creatingProduct}
            type="submit"
            className="w-full h-10 rounded-xl bg-gradient-to-r from-[#15803d] to-[#166534] hover:from-[#16a34a] hover:to-[#15803d] text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md"
          >
            {creatingProduct ? 'Optimizando con Sharp y Guardando...' : 'Crear Producto con Binarios WebP'}
          </button>
        </form>
      </div>
    </div>
  );
}
