import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChamadosService, Chamado } from '../../../services/chamados.service';
import { NgFor, NgClass, NgIf, DatePipe } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';
import { PerfilService } from '../../../../../core/services/perfil.service';
import { PRIORIDADE_LABELS, STATUS_SLA_LABELS } from '../../../../../shared/chamado-labels';

@Component({
    selector: 'app-meus-chamados',
    standalone: true,
    imports: [NgFor, NgClass, NgIf, DatePipe],
    template: `
    <div>
      <div class="list-header">
        <span>Total: {{ chamados?.length || 0 }}</span>
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
    </div>
  `,
    styleUrls: ['../lista-chamados.style.css']
})
export class MeusChamadosComponent implements OnInit {

    chamados: Chamado[] = [];
    role: string | null = null;
    usuarioId: number | null = null;

    prioridadeLabels = PRIORIDADE_LABELS;
    statusSlaLabels = STATUS_SLA_LABELS;

    constructor(private router: Router,
        private chamadosService: ChamadosService,
        private auth: AuthService,
        private perfil: PerfilService) { }

    ngOnInit() {
        this.role = this.auth.getUserRole();

        this.perfil.me().subscribe({
            next: usuario => {
                if (this.role === 'CLIENTE') {
                    this.chamadosService.listarPorCliente(usuario.id).subscribe({
                        next: data => this.chamados = data,
                        error: err => console.error(err)
                    });
                } else if (this.role === 'TECNICO') {
                    this.chamadosService.listarPorTecnico(usuario.id).subscribe({
                        next: data => this.chamados = data,
                        error: err => console.error(err)
                    });
                }
            },
            error: err => console.error("Erro ao carregar perfil", err)
        });
    }


    open(id: number) { this.router.navigate(['/detalhe', id]); }

    statusClass(s: string) {
        switch (s.toUpperCase()) {
            case 'ABERTO': return 'status ABERTO';
            case 'PENDENTE': return 'status PENDENTE';
            case 'EM ANDAMENTO': return 'status EM_ANDAMENTO';
            case 'FINALIZADO': return 'status FINALIZADO';
            default: return 'status ABERTO';
        }
    }

}
