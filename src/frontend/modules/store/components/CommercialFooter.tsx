'use client';

import React from 'react';
import Link from 'next/link';

export function CommercialFooter() {
  return (
    <footer className="w-full pt-16 pb-8 border-t border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        {/* Col 1: Brand & Socials */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/admin" title="Panel de Administración" className="flex items-center space-x-3.5 group">
            <img
              alt="Logo Navidad David"
              className="w-12 h-12 rounded-full object-cover border-2 border-brand-gold/60 shadow-md group-hover:scale-105 transition-transform"
              src="/Logo_david_original.png"
            />
            <span className="text-xl font-bold font-display text-white tracking-tight group-hover:text-brand-gold transition-colors">
              Navidad David
            </span>
          </Link>
          <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
            Tradición, diseño de vanguardia y calidez familiar. Más de una década vistiendo los hogares más emblemáticos
            de Colombia para recibir la Navidad con amor.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">photo_camera</span>
            </a>
            <a
              href="https://navidaddavid.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sitio Web"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a
              href="mailto:contacto@navidaddavid.com"
              aria-label="Correo de contacto"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-sm">mail</span>
            </a>
          </div>
        </div>

        {/* Col 2: Colecciones */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-display">Colecciones</h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li>
              <a href="#coleccion" className="hover:text-white cursor-pointer transition-colors">
                Pinos Tradicionales Canadienses
              </a>
            </li>
            <li>
              <a href="#coleccion" className="hover:text-white cursor-pointer transition-colors">
                Árboles de Fibra Óptica Micro-LED
              </a>
            </li>
            <li>
              <a href="#coleccion" className="hover:text-white cursor-pointer transition-colors">
                Nevados Alpinos Premium
              </a>
            </li>
            <li>
              <a href="#coleccion" className="hover:text-white cursor-pointer transition-colors">
                Siluetas Slim para Apartamento
              </a>
            </li>
            <li>
              <a href="#coleccion" className="hover:text-white cursor-pointer transition-colors">
                Guirnaldas &amp; Coronas a Juego
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Garantía & Soporte */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-display">
            Garantía &amp; Soporte
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li className="hover:text-white cursor-pointer transition-colors">Garantía Estructural de 5 Años</li>
            <li className="hover:text-white cursor-pointer transition-colors">Guía de Montaje &amp; Embalaje</li>
            <li className="hover:text-white cursor-pointer transition-colors">Repuestos de Luces &amp; Bases</li>
            <li className="hover:text-white cursor-pointer transition-colors">Términos de Envío Nacional</li>
            <li className="hover:text-white cursor-pointer transition-colors">Políticas de Devolución</li>
          </ul>
        </div>

        {/* Col 4: Medios de Pago */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-display">Medios de Pago</h4>
          <div className="space-y-2 text-xs text-stone-400">
            <p className="text-stone-300 font-medium">Transacciones 100% Cifradas</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] font-bold text-white">PSE</span>
              <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] font-bold text-white">BOLD</span>
              <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] font-bold text-white">Visa</span>
              <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] font-bold text-white">Mastercard</span>
              <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] font-bold text-white">Bancolombia</span>
            </div>
            <p className="text-[11px] text-stone-500 pt-2">Pagos contraentrega disponibles en Bogotá D.C.</p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
        <div className="flex items-center gap-3">
          <span>© 2026 Navidad David S.A.S. Todos los derechos reservados.</span>
        </div>
        <div className="flex items-center gap-6">
          <a className="hover:text-white transition-colors" href="#">
            Política de Privacidad
          </a>
          <a className="hover:text-white transition-colors" href="#">
            Términos del Servicio
          </a>
          <a className="hover:text-white transition-colors" href="#">
            Aviso Legal
          </a>
        </div>
      </div>
    </footer>
  );
}
