'use client';

import React, { useState } from 'react';
import { StoreProduct, StoreVariant } from '@/types/domain.types';
import { Eye, ShoppingBag, Check, TreePine, MessageCircle } from 'lucide-react';

interface ProductCardProps {
  product: StoreProduct;
  onAddToCart: (product: StoreProduct, variant?: StoreVariant) => void;
  onOpenQuickView: (product: StoreProduct) => void;
}

export function ProductCard({ product, onAddToCart, onOpenQuickView }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<StoreVariant | undefined>(() => {
    return product.variants.find((v) => v.isDefault) || product.variants[0];
  });
  const [isAdded, setIsAdded] = useState(false);

  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);
  const primaryImage = product.images[0]?.storagePath || '/img/cat-arboles-tradicionales.webp';
  const hoverImage = product.images[1]?.storagePath || primaryImage.replace('.webp', '-alt.webp');

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola Navidad David! 🎄 Me interesa información sobre el producto "${product.name}"${
      selectedVariant ? ` (${selectedVariant.label})` : ''
    } - $${currentPrice.toLocaleString('es-CO')} COP.`
  );
  const whatsappUrl = `https://wa.me/573104567890?text=${whatsappMessage}`;

  return (
    <article className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-[#e4e2de] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* CONTENEDOR DE IMAGEN 3:4 CON HOVER REFINADO ESTILO NANA.COL */}
      <div
        onClick={() => onOpenQuickView(product)}
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#f5f3ef] cursor-pointer select-none"
        title={`Ver detalles de ${product.name}`}
      >
        {/* IMAGEN PRINCIPAL */}
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center transition-all duration-700 group-hover:scale-105"
        />

        {/* IMAGEN SECUNDARIA EN HOVER (Detalles / Encendido) */}
        {hoverImage && (
          <img
            src={hoverImage}
            alt={`${product.name} detalle`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center transition-all duration-500 ease-in-out opacity-0 md:group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        {/* BADGES SUPERIORES */}
        {product.badgeTop && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#b90d1c] text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-md z-10 pointer-events-none">
            {product.badgeTop}
          </span>
        )}

        {product.badgeBottom && (
          <span className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#002718]/90 backdrop-blur-sm text-[#ffe088] text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-md z-10 pointer-events-none">
            {product.badgeBottom}
          </span>
        )}

        {/* BOTÓN FLOTANTE EN HOVER PARA DESKTOP */}
        <div className="hidden md:flex absolute bottom-3 inset-x-3 z-20 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex-col gap-2 pointer-events-none">
          <div className="w-full py-2.5 px-3 bg-white/95 backdrop-blur-md text-[#002718] rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 border border-[#ffe088]/40">
            <Eye className="w-4 h-4 text-[#b90d1c]" />
            <span>Ver Detalle Rápido</span>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DEL PRODUCTO */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-3">
        <div>
          <h3
            onClick={() => onOpenQuickView(product)}
            className="font-serif text-xs sm:text-base font-bold text-[#002718] leading-snug hover:text-[#b90d1c] transition-colors cursor-pointer line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="hidden sm:block text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>

          {/* SELECTOR DE MEDIDAS / ALTURAS (1-clic interactivo) */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-[#f0eee9]">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-gray-400 block mb-1 tracking-wider">
                Altura:
              </span>
              <div className="flex items-center flex-wrap gap-1 sm:gap-1.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVariant(v);
                      }}
                      className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded-md sm:rounded-lg transition-all flex items-center gap-0.5 sm:gap-1 ${
                        isSelected
                          ? 'bg-[#133e2b] text-white font-bold shadow-xs ring-1 sm:ring-2 ring-[#002718]/30 scale-102'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <TreePine className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ffe088]" />
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* PRECIO Y ACCIONES */}
        <div className="pt-1.5 sm:pt-2 border-t border-[#f0eee9] flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-[#002718]">
                ${currentPrice.toLocaleString('es-CO')}
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > currentPrice && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                  ${Number(product.compareAtPrice).toLocaleString('es-CO')}
                </span>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Preguntar por WhatsApp"
              className="text-emerald-600 hover:text-emerald-700 p-1 sm:p-1.5 rounded-full hover:bg-emerald-50 transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4 sm:w-4 sm:h-4" />
            </a>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-2 sm:py-2.5 px-2 rounded-lg sm:rounded-xl bg-[#133e2b] hover:bg-[#002718] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1 sm:gap-2"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#ffe088]" />
                <span className="truncate">¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="truncate">Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
