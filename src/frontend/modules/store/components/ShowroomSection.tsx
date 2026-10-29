'use client';

import React from 'react';

export function ShowroomSection() {
  return (
    <section
      className="w-full rounded-3xl md:rounded-[36px] overflow-hidden relative border border-white/15 p-6 sm:p-8 md:p-14 bg-gradient-to-r from-[#0d1017] via-[#151922] to-[#0c0e14] scroll-mt-10"
      id="showroom"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Showroom info */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-semibold">
            <span className="material-symbols-outlined text-[15px]">store</span>
            <span>Visita Nuestro Showroom Exclusivo</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight leading-tight">
            Siente la Magia en Vivo en Bogotá
          </h2>

          <p className="text-stone-300 text-sm md:text-base leading-relaxed">
            Ven y disfruta de un café de origen mientras admiras todos los modelos encendidos, tocas la densidad de los
            follajes y recibes asesoría de interioristas navideños.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-brand-gold text-2xl">location_on</span>
              <div>
                <p className="text-white font-semibold text-sm">Cra 15 # 119 - 42, Usaquén</p>
                <p className="text-xs text-stone-400">Bogotá, D.C. (Parqueadero privado)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-brand-gold text-2xl">local_shipping</span>
              <div>
                <p className="text-white font-semibold text-sm">Envíos Asegurados a Toda Colombia</p>
                <p className="text-xs text-stone-400">Medellín, Cali, Barranquilla y más</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: WhatsApp Contact card */}
        <div className="lg:col-span-5 flex flex-col justify-center items-start lg:items-end">
          <div className="glass-card p-6 rounded-2xl border border-white/10 w-full max-w-sm space-y-4">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">chat</span>
              <span>Asesoría Inmediata</span>
            </h4>
            <p className="text-xs text-stone-300">
              ¿Dudas con la altura o disponibilidad? Te enviamos videos reales en vivo desde la bodega.
            </p>
            <a
              className="w-full py-3.5 px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
              href="https://wa.me/573001234567?text=Hola,%20deseo%20asesoria%20personalizada%20para%20elegir%20mi%20arbol"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Chatear con un Asesor</span>
            </a>
            <span className="text-[11px] text-stone-400 text-center block">Respuesta promedio: &lt; 3 minutos</span>
          </div>
        </div>
      </div>
    </section>
  );
}
