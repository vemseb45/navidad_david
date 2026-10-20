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
      className={`w-full py-12 ${index % 2 === 1 ? 'bg-[#f5f3ef]/80' : 'bg-[#fbf9f5]'}`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-12">
        {/* HEADER DE LA SECCIÓN */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 border-b border-[#e4e2de] pb-4">
          <div>
            {section.badgeText && (
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b90d1c]"></span>
                <span className="text-[11px] uppercase tracking-widest text-[#002718] font-bold">
                  {section.badgeText}
                </span>
              </div>
            )}
            <h2 className="font-serif text-2xl sm:text-3xl text-[#002718] font-bold">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-sm text-[#414943] mt-0.5">{section.subtitle}</p>
            )}
          </div>
          <span className="text-xs font-semibold text-[#414943]">
            {filteredProducts.length} artículo(s) disponibles
          </span>
        </div>

        {/* SUBCATEGORÍAS FILTERABLE_CHIPS */}
        {section.subcategories && section.subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
            <button
              onClick={() => setActiveSubcatSlug('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeSubcatSlug === 'all'
                  ? 'bg-[#133e2b] text-white shadow-sm'
                  : 'bg-[#efeeea] text-[#414943] hover:text-[#002718]'
              }`}
            >
              Todos los Adornos
            </button>
            {section.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubcatSlug(sub.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeSubcatSlug === sub.slug
                    ? 'bg-[#133e2b] text-white shadow-sm'
                    : 'bg-[#efeeea] text-[#414943] hover:text-[#002718]'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* GRILLA DE PRODUCTOS */}
        {filteredProducts.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            No hay productos disponibles en esta selección.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
