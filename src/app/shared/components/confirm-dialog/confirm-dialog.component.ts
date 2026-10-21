import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';

/** Diálogo modal de confirmação. Esc ou clique fora cancelam; o foco volta para quem abriu. */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dialog.estado(); as d) {
      <div class="backdrop" (click)="dialog.responder(false)"></div>
      <div
        class="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-titulo"
        aria-describedby="confirm-texto"
        (keydown.escape)="dialog.responder(false)"
        (keydown.tab)="prenderFoco($event)"
        #painel
      >
        <div class="dialog__icon" [class.dialog__icon--danger]="d.perigo" aria-hidden="true">
          <i class="fa-solid" [class.fa-triangle-exclamation]="d.perigo" [class.fa-circle-question]="!d.perigo"></i>
        </div>
        <h2 id="confirm-titulo" class="dialog__title">{{ d.titulo }}</h2>
        <p id="confirm-texto" class="dialog__text">{{ d.mensagem }}</p>
        <div class="dialog__actions">
          <button type="button" class="btn btn--secondary" (click)="dialog.responder(false)">
            {{ d.cancelar || 'Cancelar' }}
          </button>
          <button
            type="button"
            class="btn"
            [class.btn--danger]="d.perigo"
            (click)="dialog.responder(true)"
            #confirmar
          >
            {{ d.confirmar || 'Confirmar' }}
          </button>
        </div>
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1300;
      background: rgba(0, 8, 66, 0.45);
      animation: fade 150ms ease-out;
    }
    .dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      z-index: 1301;
      width: min(440px, calc(100vw - 32px));
      padding: var(--space-6);
      border-radius: var(--radius-lg);
      background: var(--surface);
      box-shadow: var(--shadow-lg);
      transform: translate(-50%, -50%);
      animation: fade 150ms ease-out;
    }
    .dialog__icon {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      margin-bottom: var(--space-4);
      border-radius: 50%;
      background: var(--accent-soft);
    }
    .dialog__icon i {
      color: var(--accent);
      font-size: 1.15rem;
    }
    .dialog__icon--danger {
      background: var(--danger-bg);
    }
    .dialog__icon--danger i {
      color: var(--danger);
    }
    .dialog__title {
      font-size: var(--text-lg);
    }
    .dialog__text {
      margin-top: var(--space-2);
      color: var(--muted);
      font-size: var(--text-sm);
    }
    .dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
      margin-top: var(--space-6);
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly dialog = inject(ConfirmDialogService);
  private readonly painel = viewChild<ElementRef<HTMLElement>>('painel');
  private readonly botaoConfirmar = viewChild<ElementRef<HTMLButtonElement>>('confirmar');
  private focoAnterior: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const aberto = !!this.dialog.estado();
      const botao = this.botaoConfirmar();
      if (aberto && botao) {
        this.focoAnterior ??= document.activeElement as HTMLElement | null;
        botao.nativeElement.focus();
      } else if (!aberto && this.focoAnterior) {
        this.focoAnterior.focus();
        this.focoAnterior = null;
      }
    });
  }

  /** Mantém o foco do teclado dentro do diálogo enquanto ele estiver aberto. */
  prenderFoco(event: Event) {
    const painel = this.painel()?.nativeElement;
    if (!painel) return;
    const focaveis = Array.from(painel.querySelectorAll<HTMLElement>('button'));
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    const shift = (event as KeyboardEvent).shiftKey;
    if (shift && document.activeElement === primeiro) {
      event.preventDefault();
      ultimo.focus();
    } else if (!shift && document.activeElement === ultimo) {
      event.preventDefault();
      primeiro.focus();
    }
  }
}
