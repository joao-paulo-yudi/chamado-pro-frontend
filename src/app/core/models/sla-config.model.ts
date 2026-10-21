import { Prioridade } from './chamado.model';

export interface SlaConfig {
  id?: number;
  prioridade: Prioridade;
  tempoRespostaMinutos: number;
  tempoResolucaoMinutos: number;
}
