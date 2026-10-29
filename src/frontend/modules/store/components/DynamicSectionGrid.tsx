'use client';

import React, { useState } from 'react';
import { StoreSection, StoreProduct, StoreVariant } from '@/types/domain.types';
import { ProductCard } from '@/frontend/components/ProductCard';

interface DynamicSectionGridProps {
  section: StoreSection;
  index: number;
  onAddToCart: (product: StoreProduct, variant?: StoreVariant) => void;
  onOpenQuickView: (product: StoreProduct) => void;
}

export function DynamicSectionGrid({
  section,
  index,
  onAddToCart,
  onOpenQuickView,
}: DynamicSectionGridProps) {
  const [activeSubcatSlug, setActiveSubcatSlug] = useState<string>('all');

  const filteredProducts = section.products.filter((p) => {
    if (activeSubcatSlug === 'all') return true;
    return p.subcategorySlug === activeSubcatSlug;
  });

  return (
    <section
      id={section.slug}
      className={`w-full py-6 sm:py-14 scroll-mt-28 sm:scroll-mt-36 text-white ${
        index % 2 === 1 ? 'bg-[#041d12]/60' : 'bg-[#03170e]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 md:px-12">
        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 sm:gap-3 mb-3.5 sm:mb-6 border-b border-white/10 pb-2.5 sm:pb-4">
          <div>
            {section.badgeText && (
              <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                <span className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-[#ef4444]"></span>
                <span className="text-[9px] sm:text-[11px] uppercase tracking-widest text-[#ffe088] font-bold">
                  {section.badgeText}
                </span>
              </div>
            )}
            <h2 className="font-serif text-lg sm:text-3xl text-white font-bold">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-[11px] sm:text-sm text-[#c1c8c1] mt-0.5 font-light">{section.subtitle}</p>
            )}
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-[#ffe088]">
            {filteredProducts.length} artículo(s) disponibles
          </span>
        </div>

        {/* SUBCATEGORÍAS FILTERABLE_CHIPS */}
        {section.subcategories && section.subcategories.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-4 mb-3 sm:mb-4 no-scrollbar scroll-smooth">
            <button
              onClick={() => setActiveSubcatSlug('all')}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubcatSlug === 'all'
                  ? 'bg-[#22c55e] text-[#03170e] font-bold shadow-xs'
                  : 'bg-[#08281a] text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              Todos los Adornos
            </button>
            {section.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubcatSlug(sub.slug)}
                className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubcatSlug === sub.slug
                    ? 'bg-[#22c55e] text-[#03170e] font-bold shadow-xs'
                    : 'bg-[#08281a] text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* GRILLA DE PRODUCTOS RESPONSIVE (2 Columnas en móvil, 4 en desktop) */}
        {filteredProducts.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center font-light">
            No hay productos disponibles en esta selección.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onOpenQuickView={onOpenQuickView}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
