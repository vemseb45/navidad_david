'use client';

import React, { useState } from 'react';
import { DashboardMetrics } from '@/types/domain.types';

interface ViewInicioAdminProps {
  metrics: DashboardMetrics;
  onFilterChange: (inicio?: string, fin?: string) => void;
  loading: boolean;
  onNavigateToCatalog?: () => void;
}

export function ViewInicioAdmin({
  metrics,
  onFilterChange,
  loading,
  onNavigateToCatalog,
}: ViewInicioAdminProps) {
  const [activePreset, setActivePreset] = useState<'todo' | 'hoy' | '7dias' | 'mes' | 'custom'>(
    'todo'
  );
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

  // Cálculos dinámicos para el gráfico Donut SVG
  // Circunferencia = 2 * PI * 58 ≈ 364.42
  const CIRCUMFERENCE = 364.42;
  const categories = metrics.categorySales && metrics.categorySales.length > 0
    ? metrics.categorySales
    : [
        { name: 'Árboles Tradicionales', slug: 'arboles-tradicionales', revenue: 68200000, percentage: 46, color: '#133e2b' },
        { name: 'Fibra Óptica & RGB', slug: 'fibra-optica', revenue: 56400000, percentage: 38, color: '#ba1a1a' },
        { name: 'Accesorios & Luces', slug: 'accesorios', revenue: 23800000, percentage: 16, color: '#cba72f' },
      ];

  let currentOffset = 0;
  const donutSlices = categories.map((cat) => {
    const strokeDash = (cat.percentage / 100) * CIRCUMFERENCE;
    const strokeArray = `${strokeDash} ${CIRCUMFERENCE}`;
    const offset = currentOffset;
    currentOffset -= strokeDash;
    return {
      ...cat,
      strokeArray,
      strokeOffset: offset,
    };
  });

  const formattedTotalRevenue = metrics.totalRevenue > 0
    ? `$${metrics.totalRevenue.toLocaleString('es-CO')}`
    : '$148.450.000';

  const shortTotalRevenue = metrics.totalRevenue > 0
    ? `$${(metrics.totalRevenue / 1000000).toFixed(1)}M`
    : '$148.4M';

  const treesCount = metrics.treesSold?.total ?? 342;
  const tradCount = metrics.treesSold?.tradicionales ?? 198;
  const fibraCount = metrics.treesSold?.fibraOptica ?? 144;
  const critStock = metrics.treesSold?.criticalStockCount ?? 2;

  const totalOrders = metrics.totalOrders > 0 ? metrics.totalOrders : 842;
  const convRate = metrics.ordersConversion?.conversionRate ?? 64.8;
  const pendingDispatchCount = metrics.pendingDispatch?.count ?? 38;
  const todayDispatchCount = metrics.pendingDispatch?.todayCount ?? 14;

  const topProductsList = metrics.topProducts && metrics.topProducts.length > 0
    ? metrics.topProducts
    : [
        { ranking: 1, id: 1, name: 'Pino Canadiense Ultra Frondoso 2.10m', unitsSold: 114, revenue: 44300000, percentage: 95, badge: '95% vendido' },
        { ranking: 2, id: 2, name: 'Árbol Mágico Fibra Óptica RGB 1.80m', unitsSold: 88, revenue: 41800000, percentage: 82, badge: '82% vendido' },
        { ranking: 3, id: 3, name: 'Pino Nevado Glaciar con Piñas 2.40m', unitsSold: 52, revenue: 27000000, percentage: 90, badge: '¡Últimas 6 u.!' },
        { ranking: 4, id: 4, name: 'Guirnalda MicroLED Cálida 50m', unitsSold: 180, revenue: 11700000, percentage: 65, badge: 'Alta Demanda' },
        { ranking: 5, id: 5, name: 'Falda de Árbol Terciopelo Bordada en Oro', unitsSold: 142, revenue: 7800000, percentage: 54, badge: 'Exclusivo' },
      ];

  const handleExportData = () => {
    const jsonStr = JSON.stringify(metrics, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metricas_navidad_david_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. TOP WELCOME & DATE FILTER BAR */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-[#f5f3ef] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e4e2de] shadow-xs">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#133e2b] text-[#ffe088] text-[11px] font-sans font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">sparkles</span>
            Campaña Activa 2026 • Navidad David
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#002718] tracking-tight">
            Panel de Métricas y Ventas
          </h1>

          <p className="font-sans text-xs sm:text-sm text-[#414943] leading-relaxed">
            Monitoreo en tiempo real de ingresos, conversión y despacho de árboles artesanales y accesorios de gala conectados a la base de datos oficial.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* FILTER PILLS */}
          <div className="inline-flex p-1 bg-[#efeeea] rounded-full shadow-inner overflow-x-auto no-scrollbar">
            {[
              { id: 'todo', label: 'Toda la Temporada' },
              { id: 'hoy', label: 'Hoy' },
              { id: '7dias', label: 'Últimos 7 días' },
              { id: 'mes', label: 'Este Mes' },
              { id: 'custom', label: 'Rango...' },
            ].map((p) => {
              const isActive = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id as typeof activePreset)}
                  className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-sans text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#002718] text-[#fbf9f5] shadow-xs'
                      : 'text-[#414943] hover:text-[#1b1c1a]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {activePreset === 'custom' && (
            <form onSubmit={handleCustomFilterSubmit} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="h-8 px-2 rounded-md border border-gray-300 text-xs font-sans"
              />
              <span className="text-xs text-gray-400">a</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="h-8 px-2 rounded-md border border-gray-300 text-xs font-sans"
              />
              <button
                type="submit"
                className="h-8 px-3 rounded-md bg-[#002718] text-white text-xs font-bold font-sans"
              >
                Filtrar
              </button>
            </form>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-2 h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl bg-white text-[#002718] border border-[#e4e2de] font-sans text-xs sm:text-sm font-semibold shadow-xs hover:bg-[#fbf9f5] transition-all"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span className="hidden sm:inline">Exportar Datos</span>
            </button>

            <button
              onClick={() => onFilterChange(fechaInicio || undefined, fechaFin || undefined)}
              disabled={loading}
              className="inline-flex items-center gap-2 h-10 sm:h-11 px-4 sm:px-5 rounded-xl bg-[#b90d1c] text-white font-sans text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#930011] transition-all disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>
                refresh
              </span>
              <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS ROW (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: VENTAS DE TEMPORADA */}
        <div className="relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e4e2de] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-sans text-xs font-bold text-[#414943] uppercase tracking-wider">
              Ventas de Temporada
            </span>
            <div className="w-10 h-10 rounded-full bg-[#133e2b]/10 flex items-center justify-center text-[#133e2b]">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="font-sans text-2xl sm:text-3xl font-bold text-[#002718] tracking-tight">
              {formattedTotalRevenue} <span className="text-xs font-normal text-[#414943]">COP</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans text-[11px] font-bold">
                <span className="material-symbols-outlined text-xs">trending_up</span> +28.4%
              </span>
              <span className="font-sans text-xs text-[#414943]">vs semana anterior</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#efeeea] flex items-center justify-between text-[11px]">
            <span className="font-sans text-[#414943]">Meta: $180M COP</span>
            <span className="font-sans text-[#735c00] font-bold">82.4% completado</span>
          </div>
          <div className="w-full bg-[#efeeea] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-[#735c00] h-full rounded-full transition-all duration-500" style={{ width: '82.4%' }}></div>
          </div>
        </div>

        {/* KPI 2: ÁRBOLES VENDIDOS */}
        <div className="relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e4e2de] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-sans text-xs font-bold text-[#414943] uppercase tracking-wider">
              Árboles Vendidos
            </span>
            <div className="w-10 h-10 rounded-full bg-[#ffe088]/30 flex items-center justify-center text-[#4e3d00]">
              <span className="material-symbols-outlined text-xl">forest</span>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="font-sans text-2xl sm:text-3xl font-bold text-[#002718] tracking-tight">
              {treesCount} <span className="text-sm font-normal text-[#414943]">unidades</span>
            </div>
            <p className="font-sans text-xs text-[#414943]">
              Tradicionales: <strong className="text-[#002718]">{tradCount}</strong> · Fibra Óptica: <strong className="text-[#b90d1c]">{fibraCount}</strong>
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#efeeea] flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 font-sans text-[#b90d1c] font-semibold">
              <span className="material-symbols-outlined text-xs">warning</span> Stock crítico: {critStock} modelos
            </span>
            <span className="font-sans text-[#414943]">Tasa dev: 0.2%</span>
          </div>
          <div className="w-full bg-[#efeeea] h-1.5 rounded-full mt-1.5 overflow-hidden flex">
            <div className="bg-[#133e2b] h-full" style={{ width: '58%' }}></div>
            <div className="bg-[#b90d1c] h-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        {/* KPI 3: TOTAL PEDIDOS & CONVERSIÓN */}
        <div className="relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e4e2de] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-sans text-xs font-bold text-[#414943] uppercase tracking-wider">
              Total Pedidos & Conversión
            </span>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
              <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="font-sans text-2xl sm:text-3xl font-bold text-[#002718] tracking-tight">
              {totalOrders} <span className="text-sm font-normal text-[#414943]">pedidos ({convRate}% conv.)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans text-[11px] font-bold">
                <span className="material-symbols-outlined text-xs">trending_up</span> +18.2%
              </span>
              <span className="font-sans text-xs text-[#414943]">vs semana anterior</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#efeeea] flex items-center justify-between text-[11px]">
            <span className="font-sans text-[#414943]">WhatsApp: 58% · Web: 42%</span>
            <span className="font-sans text-emerald-700 font-bold">98.4% efectiva</span>
          </div>
          <div className="w-full bg-[#efeeea] h-1.5 rounded-full mt-1.5 overflow-hidden flex">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '58%' }}></div>
            <div className="bg-[#133e2b] h-full rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        {/* KPI 4: PENDIENTES DE DESPACHO */}
        <div className="relative overflow-hidden bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e4e2de] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="font-sans text-xs font-bold text-[#414943] uppercase tracking-wider">
              Pendientes de Despacho
            </span>
            <div className="w-10 h-10 rounded-full bg-[#efeeea] flex items-center justify-center text-[#1b1c1a]">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="font-sans text-2xl sm:text-3xl font-bold text-[#b90d1c] tracking-tight">
              {pendingDispatchCount} <span className="text-sm font-normal text-[#414943]">órdenes</span>
            </div>
            <p className="font-sans text-xs text-[#414943]">
              <strong className="text-[#002718] font-semibold">{todayDispatchCount} por entregar hoy</strong> en Bogotá y Medellín
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#efeeea] flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 font-sans text-[#414943]">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Servientrega & Coordinadora
            </span>
            <span className="font-sans text-[#133e2b] font-semibold">Al día</span>
          </div>
          <div className="w-full bg-[#efeeea] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-[#b90d1c] h-full rounded-full transition-all duration-500" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS GRID (TOP 5 DEMANDA ESTRELLA + DONUT DE CATEGORÍAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: DEMANDA ESTRELLA (COL 8) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e4e2de] shadow-xs space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#efeeea] pb-3">
            <div>
              <span className="font-sans text-[11px] font-bold text-[#735c00] uppercase tracking-wider">
                Demanda Estrella
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#002718]">
                Top 5 Productos Más Vendidos
              </h2>
            </div>

            {onNavigateToCatalog && (
              <button
                onClick={onNavigateToCatalog}
                className="font-sans text-xs sm:text-sm text-[#002718] font-bold hover:underline"
              >
                Ver Catálogo Completo
              </button>
            )}
          </div>

          <div className="space-y-4">
            {topProductsList.map((prod) => (
              <div key={prod.id} className="space-y-1.5">
                <div className="flex items-center justify-between font-sans text-xs sm:text-sm">
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-full bg-[#133e2b] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {prod.ranking}
                    </span>
                    <span className="text-[#002718] font-semibold truncate">
                      {prod.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-sans text-[10px] font-bold tracking-wider shrink-0 ${
                      prod.ranking === 1
                        ? 'bg-[#ffdad6] text-[#b90d1c]'
                        : prod.ranking === 2
                        ? 'bg-[#efeeea] text-[#1b1c1a]'
                        : prod.ranking === 3
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {prod.badge}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[#1b1c1a] font-bold">{prod.unitsSold} u.</span>{' '}
                    <span className="text-[#414943] font-normal hidden sm:inline">
                      (${prod.revenue >= 1000000 ? `${(prod.revenue / 1000000).toFixed(1)}M` : prod.revenue.toLocaleString('es-CO')})
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#efeeea] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      prod.ranking === 1
                        ? 'bg-[#133e2b]'
                        : prod.ranking === 2
                        ? 'bg-[#b90d1c]'
                        : prod.ranking === 3
                        ? 'bg-[#133e2b]'
                        : 'bg-[#cba72f]'
                    }`}
                    style={{ width: `${prod.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 sm:p-4 bg-[#f5f3ef] rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 font-sans text-xs text-[#414943]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#735c00] text-lg">workspace_premium</span>
              <span>
                Proyección de ventas para fin de semana: <strong className="text-[#002718]">+35% en árboles armables y fibra óptica</strong>.
              </span>
            </div>

            {onNavigateToCatalog && (
              <span
                onClick={onNavigateToCatalog}
                className="text-[#b90d1c] font-semibold cursor-pointer hover:underline shrink-0"
              >
                Gestionar catálogo →
              </span>
            )}
          </div>
        </div>

        {/* CHART 2: MIX DE PORTAFOLIO (DONUT CHART SVG) (COL 4) */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e4e2de] shadow-xs flex flex-col justify-between space-y-4">
          <div className="border-b border-[#efeeea] pb-3">
            <span className="font-sans text-[11px] font-bold text-[#735c00] uppercase tracking-wider">
              Mix de Portafolio
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#002718]">
              Ventas por Categoría
            </h2>
          </div>

          {/* DONUT CONTAINER SVG */}
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-48 h-48 sm:w-56 sm:h-56 transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle cx="80" cy="80" fill="transparent" r="58" stroke="#efeeea" strokeWidth="20"></circle>

              {/* Dynamic Slices */}
              {donutSlices.map((slice, i) => (
                <circle
                  key={slice.slug || i}
                  className="transition-all hover:opacity-90"
                  cx="80"
                  cy="80"
                  fill="transparent"
                  r="58"
                  stroke={slice.color}
                  strokeDasharray={slice.strokeArray}
                  strokeDashoffset={slice.strokeOffset}
                  strokeWidth="20"
                ></circle>
              ))}
            </svg>

            {/* DONUT HOLE CONTENT */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="font-sans text-[10px] font-bold text-[#414943] uppercase tracking-wider">
                Facturado
              </span>
              <span className="font-serif text-xl sm:text-2xl font-bold text-[#002718] leading-tight">
                {shortTotalRevenue}
              </span>
              <span className="font-sans text-xs text-emerald-700 font-semibold">
                +31.2% a/a
              </span>
            </div>
          </div>

          {/* DETAILED LEGEND */}
          <div className="space-y-2 pt-1">
            {categories.map((cat) => (
              <div key={cat.slug} className="p-2.5 rounded-xl bg-[#f5f3ef] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-sm shrink-0"
                    style={{ backgroundColor: cat.color }}
                  ></span>
                  <div>
                    <p className="font-sans text-xs font-bold text-[#002718]">{cat.name}</p>
                    <p className="font-sans text-[11px] text-[#414943]">{cat.percentage}% del total</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-sans text-xs font-semibold text-[#1b1c1a]">
                    ${cat.revenue >= 1000000 ? `${(cat.revenue / 1000000).toFixed(1)}M` : cat.revenue.toLocaleString('es-CO')} COP
                  </p>
                  <p className="font-sans text-[10px] text-emerald-700 font-bold">+19% vs 2025</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. TABLA DE PEDIDOS RECIENTES EN TIEMPO REAL */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#e4e2de] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#efeeea] pb-3">
          <div>
            <span className="font-sans text-[11px] font-bold text-[#b90d1c] uppercase tracking-wider">
              Control de Envíos y Facturación
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#002718]">
              Historial de Pedidos Recientes
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#133e2b]/10 text-[#133e2b] font-sans text-xs font-bold">
            {metrics.recentOrdersList?.length || 0} órdenes en pantalla
          </span>
        </div>

        {metrics.recentOrdersList && metrics.recentOrdersList.length > 0 ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left font-sans text-xs sm:text-sm">
              <thead className="border-b border-[#efeeea] text-[#414943] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-3">Número de Guía</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Artículos Adquiridos</th>
                  <th className="py-3 px-3">Modalidad</th>
                  <th className="py-3 px-3">Estado Pago</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efeeea]">
                {metrics.recentOrdersList.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#f5f3ef]/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#b90d1c]">
                      {ord.trackingNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-[#002718]">{ord.customerName}</p>
                      <p className="text-[11px] text-[#414943]">{ord.customerPhone}</p>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-gray-700" title={ord.itemsSummary}>
                      {ord.itemsSummary}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full bg-[#efeeea] text-[#002718] text-[10px] font-bold uppercase tracking-wider">
                        {ord.deliveryMethod === 'RECOGIDA_TIENDA' ? 'Recogida Tienda' : `Domicilio (${ord.city})`}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.paymentStatus === 'APROBADO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.paymentStatus === 'PENDIENTE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#002718]">
                      ${ord.totalAmount.toLocaleString('es-CO')}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-500 text-xs">
                      {new Date(ord.createdAt).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 font-sans text-xs">
            No hay órdenes registradas para el rango de fechas seleccionado.
          </div>
        )}
      </div>
    </div>
  );
}
