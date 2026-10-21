import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface BarItem {
  key: string;
  label: string;
  value: number;
  /** Cor da barra; por padrão a cor da série (azul da marca). */
  color?: string;
  /** Ícone que acompanha o rótulo (obrigatório quando a cor carrega significado, como status). */
  icon?: string;
}

/**
 * Gráfico de barras horizontais com rótulo e valor diretos em cada linha
 * (o valor nunca depende só da cor ou do hover).
 */
@Component({
  selector: 'app-bar-list',
  standalone: true,
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (total() === 0) {
      <p class="vazio">{{ vazio() }}</p>
    } @else {
      <ul class="bars">
        @for (item of linhas(); track item.key) {
          <li class="bar" [title]="item.label + ': ' + item.value + ' (' + (item.share | number: '1.0-0') + '% do total)'">
            <span class="bar__label">
              @if (item.icon) {
                <i class="fa-solid {{ item.icon }}" [style.color]="item.color" aria-hidden="true"></i>
              }
              <span class="truncate">{{ item.label }}</span>
            </span>
            <span class="bar__track" aria-hidden="true">
              <span class="bar__fill" [style.width.%]="item.pct" [style.background]="item.color || null"></span>
            </span>
            <span class="bar__value">
              {{ item.value }}
              <small>{{ item.share | number: '1.0-0' }}%</small>
            </span>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    .vazio {
      padding: var(--space-6) 0;
      color: var(--muted);
      font-size: var(--text-sm);
      text-align: center;
    }
    .bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .bar {
      display: grid;
      grid-template-columns: minmax(90px, 32%) 1fr 64px;
      align-items: center;
      gap: var(--space-3);
      padding: 2px 0;
    }
    .bar__label {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      min-width: 0;
      color: var(--text-2);
      font-size: var(--text-sm);
    }
    .bar__track {
      height: 10px;
      border-radius: 0 4px 4px 0;
      background: var(--chart-track);
    }
    .bar__fill {
      display: block;
      height: 100%;
      min-width: 2px;
      border-radius: 0 4px 4px 0;
      background: var(--chart-series);
      transition: width 400ms ease;
    }
    .bar:hover .bar__fill {
      filter: brightness(1.12);
    }
    .bar__value {
      color: var(--text);
      font-size: var(--text-sm);
      font-weight: 600;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .bar__value small {
      margin-left: 4px;
      color: var(--muted);
      font-weight: 400;
    }
  `,
})
export class BarListComponent {
  readonly itens = input<BarItem[]>([]);
  readonly ordenar = input(false);
  readonly vazio = input('Sem dados ainda.');

  protected readonly total = computed(() => this.itens().reduce((s, i) => s + i.value, 0));

  protected readonly linhas = computed(() => {
    const itens = this.ordenar() ? [...this.itens()].sort((a, b) => b.value - a.value) : this.itens();
    const max = Math.max(1, ...itens.map(i => i.value));
    const total = Math.max(1, this.total());
    return itens.map(i => ({ ...i, pct: (i.value / max) * 100, share: (i.value / total) * 100 }));
  });
}
