'use client';

import React, { useState } from 'react';
import { PlusCircle, FileText, CheckCircle, X, Printer, ShieldAlert } from 'lucide-react';

export interface FacturaProveedor {
  id: string;
  proveedor: string;
  ruc: string;
  factura: string;
  evento: string;
  detalleServicio: string;
  tipoServicio: 'SERVICIOS_GENERALES' | 'SERVICIOS_PROFESIONALES' | 'SIN_RETENCION';
  subtotal: number;
  aplicaIVA: boolean;
  iva: number;
  total: number;
  porcentajeRetencion: number;
  retencion: number;
  saldo: number;
  comprobanteNo: string;
  fecha: string;
}

export default function CarteraCxPPage() {
  const [compras, setCompras] = useState<FacturaProveedor[]>([
    {
      id: '1',
      proveedor: 'Hotel Real InterContinental Managua',
      ruc: 'J0310000008888',
      factura: 'FP-44910',
      evento: 'Taller Liderazgo 2026',
      detalleServicio: 'Alquiler de Salón Real InterContinental y Banquete VIP',
      tipoServicio: 'SERVICIOS_GENERALES',
      subtotal: 85000.0,
      aplicaIVA: true,
      iva: 12750.0,
      total: 97750.0,
      porcentajeRetencion: 2,
      retencion: 1700.0,
      saldo: 96050.0,
      comprobanteNo: 'RET-2026-0041',
      fecha: '10/09/2026',
    },
    {
      id: '2',
      proveedor: 'Audiovisuelles & Luces Nicaragua S.A.',
      ruc: 'J0310000003333',
      factura: 'FP-1022',
      evento: 'Congreso de Innovación',
      detalleServicio: 'Montaje de Pantallas LED, Sistema de Sonido y Luces Robóticas',
      tipoServicio: 'SERVICIOS_GENERALES',
      subtotal: 35000.0,
      aplicaIVA: true,
      iva: 5250.0,
      total: 40250.0,
      porcentajeRetencion: 2,
      retencion: 700.0,
      saldo: 39550.0,
      comprobanteNo: 'RET-2026-0042',
      fecha: '11/09/2026',
    },
    {
      id: '3',
      proveedor: 'Lic. Roberto Mendoza (Capacitador)',
      ruc: '281-150880-0001X',
      factura: 'FP-005',
      evento: 'Taller Liderazgo 2026',
      detalleServicio: 'Honorarios Profesionales de Conferencia Magna de Liderazgo',
      tipoServicio: 'SERVICIOS_PROFESIONALES',
      subtotal: 20000.0,
      aplicaIVA: false,
      iva: 0.0,
      total: 20000.0,
      porcentajeRetencion: 10,
      retencion: 2000.0,
      saldo: 18000.0,
      comprobanteNo: 'RET-2026-0043',
      fecha: '12/09/2026',
    },
  ]);

  // Modal Registro Factura Proveedor
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proveedorNombre, setProveedorNombre] = useState('');
  const [proveedorRUC, setProveedorRUC] = useState('');
  const [numFactura, setNumFactura] = useState('');
  const [eventoNombre, setEventoNombre] = useState('Taller Liderazgo 2026');
  const [detalleServicio, setDetalleServicio] = useState('');
  const [tipoServicio, setTipoServicio] = useState<'SERVICIOS_GENERALES' | 'SERVICIOS_PROFESIONALES' | 'SIN_RETENCION'>('SERVICIOS_GENERALES');
  const [subtotalInput, setSubtotalInput] = useState<string>('');
  const [aplicaIVA, setAplicaIVA] = useState(true);

  // Modal Ver Retención DGI
  const [retencionSeleccionada, setRetencionSeleccionada] = useState<FacturaProveedor | null>(null);

  // Alerta de éxito
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Cálculo en tiempo real del formulario
  const subtotalNum = parseFloat(subtotalInput) || 0;
  const ivaNum = aplicaIVA ? subtotalNum * 0.15 : 0;
  const totalNum = subtotalNum + ivaNum;
  const pctRetencion = tipoServicio === 'SERVICIOS_GENERALES' ? 2 : tipoServicio === 'SERVICIOS_PROFESIONALES' ? 10 : 0;
  const retencionNum = subtotalNum * (pctRetencion / 100);
  const netoNum = totalNum - retencionNum;

  // Cálculo KPIs
  const totalCxP = compras.reduce((acc, c) => acc + c.saldo, 0);
  const retenciones2pct = compras.filter((c) => c.porcentajeRetencion === 2).reduce((acc, c) => acc + c.retencion, 0);
  const retenciones10pct = compras.filter((c) => c.porcentajeRetencion === 10).reduce((acc, c) => acc + c.retencion, 0);

  const handleGuardarFacturaProveedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorNombre.trim() || !numFactura.trim() || subtotalNum <= 0) return;

    const nuevaFactura: FacturaProveedor = {
      id: Date.now().toString(),
      proveedor: proveedorNombre,
      ruc: proveedorRUC || 'J0310000009999',
      factura: numFactura,
      evento: eventoNombre,
      detalleServicio: detalleServicio || 'Servicios generales contratados para el evento.',
      tipoServicio: tipoServicio,
      subtotal: subtotalNum,
      aplicaIVA: aplicaIVA,
      iva: ivaNum,
      total: totalNum,
      porcentajeRetencion: pctRetencion,
      retencion: retencionNum,
      saldo: netoNum,
      comprobanteNo: `RET-2026-${(compras.length + 42).toString().padStart(4, '0')}`,
      fecha: new Date().toLocaleDateString('es-NI'),
    };

    setCompras([nuevaFactura, ...compras]);
    setMensajeExito(`Factura de Proveedor '${numFactura}' registrada exitosamente. Comprobante de Retención IR DGI ${nuevaFactura.comprobanteNo} generado.`);

    // Resetear form
    setProveedorNombre('');
    setProveedorRUC('');
    setNumFactura('');
    setDetalleServicio('');
    setSubtotalInput('');
    setModalAbierto(false);
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Cuentas por Pagar (CxP) y Compras de Eventos</h1>
        <p className="text-slate-500 text-sm">
          Registro de facturas de proveedores por eventos, retención en la fuente (2% servicios generales / 10% profesionales) y emisión de comprobantes DGI
        </p>
      </div>

      {/* Alerta de éxito */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-700 font-bold hover:underline">
            Cerrar
          </button>
        </div>
      )}

      {/* Tarjetas Resumen KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Cuentas por Pagar (CxP)</span>
          <p className="text-2xl font-black text-slate-900 mt-2">
            C$ {totalCxP.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-amber-600 font-medium">{compras.length} factura(s) de proveedores</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Retenciones IR 2% Efectuadas</span>
          <p className="text-2xl font-black text-indigo-600 mt-2">
            C$ {retenciones2pct.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-indigo-500 font-medium">Servicios generales y montajes</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Retenciones IR 10% Efectuadas</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            C$ {retenciones10pct.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-emerald-600 font-medium">Servicios profesionales / expositores</span>
        </div>
      </div>

      {/* Tabla de Facturas de Proveedores */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Facturas de Suplidores Directos de Eventos</h2>
            <p className="text-xs text-slate-500">Registro de pasivos y deducciones fiscales Ley 822</p>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Registrar Factura de Proveedor</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs uppercase border-b border-slate-200">
                <th className="p-3">N° Factura</th>
                <th className="p-3">Proveedor / Suplidor</th>
                <th className="p-3">Evento & Detalle del Servicio</th>
                <th className="p-3 text-right">Subtotal</th>
                <th className="p-3 text-right">IVA 15%</th>
                <th className="p-3 text-right">Retención IR</th>
                <th className="p-3 text-right">Neto a Pagar</th>
                <th className="p-3 text-center">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {compras.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-slate-800">{p.factura}</td>
                  <td className="p-3 font-medium text-slate-900">
                    {p.proveedor}
                    <div className="text-xs text-slate-400 font-mono">RUC: {p.ruc}</div>
                  </td>
                  <td className="p-3 text-slate-700">
                    <div className="font-bold text-slate-900 text-xs">{p.evento}</div>
                    <div className="text-xs text-slate-500 italic mt-0.5">{p.detalleServicio}</div>
                  </td>
                  <td className="p-3 text-right font-mono">C$ {p.subtotal.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right font-mono text-amber-700">C$ {p.iva.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                  <td className="p-3 text-right font-mono font-bold text-indigo-700">
                    C$ {p.retencion.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                    <span className="block text-[10px] text-indigo-500 font-normal">({p.porcentajeRetencion}%)</span>
                  </td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-800">
                    C$ {p.saldo.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setRetencionSeleccionada(p)}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded transition inline-flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Retención DGI</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Registro de Factura de Proveedor */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <span>Registrar Factura de Proveedor (CxP)</span>
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarFacturaProveedor} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre o Razón Social del Proveedor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Hotel Real InterContinental"
                    value={proveedorNombre}
                    onChange={(e) => setProveedorNombre(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RUC / Cédula del Proveedor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. J0310000008888"
                    value={proveedorRUC}
                    onChange={(e) => setProveedorRUC(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">N° Factura Física del Proveedor</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. FP-5002"
                    value={numFactura}
                    onChange={(e) => setNumFactura(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Evento Asignado (Centro de Costos)</label>
                  <select
                    value={eventoNombre}
                    onChange={(e) => setEventoNombre(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  >
                    <option value="Taller Liderazgo 2026">Taller Liderazgo 2026</option>
                    <option value="Congreso de Innovación">Congreso de Innovación 2026</option>
                    <option value="Foro de Tecnología">Foro de Tecnología Managua</option>
                  </select>
                </div>
              </div>

              {/* Campo Nuevo: Detalle del Servicio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detalle o Descripción del Servicio Contratado</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Alquiler de salón de eventos, banquete, mantelería y luces"
                  value={detalleServicio}
                  onChange={(e) => setDetalleServicio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monto Subtotal (C$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={subtotalInput}
                    onChange={(e) => setSubtotalInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Servicio / Retención IR</label>
                  <select
                    value={tipoServicio}
                    onChange={(e) => setTipoServicio(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                  >
                    <option value="SERVICIOS_GENERALES">Servicios Generales / Bienes (2% IR)</option>
                    <option value="SERVICIOS_PROFESIONALES">Servicios Profesionales / Expositores (10% IR)</option>
                    <option value="SIN_RETENCION">Sin Retención de IR (0%)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="aplicaIVA"
                  checked={aplicaIVA}
                  onChange={(e) => setAplicaIVA(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="aplicaIVA" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Aplica IVA 15% (C$ {ivaNum.toLocaleString('es-NI', { minimumFractionDigits: 2 })})
                </label>
              </div>

              {/* Resumen Calculado en Tiempo Real */}
              <div className="bg-emerald-950 text-white p-3.5 rounded-xl space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300">Subtotal:</span>
                  <span>C$ {subtotalNum.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>+ IVA Trasladado (15%):</span>
                  <span>C$ {ivaNum.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-indigo-400 font-bold border-t border-slate-800 pt-1">
                  <span>- Retención IR ({pctRetencion}%):</span>
                  <span>C$ {retencionNum.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-extrabold text-sm border-t border-slate-700 pt-1.5">
                  <span>= NETO A PAGAR (CxP):</span>
                  <span>C$ {netoNum.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs shadow transition"
                >
                  Guardar Factura & Emitir Retención
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Comprobante de Retención DGI */}
      {retencionSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Comprobante de Retención en la Fuente DGI</h3>
              </div>
              <button onClick={() => setRetencionSeleccionada(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs space-y-3 font-mono">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500 font-semibold">Comprobante N°:</span>
                <span className="font-bold text-indigo-700">{retencionSeleccionada.comprobanteNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Fecha de Emisión:</span>
                <span>{retencionSeleccionada.fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Sujeto a Retención:</span>
                <span className="font-bold">{retencionSeleccionada.proveedor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">RUC Proveedor:</span>
                <span>{retencionSeleccionada.ruc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Factura Referencia:</span>
                <span>{retencionSeleccionada.factura}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Evento / Centro Costos:</span>
                <span>{retencionSeleccionada.evento}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Detalle del Servicio:</span>
                <span className="font-bold text-slate-800">{retencionSeleccionada.detalleServicio}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-slate-500 font-semibold">Base Imponible:</span>
                <span>C$ {retencionSeleccionada.subtotal.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Porcentaje Aplicado (Ley 822):</span>
                <span className="font-bold">{retencionSeleccionada.porcentajeRetencion}% IR</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-indigo-900 bg-indigo-50 p-2 rounded border border-indigo-200">
                <span>MONTO RETENIDO:</span>
                <span>C$ {retencionSeleccionada.retencion.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-mono">DGI Nicaragua - Retención en la Fuente Ley 822</span>
              <button
                onClick={() => alert(`Imprimiendo comprobante ${retencionSeleccionada.comprobanteNo}...`)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs shadow flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprobante</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
