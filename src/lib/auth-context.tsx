'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { RolUsuario } from '@/types';

export interface UsuarioSession {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

interface AuthContextType {
  usuario: UsuarioSession | null;
  token: string | null;
  cargandoAuth: boolean;
  login: (token: string, usuario: UsuarioSession) => void;
  logout: () => void;
  tienePermiso: (rolesPermitidos: RolUsuario[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  token: null,
  cargandoAuth: true,
  login: () => {},
  logout: () => {},
  tienePermiso: () => false,
});

const DEFAULT_ADMIN: UsuarioSession = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99',
  nombre: 'Administrador General',
  email: 'admin@sifaco.ni',
  rol: 'ADMIN',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('sifaco_auth_token');
      const savedUser = localStorage.getItem('sifaco_user');
      const explicitLogout = localStorage.getItem('sifaco_explicit_logout');

      if (explicitLogout === 'true' || !savedToken || !savedUser) {
        setUsuario(null);
        setToken(null);
      } else {
        setToken(savedToken);
        setUsuario(JSON.parse(savedUser));
      }
    } catch {
      setUsuario(null);
      setToken(null);
    } finally {
      setCargandoAuth(false);
    }
  }, []);

  const login = (newToken?: string, newUsuario?: UsuarioSession) => {
    const usr = newUsuario || DEFAULT_ADMIN;
    const tok = newToken || 'mock-jwt-admin-token';
    setToken(tok);
    setUsuario(usr);
    localStorage.removeItem('sifaco_explicit_logout');
    localStorage.setItem('sifaco_auth_token', tok);
    localStorage.setItem('sifaco_user', JSON.stringify(usr));
  };

  const logout = () => {
    const userEmail = usuario?.email || 'admin@sifaco.ni';
    const userRole = usuario?.rol || 'ADMIN';

    setToken(null);
    setUsuario(null);
    localStorage.setItem('sifaco_explicit_logout', 'true');
    localStorage.removeItem('sifaco_auth_token');
    localStorage.removeItem('sifaco_user');

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://34.61.174.107/api/v1';
    try {
      fetch(`${apiBaseUrl}/auditoria/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_email: userEmail,
          rol: userRole,
          accion: 'CIERRE_SESION',
          tabla_afectada: 'sesiones',
          detalles: 'Cierre de sesión efectuado por el usuario',
        }),
      }).catch(() => {});
    } catch {}
  };

  const tienePermiso = (rolesPermitidos: RolUsuario[]): boolean => {
    if (!usuario) return false;
    if (usuario.rol === 'ADMIN') return true; // ADMIN tiene acceso global
    return rolesPermitidos.includes(usuario.rol);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, cargandoAuth, login, logout, tienePermiso }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
