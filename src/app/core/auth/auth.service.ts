import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { ApiService } from '../services/api.service';
import { DecodedToken, LoginRequest, Role, TokenResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';

  private readonly api = inject(ApiService);
  private readonly token = signal<string | null>(this.lerToken());

  /** Papel do usuário logado, reativo para menus e templates. */
  readonly role = computed<Role | null>(() => this.decodificar(this.token())?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'ADMIN');
  readonly isTecnico = computed(() => this.role() === 'TECNICO');
  readonly isCliente = computed(() => this.role() === 'CLIENTE');
  /** Equipe de atendimento (técnicos e administradores). */
  readonly isEquipe = computed(() => this.isAdmin() || this.isTecnico());

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.api.post<TokenResponse>('/auth/login', credentials).pipe(
      tap(res => {
        localStorage.setItem(AuthService.TOKEN_KEY, res.token);
        this.token.set(res.token);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    this.token.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  getUserData(): DecodedToken | null {
    return this.decodificar(this.token());
  }

  isAuthenticated(): boolean {
    const data = this.getUserData();
    return !!data && data.exp > Math.floor(Date.now() / 1000);
  }

  getUserRole(): Role | null {
    return this.role();
  }

  getUserEmail(): string | null {
    return this.getUserData()?.sub ?? null;
  }

  private lerToken(): string | null {
    try {
      return localStorage.getItem(AuthService.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private decodificar(token: string | null): DecodedToken | null {
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }
}
