'use client';

import React from 'react';
import { useDashboardKPIs } from '@/hooks/use-reportes-dgi';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: kpis, isLoading, error } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-slate-500 animate-pulse font-medium">Cargando indicadores financieros...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <h3 className="font-bold">Error de conexión</h3>
        <p className="text-sm">{error.message}</p>
        <p className="text-xs mt-2 text-red-500">Asegúrese de que el servidor API Backend Go esté activo y accesible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Financiero y Fiscal</h1>
        <p className="text-slate-500 text-sm">Resumen de ventas mensual, cartera de crédito y estimación del IVA DGI</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-xs font-semibold uppercase text-slate-400">Ventas Mes (NIO)</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            C$ {(kpis?.ventas_mes_nio ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Facturación devengada</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-xs font-semibold uppercase text-slate-400">Ventas Mes (USD)</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">
            $ {(kpis?.ventas_mes_usd ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-indigo-500 font-medium mt-1">Convertido a tasa BCN</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-xs font-semibold uppercase text-slate-400">Cartera CxC Vencida</div>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">
            C$ {(kpis?.cartera_cxc_vencida_nio ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-rose-500 font-medium mt-1">Requiere recaudo urgente</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-xs font-semibold uppercase text-slate-400">IVA Neto a Pagar (Est.)</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">
            C$ {(kpis?.iva_neto_estimado_nio ?? 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">Débito 15% - Crédito Fiscal</div>
        </div>
      </div>

      {/* CxC Aging Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Antigüedad de Saldos de Cartera (CxC Clientes)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
            <span className="text-xs font-bold text-emerald-800 uppercase">0 - 30 Días</span>
            <p className="text-xl font-bold text-emerald-900 mt-1">
              C$ {kpis?.antiguedad_saldos_cxc?.['0-30']?.toLocaleString('es-NI', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <span className="text-xs font-bold text-yellow-800 uppercase">31 - 60 Días</span>
            <p className="text-xl font-bold text-yellow-900 mt-1">
              C$ {kpis?.antiguedad_saldos_cxc?.['31-60']?.toLocaleString('es-NI', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <span className="text-xs font-bold text-orange-800 uppercase">61 - 90 Días</span>
            <p className="text-xl font-bold text-orange-900 mt-1">
              C$ {kpis?.antiguedad_saldos_cxc?.['61-90']?.toLocaleString('es-NI', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
          <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
            <span className="text-xs font-bold text-rose-800 uppercase">+90 Días (Mora)</span>
            <p className="text-xl font-bold text-rose-900 mt-1">
              C$ {kpis?.antiguedad_saldos_cxc?.['90+']?.toLocaleString('es-NI', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="flex space-x-4">
        <Link
          href="/facturacion"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors text-sm"
        >
          + Emitir Factura Preimpresa
        </Link>
        <Link
          href="/reportes/dgi"
          className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-colors text-sm"
        >
          Ver Reportes Fiscales DGI
        </Link>
      </div>
    </div>
  );
}
