import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  status: string;
  categoria: string;
  prioridade?: string;
  nivelAtual?: string;
  statusSla?: string;
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

export interface Historico {
  id: number;
  chamadoId: number;
  usuarioNome: string;
  tipoEvento: string;
  descricao: string;
  dataHora: string;
}

export interface EscalonarRequest {
  novoNivel?: string | null;
  tecnicoId?: number | null;
  motivo?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ChamadosService {
  private readonly apiUrl = '/chamados';

  constructor(private api: ApiService) { }

  listar(): Observable<Chamado[]> {
    return this.api.get<Chamado[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Chamado> {
    return this.api.get<Chamado>(`${this.apiUrl}/${id}`);
  }

  criar(chamado: { titulo: string; descricao: string; categoria?: string; prioridade?: string; clienteId?: number }): Observable<Chamado> {
    return this.api.post<Chamado>(this.apiUrl, chamado);
  }

  atualizar(id: number, chamado: Partial<Chamado>): Observable<Chamado> {
    return this.api.put<Chamado>(`${this.apiUrl}/${id}`, chamado);
  }

  excluir(id: number): Observable<void> {
    return this.api.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarPorCliente(clienteId: number): Observable<Chamado[]> {
    return this.api.get<Chamado[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }

  listarPorTecnico(tecnicoId: number): Observable<Chamado[]> {
    return this.api.get<Chamado[]>(`${this.apiUrl}/tecnico/${tecnicoId}`);
  }

  atribuirTecnico(id: number, tecnicoId: number, chamado: Partial<Chamado>): Observable<Chamado> {
    return this.api.put<Chamado>(`${this.apiUrl}/${id}/atribuir-tecnico/${tecnicoId}`, chamado);
  }

  /**
   * Escalona o chamado para o próximo nível (N1 -> N2 -> N3) ou para o
   * nível informado, opcionalmente atribuindo a um técnico específico.
   */
  escalonar(id: number, request: EscalonarRequest = {}): Observable<Chamado> {
    return this.api.put<Chamado>(`${this.apiUrl}/${id}/escalonar`, request);
  }

  /**
   * Lista o histórico (auditoria) de eventos do chamado, mais recentes primeiro.
   */
  historico(id: number): Observable<Historico[]> {
    return this.api.get<Historico[]>(`${this.apiUrl}/${id}/historico`);
  }
}
