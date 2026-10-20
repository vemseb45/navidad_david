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
  const [prodBadgeTop, setProdBadgeTop] = useState('');
  const [prodBadgeBottom, setProdBadgeBottom] = useState('');
  const [prodSubcat, setProdSubcat] = useState('');
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
    if (!prodName.trim() || !selectedSectionId || prodBasePrice <= 0) {
      alert('Por favor completa el nombre, sección y precio base.');
      return;
    }

    setCreatingProduct(true);
    try {
      const formData = new FormData();
      formData.append('sectionId', String(selectedSectionId));
      formData.append('name', prodName);
      formData.append('description', prodDescription);
      formData.append('basePrice', prodBasePrice.toString());
      if (prodComparePrice) formData.append('compareAtPrice', prodComparePrice.toString());
      if (prodBadgeTop) formData.append('badgeTop', prodBadgeTop);
      if (prodBadgeBottom) formData.append('badgeBottom', prodBadgeBottom);
      if (prodSubcat) formData.append('subcategoryName', prodSubcat);

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

      alert('¡Producto creado exitosamente con compresión WebP!');
      setProdName('');
      setProdDescription('');
      setProdBasePrice(0);
      setProdImages(null);
      onCreated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear producto');
    } finally {
      setCreatingProduct(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* CREADOR INTELIGENTE DE SECCIONES */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-4">
        <div className="border-b pb-3">
          <h3 className="font-serif text-lg font-bold text-[#002718]">
            Creador Inteligente de Secciones
          </h3>
          <p className="text-xs text-gray-500">
            Calcula automáticamente el orden de despliegue e infiere el tipo de layout según las variantes.
          </p>
        </div>

        <form onSubmit={handleCreateSection} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Título de la Sección (Ej: &quot;Pesebres y Villas Navideñas&quot;)
            </label>
            <input
              required
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Nombre de la sección..."
              className="w-full h-11 sm:h-10 px-3 rounded-lg border text-base sm:text-xs focus:ring-2 focus:ring-[#133e2b]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Subtítulo Descriptivo</label>
            <input
              type="text"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              placeholder="Breve frase que describe la categoría..."
              className="w-full h-11 sm:h-10 px-3 rounded-lg border text-base sm:text-xs focus:ring-2 focus:ring-[#133e2b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Badge Text</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Ícono Material</label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border text-xs bg-white"
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
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                className="rounded text-[#133e2b]"
              />
              <span>Infiere layout VARIANT_CARDS (Selector de alturas para árboles)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSubcategories}
                onChange={(e) => setHasSubcategories(e.target.checked)}
                className="rounded text-[#133e2b]"
              />
              <span>Infiere layout FILTERABLE_CHIPS (Píldoras para subcategorías)</span>
            </label>
          </div>

          <button
            disabled={creatingSection}
            type="submit"
            className="w-full h-10 rounded-xl bg-[#133e2b] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#002718] transition-all disabled:opacity-50"
          >
            {creatingSection ? 'Creando Sección...' : 'Guardar Nueva Sección Dinámica'}
          </button>
        </form>
      </div>

      {/* AÑADIR PRODUCTO A SECCIÓN EXISTENTE */}
      <div className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-4">
        <div className="border-b pb-3">
          <h3 className="font-serif text-lg font-bold text-[#002718]">
            Añadir Producto a una Sección
          </h3>
          <p className="text-xs text-gray-500">
            Sube fotos crudas: se convierten automáticamente a binarios WebP en el volumen local.
          </p>
        </div>

        <form onSubmit={handleCreateProduct} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Sección de Destino</label>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border text-xs bg-white"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Nombre del Producto</label>
            <input
              required
              type="text"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              placeholder="Ej: Pino Frondoso Real 1.80m..."
              className="w-full h-10 px-3 rounded-lg border text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Precio Base (COP)</label>
              <input
                required
                type="number"
                value={prodBasePrice || ''}
                onChange={(e) => setProdBasePrice(Number(e.target.value))}
                placeholder="420000"
                className="w-full h-10 px-3 rounded-lg border text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Precio Antes (Opcional)</label>
              <input
                type="number"
                value={prodComparePrice || ''}
                onChange={(e) =>
                  setProdComparePrice(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="520000"
                className="w-full h-10 px-3 rounded-lg border text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Descripción</label>
            <textarea
              rows={2}
              value={prodDescription}
              onChange={(e) => setProdDescription(e.target.value)}
              placeholder="Detalles sobre follaje, materiales, etc..."
              className="w-full p-2 rounded-lg border text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Subir Imágenes Crudas (Serán procesadas con Sharp a .webp)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setProdImages(e.target.files)}
              className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#efeeea] file:text-[#002718]"
            />
          </div>

          <button
            disabled={creatingProduct}
            type="submit"
            className="w-full h-10 rounded-xl bg-[#b90d1c] hover:bg-[#930011] text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
          >
            {creatingProduct ? 'Optimizando con Sharp y Guardando...' : 'Crear Producto con Binarios WebP'}
          </button>
        </form>
      </div>
    </div>
  );
}
