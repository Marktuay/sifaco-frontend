'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Usuario, RolUsuario } from '@/types';
import { ShieldCheck, UserPlus, Users, Key, CheckCircle, XCircle, Edit, Trash2, Lock, AlertTriangle } from 'lucide-react';

export default function GestionUsuariosPage() {
  const { usuario: usuarioActual, tienePermiso } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');

  // Modal 1: Crear nuevo usuario
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRol, setNuevoRol] = useState<RolUsuario>('FACTURADOR');

  // Modal 2: Editar datos y rol
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRol, setEditRol] = useState<RolUsuario>('FACTURADOR');

  // Modal 3: Cambiar contraseña
  const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
  const [usuarioPassword, setUsuarioPassword] = useState<Usuario | null>(null);
  const [passNueva, setPassNueva] = useState('');
  const [passConfirm, setPassConfirm] = useState('');

  // Modal 4: Eliminar usuario
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [usuarioEliminar, setUsuarioEliminar] = useState<Usuario | null>(null);

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

  // 1. Crear Usuario
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
      setMostrarModalCrear(false);
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

  // 2. Editar Usuario (Nombre, Email, Rol)
  const abrirModalEditar = (u: Usuario) => {
    setUsuarioEditar(u);
    setEditNombre(u.nombre);
    setEditEmail(u.email);
    setEditRol(u.rol);
    setMostrarModalEditar(true);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditar) return;
    setGuardando(true);
    setErrorMsg('');
    setExitoMsg('');

    try {
      const res = await fetch(`${apiBaseUrl}/usuarios/${usuarioEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editNombre,
          email: editEmail,
          rol: editRol,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al actualizar usuario');
      }

      setExitoMsg(`Datos del usuario '${editEmail}' actualizados correctamente.`);
      setMostrarModalEditar(false);
      setUsuarioEditar(null);
      cargarUsuarios();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // 3. Cambiar Contraseña
  const abrirModalPassword = (u: Usuario) => {
    setUsuarioPassword(u);
    setPassNueva('');
    setPassConfirm('');
    setMostrarModalPassword(true);
  };

  const handleGuardarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioPassword) return;

    if (passNueva !== passConfirm) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifique.');
      return;
    }

    setGuardando(true);
    setErrorMsg('');
    setExitoMsg('');

    try {
      const res = await fetch(`${apiBaseUrl}/usuarios/${usuarioPassword.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passNueva,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al cambiar contraseña');
      }

      setExitoMsg(`Contraseña actualizada con éxito para el usuario '${usuarioPassword.email}'.`);
      setMostrarModalPassword(false);
      setUsuarioPassword(null);
      setPassNueva('');
      setPassConfirm('');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // 4. Activar / Desactivar
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

  // 5. Eliminar Usuario
  const abrirModalEliminar = (u: Usuario) => {
    setUsuarioEliminar(u);
    setMostrarModalEliminar(true);
  };

  const handleConfirmarEliminar = async () => {
    if (!usuarioEliminar) return;
    setGuardando(true);
    setErrorMsg('');
    setExitoMsg('');

    try {
      const res = await fetch(`${apiBaseUrl}/usuarios/${usuarioEliminar.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al eliminar usuario');
      }

      setExitoMsg(`Usuario '${usuarioEliminar.email}' eliminado permanentemente del sistema.`);
      setMostrarModalEliminar(false);
      setUsuarioEliminar(null);
      cargarUsuarios();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setGuardando(false);
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
            Administración centralizada de usuarios, asignación de roles, contraseñas y control de acceso en SIFACO.
          </p>
        </div>

        <button
          onClick={() => setMostrarModalCrear(true)}
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
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Botón Editar Rol y Datos */}
                        <button
                          onClick={() => abrirModalEditar(u)}
                          title="Editar Rol y Datos"
                          className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition border border-slate-300"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón Cambiar Contraseña */}
                        <button
                          onClick={() => abrirModalPassword(u)}
                          title="Cambiar Contraseña"
                          className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded transition border border-amber-200"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón Activar / Desactivar */}
                        <button
                          onClick={() => handleToggleEstado(u)}
                          title={u.activo ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                          className={`text-xs font-bold px-2.5 py-1 rounded border transition ${
                            u.activo
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          onClick={() => abrirModalEliminar(u)}
                          title="Eliminar Usuario"
                          className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded transition border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Crear Usuario */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Registrar Nuevo Usuario</span>
              </h3>
              <button onClick={() => setMostrarModalCrear(false)} className="text-slate-400 hover:text-slate-600 font-bold">
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
                  onClick={() => setMostrarModalCrear(false)}
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

      {/* Modal 2: Editar Usuario y Rol */}
      {mostrarModalEditar && usuarioEditar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Edit className="w-5 h-5 text-blue-600" />
                <span>Editar Usuario / Cambiar Rol</span>
              </h3>
              <button onClick={() => setMostrarModalEditar(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rol Asignado (RBAC)</label>
                <select
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value as RolUsuario)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
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
                  onClick={() => setMostrarModalEditar(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Cambiar Contraseña */}
      {mostrarModalPassword && usuarioPassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <span>Restablecer Contraseña</span>
              </h3>
              <button onClick={() => setMostrarModalPassword(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Cambiando contraseña para la cuenta <strong>{usuarioPassword.email}</strong>.
            </p>

            <form onSubmit={handleGuardarPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={passNueva}
                  onChange={(e) => setPassNueva(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Repita la contraseña"
                  value={passConfirm}
                  onChange={(e) => setPassConfirm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t">
                <button
                  type="button"
                  onClick={() => setMostrarModalPassword(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition disabled:opacity-50"
                >
                  {guardando ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Eliminar Usuario */}
      {mostrarModalEliminar && usuarioEliminar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 border-b pb-3">
              <AlertTriangle className="w-7 h-7 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">¿Eliminar Usuario?</h3>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg text-xs text-rose-800">
              <p className="font-bold mb-1">Detalles de la cuenta a eliminar:</p>
              <p>• <strong>Nombre:</strong> {usuarioEliminar.nombre}</p>
              <p>• <strong>Correo:</strong> {usuarioEliminar.email}</p>
              <p>• <strong>Rol:</strong> {usuarioEliminar.rol}</p>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3 border-t">
              <button
                type="button"
                onClick={() => setMostrarModalEliminar(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={guardando}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow transition disabled:opacity-50"
              >
                {guardando ? 'Eliminando...' : 'Sí, Eliminar Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
