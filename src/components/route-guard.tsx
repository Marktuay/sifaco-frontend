'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { usuario, cargandoAuth } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!cargandoAuth) {
      if (!usuario && pathname !== '/login') {
        router.push('/login');
      } else if (usuario && pathname === '/login') {
        router.push('/');
      }
    }
  }, [usuario, cargandoAuth, pathname, router]);

  if (cargandoAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold text-slate-600 animate-pulse">
          Verificando credenciales y seguridad SIFACO...
        </div>
      </div>
    );
  }

  if (!usuario && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}
