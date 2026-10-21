import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUSINESS_INFO } from '../../business-info';
import { CookieConsentService } from '../../../core/services/cookie-consent.service';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <nav class="footer-links" aria-label="Informações legais">
        <a routerLink="/privacidade">Política de Privacidade</a>
        <a routerLink="/termos">Termos de Uso</a>
        <a routerLink="/cookies">Política de Cookies</a>
        <a routerLink="/reembolso">Política de Reembolso</a>
        <a routerLink="/licencas">Licenças</a>
        <button type="button" class="link-button" (click)="preferenciasCookies()">Preferências de cookies</button>
      </nav>
      <address class="footer-business">
        <strong>{{ info.nomeFantasia }}</strong> · {{ info.razaoSocial }} · CNPJ {{ info.cnpj }}<br />
        {{ info.endereco }}<br />
        Contato: {{ info.emailContato }} · {{ info.telefone }} ·
        Encarregado de dados (DPO): {{ info.encarregadoEmail }}
      </address>
    </footer>
  `,
})
export class SiteFooterComponent {
  info = BUSINESS_INFO;

  constructor(private cookies: CookieConsentService) {}

  preferenciasCookies() {
    this.cookies.abrirPreferencias();
  }
}
