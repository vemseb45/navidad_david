'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StoreSection } from '@/types/domain.types';
import { Menu, X, Search, ShoppingBag, TreePine, Phone, Sparkles } from 'lucide-react';

interface NavbarProps {
  sections: StoreSection[];
  activeSectionSlug: string;
  onNavigateToSection: (slug: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenSearch?: () => void;
}

export function Navbar({
  sections,
  activeSectionSlug,
  onNavigateToSection,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenSearch,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (slug: string) => {
    onNavigateToSection(slug);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* TOP RIBBON INFORMATIVO FESTIVO */}
      <div className="bg-[#0b281b] border-b border-white/5 text-[#ffe088] py-1 px-3 sm:px-6 text-center text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2">
        <Sparkles className="w-3 h-3 text-[#ffe088] shrink-0 animate-pulse" />
        <span className="truncate">
          Envíos a toda Colombia • Recogida &quot;Ir por el arbolito&quot; en tienda • Cupón{' '}
          <strong className="text-white tracking-wider">NAVIDAVID</strong>
        </span>
      </div>

      {/* BARRA PRINCIPAL DARK LUXURY CHRISTMAS */}
      <div className="h-16 sm:h-20 bg-[#03170e]/95 backdrop-blur-md px-3 sm:px-6 md:px-12 flex items-center justify-between gap-2 sm:gap-4 border-b border-white/10 text-white">
        {/* BOTÓN HAMBURGUESA MÓVIL */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
            className="w-10 h-10 rounded-xl bg-[#08281a] active:bg-[#0d3b26] border border-white/10 flex items-center justify-center text-white transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* LOGO OFICIAL - AL PRESIONARLO DIRIGE DIRECTAMENTE AL LOGIN ADMINISTRATIVO */}
        <Link
          href="/admin"
          title="Navidad David (Acceso Administrativo)"
          className="flex items-center gap-2 sm:gap-3 shrink-0 group focus:outline-none"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden ring-2 ring-[#ffe088]/40 shadow-md bg-white flex items-center justify-center p-0.5 group-hover:scale-105 group-hover:ring-[#22c55e] transition-all">
            <img
              src="/Logo_david.png"
              alt="Logo Navidad David"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-xl font-bold text-white leading-none tracking-tight group-hover:text-[#ffe088] transition-colors">
              Navidad David
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#ffe088] uppercase tracking-widest mt-0.5 font-bold">
              Árboles de Navidad
            </span>
          </div>
        </Link>

        {/* NAVEGACIÓN DESKTOP: REDIRIGE / DESPLAZA SIN OCULTAR CATÁLOGO */}
        <nav className="hidden lg:flex items-center gap-6">
          <button
            onClick={() => handleNavClick('all')}
            className={`text-xs font-bold uppercase tracking-wider py-1 flex items-center gap-1.5 transition-colors ${
              activeSectionSlug === 'all'
                ? 'text-[#ffe088] border-b-2 border-[#ffe088]'
                : 'text-slate-300 hover:text-[#ffe088]'
            }`}
          >
            <span>Todo el Catálogo</span>
          </button>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleNavClick(sec.slug)}
              className={`text-xs font-bold uppercase tracking-wider py-1 flex items-center gap-1.5 transition-colors ${
                activeSectionSlug === sec.slug
                  ? 'text-[#ffe088] border-b-2 border-[#ffe088]'
                  : 'text-slate-300 hover:text-[#ffe088]'
              }`}
            >
              <span className="material-symbols-outlined text-base text-[#22c55e]">{sec.iconName}</span>
              <span>{sec.title}</span>
            </button>
          ))}
        </nav>

        {/* ACCIONES DERECHA: BÚSQUEDA, ASESORÍA WHATSAPP Y CARRITO */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              aria-label="Buscar árboles y accesorios"
              title="Buscar en el catálogo"
              className="w-10 h-10 sm:w-auto sm:px-3 sm:py-2 rounded-full bg-[#08281a] hover:bg-[#0d3b26] border border-white/10 active:scale-95 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Search size={18} className="text-[#ffe088]" />
              <span className="hidden md:inline">Buscar</span>
            </button>
          )}

          {/* ASESORÍA DIRECTA POR WHATSAPP */}
          <a
            href="https://wa.me/573104567890?text=Hola%20Navidad%20David!%20Deseo%20informaci%C3%B3n%20sobre%20los%20%C3%A1rboles%20de%20Navidad."
            target="_blank"
            rel="noopener noreferrer"
            title="Asesoría personalizada por WhatsApp"
            className="hidden sm:flex text-xs font-bold px-3 py-2 rounded-full bg-[#08281a] text-[#bfedd2] hover:bg-[#0d3b26] border border-[#22c55e]/30 transition-colors items-center gap-1.5"
          >
            <Phone size={14} className="text-[#22c55e]" />
            <span>Asesoría WhatsApp</span>
          </a>

          {/* BOTÓN CARRITO ADAPTABLE AL PULGAR */}
          <button
            onClick={onOpenCart}
            aria-label={`Abrir carrito (${cartCount} productos)`}
            className="relative h-10 px-3 sm:px-3.5 rounded-full bg-[#22c55e] text-[#03170e] hover:bg-[#16a34a] active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 shadow-md font-bold"
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

      {/* MENÚ MÓVIL DESPLEGABLE DARK LUXURY CON BACKDROP */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-20 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="relative z-40 lg:hidden bg-[#03170e]/98 backdrop-blur-md border-b border-white/10 shadow-2xl animate-in slide-in-from-top duration-200 px-4 py-4 space-y-3 text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#ffe088] px-2">
            Colecciones Navideñas 2026
          </div>

          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleNavClick('all')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                activeSectionSlug === 'all'
                  ? 'bg-[#133e2b] text-[#ffe088] border border-[#ffe088]/30 shadow-xs'
                  : 'text-slate-200 hover:bg-[#08281a]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TreePine size={16} className="text-[#22c55e]" />
                <span>Todo el Catálogo</span>
              </div>
              <span className="text-[10px] opacity-75">Ver todo</span>
            </button>

            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleNavClick(sec.slug)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                  activeSectionSlug === sec.slug
                    ? 'bg-[#133e2b] text-[#ffe088] border border-[#ffe088]/30 shadow-xs'
                    : 'text-slate-200 hover:bg-[#08281a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg text-[#22c55e]">{sec.iconName}</span>
                  <span>{sec.title}</span>
                </div>
                <span className="text-[10px] opacity-75">{sec.products?.length || 0} art.</span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center gap-2">
            <a
              href="https://wa.me/573104567890?text=Hola%20Navidad%20David!%20Deseo%20informaci%C3%B3n%20sobre%20los%20%C3%A1rboles."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#08281a] text-[#bfedd2] border border-[#22c55e]/30 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Phone size={14} className="text-[#22c55e]" />
              <span>Preguntar a un Asesor por WhatsApp</span>
            </a>
          </div>
        </div>
        </>
      )}
    </header>
  );
}
