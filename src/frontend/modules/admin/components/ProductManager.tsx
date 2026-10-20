'use client';

import React, { useState } from 'react';
import { StoreSection, StoreProduct } from '@/types/domain.types';

export function ProductManager({
  sections,
  onRefresh,
}: {
  sections: StoreSection[];
  onRefresh: () => void;
}) {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editCompareAt, setEditCompareAt] = useState<number | undefined>(undefined);
  const [editDescription, setEditDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const startEdit = (product: StoreProduct) => {
    setEditingProductId(product.id);
    setEditPrice(product.basePrice);
    setEditCompareAt(product.compareAtPrice ? Number(product.compareAtPrice) : undefined);
    setEditDescription(product.description);
  };

  const handleSaveProduct = async (productId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrice: editPrice,
          compareAtPrice: editCompareAt,
          description: editDescription,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setEditingProductId(null);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (productId: string, imageId: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta imagen binaria?')) return;
    try {
      const res = await fetch(`/api/products/${productId}?imageId=${imageId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleUploadImage = async (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#002718]">
            Catálogo de Productos & Gestión de Imágenes Binarias
          </h2>
          <p className="text-xs text-gray-500">
            Las imágenes subidas se optimizan con Sharp a WebP y se almacenan fuera de Git en el volumen local.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((sec) => (
          <div key={sec.id} className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-[#133e2b] pb-2">
              <span className="material-symbols-outlined text-lg text-[#133e2b]">
                {sec.iconName}
              </span>
              <h3 className="font-bold text-base text-[#002718]">{sec.title}</h3>
              <span className="text-xs text-gray-500">({sec.products.length} productos)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sec.products.map((prod) => {
                const isEditing = editingProductId === prod.id;

                return (
                  <div
                    key={prod.id}
                    className="p-4 rounded-xl border border-gray-200 bg-[#fbf9f5] flex flex-col justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-mono text-[10px] text-gray-400 block">{prod.sku}</span>
                          <h4 className="font-bold text-sm text-[#002718]">{prod.name}</h4>
                        </div>
                        <span className="text-xs font-bold text-[#b90d1c] px-2 py-0.5 rounded bg-red-50">
                          ${prod.basePrice.toLocaleString('es-CO')} COP
                        </span>
                      </div>

                      {/* VISTA DE IMÁGENES ASOCIADAS */}
                      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                        {prod.images.map((img) => (
                          <div
                            key={img.id}
                            className="relative w-14 h-14 rounded-lg bg-white border border-gray-300 overflow-hidden shrink-0 group"
                          >
                            <img
                              src={img.storagePath}
                              alt={img.altText}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='50' height='50' fill='%23002718'><rect width='50' height='50'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23ffe088' font-size='10'>ND</text></svg>";
                              }}
                            />
                            <button
                              onClick={() => handleDeleteImage(prod.id, img.id)}
                              title="Eliminar imagen física"
                              className="absolute inset-0 bg-red-900/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        {/* BOTÓN SUBIR NUEVA IMAGEN */}
                        <label className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#133e2b] flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-[#133e2b] transition-colors shrink-0">
                          <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                          <span className="text-[8px] font-bold">Subir</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadImage(prod.id, e)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 mt-3 pt-3 border-t">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-gray-600">Precio Base</label>
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(Number(e.target.value))}
                                className="w-full h-8 px-2 rounded border text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-600">Precio Antes</label>
                              <input
                                type="number"
                                value={editCompareAt || ''}
                                onChange={(e) =>
                                  setEditCompareAt(e.target.value ? Number(e.target.value) : undefined)
                                }
                                className="w-full h-8 px-2 rounded border text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-600">Descripción</label>
                            <textarea
                              rows={2}
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full p-2 rounded border text-xs"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingProductId(null)}
                              className="px-3 py-1 rounded bg-gray-200 text-xs font-bold"
                            >
                              Cancelar
                            </button>
                            <button
                              disabled={loading}
                              onClick={() => handleSaveProduct(prod.id)}
                              className="px-3 py-1 rounded bg-[#133e2b] text-white text-xs font-bold"
                            >
                              Guardar Cambios
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{prod.description}</p>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex justify-end pt-2 border-t border-gray-200">
                        <button
                          onClick={() => startEdit(prod)}
                          className="text-xs font-bold text-[#133e2b] hover:underline"
                        >
                          ✏ Editar Precio y Detalles
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
