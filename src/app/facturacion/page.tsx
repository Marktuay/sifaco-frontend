'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi, getClientes, crearCliente } from '@/lib/api-client';
import { enviarAImpresoraLQ590, verificarEstadoAgenteImpresion } from '@/lib/print-client';
import { CrearFacturaPayload, FacturaResponse, Cliente, CrearClientePayload } from '@/types';

interface FacturaEmitida {
  id: string;
  correlativo: string;
  fecha: string;
  cliente: string;
  ruc: string;
  condicion: 'CONTADO' | 'CREDITO';
  moneda: 'NIO' | 'USD';
  total: number;
  estado: 'EMITIDA' | 'ANULADA';
  motivoAnulacion?: string;
}

export default function FacturacionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Cargando Facturación DGI...</div>}>
      <FacturacionContent />
    </Suspense>
  );
}

function FacturacionContent() {
  const searchParams = useSearchParams();
  const clienteIdParam = searchParams.get('cliente_id');

  const [agenteOnline, setAgenteOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
  const [facturaGenerada, setFacturaGenerada] = useState<FacturaResponse | null>(null);

  // Clientes desde CRM
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  // Modal para agregar cliente rápido
  const [modalQuickClienteAbierto, setModalQuickClienteAbierto] = useState<boolean>(false);
  const [quickClienteForm, setQuickClienteForm] = useState<CrearClientePayload>({
    ruc_cedula: '',
    razon_social: '',
    direccion: '',
    telefono: '',
    email: '',
    representante_legal: '',
    tipo_contribuyente: 'GRAN_CONTRIBUYENTE',
  });

  // Form State para Facturación
  const [numeroFacturaMembretada, setNumeroFacturaMembretada] = useState<string>('4135');
  const [tipoPago, setTipoPago] = useState<'CONTADO' | 'CREDITO'>('CONTADO');
  const [moneda, setMoneda] = useState<'NIO' | 'USD'>('NIO');
  const [tasaCambio, setTasaCambio] = useState<number>(36.6243);
  const [observaciones, setObservaciones] = useState<string>('Evento Corporativo Taller Presencial');

  // Historial de Facturas Emitidas
  const [facturasEmitidas, setFacturasEmitidas] = useState<FacturaEmitida[]>([
    {
      id: 'f-4135',
      correlativo: '4135',
      fecha: '11/09/2026',
      cliente: 'FARMACIA DISPOER S.A.',
      ruc: 'J0310000323046',
      condicion: 'CONTADO',
      moneda: 'NIO',
      total: 7750.0,
      estado: 'EMITIDA',
    },
    {
      id: 'f-4134',
      correlativo: '4134',
      fecha: '02/09/2026',
      cliente: 'BAC Nicaragua S.A.',
      ruc: 'J0310000001234',
      condicion: 'CREDITO',
      moneda: 'NIO',
      total: 172500.0,
      estado: 'EMITIDA',
    },
    {
      id: 'f-4133',
      correlativo: '4133',
      fecha: '04/09/2026',
      cliente: 'Claro Nicaragua (ENITEL)',
      ruc: 'J0310000009999',
      condicion: 'CREDITO',
      moneda: 'NIO',
      total: 92000.0,
      estado: 'EMITIDA',
    },
  ]);

  // Modal Anulación de Factura
  const [modalAnularAbierto, setModalAnularAbierto] = useState(false);
  const [facturaAAnular, setFacturaAAnular] = useState<FacturaEmitida | null>(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState('');

  // Líneas de Detalle
  const [detalles, setDetalles] = useState([
    { descripcion: 'STAND MODULAR EXPO 3X3', cantidad: 2, precio_unitario: 1500, exento: false },
    { descripcion: 'SERVICIO DE CATERING VIP', cantidad: 1, precio_unitario: 2000, exento: true },
  ]);

  // Cuotas de Crédito
  const [cuotas, setCuotas] = useState([
    { numero_cuota: 1, fecha_vence: '2026-10-01', monto: 3875 },
    { numero_cuota: 2, fecha_vence: '2026-11-01', monto: 3875 },
  ]);

  const cargarClientesCRM = async () => {
    try {
      const list = await getClientes();
      setClientesList(list);

      // Pre-seleccionar si viene por URL param o el primero
      if (clienteIdParam) {
        const found = list.find((c) => c.id === clienteIdParam);
        if (found) setClienteSeleccionado(found);
      } else if (list.length > 0 && !clienteSeleccionado) {
        setClienteSeleccionado(list[0]);
      }
    } catch (err) {
      console.error('Error al cargar clientes CRM:', err);
    }
  };

  useEffect(() => {
    cargarClientesCRM();
    verificarEstadoAgenteImpresion().then((online) => setAgenteOnline(online));
  }, [clienteIdParam]);

  const agregarLinea = () => {
    setDetalles([...detalles, { descripcion: '', cantidad: 1, precio_unitario: 0, exento: false }]);
  };

  const calcularSubtotal = () => detalles.reduce((acc, item) => acc + item.cantidad * item.precio_unitario, 0);
  const calcularIVA = () => detalles.reduce((acc, item) => acc + (item.exento ? 0 : item.cantidad * item.precio_unitario * 0.15), 0);
  const calcularTotal = () => calcularSubtotal() + calcularIVA();

  const handleCrearQuickCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nuevo = await crearCliente(quickClienteForm);
      setClientesList([nuevo, ...clientesList]);
      setClienteSeleccionado(nuevo);
      setModalQuickClienteAbierto(false);
      setMensaje({ tipo: 'exito', texto: `Cliente CRM "${nuevo.razon_social}" registrado y seleccionado.` });
    } catch (err: any) {
      alert(`Error al crear cliente: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSeleccionado) {
      alert('Por favor seleccione un cliente registrado en el CRM.');
      return;
    }

    setLoading(true);
    setMensaje(null);

    const payload: CrearFacturaPayload = {
      cliente_id: clienteSeleccionado.id,
      tipo_pago: tipoPago,
      moneda: moneda,
      tasa_cambio_bcn: tasaCambio,
      observaciones: observaciones,
      detalles: detalles,
      cuotas: tipoPago === 'CREDITO' ? cuotas : [],
    };

    try {
      const res = await fetchApi<FacturaResponse>('/facturas', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setFacturaGenerada(res);

      const numFact = numeroFacturaMembretada.trim() || res.factura.correlativo_preimpreso || '4136';
      const nuevaFactura: FacturaEmitida = {
        id: res.factura.id || `f-${Date.now()}`,
        correlativo: numFact,
        fecha: new Date().toLocaleDateString('es-NI'),
        cliente: clienteSeleccionado.razon_social,
        ruc: clienteSeleccionado.ruc_cedula,
        condicion: tipoPago,
        moneda: moneda,
        total: calcularTotal(),
        estado: 'EMITIDA',
      };

      setFacturasEmitidas([nuevaFactura, ...facturasEmitidas]);

      setMensaje({
        tipo: 'exito',
        texto: `Factura Preimpresa N° ${numFact} vinculada exitosamente con ID ${nuevaFactura.id.slice(0, 8)}. Asiento contable registrado.`,
      });

      if (res.escp2_payload_base64) {
        const printRes = await enviarAImpresoraLQ590(res.escp2_payload_base64);
        if (printRes.exito) {
          setMensaje((prev) => ({
            tipo: 'exito',
            texto: (prev?.texto || '') + ' | Enviado a la impresora Epson LQ-590.',
          }));
        } else {
          setMensaje((prev) => ({
            tipo: 'error',
            texto: (prev?.texto || '') + ` | ADVERTENCIA IMPRESIÓN: ${printRes.error}`,
          }));
        }
      }
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: err.message || 'Error al emitir factura preimpresa' });
    } finally {
      setLoading(false);
    }
  };

  // Anular Factura Preimpresa
  const handleAbrirAnularFactura = (f: FacturaEmitida) => {
    setFacturaAAnular(f);
    setMotivoAnulacion('');
    setModalAnularAbierto(true);
  };

  const handleProcesarAnulacionFactura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facturaAAnular || !motivoAnulacion.trim()) return;

    try {
      await fetchApi(`/facturas/${facturaAAnular.id}/anular`, {
        method: 'POST',
        body: JSON.stringify({ motivo: motivoAnulacion }),
      });

      setFacturasEmitidas(
        facturasEmitidas.map((item) =>
          item.id === facturaAAnular.id
            ? { ...item, estado: 'ANULADA', motivoAnulacion: motivoAnulacion }
            : item
        )
      );

      setModalAnularAbierto(false);
      setMensaje({
        tipo: 'exito',
        texto: `Factura N° ${facturaAAnular.correlativo} ANULADA correctamente. Contrasiento contable registrado.`,
      });
    } catch (err: any) {
      alert(`Error al anular la factura: ${err.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Emisión & Anulación de Facturas Membretadas
          </h1>
          <p className="text-slate-500 text-sm">
            Vinculación del Número de Factura Preimpresa con el ID del sistema e integración con CRM Clientes.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-block w-3 h-3 rounded-full ${agenteOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span className="text-xs font-semibold text-slate-600">
            Impresora LQ-590 :9100 ({agenteOnline ? 'ONLINE' : 'SIMULADOR LOCAL'})
          </span>
        </div>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-xl font-medium text-sm flex justify-between items-center shadow-sm ${mensaje.tipo === 'exito' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'}`}>
          <span>{mensaje.texto}</span>
          <button onClick={() => setMensaje(null)} className="font-bold ml-4 hover:opacity-70">&times;</button>
        </div>
      )}

      {/* Formulario de Emisión */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h2 className="text-lg font-bold text-slate-900">Emitir Factura Membretada</h2>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold border border-slate-300">
            Formulario Físico ESC/P2
          </span>
        </div>

        {/* Sección de Cliente y Número de Factura */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Cliente desde Maestro CRM *
              </label>
              <button
                type="button"
                onClick={() => setModalQuickClienteAbierto(true)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                + Nuevo Cliente CRM
              </button>
            </div>

            <select
              value={clienteSeleccionado?.id || ''}
              onChange={(e) => {
                const found = clientesList.find((c) => c.id === e.target.value);
                if (found) setClienteSeleccionado(found);
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
              required
            >
              {clientesList.length === 0 ? (
                <option value="">Cargando clientes CRM...</option>
              ) : (
                clientesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.razon_social} ({c.ruc_cedula})
                  </option>
                ))
              )}
            </select>

            {clienteSeleccionado && (
              <div className="mt-2 space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                <p><span className="font-bold text-slate-800">RUC/Cédula:</span> {clienteSeleccionado.ruc_cedula}</p>
                <p><span className="font-bold text-slate-800">Dirección:</span> {clienteSeleccionado.direccion || 'No especificada'}</p>
                <p><span className="font-bold text-slate-800">Teléfono:</span> {clienteSeleccionado.telefono || 'No especificado'}</p>
                <p><span className="font-bold text-emerald-800">Representante Legal:</span> {clienteSeleccionado.representante_legal || 'No especificado'}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Número de Factura Preimpresa (Membretada) *
              </label>
              <input
                type="text"
                required
                value={numeroFacturaMembretada}
                onChange={(e) => setNumeroFacturaMembretada(e.target.value)}
                placeholder="ej. 4135"
                className="w-full border border-emerald-400 rounded-lg px-3 py-2 text-sm font-mono font-bold text-emerald-900 bg-emerald-50 focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Se vinculará el consecutivo preimpreso de la hoja física con el ID transaccional del sistema.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Condición Pago</label>
                <select
                  value={tipoPago}
                  onChange={(e) => setTipoPago(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white font-medium"
                >
                  <option value="CONTADO">CONTADO</option>
                  <option value="CREDITO">CRÉDITO (Cuotas)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Moneda & Tasa BCN</label>
                <div className="flex space-x-1">
                  <select
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value as any)}
                    className="w-1/2 border border-slate-300 rounded-lg px-2 py-2 text-xs font-bold bg-white"
                  >
                    <option value="NIO">NIO</option>
                    <option value="USD">USD</option>
                  </select>
                  <input
                    type="number"
                    step="0.0001"
                    value={tasaCambio}
                    onChange={(e) => setTasaCambio(parseFloat(e.target.value))}
                    className="w-1/2 border border-slate-300 rounded-lg px-2 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles de Factura */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Detalle de Conceptos / Productos / Servicios
            </h3>
            <button
              type="button"
              onClick={agregarLinea}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-1 rounded-lg font-bold transition"
            >
              + Agregar Renglón
            </button>
          </div>

          <div className="space-y-3">
            {detalles.map((d, i) => (
              <div key={i} className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Descripción del concepto o servicio..."
                  value={d.descripcion}
                  onChange={(e) => {
                    const newDet = [...detalles];
                    newDet[i].descripcion = e.target.value;
                    setDetalles(newDet);
                  }}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900"
                  required
                />
                <input
                  type="number"
                  placeholder="Cant"
                  value={d.cantidad}
                  onChange={(e) => {
                    const newDet = [...detalles];
                    newDet[i].cantidad = parseFloat(e.target.value) || 0;
                    setDetalles(newDet);
                  }}
                  className="w-20 border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-mono text-center text-slate-900"
                  required
                />
                <input
                  type="number"
                  placeholder="Precio"
                  value={d.precio_unitario}
                  onChange={(e) => {
                    const newDet = [...detalles];
                    newDet[i].precio_unitario = parseFloat(e.target.value) || 0;
                    setDetalles(newDet);
                  }}
                  className="w-32 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-mono text-right text-slate-900"
                  required
                />
                <label className="flex items-center space-x-1 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={d.exento}
                    onChange={(e) => {
                      const newDet = [...detalles];
                      newDet[i].exento = e.target.checked;
                      setDetalles(newDet);
                    }}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Exento</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen Totales */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-right font-mono">
          <div className="text-xs text-slate-600">
            Subtotal: <span className="font-bold text-slate-900">{moneda} {calcularSubtotal().toFixed(2)}</span>
          </div>
          <div className="text-xs text-slate-600">
            IVA 15%: <span className="font-bold text-indigo-700">{moneda} {calcularIVA().toFixed(2)}</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 border-t border-slate-300 pt-1">
            TOTAL FACTURA MEMBRETADA: <span className="text-emerald-700">{moneda} {calcularTotal().toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow transition text-sm disabled:opacity-50"
        >
          {loading ? 'Generando Trama ESC/P2 y Registrando...' : `Emitir Factura Membretada N° ${numeroFacturaMembretada} & Enviar a Impresora`}
        </button>
      </form>

      {/* Tabla de Historial de Facturas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Facturas Membretadas Emitidas</h2>
            <p className="text-xs text-slate-500">Mapeo del número físico membretado con la transacción interna del sistema</p>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 text-[11px] uppercase border-b border-slate-200 font-bold">
                <th className="py-3 px-3 w-[15%]">N° Fact. Membretada</th>
                <th className="py-3 px-3 w-[15%]">ID Interno</th>
                <th className="py-3 px-3 w-[12%]">Fecha</th>
                <th className="py-3 px-3 w-[26%]">Cliente CRM</th>
                <th className="py-3 px-3 w-[10%]">Condición</th>
                <th className="py-3 px-3 w-[12%] text-right">Total (C$)</th>
                <th className="py-3 px-3 w-[10%] text-center">Estado</th>
                <th className="py-3 px-3 w-[10%] text-center pr-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {facturasEmitidas.map((f) => (
                <tr key={f.id} className={f.estado === 'ANULADA' ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                  <td className="p-3 font-mono font-bold text-emerald-800">{f.correlativo}</td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">{f.id}</td>
                  <td className="p-3 font-mono text-slate-600">{f.fecha}</td>
                  <td className="p-3 font-medium text-slate-900">{f.cliente}</td>
                  <td className="p-3 font-mono text-slate-600">{f.condicion}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    C$ {f.total.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded font-extrabold border ${
                        f.estado === 'ANULADA'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {f.estado}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {f.estado === 'EMITIDA' ? (
                      <button
                        onClick={() => handleAbrirAnularFactura(f)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] px-2.5 py-1 rounded shadow-xs transition"
                      >
                        🚫 Anular
                      </button>
                    ) : (
                      <span className="text-[11px] text-rose-700 font-semibold italic" title={f.motivoAnulacion}>
                        Anulada ({f.motivoAnulacion})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Quick Cliente */}
      {modalQuickClienteAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">+ Registro Rápido Cliente CRM</h3>
              <button onClick={() => setModalQuickClienteAbierto(false)} className="text-slate-400 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCrearQuickCliente} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">RUC / Cédula *</label>
                <input
                  type="text"
                  required
                  value={quickClienteForm.ruc_cedula}
                  onChange={(e) => setQuickClienteForm({ ...quickClienteForm, ruc_cedula: e.target.value })}
                  placeholder="ej. J0310000998877"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Razón Social / Nombre *</label>
                <input
                  type="text"
                  required
                  value={quickClienteForm.razon_social}
                  onChange={(e) => setQuickClienteForm({ ...quickClienteForm, razon_social: e.target.value })}
                  placeholder="ej. CORPORACION ABC S.A."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dueño o Representante Legal</label>
                <input
                  type="text"
                  value={quickClienteForm.representante_legal}
                  onChange={(e) => setQuickClienteForm({ ...quickClienteForm, representante_legal: e.target.value })}
                  placeholder="ej. Lic. Roberto Mendoza"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teléfonos</label>
                  <input
                    type="text"
                    value={quickClienteForm.telefono}
                    onChange={(e) => setQuickClienteForm({ ...quickClienteForm, telefono: e.target.value })}
                    placeholder="2255-0000"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo Contribuyente</label>
                  <select
                    value={quickClienteForm.tipo_contribuyente}
                    onChange={(e) => setQuickClienteForm({ ...quickClienteForm, tipo_contribuyente: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                  >
                    <option value="GRAN_CONTRIBUYENTE">Gran Contribuyente</option>
                    <option value="REGIMEN_GENERAL">Régimen General</option>
                    <option value="CUOTA_FIJA">Cuota Fija</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dirección</label>
                <input
                  type="text"
                  value={quickClienteForm.direccion}
                  onChange={(e) => setQuickClienteForm({ ...quickClienteForm, direccion: e.target.value })}
                  placeholder="Managua, Nicaragua"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalQuickClienteAbierto(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Guardar y Seleccionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Anulación de Factura */}
      {modalAnularAbierto && facturaAAnular && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-rose-700">Anular Factura N° {facturaAAnular.correlativo}</h3>
              <button onClick={() => setModalAnularAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Se anulará legalmente la factura preimpresa N° <strong className="text-slate-900">{facturaAAnular.correlativo}</strong> por C$ {facturaAAnular.total.toFixed(2)}. Se generará el contrasiento contable de anulación.
            </p>

            <form onSubmit={handleProcesarAnulacionFactura} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motivo de Anulación (DGI Requerido)</label>
                <textarea
                  value={motivoAnulacion}
                  onChange={(e) => setMotivoAnulacion(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500"
                  rows={3}
                  placeholder="ej. Error en monto / Solicitud de cambio de razón social del cliente"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => setModalAnularAbierto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow"
                >
                  Confirmar Anulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
