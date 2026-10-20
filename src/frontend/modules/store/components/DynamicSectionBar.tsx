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
    <section className="sticky top-[64px] sm:top-24 z-30 bg-white/95 backdrop-blur-md border-b border-[#e4e2de] py-2 sm:py-3 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12 flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* BOTÓN TODOS */}
          <button
            onClick={() => onSelectSection('all')}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSectionSlug === 'all'
                ? 'bg-[#133e2b] text-white shadow-xs ring-1 sm:ring-2 ring-[#002718]/15'
                : 'bg-[#efeeea] text-[#414943] hover:text-[#002718] hover:bg-[#e4e2de]'
            }`}
          >
            <span className="material-symbols-outlined text-sm sm:text-base text-[#ffe088]">apps</span>
            <span>Todos los Productos</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20">
              {totalProductsCount}
            </span>
          </button>

          {/* BOTONES POR SECCIÓN DINÁMICA */}
          {sections.map((sec) => {
            const isSelected = activeSectionSlug === sec.slug;
            return (
              <button
                key={sec.id}
                onClick={() => onSelectSection(sec.slug)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#133e2b] text-white shadow-xs ring-1 sm:ring-2 ring-[#002718]/15'
                    : 'bg-[#efeeea] text-[#414943] hover:text-[#002718] hover:bg-[#e4e2de]'
                }`}
              >
                <span className="material-symbols-outlined text-sm sm:text-base">{sec.iconName || 'park'}</span>
                <span>{sec.title}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-black/10">
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
