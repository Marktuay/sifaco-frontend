import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api-client';
import { InformeVentasDGI, DashboardKPIs } from '@/types';

export function useInformeVentasDGI(mes: number, anio: number) {
  return useQuery<InformeVentasDGI>({
    queryKey: ['informe-ventas-dgi', mes, anio],
    queryFn: () => fetchApi<InformeVentasDGI>(`/reportes/dgi/informe-ventas-dgi?mes=${mes}&anio=${anio}`),
  });
}

export function useDashboardKPIs() {
  return useQuery<DashboardKPIs>({
    queryKey: ['dashboard-kpis'],
    queryFn: () => fetchApi<DashboardKPIs>('/reportes/dgi/dashboard-kpis'),
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });
}
