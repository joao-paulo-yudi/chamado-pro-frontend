import { Injectable, inject } from '@angular/core';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from '../auth/auth.service';
import { ConsentimentoRequest, Perfil } from '../models';

/**
 * Dados do usuário autenticado (GET /usuarios/me), em cache por token.
 * Evita baixar a lista de todos os usuários só para descobrir o próprio id.
 */
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private cache$?: Observable<Perfil>;
  private cacheToken: string | null = null;

  me(): Observable<Perfil> {
    const token = this.auth.getToken();
    if (!this.cache$ || token !== this.cacheToken) {
      this.cacheToken = token;
      this.cache$ = this.api.get<Perfil>('/usuarios/me').pipe(shareReplay(1));
    }
    return this.cache$;
  }

  termosAceitos(perfil: Perfil): boolean {
    return !!perfil.versaoTermosAceita && perfil.versaoTermosAceita === perfil.versaoTermosAtual;
  }

  registrarConsentimento(req: ConsentimentoRequest): Observable<Perfil> {
    return this.api.put<Perfil>('/usuarios/me/consentimentos', req).pipe(tap(p => (this.cache$ = of(p))));
  }

  exportarDados(): Observable<Blob> {
    return this.api.getBlob('/usuarios/me/exportar');
  }

  limpar(): void {
    this.cache$ = undefined;
    this.cacheToken = null;
  }
}
