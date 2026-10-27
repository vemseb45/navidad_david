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
      <div className="bg-[#081a13] p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] text-[11px] font-sans font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            Gestión de Ventas & Despachos
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Ventas y Pedidos de Temporada
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-400 mt-0.5">
            Registro unificado de compras por pasarela Bold, pedidos manuales y recogida en tienda física.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#0d281e] text-white border border-white/10 font-sans text-xs sm:text-sm font-semibold hover:bg-[#123427] hover:border-[#22c55e]/40 transition-all shadow-md"
        >
          <span className="material-symbols-outlined text-lg text-[#22c55e]">refresh</span>
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="bg-[#081a13] p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por guía, cliente o teléfono..."
            className="w-full h-10 pl-9 pr-4 bg-[#0d281e] rounded-xl border border-white/10 text-white placeholder-slate-500 font-sans text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#22c55e] focus:border-[#22c55e]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {['TODOS', 'APROBADO', 'PENDIENTE', 'RECHAZADO'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#22c55e] text-[#040d0a] font-bold shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {st === 'TODOS' ? 'Todos los Estados' : st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA PRINCIPAL CON ESTILO DARK LUXURY */}
      <div className="bg-[#081a13] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left font-sans text-xs sm:text-sm">
            <thead className="bg-[#05140e] border-b border-white/10 text-[#94a3b8] uppercase text-[10px] font-bold tracking-wider">
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
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#eab308]">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.trackingNumber}</span>
                        <button
                          onClick={() => handleCopyGuide(ord.trackingNumber)}
                          className="p-1 text-slate-400 hover:text-[#22c55e] transition-colors"
                          title="Copiar número de guía"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copiedGuide === ord.trackingNumber ? 'done' : 'content_copy'}
                          </span>
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-sans font-normal">
                        {new Date(ord.createdAt).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{ord.customerEmail}</p>
                      <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm truncate" title={ord.itemsSummary}>
                      <span className="font-medium text-slate-200 block truncate">
                        {ord.itemsSummary}
                      </span>
                      <span className="text-[10px] text-[#ffe088] font-bold block mt-0.5">
                        {ord.itemCount} artículo(s) en total
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-xs text-[#22c55e]">
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
                            ? 'bg-emerald-500/20 text-[#22c55e] border border-emerald-500/30'
                            : ord.paymentStatus === 'PENDIENTE'
                            ? 'bg-amber-500/20 text-[#eab308] border border-amber-500/30'
                            : 'bg-rose-500/20 text-[#ef4444] border border-rose-500/30'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-[#22c55e] text-sm">
                      ${ord.totalAmount.toLocaleString('es-CO')} <span className="text-xs text-slate-400">COP</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <a
                        href={`https://wa.me/${ord.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `¡Hola ${ord.customerName}! Te contactamos de Navidad David para confirmar el despacho de tu pedido con guía ${ord.trackingNumber}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-[#22c55e] hover:bg-emerald-500/25 border border-emerald-500/20 font-semibold text-[11px] transition-colors"
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
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-sans text-xs">
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
