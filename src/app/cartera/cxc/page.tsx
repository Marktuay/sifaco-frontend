'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api-client';

export interface MaestroCliente {
  id: string;
  codigo: string;
  nombre: string;
  ruc: string;
  telefono: string;
  direccion: string;
}

export interface FacturaCliente {
  id: string;
  cuotaId?: string;
  fecha: string;
  numeroFactura: string;
  subtotal: number;
  numeroNC: string;
  montoNC: number;
  porcentajeDesc: number;
  montoDesc: number;
  totalPagado: number;
  seleccionada: boolean;
  esNueva?: boolean;
}

export interface RetencionItem {
  id: string;
  recibo: string;
  factura: string;
  retenedor: string;
  comprobante: string;
  tipo: 'IR_2' | 'IR_1' | 'ALMA_1';
  base: number;
  monto: number;
}

export interface ReciboMultiFacturaRecord {
  id: string;
  numeroRecibo: string;
  cliente: string;
  codigoCliente: string;
  fecha: string;
  concepto: string;
  banco: string;
  numeroRef: string;
  laSumaDe: string;
  facturas: FacturaCliente[];
  totalBruto: number;
  totalRetenciones: number;
  netoBanco: number;
  retencionIR: number;
  retencionALMA: number;
  estado?: 'EMITIDO' | 'ANULADO';
  motivoAnulacion?: string;
}

// Maestro de Clientes (Catálogo general derivado del CRM)
const MAESTRO_CLIENTES: MaestroCliente[] = [
  { id: 'cli-dispoer', codigo: 'CLI-003', nombre: 'Farmacia DISPOER - Estelí', ruc: 'J031000004921', telefono: '2713-4410', direccion: 'Estelí, Nicaragua' },
  { id: 'cli-claro', codigo: 'CLI-002', nombre: 'Claro Nicaragua (ENITEL)', ruc: 'J031000009999', telefono: '2250-0000', direccion: 'Managua, Nicaragua' },
  { id: 'cli-bac', codigo: 'CLI-001', nombre: 'BAC Nicaragua S.A.', ruc: 'J031000001234', telefono: '2274-4444', direccion: 'Managua, Nicaragua' },
  { id: 'cli-kool', codigo: 'CLI-004', nombre: 'Distribuidora Kool S.A.', ruc: 'J031000008812', telefono: '2249-1122', direccion: 'León, Nicaragua' },
];

// Convertidor automático de números a letras en Español (Córdobas / Dólares)
function numeroALetrasNI(monto: number, moneda: string = 'NIO'): string {
  if (!monto || monto <= 0) return 'CERO CÓRDOBAS CON 00/100';

  const entero = Math.floor(monto);
  const centavos = Math.round((monto - entero) * 100);
  const nombreMoneda = moneda === 'USD' ? 'DÓLARES' : 'CÓRDOBAS';

  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const cientos = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertirGrupo(n: number): string {
    let output = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (n === 100) return 'CIEN';
    if (c > 0) output += cientos[c] + ' ';

    if (d === 1) {
      output += especiales[u];
    } else if (d === 2 && u > 0) {
      output += 'VEINTI' + unidades[u].toLowerCase();
    } else {
      if (d > 0) output += decenas[d] + (u > 0 ? ' Y ' : '');
      if (u > 0) output += unidades[u];
    }

    return output.trim();
  }

  let letras = '';
  const miles = Math.floor(entero / 1000);
  const resto = entero % 1000;

  if (miles > 0) {
    if (miles === 1) letras += 'UN MIL ';
    else letras += convertirGrupo(miles) + ' MIL ';
  }

  if (resto > 0) {
    letras += convertirGrupo(resto);
  }

  const centavosStr = centavos.toString().padStart(2, '0');
  return `${letras.trim().toUpperCase()} ${nombreMoneda} CON ${centavosStr}/100`;
}

export default function CarteraCxCPage() {
  // Facturas Pendientes Iniciales por Cliente
  const [facturasPorCliente, setFacturasPorCliente] = useState<{ [clienteId: string]: FacturaCliente[] }>({
    'cli-dispoer': [
      {
        id: 'f-3908',
        cuotaId: 'c-3908',
        fecha: '12/08/2026',
        numeroFactura: '3908',
        subtotal: 20500.0,
        numeroNC: '',
        montoNC: 0,
        porcentajeDesc: 0,
        montoDesc: 0,
        totalPagado: 20500.0,
        seleccionada: true,
      },
      {
        id: 'f-3992',
        cuotaId: 'c-3992',
        fecha: '28/08/2026',
        numeroFactura: '3992',
        subtotal: 21660.0,
        numeroNC: '',
        montoNC: 0,
        porcentajeDesc: 0,
        montoDesc: 0,
        totalPagado: 21660.0,
        seleccionada: true,
      },
    ],
    'cli-claro': [
      {
        id: 'f-a2',
        cuotaId: 'c-a2',
        fecha: '04/09/2026',
        numeroFactura: 'A-000002',
        subtotal: 46000.0,
        numeroNC: '',
        montoNC: 0,
        porcentajeDesc: 0,
        montoDesc: 0,
        totalPagado: 46000.0,
        seleccionada: true,
      },
    ],
    'cli-bac': [
      {
        id: 'f-a1',
        cuotaId: 'c-a1',
        fecha: '02/09/2026',
        numeroFactura: 'A-000001',
        subtotal: 86250.0,
        numeroNC: '',
        montoNC: 0,
        porcentajeDesc: 0,
        montoDesc: 0,
        totalPagado: 86250.0,
        seleccionada: true,
      },
    ],
  });

  const [retenciones, setRetenciones] = useState<RetencionItem[]>([
    { id: '1', recibo: '5410', factura: '3908', retenedor: 'Farmacia DISPOER - Estelí', comprobante: 'RET-DGI-9981', tipo: 'IR_2', base: 36226.09, monto: 724.52 },
    { id: '2', recibo: '5410', factura: '3908', retenedor: 'Farmacia DISPOER - Estelí', comprobante: 'RET-ALMA-4421', tipo: 'ALMA_1', base: 36226.09, monto: 362.26 },
  ]);

  const [recibosGenerados, setRecibosGenerados] = useState<ReciboMultiFacturaRecord[]>([
    {
      id: 'rc-5410',
      numeroRecibo: '5410',
      cliente: 'Farmacia DISPOER - Estelí',
      codigoCliente: 'CLI-003',
      fecha: '2026-09-11',
      concepto: 'Cancelación fact. No. 3908 y 3992',
      banco: 'LAFISE BANCENTRO',
      numeroRef: 'TF No. 147299145',
      laSumaDe: 'CUARENTA Y UN MIL SEISCIENTOS SESENTA CÓRDOBAS CON 00/100',
      facturas: [
        {
          id: 'f-3908',
          fecha: '12/08/2026',
          numeroFactura: '3908',
          subtotal: 20500.0,
          numeroNC: 'NC-102',
          montoNC: 500.0,
          porcentajeDesc: 0,
          montoDesc: 0,
          totalPagado: 20000.0,
          seleccionada: true,
        },
        {
          id: 'f-3992',
          fecha: '28/08/2026',
          numeroFactura: '3992',
          subtotal: 21660.0,
          numeroNC: '',
          montoNC: 0,
          porcentajeDesc: 0,
          montoDesc: 0,
          totalPagado: 21660.0,
          seleccionada: true,
        },
      ],
      totalBruto: 41660.0,
      totalRetenciones: 1086.78,
      netoBanco: 40573.22,
      retencionIR: 724.52,
      retencionALMA: 362.26,
    },
  ]);

  // Modal State para Recibo Multi-Factura (RINSA)
  const [modalMultiAbierto, setModalMultiAbierto] = useState(false);
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string>('cli-dispoer');

  // Form State Multi-Factura (CAMPOS LIMPIOS Y VACÍOS POR DEFECTO)
  const [numeroRecibo, setNumeroRecibo] = useState('5879');
  const [fechaRecibo, setFechaRecibo] = useState(new Date().toISOString().split('T')[0]);
  const [concepto, setConcepto] = useState('');
  const [banco, setBanco] = useState('LAFISE BANCENTRO');
  const [numeroRef, setNumeroRef] = useState('');
  const [moneda, setMoneda] = useState<'NIO' | 'USD'>('NIO');
  const [tasaCambio, setTasaCambio] = useState(36.6243);

  // Editable items in form
  const [facturasForm, setFacturasForm] = useState<FacturaCliente[]>([]);

  // Retenciones Físicas (Desactivadas y Vacías por defecto)
  const [aplicaIR, setAplicaIR] = useState(false);
  const [comprobanteIR, setComprobanteIR] = useState('');
  const [baseIR, setBaseIR] = useState(0);

  const [aplicaALMA, setAplicaALMA] = useState(false);
  const [comprobanteALMA, setComprobanteALMA] = useState('');
  const [baseALMA, setBaseALMA] = useState(0);

  // Print/Preview Modal State
  const [reciboParaVer, setReciboParaVer] = useState<ReciboMultiFacturaRecord | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Modal State Anulación de Recibo
  const [modalAnularReciboAbierto, setModalAnularReciboAbierto] = useState(false);
  const [reciboAAnular, setReciboAAnular] = useState<ReciboMultiFacturaRecord | null>(null);
  const [motivoAnulacionRecibo, setMotivoAnulacionRecibo] = useState('');

  const handleAbrirAnularRecibo = (r: ReciboMultiFacturaRecord) => {
    setReciboAAnular(r);
    setMotivoAnulacionRecibo('');
    setModalAnularReciboAbierto(true);
  };

  const handleProcesarAnulacionRecibo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reciboAAnular || !motivoAnulacionRecibo.trim()) return;

    try {
      await fetchApi(`/cartera/recibos/${reciboAAnular.id}/anular`, {
        method: 'POST',
        body: JSON.stringify({ motivo: motivoAnulacionRecibo }),
      });

      setRecibosGenerados(
        recibosGenerados.map((item) =>
          item.id === reciboAAnular.id
            ? { ...item, estado: 'ANULADO', motivoAnulacion: motivoAnulacionRecibo }
            : item
        )
      );

      setModalAnularReciboAbierto(false);
      setMensajeExito(
        `Recibo Oficial de Caja N° ${reciboAAnular.numeroRecibo} ANULADO exitosamente. Saldos de facturas restaurados y contrasiento contable generado (RECAUDO_ANULACION).`
      );
    } catch (err: any) {
      alert(`Error al anular el recibo de caja: ${err.message}`);
    }
  };

  // Cliente actual seleccionado desde el Maestro de Clientes
  const clienteActual = MAESTRO_CLIENTES.find((c) => c.id === clienteSeleccionadoId) || MAESTRO_CLIENTES[0];

  // Abrir Modal de Registro con campos limpios y vacíos
  const abrirModalMulti = (cliId: string = 'cli-dispoer') => {
    setClienteSeleccionadoId(cliId);
    const pend = facturasPorCliente[cliId] || [];

    // Mapear facturas del cliente con valores N/C y Descuento en blanco
    setFacturasForm(
      pend.map((f) => ({
        ...f,
        numeroNC: '',
        montoNC: 0,
        porcentajeDesc: 0,
        montoDesc: 0,
        totalPagado: f.subtotal,
        seleccionada: true,
      }))
    );

    // Reset de campos de texto del recibo
    setNumeroRef('');
    setConcepto('');
    setComprobanteIR('');
    setComprobanteALMA('');
    setAplicaIR(false);
    setAplicaALMA(false);
    setBaseIR(0);
    setBaseALMA(0);
    setNumeroRecibo(`${Math.floor(5880 + Math.random() * 100)}`);
    setModalMultiAbierto(true);
  };

  // Cambiar Cliente desde el selector del Modal
  const handleCambiarClienteEnModal = (nuevoCliId: string) => {
    setClienteSeleccionadoId(nuevoCliId);
    const pend = facturasPorCliente[nuevoCliId] || [];

    setFacturasForm(
      pend.map((f) => ({
        ...f,
        numeroNC: '',
        montoNC: 0,
        porcentajeDesc: 0,
        montoDesc: 0,
        totalPagado: f.subtotal,
        seleccionada: true,
      }))
    );

    setConcepto('');
  };

  // Agregar una nueva línea de factura en blanco para el mismo cliente
  const handleAgregarFacturaAlRecibo = () => {
    const nuevaFactura: FacturaCliente = {
      id: `f-new-${Date.now()}`,
      fecha: new Date().toLocaleDateString('es-NI'),
      numeroFactura: '',
      subtotal: 0,
      numeroNC: '',
      montoNC: 0,
      porcentajeDesc: 0,
      montoDesc: 0,
      totalPagado: 0,
      seleccionada: true,
      esNueva: true,
    };
    setFacturasForm([...facturasForm, nuevaFactura]);
  };

  // Eliminar una línea de factura agregada
  const handleEliminarFacturaLinea = (index: number) => {
    setFacturasForm(facturasForm.filter((_, i) => i !== index));
  };

  // Actualizar ítem de factura en el modal
  const handleFacturaItemChange = (index: number, field: keyof FacturaCliente, value: any) => {
    const list = [...facturasForm];
    const item = { ...list[index], [field]: value };

    if (field === 'subtotal' || field === 'montoNC' || field === 'montoDesc' || field === 'porcentajeDesc') {
      const sub = Number(item.subtotal) || 0;
      const nc = Number(item.montoNC) || 0;
      let desc = Number(item.montoDesc) || 0;

      if (field === 'porcentajeDesc') {
        const pct = Number(value) || 0;
        desc = Math.round((sub * (pct / 100)) * 100) / 100;
        item.montoDesc = desc;
      }

      item.totalPagado = Math.max(0, sub - nc - desc);
    }

    list[index] = item;
    setFacturasForm(list);

    // Recalcular base imponible estimada si las retenciones están marcadas
    const totalSub = list.filter((f) => f.seleccionada).reduce((sum, f) => sum + f.totalPagado, 0);
    const baseEstimada = Math.round((totalSub / 1.15) * 100) / 100;
    if (aplicaIR) setBaseIR(baseEstimada);
    if (aplicaALMA) setBaseALMA(baseEstimada);
  };

  // Totales Calculados del Modal
  const facturasSeleccionadas = facturasForm.filter((f) => f.seleccionada && f.numeroFactura.trim() !== '');
  const totalBrutoCobrado = facturasSeleccionadas.reduce((sum, f) => sum + f.totalPagado, 0);

  const montoIR = aplicaIR ? Math.round(baseIR * 0.02 * 100) / 100 : 0;
  const montoALMA = aplicaALMA ? Math.round(baseALMA * 0.01 * 100) / 100 : 0;
  const totalRetencionesCobro = montoIR + montoALMA;
  const netoBancoLiquido = Math.max(0, totalBrutoCobrado - totalRetencionesCobro);
  const laSumaDeTexto = numeroALetrasNI(totalBrutoCobrado, moneda);

  // Guardar Recibo Multi-Factura estilo RINSA
  const handleGuardarReciboMulti = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!numeroRecibo.trim()) {
      alert('Debe especificar el Número de Recibo de Caja.');
      return;
    }

    if (!numeroRef.trim()) {
      alert('Debe ingresar el Número de Referencia / Transferencia / Cheque.');
      return;
    }

    if (facturasSeleccionadas.length === 0) {
      alert('Debe ingresar y seleccionar al menos una factura válida para registrar el recibo.');
      return;
    }

    if (aplicaIR && (!comprobanteIR.trim() || baseIR <= 0)) {
      alert('Debe ingresar el número de comprobante físico y la base imponible para la Retención IR.');
      return;
    }

    if (aplicaALMA && (!comprobanteALMA.trim() || baseALMA <= 0)) {
      alert('Debe ingresar el número de comprobante físico y la base imponible para la Retención ALMA.');
      return;
    }

    setCargando(true);
    try {
      const payload = {
        numero_recibo: numeroRecibo,
        cliente_id: '00000000-0000-0000-0000-000000000003',
        codigo_cliente: clienteActual.codigo,
        recibimos_de: clienteActual.nombre,
        fecha: new Date(fechaRecibo).toISOString(),
        concepto: concepto || `Cancelación de facturas (${facturasSeleccionadas.map((f) => f.numeroFactura).join(', ')})`,
        banco: banco,
        numero_referencia: numeroRef,
        moneda: moneda,
        tasa_cambio: tasaCambio,
        facturas: facturasSeleccionadas.map((f) => ({
          fecha_factura: f.fecha,
          numero_factura: f.numeroFactura,
          subtotal: f.subtotal,
          numero_nota_credito: f.numeroNC,
          monto_nota_credito: f.montoNC,
          porcentaje_desc: f.porcentajeDesc,
          monto_descuento: f.montoDesc,
          total_pagado: f.totalPagado,
        })),
        retenciones: [
          ...(aplicaIR
            ? [
                {
                  tipo_retencion: 'IR_2',
                  numero_comprobante: comprobanteIR,
                  base_imponible: baseIR,
                  porcentaje: 2.0,
                  monto_retenido: montoIR,
                },
              ]
            : []),
          ...(aplicaALMA
            ? [
                {
                  tipo_retencion: 'ALMA_1',
                  numero_comprobante: comprobanteALMA,
                  base_imponible: baseALMA,
                  porcentaje: 1.0,
                  monto_retenido: montoALMA,
                },
              ]
            : []),
        ],
      };

      // Intentar enviar al backend Go
      await fetchApi('/cartera/recibos-multi', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const nuevoRecord: ReciboMultiFacturaRecord = {
        id: `rc-${numeroRecibo}`,
        numeroRecibo: numeroRecibo,
        cliente: clienteActual.nombre,
        codigoCliente: clienteActual.codigo,
        fecha: fechaRecibo,
        concepto: concepto || `Cancelación de facturas (${facturasSeleccionadas.map((f) => f.numeroFactura).join(', ')})`,
        banco: banco,
        numeroRef: numeroRef,
        laSumaDe: laSumaDeTexto,
        facturas: [...facturasSeleccionadas],
        totalBruto: totalBrutoCobrado,
        totalRetenciones: totalRetencionesCobro,
        netoBanco: netoBancoLiquido,
        retencionIR: montoIR,
        retencionALMA: montoALMA,
      };

      setRecibosGenerados([nuevoRecord, ...recibosGenerados]);
      setModalMultiAbierto(false);
      setMensajeExito(
        `Recibo Oficial de Caja N° ${numeroRecibo} (RINSA) registrado exitosamente para ${clienteActual.nombre} por C$ ${totalBrutoCobrado.toLocaleString(
          'es-NI',
          { minimumFractionDigits: 2 }
        )}. Asiento contable de recaudo generado.`
      );
      setReciboParaVer(nuevoRecord);
    } catch (err: any) {
      alert(`Error al registrar recibo: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  // Totales Globales
  const totalCarteraCxC = Object.values(facturasPorCliente).reduce(
    (acc, list) => acc + list.reduce((sum, f) => sum + f.totalPagado, 0),
    0
  );
  const totalRetencionesIRGlobal = retenciones
    .filter((r) => r.tipo === 'IR_2' || r.tipo === 'IR_1')
    .reduce((acc, r) => acc + r.monto, 0);
  const totalRetencionesALMAGlobal = retenciones
    .filter((r) => r.tipo === 'ALMA_1')
    .reduce((acc, r) => acc + r.monto, 0);

  return (
    <div className="space-y-8">
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cuentas por Cobrar (CxC) & Recibos de Caja</h1>
          <p className="text-slate-500 text-sm">
            Emisión de Recibos Oficiales de Caja estilo RINSA (N° 5410) para un único cliente con campos limpios y maestro CRM.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => abrirModalMulti('cli-dispoer')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center space-x-2 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>+ Recibo Multi-Factura (Estilo RINSA)</span>
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-sm font-semibold flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Total Cartera CxC</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            C$ {totalCarteraCxC.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-emerald-600 font-medium">Facturas pendientes por cobrar</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Retenciones IR DGI (Mes)</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-2">
            C$ {totalRetencionesIRGlobal.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-indigo-500 font-medium">Comprobantes IR 2%/1% a acreditar</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Retenciones ALMA (Mes)</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">
            C$ {totalRetencionesALMAGlobal.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-amber-500 font-medium">Retención municipal 1% recibida</span>
        </div>
      </div>

      {/* Tabla de Facturas Pendientes por Cliente (Maestro CRM) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Cartera de Facturas Pendientes por Cliente (Maestro CRM)</h2>
            <p className="text-xs text-slate-500">Facturas registradas por cada cliente en el sistema</p>
          </div>
        </div>

        <div className="space-y-6">
          {MAESTRO_CLIENTES.map((cli) => {
            const list = facturasPorCliente[cli.id] || [];
            if (list.length === 0) return null;

            return (
              <div key={cli.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono mr-2">
                      {cli.codigo}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{cli.nombre}</span>
                    <span className="text-xs text-slate-500 ml-2">(RUC: {cli.ruc})</span>
                  </div>
                  <button
                    onClick={() => abrirModalMulti(cli.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded shadow-sm transition"
                  >
                    + Recibo Multi-Factura
                  </button>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-slate-500 text-[11px] uppercase border-b border-slate-200 font-semibold">
                      <th className="p-3">Factura N°</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3 text-right">Sub Total C$</th>
                      <th className="p-3 text-right font-bold text-slate-700">Total Pendiente C$</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-mono">
                    {list.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-indigo-700">{f.numeroFactura}</td>
                        <td className="p-3 text-slate-600">{f.fecha}</td>
                        <td className="p-3 text-right text-slate-900">C$ {f.subtotal.toFixed(2)}</td>
                        <td className="p-3 text-right font-extrabold text-emerald-700">C$ {f.totalPagado.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de Recibos Oficiales de Caja Registrados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Recibos Oficiales de Caja Emitidos</h2>
            <p className="text-xs text-slate-500">Historial de recibos multi-factura con formato RINSA N° 5410</p>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs uppercase border-b border-slate-200 font-bold">
                <th className="py-3 px-3 w-[12%]">Recibo N°</th>
                <th className="py-3 px-3 w-[10%]">Fecha</th>
                <th className="py-3 px-3 w-[22%]">Cliente</th>
                <th className="py-3 px-3 w-[16%]">Banco / Referencia</th>
                <th className="py-3 px-3 w-[12%] text-right">Total Cobrado</th>
                <th className="py-3 px-3 w-[12%] text-right">Retenciones</th>
                <th className="py-3 px-3 w-[10%] text-right">Neto Banco</th>
                <th className="py-3 px-3 w-[6%] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {recibosGenerados.map((r) => (
                <tr key={r.id} className={r.estado === 'ANULADO' ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                  <td className="p-3 font-mono font-bold text-emerald-700">Recibo N° {r.numeroRecibo}</td>
                  <td className="p-3 text-xs text-slate-600">{r.fecha}</td>
                  <td className="p-3 font-medium text-slate-900">{r.cliente}</td>
                  <td className="p-3 text-xs text-slate-600">
                    <span className="font-semibold">{r.banco}:</span> {r.numeroRef}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">
                    C$ {r.totalBruto.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono text-indigo-700">
                    C$ {r.totalRetenciones.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-700">
                    C$ {r.netoBanco.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded font-extrabold border ${
                        r.estado === 'ANULADO'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {r.estado || 'EMITIDO'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => setReciboParaVer(r)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded border border-indigo-200 transition"
                      >
                        🖨️ Ver / Imprimir
                      </button>

                      {r.estado !== 'ANULADO' && (
                        <button
                          onClick={() => handleAbrirAnularRecibo(r)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-2.5 py-1 rounded shadow-xs transition"
                        >
                          🚫 Anular
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprobantes de Retención Físicos Recibidos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Comprobantes Físicos de Retención DGI / ALMA Recibidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-xs uppercase border-b border-slate-200">
                <th className="p-3">N° Comprobante</th>
                <th className="p-3">Recibo / Factura</th>
                <th className="p-3">Retenedor (Cliente)</th>
                <th className="p-3">Tipo Retención</th>
                <th className="p-3 text-right">Base Imponible</th>
                <th className="p-3 text-right">Monto Retenido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {retenciones.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-indigo-700">{r.comprobante}</td>
                  <td className="p-3 font-mono text-slate-600">Recibo N° {r.recibo} ({r.factura})</td>
                  <td className="p-3 font-medium text-slate-900">{r.retenedor}</td>
                  <td className="p-3">
                    <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs px-2 py-0.5 rounded font-mono font-bold">
                      {r.tipo === 'IR_2' ? 'IR 2% (Servicios DGI)' : r.tipo === 'IR_1' ? 'IR 1% (Bienes DGI)' : 'ALMA 1% (Municipal)'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">C$ {r.base.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">C$ {r.monto.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL REGISTRAR RECIBO OFICIAL DE CAJA (ESTILO RINSA - UN SOLO CLIENTE)    */}
      {/* ========================================================================= */}
      {modalMultiAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl overflow-hidden space-y-4 p-6 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            {/* Header del Modal */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Registrar Recibo Oficial de Caja Multi-Factura</h3>
                <p className="text-xs text-slate-500">
                  Permite abonar o cancelar múltiples facturas para un cliente en un solo recibo con desglose contable.
                </p>
              </div>
              <button
                onClick={() => setModalMultiAbierto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleGuardarReciboMulti} className="space-y-6">
              {/* Sección 1: Selección de Cliente del Maestro CRM y Datos Principales */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CLIENTE (Maestro CRM)</label>
                  <select
                    value={clienteSeleccionadoId}
                    onChange={(e) => handleCambiarClienteEnModal(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {MAESTRO_CLIENTES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} ({c.codigo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">RECIBO N°</label>
                  <input
                    type="text"
                    value={numeroRecibo}
                    onChange={(e) => setNumeroRecibo(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono font-bold text-emerald-700"
                    placeholder="ej. 5879"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">FECHA</label>
                  <input
                    type="date"
                    value={fechaRecibo}
                    onChange={(e) => setFechaRecibo(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono"
                    required
                  />
                </div>
              </div>

              {/* Sección 2: Tabla de Facturas del Cliente (Optimizado con Scroll Horizontal y Anchos Claros) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      FACTURAS A INCLUIR EN EL RECIBO ({clienteActual.nombre})
                    </h4>
                    <p className="text-xs text-slate-500">Marque las facturas que cancela o abona el cliente e ingrese si aplica N/C o Descuento</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAgregarFacturaAlRecibo}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded shadow-xs flex items-center space-x-1 transition"
                  >
                    <span>+ Agregar Factura al Recibo</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-xs bg-white">
                  <table className="w-full min-w-[1000px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase border-b border-slate-200 font-bold">
                        <th className="p-2 text-center w-12">INCLUIR</th>
                        <th className="p-2 w-28">FECHA FACT.</th>
                        <th className="p-2 w-28">FACTURA N°</th>
                        <th className="p-2 text-right w-32">SUB TOTAL C$</th>
                        <th className="p-2 text-center w-24">N° N/C</th>
                        <th className="p-2 text-right w-28">N/C MONTO C$</th>
                        <th className="p-2 text-right w-20">% DESC.</th>
                        <th className="p-2 text-right w-24">DESC. C$</th>
                        <th className="p-2 text-right w-36 font-black text-emerald-900 bg-emerald-100/50">TOTAL PAGADO C$</th>
                        <th className="p-2 text-center w-16">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs">
                      {facturasForm.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="p-6 text-center text-slate-400 italic">
                            No hay facturas pendientes para este cliente. Haga clic en "+ Agregar Factura al Recibo" para ingresar una nueva.
                          </td>
                        </tr>
                      ) : (
                        facturasForm.map((item, idx) => (
                          <tr key={item.id} className={item.seleccionada ? 'bg-emerald-50/40' : 'opacity-60 bg-slate-50'}>
                            <td className="p-2 text-center">
                              <input
                                type="checkbox"
                                checked={item.seleccionada}
                                onChange={(e) => handleFacturaItemChange(idx, 'seleccionada', e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="p-2 font-mono">
                              <input
                                type="text"
                                value={item.fecha}
                                onChange={(e) => handleFacturaItemChange(idx, 'fecha', e.target.value)}
                                className="w-full border border-slate-300 rounded px-2 py-1 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                                placeholder="12/08/2026"
                                disabled={!item.seleccionada}
                              />
                            </td>
                            <td className="p-2 font-mono font-bold text-indigo-700">
                              <input
                                type="text"
                                value={item.numeroFactura}
                                onChange={(e) => handleFacturaItemChange(idx, 'numeroFactura', e.target.value)}
                                className="w-full border border-slate-300 rounded px-2 py-1 font-mono font-bold text-xs focus:ring-1 focus:ring-emerald-500"
                                placeholder="3908"
                                disabled={!item.seleccionada}
                              />
                            </td>
                            <td className="p-2 text-right font-mono">
                              <input
                                type="number"
                                step="0.01"
                                value={item.subtotal === 0 ? '' : item.subtotal}
                                onChange={(e) => handleFacturaItemChange(idx, 'subtotal', Number(e.target.value))}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-right font-mono text-xs font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                                placeholder="0.00"
                                disabled={!item.seleccionada}
                              />
                            </td>
                            <td className="p-2 text-center font-mono">
                              <input
                                type="text"
                                value={item.numeroNC}
                                onChange={(e) => handleFacturaItemChange(idx, 'numeroNC', e.target.value)}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-center font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500"
                                placeholder="NC-102"
                                disabled={!item.seleccionada}
                              />
                            </td>
                            <td className="p-2 text-right font-mono">
                              <input
                                type="number"
                                step="0.01"
                                value={item.montoNC === 0 ? '' : item.montoNC}
                                onChange={(e) => handleFacturaItemChange(idx, 'montoNC', Number(e.target.value))}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-right font-mono text-xs text-rose-600 font-semibold placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500"
                                placeholder="0.00"
                                disabled={!item.seleccionada}
                              />
                            </td>
                            <td className="p-2 text-right font-mono">
                              <input
                                type="number"
                                step="0.1"
                                value={item.porcentajeDesc === 0 ? '' : item.porcentajeDesc}
                                onChange={(e) => handleFacturaItemChange(idx, 'porcentajeDesc', Number(e.target.value))}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-right font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500"
                                placeholder="0"
                                disabled={!item.seleccionada}
                              />
                            </td>
                            <td className="p-2 text-right font-mono text-amber-700 font-semibold">
                              C$ {item.montoDesc.toFixed(2)}
                            </td>
                            <td className="p-2 text-right font-mono text-sm bg-emerald-50/80 border-l border-r border-emerald-200">
                              <span className="font-extrabold text-emerald-950 px-1 py-0.5 rounded">
                                C$ {item.totalPagado.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              {item.esNueva ? (
                                <button
                                  type="button"
                                  onClick={() => handleEliminarFacturaLinea(idx)}
                                  className="text-rose-500 hover:text-rose-700 font-bold px-2 py-0.5 rounded text-xs"
                                  title="Eliminar esta línea"
                                >
                                  🗑️
                                </button>
                              ) : (
                                <span className="text-slate-300 text-[10px]">Pendiente</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sección 3: Datos de Pago y Banco (Campos vacíos por defecto) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">BANCO DE DEPÓSITO / CHEQUE</label>
                  <select
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="LAFISE BANCENTRO">LAFISE BANCENTRO</option>
                    <option value="BAC NICARAGUA">BAC SAN JOSÉ / NICARAGUA</option>
                    <option value="BANPRO">BANPRO GRUPO PROMERICA</option>
                    <option value="FICOHSA">BANCO FICOHSA</option>
                    <option value="CAJA GENERAL">CAJA GENERAL (EFECTIVO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">N° REFERENCIA / TRANSFERENCIA / CHEQUE</label>
                  <input
                    type="text"
                    value={numeroRef}
                    onChange={(e) => setNumeroRef(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm font-mono placeholder:text-slate-300"
                    placeholder="Ej. TF No. 147299145"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CONCEPTO GENERAL DEL RECIBO</label>
                  <input
                    type="text"
                    value={concepto}
                    onChange={(e) => setConcepto(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm placeholder:text-slate-300"
                    placeholder="Ej. Cancelación de fact. No. 3908 y 3992"
                    required
                  />
                </div>
              </div>

              {/* Sección 4: Comprobantes Físicos de Retención IR y ALMA (Desactivados por defecto) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  COMPROBANTES FÍSICOS DE RETENCIÓN RECIBIDOS DEL CLIENTE
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Retención IR 2% */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold text-indigo-900 cursor-pointer">
                      <span className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={aplicaIR}
                          onChange={(e) => {
                            setAplicaIR(e.target.checked);
                            if (e.target.checked && baseIR === 0) {
                              const baseEst = Math.round((totalBrutoCobrado / 1.15) * 100) / 100;
                              setBaseIR(baseEst);
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Retención IR 2% (Servicios DGI)</span>
                      </span>
                      <span className="font-mono text-indigo-700">Monto: C$ {montoIR.toFixed(2)}</span>
                    </label>
                    {aplicaIR && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">N° Comprobante Físico</label>
                          <input
                            type="text"
                            value={comprobanteIR}
                            onChange={(e) => setComprobanteIR(e.target.value)}
                            className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs font-mono placeholder:text-slate-300"
                            placeholder="RET-DGI-2026-XXXX"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Base Imponible (C$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={baseIR === 0 ? '' : baseIR}
                            onChange={(e) => setBaseIR(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Retención ALMA 1% */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                    <label className="flex items-center justify-between text-xs font-bold text-amber-900 cursor-pointer">
                      <span className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={aplicaALMA}
                          onChange={(e) => {
                            setAplicaALMA(e.target.checked);
                            if (e.target.checked && baseALMA === 0) {
                              const baseEst = Math.round((totalBrutoCobrado / 1.15) * 100) / 100;
                              setBaseALMA(baseEst);
                            }
                          }}
                          className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                        />
                        <span>Retención Municipal ALMA 1%</span>
                      </span>
                      <span className="font-mono text-amber-700">Monto: C$ {montoALMA.toFixed(2)}</span>
                    </label>
                    {aplicaALMA && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">N° Comprobante Físico</label>
                          <input
                            type="text"
                            value={comprobanteALMA}
                            onChange={(e) => setComprobanteALMA(e.target.value)}
                            className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs font-mono placeholder:text-slate-300"
                            placeholder="RET-ALMA-2026-XXXX"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Base Imponible (C$)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={baseALMA === 0 ? '' : baseALMA}
                            onChange={(e) => setBaseALMA(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs font-mono"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conversión automática a Letras */}
              <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-200 space-y-1">
                <span className="block text-[11px] font-bold text-indigo-700 uppercase">LA SUMA DE (EN LETRAS):</span>
                <p className="text-xs font-mono font-bold text-indigo-950 uppercase">{laSumaDeTexto}</p>
              </div>

              {/* Resumen Final de Cobro y Neto Líquido */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-right space-y-1">
                <div className="text-xs text-slate-600 font-medium">
                  Total Bruto Cobrado (Facturas): C$ {totalBrutoCobrado.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-indigo-700 font-medium">
                  (-) Total Retenciones Físicas DGI/ALMA: C$ {totalRetencionesCobro.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-lg font-extrabold text-emerald-950 border-t border-emerald-300 pt-2">
                  NETO LÍQUIDO A INGRESAR EN BANCO: C$ {netoBancoLiquido.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end space-x-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setModalMultiAbierto(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando || facturasSeleccionadas.length === 0}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow transition flex items-center space-x-2"
                >
                  {cargando ? 'Procesando Recibo...' : 'Guardar Recibo RINSA & Generar Asiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE IMPRESIÓN Y VISTA PREVIA RECIBO OFICIAL DE CAJA RINSA N° 5410    */}
      {/* ========================================================================= */}
      {reciboParaVer && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden space-y-4 p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 no-print">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Vista Previa / Formato de Impresión Recibo N° {reciboParaVer.numeroRecibo}</h3>
                <p className="text-xs text-slate-500">Diseño réplica exacta de la papelería física de Red Innovation S.A. (RINSA)</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded shadow transition"
                >
                  🖨️ Imprimir Recibo
                </button>
                <button onClick={() => setReciboParaVer(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none px-2">
                  &times;
                </button>
              </div>
            </div>

            {/* Documento Imprimible Recibo Oficial RINSA N° 5410 */}
            <div className="border border-slate-800 p-6 rounded-lg bg-white space-y-4 text-slate-900 font-sans print-area">
              {/* Encabezado RINSA */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">RED INNOVATION, S.A.</h2>
                  <p className="text-xs font-bold text-slate-700">RUC: J031000029910</p>
                  <p className="text-xs text-slate-600">Servicios Integrales de Facturación y Administración de Eventos</p>
                  <p className="text-xs text-slate-600">Managua, Nicaragua | Tel: (505) 2278-0000</p>
                </div>
                <div className="text-right border-2 border-emerald-700 bg-emerald-50 px-4 py-2 rounded-md">
                  <span className="text-xs font-extrabold uppercase text-emerald-800 block">RECIBO OFICIAL DE CAJA</span>
                  <span className="text-2xl font-black text-rose-600 font-mono">N° {reciboParaVer.numeroRecibo}</span>
                </div>
              </div>

              {/* Grilla de Datos de la Transacción */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-slate-300 p-3 rounded bg-slate-50 font-mono">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Código Cliente:</span>
                  <span className="font-bold text-slate-900">{reciboParaVer.codigoCliente}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Fecha:</span>
                  <span className="font-bold text-slate-900">{reciboParaVer.fecha}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">Recibimos De:</span>
                  <span className="font-bold text-slate-900">{reciboParaVer.cliente}</span>
                </div>

                <div className="col-span-4 border-t border-slate-200 pt-2">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">La Suma De (En Letras):</span>
                  <span className="font-bold text-indigo-900 uppercase">{reciboParaVer.laSumaDe}</span>
                </div>

                <div className="col-span-4 border-t border-slate-200 pt-2">
                  <span className="text-slate-500 block uppercase text-[10px] font-bold">En Concepto De:</span>
                  <span className="font-bold text-slate-900">{reciboParaVer.concepto}</span>
                </div>
              </div>

              {/* Tabla Desglose de Facturas (Formato exacto RINSA N° 5410) */}
              <div>
                <table className="w-full text-left border-collapse border border-slate-800 text-xs">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 uppercase font-bold border-b border-slate-800 text-[10px]">
                      <th className="p-2 border-r border-slate-800">Fecha Fact.</th>
                      <th className="p-2 border-r border-slate-800">Factura N°</th>
                      <th className="p-2 border-r border-slate-800 text-right">Sub Total C$</th>
                      <th className="p-2 border-r border-slate-800 text-center">N° N/C</th>
                      <th className="p-2 border-r border-slate-800 text-right">N/C Monto C$</th>
                      <th className="p-2 border-r border-slate-800 text-right">% Desc.</th>
                      <th className="p-2 border-r border-slate-800 text-right">Desc. C$</th>
                      <th className="p-2 text-right font-extrabold">Total Pagado C$</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400 font-mono">
                    {reciboParaVer.facturas.map((f, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border-r border-slate-400">{f.fecha}</td>
                        <td className="p-2 border-r border-slate-400 font-bold">{f.numeroFactura}</td>
                        <td className="p-2 border-r border-slate-400 text-right">
                          C$ {f.subtotal.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 border-r border-slate-400 text-center">{f.numeroNC || '-'}</td>
                        <td className="p-2 border-r border-slate-400 text-right">
                          {f.montoNC > 0 ? `C$ ${f.montoNC.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-2 border-r border-slate-400 text-right">{f.porcentajeDesc}%</td>
                        <td className="p-2 border-r border-slate-400 text-right">
                          {f.montoDesc > 0 ? `C$ ${f.montoDesc.toFixed(2)}` : '-'}
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900">
                          C$ {f.totalPagado.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-800 text-xs font-mono">
                      <td colSpan={7} className="p-2 text-right uppercase tracking-wider">
                        Total Bruto Cobrado C$:
                      </td>
                      <td className="p-2 text-right font-black text-slate-900 text-sm">
                        C$ {reciboParaVer.totalBruto.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Detalle Banco, Referencias y Retenciones */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="border border-slate-300 p-3 rounded bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 uppercase text-[11px]">
                    Forma de Pago & Banco
                  </div>
                  <div><span className="text-slate-500">Banco:</span> <strong className="text-slate-900">{reciboParaVer.banco}</strong></div>
                  <div><span className="text-slate-500">N° Referencia:</span> <strong>{reciboParaVer.numeroRef}</strong></div>
                  <div><span className="text-slate-500">Valor Ingresado:</span> <strong className="text-emerald-700">C$ {reciboParaVer.netoBanco.toFixed(2)}</strong></div>
                </div>

                <div className="border border-slate-300 p-3 rounded bg-slate-50 space-y-1 text-right">
                  <div className="font-bold text-slate-800 border-b border-slate-200 pb-1 uppercase text-[11px] text-left">
                    Resumen de Retenciones Físicas DGI/ALMA
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Retención IR 2%:</span>
                    <span className="font-bold text-indigo-700">C$ {reciboParaVer.retencionIR.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Retención ALMA 1%:</span>
                    <span className="font-bold text-amber-700">C$ {reciboParaVer.retencionALMA.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold border-t border-slate-200 pt-1 text-slate-900">
                    <span>Total Retenciones:</span>
                    <span>C$ {reciboParaVer.totalRetenciones.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Firmas de Conformidad */}
              <div className="grid grid-cols-3 gap-6 pt-8 text-center text-[11px] font-bold text-slate-700">
                <div className="border-t border-slate-800 pt-1">
                  Firma Autorizada
                </div>
                <div className="border-t border-slate-800 pt-1">
                  Entregué Conforme (Cliente)
                </div>
                <div className="border-t border-slate-800 pt-1">
                  Recibí Conforme (Caja RINSA)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMACIÓN DE ANULACIÓN DE RECIBO DE CAJA                       */}
      {/* ========================================================================= */}
      {modalAnularReciboAbierto && reciboAAnular && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-rose-700">Anular Recibo N° {reciboAAnular.numeroRecibo}</h3>
              <button
                onClick={() => setModalAnularReciboAbierto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Se anulará el recibo de caja <strong className="text-slate-900">N° {reciboAAnular.numeroRecibo}</strong> por C$ {reciboAAnular.totalBruto.toFixed(2)}. Se restaurarán los saldos pendientes de las facturas cobradas y se generará el contrasiento contable (RECAUDO_ANULACION).
            </p>

            <form onSubmit={handleProcesarAnulacionRecibo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motivo de Anulación</label>
                <textarea
                  value={motivoAnulacionRecibo}
                  onChange={(e) => setMotivoAnulacionRecibo(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500"
                  rows={3}
                  placeholder="ej. Error en banco o duplicidad de transferencia del cliente"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => setModalAnularReciboAbierto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow"
                >
                  Confirmar Anulación de Recibo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
