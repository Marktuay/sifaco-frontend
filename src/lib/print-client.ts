const AGENT_URL = 'http://localhost:9100';

export interface PrintResult {
  exito: boolean;
  mensaje: string;
  bytes_enviados?: number;
  error?: string;
}

export async function enviarAImpresoraLQ590(payloadBase64: string, impresoraName: string = 'Epson LQ-590'): Promise<PrintResult> {
  try {
    const response = await fetch(`${AGENT_URL}/imprimir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload_base64: payloadBase64,
        impresora: impresoraName,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({ error: 'Error en agente local de impresión' }));
      return {
        exito: false,
        mensaje: 'Falló la impresión',
        error: errJson.error || `HTTP ${response.status}`,
      };
    }

    return await response.json();
  } catch (err: any) {
    return {
      exito: false,
      mensaje: 'No se pudo conectar con el agente local de impresión en http://localhost:9100. Verifique que el servicio esté ejecutándose en la PC de oficina.',
      error: err.message || String(err),
    };
  }
}

export async function verificarEstadoAgenteImpresion(): Promise<boolean> {
  try {
    const res = await fetch(`${AGENT_URL}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
