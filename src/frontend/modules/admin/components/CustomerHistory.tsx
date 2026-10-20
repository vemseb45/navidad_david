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
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#002718]">
            Directorio Único de Clientes e Historial Consolidado
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Identificación por correo electrónico. Todas las compras de un mismo cliente se agrupan aquí automáticamente.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="search"
            placeholder="Buscar por email, nombre o celular..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 sm:h-9 px-3 rounded-xl border border-gray-300 text-base sm:text-xs focus:ring-2 focus:ring-[#133e2b]"
          />
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <p className="text-xs text-gray-400 py-10 text-center">
          No hay clientes registrados en el historial.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="p-4 rounded-xl border border-gray-200 bg-[#fbf9f5] space-y-3"
            >
              {/* HEADER DEL CLIENTE */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                <div>
                  <span className="font-bold text-base text-[#002718]">{customer.fullName}</span>
                  <span className="ml-2 px-2.5 py-0.5 rounded-full bg-[#133e2b]/10 text-[#133e2b] text-xs font-mono font-bold">
                    {customer.email}
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-600">
                  📱 {customer.phone} • {customer.orders.length} compra(s) registrada(s)
                </span>
              </div>

              {/* LISTA DE ÓRDENES Y GUÍAS */}
              <div className="space-y-2 pl-1 sm:pl-2">
                {customer.orders.map((order) => (
                  <div
                    key={order.id}
                    className="text-xs bg-white p-3 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <strong className="font-mono text-[#b90d1c] font-bold">
                          Guía: {order.trackingNumber}
                        </strong>
                        <span
                          className={`px-2 py-0.2 text-[10px] rounded-full font-bold uppercase ${
                            order.paymentStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.paymentStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                        <span className="text-gray-400 font-mono text-[10px]">
                          {new Date(order.createdAt).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                      <p className="text-gray-700">
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

                    <div className="text-right sm:shrink-0 font-bold text-[#002718]">
                      ${Number(order.totalAmount).toLocaleString('es-CO')} COP
                      <span className="block text-[11px] font-normal text-gray-500">
                        {order.deliveryMethod === 'PICKUP_IN_STORE'
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
