import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Historico } from '@core/models';
import { EVENTO_META } from '@core/constants/chamado.constants';
import { HumanizeEnumsPipe } from '@shared/pipes/humanize-enums.pipe';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';

/** Linha do tempo (auditoria) dos eventos do chamado. */
@Component({
  selector: 'app-historico-chamado',
  standalone: true,
  imports: [DatePipe, HumanizeEnumsPipe, RelativeTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (eventos().length === 0) {
      <p class="vazio">Nenhum evento registrado ainda.</p>
    } @else {
      <ol class="timeline">
        @for (h of eventos(); track h.id) {
          <li class="event event--{{ meta(h.tipoEvento).tone }}">
            <span class="event__icon" aria-hidden="true">
              <i class="fa-solid {{ meta(h.tipoEvento).icon }}"></i>
            </span>
            <div class="event__body">
              <p class="event__title">
                <strong>{{ meta(h.tipoEvento).label }}</strong>
                <span class="event__by">por {{ h.usuarioNome }}</span>
              </p>
              <p class="event__text">{{ h.descricao | humanizeEnums }}</p>
              <time class="event__date" [attr.datetime]="h.dataHora" [title]="h.dataHora | date: 'dd/MM/yyyy HH:mm'">
                {{ h.dataHora | relativeTime }} · {{ h.dataHora | date: 'dd/MM/yyyy HH:mm' }}
              </time>
            </div>
          </li>
        }
      </ol>
    }
  `,
  styles: `
    .vazio {
      padding: var(--space-6);
      color: var(--muted);
      font-size: var(--text-sm);
      text-align: center;
    }
    .timeline {
      position: relative;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .event {
      --tone: var(--neutral);
      --tone-bg: var(--neutral-bg);
      position: relative;
      display: flex;
      gap: var(--space-3);
      padding-bottom: var(--space-5);
    }
    .event:not(:last-child)::before {
      content: '';
      position: absolute;
      top: 32px;
      bottom: 0;
      left: 15px;
      width: 2px;
      background: var(--border);
    }
    .event--success { --tone: var(--success); --tone-bg: var(--success-bg); }
    .event--warning { --tone: var(--warning); --tone-bg: var(--warning-bg); }
    .event--danger { --tone: var(--danger-strong); --tone-bg: var(--danger-bg); }
    .event--info { --tone: var(--info); --tone-bg: var(--info-bg); }
    .event--cyan { --tone: var(--cyan); --tone-bg: var(--cyan-bg); }
    .event--brand { --tone: var(--accent); --tone-bg: var(--accent-soft); }
    .event__icon {
      display: grid;
      flex-shrink: 0;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--tone-bg);
    }
    .event__icon i {
      color: var(--tone);
      font-size: 0.8rem;
    }
    .event__body {
      min-width: 0;
      padding-top: 5px;
    }
    .event__title {
      font-size: var(--text-sm);
    }
    .event__by {
      margin-left: 6px;
      color: var(--muted);
    }
    .event__text {
      margin-top: 2px;
      color: var(--text-2);
      font-size: var(--text-sm);
      overflow-wrap: anywhere;
    }
    .event__date {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: var(--text-xs);
    }
  `,
})
export class HistoricoChamadoComponent {
  readonly eventos = input<Historico[]>([]);

  meta(tipo: string) {
    return EVENTO_META[tipo] ?? { label: tipo, tone: 'neutral', icon: 'fa-circle' };
  }
}
