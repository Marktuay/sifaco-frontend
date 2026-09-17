import { Cliente, CrearClientePayload } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://34.61.174.107/api/v1';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido del servidor' }));
      throw new Error(errorData.error || `Error HTTP ${response.status}`);
    }

    return response.json();
  } catch (err: any) {
    if (err.message.includes('fetch') || err.message.includes('NetworkError') || err.name === 'TypeError') {
      console.warn(`[SIFACO Frontend] Backend offline en ${url}. Usando respuesta demo local.`);
      return getMockData<T>(endpoint, options);
    }
    throw err;
  }
}

// Helpers específicos para CRM Clientes
export async function getClientes(search?: string): Promise<Cliente[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetchApi<Cliente[]>(`/clientes${query}`);
}

export async function crearCliente(payload: CrearClientePayload): Promise<Cliente> {
  return fetchApi<Cliente>('/clientes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function actualizarCliente(id: string, payload: CrearClientePayload): Promise<Cliente> {
  return fetchApi<Cliente>(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function eliminarCliente(id: string): Promise<{ mensaje: string }> {
  return fetchApi<{ mensaje: string }>(`/clientes/${id}`, {
    method: 'DELETE',
  });
}

function getMockData<T>(endpoint: string, options?: RequestInit): T {
  if (endpoint.includes('/clientes')) {
    const mockClientes: Cliente[] = [
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        ruc_cedula: 'J0310000323046',
        razon_social: 'FARMACIA DISPOER S.A.',
        direccion: 'Managua, Residencial Bolonia, Semáforos Plaza España 2c al norte',
        telefono: '2255-8899 / 8899-7711',
        email: 'ventas@dispoer.com.ni',
        representante_legal: 'Lic. Fernando José Sevilla Molina',
        tipo_contribuyente: 'GRAN_CONTRIBUYENTE',
        creado_en: '2026-01-15T08:30:00Z',
      },
      {
        id: 'b1ffcd88-8b0a-3ef7-aa5c-5aa8ac270b22',
        ruc_cedula: 'J0310000001234',
        razon_social: 'BAC Nicaragua S.A.',
        direccion: 'Managua, Plaza España, Edificio BANAMEX',
        telefono: '2274-4444',
        email: 'contacto@baccredomatic.com.ni',
        representante_legal: 'Dr. Roberto Argüello Chamorro',
        tipo_contribuyente: 'GRAN_CONTRIBUYENTE',
        creado_en: '2026-02-10T10:00:00Z',
      },
      {
        id: 'c2eedd77-7a0f-2ee6-994b-4bb7ab160c33',
        ruc_cedula: 'J0310000009999',
        razon_social: 'Claro Nicaragua (ENITEL)',
        direccion: 'Managua, Villa Fontana, Rotonda Universitario 100m al sur',
        telefono: '2250-0000',
        email: 'atencion@claro.com.ni',
        representante_legal: 'Ing. Carlos Alberto Morales',
        tipo_contribuyente: 'GRAN_CONTRIBUYENTE',
        creado_en: '2026-02-12T11:15:00Z',
      },
      {
        id: 'd3ddcc66-6f0e-1dd5-883a-3aa6za050d44',
        ruc_cedula: 'J0310000005555',
        razon_social: 'Banpro Grupo Promerica',
        direccion: 'Managua, Centro Norte, Pista Jean Paul Genie',
        telefono: '2255-7777',
        email: 'info@banpro.com.ni',
        representante_legal: 'Lic. Luis Rivas Anduray',
        tipo_contribuyente: 'GRAN_CONTRIBUYENTE',
        creado_en: '2026-03-01T14:20:00Z',
      },
    ];
    return mockClientes as unknown as T;
  }

  if (endpoint.includes('/dashboard-kpis')) {
    return {
      ventas_mes_nio: 458500.0,
      ventas_mes_usd: 12519.0,
      cartera_cxc_vencida_nio: 85200.0,
      cartera_cxc_por_vencer_nio: 142000.0,
      iva_neto_estimado_nio: 59804.35,
      antiguedad_saldos_cxc: {
        '0-30': 142000.0,
        '31-60': 45000.0,
        '61-90': 25200.0,
        '90+': 15000.0,
      },
    } as unknown as T;
  }

  if (endpoint.includes('/informe-ventas-dgi')) {
    return {
      mes: 9,
      anio: 2026,
      rango_folios_utilizados: 'Folios A-000001 al A-000015',
      total_facturas_emitidas: 14,
      total_facturas_anuladas: 1,
      total_subtotal_gravado_nio: 398695.65,
      total_subtotal_exento_nio: 0.0,
      total_iva_debito_nio: 59804.35,
      total_general_ventas_nio: 458500.0,
      facturas: [
        {
          correlativo_preimpreso: 'A-000001',
          fecha_emision: '02/09/2026',
          ruc_cedula: 'J0310000001234',
          razon_social: 'BAC Nicaragua S.A.',
          subtotal_gravado_nio: 150000.0,
          subtotal_exento_nio: 0.0,
          iva_trasladado_nio: 22500.0,
          total_nio: 172500.0,
          estado: 'EMITIDA',
        },
        {
          correlativo_preimpreso: 'A-000002',
          fecha_emision: '04/09/2026',
          ruc_cedula: 'J0310000009999',
          razon_social: 'Claro Nicaragua (ENITEL)',
          subtotal_gravado_nio: 80000.0,
          subtotal_exento_nio: 0.0,
          iva_trasladado_nio: 12000.0,
          total_nio: 92000.0,
          estado: 'EMITIDA',
        },
        {
          correlativo_preimpreso: 'A-000003',
          fecha_emision: '05/09/2026',
          ruc_cedula: 'J0310000005555',
          razon_social: 'Banpro Grupo Promerica',
          subtotal_gravado_nio: 0.0,
          subtotal_exento_nio: 0.0,
          iva_trasladado_nio: 0.0,
          total_nio: 0.0,
          estado: 'ANULADA',
          motivo_anulacion: 'Error en razón social del cliente',
        },
      ],
    } as unknown as T;
  }

  if (endpoint.includes('/facturas') && options?.method === 'POST') {
    return {
      factura: {
        id: 'demo-uuid-1234',
        correlativo_preimpreso: '4135',
        serie: 'A',
        numero_folio: 4135,
        fecha_emision: new Date().toISOString(),
        tipo_pago: 'CONTADO',
        moneda: 'NIO',
        tasa_cambio_bcn: 36.6243,
        subtotal_gravado: 15000.0,
        subtotal_exento: 0.0,
        monto_iva: 2250.0,
        total: 17250.0,
        saldo_pendiente: 0.0,
        estado: 'EMITIDA',
      },
      escp2_payload_base64: 'G0ASeAEKa1ABQzY...demo',
    } as unknown as T;
  }

  return {} as T;
}
