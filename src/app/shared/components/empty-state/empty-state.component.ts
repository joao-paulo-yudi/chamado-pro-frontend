import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Estado vazio com ícone, título, descrição e ações opcionais (projetadas). */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <div class="empty__icon" aria-hidden="true"><i class="fa-solid {{ icon() }}"></i></div>
      <p class="empty__title">{{ titulo() }}</p>
      @if (descricao()) {
        <p class="empty__text">{{ descricao() }}</p>
      }
      <div class="empty__actions"><ng-content /></div>
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-10) var(--space-6);
      text-align: center;
    }
    .empty__icon {
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      margin-bottom: var(--space-2);
      border-radius: 50%;
      background: var(--accent-soft);
    }
    .empty__icon i {
      color: var(--accent);
      font-size: 1.4rem;
    }
    .empty__title {
      color: var(--text);
      font-weight: 650;
    }
    .empty__text {
      max-width: 420px;
      color: var(--muted);
      font-size: var(--text-sm);
    }
    .empty__actions:not(:empty) {
      margin-top: var(--space-3);
    }
  `,
})
export class EmptyStateComponent {
  readonly icon = input('fa-inbox');
  readonly titulo = input.required<string>();
  readonly descricao = input<string>('');
}
