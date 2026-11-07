import React from 'react';
import Link from 'next/link';
import { prisma } from '@/backend/config/prisma';
import { OrderService } from '@/backend/modules/orders/order.service';

export const instant = false;

const orderService = new OrderService();

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ guia?: string; ref?: string; reference?: string }>;
}) {
  const params = await searchParams;
  const searchRef = params.guia || params.ref || params.reference;

  let order = null;
  if (searchRef) {
    try {
      order = await prisma.orden.findFirst({
        where: {
          OR: [
            { numero_guia: searchRef },
            { referencia_bold: searchRef },
            { referencia_bold: `BOLD-${searchRef}` },
          ],
        },
        include: {
          cliente: true,
          items: true,
        },
      });

      // Si el estado sigue pendiente, verificar con la API de Bold si ya fue conciliado
      if (order && order.estado_pago === 'PENDIENTE') {
        const estadoBold = await orderService['boldProvider'].sincronizarEstadoFallback(order.referencia_bold);
        if (estadoBold) {
          await orderService.processBoldWebhook({
            type: estadoBold,
            reference: order.referencia_bold,
          });
          order = await prisma.orden.findUnique({
            where: { id: order.id },
            include: { cliente: true, items: true },
          });
        }
      }
    } catch {
      // Fallback silencioso
    }
  }

  const esAprobado = order?.estado_pago === 'APROBADO';
  const esRechazado = order?.estado_pago === 'RECHAZADO';
  const esPendiente = !esAprobado && !esRechazado;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 selection:bg-[#E5B869] selection:text-black relative overflow-hidden font-sans"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #0d2c20 0%, #05140e 55%, #020806 100%)',
      }}
    >
      {/* Halos festivos ambientales */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#E5B869]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-xl w-full bg-[#0a2017]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-9 border border-white/10 ring-1 ring-[#E5B869]/25 shadow-2xl text-center space-y-6 text-white overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Línea superior dorada */}
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#E5B869]/70 to-transparent" />

        <div className="flex items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-black/60 border-2 border-[#E5B869]/60 shadow-[0_0_20px_rgba(229,184,105,0.25)] flex items-center justify-center overflow-hidden">
            <img
              src="/Logo_david.png"
              alt="NaviDavid"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold shadow-inner ${
              esAprobado
                ? 'bg-emerald-500/20 text-[#22c55e] border border-emerald-500/40'
                : esRechazado
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {esAprobado ? '✓' : esRechazado ? '✕' : '⏳'}
          </div>
        </div>

        <div>
          <span className="text-[11px] sm:text-xs uppercase tracking-widest font-bold text-[#E5B869] block">
            NaviDavid • Estado de la Transacción Bold
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            {esAprobado
              ? '¡Pago Aprobado con Éxito!'
              : esRechazado
              ? 'Pago No Aprobado / Rechazado'
              : 'Verificando Estado con Bold...'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
            {esAprobado
              ? 'Tu pago ha sido confirmado por la pasarela Bold. Tu pedido ya está en preparación.'
              : esRechazado
              ? 'La transacción no pudo ser completada por la entidad financiera. Puedes intentar nuevamente con otro medio de pago.'
              : 'Estamos validando la conciliación del pago con la pasarela oficial de Bold.'}
          </p>
        </div>

        {/* TARJETA DE GUÍA */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-white/10 space-y-1.5">
          <span className="text-[11px] sm:text-xs uppercase font-bold text-stone-400 block tracking-wider">
            Número de Guía Oficial
          </span>
          <span className="text-2xl sm:text-3xl font-mono font-bold text-[#ffe088] tracking-wider block">
            {order?.numero_guia || searchRef || 'ND-2026-EN-PROCESO'}
          </span>
          <p className="text-[11px] text-stone-400">
            Guarda este número para realizar el seguimiento de tu pedido navideño.
          </p>
        </div>

        {order && (
          <div className="text-left border-t border-b border-white/10 py-4 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-stone-400">Cliente:</span>
              <span className="font-bold text-white">{order.cliente.nombres_apellidos}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Correo asociado:</span>
              <span className="font-mono text-stone-200">{order.cliente.correo_electronico}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400">Modalidad de entrega:</span>
              <span className="font-bold text-stone-200">
                {order.metodo_entrega === 'RECOGIDA_TIENDA'
                  ? '🎄 Recoger en tienda (Ir por el arbolito)'
                  : `🚚 Envío a domicilio (${order.ciudad_envio || 'Colombia'})`}
              </span>
            </div>
            {order.direccion_envio && (
              <div className="flex justify-between">
                <span className="text-stone-400">Dirección de entrega:</span>
                <span className="font-medium text-stone-200">{order.direccion_envio}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Estado del pago:</span>
              <span
                className={`font-bold px-2.5 py-1 rounded-full text-[10.5px] uppercase tracking-wider border ${
                  esAprobado
                    ? 'bg-emerald-500/20 text-[#22c55e] border-emerald-500/40'
                    : esRechazado
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {order.estado_pago}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10 font-bold text-sm text-white">
              <span>Monto Total:</span>
              <span className="text-[#E5B869]">${Number(order.monto_total).toLocaleString('es-CO')} COP</span>
            </div>
          </div>
        )}

        {/* ACCIONES */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 h-12 rounded-xl bg-white hover:bg-stone-200 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-md active:scale-98"
          >
            Volver a la Tienda
          </Link>
          <a
            href="https://wa.me/573104567890"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 rounded-xl bg-[#25D366] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-md active:scale-98"
          >
            Asistencia WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
