'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { OFFICIAL_ASSETS } from '@/frontend/shared/constants';

interface CommercialHeroProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onExploreClick: () => void;
  onSelectProductCard?: (index: number) => void;
}

interface HeroBackgroundItem {
  id: number;
  image: string;
  title: string;
}

interface MiniCardItem {
  id: number;
  slideIndex: number;
  title: string;
  subtitle: string;
  image: string;
  objectPos: string;
  brightness: string;
}

// Las 4 fotos que se muestran en el fondo del Hero al mover el carrusel
const HERO_BACKGROUNDS: readonly HeroBackgroundItem[] = [
  {
    id: 0,
    image: OFFICIAL_ASSETS.HERO_FAMILY,
    title: 'Navidad David • Colección Oficial',
  },
  {
    id: 1,
    image: OFFICIAL_ASSETS.HERO_FAMILY_2,
    title: 'Pino Tradicional Frondoso',
  },
  {
    id: 2,
    image: OFFICIAL_ASSETS.HERO_FAMILY_3,
    title: 'Mágico Fibra Óptica',
  },
  {
    id: 3,
    image: OFFICIAL_ASSETS.HERO_FAMILY_4,
    title: 'Nevado Alpino Imperial',
  },
];

// Los 3 recuadros inferiores: muestran estrictamente hero_familia_2, hero_familia_3, hero_familia_4 (sin hero_familia)
const MINI_CARDS: readonly MiniCardItem[] = [
  {
    id: 1,
    slideIndex: 1,
    title: 'Pino Tradicional Frondoso',
    subtitle: 'Elegancia verde y ramas con memoria',
    image: OFFICIAL_ASSETS.HERO_FAMILY_2,
    objectPos: 'object-center',
    brightness: 'brightness-100',
  },
  {
    id: 2,
    slideIndex: 2,
    title: 'Mágico Fibra Óptica',
    subtitle: 'Tecnología y destellos estelares',
    image: OFFICIAL_ASSETS.HERO_FAMILY_3,
    objectPos: 'object-center',
    brightness: 'brightness-100',
  },
  {
    id: 3,
    slideIndex: 3,
    title: 'Nevado Alpino Imperial',
    subtitle: 'Toque invernal sin residuos',
    image: OFFICIAL_ASSETS.HERO_FAMILY_4,
    objectPos: 'object-center',
    brightness: 'brightness-100',
  },
];

export function CommercialHero({
  cartCount,
  onOpenCart,
  onOpenSearch,
  onExploreClick,
  onSelectProductCard,
}: CommercialHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Navegación en las 4 fotos del Hero
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_BACKGROUNDS.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === HERO_BACKGROUNDS.length - 1 ? 0 : prev + 1));
  };

  // Desplazar automáticamente el recuadro correspondiente en móviles
  useEffect(() => {
    const targetIdx = currentSlide === 0 ? 0 : currentSlide - 1;
    if (cardRefs.current[targetIdx]) {
      cardRefs.current[targetIdx]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentSlide]);

  return (
    <main
      id="inicio"
      className="relative w-full rounded-3xl md:rounded-[32px] overflow-hidden border border-white/10 shadow-glow bg-stone-950 aspect-auto lg:aspect-[16/10] min-h-[720px] md:min-h-[780px] lg:h-[840px] flex flex-col justify-between"
      data-purpose="commercial-hero"
    >
      {/* Background Carousel: Muestra las 4 fotos con transición suave de crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" data-purpose="hero-background-carousel">
        {HERO_BACKGROUNDS.map((bg, idx) => (
          <img
            key={bg.id}
            alt={bg.title}
            className={`absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.04] transition-all duration-1000 ease-in-out ${
              currentSlide === idx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            src={bg.image}
          />
        ))}

        {/* Deep left-to-right cinematic gradient to mirror the high contrast left side */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d10] via-[#0c0d10]/85 via-45% to-transparent z-10" />
        {/* Bottom vignette to cradle floating product cards and navigation controls */}
        <div className="absolute inset-x-0 bottom-0 h-88 bg-gradient-to-t from-[#090a0d] via-[#090a0d]/75 to-transparent z-10" />
        {/* Top subtle vignette for navigation contrast */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent z-10" />
      </div>

      {/* BEGIN: Top Navigation Bar */}
      <header
        className="relative z-30 w-full px-5 sm:px-6 md:px-10 pt-5 sm:pt-6 pb-4 flex items-center justify-between"
        data-purpose="main-header"
      >
        {/* Left: Brand Logo & Emblem (Clickable to /admin as required by AGENTS.md) */}
        <div className="flex items-center space-x-3.5">
          <Link
            href="/admin"
            title="Navidad David - Administrador"
            className="group flex items-center space-x-3 transition-transform hover:scale-105"
          >
            <img
              alt="Logo Oficial Navidad David"
              className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2 border-brand-gold/60 shadow-md"
              src={OFFICIAL_ASSETS.LOGO_ORIGINAL}
            />
            <span className="hidden sm:inline font-display font-bold text-base md:text-lg text-white tracking-tight group-hover:text-brand-gold transition-colors">
              Navidad David
            </span>
          </Link>
        </div>

        {/* Center: Primary Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-[14px] font-medium text-stone-300" data-purpose="nav-links">
          <a className="text-white font-semibold transition-colors hover:text-white" href="#inicio">
            Inicio
          </a>
          <a className="hover:text-white transition-colors" href="#coleccion">
            Árboles Tradicionales
          </a>
          <a className="hover:text-white transition-colors" href="#coleccion">
            Fibra Óptica
          </a>
          <a className="hover:text-white transition-colors" href="#diferencia">
            Nosotros
          </a>
          <a className="hover:text-white transition-colors flex items-center gap-1.5" href="#coleccion">
            <span>Colección 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          </a>
          <a className="hover:text-white transition-colors" href="#showroom">
            Contacto
          </a>
        </nav>

        {/* Right: Utility Search & Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search Pill (Interactive: opens search modal) */}
          <button
            onClick={onOpenSearch}
            className="flex items-center glass-pill rounded-full px-3.5 sm:px-4 py-2 text-stone-300 hover:text-white focus:outline-none transition-all cursor-pointer"
            aria-label="Buscar en la tienda"
          >
            <svg className="w-4 h-4 text-stone-400 sm:mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline text-xs md:text-sm text-stone-400">Buscar árbol, luces...</span>
          </button>

          {/* Shopping Cart with Counter */}
          <button
            onClick={onOpenCart}
            aria-label="Carrito de compras"
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 relative transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-brand-gold text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile Icon -> Admin Portal */}
          <Link
            href="/admin"
            aria-label="Panel Administrativo"
            title="Panel Administrativo"
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[72px] inset-x-4 z-40 glass-card rounded-2xl p-5 flex flex-col space-y-3.5 border border-white/15 shadow-2xl animate-in fade-in duration-200">
          <a
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white font-semibold text-sm py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            href="#inicio"
          >
            Inicio
          </a>
          <a
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-stone-300 hover:text-white text-sm py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            href="#coleccion"
          >
            Árboles Tradicionales
          </a>
          <a
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-stone-300 hover:text-white text-sm py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            href="#coleccion"
          >
            Fibra Óptica
          </a>
          <a
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-stone-300 hover:text-white text-sm py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            href="#diferencia"
          >
            Nosotros &amp; Calidad
          </a>
          <a
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-stone-300 hover:text-white text-sm py-2 px-3 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between"
            href="#coleccion"
          >
            <span>Colección 2026</span>
            <span className="w-2 h-2 rounded-full bg-brand-gold" />
          </a>
          <a
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-stone-300 hover:text-white text-sm py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            href="#showroom"
          >
            Showroom &amp; Contacto
          </a>
        </div>
      )}
      {/* END: Top Navigation Bar */}

      {/* BEGIN: Editorial Left Content Section */}
      <section
        className="relative z-20 px-6 md:px-12 lg:px-16 pt-4 pb-2 md:py-8 max-w-2xl"
        data-purpose="editorial-headline-block"
      >
        {/* Dynamic active category badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-brand-gold font-medium mb-3.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
          <span className="tracking-wide">{HERO_BACKGROUNDS[currentSlide].title}</span>
        </div>

        {/* Main Title */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-[62px] font-bold leading-[1.08] tracking-tight text-white drop-shadow-sm mb-4">
          Momentos&nbsp;
          <div className="inline sm:block">
            que unen
            <br className="hidden sm:inline" />
            <span className="text-stone-100 font-normal"> a tu familia</span>
          </div>
        </h1>

        {/* Subtitle description */}
        <p className="text-stone-300 text-sm sm:text-base lg:text-[17px] leading-relaxed max-w-lg font-light mb-8">
          Diseño, confort y magia artesanal para celebrar la Navidad más inolvidable junto a quienes amas, con el aroma del
          hogar y buñuelos dorados.
        </p>

        {/* Primary Call To Action Button */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onExploreClick}
            className="inline-flex items-center justify-between gap-3 bg-white text-stone-950 hover:bg-stone-100 px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-xl group transform active:scale-95 cursor-pointer font-display"
            data-purpose="primary-cta-button"
          >
            <span>Ver árboles</span>
            <span className="inline-flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1.5">
              <svg className="w-4 h-4 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          {/* Complementary pill badge */}
          <span className="text-xs text-stone-400 flex items-center gap-1.5 pl-2">
            <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Garantía de 2 años
          </span>
        </div>
      </section>
      {/* END: Editorial Left Content Section */}

      {/* BEGIN: Bottom Section - Floating Product Cards & Carousel Navigator */}
      <div
        className="relative z-20 w-full px-6 md:px-12 lg:px-16 pb-8 pt-4 flex flex-col space-y-5"
        data-purpose="floating-product-carousel-deck"
      >
        {/* Horizontal Floating Product Mini-Cards: Los 3 recuadros con hero_familia_2, hero_familia_3, hero_familia_4 */}
        <div
          className="flex md:grid md:grid-cols-3 gap-3.5 max-w-4xl overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory"
          data-purpose="product-mini-cards"
        >
          {MINI_CARDS.map((card, idx) => {
            const isActive = currentSlide === card.slideIndex;
            return (
              <div
                key={card.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => {
                  // Si ya está activo ese recuadro, alternar de vuelta al hero principal (slide 0)
                  if (currentSlide === card.slideIndex) {
                    setCurrentSlide(0);
                  } else {
                    setCurrentSlide(card.slideIndex);
                  }
                  if (onSelectProductCard) onSelectProductCard(idx);
                }}
                className={`glass-card rounded-2xl p-3 flex flex-col justify-between cursor-pointer group transition-all duration-300 w-[82vw] sm:w-[48vw] md:w-auto shrink-0 snap-center ${
                  isActive
                    ? 'border-brand-gold ring-1 ring-brand-gold/60 shadow-glow bg-[#181a20]/95'
                    : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30 bg-[#16181c]/80'
                }`}
                data-purpose="mini-card-item"
              >
                <div className="h-28 w-full rounded-xl overflow-hidden bg-stone-900/80 mb-3 relative">
                  <img
                    alt={card.title}
                    className={`w-full h-full object-cover ${card.objectPos} group-hover:scale-105 transition-transform duration-500 filter ${card.brightness}`}
                    src={card.image}
                  />
                </div>

                <div className="flex items-end justify-between gap-2 px-1">
                  <div>
                    <h2
                      className={`text-sm font-semibold tracking-tight leading-snug transition-colors ${
                        isActive ? 'text-brand-gold' : 'text-white group-hover:text-brand-gold'
                      }`}
                    >
                      {card.title}
                    </h2>
                    <p className="text-[11px] text-stone-300 mt-0.5 line-clamp-1 font-light">
                      {card.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExploreClick();
                    }}
                    title={`Ver colección de ${card.title}`}
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-gold text-black hover:brightness-110 shadow-md'
                        : 'bg-white/10 hover:bg-white text-white hover:text-black'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controles de Navegación del Carrusel con Barra Blanca de 3 Posiciones */}
        <div className="flex items-center space-x-4 pt-1 self-start sm:self-auto" data-purpose="carousel-nav">
          {/* Barra blanca de 3 segmentos que marca únicamente las 3 colecciones (slides 1, 2 y 3) */}
          <div
            className="w-20 sm:w-28 h-[2px] bg-stone-700/80 rounded-full overflow-hidden relative"
            role="progressbar"
            aria-label="Posición en las 3 colecciones"
          >
            <div
              className={`absolute top-0 bottom-0 w-1/3 bg-white rounded-full transition-all duration-300 ease-out ${
                currentSlide === 0 ? 'opacity-0' : 'opacity-100'
              }`}
              style={{
                left:
                  currentSlide === 1
                    ? '0%'
                    : currentSlide === 2
                    ? '33.333%'
                    : currentSlide === 3
                    ? '66.666%'
                    : '0%',
              }}
            />
          </div>

          {/* Botones circulares de navegación */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevSlide}
              aria-label="Foto anterior"
              title="Foto anterior"
              className="w-10 h-10 rounded-full glass-pill flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={handleNextSlide}
              aria-label="Siguiente foto"
              title="Siguiente foto"
              className="w-10 h-10 rounded-full bg-brand-gold text-black hover:bg-[#d4a352] flex items-center justify-center transition-all shadow-glow active:scale-95 cursor-pointer font-bold"
            >
              <svg className="w-4 h-4 stroke-current stroke-2" fill="none" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* END: Bottom Section */}
    </main>
  );
}
