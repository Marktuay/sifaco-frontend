'use client';

import React, { useState } from 'react';
import { useInformeVentasDGI } from '@/hooks/use-reportes-dgi';

export default function ReportesDGIPage() {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());

  const { data: informe, isLoading, error } = useInformeVentasDGI(mes, anio);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Informe Fiscal Mensual de Ventas e IVA (DGI)</h1>
          <p className="text-slate-500 text-sm">Declaración mensual Ley 822 / Dirección General de Ingresos de Nicaragua</p>
        </div>
        <div className="flex space-x-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Mes</label>
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="border border-slate-300 rounded px-3 py-1.5 text-sm bg-white">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2026, i, 1).toLocaleString('es', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="w-24 border border-slate-300 rounded px-3 py-1.5 text-sm bg-white"
            />
          </div>
        </div>
      </div>

      {isLoading && <div className="text-slate-500 font-medium py-8 text-center">Cargando informe DGI...</div>}
      {error && <div className="bg-rose-50 text-rose-700 p-4 rounded border border-rose-200">Error: {error.message}</div>}

      {informe && (
        <div className="space-y-6">
          {/* Header Resumen Folios DGI */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Rango de Folios Utilizados</span>
              <p className="text-base font-bold text-slate-800 mt-1">{informe.rango_folios_utilizados || 'N/A'}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Facturas Emitidas</span>
              <p className="text-base font-bold text-emerald-600 mt-1">{informe.total_facturas_emitidas ?? 0} folios</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Facturas Anuladas</span>
              <p className="text-base font-bold text-rose-600 mt-1">{informe.total_facturas_anuladas ?? 0} folios</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Débito Fiscal IVA 15%</span>
              <p className="text-base font-bold text-amber-600 mt-1">C$ {(informe.total_iva_debito_nio ?? 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Tabla de Facturas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="w-full overflow-hidden">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 text-[11px] uppercase border-b border-slate-200 font-bold">
                    <th className="py-3 px-3 w-[12%]">Correlativo</th>
                    <th className="py-3 px-3 w-[10%]">Fecha</th>
                    <th className="py-3 px-3 w-[15%]">RUC / Cédula</th>
                    <th className="py-3 px-3 w-[25%]">Razón Social</th>
                    <th className="py-3 px-3 w-[10%] text-right">Gravado (NIO)</th>
                    <th className="py-3 px-3 w-[9%] text-right">Exento (NIO)</th>
                    <th className="py-3 px-3 w-[9%] text-right">IVA 15%</th>
                    <th className="py-3 px-3 w-[10%] text-right">Total (NIO)</th>
                    <th className="py-3 px-3 w-[8%] text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {(informe.facturas || []).map((f, i) => (
                    <tr key={i} className={f.estado === 'ANULADA' ? 'bg-rose-50/50 text-slate-400 line-through' : 'hover:bg-slate-50'}>
                      <td className="p-3 font-mono font-bold text-slate-800">{f.correlativo_preimpreso}</td>
                      <td className="p-3">{f.fecha_emision}</td>
                      <td className="p-3 font-mono">{f.ruc_cedula}</td>
                      <td className="p-3 font-semibold text-slate-800">{f.razon_social}</td>
                      <td className="p-3 text-right font-mono">{f.subtotal_gravado_nio.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono">{f.subtotal_exento_nio.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">{f.iva_trasladado_nio.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-extrabold text-slate-900">{f.total_nio.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${f.estado === 'EMITIDA' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {f.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
