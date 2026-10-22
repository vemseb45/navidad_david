'use client';

import React, { useState, useMemo } from 'react';
import { DashboardMetrics } from '@/types/domain.types';

interface ViewPedidosAdminProps {
  metrics: DashboardMetrics;
  onRefresh: () => void;
}

export function ViewPedidosAdmin({ metrics, onRefresh }: ViewPedidosAdminProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [copiedGuide, setCopiedGuide] = useState<string | null>(null);

  const orders = metrics.recentOrdersList || [];

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchSearch =
        ord.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.customerPhone.includes(searchTerm);

      const matchStatus =
        statusFilter === 'TODOS' || ord.paymentStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleCopyGuide = (guide: string) => {
    navigator.clipboard.writeText(guide);
    setCopiedGuide(guide);
    setTimeout(() => setCopiedGuide(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER DE VENTAS Y PEDIDOS */}
      <div className="bg-[#f5f3ef] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e4e2de] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#133e2b] text-[#ffe088] text-[11px] font-sans font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            Gestión de Ventas & Despachos
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#002718] mt-1">
            Ventas y Pedidos de Temporada
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#414943] mt-0.5">
            Registro unificado de compras por pasarela Bold, pedidos manuales y recogida en tienda física.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#002718] text-white font-sans text-xs sm:text-sm font-semibold hover:bg-[#133e2b] transition-all"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e4e2de] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por guía, cliente o teléfono..."
            className="w-full h-10 pl-9 pr-4 bg-[#fbf9f5] rounded-xl border border-[#e4e2de] font-sans text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#002718] focus:border-[#002718]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {['TODOS', 'APROBADO', 'PENDIENTE', 'RECHAZADO'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#133e2b] text-white'
                  : 'bg-[#efeeea] text-[#414943] hover:text-[#1b1c1a]'
              }`}
            >
              {st === 'TODOS' ? 'Todos los Estados' : st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e4e2de] shadow-xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left font-sans text-xs sm:text-sm">
            <thead className="bg-[#f5f3ef] border-b border-[#e4e2de] text-[#414943] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Guía Oficial</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Artículos y Variantes</th>
                <th className="py-3 px-4">Método de Entrega</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Monto Total</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efeeea]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#fbf9f5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#b90d1c]">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.trackingNumber}</span>
                        <button
                          onClick={() => handleCopyGuide(ord.trackingNumber)}
                          className="p-1 text-gray-400 hover:text-[#002718] transition-colors"
                          title="Copiar número de guía"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copiedGuide === ord.trackingNumber ? 'done' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-400 block font-sans font-normal">
                        {new Date(ord.createdAt).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#002718]">{ord.customerName}</p>
                      <p className="text-[11px] text-[#414943]">{ord.customerEmail}</p>
                      <p className="text-[11px] text-gray-400">{ord.customerPhone}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm truncate" title={ord.itemsSummary}>
                      <span className="font-medium text-[#1b1c1a] block truncate">
                        {ord.itemsSummary}
                      </span>
                      <span className="text-[10px] text-[#735c00] font-bold block mt-0.5">
                        {ord.itemCount} artículo(s) en total
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#efeeea] text-[#002718] text-[10px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-xs">
                          {ord.deliveryMethod === 'RECOGIDA_TIENDA' ? 'storefront' : 'local_shipping'}
                        </span>
                        {ord.deliveryMethod === 'RECOGIDA_TIENDA'
                          ? 'Recogida Tienda'
                          : `Domicilio (${ord.city})`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.paymentStatus === 'APROBADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.paymentStatus === 'PENDIENTE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-[#002718] text-sm">
                      ${ord.totalAmount.toLocaleString('es-CO')} COP
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <a
                        href={`https://wa.me/${ord.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `¡Hola ${ord.customerName}! Te contactamos de Navidad David para confirmar el despacho de tu pedido con guía ${ord.trackingNumber}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 font-semibold text-[11px] transition-colors"
                        title="Contactar al cliente por WhatsApp"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span>
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500 font-sans text-xs">
                    No se encontraron órdenes que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
