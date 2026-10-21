import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Comentario {
  id: number;
  texto: string;
  dataCriacao?: string;
  autorNome?: string;
  autorId?: number;
  chamadoId: number;
}

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private readonly apiUrl = '/comentarios';

  constructor(private api: ApiService) { }

  listarPorChamado(chamadoId: number): Observable<Comentario[]> {
    return this.api.get<Comentario[]>(`${this.apiUrl}/chamado/${chamadoId}`);
  }

  criar(chamadoId: number, comentario: { texto: string }): Observable<Comentario> {
    return this.api.post<Comentario>(`${this.apiUrl}/chamado/${chamadoId}`, comentario);
  }

  excluir(id: number): Observable<void> {
    return this.api.delete<void>(`${this.apiUrl}/${id}`);
  }
}
