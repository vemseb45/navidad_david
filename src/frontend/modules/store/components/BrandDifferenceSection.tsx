'use client';

import React from 'react';

export function BrandDifferenceSection() {
  return (
    <section className="w-full scroll-mt-10" id="diferencia">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <h2 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight">
          La Diferencia Navidad David
        </h2>
        <p className="text-stone-300 text-sm md:text-base mt-3">
          No fabricamos árboles desechables. Diseñamos centros de unión familiar construidos para mantener su
          frondosidad intacta año tras año.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Memoria Volumétrica 3D */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-brand-gold/40 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold mb-6">
              <span className="material-symbols-outlined text-2xl">shape_line</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Memoria Volumétrica 3D</h3>
            <p className="text-stone-300 text-sm leading-relaxed mb-6">
              Nuestras aleaciones de alambre templado recuerdan su postura natural tras el desempaque. Despídete de
              horas abriendo ramas una por una.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-brand-gold font-semibold pt-2 border-t border-white/5">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>0% Espacios huecos visibles</span>
          </div>
        </div>

        {/* Card 2: Luz Cálida 2700K Segura */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-brand-gold/40 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 mb-6">
              <span className="material-symbols-outlined text-2xl">bolt</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Luz Cálida 2700K Segura</h3>
            <p className="text-stone-300 text-sm leading-relaxed mb-6">
              Microbombillos de grado arquitectónico frío al tacto. Seguros para niños curiosos y mascotas juguetonas con
              consumo de apenas 14W.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold pt-2 border-t border-white/5">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>25.000 horas de vida útil</span>
          </div>
        </div>

        {/* Card 3: Armado Umbrella en 5 Min */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 hover:border-brand-gold/40 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-6">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Armado Umbrella en 5 Min</h3>
            <p className="text-stone-300 text-sm leading-relaxed mb-6">
              Estructura de bisagras hidráulicas tipo paraguas. Encaja los 3 módulos del tronco y las ramas caen
              优雅mente por gravedad listas para decorar.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-200 font-semibold pt-2 border-t border-white/5">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Base metálica antirayaduras</span>
          </div>
        </div>
      </div>
    </section>
  );
}
