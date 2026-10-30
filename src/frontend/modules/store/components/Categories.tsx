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
    img: '/img/arbol_tradicional.png',
    cta: 'Ver Pinos Clásicos',
  },
  {
    id: 'cat-fibra-optica',
    slug: 'arboles-fibra-optica',
    title: 'Árboles de Fibra Óptica',
    desc: 'Micro-filamentos ópticos con destellos estelares multicolores y bajo consumo.',
    img: '/img/arbol_fibra.png',
    cta: 'Ver Fibra Óptica',
  },
  {
    id: 'cat-accesorios',
    slug: 'accesorios-navidenos',
    title: 'Coronas & Decoración',
    desc: 'Coronas nevadas, guirnaldas, luces microLED y faldones de terciopelo bordado.',
    img: '/img/arbol_tradicional.png',
    cta: 'Ver Accesorios',
  },
];

export function Categories({ onSelectCategory }: { onSelectCategory: (slug: string) => void }) {
  return (
    <section id="categorias" className="py-10 sm:py-14 bg-[#03170e] scroll-mt-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#08281a] border border-[#22c55e]/30 text-[#bfedd2] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
            <Sparkles size={12} className="text-[#ffe088]" />
            <span>Colecciones Navideñas 2026</span>
          </div>
          <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl text-white font-bold">
            Encuentra el Árbol Ideal para tu Hogar
          </h2>
          <p className="text-xs sm:text-sm text-[#c1c8c1] mt-1 max-w-xl mx-auto font-light">
            Selecciona una colección para ir directamente a los modelos disponibles:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group cursor-pointer p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#08281a] border border-white/10 hover:border-[#ffe088]/40 shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] w-full mx-auto mb-3.5 bg-[#02130b] shadow-inner">
                  <img
                    alt={cat.title}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
                    src={cat.img}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:opacity-40 transition-opacity"></div>
                </div>

                <h3 className="font-serif text-base sm:text-lg font-bold text-white group-hover:text-[#ffe088] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-[#c1c8c1] mt-1 leading-relaxed font-light">
                  {cat.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-[#bfedd2] group-hover:text-[#ffe088] transition-colors">
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
