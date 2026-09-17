'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Building2,
  Wallet
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, logout, cargandoAuth, tienePermiso } = useAuth();
  const [dropdownCuentasAbierto, setDropdownCuentasAbierto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown si se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownCuentasAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Submenú Cuentas (Contabilidad, Cartera CxC, Compras CxP)
  const itemsCuentas = [
    { href: '/cartera/cxc', label: 'Cartera CxC', roles: ['ADMIN', 'CONTADOR', 'FACTURADOR', 'GESTOR_CXC'] as RolUsuario[], icon: <CreditCard className="w-4 h-4 text-emerald-400" />, desc: 'Cobranza y saldos pendientes' },
    { href: '/cartera/cxp', label: 'Compras CxP', roles: ['ADMIN', 'CONTADOR'] as RolUsuario[], icon: <ShoppingBag className="w-4 h-4 text-amber-400" />, desc: 'Gastos de proveedores y retenciones' },
    { href: '/contabilidad', label: 'Contabilidad', roles: ['ADMIN', 'CONTADOR'] as RolUsuario[], icon: <Calculator className="w-4 h-4 text-indigo-400" />, desc: 'Libro diario y estados financieros' },
  ];

  const itemsCuentasVisibles = itemsCuentas.filter((item) => tienePermiso(item.roles));
  const esCuentasActivo = itemsCuentasVisibles.some((item) => pathname === item.href);

  // Enlaces Principales del Menú Superior (Reordenado y Optimizado)
  const navLinks = [
    { href: '/', label: 'Dashboard', roles: ['ADMIN', 'CONTADOR', 'FACTURADOR', 'GESTOR_CXC', 'COORDINADOR_EVENTOS'] as RolUsuario[], icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/crm/clientes', label: 'Clientes', roles: ['ADMIN', 'CONTADOR', 'FACTURADOR', 'GESTOR_CXC', 'COORDINADOR_EVENTOS'] as RolUsuario[], icon: <Users className="w-4 h-4" /> },
    { href: '/facturacion', label: 'Facturación', roles: ['ADMIN', 'CONTADOR', 'FACTURADOR'] as RolUsuario[], icon: <FileText className="w-4 h-4" /> },
    // Cuentas se renderiza dinámicamente como submenú Dropdown
    { href: '/eventos', label: 'Eventos', roles: ['ADMIN', 'CONTADOR', 'FACTURADOR', 'COORDINADOR_EVENTOS'] as RolUsuario[], icon: <Calendar className="w-4 h-4" /> },
    { href: '/reportes/dgi', label: 'Reportes DGI', roles: ['ADMIN', 'CONTADOR'] as RolUsuario[], icon: <BarChart3 className="w-4 h-4" /> },
    { href: '/auditoria', label: 'Auditoría & DRP', roles: ['ADMIN', 'CONTADOR'] as RolUsuario[], icon: <ShieldAlert className="w-4 h-4" /> },
    { href: '/admin/usuarios', label: 'Usuarios', roles: ['ADMIN'] as RolUsuario[], icon: <UserCheck className="w-4 h-4" /> },
  ];

  const linksVisibles = navLinks.filter((link) => tienePermiso(link.roles));

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 relative z-40" role="banner">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        
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

        {/* Centro: Navegación Limpia Sin Barra de Desplazamiento */}
        <nav
          className="flex items-center space-x-1 lg:space-x-2 text-xs md:text-sm font-medium py-1"
          aria-label="Navegación Principal"
        >
          {/* 1. Dashboard */}
          {linksVisibles.find(l => l.href === '/') && (
            <Link
              href="/"
              className={`whitespace-nowrap inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname === '/'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Dashboard</span>
            </Link>
          )}

          {/* 2. Clientes */}
          {linksVisibles.find(l => l.href === '/crm/clientes') && (
            <Link
              href="/crm/clientes"
              className={`whitespace-nowrap inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname === '/crm/clientes'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Clientes</span>
            </Link>
          )}

          {/* 3. Facturación */}
          {linksVisibles.find(l => l.href === '/facturacion') && (
            <Link
              href="/facturacion"
              className={`whitespace-nowrap inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname === '/facturacion'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Facturación</span>
            </Link>
          )}

          {/* 4. SUBMENÚ DESPLEGABLE: CUENTAS (Cartera CxC, Compras CxP, Contabilidad) */}
          {itemsCuentasVisibles.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownCuentasAbierto(!dropdownCuentasAbierto)}
                onMouseEnter={() => setDropdownCuentasAbierto(true)}
                className={`whitespace-nowrap inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  esCuentasActivo || dropdownCuentasAbierto
                    ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                aria-expanded={dropdownCuentasAbierto}
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Cuentas</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownCuentasAbierto ? 'rotate-180' : ''}`} />
              </button>

              {/* Menú Desplegable Cuentas */}
              {dropdownCuentasAbierto && (
                <div
                  onMouseLeave={() => setDropdownCuentasAbierto(false)}
                  className="absolute left-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    Módulo de Cuentas & Finanzas
                  </div>
                  {itemsCuentasVisibles.map((item) => {
                    const isSubActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setDropdownCuentasAbierto(false)}
                        className={`flex items-start space-x-3 px-3.5 py-2.5 hover:bg-slate-800 transition ${
                          isSubActive ? 'bg-slate-800/90 font-bold text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        <div className="mt-0.5 p-1 bg-slate-800 rounded border border-slate-700">
                          {item.icon}
                        </div>
                        <div>
                          <span className="block text-xs font-bold">{item.label}</span>
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{item.desc}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. Eventos */}
          {linksVisibles.find(l => l.href === '/eventos') && (
            <Link
              href="/eventos"
              className={`whitespace-nowrap inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname === '/eventos'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Eventos</span>
            </Link>
          )}

          {/* 6. Reportes DGI */}
          {linksVisibles.find(l => l.href === '/reportes/dgi') && (
            <Link
              href="/reportes/dgi"
              className={`whitespace-nowrap inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname === '/reportes/dgi'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span>Reportes DGI</span>
            </Link>
          )}

          {/* 7. Auditoría & DRP */}
          {linksVisibles.find(l => l.href === '/auditoria') && (
            <Link
              href="/auditoria"
              className={`whitespace-nowrap inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname === '/auditoria'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-slate-400" />
              <span>Auditoría & DRP</span>
            </Link>
          )}

          {/* 8. Usuarios */}
          {linksVisibles.find(l => l.href === '/admin/usuarios') && (
            <Link
              href="/admin/usuarios"
              className={`whitespace-nowrap inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                pathname === '/admin/usuarios'
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 text-slate-400" />
              <span>Usuarios</span>
            </Link>
          )}
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
