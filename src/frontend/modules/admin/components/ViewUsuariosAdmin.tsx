'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Users,
  Check,
  X,
  Lock,
  Unlock,
  Globe,
  History,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react';
import { UserRecord, LogSeguridadRecord, IpBloqueadaRecord } from '@/types/domain.types';

interface ViewUsuariosAdminProps {
  currentUserId: string;
  initialUsers?: UserRecord[];
}

export function ViewUsuariosAdmin({
  currentUserId,
  initialUsers = [],
}: ViewUsuariosAdminProps) {
  const [usuarios, setUsuarios] = useState<UserRecord[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sub-pestañas: 'usuarios' (Usuarios & 2FA) | 'seguridad' (Auditoría Forense & IPs)
  const [subTab, setSubTab] = useState<'usuarios' | 'seguridad'>('usuarios');
  const [ipsBloqueadas, setIpsBloqueadas] = useState<IpBloqueadaRecord[]>([]);
  const [logsSeguridad, setLogsSeguridad] = useState<LogSeguridadRecord[]>([]);
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      setUsuarios(initialUsers);
    }
  }, [initialUsers]);

  // Formulario nuevo usuario
  const [nombres, setNombres] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('ADMIN');
  const [activacion2FA, setActivacion2FA] = useState(true);
  const [creating, setCreating] = useState(false);

  const getAuthHeaders = () => {
    return { 'Content-Type': 'application/json' };
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users', {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      const list = Array.isArray(data.data)
        ? data.data
        : data.data?.users || data.data?.usuarios || (Array.isArray(data) ? data : []);

      if (data.success && Array.isArray(list) && list.length > 0) {
        setUsuarios(list);
      }
    } catch (err) {
      console.error('Error cargando usuarios:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarSeguridad = async () => {
    setLoadingSecurity(true);
    try {
      const res = await fetch('/api/auth/security', {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.data) {
        setIpsBloqueadas(data.data.ipsBloqueadas || []);
        setLogsSeguridad(data.data.logsRecientes || []);
      }
    } catch (err) {
      console.error('Error cargando seguridad:', err);
    } finally {
      setLoadingSecurity(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
    cargarSeguridad();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggle2FA = async (userId: string, currentStatus: boolean, nombre: string) => {
    const nextStatus = !currentStatus;
    setUpdatingId(userId);

    // Actualización optimista inmediata en la UI
    setUsuarios((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, activacion_2fa: nextStatus } : u))
    );

    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          id: userId,
          activacion_2fa: nextStatus,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al actualizar estado');
      }

      showToast(
        nextStatus
          ? `2FA Activado para ${nombre}: Requerirá código OTP por correo.`
          : `2FA Desactivado para ${nombre}: Ingreso directo con contraseña.`
      );
    } catch (err) {
      // Revertir optimismo en caso de falla
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, activacion_2fa: currentStatus } : u))
      );
      alert(err instanceof Error ? err.message : 'Error al modificar 2FA');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDesbloquearUsuario = async (userId: string, nombre: string) => {
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          id: userId,
          desbloquear: true,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, esta_bloqueado: false, intentos_fallidos: 0 } : u
        )
      );
      showToast(`¡Usuario ${nombre} desbloqueado exitosamente!`);
      cargarSeguridad();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al desbloquear usuario');
    }
  };

  const handleDesbloquearIp = async (ip: string) => {
    try {
      const res = await fetch('/api/auth/security', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ ip }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setIpsBloqueadas((prev) => prev.filter((item) => item.direccion_ip !== ip));
      showToast(`¡IP ${ip} retirada de la lista negra y desbloqueada!`);
      cargarSeguridad();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al desbloquear IP');
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombres.trim() || !correo.trim() || !contrasena) return;

    setCreating(true);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          nombres_apellidos: nombres,
          correo_electronico: correo,
          contrasena,
          rol,
          activacion_2fa: activacion2FA,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showToast(`¡Usuario ${nombres} creado exitosamente!`);
      setNombres('');
      setCorreo('');
      setContrasena('');
      setIsModalOpen(false);
      cargarUsuarios();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setCreating(false);
    }
  };

  const handleEliminarUsuario = async (userId: string, nombre: string) => {
    if (userId === currentUserId) {
      alert('No puedes eliminar tu propio usuario en sesión activa');
      return;
    }

    if (!confirm(`¿Deseas eliminar permanentemente a "${nombre}"?`)) return;

    try {
      const res = await fetch(`/api/auth/users?id=${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showToast(`Usuario ${nombre} eliminado exitosamente`);
      cargarUsuarios();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar usuario');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* TOAST DE CONFIRMACIÓN */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#081a13] text-white border border-[#22c55e]/40 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 text-[#22c55e] flex items-center justify-center shrink-0">
            <Check size={14} />
          </div>
          <p className="font-medium pr-2">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-auto"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* HEADER DE LA SECCIÓN CON GUÍA Y SELECTOR DE PESTAÑAS */}
      <div className="bg-[#081a13] border border-white/10 p-5 sm:p-6 rounded-2xl shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#15803d] to-[#166534] border border-[#22c55e]/30 flex items-center justify-center text-[#fef08a] shrink-0 shadow-sm">
              <Users size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e]">
                Seguridad & Accesos • NaviDavid
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Gestión de Usuarios, 2FA & Blindaje Anti-Fuerza Bruta
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Control de credenciales, bloqueo automático tras 5 intentos fallidos y lista negra de direcciones IP.
              </p>
            </div>
          </div>

          {subTab === 'usuarios' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#040d0a] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 shrink-0"
            >
              <Plus size={16} />
              <span>Crear Usuario</span>
            </button>
          )}
        </div>

        {/* SELECTOR DE PESTAÑAS SUB-NAVEGACIÓN */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubTab('usuarios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'usuarios'
                ? 'bg-[#22c55e] text-[#040d0a] shadow-md shadow-[#22c55e]/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Users size={15} />
            <span>Usuarios & 2FA Individual</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
              {usuarios.length}
            </span>
          </button>

          <button
            onClick={() => {
              setSubTab('seguridad');
              cargarSeguridad();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'seguridad'
                ? 'bg-[#22c55e] text-[#040d0a] shadow-md shadow-[#22c55e]/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ShieldAlert size={15} />
            <span>Auditoría Forense & IPs Bloqueadas</span>
            {ipsBloqueadas.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {ipsBloqueadas.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              cargarUsuarios();
              cargarSeguridad();
            }}
            className="ml-auto p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw size={14} className={loading || loadingSecurity ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: GESTIÓN DE USUARIOS */}
      {subTab === 'usuarios' && (
        <>
          {/* VISTA DESKTOP: TABLA CON CONTROL DE 2FA POR USUARIO EN DARK LUXURY */}
          <div className="hidden md:block bg-[#081a13] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#05140e] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    <th className="py-4 px-6">Usuario & Correo</th>
                    <th className="py-4 px-4">Rol</th>
                    <th className="py-4 px-4">Estado Seguridad</th>
                    <th className="py-4 px-6 text-center">Doble Factor (2FA Individual)</th>
                    <th className="py-4 px-4">Último Acceso</th>
                    <th className="py-4 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {usuarios.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <p className="font-semibold">No se encontraron usuarios registrados.</p>
                        <p className="text-[11px] text-slate-500 mt-1">Presiona "Crear Usuario" para registrar uno nuevo.</p>
                      </td>
                    </tr>
                  )}
                  {usuarios.length === 0 && loading && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#22c55e]">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                          <span>Cargando usuarios...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  {usuarios.map((u) => {
                    const esActual = u.id === currentUserId;
                    const isUpdating = updatingId === u.id;
                    const estaBloqueado = Boolean(u.esta_bloqueado);

                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        {/* USUARIO Y CORREO */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{u.nombres_apellidos}</span>
                            {esActual && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#22c55e] border border-emerald-500/30 text-[10px] font-bold">
                                Tú
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{u.correo_electronico}</span>
                        </td>

                        {/* ROL */}
                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.rol === 'ADMIN'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {u.rol}
                          </span>
                        </td>

                        {/* ESTADO SEGURIDAD & BLOQUEO */}
                        <td className="py-4 px-4">
                          {estaBloqueado ? (
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10.5px] font-bold flex items-center gap-1.5">
                                <Lock size={12} className="text-rose-400" />
                                <span>Bloqueado ({u.intentos_fallidos || 5} fallos)</span>
                              </span>
                              <button
                                onClick={() => handleDesbloquearUsuario(u.id, u.nombres_apellidos)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[#22c55e] border border-emerald-500/40 text-[10.5px] font-bold transition-all flex items-center gap-1"
                                title="Desbloquear acceso a este usuario"
                              >
                                <Unlock size={12} />
                                <span>Desbloquear</span>
                              </button>
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10.5px] font-semibold flex items-center gap-1.5 w-max">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                              <span>Activo</span>
                            </span>
                          )}
                        </td>

                        {/* CONTROL 2FA INDIVIDUAL CON TOGGLE SWITCH */}
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={u.activacion_2fa}
                              disabled={isUpdating}
                              onClick={() => handleToggle2FA(u.id, u.activacion_2fa, u.nombres_apellidos)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                u.activacion_2fa ? 'bg-[#22c55e]' : 'bg-slate-700 hover:bg-slate-600'
                              } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                              title={`Haga clic para ${u.activacion_2fa ? 'desactivar' : 'activar'} 2FA para ${u.nombres_apellidos}`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                  u.activacion_2fa ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            <div className="w-28 text-left">
                              {u.activacion_2fa ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#22c55e]">
                                  <ShieldCheck size={14} className="text-[#22c55e]" />
                                  <span>2FA Activo</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                                  <ShieldAlert size={14} className="text-amber-400" />
                                  <span>Directo</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* ÚLTIMO LOGIN */}
                        <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                          {u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('es-CO') : 'Sin ingresos'}
                        </td>

                        {/* ACCIONES */}
                        <td className="py-4 px-6 text-right">
                          {!esActual && (
                            <button
                              onClick={() => handleEliminarUsuario(u.id, u.nombres_apellidos)}
                              className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* VISTA MÓVIL: TARJETAS RESPONSIVAS CON SWITCH 2FA TÁCTIL */}
          <div className="md:hidden space-y-3">
            {usuarios.length === 0 && !loading && (
              <div className="p-8 text-center text-slate-400 bg-[#081a13] rounded-2xl border border-white/10">
                <p className="font-semibold">No se encontraron usuarios registrados.</p>
                <p className="text-[11px] text-slate-500 mt-1">Presiona "Crear Usuario" para registrar uno nuevo.</p>
              </div>
            )}
            {usuarios.length === 0 && loading && (
              <div className="p-8 text-center text-[#22c55e] bg-[#081a13] rounded-2xl border border-white/10 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                <span>Cargando usuarios...</span>
              </div>
            )}
            {usuarios.map((u) => {
              const esActual = u.id === currentUserId;
              const isUpdating = updatingId === u.id;
              const estaBloqueado = Boolean(u.esta_bloqueado);

              return (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-[#081a13] border border-white/10 shadow-xl space-y-3 text-white"
                >
                  {/* ENCABEZADO DE LA TARJETA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{u.nombres_apellidos}</span>
                        {esActual && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#22c55e] border border-emerald-500/30 text-[9px] font-bold">
                            Tú
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block">{u.correo_electronico}</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.rol === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {u.rol}
                    </span>
                  </div>

                  {/* ALERTA DE BLOQUEO EN MÓVIL */}
                  {estaBloqueado && (
                    <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-rose-300">
                        <Lock size={14} className="shrink-0 text-rose-400" />
                        <span className="text-[11px] font-bold">Bloqueado tras 5 intentos fallidos</span>
                      </div>
                      <button
                        onClick={() => handleDesbloquearUsuario(u.id, u.nombres_apellidos)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#040d0a] text-[10px] font-bold uppercase transition-colors shrink-0"
                      >
                        Desbloquear
                      </button>
                    </div>
                  )}

                  {/* FILA DEL TOGGLE SWITCH 2FA INDIVIDUAL */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Doble Factor (2FA):</span>
                      <span className="text-[11px] text-slate-400">
                        {u.activacion_2fa ? 'Requiere OTP por correo' : 'Ingreso directo sin OTP'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={u.activacion_2fa}
                        disabled={isUpdating}
                        onClick={() => handleToggle2FA(u.id, u.activacion_2fa, u.nombres_apellidos)}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          u.activacion_2fa ? 'bg-[#22c55e]' : 'bg-slate-700'
                        } ${isUpdating ? 'opacity-50' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                            u.activacion_2fa ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* ACCIONES & FECHA */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Último: {u.ultimo_login ? new Date(u.ultimo_login).toLocaleDateString('es-CO') : 'Sin ingresos'}
                    </span>

                    {!esActual && (
                      <button
                        onClick={() => handleEliminarUsuario(u.id, u.nombres_apellidos)}
                        className="text-rose-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        <span>Eliminar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* PESTAÑA 2: AUDITORÍA FORENSE & LISTA NEGRA DE IPS BLOQUEADAS */}
      {subTab === 'seguridad' && (
        <div className="space-y-6">
          {/* TARJETAS KPI DE RESUMEN DE SEGURIDAD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#081a13] border border-white/10 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400 block">
                  Lista Negra Activa
                </span>
                <span className="font-serif text-2xl font-bold text-white mt-1 block">
                  {ipsBloqueadas.length} {ipsBloqueadas.length === 1 ? 'IP Bloqueada' : 'IPs Bloqueadas'}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Conexión cortada sin respuesta para estas IPs.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertOctagon size={24} />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#081a13] border border-white/10 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e] block">
                  Auditoría Forense
                </span>
                <span className="font-serif text-2xl font-bold text-white mt-1 block">
                  {logsSeguridad.length} Eventos Recientes
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Trazabilidad de accesos, intentos fallidos y bloqueos.
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#22c55e] shrink-0">
                <History size={24} />
              </div>
            </div>
          </div>

          {/* SECCIÓN 1: TABLA DE IPS BLOQUEADAS */}
          <div className="bg-[#081a13] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe size={18} className="text-rose-400" />
                <h3 className="font-serif text-base font-bold text-white">
                  Direcciones IP Bloqueadas en Lista Negra
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Total: {ipsBloqueadas.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#05140e] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    <th className="py-3 px-6">Dirección IP</th>
                    <th className="py-3 px-4">Motivo del Bloqueo</th>
                    <th className="py-3 px-4">Intentos Registrados</th>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-6 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {ipsBloqueadas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <ShieldCheck size={28} className="text-[#22c55e]" />
                          <p className="font-semibold text-white">No hay direcciones IP bloqueadas</p>
                          <p className="text-[11px] text-slate-400">
                            El sistema monitorea activamente intentos de fuerza bruta para aislar atacantes.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {ipsBloqueadas.map((ip) => (
                    <tr key={ip.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-rose-400">
                        {ip.direccion_ip}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {ip.motivo}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {ip.intentos_registrados} intentos
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
                        {new Date(ip.fecha_hora_bloqueo).toLocaleString('es-CO')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDesbloquearIp(ip.direccion_ip)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-[#22c55e] border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Unlock size={13} />
                          <span>Desbloquear IP</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECCIÓN 2: REGISTRO FORENSE DE SEGURIDAD RECIENTE */}
          <div className="bg-[#081a13] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History size={18} className="text-[#22c55e]" />
                <h3 className="font-serif text-base font-bold text-white">
                  Registro Forense de Eventos de Seguridad
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Últimos {logsSeguridad.length} eventos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#05140e] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                    <th className="py-3 px-6">Tipo de Evento</th>
                    <th className="py-3 px-4">Correo Intentado</th>
                    <th className="py-3 px-4">Dirección IP</th>
                    <th className="py-3 px-4">Detalles</th>
                    <th className="py-3 px-6 text-right">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {logsSeguridad.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <p className="font-semibold text-white">No hay eventos de auditoría registrados aún.</p>
                      </td>
                    </tr>
                  )}
                  {logsSeguridad.map((log) => {
                    let badgeColor = 'bg-slate-500/20 text-slate-300 border-slate-500/30';
                    if (log.tipo_evento === 'LOGIN_EXITOSO') {
                      badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                    } else if (log.tipo_evento === 'CONTRASENA_INCORRECTA') {
                      badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                    } else if (
                      log.tipo_evento === 'BLOQUEO_USUARIO' ||
                      log.tipo_evento === 'INTENTO_USUARIO_BLOQUEADO'
                    ) {
                      badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                    } else if (log.tipo_evento === 'BLOQUEO_IP' || log.tipo_evento === 'ACCESO_DENEGADO_IP') {
                      badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                    }

                    return (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}
                          >
                            {log.tipo_evento.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-white text-[11px]">
                          {log.correo_intentado}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                          {log.direccion_ip}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {log.detalles || '—'}
                        </td>
                        <td className="py-3.5 px-6 font-mono text-slate-400 text-[11px] text-right">
                          {new Date(log.fecha_hora).toLocaleString('es-CO')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR USUARIO (DARK LUXURY) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#081a13] border border-white/15 rounded-t-[28px] sm:rounded-2xl max-w-md w-full p-5 sm:p-8 shadow-2xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Crear Nuevo Usuario
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Se registrará en el sistema con credenciales protegidas y políticas de rate limit.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Nombres y Apellidos
                </label>
                <input
                  required
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ej: Carolina Sánchez"
                  className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Correo Electrónico (Login)
                </label>
                <input
                  required
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@navidaddavid.com"
                  className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Contraseña de Acceso
                </label>
                <input
                  required
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full h-10 px-3 rounded-xl border border-white/10 bg-[#0d281e] text-white placeholder-slate-500 text-xs focus:ring-1 focus:ring-[#22c55e]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-white/10 text-xs bg-[#0d281e] text-white focus:ring-1 focus:ring-[#22c55e]"
                >
                  <option value="ADMIN">ADMIN (Acceso Total)</option>
                  <option value="OPERADOR">OPERADOR (Gestión de Ventas y Despachos)</option>
                </select>
              </div>

              {/* SELECCIÓN INDIVIDUAL DE 2FA PARA EL NUEVO USUARIO */}
              <div className="pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#0d281e] cursor-pointer border border-white/10">
                  <div className="pr-3">
                    <span className="text-xs font-bold text-white block">
                      Activar Doble Factor (2FA) para este usuario
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Si está activo, se enviará código OTP por SMTP en su inicio de sesión.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={activacion2FA}
                    onChange={(e) => setActivacion2FA(e.target.checked)}
                    className="w-5 h-5 rounded text-[#22c55e] focus:ring-[#22c55e] bg-[#05140e] border-white/10"
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-2 justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  disabled={creating}
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#040d0a] text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-md"
                >
                  {creating ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
