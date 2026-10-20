'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StoreProduct, StoreVariant } from '@/types/domain.types';
import { X, TreePine, ShoppingBag, Truck, MapPin, Sparkles, MessageCircle, Check } from 'lucide-react';

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

  // Sincronizar variante predeterminada al abrir producto
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
  }, [product]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  // Lista de imágenes (imagen principal y secundaria alternativa)
  const images = product.images.length > 0
    ? product.images.map((img) => img.storagePath)
    : ['/img/cat-arboles-tradicionales.webp'];

  // Si solo tiene 1 imagen, agregamos su versión alternativa si es un árbol
  const mainImage = images[0] || '/img/cat-arboles-tradicionales.webp';
  const altImage = images[1] || mainImage.replace('.webp', '-alt.webp');
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

  const handleAdd = () => {
    onAddToCart(product, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola Navidad David! 🎄 Me interesa obtener información sobre el producto "${product.name}"${
      selectedVariant ? ` en altura/medida ${selectedVariant.label}` : ''
    } con precio de $${currentPrice.toLocaleString('es-CO')} COP.`
  );
  const whatsappUrl = `https://wa.me/573104567890?text=${whatsappMessage}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#e4e2de] overflow-hidden flex flex-col md:flex-row max-h-[92vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTÓN CERRAR */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:text-black hover:bg-white shadow-lg flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* COLUMNA IZQUIERDA: GALERÍA CON ZOOM ESTILO NANA.COL */}
        <div className="md:w-1/2 p-5 bg-[#fbf9f5] flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#e4e2de]">
          <div
            className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-inner cursor-crosshair select-none group"
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
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#b90d1c] text-white text-[10px] font-bold uppercase tracking-wider shadow-md pointer-events-none">
                {product.badgeTop}
              </span>
            )}

            {product.badgeBottom && (
              <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-[#002718]/90 text-[#ffe088] text-[10px] font-bold uppercase tracking-wider shadow-md pointer-events-none">
                {product.badgeBottom}
              </span>
            )}
          </div>

          {/* MINIATURAS INTERACTIVAS */}
          <div className="flex items-center gap-3 mt-4 justify-center">
            {gallery.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shadow-sm ${
                  selectedImageIndex === idx
                    ? 'border-[#002718] scale-105 ring-2 ring-[#002718]/20'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN Y ACCIONES */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#b90d1c] block mb-1">
                Navidad David • Artisan Christmas Co.
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#002718] leading-tight">
                {product.name}
              </h2>
              <span className="text-xs font-mono text-gray-400 mt-0.5 block">SKU: {product.sku}</span>
            </div>

            {/* PRECIO EN COP */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#002718]">
                ${currentPrice.toLocaleString('es-CO')}
                <span className="text-xs font-medium text-gray-500 ml-1">COP</span>
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > currentPrice && (
                <span className="text-base text-gray-400 line-through">
                  ${Number(product.compareAtPrice).toLocaleString('es-CO')}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light">
              {product.description}
            </p>

            {/* SELECTOR DE ALTURA / VARIANTES */}
            {product.variants && product.variants.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                  Selecciona la Altura del Árbol:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#133e2b] text-white shadow-md ring-2 ring-[#002718]/30 scale-102'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <TreePine className="w-3.5 h-3.5" />
                        <span>{variant.label}</span>
                        <span className="text-[10px] opacity-80">
                          (${Number(variant.price).toLocaleString('es-CO')})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODALIDAD DE ENTREGA */}
            <div className="p-3.5 rounded-2xl bg-[#fbf9f5] border border-[#e4e2de] text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#002718] font-bold">
                <Truck className="w-4 h-4 text-[#b90d1c]" />
                <span>Despacho a todo el país o Retiro en Tienda</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                Puedes recibirlo en tu dirección o seleccionar <strong>"Ir por el arbolito"</strong> para retirarlo en nuestra sede física sin costo de envío.
              </p>
            </div>
          </div>

          {/* BOTONES DE COMPRA Y ASESORÍA */}
          <div className="space-y-2.5 pt-6 border-t border-gray-100 mt-6">
            <div className="flex gap-2.5">
              <button
                onClick={handleAdd}
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#133e2b] hover:bg-[#002718] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-[#ffe088]" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Agregar al Carrito</span>
                  </>
                )}
              </button>

              {onBuyNow && (
                <button
                  onClick={() => {
                    onBuyNow(product, selectedVariant);
                    onClose();
                  }}
                  className="py-3.5 px-5 rounded-xl bg-[#b90d1c] hover:bg-[#930011] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#ffe088]" />
                  <span>Comprar con Bold</span>
                </button>
              )}
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Consultar Asesoría por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
