'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Trees,
  Layers,
  Users2,
  ShieldCheck,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';

export type AdminTab = 'inicio' | 'pedidos' | 'productos' | 'secciones' | 'clientes' | 'usuarios';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  currentUser?: {
    nombres_apellidos: string;
    correo_electronico: string;
    rol: string;
  } | null;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  newOrdersCount?: number;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
  isOpen = false,
  onClose,
  newOrdersCount = 2,
}: AdminSidebarProps) {
  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'inicio',
      label: 'Dashboard Ventas',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'pedidos',
      label: 'Ventas y Pedidos',
      icon: <ShoppingBag size={18} />,
      badge: newOrdersCount > 0 ? `+${newOrdersCount}` : undefined,
    },
    {
      id: 'productos',
      label: 'Catálogo Árboles',
      icon: <Trees size={18} />,
    },
    {
      id: 'secciones',
      label: 'Secciones e Inventario',
      icon: <Layers size={18} />,
    },
    {
      id: 'clientes',
      label: 'Clientes & Leads',
      icon: <Users2 size={18} />,
    },
    {
      id: 'usuarios',
      label: 'Configuración & 2FA',
      icon: <ShieldCheck size={18} />,
    },
  ];

  const handleTabClick = (tabId: AdminTab) => {
    onTabChange(tabId);
    if (onClose) onClose();
  };

  const handleLogoutClick = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Error cerrando sesión en servidor:', e);
    }
    onLogout();
  };

  return (
    <>
      {/* BACKDROP PARA MÓVIL Y TABLET */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-label="Cerrar menú"
        />
      )}

      {/* ASIDE SIDEBAR OFICIAL NAVIDAD DAVID (DARK LUXURY CHRISTMAS) */}
      <aside
        className={`fixed top-0 left-0 h-full w-[250px] bg-[#081a13] border-r border-white/5 text-[#8ca398] z-50 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          {/* HEADER DEL SIDEBAR CON LOGO OFICIAL */}
          <div className="h-20 px-5 flex items-center justify-between border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#15803d] to-[#166534] flex items-center justify-center text-[#fef08a] shadow-[0_4px_12px_rgba(22,101,52,0.4)] shrink-0 overflow-hidden p-0.5">
                <img
                  src="/Logo_david.png"
                  alt="Logo Navidad David"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-[15px] font-bold tracking-wide text-white leading-tight">
                  Navidad David
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#22c55e] uppercase mt-0.5">
                  Boutique & Árboles
                </span>
              </div>
            </div>

            {/* BOTÓN CERRAR EN PANTALLAS MÓVILES */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar barra lateral"
            >
              <X size={18} />
            </button>
          </div>

          {/* LISTA DE NAVEGACIÓN */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-[#22c55e]/15 to-[#22c55e]/5 text-white font-semibold border border-[#22c55e]/25 shadow-xs'
                      : 'text-[#8ca398] hover:bg-[#123427] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#22c55e]' : 'text-[#8ca398]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#dc2626] text-white font-sans text-[10px] font-bold tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* TARJETA ACCESO RÁPIDO A TIENDA PÚBLICA */}
          <div className="px-3 pt-2 pb-3 shrink-0">
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs">
              <div className="flex items-center justify-between text-[#86efac] font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-xs">
                  <Sparkles size={12} className="text-[#fef08a]" />
                  Tienda Online
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              </div>
              <p className="text-slate-400 text-[11px] mb-2 leading-relaxed">
                Temporada Alta 2026 activa. Carrito y pasarela Bold listos.
              </p>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#86efac] font-bold hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Ver catálogo público</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* BOTÓN CERRAR SESIÓN */}
          <div className="p-3 border-t border-white/5 shrink-0">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[#ffb3ad] hover:bg-red-950/40 hover:text-red-300 transition-colors text-xs font-semibold"
            >
              <LogOut size={16} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
