'use client';

import React from 'react';
import { CartItem } from '@/types/domain.types';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  cartTotal: number;
  onClose: () => void;
  onRemoveItem: (productId: string, variantId?: string) => void;
  onUpdateQuantity: (productId: string, quantity: number, variantId?: string) => void;
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

  const freeShippingThreshold = 150000;
  const isFreeShipping = cartTotal >= freeShippingThreshold;
  const missingForFreeShipping = freeShippingThreshold - cartTotal;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full p-6 flex flex-col justify-between shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#e4e2de] pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#002718]">shopping_bag</span>
            <h3 className="font-serif text-xl font-bold text-[#002718]">Tu Carrito Navideño</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#efeeea] hover:bg-[#e4e2de] text-gray-700 flex items-center justify-center font-bold text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* BARRA DE ENVÍO GRATIS */}
        <div className="bg-[#133e2b]/5 border border-[#133e2b]/15 rounded-xl p-3 my-3">
          {isFreeShipping ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#133e2b]">
              <span className="text-base">🎉</span>
              <span>¡Felicidades! Tu orden califica para Envío Gratis a toda Colombia.</span>
            </div>
          ) : (
            <div className="text-xs text-[#002718]">
              Agrega <strong className="text-[#b90d1c]">${missingForFreeShipping.toLocaleString('es-CO')} COP</strong> más para obtener <span className="font-bold underline">Envío Gratis</span>.
            </div>
          )}
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <span className="material-symbols-outlined text-5xl text-gray-300">park</span>
              <p className="text-sm font-semibold text-gray-500">
                Aún no has agregado ningún árbol o accesorio.
              </p>
              <button
                onClick={onClose}
                className="text-xs font-bold text-[#133e2b] underline hover:text-[#002718]"
              >
                Explorar el catálogo
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div
                key={`${item.productId}-${item.variantId || 'std'}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f3ef] border border-[#e4e2de]"
              >
                <div className="w-16 h-16 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-200">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23002718'><rect width='100' height='100'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23ffe088' font-size='12'>ND</text></svg>";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#002718] truncate">{item.name}</p>
                  {item.variantLabel && (
                    <span className="text-[11px] font-bold text-[#b90d1c] bg-[#b90d1c]/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Medida: {item.variantLabel}
                    </span>
                  )}
                  <p className="text-xs font-bold text-[#002718] mt-1">
                    ${(item.unitPrice * item.quantity).toLocaleString('es-CO')} COP
                  </p>
                </div>

                {/* CONTROLES DE CANTIDAD */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.variantId)}
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-[#002718]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.variantId)}
                      className="w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.productId, item.variantId)}
                    className="text-[10px] text-red-600 font-semibold hover:underline"
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
          <div className="border-t border-[#e4e2de] pt-4 space-y-3">
            <div className="flex justify-between items-baseline text-base font-bold text-[#002718]">
              <span>Subtotal estimado:</span>
              <span className="text-xl text-[#002718]">${cartTotal.toLocaleString('es-CO')} COP</span>
            </div>

            <p className="text-[11px] text-gray-500">
              Impuestos y costos de envío (si aplican) calculados al checkout.
            </p>

            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              className="w-full h-12 rounded-xl bg-[#133e2b] hover:bg-[#002718] text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg text-[#ffe088]">lock</span>
              <span>Proceder al Pago Seguro (Sin Registro)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
