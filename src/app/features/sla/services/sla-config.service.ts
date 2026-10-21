import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { Prioridade, SlaConfig } from '@core/models';

@Injectable({ providedIn: 'root' })
export class SlaConfigService {
  private readonly api = inject(ApiService);
  private readonly apiUrl = '/sla-config';

  listar(): Observable<SlaConfig[]> {
    return this.api.get<SlaConfig[]>(this.apiUrl);
  }

  atualizar(prioridade: Prioridade, config: Partial<SlaConfig>): Observable<SlaConfig> {
    return this.api.put<SlaConfig>(`${this.apiUrl}/${prioridade}`, config);
  }
}
