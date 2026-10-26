'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { DashboardMetrics, AdminCustomerRecord, StoreSection } from '@/types/domain.types';
import { AdminAuthView } from './components/AdminAuthView';
import { AdminSidebar, AdminTab } from './components/AdminSidebar';
import { TopKpiCards } from './components/TopKpiCards';
import { SeasonSalesChart } from './components/SeasonSalesChart';
import { CategoryMixBar } from './components/CategoryMixBar';
import { CriticalStockList } from './components/CriticalStockList';
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
  const [headerSearch, setHeaderSearch] = useState('');

  // 1. SINCRONIZACIÓN DE PESTAÑAS CON LA BARRA DE URL DEL NAVEGADOR (/admin?tab=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as AdminTab | null;
      const validTabs: AdminTab[] = [
        'inicio',
        'pedidos',
        'productos',
        'secciones',
        'clientes',
        'usuarios',
      ];
      if (tabParam && validTabs.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = (params.get('tab') as AdminTab) || 'inicio';
      setActiveTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (newTab: AdminTab) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = newTab === 'inicio' ? '/admin' : `/admin?tab=${newTab}`;
      window.history.pushState({ tab: newTab }, '', url);
    }
  };

  // 2. COMPROBACIÓN DE SESIÓN (HttpOnly Cookie con fallback de token)
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
      // Ignorar error de red
    }
    localStorage.removeItem('navidad_admin_token');
    localStorage.removeItem('navidad_admin_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

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

  useEffect(() => {
    if (isAuthenticated) {
      reloadAllData();
    }
  }, [isAuthenticated, reloadAllData]);

  // Si no está autenticado, muestra la vista de Login + 2FA
  if (!isAuthenticated || !currentUser) {
    return <AdminAuthView onSuccess={handleAuthSuccess} />;
  }

  const newOrdersCount =
    metrics.executiveOverview?.activeOrdersToday || metrics.recentOrdersList?.length || 2;

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'inicio':
        return 'Dashboard de Ventas Navideñas';
      case 'pedidos':
        return 'Ventas y Despachos';
      case 'productos':
        return 'Catálogo de Árboles & Productos';
      case 'secciones':
        return 'Secciones e Inventario de Bodega';
      case 'clientes':
        return 'Directorio de Clientes & Leads';
      case 'usuarios':
        return 'Configuración & Doble Factor (2FA)';
      default:
        return 'Dashboard Administrativo';
    }
  };

  return (
    <div
      className="min-h-screen w-full flex bg-[#040d0a] text-white font-sans overflow-x-hidden relative"
      style={{
        background: 'radial-gradient(circle at 50% 10%, #0d2c20 0%, #05140e 65%, #020806 100%)',
      }}
    >
      {/* 1. ASIDE SIDEBAR IZQUIERDO (250px, colapsable en móvil) */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        newOrdersCount={newOrdersCount}
      />

      {/* 2. ÁREA DE CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[250px] min-w-0">
        {/* HEADER SUPERIOR */}
        <header className="h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-white/5 bg-[#081a13]/70 backdrop-blur-md sticky top-0 z-30">
          {/* TÍTULO Y HAMBURGUESA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-[#0d281e] border border-white/10 flex items-center justify-center text-white hover:bg-[#123427] transition-colors"
              aria-label="Abrir menú"
            >
              <Menu size={18} />
            </button>

            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>{getSectionTitle()}</span>
              </h1>
              <p className="text-[11px] text-[#94a3b8] hidden sm:block">
                Monitoreo en tiempo real de facturación, árboles vendidos y logística en Colombia.
              </p>
            </div>
          </div>

          {/* BUSCADOR & PERFIL DE USUARIO */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* INPUT DE BÚSQUEDA */}
            <div className="relative hidden md:block">
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Buscar pedidos, árboles, SKU..."
                className="w-56 lg:w-72 h-9 pl-9 pr-3 rounded-xl bg-[#0d281e]/90 border border-[#22c55e]/25 text-white placeholder:text-[#8ca398] text-xs focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e] transition-all"
              />
              <svg
                className="absolute left-3 top-2.5 text-[#22c55e]"
                fill="none"
                height="15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="15"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
              </svg>
            </div>

            {/* BADGE TEMPORADA */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eab308]/15 border border-[#eab308]/30 text-[#fde047] text-xs font-semibold">
              <Sparkles size={12} className="text-[#eab308]" />
              <span>Temporada 2026</span>
            </div>

            {/* PERFIL RÁPIDO ADMIN */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/15 bg-black/40 flex items-center justify-center p-0.5 shrink-0">
                <img
                  src="/Logo_david.png"
                  alt="Perfil Admin"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                  {currentUser.nombres_apellidos}
                </span>
                <span className="text-[10px] text-[#22c55e] font-semibold">
                  {currentUser.rol === 'ADMIN' ? 'Superadmin' : currentUser.rol}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENIDO INTERNO */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 min-w-0">
          {/* TAB 1: INICIO (DASHBOARD EJECUTIVO DE VENTAS NAVIDEÑAS) */}
          {activeTab === 'inicio' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* 3 TOP CIRCULAR METRICS CARDS */}
              <TopKpiCards overview={metrics.executiveOverview} />

              {/* FILA PRINCIPAL DE DOS COLUMNAS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* COLUMNA GRANDE (Chart.js 12 Semanas Oct-Dic) */}
                <div className="lg:col-span-8">
                  <SeasonSalesChart weeklySales={metrics.weeklySalesCurve} />
                </div>

                {/* COLUMNA PEQUEÑA (Mix de Categorías & Alertas de Stock) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <CategoryMixBar categoryMix={metrics.categoryMix} />
                  <CriticalStockList items={metrics.treeStockDemand} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VENTAS Y PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="animate-in fade-in duration-300">
              <ViewPedidosAdmin metrics={metrics} onRefresh={reloadAllData} />
            </div>
          )}

          {/* TAB 3: CATÁLOGO PRODUCTOS */}
          {activeTab === 'productos' && (
            <div className="animate-in fade-in duration-300">
              <ViewProductosAdmin sections={sections} onRefresh={reloadAllData} />
            </div>
          )}

          {/* TAB 4: SECCIONES E INVENTARIO */}
          {activeTab === 'secciones' && (
            <div className="animate-in fade-in duration-300">
              <SectionCreator sections={sections} onCreated={reloadAllData} />
            </div>
          )}

          {/* TAB 5: CLIENTES & LEADS */}
          {activeTab === 'clientes' && (
            <div className="animate-in fade-in duration-300">
              <CustomerHistory customers={customers} />
            </div>
          )}

          {/* TAB 6: CONFIGURACIÓN & 2FA */}
          {activeTab === 'usuarios' && (
            <div className="animate-in fade-in duration-300">
              <ViewUsuariosAdmin currentUserId={currentUser.id} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
