'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StoreProduct, StoreVariant } from '@/types/domain.types';
import { X, TreePine, ShoppingBag, Truck, Sparkles, MessageCircle, Check } from 'lucide-react';
import { formatCOP } from '@/frontend/shared/formatters';
import { OFFICIAL_ASSETS, WHATSAPP_CONTACT } from '@/frontend/shared/constants';
import { shootChristmasCoins } from '@/frontend/shared/christmasCoins';

interface ProductDetailModalProps {
  product: StoreProduct | null;
  onClose: () => void;
  onAddToCart: (product: StoreProduct, variant?: StoreVariant) => void;
  onBuyNow?: (product: StoreProduct, variant?: StoreVariant) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<StoreVariant | undefined>(undefined);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Sincronizar variante predeterminada al cambiar de producto
  const productId = product?.id;
  useEffect(() => {
    if (product) {
      const defaultVar = product.variants.find((v) => v.isDefault) || product.variants[0];
      setSelectedVariant(defaultVar);
      setSelectedImageIndex(0);
      setIsZoomed(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [productId, product]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  // Lista de imágenes con respaldo oficial
  const images =
    product.images.length > 0
      ? product.images.map((img) => img.storagePath)
      : [OFFICIAL_ASSETS.TREE_TRADITIONAL];

  const mainImage = images[0] || OFFICIAL_ASSETS.TREE_TRADITIONAL;
  const altImage = images[1] || mainImage;
  const gallery = [mainImage, altImage];

  const currentImage = gallery[selectedImageIndex] || mainImage;
  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  const handleAdd = (e: React.MouseEvent<HTMLElement>) => {
    shootChristmasCoins(e.currentTarget, () => {
      onAddToCart(product, selectedVariant);
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuy = (e: React.MouseEvent<HTMLElement>) => {
    shootChristmasCoins(e.currentTarget, () => {
      if (onBuyNow) {
        onBuyNow(product, selectedVariant);
      }
      onClose();
    });
  };

  const whatsappMessage = `¡Hola Navidad David! 🎄 Me interesa información sobre el producto "${product.name}"${
    selectedVariant ? ` en medida ${selectedVariant.label}` : ''
  } (${formatCOP(currentPrice)} COP).`;
  const whatsappUrl = WHATSAPP_CONTACT.buildUrl(whatsappMessage);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#16181c] text-white rounded-t-[28px] sm:rounded-3xl shadow-glow border border-white/10 overflow-hidden flex flex-col md:flex-row max-h-[92dvh] sm:max-h-[90vh] animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* INDICADOR TÁCTIL VISUAL EN MÓVIL (BOTTOM SHEET HANDLE) */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* BOTÓN CERRAR TÁCTIL */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-2.5 right-3 sm:top-4 sm:right-4 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-stone-300 hover:text-white border border-white/10 shadow-md flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* COLUMNA IZQUIERDA: GALERÍA ADAPTADA A CELULARES */}
        <div className="md:w-1/2 p-3 sm:p-5 bg-black/30 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 shrink-0">
          <div
            className="relative w-full aspect-[4/3] sm:aspect-[3/4] max-h-48 sm:max-h-none rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-inner cursor-crosshair select-none group"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => {
              setIsZoomed(false);
              if (imgRef.current) imgRef.current.style.transformOrigin = 'center center';
            }}
            onMouseMove={handleMouseMove}
          >
            <img
              ref={imgRef}
              src={currentImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-200 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
            />

            {product.badgeTop && (
              <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2.5 py-1 rounded-full bg-brand-gold text-black text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-md pointer-events-none">
                {product.badgeTop}
              </span>
            )}

            {product.badgeBottom && (
              <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-stone-200 border border-white/15 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-md pointer-events-none">
                {product.badgeBottom}
              </span>
            )}
          </div>

          {/* MINIATURAS INTERACTIVAS */}
          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-4 justify-center">
            {gallery.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-11 h-11 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shadow-xs shrink-0 cursor-pointer ${
                  selectedImageIndex === idx
                    ? 'border-brand-gold scale-105 ring-2 ring-brand-gold/30'
                    : 'border-white/10 opacity-50 hover:opacity-100 bg-black/40'
                }`}
              >
                <img src={imgUrl} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN Y ACCIONES */}
        <div className="md:w-1/2 p-3.5 sm:p-7 flex flex-col justify-between overflow-y-auto bg-[#16181c]">
          <div className="space-y-2.5 sm:space-y-4">
            <div>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-brand-gold block mb-0.5">
                Navidad David • Colección Oficial
              </span>
              <h2 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                {product.name}
              </h2>
              <span className="text-[10px] sm:text-xs font-mono text-stone-400 mt-0.5 block">
                SKU: {product.sku}
              </span>
            </div>

            {/* PRECIO EN COP */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-3xl font-display font-bold text-brand-gold">
                {formatCOP(currentPrice)}
                <span className="text-xs font-medium text-stone-400 font-sans ml-1">COP</span>
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > currentPrice && (
                <span className="text-xs sm:text-sm text-stone-500 line-through">
                  {formatCOP(Number(product.compareAtPrice))}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
              {product.description}
            </p>

            {/* SELECTOR DE ALTURA / VARIANTES */}
            {product.variants && product.variants.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] sm:text-xs font-bold text-stone-300 uppercase tracking-wider block mb-1.5">
                  Selecciona la Altura del Árbol:
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-brand-gold text-black shadow-md ring-2 ring-brand-gold/40 scale-102'
                            : 'bg-white/5 text-stone-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <TreePine className="w-3 h-3" />
                        <span>{variant.label}</span>
                        <span className={`text-[9px] sm:text-[10px] ${isSelected ? 'opacity-80' : 'text-stone-400'}`}>
                          ({formatCOP(Number(variant.price))})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODALIDAD DE ENTREGA */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-[11px] sm:text-xs">
                <Truck className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>Despacho Nacional o Retiro en Tienda</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 leading-tight">
                Entrega a domicilio o retiro gratis con la modalidad <strong>&quot;Ir por el arbolito&quot;</strong>.
              </p>
            </div>
          </div>

          {/* BOTONES DE COMPRA STICKY INFERIOR CON SAFE AREA PADDING */}
          <div className="sticky bottom-0 bg-[#16181c]/95 backdrop-blur-md -mx-3.5 -mb-3.5 p-3 pb-5 sm:pb-3 sm:static sm:mx-0 sm:mb-0 sm:p-0 sm:bg-transparent border-t border-white/10 sm:border-0 shadow-lg sm:shadow-none space-y-2 mt-3 sm:mt-6 z-20">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 min-h-[44px] py-2.5 sm:py-3.5 px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-brand-gold" />
                    <span>¡Agregado!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Agregar</span>
                  </>
                )}
              </button>

              {onBuyNow && (
                <button
                  type="button"
                  onClick={handleBuy}
                  className="min-h-[44px] py-2.5 sm:py-3.5 px-5 sm:px-6 rounded-full bg-white hover:bg-stone-100 text-stone-950 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-display"
                >
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>Comprar</span>
                </button>
              )}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[38px] py-2 px-3 rounded-full border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Asesoría por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
