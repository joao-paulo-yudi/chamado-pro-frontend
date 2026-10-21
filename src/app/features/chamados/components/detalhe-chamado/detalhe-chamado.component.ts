import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChamadosService, Chamado, Historico, EscalonarRequest } from '../../services/chamados.service';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComentariosComponent } from '../../../comentarios/components/comentarios.component';
import { Location } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import { UsuariosService, TecnicoResumo } from '../../../usuarios/services/usuario.service';
import { PerfilService, Perfil } from '../../../../core/services/perfil.service';
import {
  PRIORIDADE_LABELS,
  PRIORIDADE_OPCOES,
  NIVEL_LABELS,
  STATUS_SLA_LABELS,
  proximoNivel,
  podeEscalonar
} from '../../../../shared/chamado-labels';

@Component({
  selector: 'app-detalhe-chamado',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, ComentariosComponent],
  templateUrl: './detalhe-chamado.component.html',
  styleUrls: ['./detalhe-chamado.style.css']
})
export class DetalheChamadoComponent implements OnInit {

  chamado?: Chamado;
  chamadoId!: number;

  role: string | null = null;

  tecnicos: TecnicoResumo[] = [];
  tecnicoSelecionado: number | null = null;

  avaliacao: number | null = null;
  feedback: string = "";

  usuarioAtual: Perfil | null = null;

  // Prioridade / SLA / Escalonamento
  prioridadeLabels = PRIORIDADE_LABELS;
  prioridadeOpcoes = PRIORIDADE_OPCOES;
  nivelLabels = NIVEL_LABELS;
  statusSlaLabels = STATUS_SLA_LABELS;

  escalonamentoTecnicoId: number | null = null;
  escalonamentoMotivo: string = '';

  // Histórico
  historico: Historico[] = [];

  constructor(
    private route: ActivatedRoute,
    private chamados: ChamadosService,
    private usuariosService: UsuariosService,
    private auth: AuthService,
    private perfil: PerfilService,
    private location: Location
  ) { }

  ngOnInit() {
    this.role = this.auth.getUserRole();

    this.perfil.me().subscribe({
      next: p => this.usuarioAtual = p,
      error: err => console.error("Erro ao carregar perfil", err)
    });

    // Somente a equipe de atendimento precisa da lista de técnicos (dados mínimos: id, nome, nível)
    if (this.role === 'ADMIN' || this.role === 'TECNICO') {
      this.usuariosService.listarTecnicos().subscribe({
        next: tecnicos => this.tecnicos = tecnicos,
        error: err => console.error("Erro ao carregar técnicos", err)
      });
    }

    this.chamadoId = Number(this.route.snapshot.paramMap.get('id'));
    this.carregarChamado();
    this.carregarHistorico();
  }

  carregarChamado() {
    this.chamados.buscarPorId(this.chamadoId).subscribe({
      next: (data: Chamado) => {
        this.chamado = data;

        this.avaliacao = data.avaliacao ?? null;
        this.feedback = data.feedback ?? "";
      },
      error: err => console.error('Erro ao carregar chamado', err)
    });
  }

  carregarHistorico() {
    this.chamados.historico(this.chamadoId).subscribe({
      next: (data: Historico[]) => this.historico = data,
      error: err => console.error('Erro ao carregar histórico', err)
    });
  }

  atenderChamado() {
    if (!this.usuarioAtual) {
      alert("Usuário não encontrado!");
      return;
    }

    this.chamados.atribuirTecnico(
      this.chamadoId,
      this.usuarioAtual.id,
      {}
    ).subscribe({
      next: (chamado: Chamado) => {
        this.chamado = chamado;
        this.carregarHistorico();
        alert("Chamado atendido!");
      },
      error: err => console.error("Erro ao atender chamado", err)
    });
  }

  atribuirTecnicoPorAdmin() {
    if (!this.tecnicoSelecionado) {
      alert("Selecione um técnico!");
      return;
    }

    this.chamados.atribuirTecnico(
      this.chamadoId,
      this.tecnicoSelecionado,
      {}
    ).subscribe({
      next: (chamado: Chamado) => {
        this.chamado = chamado;
        this.carregarHistorico();
        alert("Técnico atribuído com sucesso!");
      },
      error: err => console.error("Erro ao atribuir técnico", err)
    });
  }

  atualizarStatus() {
    if (!this.chamado) return;

    this.chamados.atualizar(this.chamadoId, {
      titulo: this.chamado.titulo,
      descricao: this.chamado.descricao,
      categoria: this.chamado.categoria,
      status: this.chamado.status
    }).subscribe({
      next: (chamado: Chamado) => {
        this.chamado = chamado;
        this.carregarHistorico();
      },
      error: err => console.error("Erro ao atualizar status", err)
    });
  }

  /**
   * Atualiza a prioridade do chamado (sugerida automaticamente na criação,
   * mas editável por técnicos/admins). Recalcula os prazos de SLA no backend.
   */
  atualizarPrioridade() {
    if (!this.chamado) return;

    this.chamados.atualizar(this.chamadoId, {
      titulo: this.chamado.titulo,
      descricao: this.chamado.descricao,
      categoria: this.chamado.categoria,
      status: this.chamado.status,
      prioridade: this.chamado.prioridade
    }).subscribe({
      next: (chamado: Chamado) => {
        this.chamado = chamado;
        this.carregarHistorico();
      },
      error: err => console.error("Erro ao atualizar prioridade", err)
    });
  }

  /**
   * Indica se o chamado pode ser escalonado (não está no nível máximo N3).
   */
  podeEscalonar(): boolean {
    return podeEscalonar(this.chamado?.nivelAtual);
  }

  /**
   * Próximo nível de escalonamento (N1 -> N2 -> N3), usado para exibir
   * no botão de escalonamento.
   */
  proximoNivelLabel(): string {
    return proximoNivel(this.chamado?.nivelAtual);
  }

  /**
   * Escalona manualmente o chamado para o próximo nível, opcionalmente
   * atribuindo a um técnico específico e registrando um motivo.
   */
  escalonar() {
    if (!this.chamado) return;

    if (!confirm(`Escalonar este chamado para o nível ${this.proximoNivelLabel()}?`)) {
      return;
    }

    const request: EscalonarRequest = {
      tecnicoId: this.escalonamentoTecnicoId ?? undefined,
      motivo: this.escalonamentoMotivo?.trim() || undefined
    };

    this.chamados.escalonar(this.chamadoId, request).subscribe({
      next: (chamado: Chamado) => {
        this.chamado = chamado;
        this.escalonamentoTecnicoId = null;
        this.escalonamentoMotivo = '';
        this.carregarHistorico();
        alert(`Chamado escalonado para ${chamado.nivelAtual ?? 'N2'}!`);
      },
      error: err => {
        console.error("Erro ao escalonar chamado", err);
        alert('Erro ao escalonar: ' + (err.error?.message || err.error?.error || err.message));
      }
    });
  }

  salvarFeedback() {
    if (!this.chamado) return;
    this.chamados.atualizar(this.chamadoId, {
      titulo: this.chamado.titulo,
      descricao: this.chamado.descricao,
      categoria: this.chamado.categoria,
      status: this.chamado.status,
      avaliacao: this.avaliacao ?? undefined,
      feedback: this.feedback
    }).subscribe({
      next: (chamadoAtualizado: Chamado) => {
        this.chamado = chamadoAtualizado;
        alert("Feedback enviado com sucesso!");
      },
      error: err => console.error("Erro ao salvar feedback", err)
    });
  }

  /** Equipe de atendimento ou o cliente que abriu o chamado. */
  podeEditar(): boolean {
    if (this.role === 'ADMIN' || this.role === 'TECNICO') return true;
    return !!this.chamado && !!this.usuarioAtual && this.chamado.clienteId === this.usuarioAtual.id;
  }

  podeExcluir(): boolean {
    return this.role === 'ADMIN';
  }

  editar() {
    if (!this.chamado) return;
    const titulo = prompt('Editar título', this.chamado.titulo);
    const descricao = prompt('Editar descrição', this.chamado.descricao);

    if (titulo !== null && descricao !== null) {
      this.chamados.atualizar(this.chamadoId, { titulo, descricao }).subscribe({
        next: (updated: Chamado) => {
          this.chamado = updated;
          alert('Chamado atualizado com sucesso!');
        },
        error: err => console.error('Erro ao atualizar chamado', err)
      });
    }
  }

  excluir() {
    if (confirm('Tem certeza que deseja excluir este chamado?')) {
      this.chamados.excluir(this.chamadoId).subscribe({
        next: () => {
          alert('Chamado excluído com sucesso!');
          this.location.back();
        },
        error: err => console.error('Erro ao excluir chamado', err)
      });
    }
  }

  formatarData(data?: string): string {
    if (!data) return '---';
    const d = new Date(data);
    return (
      d.toLocaleDateString() +
      ' ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  }
}
