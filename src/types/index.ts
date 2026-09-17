export interface DetalleItem {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  exento: boolean;
}

export interface CuotaItem {
  numero_cuota: number;
  fecha_vence: string;
  monto: number;
}

export interface CrearFacturaPayload {
  cliente_id: string;
  evento_id?: string;
  tipo_pago: 'CONTADO' | 'CREDITO';
  moneda: 'NIO' | 'USD';
  tasa_cambio_bcn: number;
  observaciones?: string;
  detalles: DetalleItem[];
  cuotas?: CuotaItem[];
}

export interface FacturaResponse {
  factura: {
    id: string;
    correlativo_preimpreso: string;
    serie: string;
    numero_folio: number;
    fecha_emision: string;
    tipo_pago: string;
    moneda: string;
    tasa_cambio_bcn: number;
    subtotal_gravado: number;
    subtotal_exento: number;
    monto_iva: number;
    total: number;
    saldo_pendiente: number;
    estado: string;
  };
  escp2_payload_base64: string;
}

export interface FacturaDGIReporteItem {
  correlativo_preimpreso: string;
  fecha_emision: string;
  ruc_cedula: string;
  razon_social: string;
  subtotal_gravado_nio: number;
  subtotal_exento_nio: number;
  iva_trasladado_nio: number;
  total_nio: number;
  estado: string;
  motivo_anulacion?: string;
}

export interface InformeVentasDGI {
  mes: number;
  anio: number;
  rango_folios_utilizados: string;
  total_facturas_emitidas: number;
  total_facturas_anuladas: number;
  facturas: FacturaDGIReporteItem[];
  total_subtotal_gravado_nio: number;
  total_subtotal_exento_nio: number;
  total_iva_debito_nio: number;
  total_general_ventas_nio: number;
}

export interface DashboardKPIs {
  ventas_mes_nio: number;
  ventas_mes_usd: number;
  cartera_cxc_vencida_nio: number;
  cartera_cxc_por_vencer_nio: number;
  iva_neto_estimado_nio: number;
  antiguedad_saldos_cxc: Record<string, number>;
}

export interface Cliente {
  id: string;
  ruc_cedula: string;
  razon_social: string;
  direccion: string;
  telefono: string;
  email: string;
  representante_legal?: string;
  tipo_contribuyente: string;
  creado_en?: string;
}

export interface CrearClientePayload {
  ruc_cedula: string;
  razon_social: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  representante_legal?: string;
  tipo_contribuyente?: string;
}

export interface AuditoriaLogItem {
  id: string;
  usuario_nombre: string;
  usuario_email: string;
  rol: string;
  accion: string;
  tabla_afectada: string;
  detalles: string;
  ip_origen: string;
  fecha_hora: string;
  creado_en?: string;
}

export type RolUsuario = 'ADMIN' | 'CONTADOR' | 'FACTURADOR' | 'GESTOR_CXC' | 'COORDINADOR_EVENTOS';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  creado_en?: string;
}

export interface CrearUsuarioPayload {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
}

