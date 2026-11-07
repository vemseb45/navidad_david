'use client';

import React, { useState } from 'react';
import { Lock, Mail, KeyRound, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminAuthViewProps {
  onSuccess: (token: string, user: { id: string; nombres_apellidos: string; correo_electronico: string; rol: string }) => void;
  noticeMessage?: string | null;
}

export function AdminAuthView({ onSuccess, noticeMessage }: AdminAuthViewProps) {
  const [step, setStep] = useState<'CREDENTIALS' | '2FA'>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code2FA, setCode2FA] = useState('');
  const [userId, setUserId] = useState('');
  const [preAuthToken, setPreAuthToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Garantizar que NINGÚN código ni credencial sensible resida en almacenamiento local
  React.useEffect(() => {
    try {
      localStorage.removeItem('2fa_code');
      localStorage.removeItem('codigo2FA');
      localStorage.removeItem('codigo_2fa');
      localStorage.removeItem('otp_code');
      localStorage.removeItem('navidad_admin_token');
      localStorage.removeItem('navidad_admin_user');
      sessionStorage.removeItem('2fa_code');
      sessionStorage.removeItem('codigo2FA');
    } catch {
      // Ignorar fallos de acceso en modo incógnito estricto
    }
  }, []);

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
      if (!json.success) throw new Error(json.message || json.error || 'Credenciales incorrectas');

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
      const msg = err instanceof Error ? err.message : 'Código 2FA incorrecto o expirado';
      setError(msg);
      setCode2FA('');
      if (msg.includes('3 intentos permitidos') || msg.includes('invalidado')) {
        // Al agotar los 3 intentos, el código se borró de la DB; debe volver a ingresar sus credenciales
        setTimeout(() => {
          setStep('CREDENTIALS');
        }, 4000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 selection:bg-[#E5B869] selection:text-black relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 15%, #0d2c20 0%, #05140e 55%, #020806 100%)',
      }}
    >
      {/* Halos de ambientación festiva Dark Luxury */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#E5B869]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Contenedor Principal Dark Luxury */}
      <div className="relative w-full max-w-md bg-[#0a2017]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border border-white/10 ring-1 ring-[#E5B869]/25 text-white font-sans overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Línea superior dorada de acento */}
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-[#E5B869]/70 to-transparent" />

        {/* LOGO OFICIAL NAVIDAVID & ENCABEZADO */}
        <div className="text-center mb-6 sm:mb-7">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 p-1 rounded-full bg-black/60 border-2 border-[#E5B869]/60 shadow-[0_0_25px_rgba(229,184,105,0.25)] flex items-center justify-center overflow-hidden">
            <img
              src="/Logo_david.png"
              alt="Logo Oficial NaviDavid"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">NaviDavid</h1>
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#E5B869] block mt-1 font-sans">
            Panel de Control Administrativo
          </span>
        </div>

        {/* AVISOS DE NOTIFICACIÓN O EXPIRACIÓN DE SESIÓN */}
        {noticeMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-medium flex items-center gap-2.5 backdrop-blur-md shadow-sm">
            <span className="text-base shrink-0">⏳</span>
            <span className="leading-relaxed">{noticeMessage}</span>
          </div>
        )}

        {/* AVISO DE ERROR */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-medium flex items-center gap-2.5 backdrop-blur-md shadow-sm">
            <span className="text-base shrink-0">⚠</span>
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* PASO 1: CREDENCIALES (CORREO Y CONTRASEÑA) */}
        {step === 'CREDENTIALS' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-200 block mb-1.5 tracking-wide">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#E5B869] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  autoComplete="email"
                  className="w-full h-12 pl-10 pr-3 rounded-xl border border-white/15 bg-black/60 text-white placeholder-stone-500 text-sm font-medium focus:border-[#E5B869] focus:ring-2 focus:ring-[#E5B869]/30 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-200 block mb-1.5 tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#E5B869] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full h-12 pl-10 pr-3 rounded-xl border border-white/15 bg-black/60 text-white placeholder-stone-600 text-sm font-medium focus:border-[#E5B869] focus:ring-2 focus:ring-[#E5B869]/30 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#E5B869] via-[#f3cb7c] to-[#E5B869] hover:brightness-110 text-stone-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(229,184,105,0.35)] active:scale-98 disabled:opacity-50 cursor-pointer font-display mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4 text-stone-950" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* PASO 2: VERIFICACIÓN 2FA OTP */
          <form onSubmit={handle2FASubmit} className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-black/50 border border-[#E5B869]/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#E5B869]/20 border border-[#E5B869]/40 flex items-center justify-center mx-auto text-[#E5B869]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="font-display font-bold text-base text-white">Verificación en Dos Pasos (2FA)</p>
              <p className="text-xs text-stone-300 leading-relaxed">
                Ingresa el código OTP de 6 dígitos enviado a tu correo{' '}
                <strong className="text-[#E5B869] font-mono">{email}</strong>.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-300 block mb-2 text-center tracking-wide">
                Código de Seguridad (6 dígitos)
              </label>
              <div className="relative max-w-[280px] mx-auto">
                <input
                  required
                  autoFocus
                  maxLength={6}
                  type="text"
                  inputMode="numeric"
                  value={code2FA}
                  onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full h-13 rounded-xl border-2 border-[#E5B869]/70 bg-black/70 text-center font-mono text-2xl sm:text-3xl tracking-[0.35em] font-bold text-[#ffe088] placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-[#E5B869]/50 shadow-inner"
                />
              </div>
            </div>

            <button
              disabled={loading || code2FA.length < 6}
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:brightness-110 text-[#040d0a] font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(34,197,94,0.35)] active:scale-98 disabled:opacity-50 cursor-pointer font-display"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#040d0a] border-t-transparent rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ingresar al Panel</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('CREDENTIALS')}
              className="w-full text-xs font-semibold text-stone-400 hover:text-white transition-colors py-1 cursor-pointer flex items-center justify-center gap-1"
            >
              <span>← Cambiar de cuenta</span>
            </button>
          </form>
        )}

        {/* ENLACE DE RETORNO A LA TIENDA PÚBLICA */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <a
            href="/"
            className="text-xs font-medium text-stone-400 hover:text-[#E5B869] transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Volver a la Tienda Pública</span>
          </a>
        </div>
      </div>
    </div>
  );
}
