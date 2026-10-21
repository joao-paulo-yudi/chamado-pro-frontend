import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Prioridade, SlaConfig } from '@core/models';
import { PRIORIDADE_OPCOES } from '@core/constants/chamado.constants';
import { ToastService, mensagemDeErro } from '@core/services/toast.service';
import { EnumBadgeComponent } from '@shared/components/enum-badge/enum-badge.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';
import { SlaConfigService } from '../services/sla-config.service';

const MINUTOS_MAX = 525600;

/** Converte minutos em texto legível: 90 -> "1 h 30 min", 1500 -> "1 dia 1 h". */
export function duracaoLegivel(minutos: number | null | undefined): string {
  if (!minutos || minutos <= 0) return '—';
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  const mins = minutos % 60;
  const partes: string[] = [];
  if (dias) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
  if (horas) partes.push(`${horas} h`);
  if (mins && !dias) partes.push(`${mins} min`);
  return partes.join(' ') || `${minutos} min`;
}

@Component({
  selector: 'app-sla-config',
  standalone: true,
  imports: [FormsModule, EnumBadgeComponent, LoadingStateComponent],
  templateUrl: './sla-config.component.html',
  styleUrl: './sla-config.component.css',
})
export class SlaConfigComponent implements OnInit {
  private readonly service = inject(SlaConfigService);
  private readonly toast = inject(ToastService);

  protected readonly max = MINUTOS_MAX;
  protected readonly duracao = duracaoLegivel;

  protected readonly configs = signal<SlaConfig[]>([]);
  private readonly originais = signal<Record<string, SlaConfig>>({});
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erroCarga = signal(false);

  protected readonly alteradas = computed(() =>
    this.configs().filter(c => {
      const o = this.originais()[c.prioridade];
      return !o || o.tempoRespostaMinutos !== c.tempoRespostaMinutos || o.tempoResolucaoMinutos !== c.tempoResolucaoMinutos;
    })
  );

  protected readonly invalidas = computed(() => this.configs().filter(c => this.erro(c)));

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erroCarga.set(false);
    this.service.listar().subscribe({
      next: data => {
        // Garante que todas as prioridades apareçam, mesmo sem configuração no backend
        const lista = PRIORIDADE_OPCOES.map(
          p => data.find(c => c.prioridade === p) ?? { prioridade: p, tempoRespostaMinutos: 0, tempoResolucaoMinutos: 0 }
        );
        this.definir(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erroCarga.set(true);
        this.carregando.set(false);
      },
    });
  }

  private definir(lista: SlaConfig[]) {
    this.configs.set(lista.map(c => ({ ...c })));
    this.originais.set(Object.fromEntries(lista.map(c => [c.prioridade, { ...c }])));
  }

  alterar(prioridade: Prioridade, campo: 'tempoRespostaMinutos' | 'tempoResolucaoMinutos', valor: number | null) {
    this.configs.update(lista => lista.map(c => (c.prioridade === prioridade ? { ...c, [campo]: Number(valor) || 0 } : c)));
  }

  erro(c: SlaConfig): string {
    const valido = (v: number) => Number.isInteger(v) && v >= 1 && v <= MINUTOS_MAX;
    if (!valido(c.tempoRespostaMinutos) || !valido(c.tempoResolucaoMinutos)) {
      return `Use valores entre 1 e ${MINUTOS_MAX} minutos.`;
    }
    if (c.tempoRespostaMinutos > c.tempoResolucaoMinutos) {
      return 'A primeira resposta deve vir antes da resolução.';
    }
    return '';
  }

  descartar() {
    this.definir(Object.values(this.originais()));
  }

  salvar() {
    const alteradas = this.alteradas();
    if (!alteradas.length || this.invalidas().length) return;

    this.salvando.set(true);
    forkJoin(
      alteradas.map(c =>
        this.service.atualizar(c.prioridade, {
          tempoRespostaMinutos: c.tempoRespostaMinutos,
          tempoResolucaoMinutos: c.tempoResolucaoMinutos,
        })
      )
    ).subscribe({
      next: salvas => {
        const atual = this.configs().map(c => salvas.find(s => s.prioridade === c.prioridade) ?? c);
        this.definir(atual);
        this.salvando.set(false);
        this.toast.success('Configuração de SLA salva.');
      },
      error: err => {
        this.salvando.set(false);
        this.toast.error(mensagemDeErro(err, 'Não foi possível salvar a configuração de SLA.'));
      },
    });
  }
}
