import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Notificacao } from '@core/models';

@Injectable({ providedIn: 'root' })
export class NotificacoesService {
  private readonly api = inject(ApiService);
  private readonly apiUrl = '/notificacoes';

  listar(): Observable<Notificacao[]> {
    return this.api.get<Notificacao[]>(this.apiUrl);
  }

  contarNaoLidas(): Observable<number> {
    return this.api.get<number>(`${this.apiUrl}/nao-lidas`);
  }

  marcarComoLida(id: number): Observable<void> {
    return this.api.put<void>(`${this.apiUrl}/${id}/lida`, {});
  }
}
