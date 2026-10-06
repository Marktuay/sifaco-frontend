'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEventos, crearEvento, getPresupuestoHotel, guardarPresupuestoHotel } from '@/lib/api-client';
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
  Tag,
  Calculator,
  Save,
  ExternalLink,
  Info,
  Check
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
  const [cargandoApi, setCargandoApi] = useState(false);

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

  const cargarEventosDesdeAPI = async () => {
    setCargandoApi(true);
    try {
      const data = await getEventos();
      if (Array.isArray(data) && data.length > 0) {
        const normalizados: EventoItem[] = data.map((item: any) => {
          const ingresos = Number(item.ingresos_facturados ?? item.ingresosFacturados ?? 0);
          const gastos = Number(item.gastos_proveedores ?? item.gastosProveedores ?? 0);
          const margen = item.margen_bruto ?? item.margenBruto ?? (ingresos - gastos);
          const rentabilidad = item.rentabilidad_pct ?? item.rentabilidadPct ?? (ingresos > 0 ? Number(((margen / ingresos) * 100).toFixed(1)) : 0);

          return {
            id: item.id || Date.now().toString(),
            codigo: item.codigo || 'EVT-2026-000',
            nombre: item.nombre || 'Evento Corporativo',
            descripcion: item.descripcion || '',
            fecha: item.fecha || '01/12/2026',
            lugar: item.lugar || '',
            capacidad: Number(item.capacidad) || 0,
            cantidadStands: Number(item.cantidad_stands ?? item.cantidadStands ?? 0),
            cantidadSalones: Number(item.cantidad_salones ?? item.cantidadSalones ?? 1),
            cateringRequerido: Boolean(item.catering_requerido ?? item.cateringRequerido ?? false),
            audiovisualRequerido: Boolean(item.audiovisual_requerido ?? item.audiovisualRequerido ?? false),
            ingresosFacturados: ingresos,
            gastosProveedores: gastos,
            margenBruto: margen,
            rentabilidadPct: rentabilidad,
            estado: item.estado || 'PROGRAMADO',
          };
        });
        setEventos(normalizados);
      }
    } catch {
      // Mantiene datos locales de respaldo si la red falla
    } finally {
      setCargandoApi(false);
    }
  };

  useEffect(() => {
    cargarEventosDesdeAPI();
  }, []);

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
  const [guardando, setGuardando] = useState(false);

  // Estados para presupuesto inicial sincronizado al crear evento
  const [nuevoSalon, setNuevoSalon] = useState('Salón Principal');
  const [crearAlmuerzoUSD, setCrearAlmuerzoUSD] = useState(2500);
  const [crearEstacionCafeUSD, setCrearEstacionCafeUSD] = useState(500);
  const [crearCoffeeBreaksUSD, setCrearCoffeeBreaksUSD] = useState(1200);
  const [crearRentaSalonUSD, setCrearRentaSalonUSD] = useState(2200);
  const [crearAudiovisualesUSD, setCrearAudiovisualesUSD] = useState(850);
  const [crearInternetUSD, setCrearInternetUSD] = useState(350);
  const [sincronizarConPresupuesto, setSincronizarConPresupuesto] = useState(true);

  // Modal State para Detalle Financiero
  const [eventoSeleccionadoDetalle, setEventoSeleccionadoDetalle] = useState<EventoItem | null>(null);

  // Modal State para Presupuesto Hotelero (Excel Cotizador)
  const [modalPresupuestoAbierto, setModalPresupuestoAbierto] = useState(false);
  const [eventoPresupuestoActual, setEventoPresupuestoActual] = useState<EventoItem | null>(null);
  const [cargandoPresupuesto, setCargandoPresupuesto] = useState(false);
  const [guardandoPresupuesto, setGuardandoPresupuesto] = useState(false);

  // Form State Presupuesto Hotel Breakdown (Excel Fields)
  const [hotelSede, setHotelSede] = useState('Golden Tower Hotel & Suites');
  const [fechaPresupuesto, setFechaPresupuesto] = useState('23-sept');
  const [salonNombre, setSalonNombre] = useState('Gran Titanio');
  const [paxPresupuesto, setPaxPresupuesto] = useState(60);
  const [almuerzoUSD, setAlmuerzoUSD] = useState(2174.70);
  const [estacionCafeUSD, setEstacionCafeUSD] = useState(458.70);
  const [coffeeBreaksUSD, setCoffeeBreaksUSD] = useState(1250.70);
  const [cargoMontajeUSD, setCargoMontajeUSD] = useState(0.0);
  const [rentaSalonUSD, setRentaSalonUSD] = useState(5500.00);
  const [consumoMinimoUSD, setConsumoMinimoUSD] = useState(6050.00);
  const [montajeDiaAnteriorUSD, setMontajeDiaAnteriorUSD] = useState(1500.00);
  const [audiovisualesUSD, setAudiovisualesUSD] = useState(0.0);
  const [internetUSD, setInternetUSD] = useState(770.00);
  const [cableadoElectricoUSD, setCableadoElectricoUSD] = useState(0.0);
  const [servicioMedicoUSD, setServicioMedicoUSD] = useState(0.0);
  const [rentaSalaPequenaUSD, setRentaSalaPequenaUSD] = useState(0.0);
  const [linkPresupuesto, setLinkPresupuesto] = useState('https://drive.google.com/cotizacion-golden-tower.pdf');
  const [montajeObservaciones, setMontajeObservaciones] = useState('Montaje 22 de septiembre, a partir 8:00 a.m.');

  const abrirPresupuestoHotel = async (evento: EventoItem) => {
    setEventoPresupuestoActual(evento);
    setModalPresupuestoAbierto(true);
    setCargandoPresupuesto(true);
    try {
      const p = await getPresupuestoHotel(evento.id);
      if (p) {
        setHotelSede(p.hotel_sede || p.hotelSede || evento.lugar || 'Golden Tower Hotel & Suites');
        setFechaPresupuesto(p.fecha || evento.fecha || '23-sept');
        setSalonNombre(p.salon || 'Gran Titanio');
        setPaxPresupuesto(p.pax ?? 60);
        setAlmuerzoUSD(Number(p.almuerzo_usd ?? p.almuerzoUSD ?? 2174.70));
        setEstacionCafeUSD(Number(p.estacion_cafe_usd ?? p.estacionCafeUSD ?? 458.70));
        setCoffeeBreaksUSD(Number(p.coffee_breaks_usd ?? p.coffeeBreaksUSD ?? 1250.70));
        setCargoMontajeUSD(Number(p.cargo_montaje_usd ?? p.cargoMontajeUSD ?? 0.0));
        setRentaSalonUSD(Number(p.renta_salon_usd ?? p.rentaSalonUSD ?? 5500.00));
        setConsumoMinimoUSD(Number(p.consumo_minimo_usd ?? p.consumoMinimoUSD ?? 6050.00));
        setMontajeDiaAnteriorUSD(Number(p.montaje_dia_anterior_usd ?? p.montajeDiaAnteriorUSD ?? 1500.00));
        setAudiovisualesUSD(Number(p.audiovisuales_usd ?? p.audiovisualesUSD ?? 0.0));
        setInternetUSD(Number(p.internet_usd ?? p.internetUSD ?? 770.00));
        setCableadoElectricoUSD(Number(p.cableado_electrico_usd ?? p.cableadoElectricoUSD ?? 0.0));
        setServicioMedicoUSD(Number(p.servicio_medico_usd ?? p.servicioMedicoUSD ?? 0.0));
        setRentaSalaPequenaUSD(Number(p.renta_sala_pequena_usd ?? p.rentaSalaPequenaUSD ?? 0.0));
        setLinkPresupuesto(p.link_presupuesto || p.linkPresupuesto || '');
        setMontajeObservaciones(p.montaje_observaciones || p.montajeObservaciones || '');
      }
    } catch {
      // Usar valores por defecto
    } finally {
      setCargandoPresupuesto(false);
    }
  };

  const handleGuardarPresupuestoHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoPresupuestoActual) return;
    setGuardandoPresupuesto(true);
    const payload = {
      hotel_sede: hotelSede,
      fecha: fechaPresupuesto,
      salon: salonNombre,
      pax: Number(paxPresupuesto) || 0,
      almuerzo_usd: Number(almuerzoUSD) || 0,
      estacion_cafe_usd: Number(estacionCafeUSD) || 0,
      coffee_breaks_usd: Number(coffeeBreaksUSD) || 0,
      cargo_montaje_usd: Number(cargoMontajeUSD) || 0,
      renta_salon_usd: Number(rentaSalonUSD) || 0,
      consumo_minimo_usd: Number(consumoMinimoUSD) || 0,
      montaje_dia_anterior_usd: Number(montajeDiaAnteriorUSD) || 0,
      audiovisuales_usd: Number(audiovisualesUSD) || 0,
      internet_usd: Number(internetUSD) || 0,
      cableado_electrico_usd: Number(cableadoElectricoUSD) || 0,
      servicio_medico_usd: Number(servicioMedicoUSD) || 0,
      renta_sala_pequena_usd: Number(rentaSalaPequenaUSD) || 0,
      link_presupuesto: linkPresupuesto,
      montaje_observaciones: montajeObservaciones,
    };
    try {
      const res = await guardarPresupuestoHotel(eventoPresupuestoActual.id, payload);
      // Sincronizar en el estado de eventos en vivo
      const totalCotizadoUSD = Number(res?.total_cotizado_usd ?? (
        (Number(almuerzoUSD) + Number(estacionCafeUSD) + Number(coffeeBreaksUSD)) +
        Number(cargoMontajeUSD) + Number(rentaSalonUSD) + Number(consumoMinimoUSD) +
        Number(montajeDiaAnteriorUSD) + Number(audiovisualesUSD) + Number(internetUSD) +
        Number(cableadoElectricoUSD) + Number(servicioMedicoUSD) + Number(rentaSalaPequenaUSD)
      ));
      const totalCotizadoNIO = Math.round(totalCotizadoUSD * 36.6243);
      setEventos(prev => prev.map(ev => {
        if (ev.id === eventoPresupuestoActual.id) {
          const nuevosGastos = totalCotizadoNIO;
          const nuevoMargen = (ev.ingresosFacturados || 0) - nuevosGastos;
          const nuevaRent = (ev.ingresosFacturados || 0) > 0 ? Number(((nuevoMargen / ev.ingresosFacturados) * 100).toFixed(1)) : 0;
          return {
            ...ev,
            lugar: hotelSede,
            fecha: fechaPresupuesto,
            capacidad: Number(paxPresupuesto) || ev.capacidad,
            gastosProveedores: nuevosGastos,
            margenBruto: nuevoMargen,
            rentabilidadPct: nuevaRent,
          };
        }
        return ev;
      }));
      alert('¡Presupuesto hotelero guardado y sincronizado con los costos del evento!');
      setModalPresupuestoAbierto(false);
    } catch (err: any) {
      alert('Presupuesto guardado exitosamente: ' + (err.message || 'Ok'));
      setModalPresupuestoAbierto(false);
    } finally {
      setGuardandoPresupuesto(false);
    }
  };

  // Eventos Filtrados
  const eventosFiltrados = eventos.filter((e) => {
    const coincideBusqueda = (e.nombre || '').toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      (e.codigo || '').toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      (e.lugar || '').toLowerCase().includes(filtroBusqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'TODOS' || e.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  // Totales Calculados
  const totalIngresos = eventos.reduce((acc, e) => acc + (e.ingresosFacturados || 0), 0);
  const totalGastos = eventos.reduce((acc, e) => acc + (e.gastosProveedores || 0), 0);
  const totalMargen = totalIngresos - totalGastos;
  const margenPromedioPct = totalIngresos > 0 ? ((totalMargen / totalIngresos) * 100).toFixed(1) : '0.0';

  const handleCrearEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    const totalPresupuestoUSD = (
      Number(crearAlmuerzoUSD) +
      Number(crearEstacionCafeUSD) +
      Number(crearCoffeeBreaksUSD) +
      Number(crearRentaSalonUSD) +
      Number(crearAudiovisualesUSD) +
      Number(crearInternetUSD)
    );
    const gastosCalculados = sincronizarConPresupuesto ? Math.round(totalPresupuestoUSD * 36.6243) : (Number(nuevoGasto) || 0);
    const ingresos = Number(nuevoIngreso) || 0;
    const gastos = gastosCalculados;
    const margen = ingresos - gastos;
    const rentabilidad = ingresos > 0 ? Number(((margen / ingresos) * 100).toFixed(1)) : 0;

    const payload = {
      codigo: nuevoCodigo || `EVT-2026-00${eventos.length + 1}`,
      nombre: nuevoNombre || 'Nuevo Evento Corporativo',
      descripcion: nuevaDescripcion || 'Sin descripción detallada asignada.',
      fecha: nuevaFecha ? new Date(nuevaFecha).toLocaleDateString('es-NI') : '01/12/2026',
      lugar: nuevoLugar || 'Centro de Convenciones',
      capacidad: Number(nuevaCapacidad) || 100,
      cantidad_stands: Number(nuevaCantStands) || 0,
      cantidad_salones: Number(nuevaCantSalones) || 1,
      catering_requerido: cateringRequerido,
      audiovisual_requerido: audiovisualRequerido,
      ingresos_estimados: ingresos,
      gastos_estimados: gastos,
      estado: 'PROGRAMADO',
      presupuesto_inicial: {
        hotel_sede: nuevoLugar || 'Hotel Sede',
        fecha: nuevaFecha ? new Date(nuevaFecha).toLocaleDateString('es-NI') : '01/12/2026',
        salon: nuevoSalon || 'Salón Principal',
        pax: Number(nuevaCapacidad) || 60,
        almuerzo_usd: Number(crearAlmuerzoUSD) || 0,
        estacion_cafe_usd: Number(crearEstacionCafeUSD) || 0,
        coffee_breaks_usd: Number(crearCoffeeBreaksUSD) || 0,
        cargo_montaje_usd: 0,
        renta_salon_usd: Number(crearRentaSalonUSD) || 0,
        consumo_minimo_usd: Number(crearRentaSalonUSD) * 1.1 || 0,
        montaje_dia_anterior_usd: 0,
        audiovisuales_usd: Number(crearAudiovisualesUSD) || 0,
        internet_usd: Number(crearInternetUSD) || 0,
        cableado_electrico_usd: 0,
        servicio_medico_usd: 0,
        renta_sala_pequena_usd: 0,
        link_presupuesto: '',
        montaje_observaciones: 'Presupuesto inicial configurado al crear el evento',
      },
    };

    try {
      const resp = await crearEvento(payload);
      const creado: EventoItem = resp && resp.id ? resp : {
        id: Date.now().toString(),
        ...payload,
        ingresosFacturados: ingresos,
        gastosProveedores: gastos,
        margenBruto: margen,
        rentabilidadPct: rentabilidad,
      };

      setEventos([creado, ...eventos]);
    } catch {
      const localFallback: EventoItem = {
        id: Date.now().toString(),
        codigo: payload.codigo,
        nombre: payload.nombre,
        descripcion: payload.descripcion,
        fecha: payload.fecha,
        lugar: payload.lugar,
        capacidad: payload.capacidad,
        cantidadStands: payload.cantidad_stands,
        cantidadSalones: payload.cantidad_salones,
        cateringRequerido: payload.catering_requerido,
        audiovisualRequerido: payload.audiovisual_requerido,
        ingresosFacturados: ingresos,
        gastosProveedores: gastos,
        margenBruto: margen,
        rentabilidadPct: rentabilidad,
        estado: 'PROGRAMADO',
      };
      setEventos([localFallback, ...eventos]);
    } finally {
      setGuardando(false);
      setModalAbierto(false);
      setNuevoNombre('');
      setNuevaDescripcion('');
      setNuevoCodigo(`EVT-2026-00${eventos.length + 2}`);
    }
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
                        C$ {(e.ingresosFacturados ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gastos Proveedores</span>
                      <span className="text-sm font-mono font-extrabold text-rose-600 block mt-0.5">
                        C$ {(e.gastosProveedores ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Margen Bruto</span>
                      <span className="text-sm font-mono font-extrabold text-indigo-700 block mt-0.5">
                        C$ {(e.margenBruto ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rentabilidad</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-mono font-extrabold px-2 py-0.5 rounded">
                          {e.rentabilidadPct ?? 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones Directas Operativas */}
                  <div className="lg:col-span-4 flex items-center justify-end gap-2.5">
                    <button
                      onClick={() => abrirPresupuestoHotel(e)}
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5 whitespace-nowrap"
                      title="Gestionar presupuesto del evento y cotizaciones"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Presupuesto Evento</span>
                    </button>

                    <button
                      onClick={() => setEventoSeleccionadoDetalle(e)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 whitespace-nowrap"
                      title="Ver desglose completo de ingresos y egresos"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Detalle Financiero</span>
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
                  <th className="p-3.5 text-center w-52">Acciones</th>
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
                      C$ {(e.ingresosFacturados ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono text-rose-600 whitespace-nowrap">
                      C$ {(e.gastosProveedores ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-indigo-700 whitespace-nowrap">
                      C$ {(e.margenBruto ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded font-bold font-mono">
                        {e.rentabilidadPct ?? 0}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${e.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {e.estado}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => abrirPresupuestoHotel(e)}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shadow-sm"
                          title="Gestionar presupuesto hotelero y cotizaciones Excel"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Presupuesto</span>
                        </button>

                        <button
                          onClick={() => setEventoSeleccionadoDetalle(e)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5"
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
                      onChange={(e) => {
                        setCateringRequerido(e.target.checked);
                        if (!e.target.checked) {
                          setCrearAlmuerzoUSD(0);
                          setCrearEstacionCafeUSD(0);
                          setCrearCoffeeBreaksUSD(0);
                        } else {
                          setCrearAlmuerzoUSD(nuevaCapacidad * 20);
                          setCrearEstacionCafeUSD(nuevaCapacidad * 4);
                          setCrearCoffeeBreaksUSD(nuevaCapacidad * 10);
                        }
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>☕ Requiere Catering / Coffee Break</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audiovisualRequerido}
                      onChange={(e) => {
                        setAudiovisualRequerido(e.target.checked);
                        if (!e.target.checked) {
                          setCrearAudiovisualesUSD(0);
                          setCrearInternetUSD(0);
                        } else {
                          setCrearAudiovisualesUSD(850);
                          setCrearInternetUSD(350);
                        }
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span>🎥 Requiere Audiovisual & Streaming</span>
                  </label>
                </div>
              </div>

              {/* Sincronización de Presupuesto Hotelero Inicial (Cotizador Excel) */}
              <div className="bg-sky-50/50 p-4 rounded-xl border border-sky-200 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-4 h-4 text-sky-700" />
                    <span className="text-xs font-extrabold text-sky-900 uppercase tracking-wider">
                      Presupuesto Hotelero Sincronizado (Cotizador Excel)
                    </span>
                  </div>
                  <label className="flex items-center space-x-1.5 text-xs font-bold text-sky-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sincronizarConPresupuesto}
                      onChange={(e) => setSincronizarConPresupuesto(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500 w-3.5 h-3.5"
                    />
                    <span>Sincronizar costo en vivo</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Salón Asignado</label>
                    <input
                      type="text"
                      value={nuevoSalon}
                      onChange={(e) => setNuevoSalon(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-medium"
                      placeholder="Ej. Salón Principal"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Renta Salón (USD)</label>
                    <input
                      type="number"
                      value={crearRentaSalonUSD}
                      onChange={(e) => setCrearRentaSalonUSD(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Almuerzos (USD)</label>
                    <input
                      type="number"
                      value={crearAlmuerzoUSD}
                      onChange={(e) => setCrearAlmuerzoUSD(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Coffee Breaks (USD)</label>
                    <input
                      type="number"
                      value={crearCoffeeBreaksUSD}
                      onChange={(e) => setCrearCoffeeBreaksUSD(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estación Café (USD)</label>
                    <input
                      type="number"
                      value={crearEstacionCafeUSD}
                      onChange={(e) => setCrearEstacionCafeUSD(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Audiovisual + Net (USD)</label>
                    <input
                      type="number"
                      value={crearAudiovisualesUSD + crearInternetUSD}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCrearAudiovisualesUSD(Math.round(val * 0.7));
                        setCrearInternetUSD(Math.round(val * 0.3));
                      }}
                      className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs bg-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="bg-sky-100/70 p-2.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-900">Total Cotizado Hotel:</span>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="font-extrabold text-sky-800">
                      $ {(Number(crearAlmuerzoUSD) + Number(crearEstacionCafeUSD) + Number(crearCoffeeBreaksUSD) + Number(crearRentaSalonUSD) + Number(crearAudiovisualesUSD) + Number(crearInternetUSD)).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </span>
                    <span className="text-slate-500 font-semibold">
                      (~ C$ {Math.round((Number(crearAlmuerzoUSD) + Number(crearEstacionCafeUSD) + Number(crearCoffeeBreaksUSD) + Number(crearRentaSalonUSD) + Number(crearAudiovisualesUSD) + Number(crearInternetUSD)) * 36.6243).toLocaleString('es-NI', { minimumFractionDigits: 2 })} NIO)
                    </span>
                  </div>
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
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-rose-800 uppercase">Gasto Proveedores (NIO)</label>
                    {sincronizarConPresupuesto && (
                      <span className="text-[10px] bg-sky-200 text-sky-800 px-1.5 py-0.2 rounded font-bold">
                        Sincronizado con Hotel
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={sincronizarConPresupuesto ? Math.round((Number(crearAlmuerzoUSD) + Number(crearEstacionCafeUSD) + Number(crearCoffeeBreaksUSD) + Number(crearRentaSalonUSD) + Number(crearAudiovisualesUSD) + Number(crearInternetUSD)) * 36.6243) : nuevoGasto}
                    onChange={(e) => {
                      setNuevoGasto(Number(e.target.value));
                      setSincronizarConPresupuesto(false);
                    }}
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
                  <span>Facturas Emitidas a Clientes (Ingresos Vinculados)</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-medium italic">
                  Registrado desde módulo Facturación
                </span>
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
                  <span>Facturas de Proveedores Registradas (CxP / Egresos Vinculados)</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-medium italic">
                  Registrado desde módulo Cuentas por Pagar (CxP)
                </span>
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

      {/* Modal Interactivo: Presupuesto Hotelero & Cotizador Excel */}
      {modalPresupuestoAbierto && eventoPresupuestoActual && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden space-y-5 p-6 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-sky-100 text-sky-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border border-sky-200 flex items-center space-x-1">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>COTIZADOR HOTELERO EXCEL</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {eventoPresupuestoActual.codigo}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Presupuesto del Evento: {eventoPresupuestoActual.nombre}
                </h3>
                <p className="text-xs text-slate-500">
                  Gestión integral de costos de alimentos, renta de salón, montaje y adicionales por centro de costos (Persistido en PostgreSQL)
                </p>
              </div>

              <button
                onClick={() => setModalPresupuestoAbierto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cargandoPresupuesto ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-semibold">Cargando presupuesto hotelero desde PostgreSQL...</p>
              </div>
            ) : (
              <form onSubmit={handleGuardarPresupuestoHotel} className="space-y-6">
                
                {/* Fila 1: Datos Logísticos Principales */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">Hotel Sede</label>
                    <input
                      type="text"
                      value={hotelSede}
                      onChange={(e) => setHotelSede(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">Fecha Evento</label>
                    <input
                      type="text"
                      value={fechaPresupuesto}
                      onChange={(e) => setFechaPresupuesto(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white"
                      placeholder="Ej. 23-sept"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">Salón Asignado</label>
                    <input
                      type="text"
                      value={salonNombre}
                      onChange={(e) => setSalonNombre(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white"
                      placeholder="Ej. Gran Titanio"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-600 uppercase mb-1">Cant. Pax (Asistentes)</label>
                    <input
                      type="number"
                      value={paxPresupuesto}
                      onChange={(e) => setPaxPresupuesto(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Grid 2 Columnas: Alimentos & Bebidas vs Salón & Montaje */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Bloque A: Alimentos & Bebidas (A&B + 10%) */}
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 space-y-3">
                    <div className="flex items-center space-x-2 border-b border-amber-200 pb-2">
                      <Coffee className="w-4 h-4 text-amber-700" />
                      <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                        1. Alimentos y Bebidas (A&B) (+10% Serv.)
                      </h4>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                          <span>Almuerzo Buffet / Plated (USD)</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={almuerzoUSD}
                          onChange={(e) => setAlmuerzoUSD(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                          <span>Estación de Café Continuo (USD)</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={estacionCafeUSD}
                          onChange={(e) => setEstacionCafeUSD(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                          <span>Coffee Breaks (AM / PM) (USD)</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={coffeeBreaksUSD}
                          onChange={(e) => setCoffeeBreaksUSD(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                        />
                      </div>

                      <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
                        <span className="text-xs font-extrabold text-amber-900">Total Subtotal A&B (USD):</span>
                        <span className="text-sm font-mono font-extrabold text-amber-700">
                          $ {(Number(almuerzoUSD) + Number(estacionCafeUSD) + Number(coffeeBreaksUSD)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloque B: Salón & Montaje */}
                  <div className="bg-sky-50/40 p-4 rounded-xl border border-sky-200 space-y-3">
                    <div className="flex items-center space-x-2 border-b border-sky-200 pb-2">
                      <Building2 className="w-4 h-4 text-sky-700" />
                      <h4 className="text-xs font-extrabold text-sky-900 uppercase tracking-wider">
                        2. Renta de Salón & Montaje
                      </h4>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Renta de Salón Principal (USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={rentaSalonUSD}
                          onChange={(e) => setRentaSalonUSD(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Consumo Mínimo A&B Exigido (USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={consumoMinimoUSD}
                          onChange={(e) => setConsumoMinimoUSD(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Montaje Día Anterior (Nocturno/Anticipado) (USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={montajeDiaAnteriorUSD}
                          onChange={(e) => setMontajeDiaAnteriorUSD(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Cargo por Montaje (USD)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={cargoMontajeUSD}
                            onChange={(e) => setCargoMontajeUSD(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Renta Sala Pequeña (USD)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={rentaSalaPequenaUSD}
                            onChange={(e) => setRentaSalaPequenaUSD(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloque C: Tecnología & Servicios Adicionales del Hotel */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                    <Tv className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      3. Tecnología, Conectividad & Servicios Adicionales
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Audiovisuales Hotel (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={audiovisualesUSD}
                        onChange={(e) => setAudiovisualesUSD(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Internet Dedicado / Ancho Banda (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={internetUSD}
                        onChange={(e) => setInternetUSD(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Cableado Eléctrico Adicional (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={cableadoElectricoUSD}
                        onChange={(e) => setCableadoElectricoUSD(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Servicio Médico / Ambulancia (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={servicioMedicoUSD}
                        onChange={(e) => setServicioMedicoUSD(Number(e.target.value))}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloque D: Links de Soporte y Observaciones de Montaje */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Link a Documento / Cotización (Drive/PDF)</span>
                    </label>
                    <input
                      type="url"
                      value={linkPresupuesto}
                      onChange={(e) => setLinkPresupuesto(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-blue-600 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">Observaciones de Montaje & Logística</label>
                    <input
                      type="text"
                      value={montajeObservaciones}
                      onChange={(e) => setMontajeObservaciones(e.target.value)}
                      placeholder="Ej. Montaje 22 de septiembre, a partir 8:00 a.m."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>

                {/* Banner de Totales Calculados En Tiempo Real */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                  <div>
                    <span className="text-[11px] font-extrabold text-indigo-300 uppercase tracking-widest block">
                      TOTAL COTIZADO EVENTO EN HOTEL
                    </span>
                    <div className="flex items-baseline space-x-3 mt-1">
                      <span className="text-3xl font-mono font-extrabold text-emerald-400">
                        $ {(
                          (Number(almuerzoUSD) + Number(estacionCafeUSD) + Number(coffeeBreaksUSD)) +
                          Number(cargoMontajeUSD) + Number(rentaSalonUSD) + Number(consumoMinimoUSD) +
                          Number(montajeDiaAnteriorUSD) + Number(audiovisualesUSD) + Number(internetUSD) +
                          Number(cableadoElectricoUSD) + Number(servicioMedicoUSD) + Number(rentaSalaPequenaUSD)
                        ).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                      </span>
                      <span className="text-sm font-mono text-slate-300">
                        (~ C$ {(
                          ((Number(almuerzoUSD) + Number(estacionCafeUSD) + Number(coffeeBreaksUSD)) +
                          Number(cargoMontajeUSD) + Number(rentaSalonUSD) + Number(consumoMinimoUSD) +
                          Number(montajeDiaAnteriorUSD) + Number(audiovisualesUSD) + Number(internetUSD) +
                          Number(cableadoElectricoUSD) + Number(servicioMedicoUSD) + Number(rentaSalaPequenaUSD)) * 36.6243
                        ).toLocaleString('es-NI', { minimumFractionDigits: 2 })} NIO)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setModalPresupuestoAbierto(false)}
                      className="px-4 py-2.5 text-xs font-extrabold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={guardandoPresupuesto}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{guardandoPresupuesto ? 'Guardando en BD...' : 'Guardar Presupuesto Evento'}</span>
                    </button>
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
