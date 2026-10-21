import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CookieConsentService } from '@core/services/cookie-consent.service';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <nav class="footer__links" aria-label="Informações legais">
        <a routerLink="/privacidade">Privacidade</a>
        <a routerLink="/termos">Termos de Uso</a>
        <a routerLink="/cookies">Cookies</a>
        <a routerLink="/reembolso">Reembolso</a>
        <a routerLink="/licencas">Licenças</a>
        <button type="button" class="link-button" (click)="preferenciasCookies()">Preferências de cookies</button>
      </nav>
    </footer>
  `,
  styles: `
    .footer {
      padding: var(--space-5) var(--space-6);
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: var(--text-xs);
    }
    .footer__links {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1) var(--space-4);
    }
    .footer__links a,
    .footer__links .link-button {
      color: var(--muted);
      text-decoration: none;
    }
    .footer__links a:hover,
    .footer__links .link-button:hover {
      color: var(--accent);
      text-decoration: underline;
    }
  `,
})
export class SiteFooterComponent {
  private readonly cookies = inject(CookieConsentService);

  preferenciasCookies() {
    this.cookies.abrirPreferencias();
  }
}
