import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Chamado, EscalonarRequest, Historico, NovoChamadoRequest } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ChamadosService {
  private readonly api = inject(ApiService);
  private readonly apiUrl = '/chamados';

  /** Fila completa (apenas equipe de atendimento). */
  listar(): Observable<Chamado[]> {
    return this.api.get<Chamado[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<Chamado> {
    return this.api.get<Chamado>(`${this.apiUrl}/${id}`);
  }

  /** O cliente do chamado é definido no servidor a partir do usuário autenticado. */
  criar(chamado: NovoChamadoRequest): Observable<Chamado> {
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

  atribuirTecnico(id: number, tecnicoId: number): Observable<Chamado> {
    return this.api.put<Chamado>(`${this.apiUrl}/${id}/atribuir-tecnico/${tecnicoId}`, {});
  }

  /**
   * Escalona o chamado para o próximo nível (N1 -> N2 -> N3) ou para o
   * nível informado, opcionalmente atribuindo a um técnico específico.
   */
  escalonar(id: number, request: EscalonarRequest = {}): Observable<Chamado> {
    return this.api.put<Chamado>(`${this.apiUrl}/${id}/escalonar`, request);
  }

  /** Histórico (auditoria) de eventos do chamado, mais recentes primeiro. */
  historico(id: number): Observable<Historico[]> {
    return this.api.get<Historico[]>(`${this.apiUrl}/${id}/historico`);
  }
}
