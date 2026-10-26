'use client';

import React from 'react';
import { DashboardMetricOverview } from '@/types/admin-dashboard.types';

interface TopKpiCardsProps {
  overview?: DashboardMetricOverview;
}

export function TopKpiCards({ overview }: TopKpiCardsProps) {
  const seasonTotal = overview?.seasonTotalCOP ?? 0;
  const seasonTotalFormatted =
    seasonTotal >= 1000000
      ? `$${(seasonTotal / 1000000).toFixed(1)}M`
      : `$${seasonTotal.toLocaleString('es-CO')}`;

  const todaySales = overview?.todaySalesCOP ?? 0;
  const todaySalesFormatted =
    todaySales >= 1000000
      ? `$${(todaySales / 1000000).toFixed(1)}M`
      : `$${todaySales.toLocaleString('es-CO')}`;

  const dailyGoal = overview?.dailyGoalCOP ?? 5000000;
  const dailyGoalFormatted =
    dailyGoal >= 1000000
      ? `$${(dailyGoal / 1000000).toFixed(1)}M`
      : `$${dailyGoal.toLocaleString('es-CO')}`;

  const goalPercent =
    overview?.goalPercentage ??
    (dailyGoal > 0 ? Math.min(100, Math.round((todaySales / dailyGoal) * 100)) : 0);

  const treesSold = overview?.totalTreesSold ?? 0;
  const treeStock = overview?.totalTreeStock ?? 180;
  const treePercent = treeStock > 0 ? Math.min(100, Math.round((treesSold / treeStock) * 100)) : 0;
  const critModels = overview?.criticalStockCount ?? 0;

  const ordersToday = overview?.activeOrdersToday ?? 0;
  const ordersDispatch = overview?.ordersForDispatch ?? 0;
  const ordersPickup = overview?.ordersForPickup ?? 0;
  const totalOrdersLogistics = ordersDispatch + ordersPickup;
  const logisticsPercent = totalOrdersLogistics > 0 ? 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      {/* CARD 1: Facturación de Temporada (Oct – Dic) */}
      <div className="rounded-2xl bg-[#081a13] border border-white/5 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] p-4 sm:p-5 flex items-center justify-between hover:border-[#22c55e]/30 transition-all">
        <div className="flex-1 pr-3">
          <h2 className="text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider mb-1">
            Facturación Temporada (Oct - Dic)
          </h2>
          <span className="text-white text-2xl sm:text-[26px] font-bold font-sans tracking-tight">
            {seasonTotalFormatted} <span className="text-xs font-normal text-slate-400">COP</span>
          </span>
          <div className="text-[11.5px] mt-1.5 flex items-center gap-1.5 text-[#22c55e]">
            <svg
              fill="none"
              height="12"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
              width="12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span>
              Hoy: {todaySalesFormatted} (Meta: {dailyGoalFormatted}) • {goalPercent}% cumplimiento
            </span>
          </div>
        </div>

        {/* ANILLO CIRCULAR SVG VERDE ESMERALDA */}
        <div className="relative w-[74px] h-[74px] shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="fill-none stroke-white/5"
              strokeWidth="2.8"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="fill-none stroke-[#22c55e] transition-all duration-1000 ease-out"
              strokeWidth="2.8"
              strokeDasharray={`${goalPercent}, 100`}
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-xs">
            {goalPercent}%
          </div>
        </div>
      </div>

      {/* CARD 2: Árboles Vendidos vs Capacidad de Bodega */}
      <div className="rounded-2xl bg-[#081a13] border border-white/5 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] p-4 sm:p-5 flex items-center justify-between hover:border-[#eab308]/30 transition-all">
        <div className="flex-1 pr-3">
          <h2 className="text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider mb-1">
            Árboles Vendidos vs Bodega
          </h2>
          <span className="text-white text-2xl sm:text-[26px] font-bold font-sans tracking-tight">
            {treesSold} <span className="text-sm font-normal text-slate-400">/ {treeStock} un.</span>
          </span>
          <div className="text-[11.5px] mt-1.5 flex items-center gap-1.5 text-[#eab308]">
            <svg
              fill="none"
              height="12"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              width="12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.26 12 2"></polygon>
            </svg>
            <span>
              {treePercent}% inventario vendido • {critModels} modelos en stock crítico (&lt;5u)
            </span>
          </div>
        </div>

        {/* ANILLO CIRCULAR SVG ORO NAVIDEÑO */}
        <div className="relative w-[74px] h-[74px] shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="fill-none stroke-white/5"
              strokeWidth="2.8"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="fill-none stroke-[#eab308] transition-all duration-1000 ease-out"
              strokeWidth="2.8"
              strokeDasharray={`${treePercent}, 100`}
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-xs">
            {treePercent}%
          </div>
        </div>
      </div>

      {/* CARD 3: Logística Activa del Día (Bogotá y Nacional) */}
      <div className="rounded-2xl bg-[#081a13] border border-white/5 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] p-4 sm:p-5 flex items-center justify-between hover:border-[#ef4444]/30 transition-all">
        <div className="flex-1 pr-3">
          <h2 className="text-[#94a3b8] text-[11px] font-bold uppercase tracking-wider mb-1">
            Logística Activa del Día
          </h2>
          <span className="text-white text-2xl sm:text-[26px] font-bold font-sans tracking-tight">
            {ordersToday} <span className="text-sm font-normal text-slate-400">pedidos hoy</span>
          </span>
          <div className="text-[11.5px] mt-1.5 flex items-center gap-1.5 text-[#ef4444]">
            <svg
              fill="none"
              height="12"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              width="12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect height="13" width="15" x="1" y="3"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            <span>
              {ordersDispatch} Envíos Guía • {ordersPickup} Retiros Tienda ("Ir por el arbolito")
            </span>
          </div>
        </div>

        {/* ANILLO CIRCULAR SVG ROJO / CIAN */}
        <div className="relative w-[74px] h-[74px] shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="fill-none stroke-white/5"
              strokeWidth="2.8"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="fill-none stroke-[#ef4444] transition-all duration-1000 ease-out"
              strokeWidth="2.8"
              strokeDasharray={`${logisticsPercent}, 100`}
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-xs">
            {logisticsPercent}%
          </div>
        </div>
      </div>
    </div>
  );
}
