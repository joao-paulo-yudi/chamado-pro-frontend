import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { PerfilService } from '@core/services/perfil.service';
import { Chamado, Prioridade, StatusChamado } from '@core/models';
import {
  CATEGORIA_META,
  PRIORIDADE_OPCOES,
  PRIORIDADE_PESO,
  STATUS_OPCOES,
  enumMeta,
} from '@core/constants/chamado.constants';
import { EnumBadgeComponent } from '@shared/components/enum-badge/enum-badge.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { LabelPipe } from '@shared/pipes/label.pipe';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';
import { ChamadosService } from '../services/chamados.service';

/** Recortes da lista. Cada papel vê apenas as visões que fazem sentido para ele. */
type Visao = 'todos' | 'fila' | 'sla' | 'meus';
type Ordem = 'recentes' | 'antigos' | 'prioridade' | 'prazo';

interface VisaoConfig {
  id: Visao;
  label: string;
  icon: string;
}

const VISOES_ADMIN: VisaoConfig[] = [
  { id: 'todos', label: 'Todos', icon: 'fa-layer-group' },
  { id: 'fila', label: 'Sem responsável', icon: 'fa-inbox' },
  { id: 'sla', label: 'Atenção ao SLA', icon: 'fa-triangle-exclamation' },
];

const VISOES_TECNICO: VisaoConfig[] = [
  { id: 'meus', label: 'Atribuídos a mim', icon: 'fa-user-check' },
  { id: 'fila', label: 'Fila de atendimento', icon: 'fa-inbox' },
];

@Component({
  selector: 'app-lista-chamados',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    EnumBadgeComponent,
    EmptyStateComponent,
    LabelPipe,
    RelativeTimePipe,
  ],
  templateUrl: './lista-chamados.component.html',
  styleUrl: './lista-chamados.component.css',
})
export class ListaChamadosComponent implements OnInit {
  private readonly chamadosService = inject(ChamadosService);
  private readonly perfil = inject(PerfilService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly statusOpcoes = STATUS_OPCOES;
  protected readonly prioridadeOpcoes = PRIORIDADE_OPCOES;
  protected readonly categoriaMeta = CATEGORIA_META;

  /** Chamados carregados por visão (ex.: "meus" e "fila" para técnicos). */
  private readonly dados = signal<Partial<Record<Visao, Chamado[]>>>({});
  protected readonly carregando = signal(true);
  protected readonly erro = signal(false);

  // Filtros (sincronizados com a URL para permitir voltar/compartilhar)
  protected readonly visao = signal<Visao>('todos');
  protected readonly busca = signal('');
  protected readonly status = signal<StatusChamado | ''>('');
  protected readonly prioridade = signal<Prioridade | ''>('');
  protected readonly ordem = signal<Ordem>('recentes');

  protected readonly visoes = computed<VisaoConfig[]>(() => {
    if (this.auth.isAdmin()) return VISOES_ADMIN;
    if (this.auth.isTecnico()) return VISOES_TECNICO;
    return [];
  });

  protected readonly titulo = computed(() => (this.auth.isCliente() ? 'Meus chamados' : 'Chamados'));
  protected readonly subtitulo = computed(() => {
    if (this.auth.isCliente()) return 'Acompanhe as solicitações que você abriu.';
    if (this.auth.isTecnico()) return 'Seus atendimentos e a fila de chamados aguardando um responsável.';
    return 'Todos os chamados da organização.';
  });

  /** Chamados da visão atual, antes dos filtros de status/prioridade/busca. */
  private readonly base = computed(() => this.dados()[this.visao()] ?? []);

  protected readonly contagemVisao = computed(() => {
    const d = this.dados();
    return Object.fromEntries(this.visoes().map(v => [v.id, d[v.id]?.length ?? null])) as Record<Visao, number | null>;
  });

  protected readonly contagemStatus = computed(() => {
    const contagem: Record<string, number> = { '': 0 };
    for (const c of this.filtrar(this.base(), { ignorarStatus: true })) {
      contagem[''] += 1;
      contagem[c.status] = (contagem[c.status] ?? 0) + 1;
    }
    return contagem;
  });

  protected readonly chamados = computed(() => this.ordenar(this.filtrar(this.base())));

  protected readonly filtrosAtivos = computed(() => !!(this.busca() || this.status() || this.prioridade()));

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const visaoPadrao: Visao = this.auth.isTecnico() ? 'meus' : 'todos';
    const visaoUrl = params.get('visao') as Visao | null;
    this.visao.set(visaoUrl && this.visoes().some(v => v.id === visaoUrl) ? visaoUrl : visaoPadrao);
    this.busca.set(params.get('q') ?? '');
    this.status.set((params.get('status') as StatusChamado) ?? '');
    this.prioridade.set((params.get('prioridade') as Prioridade) ?? '');
    this.ordem.set((params.get('ordem') as Ordem) ?? 'recentes');

    // A busca da barra superior navega para esta mesma rota com ?q=
    this.route.queryParamMap.subscribe(p => {
      const q = p.get('q') ?? '';
      if (q !== this.busca()) this.busca.set(q);
    });

    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set(false);
    this.buscarDados().subscribe({
      next: dados => {
        this.dados.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.carregando.set(false);
      },
    });
  }

  private buscarDados(): Observable<Partial<Record<Visao, Chamado[]>>> {
    if (this.auth.isAdmin()) {
      return this.chamadosService.listar().pipe(
        map(todos => ({
          todos,
          fila: todos.filter(c => !c.tecnicoNome?.trim()),
          sla: todos.filter(c => c.statusSla === 'EM_RISCO' || c.statusSla === 'ESTOURADO'),
        }))
      );
    }

    return this.perfil.me().pipe(
      switchMap(eu => {
        if (this.auth.isTecnico()) {
          return forkJoin({
            meus: this.chamadosService.listarPorTecnico(eu.id),
            fila: this.chamadosService.listar().pipe(map(todos => todos.filter(c => !c.tecnicoNome?.trim()))),
          });
        }
        if (this.auth.isCliente()) {
          return this.chamadosService.listarPorCliente(eu.id).pipe(map(todos => ({ todos })));
        }
        return of({});
      })
    );
  }

  selecionarVisao(v: Visao) {
    this.visao.set(v);
    this.sincronizarUrl();
  }

  selecionarStatus(s: StatusChamado | '') {
    this.status.set(s);
    this.sincronizarUrl();
  }

  atualizarFiltro() {
    this.sincronizarUrl();
  }

  limparFiltros() {
    this.busca.set('');
    this.status.set('');
    this.prioridade.set('');
    this.sincronizarUrl();
  }

  abrir(c: Chamado, event?: MouseEvent) {
    // Respeita Ctrl/Cmd+clique e cliques em links internos
    if (event && (event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest('a'))) return;
    this.router.navigate(['/chamados', c.id]);
  }

  statusLabel(s: StatusChamado) {
    return enumMeta('status', s)?.label ?? s;
  }

  private sincronizarUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        visao: this.visoes().length ? this.visao() : null,
        q: this.busca() || null,
        status: this.status() || null,
        prioridade: this.prioridade() || null,
        ordem: this.ordem() !== 'recentes' ? this.ordem() : null,
      },
    });
  }

  private filtrar(lista: Chamado[], opcoes: { ignorarStatus?: boolean } = {}): Chamado[] {
    const termo = this.normalizar(this.busca().replace(/^#/, ''));
    const status = this.status();
    const prioridade = this.prioridade();

    return lista.filter(c => {
      if (!opcoes.ignorarStatus && status && c.status !== status) return false;
      if (prioridade && c.prioridade !== prioridade) return false;
      if (!termo) return true;
      return (
        String(c.id) === termo ||
        this.normalizar(`${c.titulo} ${c.descricao} ${c.clienteNome ?? ''} ${c.tecnicoNome ?? ''}`).includes(termo)
      );
    });
  }

  private ordenar(lista: Chamado[]): Chamado[] {
    const data = (v?: string) => (v ? new Date(v).getTime() : 0);
    const copia = [...lista];
    switch (this.ordem()) {
      case 'antigos':
        return copia.sort((a, b) => data(a.dataCriacao) - data(b.dataCriacao));
      case 'prioridade':
        return copia.sort(
          (a, b) =>
            (PRIORIDADE_PESO[b.prioridade ?? 'MEDIA'] ?? 0) - (PRIORIDADE_PESO[a.prioridade ?? 'MEDIA'] ?? 0) ||
            data(b.dataCriacao) - data(a.dataCriacao)
        );
      case 'prazo':
        return copia.sort((a, b) => (data(a.prazoResolucao) || Infinity) - (data(b.prazoResolucao) || Infinity));
      default:
        return copia.sort((a, b) => data(b.dataCriacao) - data(a.dataCriacao));
    }
  }

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .trim();
  }
}
