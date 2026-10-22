'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { DashboardMetrics, AdminCustomerRecord, StoreSection } from '@/types/domain.types';
import { AdminAuthView } from './components/AdminAuthView';
import { AdminSidebar, AdminTab } from './components/AdminSidebar';
import { ViewInicioAdmin } from './components/ViewInicioAdmin';
import { ViewPedidosAdmin } from './components/ViewPedidosAdmin';
import { ViewProductosAdmin } from './components/ViewProductosAdmin';
import { SectionCreator } from './components/SectionCreator';
import { CustomerHistory } from './components/CustomerHistory';
import { ViewUsuariosAdmin } from './components/ViewUsuariosAdmin';

interface AdminDashboardViewProps {
  initialMetrics: DashboardMetrics;
  initialCustomers: AdminCustomerRecord[];
  initialSections: StoreSection[];
}

export function AdminDashboardView({
  initialMetrics,
  initialCustomers,
  initialSections,
}: AdminDashboardViewProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    nombres_apellidos: string;
    correo_electronico: string;
    rol: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>('inicio');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics);
  const [customers, setCustomers] = useState<AdminCustomerRecord[]>(initialCustomers);
  const [sections, setSections] = useState<StoreSection[]>(initialSections);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');

  // Comprobar autenticación en el cliente consultando la Cookie HttpOnly (/api/auth/me)
  useEffect(() => {
    const verificarSesionCookie = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const json = await res.json();
          const user = json.data?.usuario || json.user || json.usuario;
          if (json.success && user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            return;
          }
        }

        // Fallback secundario de localStorage
        const token = localStorage.getItem('navidad_admin_token');
        const userStr = localStorage.getItem('navidad_admin_user');
        if (token && userStr) {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    verificarSesionCookie();
  }, []);

  const handleAuthSuccess = (
    token: string,
    user: { id: string; nombres_apellidos: string; correo_electronico: string; rol: string }
  ) => {
    localStorage.setItem('navidad_admin_token', token);
    localStorage.setItem('navidad_admin_user', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignorar
    }
    localStorage.removeItem('navidad_admin_token');
    localStorage.removeItem('navidad_admin_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleFilterDate = useCallback(async (inicio?: string, fin?: string) => {
    setLoadingMetrics(true);
    try {
      const params = new URLSearchParams();
      if (inicio) params.append('fechaInicio', inicio);
      if (fin) params.append('fechaFin', fin);

      const res = await fetch(`/api/admin/dashboard?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMetrics(data.data.metrics);
        setCustomers(data.data.customers);
      }
    } catch (err) {
      console.error('Error filtrando métricas por fecha:', err);
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  const reloadAllData = useCallback(async () => {
    try {
      const [dashRes, catRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/catalog?admin=true'),
      ]);

      const dashData = await dashRes.json();
      const catData = await catRes.json();

      if (dashData.success) {
        setMetrics(dashData.data.metrics);
        setCustomers(dashData.data.customers);
      }
      if (catData.success) {
        setSections(catData.data);
      }
    } catch (err) {
      console.error('Error recargando dashboard:', err);
    }
  }, []);

  // Si no está autenticado, muestra la vista de Login + 2FA
  if (!isAuthenticated || !currentUser) {
    return <AdminAuthView onSuccess={handleAuthSuccess} />;
  }

  const unreadNotificationsCount = metrics.notifications?.filter((n) => !n.isRead).length || 0;

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans">
      {/* 1. ASIDE SIDEBAR OFICIAL (Desktop fijo a la izquierda, Drawer táctil en móvil) */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        newOrdersCount={metrics.recentOrdersList?.length || 0}
      />

      {/* 2. CONTENIDO PRINCIPAL DESPLAZADO 72 (w-72) EN DESKTOP */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* HEADER SUPERIOR (Diseño Oficial de Navidad David) */}
        <header className="fixed top-0 left-0 lg:left-72 right-0 h-20 bg-[#fbf9f5]/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-[#e4e2de]/60">
          {/* LADO IZQUIERDO: HAMBURGUESA MÓVIL + BUSCADOR PREDICTIVO */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden w-10 h-10 rounded-xl bg-white border border-[#e4e2de] flex items-center justify-center text-[#002718] shadow-xs active:bg-[#efeeea]"
            >
              <Menu size={20} />
            </button>

            <div className="relative w-48 sm:w-72 lg:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                search
              </span>
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Buscar pedidos, árboles, SKU o clientes..."
                className="w-full h-11 pl-10 pr-4 bg-white rounded-xl border border-[#e4e2de] font-sans text-xs sm:text-sm text-[#1b1c1a] placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#002718] focus:border-[#002718] transition-all shadow-xs"
              />
            </div>

            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5f3ef] border border-[#e4e2de]/60">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="font-sans text-xs text-[#414943] font-medium">
                Tienda Online: <strong className="text-[#1b1c1a]">Activa</strong> · Envíos al día
              </span>
            </div>
          </div>

          {/* LADO DERECHO: BADGE TEMPORADA + NOTIFICACIONES + PERFIL ADMIN */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-[#ffe088]/40 text-[#4e3d00] border border-[#ffe088]/60">
              <span className="font-sans text-[11px] font-bold tracking-wider uppercase">
                TEMPORADA 2026
              </span>
            </div>

            {/* BOTÓN DE NOTIFICACIONES CON CONTADOR */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notificaciones"
                className="relative p-2.5 rounded-xl bg-white border border-[#e4e2de] text-[#414943] hover:text-[#002718] hover:bg-[#f5f3ef] transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#b90d1c] ring-2 ring-white"></span>
                )}
              </button>

              {/* MODAL DESPLEGABLE DE NOTIFICACIONES */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#e4e2de] p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-[#efeeea] pb-2.5 mb-3">
                    <span className="font-serif text-sm font-bold text-[#002718]">
                      Notificaciones en Tiempo Real
                    </span>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto no-scrollbar">
                    {metrics.notifications && metrics.notifications.length > 0 ? (
                      metrics.notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2.5 rounded-xl bg-[#f5f3ef] hover:bg-[#efeeea] transition-colors text-xs space-y-1"
                        >
                          <p className="font-bold text-[#002718]">{n.title}</p>
                          <p className="text-[11px] text-gray-600">{n.summary}</p>
                          <span className="text-[9px] text-gray-400 block">
                            {new Date(n.createdAt).toLocaleDateString('es-CO', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-center text-gray-400 py-4">
                        No hay notificaciones pendientes.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PERFIL DEL ADMINISTRADOR */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#e4e2de]">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="font-sans text-xs font-bold text-[#002718] leading-tight truncate max-w-[120px]">
                  {currentUser.nombres_apellidos}
                </span>
                <span className="font-sans text-[10px] font-bold text-[#b90d1c] uppercase tracking-wider">
                  {currentUser.rol === 'ADMIN' ? 'Superadmin' : currentUser.rol}
                </span>
              </div>

              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[#002718]/20 shadow-xs bg-white flex items-center justify-center p-0.5 shrink-0">
                <img
                  src="/Logo_david.png"
                  alt="Perfil Admin"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
          </div>
        </header>

        {/* ÁREA DE CONTENIDO DE CADA TAB */}
        <main className="w-full pt-20 flex-1 bg-[#fbf9f5]">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
            {activeTab === 'inicio' && (
              <ViewInicioAdmin
                metrics={metrics}
                onFilterChange={handleFilterDate}
                loading={loadingMetrics}
                onNavigateToCatalog={() => setActiveTab('productos')}
              />
            )}

            {activeTab === 'pedidos' && (
              <ViewPedidosAdmin metrics={metrics} onRefresh={reloadAllData} />
            )}

            {activeTab === 'productos' && (
              <ViewProductosAdmin sections={sections} onRefresh={reloadAllData} />
            )}

            {activeTab === 'secciones' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <SectionCreator sections={sections} onCreated={reloadAllData} />
              </div>
            )}

            {activeTab === 'clientes' && (
              <div className="animate-in fade-in duration-300">
                <CustomerHistory customers={customers} />
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div className="animate-in fade-in duration-300">
                <ViewUsuariosAdmin currentUserId={currentUser.id} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
