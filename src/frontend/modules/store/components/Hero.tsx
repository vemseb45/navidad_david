'use client';

import React from 'react';

export function Hero({ onExploreClick }: { onExploreClick: () => void }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#002718] via-[#133e2b] to-[#082015] text-white py-16 md:py-24 px-5 md:px-12 border-b-4 border-[#ffe088]">
      {/* DECORACIONES DE FONDO */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffe088_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#ffe088] text-xs font-semibold">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>Temporada Navideña Oficial 2026</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Viste tu hogar con la magia de <span className="text-[#ffe088] italic font-normal">Navidad David</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-200 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
            Árboles tradicionales ultra frondosos con selector de altura, pinos de fibra óptica con secuencias rítmicas y accesorios artesanales exclusivos.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
            <button
              onClick={onExploreClick}
              className="px-6 py-3.5 rounded-xl bg-[#b90d1c] hover:bg-[#930011] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-red-900/40 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">park</span>
              <span>Explorar Árboles y Catálogo</span>
            </button>

            <a
              href="#arboles-fibra-optica"
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base text-[#ffe088]">lightbulb</span>
              <span>Ver Fibra Óptica</span>
            </a>
          </div>

          {/* BENEFICIOS RÁPIDOS */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#ffe088] shrink-0 font-bold">
                ✓
              </span>
              <span>Paga con PSE o Tarjeta Bold</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#ffe088] shrink-0 font-bold">
                ✓
              </span>
              <span>Opción "Ir por el arbolito"</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#ffe088] shrink-0 font-bold">
                ✓
              </span>
              <span>Guía oficial inmediata</span>
            </div>
          </div>
        </div>

        {/* HERO BADGE / HIGHLIGHT CARD */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm rounded-3xl p-6 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-[#ffe088] tracking-widest">
                Colección Exclusiva
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#b90d1c] text-white text-[10px] font-bold">
                Artesanal
              </span>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-[#002718] flex flex-col items-center justify-center p-4 text-center border border-white/10">
              <span className="text-5xl mb-2">🎄</span>
              <p className="font-serif text-lg font-bold text-white">Pino Canadiense Nevado</p>
              <p className="text-xs text-[#ffe088] mt-1">Desde $420.000 COP en 3 alturas</p>
            </div>
            <p className="text-xs text-gray-300 text-center italic">
              "Elaborados con agujas de tacto suave y bases de acero reforzado."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
