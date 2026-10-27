'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CategoryItem {
  id: string;
  slug: string;
  title: string;
  desc: string;
  img: string;
  cta: string;
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'cat-tradicionales',
    slug: 'arboles-tradicionales',
    title: 'Árboles Tradicionales',
    desc: 'Pinos canadienses y abetos ultra frondosos con selector de altura (1.80m a 2.40m).',
    img: '/img/cat-arboles-tradicionales.webp',
    cta: 'Ver Pinos Clásicos',
  },
  {
    id: 'cat-fibra-optica',
    slug: 'arboles-fibra-optica',
    title: 'Árboles de Fibra Óptica',
    desc: 'Micro-filamentos ópticos con destellos estelares multicolores y bajo consumo.',
    img: '/img/cat-fibra-optica.webp',
    cta: 'Ver Fibra Óptica',
  },
  {
    id: 'cat-accesorios',
    slug: 'accesorios-navidenos',
    title: 'Coronas & Decoración',
    desc: 'Coronas nevadas, guirnaldas, luces microLED y faldones de terciopelo bordado.',
    img: '/img/cat-accesorios.webp',
    cta: 'Ver Accesorios',
  },
];

export function Categories({ onSelectCategory }: { onSelectCategory: (slug: string) => void }) {
  return (
    <section id="categorias" className="py-10 sm:py-16 bg-[#fbf9f5] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#133e2b]/10 text-[#133e2b] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} className="text-[#b90d1c]" />
            <span>Colecciones Navideñas 2026</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl text-[#002718] font-bold">
            Encuentra el Árbol Ideal para tu Hogar
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-xl mx-auto">
            Selecciona una colección para ir directamente a los modelos disponibles:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#e4e2de] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] w-full mx-auto mb-4 bg-emerald-50 shadow-inner">
                  <img
                    alt={cat.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
                    src={cat.img}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:opacity-30 transition-opacity"></div>
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#002718] group-hover:text-[#b90d1c] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#f5f3ef] flex items-center justify-between text-xs font-bold text-[#133e2b] group-hover:text-[#b90d1c] transition-colors">
                <span>{cat.cta}</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
