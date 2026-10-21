/**
 * Rótulos, tons visuais e regras compartilhadas dos chamados (status,
 * categoria, prioridade, nível de atendimento e SLA). Mantém a UI
 * consistente com as regras do backend (ChamadoPro - SlaService).
 */
import { Categoria, Nivel, Prioridade, Role, StatusChamado, StatusSla } from '../models';

/** Tons disponíveis para badges (classes `.badge--<tom>` em styles/_components.css). */
export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'cyan' | 'brand' | 'neutral';

export interface EnumMeta {
  label: string;
  tone: BadgeTone;
  icon?: string;
}

export const STATUS_META: Record<StatusChamado, EnumMeta> = {
  ABERTO: { label: 'Aberto', tone: 'cyan', icon: 'fa-circle-dot' },
  EM_ANDAMENTO: { label: 'Em andamento', tone: 'info', icon: 'fa-spinner' },
  RESOLVIDO: { label: 'Resolvido', tone: 'success', icon: 'fa-circle-check' },
  FECHADO: { label: 'Fechado', tone: 'neutral', icon: 'fa-lock' },
};

export const PRIORIDADE_META: Record<Prioridade, EnumMeta> = {
  BAIXA: { label: 'Baixa', tone: 'neutral', icon: 'fa-angle-down' },
  MEDIA: { label: 'Média', tone: 'info', icon: 'fa-equals' },
  ALTA: { label: 'Alta', tone: 'warning', icon: 'fa-angle-up' },
  CRITICA: { label: 'Crítica', tone: 'danger', icon: 'fa-angles-up' },
};

export const SLA_META: Record<StatusSla, EnumMeta> = {
  NO_PRAZO: { label: 'No prazo', tone: 'success', icon: 'fa-clock' },
  EM_RISCO: { label: 'Em risco', tone: 'warning', icon: 'fa-triangle-exclamation' },
  ESTOURADO: { label: 'Estourado', tone: 'danger', icon: 'fa-circle-exclamation' },
  CUMPRIDO: { label: 'Cumprido', tone: 'success', icon: 'fa-circle-check' },
};

export const NIVEL_META: Record<Nivel, EnumMeta> = {
  N1: { label: 'N1', tone: 'brand' },
  N2: { label: 'N2', tone: 'brand' },
  N3: { label: 'N3', tone: 'brand' },
};

export const CATEGORIA_META: Record<Categoria, EnumMeta> = {
  HARDWARE: { label: 'Hardware', tone: 'neutral', icon: 'fa-computer' },
  SOFTWARE: { label: 'Software', tone: 'neutral', icon: 'fa-code' },
  REDE: { label: 'Rede', tone: 'neutral', icon: 'fa-network-wired' },
  IMPRESSORA: { label: 'Impressora', tone: 'neutral', icon: 'fa-print' },
  OUTROS: { label: 'Outros', tone: 'neutral', icon: 'fa-shapes' },
};

export const ROLE_META: Record<Role, EnumMeta> = {
  ADMIN: { label: 'Administrador', tone: 'brand', icon: 'fa-user-shield' },
  TECNICO: { label: 'Técnico', tone: 'info', icon: 'fa-screwdriver-wrench' },
  CLIENTE: { label: 'Cliente', tone: 'neutral', icon: 'fa-user' },
};

export const EVENTO_META: Record<string, EnumMeta> = {
  CRIACAO: { label: 'Chamado aberto', tone: 'cyan', icon: 'fa-plus' },
  MUDANCA_STATUS: { label: 'Status alterado', tone: 'info', icon: 'fa-arrows-rotate' },
  MUDANCA_PRIORIDADE: { label: 'Prioridade alterada', tone: 'warning', icon: 'fa-flag' },
  ATRIBUICAO: { label: 'Responsável definido', tone: 'brand', icon: 'fa-user-check' },
  ESCALONAMENTO: { label: 'Escalonado', tone: 'warning', icon: 'fa-turn-up' },
  COMENTARIO: { label: 'Comentário', tone: 'neutral', icon: 'fa-comment' },
  ALERTA_SLA: { label: 'Alerta de SLA', tone: 'danger', icon: 'fa-bell' },
};

/** Todos os grupos de metadados, indexados pelo nome usado no pipe `label`. */
export const ENUM_META = {
  status: STATUS_META,
  prioridade: PRIORIDADE_META,
  sla: SLA_META,
  nivel: NIVEL_META,
  categoria: CATEGORIA_META,
  role: ROLE_META,
  evento: EVENTO_META,
} as const;

export type EnumKind = keyof typeof ENUM_META;

export function enumMeta(kind: EnumKind, value: string | null | undefined): EnumMeta | null {
  if (!value) return null;
  const group = ENUM_META[kind] as Record<string, EnumMeta>;
  return group[value] ?? { label: value, tone: 'neutral' };
}

export const STATUS_OPCOES: StatusChamado[] = ['ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO', 'FECHADO'];
export const PRIORIDADE_OPCOES: Prioridade[] = ['BAIXA', 'MEDIA', 'ALTA', 'CRITICA'];
export const CATEGORIA_OPCOES: Categoria[] = ['HARDWARE', 'SOFTWARE', 'REDE', 'IMPRESSORA', 'OUTROS'];
export const NIVEL_OPCOES: Nivel[] = ['N1', 'N2', 'N3'];
export const ROLE_OPCOES: Role[] = ['CLIENTE', 'TECNICO', 'ADMIN'];

/** Status em que o atendimento terminou (permite avaliação do cliente). */
export const STATUS_ENCERRADOS: StatusChamado[] = ['RESOLVIDO', 'FECHADO'];

/** Peso para ordenar por prioridade (maior = mais urgente). */
export const PRIORIDADE_PESO: Record<Prioridade, number> = { BAIXA: 1, MEDIA: 2, ALTA: 3, CRITICA: 4 };

/**
 * Sugestão automática de prioridade com base na categoria do problema,
 * espelhando SlaService.sugerirPrioridade no backend. O usuário pode
 * alterar essa sugestão antes de enviar o chamado.
 */
export function sugerirPrioridade(categoria?: Categoria | null): Prioridade {
  switch (categoria) {
    case 'REDE':
      return 'CRITICA';
    case 'SOFTWARE':
      return 'ALTA';
    case 'HARDWARE':
      return 'MEDIA';
    case 'IMPRESSORA':
      return 'BAIXA';
    default:
      return 'MEDIA';
  }
}

/** Próximo nível de escalonamento (N1 -> N2 -> N3 -> N3). */
export function proximoNivel(nivelAtual?: Nivel | null): Nivel {
  switch (nivelAtual) {
    case 'N2':
    case 'N3':
      return 'N3';
    default:
      return 'N2';
  }
}

export function podeEscalonar(nivelAtual?: Nivel | null): boolean {
  return nivelAtual !== 'N3';
}
