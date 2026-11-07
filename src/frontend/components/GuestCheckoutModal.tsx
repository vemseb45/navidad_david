'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { CartItem } from '@/types/domain.types';
import { formatCOPWithCode } from '@/frontend/shared/formatters';

export function GuestCheckoutModal({
  cart,
  totalAmount,
  onClose,
  onSuccessClear,
}: {
  cart: CartItem[];
  totalAmount: number;
  onClose: () => void;
  onSuccessClear: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'DOMICILIO' | 'RECOGIDA_TIENDA'>('DOMICILIO');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('Bogotá');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/checkout/bold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { fullName, email, phone },
          deliveryMethod,
          shippingAddress: deliveryMethod === 'DOMICILIO' ? shippingAddress : undefined,
          shippingCity: deliveryMethod === 'DOMICILIO' ? shippingCity : undefined,
          paymentMethod: 'PSE', // En Bold el cliente escoge libremente su método (PSE, Tarjeta, Nequi, etc.)
          items: cart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || result.error || 'Error al conectar con la pasarela Bold');
      }

      const boldPaymentUrl = result.data?.boldPaymentUrl;

      // REDIRECCIÓN DIRECTA A LA PASARELA BOLD
      // El cliente NUNCA recibe factura ni confirmación antes de pagar
      if (boldPaymentUrl && typeof boldPaymentUrl === 'string' && boldPaymentUrl.startsWith('http')) {
        onSuccessClear();
        window.location.href = boldPaymentUrl;
        return;
      }

      throw new Error('No se pudo generar el enlace de pago de Bold. Por favor intenta nuevamente.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al procesar el pago con Bold');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#16181c] text-white rounded-t-[28px] sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 pb-8 sm:pb-6 shadow-glow border border-white/10 max-h-[92dvh] sm:max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 font-sans">
        
        {/* INDICADOR TÁCTIL MÓVIL */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />

        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                Finalizar Compra
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Tus pedidos quedan asociados a tu correo electrónico
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar checkout"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* MENSAJE DE ERROR SI LA PASARELA FALLA */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* DATOS BÁSICOS DEL CLIENTE */}
          <div className="space-y-2.5">
            <input
              required
              type="text"
              placeholder="Nombres y Apellidos completos"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 sm:h-10 px-3 rounded-xl bg-stone-900/90 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                required
                type="email"
                placeholder="Correo electrónico (ID cliente)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 rounded-xl bg-stone-900/90 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
              />
              <input
                required
                type="tel"
                placeholder="Celular / WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 rounded-xl bg-stone-900/90 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
              />
            </div>
          </div>

          {/* MODALIDAD DE ENTREGA: ENVÍO O IR POR EL ARBOLITO */}
          <div className="space-y-1.5">
            <label className="text-[11px] sm:text-xs font-bold uppercase text-stone-300 tracking-wider">
              Modalidad de Entrega:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryMethod('DOMICILIO')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  deliveryMethod === 'DOMICILIO'
                    ? 'border-brand-gold bg-brand-gold/10 font-bold shadow-xs text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-stone-300'
                }`}
              >
                <span className="block text-xs text-white font-semibold">🚚 Envío Domicilio</span>
                <span className="text-[10px] sm:text-[11px] text-stone-400">Con número de guía</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('RECOGIDA_TIENDA')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  deliveryMethod === 'RECOGIDA_TIENDA'
                    ? 'border-brand-gold bg-brand-gold/10 font-bold shadow-xs text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-stone-300'
                }`}
              >
                <span className="block text-xs text-white font-semibold">🎄 Ir por el arbolito</span>
                <span className="text-[10px] sm:text-[11px] text-stone-400">Recogida en tienda</span>
              </button>
            </div>
          </div>

          {deliveryMethod === 'DOMICILIO' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                required
                type="text"
                placeholder="Ciudad"
                value={shippingCity}
                onChange={(e) => setShippingCity(e.target.value)}
                className="h-11 sm:h-10 px-3 rounded-xl bg-stone-900/90 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
              />
              <input
                required
                type="text"
                placeholder="Dirección exacta (Barrio, Calle, Apto)"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="sm:col-span-2 h-11 sm:h-10 px-3 rounded-xl bg-stone-900/90 border border-white/15 text-white placeholder-stone-500 text-base sm:text-sm focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
              />
            </div>
          )}

          {/* INFORMACIÓN DE LA PASARELA OFICIAL BOLD */}
          <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold uppercase text-[#E5B869] tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#E5B869]" />
                <span>Pasarela de Pago Bold</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Seguro
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-300 leading-relaxed">
              En la pasarela oficial de <strong className="text-white">Bold</strong> podrás elegir tu medio de pago favorito:
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10.5px] font-medium text-stone-200">
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                💳 Tarjetas Crédito/Débito
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                🏦 PSE
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                📱 Nequi
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
                🍏 Apple Pay
              </span>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full h-12 rounded-full bg-brand-gold hover:bg-[#d4a352] text-black font-display font-bold text-sm shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Conectando con Bold Gateway...</span>
              </>
            ) : (
              <>
                <span>Pagar {formatCOPWithCode(totalAmount)} en Bold</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
