export interface Comentario {
  id: number;
  texto: string;
  dataCriacao?: string;
  autorNome?: string;
  autorId?: number;
  chamadoId: number;
}
