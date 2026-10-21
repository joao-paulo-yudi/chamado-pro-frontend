import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChamadosService, Chamado } from '../../../services/chamados.service';
import { NgFor, NgClass, NgIf, DatePipe } from '@angular/common';
import { PRIORIDADE_LABELS, STATUS_SLA_LABELS } from '../../../../../shared/chamado-labels';

@Component({
  selector: 'app-chamados-pendentes',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, DatePipe],
  template: `
    <div>
      <div class="list-header">
        <span>Total Pendentes: {{ chamados?.length || 0 }}</span>
      </div>

      <div class="tickets-grid">
        <div *ngFor="let c of chamados" class="ticket-card" role="link" tabindex="0"
             (click)="open(c.id)" (keydown.enter)="open(c.id)">
          <div class="ticket-info">
            <strong class="ticket-title">{{ c.titulo }}</strong>
            <p><b>Descrição:</b> {{ c.descricao }}</p>
            <p><b>Criado em:</b> {{ c.dataCriacao | date:'dd/MM/yyyy HH:mm' }}</p>
          </div>

          <div class="ticket-badges">
            <span *ngIf="c.prioridade" class="badge" [ngClass]="'prioridade-' + c.prioridade">
              {{ prioridadeLabels[c.prioridade] || c.prioridade }}
            </span>
            <span *ngIf="c.statusSla" class="badge" [ngClass]="'sla-' + c.statusSla">
              {{ statusSlaLabels[c.statusSla] || c.statusSla }}
            </span>
          </div>

          <div class="ticket-meta">
            <span [ngClass]="statusClass(c.status)" class="status">{{ c.status }}</span>
          </div>
        </div>
      </div>

      <p *ngIf="!chamados?.length">Nenhum chamado pendente encontrado.</p>
    </div>
  `,
  styleUrls: ['../lista-chamados.style.css']
})
export class ChamadosPendentesComponent implements OnInit {

  chamados: Chamado[] = [];

  prioridadeLabels = PRIORIDADE_LABELS;
  statusSlaLabels = STATUS_SLA_LABELS;

  constructor(private router: Router, private chamadosService: ChamadosService) {}

  ngOnInit() {
    this.chamadosService.listar().subscribe({
      next: data => {
        this.chamados = data.filter(c => !c.tecnicoNome || c.tecnicoNome.trim() === '');
      },
      error: err => console.error("Erro ao carregar chamados pendentes", err)
    });
  }

  open(id: number) { this.router.navigate(['/detalhe', id]); }

  statusClass(s: string) {
    const status = s.replace('_', ' ').toUpperCase();
    switch (status) {
      case 'ABERTO': return 'status ABERTO';
      case 'PENDENTE': return 'status PENDENTE';
      case 'EM ANDAMENTO': return 'status EM_ANDAMENTO';
      case 'FINALIZADO': return 'status FINALIZADO';
      default: return 'status ABERTO';
    }
  }

}
