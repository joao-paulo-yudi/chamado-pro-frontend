import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf, NgClass, DatePipe } from '@angular/common';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import { NotificacoesService, Notificacao } from '../../services/notificacoes.service';

@Component({
  selector: 'app-notificacao-bell',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, DatePipe],
  template: `
    <div class="notif-wrapper">
      <button type="button" class="notif-btn" (click)="toggle()" title="Notificações"
              [attr.aria-label]="naoLidas > 0 ? 'Notificações, ' + naoLidas + ' não lidas' : 'Notificações'"
              [attr.aria-expanded]="aberto" aria-controls="notif-dropdown">
        <i class="fa-solid fa-bell" aria-hidden="true"></i>
        <span class="notif-count" *ngIf="naoLidas > 0" aria-hidden="true">{{ naoLidas > 9 ? '9+' : naoLidas }}</span>
      </button>

      <div id="notif-dropdown" class="notif-dropdown" *ngIf="aberto" role="region" aria-label="Lista de notificações">
        <div class="notif-header">
          <strong>Notificações</strong>
        </div>

        <p class="notif-empty" *ngIf="notificacoes.length === 0">Nenhuma notificação.</p>

        <ul class="notif-list">
          <li *ngFor="let n of notificacoes">
            <button type="button" class="notif-item" [ngClass]="{ 'notif-unread': !n.lida }" (click)="abrir(n)">
              <span class="sr-only" *ngIf="!n.lida">Não lida: </span>
              <span class="notif-msg">{{ n.mensagem }}</span>
              <span class="notif-date">{{ n.dataEnvio | date:'dd/MM/yyyy HH:mm' }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .notif-wrapper {
      position: relative;
    }

    .notif-btn {
      position: relative;
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      color: var(--primary);
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notif-count {
      position: absolute;
      top: 2px;
      right: 2px;
      background: var(--danger);
      color: white;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 700;
      padding: 1px 5px;
      line-height: 1.4;
    }

    .notif-dropdown {
      position: absolute;
      right: 0;
      top: 110%;
      width: 320px;
      max-height: 400px;
      overflow-y: auto;
      background: var(--card);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      z-index: 50;
    }

    .notif-header {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .notif-empty {
      padding: 16px;
      color: var(--muted);
      font-size: 0.9rem;
      margin: 0;
    }

    .notif-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .notif-item {
      display: block;
      width: 100%;
      text-align: left;
      background: transparent;
      border: none;
      border-left: 4px solid transparent;
      font: inherit;
      padding: 10px 16px;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      transition: background 0.15s;
    }

    .notif-item:hover {
      background: #f8fafc;
    }

    .notif-item.notif-unread {
      background: #eef2ff;
      border-left-color: var(--primary-hover);
    }

    .notif-msg {
      display: block;
      margin: 0 0 4px;
      font-size: 0.85rem;
      color: var(--text);
    }

    .notif-date {
      font-size: 0.7rem;
      color: var(--muted);
    }
  `]
})
export class NotificacaoBellComponent implements OnInit, OnDestroy {
  naoLidas = 0;
  notificacoes: Notificacao[] = [];
  aberto = false;

  private subscription?: Subscription;

  constructor(private notificacoesService: NotificacoesService, private router: Router) {}

  ngOnInit() {
    // Verifica notificações não lidas a cada 30 segundos
    this.subscription = interval(30000).pipe(
      startWith(0),
      switchMap(() => this.notificacoesService.contarNaoLidas())
    ).subscribe({
      next: (count) => this.naoLidas = count,
      error: () => { /* silencioso - usuário pode não ter permissão ainda */ }
    });
  }

  /** Fecha o painel com Esc (navegação por teclado). */
  @HostListener('document:keydown.escape')
  fecharComEsc() {
    this.aberto = false;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  toggle() {
    this.aberto = !this.aberto;
    if (this.aberto) {
      this.carregarNotificacoes();
    }
  }

  carregarNotificacoes() {
    this.notificacoesService.listar().subscribe({
      next: (data) => this.notificacoes = data,
      error: (err) => console.error('Erro ao carregar notificações', err)
    });
  }

  abrir(notificacao: Notificacao) {
    if (!notificacao.lida) {
      this.notificacoesService.marcarComoLida(notificacao.id).subscribe({
        next: () => {
          notificacao.lida = true;
          this.naoLidas = Math.max(0, this.naoLidas - 1);
        },
        error: (err) => console.error('Erro ao marcar notificação como lida', err)
      });
    }

    if (notificacao.chamadoId) {
      this.aberto = false;
      this.router.navigate(['/detalhe', notificacao.chamadoId]);
    }
  }
}
