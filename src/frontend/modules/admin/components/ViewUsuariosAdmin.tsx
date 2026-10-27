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
} from 'lucide-react';
import { UserRecord } from '@/types/domain.types';

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('navidad_admin_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
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
      console.error('Error cargando usuarios de tb_users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
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

      showToast(`¡Usuario ${nombres} creado exitosamente en tb_users!`);
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

    if (!confirm(`¿Deseas eliminar permanentemente a "${nombre}" de tb_users?`)) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('navidad_admin_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/auth/users?id=${userId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      showToast(`Usuario ${nombre} eliminado de tb_users`);
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

      {/* HEADER DE LA SECCIÓN CON GUÍA CLARA DE 2FA INDIVIDUAL */}
      <div className="bg-[#081a13] border border-white/10 p-5 sm:p-6 rounded-2xl shadow-xl text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#15803d] to-[#166534] border border-[#22c55e]/30 flex items-center justify-center text-[#fef08a] shrink-0 shadow-sm">
              <Users size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e]">
                Seguridad & Accesos • tb_users
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Gestión de Usuarios & Doble Factor (2FA) Individual
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Cada usuario tiene su propio switch de 2FA independiente. Puedes activar o desactivar el código OTP por correo individualmente para cada persona.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#040d0a] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 shrink-0"
          >
            <Plus size={16} />
            <span>Crear Usuario</span>
          </button>
        </div>

        {/* PILLS EXPLICATIVAS DE LOS DOS MODOS DE 2FA */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] shrink-0" />
            <span className="text-[11.5px]">
              <strong className="text-white">Switch ON (2FA Activo):</strong> Requiere correo, contraseña y código OTP de 6 dígitos enviado por Gmail.
            </span>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <span className="text-[11.5px]">
              <strong className="text-white">Switch OFF (Ingreso Directo):</strong> El usuario inicia sesión de inmediato con solo su contraseña.
            </span>
          </div>
        </div>
      </div>

      {/* VISTA DESKTOP: TABLA CON CONTROL DE 2FA POR USUARIO EN DARK LUXURY */}
      <div className="hidden md:block bg-[#081a13] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#05140e] border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">
                <th className="py-4 px-6">Usuario & Correo</th>
                <th className="py-4 px-4">Rol</th>
                <th className="py-4 px-6 text-center">Doble Factor (2FA Individual)</th>
                <th className="py-4 px-4">Último Acceso</th>
                <th className="py-4 px-4">Fecha Creación</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {usuarios.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-semibold">No se encontraron usuarios en tb_users.</p>
                    <p className="text-[11px] text-slate-500 mt-1">Presiona "Crear Usuario" para registrar uno nuevo.</p>
                  </td>
                </tr>
              )}
              {usuarios.length === 0 && loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#22c55e]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                      <span>Cargando usuarios desde tb_users...</span>
                    </div>
                  </td>
                </tr>
              )}
              {usuarios.map((u) => {
                const esActual = u.id === currentUserId;
                const isUpdating = updatingId === u.id;

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

                    {/* FECHA CREACIÓN */}
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(u.fecha_creacion).toLocaleString('es-CO', {
                        dateStyle: 'medium',
                      })}
                    </td>

                    {/* ACCIONES */}
                    <td className="py-4 px-6 text-right">
                      {!esActual && (
                        <button
                          onClick={() => handleEliminarUsuario(u.id, u.nombres_apellidos)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Eliminar usuario de tb_users"
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
            <p className="font-semibold">No se encontraron usuarios en tb_users.</p>
            <p className="text-[11px] text-slate-500 mt-1">Presiona "Crear Usuario" para registrar uno nuevo.</p>
          </div>
        )}
        {usuarios.length === 0 && loading && (
          <div className="p-8 text-center text-[#22c55e] bg-[#081a13] rounded-2xl border border-white/10 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
            <span>Cargando usuarios desde tb_users...</span>
          </div>
        )}
        {usuarios.map((u) => {
          const esActual = u.id === currentUserId;
          const isUpdating = updatingId === u.id;

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

      {/* MODAL CREAR USUARIO EN tb_users (DARK LUXURY) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#081a13] border border-white/15 rounded-t-[28px] sm:rounded-2xl max-w-md w-full p-5 sm:p-8 shadow-2xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                  Crear Nuevo Usuario
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Se registrará en tb_users con hash seguro y su propia clave.
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
                  {creating ? 'Guardando en tb_users...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
