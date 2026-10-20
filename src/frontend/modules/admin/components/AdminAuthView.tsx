'use client';

import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminAuthViewProps {
  onSuccess: (token: string, user: { id: string; nombres_apellidos: string; correo_electronico: string; rol: string }) => void;
}

export function AdminAuthView({ onSuccess }: AdminAuthViewProps) {
  const [step, setStep] = useState<'CREDENTIALS' | '2FA'>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code2FA, setCode2FA] = useState('');
  const [userId, setUserId] = useState('');
  const [preAuthToken, setPreAuthToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || json.error || 'Error al iniciar sesión');

      const payload = json.data || json;

      if (payload.requiere2FA) {
        setUserId(payload.usuarioId);
        setPreAuthToken(payload.preAuthToken);
        setCode2FA('');
        setStep('2FA');
      } else {
        onSuccess(payload.token, payload.usuario);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: userId, codigo: code2FA, preAuthToken }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || json.error || 'Código 2FA incorrecto o expirado');

      const payload = json.data || json;
      onSuccess(payload.token, payload.usuario);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código 2FA incorrecto o expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002718] via-[#093522] to-[#133e2b] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-300">
        {/* LOGO OFICIAL MEJORADO */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2.5 sm:mb-3 p-1 rounded-full bg-white shadow-md ring-2 ring-[#002718]/20 flex items-center justify-center overflow-hidden">
            <img
              src="/Logo_david.png"
              alt="Logo Oficial Navidad David"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#002718]">Navidad David</h2>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#b90d1c] block mt-0.5">
            Acceso Panel de Control • 2FA + JWT Cookie Only
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {step === 'CREDENTIALS' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Correo Electrónico (tb_users)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@navidaddavid.com"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-base sm:text-xs focus:ring-2 focus:ring-[#133e2b] focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 text-base sm:text-xs focus:ring-2 focus:ring-[#133e2b] focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full h-12 rounded-xl bg-[#133e2b] hover:bg-[#002718] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <span>Continuar a Validación 2FA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-[#f5f3ef] border border-[#133e2b]/15 text-center space-y-1.5">
              <ShieldCheck className="w-8 h-8 text-[#133e2b] mx-auto" />
              <p className="font-bold text-sm text-[#002718]">Doble Factor de Autenticación (2FA)</p>
              <p className="text-[11px] text-gray-600">
                Hemos enviado un código OTP de 6 dígitos a tu correo{' '}
                <strong className="text-[#133e2b]">{email}</strong>. Revisa tu bandeja de entrada o spam. Válido por 5 minutos.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5 text-center">
                Ingresa el código numérico de 6 dígitos
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  maxLength={6}
                  type="text"
                  value={code2FA}
                  onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full h-12 pl-10 pr-3 rounded-xl border-2 border-[#133e2b] text-center font-mono text-xl tracking-[0.3em] font-bold text-[#002718] focus:outline-none shadow-sm"
                />
              </div>
            </div>

            <button
              disabled={loading || code2FA.length < 6}
              type="submit"
              className="w-full h-12 rounded-xl bg-[#b90d1c] hover:bg-[#930011] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <span>Comprobando código...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verificar y Establecer Sesión HttpOnly</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('CREDENTIALS')}
              className="w-full text-xs font-bold text-gray-500 hover:text-black py-1"
            >
              ← Volver a ingresar usuario
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <a
            href="/"
            className="text-xs font-semibold text-gray-500 hover:text-[#133e2b] transition-colors"
          >
            ← Volver a la Tienda Pública
          </a>
        </div>
      </div>
    </div>
  );
}
