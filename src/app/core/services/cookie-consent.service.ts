import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CookieConsent {
  versao: number;
  /** Sempre true: armazenamento estritamente necessário (sessão de login e esta preferência). */
  essenciais: true;
  /** Medição de uso. Hoje o ChamadoPro NÃO usa nenhuma ferramenta analítica. */
  analiticos: boolean;
  data: string;
}

/**
 * Guarda a escolha do usuário no banner de cookies. Qualquer script não
 * essencial adicionado no futuro deve verificar `permitido('analiticos')`
 * antes de ser carregado.
 */
@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private static readonly KEY = 'cp_cookie_consent';
  private static readonly VERSAO = 1;

  private readonly abrirPreferencias$ = new BehaviorSubject<boolean>(false);
  readonly preferenciasAbertas$ = this.abrirPreferencias$.asObservable();

  obter(): CookieConsent | null {
    try {
      const bruto = localStorage.getItem(CookieConsentService.KEY);
      if (!bruto) return null;
      const valor = JSON.parse(bruto) as CookieConsent;
      return valor.versao === CookieConsentService.VERSAO ? valor : null;
    } catch {
      return null;
    }
  }

  salvar(analiticos: boolean) {
    const valor: CookieConsent = {
      versao: CookieConsentService.VERSAO,
      essenciais: true,
      analiticos,
      data: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CookieConsentService.KEY, JSON.stringify(valor));
    } catch {
      /* armazenamento indisponível (modo privado): a escolha vale só nesta sessão */
    }
    this.abrirPreferencias$.next(false);
  }

  permitido(categoria: 'analiticos'): boolean {
    return this.obter()?.[categoria] === true;
  }

  abrirPreferencias() {
    this.abrirPreferencias$.next(true);
  }
}
