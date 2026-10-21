import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Comentario } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ComentariosService {
  private readonly api = inject(ApiService);
  private readonly apiUrl = '/comentarios';

  listarPorChamado(chamadoId: number): Observable<Comentario[]> {
    return this.api.get<Comentario[]>(`${this.apiUrl}/chamado/${chamadoId}`);
  }

  /** O autor é definido no servidor a partir do usuário autenticado. */
  criar(chamadoId: number, comentario: { texto: string }): Observable<Comentario> {
    return this.api.post<Comentario>(`${this.apiUrl}/chamado/${chamadoId}`, comentario);
  }

  excluir(id: number): Observable<void> {
    return this.api.delete<void>(`${this.apiUrl}/${id}`);
  }
}
