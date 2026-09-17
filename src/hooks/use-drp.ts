import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';

export interface BackupItem {
  id: string;
  nombre_archivo: string;
  ruta_absoluta: string;
  tamano_mb: number;
  checksum_sha256: string;
  tipo_backup: string;
  estado: string;
  fecha_hora: string;
  creado_en?: string;
}

export interface DRPStatus {
  estado_salud: string;
  ultimo_backup_fecha: string;
  ultimo_backup_nombre: string;
  total_backups: number;
  espacio_utilizado_mb: number;
  rpo_status: string;
  rto_status: string;
  backups_recientes: BackupItem[];
}

export function useDRPStatus() {
  return useQuery<DRPStatus>({
    queryKey: ['drp-status'],
    queryFn: () => fetchApi<DRPStatus>('/drp/status'),
    refetchInterval: 15000,
  });
}

export function useBackupsList() {
  return useQuery<BackupItem[]>({
    queryKey: ['drp-backups'],
    queryFn: () => fetchApi<BackupItem[]>('/drp/backups'),
    refetchInterval: 10000,
  });
}

export function useGenerarBackupDRP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tipo?: string) =>
      fetchApi<BackupItem>('/drp/backups', {
        method: 'POST',
        body: JSON.stringify({ tipo: tipo || 'MANUAL_ADMIN' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drp-status'] });
      queryClient.invalidateQueries({ queryKey: ['drp-backups'] });
      queryClient.invalidateQueries({ queryKey: ['auditoria-logs'] });
    },
  });
}

export function useRestaurarBackupDRP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nombreArchivo: string) =>
      fetchApi<{ mensaje: string }>('/drp/restore', {
        method: 'POST',
        body: JSON.stringify({ nombre_archivo: nombreArchivo }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drp-status'] });
      queryClient.invalidateQueries({ queryKey: ['drp-backups'] });
      queryClient.invalidateQueries({ queryKey: ['auditoria-logs'] });
    },
  });
}
