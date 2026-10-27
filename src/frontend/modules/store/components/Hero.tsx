'use client';

import React from 'react';
import { Sparkles, TreePine, ArrowDown, MapPin } from 'lucide-react';

export function Hero({ onExploreClick }: { onExploreClick: () => void }) {
  return (
    <header className="relative pt-12 sm:pt-20 min-h-[480px] sm:min-h-[620px] h-[80vh] sm:h-[86vh] flex items-center justify-center overflow-hidden border-b-4 border-[#ffe088]">
      {/* IMAGEN DE FONDO ATMOSFÉRICA CON DEGRADADO REFINADO */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Colección Navideña Oficial Navidad David"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          src="/img/hero-navidad-david.webp"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#002718] via-[#002718]/75 to-black/60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#ffe088_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
      </div>

      {/* CONTENIDO CENTRAL */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-2 sm:mt-8">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 py-1 px-3 sm:py-1.5 sm:px-4 rounded-full bg-white/15 backdrop-blur-md border border-[#ffe088]/40 text-[10px] sm:text-xs uppercase tracking-widest mb-3 sm:mb-6 text-[#ffe088] font-bold shadow-lg max-w-[92vw]">
          <Sparkles className="w-3.5 h-3.5 text-[#ffe088] animate-pulse shrink-0" />
          <span className="truncate">Temporada Navideña 2026 • Colección Exclusiva</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight mb-2.5 sm:mb-6 leading-tight drop-shadow-md">
          Elegancia, Magia <br />
          <span className="italic font-normal text-[#ffe088]">& Tradición Navideña</span>
        </h1>

        <p className="text-gray-200 text-xs sm:text-base md:text-lg font-light mb-5 sm:mb-10 max-w-2xl mx-auto drop-shadow leading-relaxed">
          Pinos ultra frondosos con selector de altura, árboles de fibra óptica con destellos estelares sincronizados y accesorios artesanales para transformar tu hogar.
        </p>

        {/* BOTONES DE ACCIÓN RÁPIDA (Estilo Nana.col) */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center items-center max-w-md mx-auto sm:max-w-none w-full">
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3.5 bg-[#b90d1c] hover:bg-[#930011] text-white text-xs sm:text-sm uppercase tracking-widest font-bold transition-all rounded-full shadow-xl hover:shadow-red-900/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group"
          >
            <TreePine className="w-4 h-4 text-[#ffe088]" />
            <span>Explorar Colección de Árboles</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>

          <a
            href="#arboles-fibra-optica"
            className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3.5 bg-white/95 hover:bg-white text-[#002718] text-xs sm:text-sm uppercase tracking-widest font-bold transition-all rounded-full shadow-xl hover:shadow-white/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#b90d1c]" />
            <span>Línea Fibra Óptica</span>
          </a>

          <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-xs">
            <MapPin className="w-4 h-4 text-[#ffe088]" />
            <span>Retiro "Ir por el arbolito" disponible</span>
          </div>
        </div>
      </div>
    </header>
  );
}
