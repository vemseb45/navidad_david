'use client';

import React from 'react';
import { StoreSection } from '@/types/domain.types';

interface NavbarProps {
  sections: StoreSection[];
  activeSectionSlug: string;
  onSelectSection: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export function Navbar({
  sections,
  activeSectionSlug,
  onSelectSection,
  searchQuery,
  onSearchChange,
  cartCount,
  cartTotal,
  onOpenCart,
}: NavbarProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 shadow-[0_4px_20px_-2px_rgba(19,62,43,0.08)]">
      {/* TOP RIBBON */}
      <div className="bg-[#133e2b] text-white py-1.5 px-4 md:px-12 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-base text-[#ffe088]">park</span>
        <span>
          Envíos gratis en compras mayores a $150.000 COP o recoge tu arbolito en tienda • Cupón{' '}
          <strong className="text-[#ffe088] tracking-wider">NAVIDAVID</strong>
        </span>
      </div>

      {/* MAIN NAV */}
      <div className="h-20 bg-white/95 backdrop-blur-md px-5 md:px-12 flex items-center justify-between gap-4 border-b border-[#e4e2de]">
        {/* LOGO */}
        <a href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#002718]/20 shadow-md bg-white flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
            <img
              src="/Logo_david.png"
              alt="Logo Navidad David"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold text-[#002718] leading-none tracking-tight">
              Navidad David
            </span>
            <span className="text-[10px] text-[#b90d1c] uppercase tracking-widest mt-0.5 font-bold">
              Artisan Christmas Co.
            </span>
          </div>
        </a>

        {/* NAVEGACIÓN DINÁMICA INTELIGENTE (Auto-adaptable a secciones creadas por el admin) */}
        <nav className="hidden lg:flex items-center gap-6">
          <button
            onClick={() => onSelectSection('all')}
            className={`text-xs font-bold uppercase tracking-wider py-1 flex items-center gap-1.5 transition-colors ${
              activeSectionSlug === 'all'
                ? 'text-[#b90d1c] border-b-2 border-[#b90d1c]'
                : 'text-[#002718] hover:text-[#b90d1c]'
            }`}
          >
            <span>Todo el Catálogo</span>
          </button>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => onSelectSection(sec.slug)}
              className={`text-xs font-bold uppercase tracking-wider py-1 flex items-center gap-1.5 transition-colors ${
                activeSectionSlug === sec.slug
                  ? 'text-[#b90d1c] border-b-2 border-[#b90d1c]'
                  : 'text-[#002718] hover:text-[#b90d1c]'
              }`}
            >
              <span className="material-symbols-outlined text-base">{sec.iconName}</span>
              <span>{sec.title}</span>
            </button>
          ))}
        </nav>

        {/* BÚSQUEDA Y ACCIONES */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-52">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#414943] text-base">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar pino, fibra, luces..."
              className="w-full h-9 pl-9 pr-3 rounded-full bg-[#f5f3ef] text-xs focus:outline-none focus:ring-2 focus:ring-[#133e2b]"
            />
          </div>

          <a
            href="/admin"
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#efeeea] text-[#002718] hover:bg-[#e4e2de] transition-colors"
          >
            Panel Admin
          </a>

          <button
            onClick={onOpenCart}
            aria-label="Abrir carrito"
            className="relative p-2 rounded-full bg-[#133e2b] text-white hover:bg-[#002718] transition-all flex items-center gap-2 px-3.5 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">shopping_bag</span>
            <span className="text-xs font-bold hidden md:inline">
              ${cartTotal.toLocaleString('es-CO')}
            </span>
            <span className="w-5 h-5 rounded-full bg-[#b90d1c] text-white text-[11px] flex items-center justify-center font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
