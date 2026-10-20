'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Trophy,
  Calendar,
  Filter,
  Star,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { DashboardMetrics } from '@/types/domain.types';

interface ViewInicioAdminProps {
  metrics: DashboardMetrics;
  onFilterChange: (inicio?: string, fin?: string) => void;
  loading: boolean;
}

export function ViewInicioAdmin({
  metrics,
  onFilterChange,
  loading,
}: ViewInicioAdminProps) {
  const [activePreset, setActivePreset] = useState<'todo' | 'hoy' | '7dias' | 'mes' | 'custom'>('todo');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleApplyPreset = (preset: 'todo' | 'hoy' | '7dias' | 'mes' | 'custom') => {
    setActivePreset(preset);
    const now = new Date();

    if (preset === 'todo') {
      setFechaInicio('');
      setFechaFin('');
      onFilterChange(undefined, undefined);
      return;
    }

    if (preset === 'hoy') {
      const hoyStr = now.toISOString().split('T')[0];
      setFechaInicio(hoyStr);
      setFechaFin(hoyStr);
      onFilterChange(hoyStr, hoyStr);
      return;
    }

    if (preset === '7dias') {
      const sieteDiasAtras = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const inicioStr = sieteDiasAtras.toISOString().split('T')[0];
      const finStr = now.toISOString().split('T')[0];
      setFechaInicio(inicioStr);
      setFechaFin(finStr);
      onFilterChange(inicioStr, finStr);
      return;
    }

    if (preset === 'mes') {
      const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const inicioStr = primerDiaMes.toISOString().split('T')[0];
      const finStr = now.toISOString().split('T')[0];
      setFechaInicio(inicioStr);
      setFechaFin(finStr);
      onFilterChange(inicioStr, finStr);
      return;
    }
  };

  const handleCustomFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaInicio) return;
    onFilterChange(fechaInicio, fechaFin || undefined);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* HEADER Y FILTRO DE FECHAS */}
      <div className="bg-white p-6 rounded-[28px] border border-[#e4e2de] shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#b90d1c]">
            Métricas de Desempeño
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#002718] mt-0.5">
            Panel Principal de Ventas
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Visualización general de ingresos, clientes recurrentes y notificaciones automáticas.
          </p>
        </div>

        {/* CONTROLES DE FILTRO POR FECHAS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-1 bg-[#efeeea] p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'todo', label: 'Todo' },
              { id: 'hoy', label: 'Hoy' },
              { id: '7dias', label: '7 Días' },
              { id: 'mes', label: 'Este Mes' },
              { id: 'custom', label: 'Rango...' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p.id as typeof activePreset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activePreset === p.id
                    ? 'bg-[#133e2b] text-white shadow-sm'
                    : 'text-[#414943] hover:text-black'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {activePreset === 'custom' && (
            <form onSubmit={handleCustomFilterSubmit} className="flex items-center gap-2 mt-2 sm:mt-0">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="h-8 px-2 rounded-lg border border-gray-300 text-xs"
              />
              <span className="text-xs text-gray-400">a</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="h-8 px-2 rounded-lg border border-gray-300 text-xs"
              />
              <button
                type="submit"
                className="h-8 px-3 rounded-lg bg-[#133e2b] text-white text-xs font-bold"
              >
                <Filter size={12} />
              </button>
            </form>
          )}

          {loading && (
            <RefreshCw size={16} className="text-[#133e2b] animate-spin shrink-0 ml-1" />
          )}
        </div>
      </div>

      {/* TARJETAS DE KPIS PRINCIPALES (Estilo Barber_Tech_BF) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* VENTAS TOTALES */}
        <div className="p-6 rounded-[28px] bg-white border border-[#e4e2de] shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Ventas del Periodo
              </p>
              <h3 className="text-2xl font-bold text-[#002718] mt-2">
                ${metrics.totalRevenue.toLocaleString('es-CO')}
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                {metrics.totalOrders} orden(es) registrada(s)
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-700">
              <DollarSign size={22} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* ÓRDENES TOTALES */}
        <div className="p-6 rounded-[28px] bg-white border border-[#e4e2de] shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Total de Órdenes
              </p>
              <h3 className="text-2xl font-bold text-[#002718] mt-2">
                {metrics.totalOrders}
              </h3>
              <span className="text-[11px] font-semibold text-gray-500 mt-1 block">
                Con número de guía oficial
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#133e2b]/10 text-[#133e2b]">
              <ShoppingBag size={22} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* ARTÍCULO MÁS VENDIDO */}
        <div className="p-6 rounded-[28px] bg-white border border-[#e4e2de] shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div className="min-w-0 pr-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#b90d1c]">
                🏆 Más Vendido
              </p>
              {metrics.bestSellingProduct ? (
                <>
                  <h3 className="text-sm font-bold text-[#002718] mt-2 truncate">
                    {metrics.bestSellingProduct.name}
                  </h3>
                  <span className="text-[11px] text-gray-600 mt-0.5 block">
                    {metrics.bestSellingProduct.unitsSold} unid. (${metrics.bestSellingProduct.revenue.toLocaleString('es-CO')})
                  </span>
                </>
              ) : (
                <p className="text-xs text-gray-400 mt-2">Sin ventas registradas</p>
              )}
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-700 shrink-0">
              <Trophy size={22} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* TOTAL DE CLIENTES ÚNICOS */}
        <div className="p-6 rounded-[28px] bg-white border border-[#e4e2de] shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Clientes Registrados
              </p>
              <h3 className="text-2xl font-bold text-[#002718] mt-2">
                {metrics.totalUniqueCustomers}
              </h3>
              <span className="text-[11px] font-semibold text-gray-500 mt-1 block">
                Cero duplicados en DB
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-700">
              <Users size={22} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DESTACADA: CLIENTE MÁS FRECUENTE */}
      <div className="bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 p-6 sm:p-8 rounded-[32px] border border-amber-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Star size={18} className="fill-amber-500 text-amber-500" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Cliente Más Frecuente (Fidelidad)
              </span>
            </div>

            {metrics.frequentCustomer ? (
              <div className="pt-2">
                <h4 className="text-xl font-bold text-[#002718]">
                  {metrics.frequentCustomer.fullName}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-1">
                  <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-gray-200 font-bold text-[#133e2b]">
                    ✉ {metrics.frequentCustomer.email}
                  </span>
                  <span>📱 {metrics.frequentCustomer.phone}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 pt-2">
                Aún no hay compras registradas en el periodo seleccionado para calcular el cliente más recurrente.
              </p>
            )}
          </div>

          {metrics.frequentCustomer && (
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-amber-200 shadow-xs sm:self-center">
              <div className="text-center px-3 border-r border-gray-200">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Compras</span>
                <span className="text-xl font-black text-[#133e2b]">
                  {metrics.frequentCustomer.totalOrders}
                </span>
              </div>
              <div className="text-center px-3">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Invertido</span>
                <span className="text-xl font-black text-[#b90d1c]">
                  ${metrics.frequentCustomer.totalSpent.toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FEED DE NOTIFICACIONES RECIENTES */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#e4e2de] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-50 text-[#b90d1c]">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#002718]">
                Notificaciones y Números de Guía
              </h3>
              <p className="text-xs text-gray-500">
                Alertas automáticas de órdenes creadas, despachos y confirmaciones de pago Bold.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-400">
            {metrics.notifications.length} eventos
          </span>
        </div>

        {metrics.notifications.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center">
            No hay notificaciones en el periodo seleccionado.
          </p>
        ) : (
          <div className="space-y-3">
            {metrics.notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 rounded-2xl bg-[#fbf9f5] border-l-4 border-[#133e2b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:bg-[#f5f3ef] transition-colors"
              >
                <div>
                  <p className="font-bold text-sm text-[#002718]">{notif.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{notif.summary}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[11px] text-gray-400 font-mono">
                  <Calendar size={13} />
                  <span>{new Date(notif.createdAt).toLocaleString('es-CO')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
