'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export function WhatsAppFloatingButton() {
  const whatsappUrl =
    'https://wa.me/573104567890?text=' +
    encodeURIComponent('¡Hola Navidad David! 🎄 Quisiera recibir asesoría personalizada sobre los árboles de Navidad y accesorios.');

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      title="Asesoría personalizada por WhatsApp"
      className="fixed bottom-5 left-4 sm:bottom-6 sm:left-6 z-40 flex items-center gap-2 sm:gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 bg-[#25D366] text-white rounded-full shadow-2xl hover:bg-[#20ba5a] hover:scale-105 active:scale-95 transition-all duration-300 group ring-4 ring-white/60"
    >
      <MessageCircle className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
      <span className="text-xs font-bold tracking-wider uppercase hidden sm:inline">
        Asesoría Navidad David
      </span>
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
      </span>
    </a>
  );
}
