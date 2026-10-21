import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EnumKind, enumMeta } from '@core/constants/chamado.constants';

/**
 * Badge padronizado para status, prioridade, SLA, nível, categoria e papel.
 * A cor nunca aparece sozinha: o rótulo (e o ícone, quando houver) acompanha.
 */
@Component({
  selector: 'app-enum-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (meta(); as m) {
      <span class="badge badge--{{ m.tone }}" [class.badge--dot]="!icone() || !m.icon">
        @if (icone() && m.icon) {
          <i class="fa-solid {{ m.icon }}" aria-hidden="true"></i>
        }
        @if (prefixo()) {
          <span class="sr-only">{{ prefixo() }}: </span>
        }
        {{ m.label }}
      </span>
    } @else if (vazio()) {
      <span class="muted text-sm">{{ vazio() }}</span>
    }
  `,
})
export class EnumBadgeComponent {
  readonly kind = input.required<EnumKind>();
  readonly value = input<string | null | undefined>();
  readonly icone = input(false);
  /** Contexto lido por leitores de tela (ex.: "Prioridade"). */
  readonly prefixo = input<string>('');
  readonly vazio = input<string>('');

  protected readonly meta = computed(() => enumMeta(this.kind(), this.value()));
}
