import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { AuditoriaLogItem } from '@/types';

export function useAuditoriaLogs() {
  return useQuery<AuditoriaLogItem[]>({
    queryKey: ['auditoria-logs'],
    queryFn: () => fetchApi<AuditoriaLogItem[]>('/auditoria/logs'),
    refetchInterval: 10000, // Actualización automática cada 10s
  });
}

export function useRegistrarAuditoriaLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      usuario_email?: string;
      rol?: string;
      accion: string;
      tabla_afectada: string;
      detalles: string;
    }) =>
      fetchApi<AuditoriaLogItem>('/auditoria/logs', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditoria-logs'] });
    },
  });
}
