import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { ChamadosService } from '../../services/chamados.service';
import { PRIORIDADE_LABELS, PRIORIDADE_OPCOES, sugerirPrioridade } from '../../../../shared/chamado-labels';

@Component({
  selector: 'app-novo-chamado',
  standalone: true,
  imports: [FormsModule, NgFor],
  templateUrl: './novo-chamado.component.html',
  styleUrls: ['./novo-chamado.style.css']
})
export class NovoChamadoComponent {
  model: { titulo?: string; descricao?: string; categoria?: string; prioridade?: string } = {};

  prioridadeLabels = PRIORIDADE_LABELS;
  prioridadeOpcoes = PRIORIDADE_OPCOES;
  prioridadeEditadaManualmente = false;

  constructor(
    private router: Router,
    private chamados: ChamadosService
  ) {}

  /**
   * Quando a categoria muda, sugere automaticamente uma prioridade
   * (caso o usuário ainda não a tenha alterado manualmente).
   */
  onCategoriaChange() {
    if (!this.prioridadeEditadaManualmente) {
      this.model.prioridade = sugerirPrioridade(this.model.categoria);
    }
  }

  onPrioridadeChange() {
    this.prioridadeEditadaManualmente = true;
  }

  enviar() {
    if (!this.model.titulo?.trim() || !this.model.descricao?.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // O cliente do chamado é definido no servidor a partir do usuário autenticado
    const payload = {
      titulo: this.model.titulo.trim(),
      descricao: this.model.descricao.trim(),
      categoria: this.model.categoria,
      prioridade: this.model.prioridade || sugerirPrioridade(this.model.categoria)
    };

    this.chamados.criar(payload).subscribe({
      next: () => {
        alert('Chamado criado com sucesso!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Erro ao criar chamado', err);
        alert('Erro ao criar chamado: ' + (err.error?.message || 'tente novamente.'));
      }
    });
  }

  voltar() {
    this.router.navigate(['/']);
  }
}
