'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Usuario, RolUsuario } from '@/types';
import { ShieldCheck, UserPlus, Users, Key, CheckCircle, XCircle } from 'lucide-react';

export default function GestionUsuariosPage() {
  const { usuario: usuarioActual, tienePermiso } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');

  // Formulario nuevo usuario
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRol, setNuevoRol] = useState<RolUsuario>('FACTURADOR');
  const [guardando, setGuardando] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${apiBaseUrl}/usuarios`);
      if (!res.ok) throw new Error('Error al cargar la lista de usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al obtener usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorMsg('');
    setExitoMsg('');

    try {
      const res = await fetch(`${apiBaseUrl}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre,
          email: nuevoEmail,
          password: nuevoPassword,
          rol: nuevoRol,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al crear usuario');
      }

      setExitoMsg(`Usuario '${nuevoEmail}' creado correctamente con el rol ${nuevoRol}.`);
      setMostrarModal(false);
      setNuevoNombre('');
      setNuevoEmail('');
      setNuevoPassword('');
      setNuevoRol('FACTURADOR');
      cargarUsuarios();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (u: Usuario) => {
    try {
      const nuevoEstado = !u.activo;
      const res = await fetch(`${apiBaseUrl}/usuarios/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: nuevoEstado }),
      });

      if (!res.ok) throw new Error('Error al actualizar el estado del usuario');

      setExitoMsg(`Estado del usuario '${u.email}' actualizado a ${nuevoEstado ? 'ACTIVO' : 'INACTIVO'}.`);
      cargarUsuarios();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  if (!tienePermiso(['ADMIN'])) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-lg text-center max-w-lg mx-auto my-12 shadow">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-rose-600" />
        <h2 className="text-xl font-bold mb-2">Acceso Restringido (Requiere Rol ADMIN)</h2>
        <p className="text-sm text-rose-700">
          Usted está autenticado como <strong>{usuarioActual?.nombre}</strong> [{usuarioActual?.rol}]. Solamente los administradores generales pueden gestionar las cuentas del sistema SIFACO.
        </p>
      </div>
    );
  }

  const getRolBadgeClass = (rol: RolUsuario) => {
    switch (rol) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CONTADOR':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'FACTURADOR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'GESTOR_CXC':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'COORDINADOR_EVENTOS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-emerald-400" />
            <h1 className="text-2xl font-bold">Gestión de Cuentas y Privilegios (RBAC)</h1>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Administración centralizada de usuarios, asignación de roles y control de acceso seguro en SIFACO.
          </p>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg transition shadow flex items-center justify-center space-x-2 text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Crear Nuevo Usuario</span>
        </button>
      </div>

      {/* Alertas */}
      {exitoMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium flex items-center justify-between shadow-sm">
          <span>{exitoMsg}</span>
          <button onClick={() => setExitoMsg('')} className="text-emerald-600 font-bold hover:underline">
            Cerrar
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm font-medium flex items-center justify-between shadow-sm">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-600 font-bold hover:underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Resumen de Roles */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-xs">
          <div className="font-bold text-purple-900">ADMIN</div>
          <div className="text-purple-700 mt-0.5">Control Total (DRP, Talonarios, Auditoría y RBAC).</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs">
          <div className="font-bold text-blue-900">CONTADOR</div>
          <div className="text-blue-700 mt-0.5">Reportes DGI (IR/ALMA), KPIs y Contabilidad.</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs">
          <div className="font-bold text-emerald-900">FACTURADOR</div>
          <div className="text-emerald-700 mt-0.5">Emisión Facturas DGI, Impresión ESC/P2 y Caja.</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs">
          <div className="font-bold text-amber-900">GESTOR_CXC</div>
          <div className="text-amber-700 mt-0.5">Saldos CxC, Recibos de Caja y Cobranza.</div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg text-xs">
          <div className="font-bold text-indigo-900">COORDINADOR_EVENTOS</div>
          <div className="text-indigo-700 mt-0.5">Gestión de Eventos, Talleres, Catering y Stands.</div>
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Cuentas Registradas en el Sistema</h2>
          <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-full">
            Total: {usuarios.length} cuentas
          </span>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-slate-500 text-sm">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[11px] tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-6 py-3">Nombre del Usuario</th>
                  <th className="px-6 py-3">Correo Electrónico</th>
                  <th className="px-6 py-3">Rol Asignado</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{u.nombre}</td>
                    <td className="px-6 py-3.5 text-slate-600 font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getRolBadgeClass(u.rol)}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {u.activo ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 text-xs font-bold px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>ACTIVO</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-rose-700 bg-rose-50 text-xs font-bold px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>INACTIVO</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleEstado(u)}
                        className={`text-xs font-bold px-3 py-1 rounded border transition ${
                          u.activo
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Usuario */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Registrar Nuevo Usuario</span>
              </h3>
              <button onClick={() => setMostrarModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ana Belén Morales"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@sifaco.ni"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contraseña de Acceso</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rol y Nivel de Privilegios</label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value as RolUsuario)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="FACTURADOR">FACTURADOR (Facturación Preimpresa & Caja)</option>
                  <option value="CONTADOR">CONTADOR (Reportes DGI, KPIs y Contabilidad)</option>
                  <option value="GESTOR_CXC">GESTOR_CXC (Cartera CxC y Cobranza)</option>
                  <option value="COORDINADOR_EVENTOS">COORDINADOR_EVENTOS (Gestión de Eventos)</option>
                  <option value="ADMIN">ADMIN (Acceso Total & DRP)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
