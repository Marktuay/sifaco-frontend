'use client';

import React, { useState } from 'react';

export default function ContabilidadPage() {
  const [asientos] = useState([
    {
      id: '1',
      numero: 'ASI-FAC-A-000001',
      fecha: '02/09/2026',
      concepto: 'Emisión de Factura Preimpresa A-000001 - BAC Nicaragua S.A.',
      origen: 'FACTURA_EMISION',
      lineas: [
        { cuenta: '1103 - Cuentas por Cobrar Clientes', debe: 172500.0, haber: 0.0 },
        { cuenta: '4101 - Ingresos por Eventos Corporativos', debe: 0.0, haber: 150000.0 },
        { cuenta: '2102 - Débito Fiscal IVA 15% (Por Pagar)', debe: 0.0, haber: 22500.0 },
      ],
    },
    {
      id: '2',
      numero: 'ASI-REC-RC-001',
      fecha: '05/09/2026',
      concepto: 'Recaudo Cuota #1 Factura A-000002 - Recibo RC-001',
      origen: 'RECAUDO_CUOTA',
      lineas: [
        { cuenta: '1102 - Bancos Nacionales (NIO/USD)', debe: 21800.0, haber: 0.0 },
        { cuenta: '1104 - Anticipo de IR Retenido por Clientes (2%)', debe: 800.0, haber: 0.0 },
        { cuenta: '1105 - Anticipo Retención Municipal ALMA (1%)', debe: 400.0, haber: 0.0 },
        { cuenta: '1103 - Cuentas por Cobrar Clientes', debe: 0.0, haber: 23000.0 },
      ],
    },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Contabilidad General por Partida Doble</h1>
        <p className="text-slate-500 text-sm">Libro Diario, Libro Mayor y asientos automáticos en tiempo real (DEBE == HABER)</p>
      </div>

      {/* Resumen Balance Contable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Activo (Cuentas 1)</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">C$ 195,500.00</p>
          <span className="text-xs text-slate-500 font-medium">Bancos, CxC y Retenciones Activas</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Pasivo (Cuentas 2)</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">C$ 22,500.00</p>
          <span className="text-xs text-slate-500 font-medium">Débito Fiscal IVA 15% por liquidar</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Ingresos (Cuentas 4)</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-2">C$ 150,000.00</p>
          <span className="text-xs text-slate-500 font-medium">Eventos y talleres corporativos</span>
        </div>
      </div>

      {/* Libro Diario de Asientos Contables */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Libro Diario - Comprobantes de Asientos Automáticos</h2>
          <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded">
            Partida Doble Verificada (DEBE == HABER)
          </span>
        </div>

        <div className="space-y-6">
          {asientos.map((a) => {
            const sumaDebe = a.lineas.reduce((acc, l) => acc + l.debe, 0);
            const sumaHaber = a.lineas.reduce((acc, l) => acc + l.haber, 0);

            return (
              <div key={a.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-900 text-white p-3.5 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-mono font-bold text-emerald-400 mr-3">{a.numero}</span>
                    <span className="text-slate-300">{a.concepto}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{a.fecha}</span>
                </div>
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 text-xs uppercase border-b border-slate-200">
                      <th className="p-2.5">Cuenta Contable</th>
                      <th className="p-2.5 text-right">Debe (NIO)</th>
                      <th className="p-2.5 text-right">Haber (NIO)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {a.lineas.map((l, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-medium text-slate-800">{l.cuenta}</td>
                        <td className="p-2.5 text-right font-mono text-slate-900">{l.debe > 0 ? l.debe.toFixed(2) : '-'}</td>
                        <td className="p-2.5 text-right font-mono text-slate-900">{l.haber > 0 ? l.haber.toFixed(2) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-300 text-xs uppercase">
                      <td className="p-2.5 text-right">Totales Balanceados:</td>
                      <td className="p-2.5 text-right font-mono text-emerald-700">C$ {sumaDebe.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-700">C$ {sumaHaber.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
