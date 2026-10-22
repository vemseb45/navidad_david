'use client';

import React from 'react';
import { X } from 'lucide-react';

export type AdminTab = 'inicio' | 'pedidos' | 'productos' | 'secciones' | 'clientes' | 'usuarios';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  currentUser: {
    nombres_apellidos: string;
    correo_electronico: string;
    rol: string;
  };
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
    icon: string;
    badge?: string;
  }> = [
    { id: 'inicio', label: 'Panel General', icon: 'dashboard' },
    {
      id: 'pedidos',
      label: 'Ventas y Pedidos',
      icon: 'receipt_long',
      badge: newOrdersCount > 0 ? `+${newOrdersCount} nuevos` : undefined,
    },
    { id: 'productos', label: 'Catálogo Productos', icon: 'forest' },
    { id: 'secciones', label: 'Inventario y Stock', icon: 'inventory_2' },
    { id: 'clientes', label: 'Clientes & Leads', icon: 'forum' },
    { id: 'usuarios', label: 'Configuración & 2FA', icon: 'tune' },
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
      {/* BACKDROP PARA MÓVIL */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-label="Cerrar navegación"
        />
      )}

      {/* ASIDE SIDEBAR OFICIAL NAVIDAD DAVID */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#002718] text-white z-50 flex flex-col justify-between shadow-[0_12px_28px_-4px_rgba(19,62,43,0.12)] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* HEADER DEL SIDEBAR */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#133e2b]/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 ring-2 ring-[#ffe088]/40 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/Logo_david.png"
                  alt="Logo Navidad David"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight text-[#fbf9f5] leading-none">
                  Navidad David
                </span>
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#ffe088] opacity-90 mt-1">
                  Boutique Festiva
                </span>
              </div>
            </div>

            {/* BOTÓN CERRAR EN PANTALLAS MÓVILES */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-[#133e2b] transition-colors"
              aria-label="Cerrar barra lateral"
            >
              <X size={20} />
            </button>
          </div>

          {/* MODO PRODUCCIÓN ACTIVO */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#133e2b]/40 text-[#a3d1b6]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-sans text-xs font-semibold text-[#f5f3ef]">
                Modo Producción Activo
              </span>
            </div>
          </div>

          {/* MENÚ DE NAVEGACIÓN */}
          <nav className="flex-1 px-4 py-1 space-y-1 overflow-y-auto no-scrollbar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-[#133e2b] text-[#fbf9f5] font-bold shadow-sm'
                      : 'text-[#eae8e4] hover:bg-[#133e2b]/50 hover:text-[#fbf9f5]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-xl ${
                        isActive ? 'text-[#e9c349]' : 'text-[#c1c8c1]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-sans text-sm font-semibold">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#b90d1c] text-white font-sans text-[10px] font-bold tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* ACCIONES INFERIORES */}
          <div className="p-4 space-y-1 border-t border-[#133e2b]/60">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#eae8e4] hover:bg-[#133e2b] hover:text-[#fbf9f5] transition-all"
            >
              <span className="material-symbols-outlined text-xl text-[#ffe088]">storefront</span>
              <span className="font-sans text-xs font-semibold">Ver Tienda Online</span>
            </a>

            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#ffb3ad] hover:bg-[#b90d1c]/20 hover:text-[#ffdad6] transition-all text-left"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span className="font-sans text-xs font-semibold">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
