import React from 'react';
import Link from 'next/link';
import { OrderService } from '@/backend/modules/orders/order.service';

export const instant = false;

const orderService = new OrderService();

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ guia?: string }>;
}) {
  const { guia } = await searchParams;

  let order = null;
  if (guia) {
    try {
      order = await orderService.getOrderByTrackingNumber(guia);
    } catch {
      // Ignorar si no se encuentra
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex items-center justify-center p-5 font-sans">
      <div className="max-w-xl w-full bg-white rounded-3xl p-8 border border-[#e4e2de] shadow-xl text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <img
            src="/Logo_david.png"
            alt="Navidad David"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-[#002718]/20 shadow-md"
          />
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl font-bold shadow-inner">
            ✓
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#b90d1c]">
            Navidad David • Compra Confirmada
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#002718] mt-1">
            ¡Gracias por tu compra navideña!
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Hemos registrado tu pedido y asociado todos los detalles a tu cuenta de cliente.
          </p>
        </div>

        {/* TARJETA DE GUÍA */}
        <div className="p-5 rounded-2xl bg-[#f5f3ef] border border-[#133e2b]/15 space-y-2">
          <span className="text-xs uppercase font-bold text-gray-500 block">
            Número de Guía de Despacho
          </span>
          <span className="text-3xl font-mono font-bold text-[#b90d1c] tracking-wider block">
            {guia || order?.numero_guia || 'ND-2026-PROCESANDO'}
          </span>
          <p className="text-xs text-gray-500">
            Guarda este número para consultar el estado de tu despacho o retiro.
          </p>
        </div>

        {order && (
          <div className="text-left border-t border-b border-gray-200 py-4 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Cliente:</span>
              <span className="font-bold text-[#002718]">{order.cliente.nombres_apellidos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email asociado:</span>
              <span className="font-mono font-bold text-[#133e2b]">{order.cliente.correo_electronico}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Modalidad de entrega:</span>
              <span className="font-bold text-[#002718]">
                {order.metodo_entrega === 'RECOGIDA_TIENDA'
                  ? '🎄 Recoger en tienda (Calle 93B #11A-44)'
                  : `🚚 Envío a domicilio (${order.ciudad_envio || 'Bogotá'})`}
              </span>
            </div>
            {order.direccion_envio && (
              <div className="flex justify-between">
                <span className="text-gray-500">Dirección:</span>
                <span className="font-bold text-gray-700">{order.direccion_envio}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Estado del pago:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  order.estado_pago === 'APROBADO'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.estado_pago}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold text-sm text-[#002718]">
              <span>Total Pagado:</span>
              <span>${Number(order.monto_total).toLocaleString('es-CO')} COP</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 h-12 rounded-xl bg-[#133e2b] hover:bg-[#002718] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-md"
          >
            Volver a la Tienda
          </Link>
          <a
            href="https://wa.me/573104567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-md"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
