'use client';

import React, { useState } from 'react';
import { StoreProduct, StoreVariant } from '@/types/domain.types';
import { Eye, ShoppingBag, Check, TreePine, MessageCircle } from 'lucide-react';
import { formatCOP } from '@/frontend/shared/formatters';
import { OFFICIAL_ASSETS, WHATSAPP_CONTACT } from '@/frontend/shared/constants';

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
  const primaryImage = product.images[0]?.storagePath || OFFICIAL_ASSETS.TREE_TRADITIONAL;
  const hoverImage = product.images[1]?.storagePath || primaryImage;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const whatsappMessage = `¡Hola Navidad David! 🎄 Me interesa información sobre el producto "${product.name}"${
    selectedVariant ? ` (${selectedVariant.label})` : ''
  } - ${formatCOP(currentPrice)} COP.`;
  const whatsappUrl = WHATSAPP_CONTACT.buildUrl(whatsappMessage);

  return (
    <article className="group relative flex flex-col h-full bg-[#16181c] rounded-2xl overflow-hidden border border-white/10 hover:border-brand-gold/40 shadow-glow transition-all duration-300 hover:-translate-y-1 text-white font-sans">
      {/* CONTENEDOR DE IMAGEN 3:4 CON HOVER REFINADO */}
      <div
        onClick={() => onOpenQuickView(product)}
        className="relative aspect-[3/4] w-full overflow-hidden bg-black/60 cursor-pointer select-none"
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

        {/* BADGES SUPERIORES FESTIVOS */}
        {product.badgeTop && (
          <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 px-2.5 py-1 rounded-full bg-brand-gold text-black text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-md z-10 pointer-events-none">
            {product.badgeTop}
          </span>
        )}

        {product.badgeBottom && (
          <span className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-stone-200 border border-white/15 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-md z-10 pointer-events-none">
            {product.badgeBottom}
          </span>
        )}

        {/* BOTÓN FLOTANTE EN HOVER PARA DESKTOP */}
        <div className="hidden md:flex absolute bottom-3 inset-x-3 z-20 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex-col gap-2 pointer-events-none">
          <div className="w-full py-2 px-3 bg-black/90 backdrop-blur-md text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 border border-brand-gold/40">
            <Eye className="w-4 h-4 text-brand-gold" />
            <span>Ver Detalle Rápido</span>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DEL PRODUCTO */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-3">
        <div>
          <h3
            onClick={() => onOpenQuickView(product)}
            className="font-display text-xs sm:text-base font-bold text-white leading-snug hover:text-brand-gold transition-colors cursor-pointer line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>
          <p className="hidden sm:block text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed font-light">
            {product.description}
          </p>

          {/* SELECTOR DE MEDIDAS / ALTURAS (1-clic interactivo) */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-white/10">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-stone-400 block mb-1 tracking-wider">
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
                      className={`px-2 py-1 text-[10px] sm:text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-brand-gold text-black font-bold shadow-xs ring-1 ring-brand-gold/50 scale-102'
                          : 'bg-white/5 text-stone-300 hover:text-white hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <TreePine className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isSelected ? 'text-black' : 'text-brand-gold'}`} />
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* PRECIO Y ACCIONES */}
        <div className="pt-1.5 sm:pt-2 border-t border-white/10 flex flex-col gap-1.5 sm:gap-2">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap min-w-0">
              <span className="text-xs sm:text-lg lg:text-xl font-bold font-display text-brand-gold truncate">
                {formatCOP(currentPrice)}
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > currentPrice && (
                <span className="text-[9px] sm:text-xs text-stone-500 line-through truncate">
                  {formatCOP(Number(product.compareAtPrice))}
                </span>
              )}
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Preguntar por WhatsApp"
              className="text-emerald-400 hover:text-emerald-300 p-1 sm:p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4 sm:w-4 sm:h-4" />
            </a>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full min-h-[36px] sm:min-h-[40px] py-1.5 sm:py-2.5 px-2 rounded-full bg-brand-gold hover:bg-[#d4a352] text-black text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-glow active:scale-95 flex items-center justify-center gap-1 sm:gap-2 cursor-pointer font-display"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span className="truncate">¡Agregado!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-black" />
                <span className="truncate">Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
