export type StatusChamado = 'ABERTO' | 'EM_ANDAMENTO' | 'RESOLVIDO' | 'FECHADO';
export type Categoria = 'HARDWARE' | 'SOFTWARE' | 'REDE' | 'IMPRESSORA' | 'OUTROS';
export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type Nivel = 'N1' | 'N2' | 'N3';
export type StatusSla = 'NO_PRAZO' | 'EM_RISCO' | 'ESTOURADO' | 'CUMPRIDO';

export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  status: StatusChamado;
  categoria?: Categoria | null;
  prioridade?: Prioridade | null;
  nivelAtual?: Nivel | null;
  statusSla?: StatusSla | null;
  dataCriacao?: string;
  dataPrimeiraResposta?: string;
  prazoPrimeiraResposta?: string;
  prazoResolucao?: string;
  avaliacao?: number;
  feedback?: string;
  ultimaAtualizacao?: string;
  clienteId?: number;
  clienteNome?: string;
  tecnicoId?: number;
  tecnicoNome?: string;
  adminId?: number;
  adminNome?: string;
}

export interface NovoChamadoRequest {
  titulo: string;
  descricao: string;
  categoria?: Categoria;
  prioridade?: Prioridade;
}

export interface Historico {
  id: number;
  chamadoId: number;
  usuarioNome: string;
  tipoEvento: string;
  descricao: string;
  dataHora: string;
}

export interface EscalonarRequest {
  novoNivel?: Nivel | null;
  tecnicoId?: number | null;
  motivo?: string | null;
}
