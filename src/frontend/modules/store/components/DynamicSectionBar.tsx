'use client';

import React from 'react';
import { StoreSection } from '@/types/domain.types';

interface DynamicSectionBarProps {
  sections: StoreSection[];
  activeSectionSlug: string;
  totalProductsCount: number;
  onSelectSection: (slug: string) => void;
}

export function DynamicSectionBar({
  sections,
  activeSectionSlug,
  totalProductsCount,
  onSelectSection,
}: DynamicSectionBarProps) {
  return (
    <section className="sticky top-[88px] sm:top-[104px] z-30 bg-[#062115]/95 backdrop-blur-md border-b border-white/10 py-2 sm:py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 flex items-center justify-between gap-1.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 py-0.5">
          {/* BOTÓN TODOS */}
          <button
            type="button"
            onClick={() => onSelectSection('all')}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
              activeSectionSlug === 'all'
                ? 'bg-[#22c55e] text-[#03170e] font-bold shadow-md ring-2 ring-[#22c55e]/30'
                : 'bg-[#08281a] text-slate-300 hover:text-white hover:bg-[#0d3b26] border border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm sm:text-base text-[#ffe088]">apps</span>
            <span>Todos los Productos</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-black/20">
              {totalProductsCount}
            </span>
          </button>

          {/* BOTONES POR SECCIÓN DINÁMICA */}
          {sections.map((sec) => {
            const isSelected = activeSectionSlug === sec.slug;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.slug)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#22c55e] text-[#03170e] font-bold shadow-md ring-2 ring-[#22c55e]/30'
                    : 'bg-[#08281a] text-slate-300 hover:text-white hover:bg-[#0d3b26] border border-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm sm:text-base text-[#ffe088]">{sec.iconName || 'park'}</span>
                <span>{sec.title}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-black/20">
                  {sec.products.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
