'use client';

import React from 'react';

interface HeightGuideSectionProps {
  onSelectHeight?: (height: string) => void;
}

export function HeightGuideSection({ onSelectHeight }: HeightGuideSectionProps) {
  const handleScrollToCollection = (height: string) => {
    if (onSelectHeight) onSelectHeight(height);
    const el = document.getElementById('coleccion');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full rounded-3xl md:rounded-[36px] bg-gradient-to-b from-[#181b24] to-[#0d0f14] border border-white/10 p-6 sm:p-8 md:p-14 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mb-10 sm:mb-12">
        <span className="text-brand-gold text-xs font-semibold uppercase tracking-wider block mb-2">
          Calculador de Espacio
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white">
          Guía de Alturas y Proporción para tu Hogar
        </h2>
        <p className="text-stone-300 text-sm md:text-base mt-2">
          Asegura la armonía visual perfecta entre la corona de tu árbol, la estrella superior y la altura libre de tus
          techos colombianos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 1.80m */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold font-display text-white">1.80 Metros</span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] text-stone-300 font-medium">
                Techos 2.20m - 2.40m
              </span>
            </div>
            <div className="h-36 sm:h-40 w-full rounded-xl bg-black/40 border border-white/5 flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="text-center">
                <span className="material-symbols-outlined text-brand-gold text-5xl">apartment</span>
                <p className="text-[11px] text-stone-400 mt-2">Apartamentos modernos &amp; Salas íntimas</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-stone-300 mb-6">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                <span>Diámetro basal óptimo: 105 cm</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                <span>Permite estrella superior de 25cm</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                <span>Armado fácil en menos de 4 min</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleScrollToCollection('1.80m')}
            className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white hover:text-black text-xs font-semibold transition-all text-white cursor-pointer"
          >
            Ver modelos de 1.80m
          </button>
        </div>

        {/* Card 2: 2.10m (Recomendado Familiar) */}
        <div className="glass-card rounded-2xl p-6 border-2 border-brand-gold/60 relative flex flex-col justify-between shadow-glow bg-stone-900/90">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-black text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
            Recomendado Familiar
          </div>
          <div>
            <div className="flex items-center justify-between mb-4 mt-1">
              <span className="text-2xl font-bold font-display text-white">2.10 Metros</span>
              <span className="px-2.5 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-[11px] font-medium">
                Techos 2.50m - 2.70m
              </span>
            </div>
            <div className="h-36 sm:h-40 w-full rounded-xl bg-black/40 border border-white/5 flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="text-center">
                <span className="material-symbols-outlined text-brand-gold text-5xl">cottage</span>
                <p className="text-[11px] text-stone-400 mt-2">Casas familiares &amp; Espacios amplios</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-stone-300 mb-6">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-gold text-[16px]">check_circle</span>
                <span>Diámetro basal imponente: 130 cm</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-gold text-[16px]">check_circle</span>
                <span>Capacidad para +100 adornos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-gold text-[16px]">check_circle</span>
                <span>Espacio inferior amplio para regalos</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleScrollToCollection('2.10m')}
            className="w-full py-2.5 rounded-full bg-brand-gold text-black hover:brightness-110 text-xs font-semibold transition-all shadow-md cursor-pointer"
          >
            Ver modelos de 2.10m
          </button>
        </div>

        {/* Card 3: 2.40m */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold font-display text-white">2.40 Metros</span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] text-stone-300 font-medium">
                Doble Altura (+2.80m)
              </span>
            </div>
            <div className="h-36 sm:h-40 w-full rounded-xl bg-black/40 border border-white/5 flex items-center justify-center mb-4 relative overflow-hidden">
              <div className="text-center">
                <span className="material-symbols-outlined text-brand-gold text-5xl">villa</span>
                <p className="text-[11px] text-stone-400 mt-2">Mansiones, fincas &amp; Lobbies</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-stone-300 mb-6">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                <span>Diámetro basal señorial: 155 cm</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                <span>Soporte de acero reforzado quadruple</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[16px]">check_circle</span>
                <span>Máxima presencia protagónica</span>
              </li>
            </ul>
          </div>
          <button
            onClick={() => handleScrollToCollection('2.40m')}
            className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white hover:text-black text-xs font-semibold transition-all text-white cursor-pointer"
          >
            Ver modelos de 2.40m
          </button>
        </div>
      </div>
    </section>
  );
}
