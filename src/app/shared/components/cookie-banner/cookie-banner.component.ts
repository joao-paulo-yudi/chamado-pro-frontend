import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CookieConsentService } from '@core/services/cookie-consent.service';

/**
 * Banner de consentimento de cookies/armazenamento local.
 * - "Aceitar" e "Rejeitar" têm o mesmo destaque (sem dark patterns);
 * - categorias opcionais começam desmarcadas;
 * - a escolha pode ser alterada a qualquer momento pelo rodapé.
 */
@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    @if (visivel) {
      <section class="cookie" role="dialog" aria-labelledby="cookie-titulo" aria-describedby="cookie-texto">
        <div class="cookie__head">
          <i class="fa-solid fa-cookie-bite" aria-hidden="true"></i>
          <h2 id="cookie-titulo">Cookies e armazenamento local</h2>
        </div>
        <p id="cookie-texto" class="cookie__text">
          Usamos apenas o armazenamento local <strong>estritamente necessário</strong> para manter sua sessão
          de login e lembrar esta escolha. Não usamos cookies de publicidade nem de rastreamento. Saiba mais na
          <a routerLink="/cookies">Política de Cookies</a>.
        </p>

        @if (personalizando) {
          <div class="cookie__opcoes">
            <label class="checkbox">
              <input type="checkbox" checked disabled />
              <span><strong>Essenciais</strong> — sempre ativos. Sessão de login e preferências de privacidade.</span>
            </label>
            <label class="checkbox">
              <input type="checkbox" [(ngModel)]="analiticos" name="analiticos" />
              <span>
                <strong>Analíticos</strong> — medição de uso. Não utilizados atualmente; só serão ativados com seu
                consentimento.
              </span>
            </label>
          </div>
        }

        <div class="cookie__acoes">
          @if (!personalizando) {
            <button type="button" class="btn btn--ghost" (click)="personalizando = true">Personalizar</button>
            <button type="button" class="btn btn--primary" (click)="rejeitar()">Rejeitar opcionais</button>
            <button type="button" class="btn btn--primary" (click)="aceitar()">Aceitar</button>
          } @else {
            <button type="button" class="btn btn--primary" (click)="salvar()">Salvar preferências</button>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .cookie {
      position: fixed;
      left: var(--space-4);
      bottom: var(--space-4);
      z-index: 1000;
      width: min(480px, calc(100vw - 32px));
      padding: var(--space-5);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-lg);
    }
    .cookie__head {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }
    .cookie__head i {
      color: var(--accent);
    }
    .cookie__head h2 {
      font-size: var(--text-md);
    }
    .cookie__text {
      color: var(--muted);
      font-size: var(--text-sm);
    }
    .cookie__opcoes {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-top: var(--space-4);
      font-size: var(--text-sm);
    }
    .cookie__acoes {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--space-2);
      margin-top: var(--space-4);
    }
  `,
})
export class CookieBannerComponent implements OnInit, OnDestroy {
  private readonly consent = inject(CookieConsentService);
  private sub?: Subscription;

  visivel = false;
  personalizando = false;
  analiticos = false;

  ngOnInit() {
    this.visivel = this.consent.obter() === null;
    this.sub = this.consent.preferenciasAbertas$.subscribe(abrir => {
      if (abrir) {
        this.analiticos = this.consent.obter()?.analiticos ?? false;
        this.personalizando = true;
        this.visivel = true;
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  aceitar() {
    this.consent.salvar(true);
    this.fechar();
  }

  rejeitar() {
    this.consent.salvar(false);
    this.fechar();
  }

  salvar() {
    this.consent.salvar(this.analiticos);
    this.fechar();
  }

  private fechar() {
    this.visivel = false;
    this.personalizando = false;
  }
}
