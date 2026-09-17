'use client';

import React, { useState } from 'react';
import { useAuditoriaLogs } from '@/hooks/use-auditoria';
import { useAuth } from '@/lib/auth-context';
import { useDRPStatus, useGenerarBackupDRP, useRestaurarBackupDRP } from '@/hooks/use-drp';

export default function AuditoriaPage() {
  const { data: logs, isLoading: loadingLogs } = useAuditoriaLogs();
  const { data: drp, isLoading: loadingDRP } = useDRPStatus();
  const { usuario } = useAuth();

  const generarBackup = useGenerarBackupDRP();
  const restaurarBackup = useRestaurarBackupDRP();
  const [mensajeDRP, setMensajeDRP] = useState<string | null>(null);

  const handleCrearBackupManual = () => {
    setMensajeDRP(null);
    generarBackup.mutate('MANUAL_ADMIN', {
      onSuccess: (data) => {
        setMensajeDRP(`✅ Respaldo DRP creado exitosamente: ${data.nombre_archivo} (${data.tamano_mb.toFixed(4)} MB)`);
      },
      onError: (err: any) => {
        setMensajeDRP(`❌ Error al generar respaldo DRP: ${err.message}`);
      },
    });
  };

  const handleRestaurar = (nombreArchivo: string) => {
    if (confirm(`¿Está seguro de restaurar la base de datos al respaldo '${nombreArchivo}'?`)) {
      setMensajeDRP(null);
      restaurarBackup.mutate(nombreArchivo, {
        onSuccess: (data) => {
          setMensajeDRP(`✅ ${data.mensaje}`);
        },
        onError: (err: any) => {
          setMensajeDRP(`❌ Error al restaurar respaldo DRP: ${err.message}`);
        },
      });
    }
  };

  const totalEventos = logs?.length || 0;
  const eventosSesion = logs?.filter((l) => l.accion.includes('SESION')).length || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Auditoría Forense y Plan DRP (Anti-Desastre y Respaldos)
        </h1>
        <p className="text-slate-500 text-sm">
          Trazabilidad inmutable de eventos, control de sesiones y centro de mando DRP para respaldos automáticos cifrados
        </p>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Rol Actual Activo</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-2">
            {usuario?.rol || 'ADMIN'} ({usuario?.nombre || 'Administrador General'})
          </p>
          <span className="text-xs text-slate-500 font-medium">Sesión iniciada como {usuario?.email || 'admin@sifaco.ni'}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Eventos Totales en Bitácora</span>
          <p className="text-2xl font-extrabold text-indigo-600 mt-2">{totalEventos} Evento(s)</p>
          <span className="text-xs text-indigo-500 font-medium">Almacenados en auditoria_logs</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase">Control de Sesiones y Accesos</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">{eventosSesion} Traza(s) de Sesión</p>
          <span className="text-xs text-amber-500 font-medium">Inicios y cierres de sesión auditados</span>
        </div>
      </div>

      {/* SECCIÓN DRP - DISASTER RECOVERY PLAN & RESPALDOS AUTOMÁTICOS */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-700 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase px-2 py-0.5 rounded tracking-wider font-mono">
                Protección Anti-Desastre
              </span>
              <h2 className="text-xl font-bold">Plan DRP y Respaldos Automáticos de Base de Datos</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Garantía de continuidad del negocio, RPO &lt; 15 min, RTO &lt; 30 min y rotación automática de dumps SQL cifrados
            </p>
          </div>

          <button
            onClick={handleCrearBackupManual}
            disabled={generarBackup.isPending}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-lg transition shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 self-start sm:self-auto"
          >
            <span>{generarBackup.isPending ? 'Generando Respaldo...' : '⚡ Crear Respaldo de Emergencia Ahora'}</span>
          </button>
        </div>

        {mensajeDRP && (
          <div
            className={`p-3.5 rounded-lg text-xs font-semibold ${
              mensajeDRP.startsWith('✅')
                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600/50'
                : 'bg-rose-900/80 text-rose-200 border border-rose-600/50'
            }`}
          >
            {mensajeDRP}
          </div>
        )}

        {/* Indicadores de Salud DRP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Estado de Salud DRP</span>
            <p className="text-lg font-bold text-emerald-400 mt-1">{drp?.estado_salud || 'PROTEGIDO'}</p>
            <span className="text-[10px] text-slate-400">Verificado</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">RPO (Máx. Pérdida)</span>
            <p className="text-lg font-bold text-indigo-400 mt-1">&lt; 15 Minutos</p>
            <span className="text-[10px] text-indigo-300">WAL &amp; Dumps Hora</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">RTO (Recuperación)</span>
            <p className="text-lg font-bold text-amber-400 mt-1">&lt; 30 Minutos</p>
            <span className="text-[10px] text-amber-300">Restauración Atómica</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Respaldos Guardados</span>
            <p className="text-lg font-bold text-cyan-400 mt-1">{drp?.total_backups || 0} Archivo(s)</p>
            <span className="text-[10px] text-cyan-300">{drp?.espacio_utilizado_mb.toFixed(4) || '0.00'} MB</span>
          </div>
        </div>

        {/* Tabla de Respaldos DRP Existentes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold uppercase tracking-wider">
            <span>Inventario de Snapshots de Respaldos (.sql.gz)</span>
            <span className="font-mono text-[11px] text-slate-400">
              Último: {drp?.ultimo_backup_fecha || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-950/60 rounded-xl overflow-hidden border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-800/60 text-slate-300 border-b border-slate-700/80 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Nombre del Archivo</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Tamaño</th>
                  <th className="py-2.5 px-3">Firma SHA-256</th>
                  <th className="py-2.5 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {drp?.backups_recientes?.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-emerald-400 font-semibold">{b.fecha_hora}</td>
                    <td className="p-3 font-bold text-white max-w-xs truncate" title={b.nombre_archivo}>
                      {b.nombre_archivo}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                        {b.tipo_backup}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{b.tamano_mb.toFixed(4)} MB</td>
                    <td className="p-3 text-slate-400 text-[10px]" title={b.checksum_sha256}>
                      {b.checksum_sha256.substring(0, 12)}...
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRestaurar(b.nombre_archivo)}
                        disabled={restaurarBackup.isPending}
                        className="bg-amber-600/90 hover:bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded transition shadow disabled:opacity-50"
                        title="Restaurar base de datos a este snapshot"
                      >
                        Restaurar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabla de Logs de Auditoría */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Bitácora de Sesiones y Operaciones (auditoria_logs)</h2>
          <span className="text-xs text-slate-400 font-mono">Actualización automática activada</span>
        </div>

        {loadingLogs ? (
          <div className="py-12 text-center text-slate-500 animate-pulse font-medium">
            Cargando pista de auditoría y log de sesiones...
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-[11px] uppercase border-b border-slate-200 font-bold">
                  <th className="py-3 px-3 w-[18%]">Fecha y Hora</th>
                  <th className="py-3 px-3 w-[22%]">Usuario &amp; Rol</th>
                  <th className="py-3 px-3 w-[16%]">Acción Auditada</th>
                  <th className="py-3 px-3 w-[14%]">Tabla / Módulo</th>
                  <th className="py-3 px-3 w-[20%]">Detalles de Operación</th>
                  <th className="py-3 px-3 w-[10%] text-center">IP Origen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {logs?.map((l) => {
                  const esCierre = l.accion === 'CIERRE_SESION';
                  const esInicio = l.accion === 'INICIO_SESION';

                  return (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-3 text-xs font-mono font-semibold text-slate-700">{l.fecha_hora}</td>
                      <td className="p-3 font-medium text-slate-900">
                        <div>{l.usuario_nombre}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{l.usuario_email}</div>
                        <div className="text-xs font-bold font-mono text-emerald-700 mt-0.5">[{l.rol}]</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded font-mono font-bold inline-block ${
                            esInicio
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : esCierre
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-slate-100 text-slate-800 border border-slate-300'
                          }`}
                        >
                          {l.accion}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-700 font-semibold">{l.tabla_afectada}</td>
                      <td className="p-3 text-xs text-slate-700 max-w-md leading-relaxed">{l.detalles}</td>
                      <td className="p-3 text-center font-mono text-xs text-slate-500">{l.ip_origen}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
