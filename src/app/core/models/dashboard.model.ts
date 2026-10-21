export interface DashboardData {
  totalChamados: number;
  chamadosAbertos: number;
  chamadosEmAndamento: number;
  chamadosResolvidos: number;
  chamadosFechados: number;
  chamadosEscalonados: number;
  slaNoPrazo: number;
  slaEmRisco: number;
  slaEstourado: number;
  slaCumprido: number;
  percentualSlaCumprido: number;
  tempoMedioResolucaoHoras: number;
  chamadosPorCategoria: Record<string, number>;
  chamadosPorPrioridade: Record<string, number>;
  chamadosPorNivel: Record<string, number>;
  chamadosPorTecnico: Record<string, number>;
}
