'use client';

import React, { useState, useEffect } from 'react';
import { UserCog, Plus, ShieldCheck, ShieldAlert, Trash2, KeyRound, Check, X } from 'lucide-react';
import { UserRecord } from '@/types/domain.types';

export function ViewUsuariosAdmin({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [usuarios, setUsuarios] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
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

      alert('¡Usuario creado exitosamente en tb_users!');
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

  const handleToggle2FA = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          activacion_2fa: !currentStatus,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      cargarUsuarios();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar 2FA');
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
      cargarUsuarios();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar usuario');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* HEADER DE LA SECCIÓN */}
      <div className="bg-white p-6 rounded-[28px] border border-[#e4e2de] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#b90d1c]">
            Seguridad & Accesos • tb_users
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#002718]">
            Gestión de Usuarios Administradores & 2FA
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Crea nuevos administradores u operadores y controla el requerimiento de doble factor de autenticación.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#133e2b] hover:bg-[#002718] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-98"
        >
          <Plus size={16} />
          <span>Crear Usuario</span>
        </button>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-[28px] border border-[#e4e2de] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fbf9f5] border-b border-[#e4e2de] text-[11px] font-black uppercase tracking-wider text-[#414943]">
                <th className="py-4 px-6">Usuario & Correo</th>
                <th className="py-4 px-4">Rol</th>
                <th className="py-4 px-4">Doble Factor (2FA)</th>
                <th className="py-4 px-4">Último Acceso</th>
                <th className="py-4 px-4">Fecha Creación (Con Hora)</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2de]/60 text-xs">
              {usuarios.map((u) => {
                const esActual = u.id === currentUserId;

                return (
                  <tr key={u.id} className="hover:bg-[#f5f3ef]/50 transition-colors">
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

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggle2FA(u.id, u.activacion_2fa)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          u.activacion_2fa
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {u.activacion_2fa ? (
                          <>
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span>2FA Activo</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert size={14} className="text-amber-600" />
                            <span>2FA Inactivo</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-gray-500 font-mono text-[11px]">
                      {u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('es-CO') : 'Sin ingresos'}
                    </td>

                    <td className="py-4 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(u.fecha_creacion).toLocaleString('es-CO', {
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })}
                    </td>

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

      {/* MODAL CREAR USUARIO EN tb_users */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#002718]">
                  Crear Nuevo Administrador
                </h3>
                <p className="text-xs text-gray-500">Se registrará en la tabla tb_users con hash seguro.</p>
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
                  placeholder="Ej: David Sánchez"
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#133e2b]"
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
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#133e2b]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Contraseña Temporal
                </label>
                <input
                  required
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Mínimo 8 caracteres..."
                  className="w-full h-10 px-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#133e2b]"
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
                  <option value="OPERADOR">OPERADOR (Gestión de Ventas)</option>
                  <option value="SUPERVISOR">SUPERVISOR (Lectura y Reportes)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f5f3ef] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activacion2FA}
                    onChange={(e) => setActivacion2FA(e.target.checked)}
                    className="rounded text-[#133e2b] focus:ring-[#133e2b]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#002718] block">
                      Activar Doble Factor de Autenticación (2FA)
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Requerirá código de 6 dígitos al iniciar sesión.
                    </span>
                  </div>
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
                  className="px-6 py-2.5 rounded-xl bg-[#133e2b] text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50"
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
