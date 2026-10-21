import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SiteFooterComponent } from '../../../shared/components/site-footer/site-footer.component';
import { LEGAL_LAST_UPDATE } from '../../../shared/business-info';

/**
 * Moldura comum das páginas públicas (políticas, termos, licenças):
 * logo, botão voltar, navegação entre os documentos e rodapé.
 */
@Component({
  selector: 'app-legal-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SiteFooterComponent],
  template: `
    <div class="legal-page">
      <header class="legal-topbar">
        <a routerLink="/" class="legal-logo">
          <img src="assets/logo-vertical.svg" alt="ChamadoPro - página inicial" />
        </a>
        <button type="button" class="btn btn-secondary" (click)="voltar()">
          <i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Voltar
        </button>
      </header>

      <nav class="legal-nav" aria-label="Documentos legais">
        <a routerLink="/privacidade" routerLinkActive="active" ariaCurrentWhenActive="page">Privacidade</a>
        <a routerLink="/termos" routerLinkActive="active" ariaCurrentWhenActive="page">Termos de Uso</a>
        <a routerLink="/cookies" routerLinkActive="active" ariaCurrentWhenActive="page">Cookies</a>
        <a routerLink="/reembolso" routerLinkActive="active" ariaCurrentWhenActive="page">Reembolso</a>
        <a routerLink="/licencas" routerLinkActive="active" ariaCurrentWhenActive="page">Licenças</a>
      </nav>

      <main id="conteudo" class="legal-content" tabindex="-1">
        <h1>{{ titulo }}</h1>
        <p class="legal-updated">Última atualização: {{ atualizacao }}</p>
        <ng-content></ng-content>
      </main>

      <app-site-footer></app-site-footer>
    </div>
  `,
})
export class LegalShellComponent {
  @Input() titulo = '';
  atualizacao = LEGAL_LAST_UPDATE;

  constructor(private location: Location) {}

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.location.hash = '#/';
    }
  }
}
