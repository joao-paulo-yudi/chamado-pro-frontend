import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CookieConsentService } from '../../../core/services/cookie-consent.service';

/**
 * Banner de consentimento de cookies/armazenamento local.
 * - "Aceitar" e "Rejeitar" têm o mesmo destaque (sem dark patterns);
 * - categorias opcionais começam desmarcadas;
 * - a escolha pode ser alterada a qualquer momento pelo rodapé.
 */
@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink],
  template: `
    <section *ngIf="visivel" class="cookie-banner" role="dialog" aria-labelledby="cookie-titulo" aria-describedby="cookie-texto">
      <h2 id="cookie-titulo">Cookies e armazenamento local</h2>
      <p id="cookie-texto">
        Usamos apenas o armazenamento local <strong>estritamente necessário</strong> para manter
        sua sessão de login e lembrar esta escolha. Não usamos cookies de publicidade nem de
        rastreamento. Saiba mais na <a routerLink="/cookies">Política de Cookies</a>.
      </p>

      <div *ngIf="personalizando" class="cookie-opcoes">
        <label class="checkbox">
          <input type="checkbox" checked disabled />
          <span><strong>Essenciais</strong> — sempre ativos. Sessão de login e preferências de privacidade.</span>
        </label>
        <label class="checkbox">
          <input type="checkbox" [(ngModel)]="analiticos" name="analiticos" />
          <span><strong>Analíticos</strong> — medição de uso. Não utilizados atualmente; só serão ativados com seu consentimento.</span>
        </label>
      </div>

      <div class="cookie-acoes">
        <ng-container *ngIf="!personalizando">
          <button type="button" class="btn" (click)="aceitar()">Aceitar</button>
          <button type="button" class="btn" (click)="rejeitar()">Rejeitar opcionais</button>
          <button type="button" class="btn btn-secondary" (click)="personalizando = true">Personalizar</button>
        </ng-container>
        <ng-container *ngIf="personalizando">
          <button type="button" class="btn" (click)="salvar()">Salvar preferências</button>
        </ng-container>
      </div>
    </section>
  `,
})
export class CookieBannerComponent implements OnInit, OnDestroy {
  visivel = false;
  personalizando = false;
  analiticos = false;

  private sub?: Subscription;

  constructor(private consent: CookieConsentService) {}

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
