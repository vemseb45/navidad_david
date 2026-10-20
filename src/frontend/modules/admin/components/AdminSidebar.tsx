'use client';

import React from 'react';
import {
  Home,
  Package,
  Layers,
  Users,
  UserCog,
  Store,
  LogOut,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';

export type AdminTab = 'inicio' | 'productos' | 'secciones' | 'clientes' | 'usuarios';

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
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const initial = currentUser.nombres_apellidos?.charAt(0).toUpperCase() || 'A';

  const menuItems: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
    { id: 'inicio', label: 'Panel Principal (Inicio)', icon: Home },
    { id: 'productos', label: 'Gestión de Productos', icon: Package },
    { id: 'secciones', label: 'Secciones del Catálogo', icon: Layers },
    { id: 'clientes', label: 'Directorio de Clientes', icon: Users },
    { id: 'usuarios', label: 'Usuarios & 2FA (tb_users)', icon: UserCog },
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

      {/* ASIDE SIDEBAR RESPONSIVE */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#e4e2de] flex flex-col h-full transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } shrink-0`}
      >
        {/* BRANDING CON LOGO MEJORADO Y BOTÓN CERRAR EN MÓVIL */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#e4e2de]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 ring-2 ring-[#002718]/15 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
              <img
                src="/Logo_david.png"
                alt="Logo Navidad David"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="font-serif text-base font-bold text-[#002718] leading-tight">
                Navidad David
              </h1>
              <span className="text-[9px] font-bold text-[#b90d1c] uppercase tracking-widest">
                Control Panel • 2FA + Cookie
              </span>
            </div>
          </div>

          {/* BOTÓN CERRAR EN MÓVIL */}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Cerrar menú"
              className="lg:hidden w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* MENÚS DE NAVEGACIÓN */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-[#414943]/70 uppercase tracking-widest mb-2">
            Módulos del Sistema
          </p>

          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#133e2b] text-white shadow-md'
                    : 'text-[#414943] hover:bg-[#efeeea] hover:text-[#002718]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-[#ffe088]" />}
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-gray-100">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#414943] hover:bg-[#efeeea] hover:text-[#002718] transition-all"
            >
              <Store size={18} />
              <span>Ver Tienda Online</span>
            </a>
          </div>
        </nav>

        {/* PERFIL DEL ADMINISTRADOR & LOGOUT */}
        <div className="p-3.5 border-t border-[#e4e2de] bg-[#fbf9f5]">
          <div className="flex items-center justify-between gap-2.5 p-2 rounded-2xl bg-white border border-[#e4e2de]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#133e2b] text-[#ffe088] font-bold text-xs flex items-center justify-center shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#002718] truncate leading-tight">
                  {currentUser.nombres_apellidos}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={11} className="text-emerald-600 shrink-0" />
                  <span className="text-[9px] font-mono text-gray-500 truncate block">
                    {currentUser.rol} • 2FA Activo
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogoutClick}
              title="Cerrar Sesión Segura y Limpiar Cookie"
              className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
