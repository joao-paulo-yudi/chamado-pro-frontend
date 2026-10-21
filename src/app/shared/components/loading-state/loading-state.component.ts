import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Indicador de carregamento centralizado, anunciado para leitores de tela. */
@Component({
  selector: 'app-loading-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loading" role="status" aria-live="polite">
      <span class="spinner" aria-hidden="true"></span>
      <span class="loading__text">{{ mensagem() }}</span>
    </div>
  `,
  styles: `
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-10) var(--space-6);
      color: var(--muted);
      font-size: var(--text-sm);
    }
  `,
})
export class LoadingStateComponent {
  readonly mensagem = input('Carregando...');
}
