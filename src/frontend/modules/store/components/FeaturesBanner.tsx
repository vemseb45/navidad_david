'use client';

import React from 'react';
import { TreePine, Sparkles, Truck, ShieldCheck } from 'lucide-react';

const BRAND_PILLARS = [
  {
    icon: TreePine,
    title: 'Follaje Ultra Frondoso',
    desc: 'Pinos de alta densidad con ramas de alambre reforzado y memoria de forma.',
    color: 'text-emerald-700 bg-emerald-100/70',
  },
  {
    icon: Sparkles,
    title: 'Fibra Óptica & MicroLED',
    desc: 'Micro-filamentos luminosos con efectos de destellos estelares y bajo consumo.',
    color: 'text-amber-700 bg-amber-100/70',
  },
  {
    icon: Truck,
    title: 'Despacho o Recogida',
    desc: 'Envíos a toda Colombia o modalidad "Ir por el arbolito" en nuestra tienda.',
    color: 'text-blue-700 bg-blue-100/70',
  },
  {
    icon: ShieldCheck,
    title: 'Pagos Seguros Bold',
    desc: 'Transacciones 100% protegidas mediante PSE, tarjetas de crédito y débito.',
    color: 'text-rose-700 bg-rose-100/70',
  },
];

export function FeaturesBanner() {
  return (
    <section className="py-8 sm:py-14 bg-white border-b border-[#e4e2de]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {BRAND_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="flex flex-col sm:items-center sm:text-center gap-2.5 sm:gap-3 p-3.5 sm:p-5 rounded-2xl hover:bg-[#fbf9f5] transition-all duration-300 border border-transparent hover:border-[#e4e2de]"
              >
                <div
                  className={`w-11 h-11 sm:w-13 sm:h-13 ${pillar.color} rounded-2xl shadow-sm flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-gray-900 text-xs sm:text-base mb-1">
                    {pillar.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed font-light">
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
