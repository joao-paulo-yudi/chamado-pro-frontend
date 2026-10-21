import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardData } from '@core/models';
import {
  CATEGORIA_META,
  NIVEL_OPCOES,
  PRIORIDADE_META,
  PRIORIDADE_OPCOES,
  SLA_META,
} from '@core/constants/chamado.constants';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { BarItem, BarListComponent } from '../components/bar-list/bar-list.component';
import { DashboardService } from '../services/dashboard.service';

interface StatTile {
  label: string;
  valor: number | string;
  icon: string;
  /** Leva para a lista de chamados já filtrada. */
  link?: string;
  query?: Record<string, string>;
}

/** Cores de status de SLA (sempre acompanhadas de ícone e rótulo). */
const SLA_CORES = {
  NO_PRAZO: 'var(--chart-good)',
  CUMPRIDO: 'var(--chart-good)',
  EM_RISCO: 'var(--chart-warning)',
  ESTOURADO: 'var(--chart-critical)',
} as const;

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, BarListComponent, EmptyStateComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css',
})
export class DashboardAdminComponent implements OnInit {
  private readonly service = inject(DashboardService);

  protected readonly dados = signal<DashboardData | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);
  protected readonly atualizadoEm = signal<Date | null>(null);

  protected readonly tiles = computed<StatTile[]>(() => {
    const d = this.dados();
    if (!d) return [];
    return [
      { label: 'Abertos', valor: d.chamadosAbertos, icon: 'fa-circle-dot', link: '/chamados', query: { status: 'ABERTO' } },
      { label: 'Em andamento', valor: d.chamadosEmAndamento, icon: 'fa-spinner', link: '/chamados', query: { status: 'EM_ANDAMENTO' } },
      { label: 'Resolvidos', valor: d.chamadosResolvidos, icon: 'fa-circle-check', link: '/chamados', query: { status: 'RESOLVIDO' } },
      { label: 'Fechados', valor: d.chamadosFechados, icon: 'fa-lock', link: '/chamados', query: { status: 'FECHADO' } },
      { label: 'Escalonados (N2/N3)', valor: d.chamadosEscalonados, icon: 'fa-turn-up' },
      { label: 'Total de chamados', valor: d.totalChamados, icon: 'fa-ticket', link: '/chamados' },
    ];
  });

  protected readonly slaItens = computed<BarItem[]>(() => {
    const d = this.dados();
    if (!d) return [];
    const valores = { NO_PRAZO: d.slaNoPrazo, EM_RISCO: d.slaEmRisco, ESTOURADO: d.slaEstourado, CUMPRIDO: d.slaCumprido };
    return (Object.keys(valores) as (keyof typeof valores)[]).map(k => ({
      key: k,
      label: SLA_META[k].label,
      icon: SLA_META[k].icon,
      color: SLA_CORES[k],
      value: valores[k] ?? 0,
    }));
  });

  protected readonly slaAtencao = computed(() => {
    const d = this.dados();
    return d ? (d.slaEmRisco ?? 0) + (d.slaEstourado ?? 0) : 0;
  });

  protected readonly prioridadeItens = computed<BarItem[]>(() =>
    PRIORIDADE_OPCOES.map(p => ({
      key: p,
      label: PRIORIDADE_META[p].label,
      value: this.dados()?.chamadosPorPrioridade?.[p] ?? 0,
    }))
  );

  protected readonly nivelItens = computed<BarItem[]>(() =>
    NIVEL_OPCOES.map(n => ({ key: n, label: n, value: this.dados()?.chamadosPorNivel?.[n] ?? 0 }))
  );

  protected readonly categoriaItens = computed<BarItem[]>(() =>
    Object.entries(this.dados()?.chamadosPorCategoria ?? {}).map(([k, v]) => ({
      key: k,
      label: CATEGORIA_META[k as keyof typeof CATEGORIA_META]?.label ?? k,
      value: v,
    }))
  );

  protected readonly tecnicoItens = computed<BarItem[]>(() =>
    Object.entries(this.dados()?.chamadosPorTecnico ?? {}).map(([k, v]) => ({ key: k, label: k, value: v }))
  );

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set(false);
    this.service.obterDadosAdmin().subscribe({
      next: d => {
        this.dados.set(d);
        this.atualizadoEm.set(new Date());
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }
}
