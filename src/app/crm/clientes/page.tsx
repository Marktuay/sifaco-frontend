'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientes, crearCliente, actualizarCliente, eliminarCliente } from '@/lib/api-client';
import { Cliente, CrearClientePayload } from '@/types';

export default function CRMClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Estado del Modal
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);

  // Formulario
  const [formData, setFormData] = useState<CrearClientePayload>({
    ruc_cedula: '',
    razon_social: '',
    direccion: '',
    telefono: '',
    email: '',
    representante_legal: '',
    tipo_contribuyente: 'GRAN_CONTRIBUYENTE',
  });

  const cargarClientes = async (searchQuery: string = '') => {
    setCargando(true);
    setError(null);
    try {
      const data = await getClientes(searchQuery);
      setClientes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes del CRM');
      setClientes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes(busqueda);
  }, [busqueda]);

  const abrirModalNuevo = () => {
    setClienteEditar(null);
    setFormData({
      ruc_cedula: '',
      razon_social: '',
      direccion: '',
      telefono: '',
      email: '',
      representante_legal: '',
      tipo_contribuyente: 'GRAN_CONTRIBUYENTE',
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (cliente: Cliente) => {
    setClienteEditar(cliente);
    setFormData({
      ruc_cedula: cliente.ruc_cedula,
      razon_social: cliente.razon_social,
      direccion: cliente.direccion || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      representante_legal: cliente.representante_legal || '',
      tipo_contribuyente: cliente.tipo_contribuyente || 'GRAN_CONTRIBUYENTE',
    });
    setModalAbierto(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (clienteEditar) {
        await actualizarCliente(clienteEditar.id, formData);
        setMensajeExito(`Cliente "${formData.razon_social}" actualizado con éxito.`);
      } else {
        await crearCliente(formData);
        setMensajeExito(`Cliente "${formData.razon_social}" creado exitosamente.`);
      }
      setModalAbierto(false);
      cargarClientes(busqueda);
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar datos del cliente');
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Está seguro de eliminar al cliente "${nombre}"?`)) return;
    try {
      await eliminarCliente(id);
      setMensajeExito(`Cliente "${nombre}" eliminado.`);
      cargarClientes(busqueda);
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cliente');
    }
  };

  // KPIs
  const totalClientes = clientes.length;
  const grandesContribuyentes = clientes.filter(c => c.tipo_contribuyente === 'GRAN_CONTRIBUYENTE').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            CRM / Maestro de Clientes
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gestión centralizada de Razón Social, RUC/Cédula, Dirección, Teléfonos y Representante Legal para facturación.
          </p>
        </div>

        <button
          onClick={abrirModalNuevo}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-sm transition flex items-center justify-center space-x-2 text-sm"
        >
          <span>+ Nuevo Cliente CRM</span>
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
      {mensajeExito && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg text-sm font-medium">
          {mensajeExito}
        </div>
      )}

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Clientes en CRM</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalClientes}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Grandes Contribuyentes</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{grandesContribuyentes}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Régimen General / Cuota Fija</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{totalClientes - grandesContribuyentes}</div>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por Razón Social, RUC/Cédula, Representante Legal o Teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="w-full overflow-hidden">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 w-[15%]">RUC / Cédula</th>
                <th className="py-3 px-3 w-[25%]">Cliente / Razón Social</th>
                <th className="py-3 px-3 w-[20%]">Dueño / Rep. Legal</th>
                <th className="py-3 px-3 w-[14%]">Teléfonos</th>
                <th className="py-3 px-3 w-[16%]">Dirección</th>
                <th className="py-3 px-3 w-[10%] text-right pr-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Cargando catálogo de clientes CRM...
                  </td>
                </tr>
              ) : (!clientes || clientes.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No se encontraron clientes registrados en el CRM.
                  </td>
                </tr>
              ) : (
                (clientes || []).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap text-xs">
                      {c.ruc_cedula}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 text-xs">
                      <span className="line-clamp-1" title={c.razon_social}>{c.razon_social}</span>
                      <span className="block text-[10px] font-normal text-slate-400 truncate">{c.email || 'Sin email'}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-emerald-800 text-xs">
                      <span className="line-clamp-2" title={c.representante_legal}>{c.representante_legal || '-'}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-mono text-[11px] whitespace-nowrap">
                      {c.telefono || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      <span className="line-clamp-2" title={c.direccion}>{c.direccion || '-'}</span>
                    </td>
                    <td className="py-3 px-3 text-right pr-4 whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => router.push(`/facturacion?cliente_id=${c.id}`)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-bold px-2 py-1 rounded-md transition shadow-2xs"
                          title="Facturar a este cliente"
                        >
                          Facturar
                        </button>
                        <button
                          onClick={() => abrirModalEditar(c)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold px-2 py-1 rounded-md transition"
                          title="Editar cliente"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(c.id, c.razon_social)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold px-2 py-1 rounded-md transition"
                          title="Eliminar cliente"
                        >
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Cliente */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {clienteEditar ? 'Editar Cliente CRM' : 'Nuevo Cliente CRM'}
              </h3>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardar} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    RUC / Cédula *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. J0310000323046"
                    value={formData.ruc_cedula}
                    onChange={(e) => setFormData({ ...formData, ruc_cedula: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Razón Social / Nombre Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. FARMACIA DISPOER S.A."
                    value={formData.razon_social}
                    onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Dueño o Representante Legal
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Lic. Fernando Sevilla"
                    value={formData.representante_legal}
                    onChange={(e) => setFormData({ ...formData, representante_legal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Teléfonos de Contacto
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 2255-8899 / 8899-7711"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="ej. ventas@dispoer.com.ni"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tipo de Contribuyente DGI
                  </label>
                  <select
                    value={formData.tipo_contribuyente}
                    onChange={(e) => setFormData({ ...formData, tipo_contribuyente: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="GRAN_CONTRIBUYENTE">Gran Contribuyente</option>
                    <option value="REGIMEN_GENERAL">Régimen General</option>
                    <option value="CUOTA_FIJA">Cuota Fija</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dirección Completa
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Managua, Residencial Bolonia, Semáforos Plaza España 2c al norte"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
                >
                  {clienteEditar ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
