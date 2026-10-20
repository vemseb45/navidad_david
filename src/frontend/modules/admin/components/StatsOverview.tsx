'use client';

import React from 'react';
import { DashboardMetrics } from '@/types/domain.types';

export function StatsOverview({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="space-y-6">
      {/* TARJETAS DE KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Ventas Totales
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#002718] mt-1.5">
            ${metrics.totalRevenue.toLocaleString('es-CO')} COP
          </p>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {metrics.totalOrders} órdenes generadas
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-[#b90d1c]">
            🏆 Artículo Más Vendido
          </span>
          {metrics.bestSellingProduct ? (
            <div className="mt-1.5">
              <p className="text-base font-bold text-[#002718] truncate">
                {metrics.bestSellingProduct.name}
              </p>
              <span className="text-xs text-gray-600 block mt-0.5">
                {metrics.bestSellingProduct.unitsSold} unid. vendidas ($
                {metrics.bestSellingProduct.revenue.toLocaleString('es-CO')})
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-2">Sin ventas registradas aún</p>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Clientes Únicos (Email)
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-[#002718] mt-1.5">
            {metrics.totalUniqueCustomers}
          </p>
          <span className="text-xs text-gray-500 block mt-1">Cero duplicados en DB</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e4e2de] shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Pasarela Bold
          </span>
          <p className="text-sm font-bold text-[#002718] mt-2">
            PSE & Tarjetas
          </p>
          <span className="text-[11px] text-emerald-600 font-bold block mt-1">
            Integridad SHA-256 Activa
          </span>
        </div>
      </div>

      {/* FEED DE NOTIFICACIONES */}
      <div className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg font-bold text-[#002718] flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-[#b90d1c]">notifications</span>
            <span>Notificaciones de Compras y Números de Guía</span>
          </h2>
          <span className="text-xs font-semibold text-gray-500">
            {metrics.notifications.length} eventos recientes
          </span>
        </div>

        {metrics.notifications.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            No hay notificaciones recientes.
          </p>
        ) : (
          <div className="space-y-3">
            {metrics.notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl bg-[#f5f3ef] border-l-4 border-[#133e2b] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="font-bold text-sm text-[#002718]">{notif.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{notif.summary}</p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0 font-mono">
                  {new Date(notif.createdAt).toLocaleString('es-CO')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
