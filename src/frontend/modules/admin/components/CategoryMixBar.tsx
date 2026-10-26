'use client';

import React from 'react';
import { CategoryMixItem } from '@/types/admin-dashboard.types';

interface CategoryMixBarProps {
  items?: CategoryMixItem[];
  categoryMix?: CategoryMixItem[];
}

export function CategoryMixBar({ items, categoryMix }: CategoryMixBarProps) {
  const effectiveItems = categoryMix || items;
  const defaultItems: CategoryMixItem[] = [
    {
      key: 'trad',
      label: 'Pinos Tradicionales Frondosos',
      percentage: 46,
      amountCOP: 68200000,
      colorClass: 'bg-[#22c55e]',
      hex: '#22c55e',
    },
    {
      key: 'fibra',
      label: 'Árboles de Fibra Óptica RGB',
      percentage: 38,
      amountCOP: 56400000,
      colorClass: 'bg-[#ef4444]',
      hex: '#ef4444',
    },
    {
      key: 'luces',
      label: 'Luces LED & Guirnaldas 50m',
      percentage: 11,
      amountCOP: 16300000,
      colorClass: 'bg-[#eab308]',
      hex: '#eab308',
    },
    {
      key: 'pie',
      label: 'Pies de Árbol Terciopelo',
      percentage: 5,
      amountCOP: 7500000,
      colorClass: 'bg-[#06b6d4]',
      hex: '#06b6d4',
    },
  ];

  const list = effectiveItems && effectiveItems.length > 0 ? effectiveItems : defaultItems;

  return (
    <div className="rounded-2xl bg-[#081a13] border border-white/5 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.5)] p-4 sm:p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white text-sm font-semibold m-0">Mix de Ventas por Categoría</h2>
        <span className="text-[#22c55e] text-xs font-semibold">Temporada 2026</span>
      </div>

      {/* BARRA SEGMENTADA */}
      <div className="w-full h-2 rounded-full my-3 flex overflow-hidden bg-white/5">
        {list.map((it) => (
          <span
            key={it.key}
            style={{ width: `${it.percentage}%`, backgroundColor: it.hex }}
            title={`${it.label} ${it.percentage}%`}
            className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      {/* DESGLOSE DETALLADO */}
      <div className="space-y-2 pt-1 text-xs">
        {list.map((it) => (
          <div key={it.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: it.hex }}
              />
              <span className="text-[#cbd5e1] truncate">{it.label}</span>
            </div>
            <span className="text-white font-semibold shrink-0">
              {it.percentage}% (${it.amountCOP >= 1000000 ? (it.amountCOP / 1000000).toFixed(1) + 'M' : it.amountCOP.toLocaleString('es-CO')})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
