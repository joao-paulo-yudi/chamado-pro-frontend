import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { TecnicoResumo, Usuario, UsuarioRequest } from '@core/models';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly api = inject(ApiService);
  private readonly apiUrl = '/usuarios';

  listar(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>(this.apiUrl);
  }

  /** Apenas técnicos (com níveis N1/N2/N3), para seletores de atribuição e escalonamento. */
  listarTecnicos(): Observable<TecnicoResumo[]> {
    return this.api.get<TecnicoResumo[]>(`${this.apiUrl}/tecnicos`);
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  criar(usuario: UsuarioRequest): Observable<Usuario> {
    return this.api.post<Usuario>(this.apiUrl, usuario);
  }

  atualizar(id: number, usuario: Partial<UsuarioRequest>): Observable<Usuario> {
    return this.api.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  excluir(id: number): Observable<void> {
    return this.api.delete<void>(`${this.apiUrl}/${id}`);
  }
}
