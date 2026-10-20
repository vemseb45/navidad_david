'use client';

import React, { useState } from 'react';
import { StoreProduct, StoreVariant } from '@/types/domain.types';

interface ProductCardProps {
  product: StoreProduct;
  onAddToCart: (product: StoreProduct, variant?: StoreVariant) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<StoreVariant | undefined>(() => {
    return product.variants.find((v) => v.isDefault) || product.variants[0];
  });
  const [isAdded, setIsAdded] = useState(false);

  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);
  const primaryImage = product.images[0]?.storagePath || '/placeholder-tree.svg';

  const handleAdd = () => {
    onAddToCart(product, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all border border-[#e4e2de] hover:border-[#133e2b]/40 group">
      {/* IMAGEN Y BADGES */}
      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#efeeea] mb-3">
        <img
          src={primaryImage}
          alt={product.images[0]?.altText || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Placeholder SVG elegante si el binario local aún no existe
            const target = e.currentTarget;
            target.onerror = null;
            target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'><rect width='400' height='500' fill='%23002718'/><text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' fill='%23ffe088' font-family='serif' font-size='24'>Navidad David</text><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-size='14'>Árbol Artesanal</text></svg>";
          }}
        />

        {product.badgeTop && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#b90d1c] text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
            {product.badgeTop}
          </span>
        )}

        {product.badgeBottom && (
          <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-[#133e2b]/95 text-[#ffe088] text-[10px] font-bold shadow-sm">
            {product.badgeBottom}
          </span>
        )}
      </div>

      {/* INFORMACIÓN DEL PRODUCTO */}
      <div className="flex flex-col flex-1">
        <h3 className="font-serif text-lg text-[#002718] font-bold leading-tight group-hover:text-[#b90d1c] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-[#414943] mt-1.5 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* SELECTOR DE MEDIDAS / VARIANTES */}
        {product.variants && product.variants.length > 0 && (
          <div className="my-3 pt-1 border-t border-[#f0eee9]">
            <span className="text-[11px] font-semibold text-[#414943] block mb-1.5">
              Seleccionar altura / tamaño:
            </span>
            <div className="flex items-center flex-wrap gap-1.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all ${
                      isSelected
                        ? 'bg-[#133e2b] text-white font-bold shadow-sm ring-2 ring-[#002718]/20'
                        : 'bg-[#efeeea] text-[#1b1c1a] hover:bg-[#133e2b]/15'
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PRECIO Y DISPONIBILIDAD */}
        <div className="mt-auto pt-3 flex items-baseline justify-between border-t border-[#f0eee9]">
          <div>
            <span className="text-xl font-bold text-[#002718]">
              ${currentPrice.toLocaleString('es-CO')}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-[#414943] line-through ml-2">
                ${Number(product.compareAtPrice).toLocaleString('es-CO')}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-[#133e2b] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            En stock
          </span>
        </div>

        {/* BOTÓN AÑADIR AL CARRITO */}
        <button
          type="button"
          onClick={handleAdd}
          className={`w-full mt-3 h-11 rounded-xl text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
            isAdded
              ? 'bg-[#133e2b] ring-2 ring-[#ffe088]'
              : 'bg-[#b90d1c] hover:bg-[#930011] active:scale-[0.98]'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {isAdded ? 'check_circle' : 'shopping_bag'}
          </span>
          <span>{isAdded ? '¡Añadido al Carrito!' : 'Añadir al Carrito'}</span>
        </button>
      </div>
    </div>
  );
}
