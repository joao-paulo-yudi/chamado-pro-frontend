import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PerfilService } from '@core/services/perfil.service';
import { ToastService, mensagemDeErro } from '@core/services/toast.service';
import { LEGAL_VERSION } from '@core/constants/business-info';
import { Perfil } from '@core/models';
import { EnumBadgeComponent } from '@shared/components/enum-badge/enum-badge.component';
import { LoadingStateComponent } from '@shared/components/loading-state/loading-state.component';
import { InitialsPipe } from '@shared/pipes/initials.pipe';

/**
 * Central de privacidade do titular (LGPD, art. 18): ver os próprios dados,
 * revogar/conceder o consentimento de WhatsApp e exportar os dados.
 */
@Component({
  selector: 'app-meus-dados',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, EnumBadgeComponent, LoadingStateComponent, InitialsPipe],
  templateUrl: './meus-dados.component.html',
  styleUrl: './meus-dados.component.css',
})
export class MeusDadosComponent implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly toast = inject(ToastService);

  protected readonly perfil = signal<Perfil | null>(null);
  protected readonly erro = signal(false);
  protected readonly salvando = signal(false);
  protected readonly exportando = signal(false);
  protected consentimentoWhatsapp = false;

  ngOnInit() {
    this.perfilService.me().subscribe({
      next: p => {
        this.perfil.set(p);
        this.consentimentoWhatsapp = p.consentimentoWhatsapp;
      },
      error: () => this.erro.set(true),
    });
  }

  salvarWhatsapp() {
    this.salvando.set(true);
    this.perfilService
      .registrarConsentimento({
        versaoTermos: LEGAL_VERSION,
        aceiteTermos: true,
        consentimentoWhatsapp: this.consentimentoWhatsapp,
      })
      .subscribe({
        next: p => {
          this.perfil.set(p);
          this.salvando.set(false);
          this.toast.success(
            this.consentimentoWhatsapp ? 'Notificações por WhatsApp ativadas.' : 'Notificações por WhatsApp desativadas.'
          );
        },
        error: err => {
          this.salvando.set(false);
          this.toast.error(mensagemDeErro(err, 'Não foi possível salvar.'));
        },
      });
  }

  exportar() {
    this.exportando.set(true);
    this.perfilService.exportarDados().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meus-dados-chamadopro.json';
        a.click();
        URL.revokeObjectURL(url);
        this.exportando.set(false);
        this.toast.success('Download dos seus dados iniciado.');
      },
      error: () => {
        this.exportando.set(false);
        this.toast.error('Não foi possível exportar seus dados.');
      },
    });
  }
}
