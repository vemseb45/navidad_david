'use client';

import React from 'react';

interface CategoryItem {
  id: string;
  slug: string;
  title: string;
  desc: string;
  img: string;
  radius: string;
  tag: string;
  targetId: string;
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'cat-tradicionales',
    slug: 'arboles-tradicionales',
    title: 'Árboles Tradicionales',
    desc: 'Pinos canadienses, abetos frondosos y efecto nevado con selector de altura.',
    img: '/img/cat-arboles-tradicionales.webp',
    radius: 'rounded-[40%_60%_70%_30%/40%_50%_60%_50%]',
    tag: 'Colección Clásica',
    targetId: 'arboles-tradicionales',
  },
  {
    id: 'cat-fibra-optica',
    slug: 'arboles-fibra-optica',
    title: 'Árboles de Fibra Óptica',
    desc: 'Tecnología de micro-filamentos LED con destellos estelares sincronizados.',
    img: '/img/cat-fibra-optica.webp',
    radius: 'rounded-[50%_50%_60%_40%/50%_60%_40%_50%]',
    tag: 'Tecnología & Luces',
    targetId: 'arboles-fibra-optica',
  },
  {
    id: 'cat-accesorios',
    slug: 'accesorios-navidenos',
    title: 'Coronas & Accesorios',
    desc: 'Coronas reales, guirnaldas nevadas, esferas champagne y faldones de lujo.',
    img: '/img/cat-accesorios.webp',
    radius: 'rounded-[60%_40%_50%_50%/40%_50%_50%_60%]',
    tag: 'Decoración Artesanal',
    targetId: 'accesorios-navidenos',
  },
];

export function Categories({ onSelectCategory }: { onSelectCategory: (slug: string) => void }) {
  return (
    <section id="categorias" className="py-10 sm:py-20 bg-[#fbf9f5] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#b90d1c] mb-1 sm:mb-2 block">
            Explora por Colección Navideña
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#002718] mb-2 sm:mb-4 font-bold">
            Categorías Destacadas
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-[#ffe088] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 max-w-5xl mx-auto">
          {CATEGORIES_DATA.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.slug)}
              className="group block text-center cursor-pointer p-4 rounded-3xl bg-white border border-[#e4e2de] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <div
                className={`relative overflow-hidden ${cat.radius} aspect-square max-w-[280px] mx-auto mb-5 shadow-lg transition-transform duration-500 group-hover:scale-[1.04] bg-emerald-50`}
              >
                <img
                  alt={cat.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  src={cat.img}
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:opacity-40 transition-opacity"></div>

                <div className="absolute bottom-3 inset-x-3 text-center">
                  <span className="inline-block py-1.5 px-3 bg-white/95 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#002718] shadow-md border border-[#ffe088]/50">
                    {cat.tag}
                  </span>
                </div>
              </div>

              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#002718] group-hover:text-[#b90d1c] transition-colors">
                {cat.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
                {cat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
