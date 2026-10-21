import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { DashboardData } from '@core/models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  obterDadosAdmin(): Observable<DashboardData> {
    return this.api.get<DashboardData>('/dashboard/admin');
  }
}
