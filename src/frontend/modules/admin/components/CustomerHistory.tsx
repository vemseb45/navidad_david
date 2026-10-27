'use client';

import React, { useState } from 'react';
import { AdminCustomerRecord } from '@/types/domain.types';

export function CustomerHistory({ customers }: { customers: AdminCustomerRecord[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="bg-[#081a13] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl space-y-4 text-white animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e]">
            Compradores & Leads
          </span>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
            Directorio Único de Clientes e Historial Consolidado
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identificación por correo electrónico. Todas las compras de un mismo cliente se agrupan aquí automáticamente.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="search"
            placeholder="Buscar por email, nombre o celular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e] focus:border-[#22c55e]"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <p className="text-xs text-slate-400 py-10 text-center">
          No hay clientes registrados en el historial.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="p-4 rounded-xl border border-white/10 bg-[#0d281e] space-y-3 shadow-md"
            >
              {/* HEADER DEL CLIENTE */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <span className="font-bold text-base text-white">{customer.fullName}</span>
                  <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[#22c55e] text-xs font-mono font-bold">
                    {customer.email}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  📱 {customer.phone} • {customer.orders.length} compra(s) registrada(s)
                </span>
              </div>

              {/* LISTA DE ÓRDENES Y GUÍAS */}
              <div className="space-y-2 pl-1 sm:pl-2">
                {customer.orders.map((order) => (
                  <div
                    key={order.id}
                    className="text-xs bg-[#05140e] p-3 rounded-lg border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="font-mono text-[#ffe088] font-bold">
                          Guía: {order.trackingNumber}
                        </strong>
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${
                            order.paymentStatus === 'APPROVED' || order.paymentStatus === 'APROBADO'
                              ? 'bg-emerald-500/20 text-[#22c55e] border border-emerald-500/30'
                              : order.paymentStatus === 'REJECTED' || order.paymentStatus === 'RECHAZADO'
                              ? 'bg-rose-500/20 text-[#ef4444] border border-rose-500/30'
                              : 'bg-amber-500/20 text-[#eab308] border border-amber-500/30'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(order.createdAt).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                      <p className="text-slate-300">
                        {order.items
                          .map(
                            (i) =>
                              `${i.quantity}x ${i.productName}${
                                i.variantName ? ` (${i.variantName})` : ''
                              }`
                          )
                          .join(', ')}
                      </p>
                    </div>

                    <div className="text-right sm:shrink-0 font-bold text-[#22c55e]">
                      ${Number(order.totalAmount).toLocaleString('es-CO')} <span className="text-xs text-slate-400">COP</span>
                      <span className="block text-[11px] font-normal text-slate-400">
                        {order.deliveryMethod === 'PICKUP_IN_STORE' || order.deliveryMethod === 'RECOGIDA_TIENDA'
                          ? '🎄 Recoge en tienda'
                          : '🚚 Envío a domicilio'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
