'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fetchApi } from '@/lib/api-client';
import { ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetchApi<{ token: string; usuario: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(res.token, res.usuario);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Credenciales de acceso no válidas. Verifique su correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarCuentaDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  const cuentasDemo = [
    { rol: 'ADMIN', email: 'admin@sifaco.ni', pass: 'admin123', nombre: 'Administrador General' },
    { rol: 'CONTADOR', email: 'contador@sifaco.ni', pass: 'contador123', nombre: 'Lic. Carlos Mendoza' },
    { rol: 'FACTURADOR', email: 'cajero@sifaco.ni', pass: 'cajero123', nombre: 'María Gutiérrez' },
    { rol: 'GESTOR_CXC', email: 'cobranza@sifaco.ni', pass: 'cobranza123', nombre: 'Roberto Silva' },
    { rol: 'COORDINADOR_EVENTOS', email: 'eventos@sifaco.ni', pass: 'eventos123', nombre: 'Elena Ramos' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Autenticación de Usuarios (RBAC)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SIFACO</h1>
          <p className="text-slate-500 text-xs">Sistema de Facturación Preimpresa, Cartera & Contabilidad DGI</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 p-3 rounded-lg text-sm border border-rose-200 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              placeholder="usuario@sifaco.ni"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md transition-colors text-sm disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>{loading ? 'Verificando...' : 'Iniciar Sesión'}</span>
          </button>
        </form>

        {/* Cuentas Demo Sugeridas */}
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Relleno Rápido para Pruebas de Roles:
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {cuentasDemo.map((item) => (
              <button
                key={item.rol}
                type="button"
                onClick={() => seleccionarCuentaDemo(item.email, item.pass)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md border transition ${
                  email === item.email
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
              >
                [{item.rol}]
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
