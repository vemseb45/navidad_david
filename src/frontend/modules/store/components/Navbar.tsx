'use client';

import React, { useState } from 'react';
import { StoreSection } from '@/types/domain.types';
import { Menu, X, Search, ShoppingBag, Shield, TreePine, Phone, Sparkles } from 'lucide-react';

interface NavbarProps {
  sections: StoreSection[];
  activeSectionSlug: string;
  onSelectSection: (slug: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenSearch?: () => void;
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
  onOpenSearch,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (slug: string) => {
    onSelectSection(slug);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 shadow-[0_4px_20px_-2px_rgba(19,62,43,0.08)]">
      {/* TOP RIBBON COMPACTO Y RESPONSIVE */}
      <div className="bg-[#133e2b] text-white py-1 px-3 sm:px-6 text-center text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2">
        <Sparkles className="w-3 h-3 text-[#ffe088] shrink-0 animate-pulse" />
        <span className="truncate">
          Envíos gratis en compras &gt;$150.000 COP o recogida en tienda • Cupón{' '}
          <strong className="text-[#ffe088] tracking-wider">NAVIDAVID</strong>
        </span>
      </div>

      {/* MAIN NAV */}
      <div className="h-16 sm:h-20 bg-white/95 backdrop-blur-md px-3 sm:px-6 md:px-12 flex items-center justify-between gap-2 sm:gap-4 border-b border-[#e4e2de]">
        {/* BOTÓN HAMBURGUESA MÓVIL */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="w-10 h-10 rounded-xl bg-[#f5f3ef] active:bg-[#e4e2de] flex items-center justify-center text-[#002718] transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* LOGO */}
        <a href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-[#002718]/20 shadow-md bg-white flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
            <img
              src="/Logo_david.png"
              alt="Logo Navidad David"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-xl font-bold text-[#002718] leading-none tracking-tight">
              Navidad David
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#b90d1c] uppercase tracking-widest mt-0.5 font-bold">
              Artisan Christmas Co.
            </span>
          </div>
        </a>

        {/* NAVEGACIÓN DESKTOP */}
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

        {/* ACCIONES DERECHA: BÚSQUEDA, ADMIN Y CARRITO */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              aria-label="Abrir buscador predictivo"
              title="Buscar en todo el catálogo"
              className="w-10 h-10 sm:w-auto sm:px-3 sm:py-2 rounded-full bg-[#f5f3ef] hover:bg-[#efeeea] active:scale-95 text-[#002718] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Search size={18} />
              <span className="hidden md:inline">Buscar</span>
            </button>
          )}

          <a
            href="/admin"
            title="Panel de Control Administrativo"
            className="hidden sm:flex text-xs font-bold px-3 py-2 rounded-full bg-[#efeeea] text-[#002718] hover:bg-[#e4e2de] transition-colors items-center gap-1.5"
          >
            <Shield size={14} className="text-[#b90d1c]" />
            <span>Admin</span>
          </a>

          {/* BOTÓN CARRITO ADAPTABLE AL PULGAR */}
          <button
            onClick={onOpenCart}
            aria-label={`Abrir carrito (${cartCount} productos)`}
            className="relative h-10 px-3 sm:px-3.5 rounded-full bg-[#133e2b] text-white hover:bg-[#002718] active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm"
          >
            <ShoppingBag size={18} />
            <span className="text-xs font-bold hidden md:inline">
              ${cartTotal.toLocaleString('es-CO')}
            </span>
            <span className="min-w-5 h-5 px-1 rounded-full bg-[#b90d1c] text-white text-[11px] flex items-center justify-center font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE CON OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-md border-b border-[#e4e2de] shadow-xl animate-in slide-in-from-top duration-200 px-4 py-4 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2">
            Colecciones Navideñas
          </div>

          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleMobileNavClick('all')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                activeSectionSlug === 'all'
                  ? 'bg-[#133e2b] text-white shadow-xs'
                  : 'text-[#002718] hover:bg-[#f5f3ef]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TreePine size={16} />
                <span>Todo el Catálogo</span>
              </div>
              <span className="text-[10px] opacity-75">Ver todo</span>
            </button>

            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleMobileNavClick(sec.slug)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                  activeSectionSlug === sec.slug
                    ? 'bg-[#133e2b] text-white shadow-xs'
                    : 'text-[#002718] hover:bg-[#f5f3ef]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg">{sec.iconName}</span>
                  <span>{sec.title}</span>
                </div>
                <span className="text-[10px] opacity-75">{sec.products?.length || 0} art.</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#e4e2de] flex items-center justify-between gap-2">
            <a
              href="/admin"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#efeeea] text-[#002718] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#e4e2de]"
            >
              <Shield size={14} className="text-[#b90d1c]" />
              <span>Panel Administrativo (2FA)</span>
            </a>
            <a
              href="https://wa.me/573104567890"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5"
            >
              <Phone size={14} className="text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
