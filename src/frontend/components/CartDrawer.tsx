'use client';

import React from 'react';
import { CartItem } from '@/types/domain.types';
import { formatCOP, formatCOPWithCode } from '@/frontend/shared/formatters';
import { FREE_SHIPPING_THRESHOLD_COP } from '@/frontend/shared/constants';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  cartTotal: number;
  onClose: () => void;
  onRemoveItem: (productId: number, variantId?: number) => void;
  onUpdateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  onOpenCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  cart,
  cartTotal,
  onClose,
  onRemoveItem,
  onUpdateQuantity,
  onOpenCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const isFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD_COP;
  const missingForFreeShipping = FREE_SHIPPING_THRESHOLD_COP - cartTotal;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-[#16181c] border-l border-white/10 text-white h-full p-4 sm:p-6 pb-7 sm:pb-6 flex flex-col justify-between shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 font-sans">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-2xl text-brand-gold">shopping_bag</span>
            <h3 className="font-display text-xl font-bold text-white tracking-wide">Tu Carrito Navideño</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* BARRA DE ENVÍO GRATIS */}
        <div className="bg-brand-gold/10 border border-brand-gold/25 rounded-2xl p-3 my-3">
          {isFreeShipping ? (
            <div className="flex items-center gap-2 text-xs font-bold text-brand-gold">
              <span className="text-base">🎉</span>
              <span>¡Felicidades! Tu orden califica para Envío Gratis a toda Colombia.</span>
            </div>
          ) : (
            <div className="text-xs text-stone-300">
              Agrega <strong className="text-white">{formatCOPWithCode(missingForFreeShipping)}</strong> más para obtener <span className="font-bold underline text-brand-gold">Envío Gratis</span>.
            </div>
          )}
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="material-symbols-outlined text-5xl text-stone-600">park</span>
              <p className="text-sm font-medium text-stone-400">
                Aún no has agregado ningún árbol o accesorio.
              </p>
              <button
                onClick={onClose}
                className="text-xs font-bold text-brand-gold hover:underline cursor-pointer"
              >
                Explorar el catálogo
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.productId}-${item.variantId || 'std'}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#1c1f26]/80 border border-white/10 shadow-glass"
              >
                <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden shrink-0 border border-white/10">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23121417'><rect width='100' height='100'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23E5B869' font-size='12'>ND</text></svg>";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-white truncate font-display">{item.name}</p>
                  {item.variantLabel && (
                    <span className="text-[11px] font-semibold text-brand-gold bg-brand-gold/15 border border-brand-gold/30 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Medida: {item.variantLabel}
                    </span>
                  )}
                  <p className="text-xs font-bold text-brand-gold mt-1 font-display">
                    {formatCOPWithCode(item.unitPrice * item.quantity)}
                  </p>
                </div>

                {/* CONTROLES DE CANTIDAD */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center bg-black/50 rounded-xl border border-white/10 overflow-hidden shadow-xs">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold text-stone-300 hover:text-white hover:bg-white/10 active:bg-white/20 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 sm:w-6 text-center text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="w-7 h-7 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold text-stone-300 hover:text-white hover:bg-white/10 active:bg-white/20 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.productId, item.variantId)}
                    className="text-[10px] text-red-400 font-semibold hover:text-red-300 hover:underline p-1 cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER DEL DRAWER */}
        {cart.length > 0 && (
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex justify-between items-baseline text-base font-bold text-white">
              <span className="text-stone-300">Subtotal estimado:</span>
              <span className="text-2xl font-display font-bold text-brand-gold">
                {formatCOP(cartTotal)} <span className="text-xs text-stone-400 font-sans font-normal">COP</span>
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full h-12 rounded-full bg-brand-gold hover:bg-[#d4a352] active:scale-[0.98] text-black font-display font-bold text-sm tracking-wide transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">credit_card</span>
              <span>Pagar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
