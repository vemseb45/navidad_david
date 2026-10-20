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
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
}: AdminSidebarProps) {
  const initial = currentUser.nombres_apellidos?.charAt(0).toUpperCase() || 'A';

  const menuItems: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
    { id: 'inicio', label: 'Panel Principal (Inicio)', icon: Home },
    { id: 'productos', label: 'Gestión de Productos', icon: Package },
    { id: 'secciones', label: 'Secciones del Catálogo', icon: Layers },
    { id: 'clientes', label: 'Directorio de Clientes', icon: Users },
    { id: 'usuarios', label: 'Usuarios & 2FA (tb_users)', icon: UserCog },
  ];

  const handleLogoutClick = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Error cerrando sesión en servidor:', e);
    }
    onLogout();
  };

  return (
    <aside className="w-72 bg-white border-r border-[#e4e2de] flex flex-col h-screen sticky top-0 transition-all duration-300 z-40 shrink-0">
      {/* BRANDING CON LOGO MEJORADO */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-[#e4e2de]/60">
        <div className="w-12 h-12 rounded-xl bg-white p-1 border border-gray-100 flex items-center justify-center shadow-sm shrink-0">
          <img
            src="/Logo_david.png"
            alt="Logo Navidad David"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-serif text-lg font-bold text-[#002718] leading-tight">
            Navidad David
          </h1>
          <span className="text-[10px] font-bold text-[#b90d1c] uppercase tracking-widest">
            Control Panel • 2FA + Cookie
          </span>
        </div>
      </div>

      {/* MENÚS DE NAVEGACIÓN */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-[#414943]/70 uppercase tracking-widest mb-3">
          Módulos del Sistema
        </p>

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
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

        <div className="pt-4 mt-4 border-t border-gray-100">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-[#414943] hover:bg-[#efeeea] hover:text-[#002718] transition-all"
          >
            <Store size={18} />
            <span>Ver Tienda Online</span>
          </a>
        </div>
      </nav>

      {/* PERFIL DEL ADMINISTRADOR & LOGOUT */}
      <div className="p-4 border-t border-[#e4e2de] bg-[#fbf9f5]">
        <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-white border border-[#e4e2de]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#133e2b] text-[#ffe088] font-bold text-sm flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#002718] truncate leading-tight">
                {currentUser.nombres_apellidos}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck size={11} className="text-emerald-600" />
                <span className="text-[10px] font-mono text-gray-500 truncate block">
                  {currentUser.rol} • JWT Cookie
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
  );
}
