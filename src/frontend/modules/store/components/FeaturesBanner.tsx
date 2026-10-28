'use client';

import React from 'react';
import { TreePine, Sparkles, Truck, ShieldCheck } from 'lucide-react';

const BRAND_PILLARS = [
  {
    icon: TreePine,
    title: 'Follaje Ultra Frondoso',
    desc: 'Pinos de alta densidad con ramas de alambre reforzado y memoria de forma.',
    color: 'text-[#22c55e] bg-[#22c55e]/15 border border-[#22c55e]/30',
  },
  {
    icon: Sparkles,
    title: 'Fibra Óptica & MicroLED',
    desc: 'Micro-filamentos luminosos con efectos de destellos estelares y bajo consumo.',
    color: 'text-[#ffe088] bg-[#ffe088]/15 border border-[#ffe088]/30',
  },
  {
    icon: Truck,
    title: 'Despacho o Recogida',
    desc: 'Envíos a toda Colombia o modalidad "Ir por el arbolito" en nuestra tienda física.',
    color: 'text-[#38bdf8] bg-[#38bdf8]/15 border border-[#38bdf8]/30',
  },
  {
    icon: ShieldCheck,
    title: 'Pagos Seguros Bold',
    desc: 'Transacciones 100% protegidas mediante PSE, tarjetas de crédito y débito.',
    color: 'text-[#ef4444] bg-[#ef4444]/15 border border-[#ef4444]/30',
  },
];

export function FeaturesBanner() {
  return (
    <section className="py-7 sm:py-10 bg-[#062115] border-y border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {BRAND_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="flex flex-col sm:items-center sm:text-center gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#08281a]/90 border border-white/10 hover:border-[#ffe088]/40 transition-all duration-300 shadow-lg group hover:-translate-y-0.5"
              >
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 ${pillar.color} rounded-xl shadow-md flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-xs sm:text-sm mb-1 group-hover:text-[#ffe088] transition-colors">
                    {pillar.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#c1c8c1] leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
