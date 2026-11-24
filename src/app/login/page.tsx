'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import { Wrench, ShieldAlert, Lock, CheckCircle2, XCircle, KeyRound, AlertTriangle } from 'lucide-react';

const ADMIN_EMAIL_AUTORIZADO = 'marktuay@gmail.com';

export default function LoginPage() {
  const [email, setEmail] = useState(ADMIN_EMAIL_AUTORIZADO);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailLimpio = email.trim().toLowerCase();

    // Verificación estricta de Modo Mantenimiento en Frontend
    if (emailLimpio !== ADMIN_EMAIL_AUTORIZADO) {
      setError(`Acceso Denegado: El sistema se encuentra en MODO MANTENIMIENTO. La cuenta '${email}' y todas las cuentas operativas están deshabilitadas. Únicamente el Super Administrador (${ADMIN_EMAIL_AUTORIZADO}) tiene acceso permitido.`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetchApi<{ token: string; usuario: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: emailLimpio, password }),
      });

      login(res.token, res.usuario);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Credenciales de acceso no válidas. Verifique su correo y contraseña de administrador.');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarCuentaAdmin = () => {
    setEmail(ADMIN_EMAIL_AUTORIZADO);
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-amber-300 w-full max-w-lg overflow-hidden space-y-0">
        
        {/* Cabecera Destacada de Modo Mantenimiento */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-6 space-y-3 text-center shadow-inner">
          <div className="inline-flex items-center space-x-2 bg-amber-900/40 border border-amber-300/40 text-amber-100 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
            <Wrench className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>MODO MANTENIMIENTO ACTIVO</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Sistema en Mantenimiento
          </h1>

          <p className="text-amber-100 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
            El acceso regular ha sido restringido temporalmente por labores técnicas y auditoría.
            <br />
            <strong className="text-white underline decoration-amber-300">
              Acceso exclusivo reservado para el Super Administrador.
            </strong>
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Mensaje de Error / Denegación */}
          {error && (
            <div className="bg-rose-50 text-rose-800 p-4 rounded-xl text-xs sm:text-sm border border-rose-300 font-semibold flex items-start space-x-3 shadow-sm animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Formulario de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico Autorizado
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-slate-50 focus:bg-white"
                  placeholder="marktuay@gmail.com"
                  required
                  autoComplete="email"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Solo la cuenta <span className="font-bold text-amber-700">{ADMIN_EMAIL_AUTORIZADO}</span> está habilitada.
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Contraseña de Administrador
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-black py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm disabled:opacity-50 flex items-center justify-center space-x-2 border-2 border-slate-800"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{loading ? 'Validando Acceso Superadmin...' : 'Acceder al Panel de Control (Admin)'}</span>
            </button>
          </form>

          {/* Estado de Cuentas en Modo Mantenimiento */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider text-center">
              Estado de Acceso por Cuentas:
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                <div className="flex items-center space-x-2 font-mono font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{ADMIN_EMAIL_AUTORIZADO}</span>
                </div>
                <span className="bg-emerald-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                  Habilitada (Admin)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-500 opacity-80">
                <div className="flex items-center space-x-2 font-mono">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Cuentas de Facturadores, Contadores, Gestores CxC</span>
                </div>
                <span className="bg-rose-100 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                  Deshabilitadas
                </span>
              </div>
            </div>

            {/* Botón de acceso rápido para pruebas admin */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={seleccionarCuentaAdmin}
                className="inline-flex items-center space-x-1.5 text-xs text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Rellenar credencial sugerida (marktuay@gmail.com / admin123)</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
