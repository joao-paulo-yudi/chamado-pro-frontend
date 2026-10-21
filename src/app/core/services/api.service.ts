import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Prefixo das chamadas à API. As rotas das telas (/chamados, /usuarios...) usam os mesmos
 * nomes dos endpoints; o prefixo evita o conflito. O proxy (dev) e o NGINX (produção)
 * removem o `/api` antes de encaminhar ao backend.
 */
export const API_PREFIX = '/api';

/** Wrapper fino do HttpClient. As URLs são relativas ao backend: `get('/chamados')` -> `/api/chamados`. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  get<T>(url: string): Observable<T> {
    return this.http.get<T>(API_PREFIX + url);
  }

  getBlob(url: string): Observable<Blob> {
    return this.http.get(API_PREFIX + url, { responseType: 'blob' });
  }

  post<T>(url: string, data: unknown): Observable<T> {
    return this.http.post<T>(API_PREFIX + url, data);
  }

  put<T>(url: string, data: unknown): Observable<T> {
    return this.http.put<T>(API_PREFIX + url, data);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(API_PREFIX + url);
  }
}
