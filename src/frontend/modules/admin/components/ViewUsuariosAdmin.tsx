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
  Mail,
  UserCheck,
  KeyRound,
} from 'lucide-react';
import { UserRecord } from '@/types/domain.types';

export function ViewUsuariosAdmin({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [usuarios, setUsuarios] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulario nuevo usuario
  const [nombres, setNombres] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState('ADMIN');
  const [activacion2FA, setActivacion2FA] = useState(true);
  const [creating, setCreating] = useState(false);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.data);
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

  // Mostrar mensaje temporal de notificación
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Conmutar 2FA INDIVIDUALMENTE para cada usuario específico
  const handleToggle2FA = async (userId: string, currentStatus: boolean, userName: string) => {
    const nuevoEstado = !currentStatus;
    setUpdatingId(userId);

    // Actualización optimista de la interfaz
    setUsuarios((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, activacion_2fa: nuevoEstado } : u))
    );

    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          activacion_2fa: nuevoEstado,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'No se pudo actualizar el estado de 2FA');
      }

      showToast(
        nuevoEstado
          ? `2FA activado para ${userName}. Se exigirá código OTP en su próximo inicio de sesión.`
          : `2FA desactivado para ${userName}. Podrá ingresar directamente sin código OTP.`
      );
    } catch (err) {
      // Revertir estado optimista en caso de error
      setUsuarios((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, activacion_2fa: currentStatus } : u))
      );
      alert(err instanceof Error ? err.message : 'Error al actualizar 2FA del usuario');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombres.trim() || !correo.trim() || !contrasena.trim()) {
      alert('Todos los campos son obligatorios');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`/api/auth/users?id=${userId}`, { method: 'DELETE' });
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

      {/* VISTA DESKTOP: TABLA CON CONTROL DE 2FA POR USUARIO */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#e4e2de] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fbf9f5] border-b border-[#e4e2de] text-[11px] font-black uppercase tracking-wider text-[#414943]">
                <th className="py-4 px-6">Usuario & Correo</th>
                <th className="py-4 px-4">Rol</th>
                <th className="py-4 px-6 text-center">Doble Factor (2FA Individual)</th>
                <th className="py-4 px-4">Último Acceso</th>
                <th className="py-4 px-4">Fecha Creación</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2de]/60 text-xs">
              {usuarios.map((u) => {
                const esActual = u.id === currentUserId;
                const isUpdating = updatingId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-[#f5f3ef]/50 transition-colors">
                    {/* USUARIO Y CORREO */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#002718] flex items-center gap-2">
                        <span>{u.nombres_apellidos}</span>
                        {esActual && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Tú
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-gray-500">{u.correo_electronico}</span>
                    </td>

                    {/* ROL */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.rol === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
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
                            u.activacion_2fa ? 'bg-[#22c55e]' : 'bg-slate-300 hover:bg-slate-400'
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
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <ShieldCheck size={14} className="text-[#22c55e]" />
                              <span>2FA Activo</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                              <ShieldAlert size={14} className="text-amber-500" />
                              <span>Directo (Sin OTP)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ÚLTIMO LOGIN */}
                    <td className="py-4 px-4 text-gray-500 font-mono text-[11px]">
                      {u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('es-CO') : 'Sin ingresos'}
                    </td>

                    {/* FECHA CREACIÓN */}
                    <td className="py-4 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(u.fecha_creacion).toLocaleString('es-CO', {
                        dateStyle: 'medium',
                      })}
                    </td>

                    {/* ACCIONES */}
                    <td className="py-4 px-6 text-right">
                      {!esActual && (
                        <button
                          onClick={() => handleEliminarUsuario(u.id, u.nombres_apellidos)}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
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
        {usuarios.map((u) => {
          const esActual = u.id === currentUserId;
          const isUpdating = updatingId === u.id;

          return (
            <div
              key={u.id}
              className="p-4 rounded-2xl bg-white border border-[#e4e2de] shadow-xs space-y-3"
            >
              {/* ENCABEZADO DE LA TARJETA */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#002718]">{u.nombres_apellidos}</span>
                    {esActual && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        Tú
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-gray-500 block">{u.correo_electronico}</span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    u.rol === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {u.rol}
                </span>
              </div>

              {/* FILA DEL TOGGLE SWITCH 2FA INDIVIDUAL */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Doble Factor (2FA):</span>
                  <span className="text-[11px] text-gray-500">
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
                      u.activacion_2fa ? 'bg-[#22c55e]' : 'bg-slate-300'
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
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>
                  Último: {u.ultimo_login ? new Date(u.ultimo_login).toLocaleDateString('es-CO') : 'Sin ingresos'}
                </span>

                {!esActual && (
                  <button
                    onClick={() => handleEliminarUsuario(u.id, u.nombres_apellidos)}
                    className="text-red-600 font-bold hover:underline flex items-center gap-1"
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

      {/* MODAL CREAR USUARIO EN tb_users (CON SELECCIÓN INICIAL DE 2FA) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[28px] sm:rounded-[32px] max-w-md w-full p-5 sm:p-8 shadow-2xl max-h-[94vh] sm:max-h-[90vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#002718]">
                  Crear Nuevo Usuario
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500">
                  Se registrará en tb_users con hash seguro y su propia clave.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#efeeea] flex items-center justify-center text-gray-600 hover:text-black"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Nombres y Apellidos
                </label>
                <input
                  required
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ej: Carolina Sánchez"
                  className="w-full h-11 sm:h-10 px-3 rounded-xl border border-gray-200 text-base sm:text-xs focus:ring-2 focus:ring-[#133e2b]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Correo Electrónico (Login)
                </label>
                <input
                  required
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="usuario@navidaddavid.com"
                  className="w-full h-11 sm:h-10 px-3 rounded-xl border border-gray-200 text-base sm:text-xs focus:ring-2 focus:ring-[#133e2b]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Contraseña de Acceso
                </label>
                <input
                  required
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full h-11 sm:h-10 px-3 rounded-xl border border-gray-200 text-base sm:text-xs focus:ring-2 focus:ring-[#133e2b]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs bg-white"
                >
                  <option value="ADMIN">ADMIN (Acceso Total)</option>
                  <option value="OPERADOR">OPERADOR (Gestión de Ventas y Despachos)</option>
                </select>
              </div>

              {/* SELECCIÓN INDIVIDUAL DE 2FA PARA EL NUEVO USUARIO */}
              <div className="pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#f5f3ef] cursor-pointer border border-gray-200">
                  <div className="pr-3">
                    <span className="text-xs font-bold text-[#002718] block">
                      Activar Doble Factor (2FA) para este usuario
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      Si está activo, se enviará código OTP por SMTP en su inicio de sesión.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={activacion2FA}
                    onChange={(e) => setActivacion2FA(e.target.checked)}
                    className="w-5 h-5 rounded text-[#133e2b] focus:ring-[#133e2b]"
                  />
                </label>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  disabled={creating}
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#002718] hover:bg-[#133e2b] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
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
