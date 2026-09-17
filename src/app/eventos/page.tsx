'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Receipt, 
  Eye, 
  Plus, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  Coffee, 
  Tv, 
  X, 
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Search,
  LayoutGrid,
  List,
  ChevronRight,
  PieChart,
  Tag
} from 'lucide-react';

interface EventoItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  capacidad: number;
  cantidadStands: number;
  cantidadSalones: number;
  cateringRequerido: boolean;
  audiovisualRequerido: boolean;
  ingresosFacturados: number;
  gastosProveedores: number;
  margenBruto: number;
  rentabilidadPct: number;
  estado: string;
}

interface FacturaClienteMock {
  numero: string;
  cliente: string;
  ruc: string;
  subtotal: number;
  iva: number;
  total: number;
  fecha: string;
  estado: string;
}

interface GastoProveedorMock {
  numeroFactura: string;
  proveedor: string;
  ruc: string;
  concepto: string;
  subtotal: number;
  retencionIr: number;
  totalPagar: number;
  fecha: string;
  estado: string;
}

export default function EventosPage() {
  const router = useRouter();

  // Control de Vista: 'grid' (Tarjetas Ejecutivas) vs 'table' (Tabla Compacta)
  const [vistaModo, setVistaModo] = useState<'grid' | 'table'>('grid');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'ACTIVO' | 'PROGRAMADO'>('TODOS');

  const [eventos, setEventos] = useState<EventoItem[]>([
    {
      id: '1',
      codigo: 'EVT-2026-001',
      nombre: 'Taller de Liderazgo Corporativo & Gestión Estratégica',
      descripcion: 'Capacitación intensiva para ejecutivos de alto nivel enfocada en toma de decisiones y dirección de equipos multidisciplinarios.',
      fecha: '15/10/2026',
      lugar: 'Hotel Real InterContinental Managua',
      capacidad: 120,
      cantidadStands: 8,
      cantidadSalones: 2,
      cateringRequerido: true,
      audiovisualRequerido: true,
      ingresosFacturados: 172500.0,
      gastosProveedores: 117750.0,
      margenBruto: 54750.0,
      rentabilidadPct: 31.7,
      estado: 'ACTIVO',
    },
    {
      id: '2',
      codigo: 'EVT-2026-002',
      nombre: 'Congreso Internacional de Innovación Financiera',
      descripcion: 'Foro especializado sobre transformación digital bancaria, FinTech, regulaciones DGI y gestión de riesgos corporativos.',
      fecha: '20/11/2026',
      lugar: 'Centro de Convenciones Crowne Plaza',
      capacidad: 300,
      cantidadStands: 15,
      cantidadSalones: 4,
      cateringRequerido: true,
      audiovisualRequerido: true,
      ingresosFacturados: 92000.0,
      gastosProveedores: 40250.0,
      margenBruto: 51750.0,
      rentabilidadPct: 56.2,
      estado: 'PROGRAMADO',
    },
  ]);

  // Modal State para Crear Evento
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoCodigo, setNuevoCodigo] = useState(`EVT-2026-00${eventos.length + 1}`);
  const [nuevaFecha, setNuevaFecha] = useState('2026-12-05');
  const [nuevoLugar, setNuevoLugar] = useState('Hotel Barceló Montelimar');
  const [nuevaCapacidad, setNuevaCapacidad] = useState(150);
  const [nuevaCantStands, setNuevaCantStands] = useState(10);
  const [nuevaCantSalones, setNuevaCantSalones] = useState(2);
  const [cateringRequerido, setCateringRequerido] = useState(true);
  const [audiovisualRequerido, setAudiovisualRequerido] = useState(true);
  const [nuevoIngreso, setNuevoIngreso] = useState(120000);
  const [nuevoGasto, setNuevoGasto] = useState(65000);

  // Modal State para Detalle Financiero
  const [eventoSeleccionadoDetalle, setEventoSeleccionadoDetalle] = useState<EventoItem | null>(null);

  // Eventos Filtrados
  const eventosFiltrados = eventos.filter((e) => {
    const coincideBusqueda = e.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      e.codigo.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      e.lugar.toLowerCase().includes(filtroBusqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'TODOS' || e.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  // Totales Calculados
  const totalIngresos = eventos.reduce((acc, e) => acc + e.ingresosFacturados, 0);
  const totalGastos = eventos.reduce((acc, e) => acc + e.gastosProveedores, 0);
  const totalMargen = totalIngresos - totalGastos;
  const margenPromedioPct = totalIngresos > 0 ? ((totalMargen / totalIngresos) * 100).toFixed(1) : '0.0';

  const handleCrearEvento = (e: React.FormEvent) => {
    e.preventDefault();
    const ingresos = Number(nuevoIngreso) || 0;
    const gastos = Number(nuevoGasto) || 0;
    const margen = ingresos - gastos;
    const rentabilidad = ingresos > 0 ? Number(((margen / ingresos) * 100).toFixed(1)) : 0;

    const nuevo: EventoItem = {
      id: Date.now().toString(),
      codigo: nuevoCodigo || `EVT-2026-00${eventos.length + 1}`,
      nombre: nuevoNombre || 'Nuevo Evento Corporativo',
      descripcion: nuevaDescripcion || 'Sin descripción detallada asignada.',
      fecha: nuevaFecha ? new Date(nuevaFecha).toLocaleDateString('es-NI') : '01/12/2026',
      lugar: nuevoLugar || 'Centro de Convenciones',
      capacidad: Number(nuevaCapacidad) || 100,
      cantidadStands: Number(nuevaCantStands) || 0,
      cantidadSalones: Number(nuevaCantSalones) || 1,
      cateringRequerido: cateringRequerido,
      audiovisualRequerido: audiovisualRequerido,
      ingresosFacturados: ingresos,
      gastosProveedores: gastos,
      margenBruto: margen,
      rentabilidadPct: rentabilidad,
      estado: 'PROGRAMADO',
    };

    setEventos([...eventos, nuevo]);
    setModalAbierto(false);
    setNuevoNombre('');
    setNuevaDescripcion('');
    setNuevoCodigo(`EVT-2026-00${eventos.length + 2}`);
  };

  const getFacturasClienteMock = (evento: EventoItem): FacturaClienteMock[] => [
    {
      numero: '001-001-01-00004521',
      cliente: 'Corporación Financiera de Nicaragua S.A.',
      ruc: 'J0310000098234',
      subtotal: evento.ingresosFacturados * 0.87,
      iva: evento.ingresosFacturados * 0.13,
      total: evento.ingresosFacturados,
      fecha: evento.fecha,
      estado: 'PAGADA',
    },
  ];

  const getGastosProveedorMock = (evento: EventoItem): GastoProveedorMock[] => [
    {
      numeroFactura: 'FAC-PROV-90812',
      proveedor: 'Servicios de Audiovisual & Pantallas LED Nicaragua',
      ruc: 'J0310000129841',
      concepto: 'Alquiler de Pantallas LED, Microfonía y Live Streaming',
      subtotal: evento.gastosProveedores * 0.6,
      retencionIr: (evento.gastosProveedores * 0.6) * 0.02,
      totalPagar: (evento.gastosProveedores * 0.6) * 0.98,
      fecha: evento.fecha,
      estado: 'REGISTRADO',
    },
    {
      numeroFactura: 'FAC-HOTEL-4402',
      proveedor: 'Hotel & Centro de Convenciones Real InterContinental',
      ruc: 'J0310000011223',
      concepto: 'Renta de Salón Principal & Servicio de Catering / Coffee Break',
      subtotal: evento.gastosProveedores * 0.4,
      retencionIr: (evento.gastosProveedores * 0.4) * 0.02,
      totalPagar: (evento.gastosProveedores * 0.4) * 0.98,
      fecha: evento.fecha,
      estado: 'PAGADO',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Eventos y Centros de Costo</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gestión operativa de conferencias y talleres con análisis en tiempo real de rentabilidad por centro de costo
          </p>
        </div>

        <button
          onClick={() => setModalAbierto(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Crear Nuevo Evento</span>
        </button>
      </div>

      {/* Tarjetas Resumen Ejecutivas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start transition hover:border-slate-300">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Ingresos Facturados</span>
            <p className="text-2xl font-mono font-extrabold text-slate-900 mt-2">
              C$ {totalIngresos.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-emerald-600 font-semibold flex items-center mt-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Facturación Emitida a Clientes
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start transition hover:border-slate-300">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Costos Proveedores (CxP)</span>
            <p className="text-2xl font-mono font-extrabold text-rose-600 mt-2">
              C$ {totalGastos.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-rose-500 font-semibold flex items-center mt-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> Egresos directos del evento
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-start transition hover:border-slate-300">
          <div>
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Margen Bruto Promedio</span>
            <p className="text-2xl font-mono font-extrabold text-indigo-600 mt-2">
              C$ {totalMargen.toLocaleString('es-NI', { minimumFractionDigits: 2 })} <span className="text-lg font-bold">({margenPromedioPct}%)</span>
            </p>
            <span className="text-xs text-indigo-500 font-semibold flex items-center mt-1.5">
              <Sparkles className="w-3.5 h-3.5 mr-0.5" /> Rentabilidad neta acumulada
            </span>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Selector de Vista */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Campo de búsqueda */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o sede..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filtro por estado + Conmutador de Vista */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFiltroEstado('TODOS')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${filtroEstado === 'TODOS' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Todos ({eventos.length})
            </button>
            <button
              onClick={() => setFiltroEstado('ACTIVO')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${filtroEstado === 'ACTIVO' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Activos
            </button>
            <button
              onClick={() => setFiltroEstado('PROGRAMADO')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${filtroEstado === 'PROGRAMADO' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Programados
            </button>
          </div>

          <div className="border-l border-slate-200 pl-3 flex items-center space-x-1">
            <button
              onClick={() => setVistaModo('grid')}
              className={`p-2 rounded-xl transition ${vistaModo === 'grid' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              title="Vista en Tarjetas Ejecutivas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVistaModo('table')}
              className={`p-2 rounded-xl transition ${vistaModo === 'table' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              title="Vista en Tabla Extendida"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* VISTA 1: TARJETAS EJECUTIVAS (UX RECOMENDADA - CERO RECORTE) */}
      {vistaModo === 'grid' && (
        <div className="grid grid-cols-1 gap-6">
          {eventosFiltrados.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Fila 1: Encabezado del Evento */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {e.codigo}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${e.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                        ● {e.estado}
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                      {e.nombre}
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                      {e.descripcion}
                    </p>
                  </div>

                  {/* Iconos de Infraestructura y Sede */}
                  <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{e.fecha}</span>
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{e.lugar}</span>
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono font-bold flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{e.capacidad} pax</span>
                    </span>
                  </div>
                </div>

                {/* Fila 2: Desglose Financiero & Acciones Operativas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Métricas Financieras (8 columnas) */}
                  <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ingresos Facturados</span>
                      <span className="text-sm font-mono font-extrabold text-emerald-700 block mt-0.5">
                        C$ {e.ingresosFacturados.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gastos Proveedores</span>
                      <span className="text-sm font-mono font-extrabold text-rose-600 block mt-0.5">
                        C$ {e.gastosProveedores.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Margen Bruto</span>
                      <span className="text-sm font-mono font-extrabold text-indigo-700 block mt-0.5">
                        C$ {e.margenBruto.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rentabilidad</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-mono font-extrabold px-2 py-0.5 rounded">
                          {e.rentabilidadPct}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones Directas Operativas (4 columnas) */}
                  <div className="lg:col-span-4 flex flex-wrap lg:flex-nowrap items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/facturacion?evento=${encodeURIComponent(e.nombre)}`)}
                      className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 whitespace-nowrap"
                    >
                      <FileText className="w-4 h-4" />
                      <span>+ Facturar Cliente</span>
                    </button>

                    <button
                      onClick={() => router.push(`/cartera/cxp?evento=${encodeURIComponent(e.nombre)}`)}
                      className="flex-1 lg:flex-none bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 whitespace-nowrap"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>+ Gasto CxP</span>
                    </button>

                    <button
                      onClick={() => setEventoSeleccionadoDetalle(e)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs px-3 py-2.5 rounded-xl transition flex items-center justify-center space-x-1 whitespace-nowrap"
                      title="Ver desglose completo de ingresos y egresos"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Detalle</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VISTA 2: TABLA EXTENDIDA (CON SCROLLBAR RESPONSIVO Y CERO OVERFLOW) */}
      {vistaModo === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 w-32">Código</th>
                  <th className="p-3.5">Evento & Sede</th>
                  <th className="p-3.5 text-right w-36">Ingresos (Fact.)</th>
                  <th className="p-3.5 text-right w-36">Gastos (CxP)</th>
                  <th className="p-3.5 text-right w-36">Margen Bruto</th>
                  <th className="p-3.5 text-center w-28">Rentabilidad</th>
                  <th className="p-3.5 text-center w-28">Estado</th>
                  <th className="p-3.5 text-center w-64">Acciones Directas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {eventosFiltrados.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-emerald-700 whitespace-nowrap">{e.codigo}</td>
                    <td className="p-3.5 max-w-sm">
                      <div className="font-bold text-slate-900">{e.nombre}</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{e.fecha} - {e.lugar}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-mono text-emerald-700 font-bold whitespace-nowrap">
                      C$ {e.ingresosFacturados.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono text-rose-600 whitespace-nowrap">
                      C$ {e.gastosProveedores.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-indigo-700 whitespace-nowrap">
                      C$ {e.margenBruto.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded font-bold font-mono">
                        {e.rentabilidadPct}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${e.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {e.estado}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/facturacion?evento=${encodeURIComponent(e.nombre)}`)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center space-x-1 shadow-sm"
                          title="Facturar Cliente para este Evento"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>+ Facturar</span>
                        </button>

                        <button
                          onClick={() => router.push(`/cartera/cxp?evento=${encodeURIComponent(e.nombre)}`)}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center space-x-1 shadow-sm"
                          title="Registrar Gasto o Factura de Proveedor (CxP)"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>+ Gasto</span>
                        </button>

                        <button
                          onClick={() => setEventoSeleccionadoDetalle(e)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-bold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center space-x-1"
                          title="Ver Desglose Financiero"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalle</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal para Crear Nuevo Evento */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden space-y-4 p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Crear Nuevo Evento / Centro de Costos</h3>
              <button
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearEvento} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Código Proyecto</label>
                  <input
                    type="text"
                    value={nuevoCodigo}
                    onChange={(e) => setNuevoCodigo(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha de Realización</label>
                  <input
                    type="date"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombre del Evento / Taller</label>
                <input
                  type="text"
                  placeholder="Ej. Taller de Finanzas Estratégicas 2026"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Descripción / Temario del Evento</label>
                <textarea
                  rows={2}
                  placeholder="Escriba una descripción detallada del objetivo del evento o temario..."
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Lugar / Sede</label>
                  <input
                    type="text"
                    placeholder="Ej. Hotel Barceló Montelimar"
                    value={nuevoLugar}
                    onChange={(e) => setNuevoLugar(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Capacidad / Aforo (Pax)</label>
                  <input
                    type="number"
                    value={nuevaCapacidad}
                    onChange={(e) => setNuevaCapacidad(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Infraestructura y Requerimientos Operativos */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="block text-xs font-bold text-slate-700 uppercase">Infraestructura y Servicios Requeridos</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Cant. Salones / Auditorios</label>
                    <input
                      type="number"
                      min="1"
                      value={nuevaCantSalones}
                      onChange={(e) => setNuevaCantSalones(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Cant. Stands de Exhibición</label>
                    <input
                      type="number"
                      min="0"
                      value={nuevaCantStands}
                      onChange={(e) => setNuevaCantStands(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex space-x-6 pt-1">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cateringRequerido}
                      onChange={(e) => setCateringRequerido(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>☕ Requiere Catering / Coffee Break</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audiovisualRequerido}
                      onChange={(e) => setAudiovisualRequerido(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>🎥 Requiere Audiovisual & Streaming</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                <div>
                  <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Ingreso Estimado (NIO)</label>
                  <input
                    type="number"
                    value={nuevoIngreso}
                    onChange={(e) => setNuevoIngreso(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-emerald-700 font-bold bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-rose-800 uppercase mb-1">Gasto Proveedores (NIO)</label>
                  <input
                    type="number"
                    value={nuevoGasto}
                    onChange={(e) => setNuevoGasto(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-rose-600 font-bold bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Ver Detalle Financiero del Evento */}
      {eventoSeleccionadoDetalle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden space-y-5 p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {eventoSeleccionadoDetalle.codigo}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">
                  {eventoSeleccionadoDetalle.nombre}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {eventoSeleccionadoDetalle.fecha} - {eventoSeleccionadoDetalle.lugar}
                </p>
              </div>
              <button
                onClick={() => setEventoSeleccionadoDetalle(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuadros resumen del evento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Ingresos Facturados</span>
                <p className="text-xl font-mono font-extrabold text-emerald-700 mt-1">
                  C$ {eventoSeleccionadoDetalle.ingresosFacturados.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wide">Gastos CxP (Proveedores)</span>
                <p className="text-xl font-mono font-extrabold text-rose-600 mt-1">
                  C$ {eventoSeleccionadoDetalle.gastosProveedores.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
                <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wide">Margen Neto ({eventoSeleccionadoDetalle.rentabilidadPct}%)</span>
                <p className="text-xl font-mono font-extrabold text-indigo-700 mt-1">
                  C$ {eventoSeleccionadoDetalle.margenBruto.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Sección 1: Facturas a Clientes (Ingresos) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Facturas Emitidas a Clientes (Ingresos)</span>
                </h4>
                <button
                  onClick={() => router.push(`/facturacion?evento=${encodeURIComponent(eventoSeleccionadoDetalle.nombre)}`)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                >
                  <span>+ Nueva Factura</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">N° Factura DGI</th>
                      <th className="p-2.5">Cliente / Razón Social</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                      <th className="p-2.5 text-right">15% IVA</th>
                      <th className="p-2.5 text-right">Total Facturado</th>
                      <th className="p-2.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getFacturasClienteMock(eventoSeleccionadoDetalle).map((fac, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-slate-800">{fac.numero}</td>
                        <td className="p-2.5 font-medium text-slate-700">{fac.cliente} <span className="text-[10px] text-slate-400">({fac.ruc})</span></td>
                        <td className="p-2.5 text-right font-mono">C$ {fac.subtotal.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-mono">C$ {fac.iva.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">C$ {fac.total.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-center">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            {fac.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sección 2: Gastos de Proveedores (Egresos CxP) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <span>Facturas de Proveedores Registradas (CxP / Egresos)</span>
                </h4>
                <button
                  onClick={() => router.push(`/cartera/cxp?evento=${encodeURIComponent(eventoSeleccionadoDetalle.nombre)}`)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1"
                >
                  <span>+ Registrar Gasto CxP</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Factura Proveedor</th>
                      <th className="p-2.5">Proveedor & Concepto Serv.</th>
                      <th className="p-2.5 text-right">Monto Bruto</th>
                      <th className="p-2.5 text-right">Ret. IR (2%)</th>
                      <th className="p-2.5 text-right">Neto a Pagar</th>
                      <th className="p-2.5 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getGastosProveedorMock(eventoSeleccionadoDetalle).map((gasto, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-slate-800">{gasto.numeroFactura}</td>
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-800">{gasto.proveedor}</div>
                          <div className="text-[10px] text-slate-500">{gasto.concepto}</div>
                        </td>
                        <td className="p-2.5 text-right font-mono">C$ {gasto.subtotal.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-mono text-amber-700">- C$ {gasto.retencionIr.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-rose-600">C$ {gasto.totalPagar.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-center">
                          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${gasto.estado === 'PAGADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {gasto.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setEventoSeleccionadoDetalle(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
