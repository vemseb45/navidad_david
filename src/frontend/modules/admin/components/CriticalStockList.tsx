'use client';

import React from 'react';
import { TreeStockDemandItem } from '@/types/admin-dashboard.types';

interface CriticalStockListProps {
  items?: TreeStockDemandItem[];
}

const DEFAULT_DEMAND_ITEMS: TreeStockDemandItem[] = [
  {
    id: '1',
    name: 'Pino Canadiense',
    heightVariant: '2.10m',
    unitsSold: 54,
    priceCOP: 389000,
    stockRemaining: 3,
    burnRatePerDay: 6,
    status: 'CRITICAL',
  },
  {
    id: '2',
    name: 'Árbol Mágico Fibra Óptica',
    heightVariant: '1.80m',
    unitsSold: 38,
    priceCOP: 475000,
    stockRemaining: 11,
    burnRatePerDay: 3,
    status: 'OPTIMAL',
  },
  {
    id: '3',
    name: 'Pino Nevado Glaciar',
    heightVariant: '2.40m',
    unitsSold: 22,
    priceCOP: 520000,
    stockRemaining: 0,
    burnRatePerDay: 4,
    status: 'OUT_OF_STOCK',
  },
  {
    id: '4',
    name: 'Fibra Cascada Multicolor',
    heightVariant: '2.10m',
    unitsSold: 18,
    priceCOP: 490000,
    stockRemaining: 5,
    burnRatePerDay: 2,
    status: 'LOW_STOCK',
  },
];

export function CriticalStockList({ items }: CriticalStockListProps) {
  const displayItems = items !== undefined ? items : DEFAULT_DEMAND_ITEMS;

  return (
    <div className="rounded-2xl bg-[#081a13] border border-white/5 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] p-4 sm:p-5 flex flex-col justify-between mt-4">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
        <div>
          <h2 className="text-white text-sm font-semibold tracking-wide">
            Top Árboles en Demanda
          </h2>
          <p className="text-[11px] text-[#94a3b8] mt-0.5">
            Velocidad de venta y balance crítico de bodega
          </p>
        </div>
        <span className="text-[11px] font-medium text-[#8ca398] bg-white/5 px-2 py-0.5 rounded-md">
          Stock en Bodega
        </span>
      </div>

      {/* LISTADO DE ÁRBOLES */}
      <div className="space-y-1 divide-y divide-white/5 max-h-[290px] overflow-y-auto no-scrollbar">
        {displayItems.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No hay árboles registrados o vendidos en este período.
          </p>
        ) : (
          displayItems.map((tree) => {
            const isAgotado = tree.status === 'OUT_OF_STOCK' || tree.stockRemaining <= 0;
            const isCritical = tree.status === 'CRITICAL' || (!isAgotado && tree.stockRemaining <= 5);
            const isLow = tree.status === 'LOW_STOCK' || (!isAgotado && !isCritical && tree.stockRemaining <= 10);

            return (
              <div
                key={tree.id}
                className="flex items-center justify-between py-2.5 px-1 hover:bg-[#123427]/40 rounded-xl transition-colors"
              >
                {/* ICONO Y DETALLES */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isAgotado
                        ? 'bg-red-950/40 border-red-500/30 text-red-400'
                        : isCritical
                        ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                        : 'bg-emerald-950/50 border-[#22c55e]/30 text-[#86efac]'
                    }`}
                  >
                    <svg
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="18"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <polygon points="12 2 2 22 22 22 12 2"></polygon>
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs sm:text-[13px] font-semibold truncate">
                        {tree.name}
                      </span>
                      <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-200">
                        {tree.heightVariant}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5 truncate">
                      {tree.unitsSold} {tree.unitsSold === 1 ? 'vendida' : 'vendidas'} • ${(tree.priceCOP || 0).toLocaleString('es-CO')}
                      {tree.burnRatePerDay ? ` • Ritmo: ${tree.burnRatePerDay} un/día` : ''}
                    </p>
                  </div>
                </div>

                {/* BADGE DE STOCK */}
                <div className="shrink-0 text-right">
                  {isAgotado ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-950/80 text-red-400 border border-red-700/60 animate-pulse">
                      ¡AGOTADO!
                    </span>
                  ) : isCritical ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/40">
                      {tree.stockRemaining} disp. (Crítico)
                    </span>
                  ) : isLow ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40">
                      {tree.stockRemaining} disp. (Últimos)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-[#4ade80] border border-[#22c55e]/30">
                      {tree.stockRemaining} disp.
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
