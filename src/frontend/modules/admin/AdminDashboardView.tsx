'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { DashboardMetrics, AdminCustomerRecord, StoreSection } from '@/types/domain.types';
import { AdminAuthView } from './components/AdminAuthView';
import { AdminSidebar, AdminTab } from './components/AdminSidebar';
import { ViewInicioAdmin } from './components/ViewInicioAdmin';
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

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#f5f3ef] text-[#1b1c1a] font-sans overflow-hidden">
      {/* HEADER SUPERIOR EN MÓVIL */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#e4e2de] shadow-xs shrink-0 z-30">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Abrir menú"
          className="w-10 h-10 rounded-xl bg-[#f5f3ef] active:bg-[#e4e2de] flex items-center justify-center text-[#002718] transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#002718]/15 bg-white flex items-center justify-center shrink-0">
            <img src="/Logo_david.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="font-serif font-bold text-sm text-[#002718]">Navidad David</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#b90d1c] bg-[#b90d1c]/10 px-2.5 py-1 rounded-full">
          {activeTab}
        </span>
      </div>

      {/* SIDEBAR CON MENÚS (Estilo Barber_Tech_BF + Drawer en Móvil) */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {activeTab === 'inicio' && (
            <ViewInicioAdmin
              metrics={metrics}
              onFilterChange={handleFilterDate}
              loading={loadingMetrics}
            />
          )}

          {activeTab === 'productos' && (
            <ViewProductosAdmin
              sections={sections}
              onRefresh={reloadAllData}
            />
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
  );
}
