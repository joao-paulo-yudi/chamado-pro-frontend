import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from '../../features/auth/services/auth.service';

export interface Perfil {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: string;
  nivelTecnico?: string | null;
  telefone?: string | null;
  whatsappConfigurado: boolean;
  consentimentoWhatsapp: boolean;
  dataConsentimentoWhatsapp?: string | null;
  versaoTermosAceita?: string | null;
  dataAceiteTermos?: string | null;
  versaoTermosAtual: string;
}

export interface ConsentimentoRequest {
  versaoTermos: string;
  aceiteTermos: boolean;
  consentimentoWhatsapp: boolean;
}

/**
 * Dados do usuário autenticado (GET /usuarios/me). Substitui a antiga prática
 * de baixar a lista de TODOS os usuários só para descobrir o próprio id.
 */
@Injectable({ providedIn: 'root' })
export class PerfilService {
  private cache$?: Observable<Perfil>;
  private cacheToken: string | null = null;

  constructor(private api: ApiService, private http: HttpClient, private auth: AuthService) {}

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
    return this.api.put<Perfil>('/usuarios/me/consentimentos', req).pipe(
      tap(p => this.cache$ = of(p))
    );
  }

  exportarDados(): Observable<Blob> {
    return this.http.get('/usuarios/me/exportar', { responseType: 'blob' });
  }

  excluirConta(): Observable<void> {
    return this.api.delete<void>('/usuarios/me');
  }

  limpar() {
    this.cache$ = undefined;
    this.cacheToken = null;
  }
}
