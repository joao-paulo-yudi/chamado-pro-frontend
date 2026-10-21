import { Component, OnInit } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PerfilService, Perfil } from '../../../core/services/perfil.service';
import { AuthService } from '../../auth/services/auth.service';
import { LEGAL_VERSION } from '../../../shared/business-info';

/**
 * Central de privacidade do titular (LGPD, art. 18): ver os próprios dados,
 * revogar/conceder o consentimento de WhatsApp, exportar e excluir a conta.
 */
@Component({
  selector: 'app-meus-dados',
  standalone: true,
  imports: [NgIf, DatePipe, FormsModule, RouterLink],
  templateUrl: './meus-dados.component.html',
})
export class MeusDadosComponent implements OnInit {
  perfil?: Perfil;
  consentimentoWhatsapp = false;
  mensagem = '';
  erro = '';
  confirmacaoExclusao = '';

  constructor(private perfilService: PerfilService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.perfilService.me().subscribe({
      next: p => {
        this.perfil = p;
        this.consentimentoWhatsapp = p.consentimentoWhatsapp;
      },
      error: () => this.erro = 'Não foi possível carregar seus dados.'
    });
  }

  salvarWhatsapp() {
    this.mensagem = '';
    this.erro = '';
    this.perfilService.registrarConsentimento({
      versaoTermos: LEGAL_VERSION,
      aceiteTermos: true,
      consentimentoWhatsapp: this.consentimentoWhatsapp
    }).subscribe({
      next: p => {
        this.perfil = p;
        this.mensagem = this.consentimentoWhatsapp
          ? 'Notificações por WhatsApp ativadas.'
          : 'Notificações por WhatsApp desativadas.';
      },
      error: err => this.erro = err.error?.message || 'Não foi possível salvar.'
    });
  }

  exportar() {
    this.perfilService.exportarDados().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meus-dados-chamadopro.json';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.erro = 'Não foi possível exportar seus dados.'
    });
  }

  excluirConta() {
    if (this.confirmacaoExclusao !== 'EXCLUIR') {
      this.erro = 'Digite EXCLUIR para confirmar.';
      return;
    }
    this.perfilService.excluirConta().subscribe({
      next: () => {
        this.auth.logout();
        this.perfilService.limpar();
        this.router.navigate(['/login']);
      },
      error: err => this.erro = err.error?.message || 'Não foi possível excluir a conta.'
    });
  }
}
