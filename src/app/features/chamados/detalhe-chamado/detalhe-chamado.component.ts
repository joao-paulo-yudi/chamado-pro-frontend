import { Component, DestroyRef, Injector, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { PerfilService } from '@core/services/perfil.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { ToastService, mensagemDeErro } from '@core/services/toast.service';
import { Chamado, Historico, Perfil, Prioridade, StatusChamado, TecnicoResumo } from '@core/models';
import {
  PRIORIDADE_OPCOES,
  STATUS_ENCERRADOS,
  STATUS_OPCOES,
  podeEscalonar,
  proximoNivel,
} from '@core/constants/chamado.constants';
import { EnumBadgeComponent } from '@shared/components/enum-badge/enum-badge.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';
import { StarRatingComponent } from '@shared/components/star-rating/star-rating.component';
import { LabelPipe } from '@shared/pipes/label.pipe';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';
import { UsuariosService } from '@features/usuarios/services/usuarios.service';
import { ChamadosService } from '../services/chamados.service';
import { ComentariosComponent } from '../components/comentarios/comentarios.component';
import { HistoricoChamadoComponent } from '../components/historico-chamado/historico-chamado.component';

type Aba = 'conversa' | 'historico';

@Component({
  selector: 'app-detalhe-chamado',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    EnumBadgeComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    StarRatingComponent,
    LabelPipe,
    RelativeTimePipe,
    ComentariosComponent,
    HistoricoChamadoComponent,
  ],
  templateUrl: './detalhe-chamado.component.html',
  styleUrl: './detalhe-chamado.component.css',
})
export class DetalheChamadoComponent implements OnInit {
  private readonly chamadosService = inject(ChamadosService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly perfilService = inject(PerfilService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly auth = inject(AuthService);

  /** Parâmetro `:id` da rota (withComponentInputBinding). */
  readonly id = input.required<string>();
  protected readonly chamadoId = computed(() => Number(this.id()));

  protected readonly statusOpcoes = STATUS_OPCOES;
  protected readonly prioridadeOpcoes = PRIORIDADE_OPCOES;
  protected readonly etapas: StatusChamado[] = STATUS_OPCOES;

  protected readonly chamado = signal<Chamado | null>(null);
  protected readonly historico = signal<Historico[]>([]);
  protected readonly tecnicos = signal<TecnicoResumo[]>([]);
  protected readonly usuario = signal<Perfil | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<'nao-encontrado' | 'sem-acesso' | 'falha' | null>(null);
  protected readonly salvando = signal(false);
  protected readonly aba = signal<Aba>('conversa');

  // Edição de título/descrição
  protected readonly editando = signal(false);
  protected editTitulo = '';
  protected editDescricao = '';

  // Atribuição e escalonamento
  protected tecnicoSelecionado: number | null = null;
  protected escalonamentoTecnicoId: number | null = null;
  protected escalonamentoMotivo = '';

  // Avaliação do cliente
  protected avaliacao: number | null = null;
  protected feedback = '';

  protected readonly etapaAtual = computed(() => this.etapas.indexOf(this.chamado()?.status ?? 'ABERTO'));
  protected readonly encerrado = computed(() => STATUS_ENCERRADOS.includes(this.chamado()?.status ?? 'ABERTO'));
  protected readonly ehDono = computed(() => {
    const c = this.chamado();
    const u = this.usuario();
    return !!c && !!u && c.clienteId === u.id;
  });
  protected readonly atribuidoAMim = computed(() => {
    const c = this.chamado();
    const u = this.usuario();
    return !!c && !!u && c.tecnicoId === u.id;
  });
  /** Equipe de atendimento ou o cliente que abriu o chamado. */
  protected readonly podeEditar = computed(() => this.auth.isEquipe() || this.ehDono());
  protected readonly podeEscalonar = computed(() => podeEscalonar(this.chamado()?.nivelAtual));
  protected readonly proximoNivel = computed(() => proximoNivel(this.chamado()?.nivelAtual));

  ngOnInit() {
    this.perfilService.me().subscribe({ next: p => this.usuario.set(p) });

    // Somente a equipe de atendimento precisa da lista de técnicos (dados mínimos: id, nome, nível)
    if (this.auth.isEquipe()) {
      this.usuariosService.listarTecnicos().subscribe({ next: t => this.tecnicos.set(t) });
    }

    // O componente é reaproveitado ao navegar de um chamado para outro (ex.: pelas notificações)
    toObservable(this.chamadoId, { injector: this.injector })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.erro.set(null);
        this.editando.set(false);
        this.aba.set('conversa');
        this.carregarChamado();
        this.carregarHistorico();
      });
  }

  carregarChamado() {
    this.carregando.set(true);
    this.chamadosService.buscarPorId(this.chamadoId()).subscribe({
      next: c => {
        this.aplicar(c);
        this.carregando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.erro.set(err.status === 404 ? 'nao-encontrado' : err.status === 403 ? 'sem-acesso' : 'falha');
        this.carregando.set(false);
      },
    });
  }

  carregarHistorico() {
    this.chamadosService.historico(this.chamadoId()).subscribe({
      next: h => this.historico.set(h),
    });
  }

  private aplicar(c: Chamado) {
    this.chamado.set(c);
    this.avaliacao = c.avaliacao || null;
    this.feedback = c.feedback ?? '';
  }

  /** Executa uma alteração, atualiza a tela e o histórico e mostra o retorno ao usuário. */
  private executar(acao: Observable<Chamado>, sucesso: string, falha: string) {
    this.salvando.set(true);
    acao.subscribe({
      next: c => {
        this.aplicar(c);
        this.salvando.set(false);
        this.carregarHistorico();
        this.toast.success(sucesso);
      },
      error: err => {
        this.salvando.set(false);
        this.toast.error(mensagemDeErro(err, falha));
        // Desfaz alterações otimistas em selects
        this.carregarChamado();
      },
    });
  }

  private payloadBase(c: Chamado): Partial<Chamado> {
    return { titulo: c.titulo, descricao: c.descricao, categoria: c.categoria, status: c.status };
  }

  alterarStatus(status: StatusChamado) {
    const c = this.chamado();
    if (!c || c.status === status) return;
    this.executar(
      this.chamadosService.atualizar(c.id, { ...this.payloadBase(c), status }),
      'Status atualizado.',
      'Não foi possível atualizar o status.'
    );
  }

  /** Recalcula os prazos de SLA no backend. */
  alterarPrioridade(prioridade: Prioridade) {
    const c = this.chamado();
    if (!c || c.prioridade === prioridade) return;
    this.executar(
      this.chamadosService.atualizar(c.id, { ...this.payloadBase(c), prioridade }),
      'Prioridade atualizada. Os prazos de SLA foram recalculados.',
      'Não foi possível atualizar a prioridade.'
    );
  }

  assumir() {
    const u = this.usuario();
    if (!u) return;
    this.executar(
      this.chamadosService.atribuirTecnico(this.chamadoId(), u.id),
      'Você agora é o responsável por este chamado.',
      'Não foi possível assumir o chamado.'
    );
  }

  atribuir() {
    if (!this.tecnicoSelecionado) return;
    this.executar(
      this.chamadosService.atribuirTecnico(this.chamadoId(), this.tecnicoSelecionado),
      'Técnico atribuído com sucesso.',
      'Não foi possível atribuir o técnico.'
    );
    this.tecnicoSelecionado = null;
  }

  async escalonar() {
    const ok = await this.confirm.confirmar({
      titulo: `Escalonar para ${this.proximoNivel()}?`,
      mensagem: 'O chamado passará para o próximo nível de atendimento e o histórico registrará o motivo informado.',
      confirmar: 'Escalonar',
    });
    if (!ok) return;

    this.executar(
      this.chamadosService.escalonar(this.chamadoId(), {
        tecnicoId: this.escalonamentoTecnicoId ?? undefined,
        motivo: this.escalonamentoMotivo.trim() || undefined,
      }),
      `Chamado escalonado para ${this.proximoNivel()}.`,
      'Não foi possível escalonar o chamado.'
    );
    this.escalonamentoTecnicoId = null;
    this.escalonamentoMotivo = '';
  }

  enviarAvaliacao() {
    const c = this.chamado();
    if (!c || !this.avaliacao) return;
    this.executar(
      this.chamadosService.atualizar(c.id, {
        ...this.payloadBase(c),
        avaliacao: this.avaliacao,
        feedback: this.feedback.trim(),
      }),
      'Obrigado! Sua avaliação foi registrada.',
      'Não foi possível enviar a avaliação.'
    );
  }

  iniciarEdicao() {
    const c = this.chamado();
    if (!c) return;
    this.editTitulo = c.titulo;
    this.editDescricao = c.descricao;
    this.editando.set(true);
  }

  salvarEdicao() {
    const titulo = this.editTitulo.trim();
    const descricao = this.editDescricao.trim();
    if (!titulo || !descricao) return;
    this.editando.set(false);
    this.executar(
      this.chamadosService.atualizar(this.chamadoId(), { titulo, descricao }),
      'Chamado atualizado.',
      'Não foi possível salvar as alterações.'
    );
  }

  async excluir() {
    const ok = await this.confirm.confirmar({
      titulo: 'Excluir chamado?',
      mensagem: 'O chamado será removido permanentemente. Esta ação não pode ser desfeita.',
      confirmar: 'Excluir chamado',
      perigo: true,
    });
    if (!ok) return;

    this.chamadosService.excluir(this.chamadoId()).subscribe({
      next: () => {
        this.toast.success('Chamado excluído.');
        this.router.navigate(['/chamados']);
      },
      error: err => this.toast.error(mensagemDeErro(err, 'Não foi possível excluir o chamado.')),
    });
  }

  /** Navegação por setas entre as abas (padrão WAI-ARIA). */
  teclaAba(event: KeyboardEvent) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const proxima: Aba = this.aba() === 'conversa' ? 'historico' : 'conversa';
    this.aba.set(proxima);
    document.getElementById(`aba-${proxima}`)?.focus();
  }
}
