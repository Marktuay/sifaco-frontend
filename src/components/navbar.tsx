'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { RolUsuario } from '@/types';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  ShoppingBag,
  Calculator,
  Calendar,
  BarChart3,
  ShieldAlert,
  UserCheck,
  LogOut,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, logout, cargandoAuth, tienePermiso } = useAuth();

  if (pathname === '/login') {
    return (
      <header className="bg-slate-900 text-white shadow border-b border-slate-800">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/login" className="text-2xl font-black tracking-widest text-emerald-400">
            SIFACO
          </Link>
          <span className="text-xs text-slate-400 font-mono">Acceso Seguro de Usuarios</span>
        </div>
      </header>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks: { href: string; label: string; roles: RolUsuario[]; icon: React.ReactNode }[] = [
    { href: '/', label: 'Dashboard', roles: ['ADMIN', 'CONTADOR', 'FACTURADOR', 'GESTOR_CXC', 'COORDINADOR_EVENTOS'], icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/crm/clientes', label: 'Clientes', roles: ['ADMIN', 'CONTADOR', 'FACTURADOR', 'GESTOR_CXC', 'COORDINADOR_EVENTOS'], icon: <Users className="w-4 h-4" /> },
    { href: '/facturacion', label: 'Facturación', roles: ['ADMIN', 'CONTADOR', 'FACTURADOR'], icon: <FileText className="w-4 h-4" /> },
    { href: '/cartera/cxc', label: 'Cartera CxC', roles: ['ADMIN', 'CONTADOR', 'FACTURADOR', 'GESTOR_CXC'], icon: <CreditCard className="w-4 h-4" /> },
    { href: '/cartera/cxp', label: 'Compras CxP', roles: ['ADMIN', 'CONTADOR'], icon: <ShoppingBag className="w-4 h-4" /> },
    { href: '/contabilidad', label: 'Contabilidad', roles: ['ADMIN', 'CONTADOR'], icon: <Calculator className="w-4 h-4" /> },
    { href: '/eventos', label: 'Eventos', roles: ['ADMIN', 'CONTADOR', 'FACTURADOR', 'COORDINADOR_EVENTOS'], icon: <Calendar className="w-4 h-4" /> },
    { href: '/reportes/dgi', label: 'Reportes DGI', roles: ['ADMIN', 'CONTADOR'], icon: <BarChart3 className="w-4 h-4" /> },
    { href: '/auditoria', label: 'Auditoría & DRP', roles: ['ADMIN', 'CONTADOR'], icon: <ShieldAlert className="w-4 h-4" /> },
    { href: '/admin/usuarios', label: 'Usuarios', roles: ['ADMIN'], icon: <UserCheck className="w-4 h-4" /> },
  ];

  const linksVisibles = navLinks.filter((link) => tienePermiso(link.roles));

  return (
    <header className="bg-slate-900 text-white shadow border-b border-slate-800" role="banner">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        
        {/* Izquierda: Logo SIFACO */}
        <div className="flex items-center space-x-4 shrink-0">
          <Link
            href="/"
            className="text-2xl font-black tracking-widest text-emerald-400 hover:text-emerald-300 transition focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded-md px-1"
            aria-label="Ir a inicio SIFACO"
          >
            SIFACO
          </Link>
          <div className="h-5 w-px bg-slate-800 hidden md:block" />
        </div>

        {/* Centro / Enlaces de Navegación con Iconos y Accesibilidad en una sola línea */}
        <nav
          className="flex items-center space-x-1 lg:space-x-1.5 overflow-x-auto text-xs md:text-sm font-medium py-1 scrollbar-none"
          aria-label="Navegación Principal"
        >
          {linksVisibles.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span className={isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400 transition-colors'}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Derecha: Usuario Activo y Cierre de Sesión */}
        {!cargandoAuth && (
          <div className="flex items-center space-x-3 shrink-0 border-l border-slate-800 pl-3">
            {usuario ? (
              <>
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-200 whitespace-nowrap">{usuario.nombre}</span>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 font-mono tracking-wider">
                    [{usuario.rol}]
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-rose-400/50"
                  title="Cerrar Sesión de Usuario"
                  aria-label="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
