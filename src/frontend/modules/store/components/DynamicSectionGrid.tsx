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
      className={`w-full py-8 sm:py-12 ${index % 2 === 1 ? 'bg-[#f5f3ef]/80' : 'bg-[#fbf9f5]'}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-12">
        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-3 mb-4 sm:mb-6 border-b border-[#e4e2de] pb-3 sm:pb-4">
          <div>
            {section.badgeText && (
              <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#b90d1c]"></span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#002718] font-bold">
                  {section.badgeText}
                </span>
              </div>
            )}
            <h2 className="font-serif text-xl sm:text-3xl text-[#002718] font-bold">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-xs sm:text-sm text-[#414943] mt-0.5">{section.subtitle}</p>
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-[#414943]">
            {filteredProducts.length} artículo(s) disponibles
          </span>
        </div>

        {/* SUBCATEGORÍAS FILTERABLE_CHIPS */}
        {section.subcategories && section.subcategories.length > 0 && (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-4 mb-3 sm:mb-4 no-scrollbar">
            <button
              onClick={() => setActiveSubcatSlug('all')}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                activeSubcatSlug === 'all'
                  ? 'bg-[#133e2b] text-white shadow-xs'
                  : 'bg-[#efeeea] text-[#414943] hover:text-[#002718]'
              }`}
            >
              Todos los Adornos
            </button>
            {section.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubcatSlug(sub.slug)}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  activeSubcatSlug === sub.slug
                    ? 'bg-[#133e2b] text-white shadow-xs'
                    : 'bg-[#efeeea] text-[#414943] hover:text-[#002718]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* GRILLA DE PRODUCTOS RESPONSIVE (2 Columnas en móvil, 4 en desktop) */}
        {filteredProducts.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            No hay productos disponibles en esta selección.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
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
