'use client';

import React, { useState } from 'react';
import { CartItem } from '@/types/domain.types';

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
  const [paymentMethod, setPaymentMethod] = useState<'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'PSE'>('PSE');
  const [loading, setLoading] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    trackingNumber: string;
    boldPaymentUrl?: string;
  } | null>(null);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/checkout/bold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { fullName, email, phone },
          deliveryMethod,
          shippingAddress: deliveryMethod === 'DOMICILIO' ? shippingAddress : undefined,
          shippingCity: deliveryMethod === 'DOMICILIO' ? shippingCity : undefined,
          paymentMethod,
          items: cart.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message || result.error || 'Error al procesar el pago');

      // Si la API de Bold generó una URL de pago, podemos redirigir al link de Bold
      if (result.data.boldPaymentUrl && result.data.boldPaymentUrl.startsWith('https://')) {
        onSuccessClear();
        window.location.href = result.data.boldPaymentUrl;
        return;
      }

      setOrderConfirmation({
        trackingNumber: result.data.trackingNumber,
        boldPaymentUrl: result.data.boldPaymentUrl,
      });
      onSuccessClear();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-[28px] sm:rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl max-h-[94vh] sm:max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {orderConfirmation ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold text-3xl">
              ✓
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#002718]">
              ¡Orden Creada y Guía Generada!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              Hemos asociado esta compra a tu correo <strong>{email}</strong> y notificado al equipo de Navidad David.
            </p>
            <div className="p-4 rounded-xl bg-[#f5f3ef] border border-[#133e2b]/20">
              <span className="text-xs uppercase font-bold text-gray-500 block">
                Número de Guía Oficial
              </span>
              <span className="text-2xl font-mono font-bold text-[#b90d1c]">
                {orderConfirmation.trackingNumber}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-[#133e2b] text-white font-bold text-sm hover:bg-[#002718] transition-all"
            >
              Volver a la tienda
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e4e2de] pb-3">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#002718]">
                  Compra Rápida Sin Registro
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Tus compras quedan agrupadas con tu correo electrónico
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar checkout"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* DATOS BÁSICOS DEL CLIENTE */}
            <div className="space-y-2.5">
              <input
                required
                type="text"
                placeholder="Nombres y Apellidos completos"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 sm:h-10 px-3 rounded-xl border border-gray-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#133e2b]"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  required
                  type="email"
                  placeholder="Correo electrónico (ID cliente)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3 rounded-xl border border-gray-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#133e2b]"
                />
                <input
                  required
                  type="tel"
                  placeholder="Celular / WhatsApp"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 sm:h-10 px-3 rounded-xl border border-gray-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#133e2b]"
                />
              </div>
            </div>

            {/* MODALIDAD DE ENTREGA: ENVÍO O IR POR EL ARBOLITO */}
            <div className="space-y-1.5">
              <label className="text-[11px] sm:text-xs font-bold uppercase text-[#002718]">
                Modalidad de Entrega:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('DOMICILIO')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                    deliveryMethod === 'DOMICILIO'
                      ? 'border-[#133e2b] bg-[#133e2b]/5 font-bold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block text-xs text-[#002718]">🚚 Envío Domicilio</span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500">Con número de guía</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('RECOGIDA_TIENDA')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                    deliveryMethod === 'RECOGIDA_TIENDA'
                      ? 'border-[#133e2b] bg-[#133e2b]/5 font-bold shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block text-xs text-[#002718]">🎄 Ir por el arbolito</span>
                  <span className="text-[10px] sm:text-[11px] text-gray-500">Recogida en tienda</span>
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
                  className="h-11 sm:h-10 px-3 rounded-xl border border-gray-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#133e2b]"
                />
                <input
                  required
                  type="text"
                  placeholder="Dirección exacta (Barrio, Calle, Apto)"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="sm:col-span-2 h-11 sm:h-10 px-3 rounded-xl border border-gray-300 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#133e2b]"
                />
              </div>
            )}

            {/* MÉTODO DE PAGO INTEGRADO CON BOLD */}
            <div className="space-y-1.5">
              <label className="text-[11px] sm:text-xs font-bold uppercase text-[#002718]">
                Pasarela de Pagos Segura Bold:
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {[
                  { id: 'PSE', label: '🏦 PSE Bancos' },
                  { id: 'TARJETA_CREDITO', label: '💳 T. Crédito' },
                  { id: 'TARJETA_DEBITO', label: '💳 T. Débito' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as 'PSE' | 'TARJETA_CREDITO' | 'TARJETA_DEBITO')}
                    className={`py-2 px-1 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all text-center ${
                      paymentMethod === m.id
                        ? 'bg-[#133e2b] text-white border-[#133e2b] shadow-xs'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full h-12 rounded-xl bg-[#b90d1c] hover:bg-[#930011] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading
                ? 'Conectando con Bold Gateway...'
                : `Pagar $${totalAmount.toLocaleString('es-CO')} COP con Bold`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
