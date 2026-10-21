import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, ToastTipo } from '@core/services/toast.service';

const ICONES: Record<ToastTipo, string> = {
  success: 'fa-circle-check',
  error: 'fa-circle-exclamation',
  warning: 'fa-triangle-exclamation',
  info: 'fa-circle-info',
};

@Component({
  selector: 'app-toast-container',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts" aria-live="polite" aria-atomic="false">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast toast--{{ t.tipo }}" [attr.role]="t.tipo === 'error' ? 'alert' : 'status'">
          <i class="fa-solid {{ icones[t.tipo] }}" aria-hidden="true"></i>
          <p class="toast__msg">{{ t.mensagem }}</p>
          <button type="button" class="toast__close" (click)="toast.fechar(t.id)" aria-label="Fechar mensagem">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed;
      right: var(--space-4);
      bottom: var(--space-4);
      z-index: 1200;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      width: min(380px, calc(100vw - 32px));
    }
    .toast {
      --tone: var(--accent);
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
      border: 1px solid var(--border);
      border-left: 4px solid var(--tone);
      border-radius: var(--radius-md);
      background: var(--surface);
      box-shadow: var(--shadow-lg);
      animation: entrar 180ms ease-out;
    }
    .toast > i {
      margin-top: 3px;
      color: var(--tone);
    }
    .toast--success { --tone: var(--success); }
    .toast--error { --tone: var(--danger); }
    .toast--warning { --tone: var(--warning); }
    .toast__msg {
      flex: 1;
      color: var(--text);
      font-size: var(--text-sm);
    }
    .toast__close {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: var(--radius-sm);
      background: none;
      color: var(--subtle);
      cursor: pointer;
    }
    .toast__close i {
      color: inherit;
    }
    .toast__close:hover {
      background: var(--surface-3);
    }
    @keyframes entrar {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
    }
  `,
})
export class ToastContainerComponent {
  protected readonly toast = inject(ToastService);
  protected readonly icones = ICONES;
}
