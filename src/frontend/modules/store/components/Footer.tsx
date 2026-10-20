'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="bg-[#002718] text-white pt-16 pb-12 border-t-4 border-[#ffe088]">
      <div className="max-w-7xl mx-auto px-5 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* COLUMNA 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#ffe088]/40 shadow-md bg-white flex items-center justify-center p-0.5">
              <img
                src="/Logo_david.png"
                alt="Navidad David"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <span className="font-serif text-lg font-bold block text-white leading-tight">
                Navidad David
              </span>
              <span className="text-[10px] text-[#ffe088] uppercase tracking-widest font-bold">
                Artisan Christmas Co.
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Especialistas en árboles de Navidad de alta gama, tecnología en fibra óptica y adornos artesanales que transforman hogares.
          </p>
        </div>

        {/* COLUMNA 2 */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-bold text-[#ffe088] uppercase tracking-wider">
            Tienda Física & Recogida
          </h4>
          <p className="text-xs text-gray-300">
            📍 Calle 93B #11A-44, Chico Norte<br />
            Bogotá, D.C. - Colombia
          </p>
          <p className="text-xs text-[#ffe088] font-semibold">
            🎄 Modalidad "Ir por el arbolito" disponible en el checkout.
          </p>
        </div>

        {/* COLUMNA 3 */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-bold text-[#ffe088] uppercase tracking-wider">
            Atención al Cliente
          </h4>
          <ul className="text-xs text-gray-300 space-y-1.5">
            <li>📱 WhatsApp: +57 310 456 7890</li>
            <li>✉ Correo: pedidos@navidaddavid.com</li>
            <li>⏰ Lun a Sáb: 9:00 am - 8:00 pm</li>
            <li>⏰ Dom y Festivos: 10:00 am - 6:00 pm</li>
          </ul>
        </div>

        {/* COLUMNA 4: PAGOS BOLD */}
        <div className="space-y-3">
          <h4 className="font-serif text-sm font-bold text-[#ffe088] uppercase tracking-wider">
            Pagos Seguros con Bold
          </h4>
          <p className="text-xs text-gray-300">
            Transacciones encriptadas con firma SHA-256 de integridad. Aceptamos PSE, Tarjetas de Crédito y Débito.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono font-bold bg-white/10 px-3 py-2 rounded-xl text-gray-200">
            <span>🔒 Bold Checkout 100% Seguro</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
        <p>© 2026 Navidad David. Todos los derechos reservados.</p>
        <p className="text-[11px]">Next.js 16 • React 19 • PostgreSQL + Prisma • Clean Architecture</p>
      </div>
    </footer>
  );
}
