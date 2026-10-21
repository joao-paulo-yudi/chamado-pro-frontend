import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PerfilService, Perfil } from '../../../core/services/perfil.service';
import { AuthService } from '../../auth/services/auth.service';
import { LEGAL_VERSION } from '../../../shared/business-info';

/**
 * Aceite obrigatório dos Termos de Uso e da Política de Privacidade (versão vigente)
 * e consentimento opcional, separado, para notificações por WhatsApp.
 * Nenhuma caixa vem marcada por padrão.
 */
@Component({
  selector: 'app-consentimento',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink],
  templateUrl: './consentimento.component.html',
})
export class ConsentimentoComponent implements OnInit {
  perfil?: Perfil;
  aceiteTermos = false;
  consentimentoWhatsapp = false;
  enviando = false;
  erro = '';

  constructor(private perfilService: PerfilService, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.perfilService.me().subscribe({
      next: p => {
        this.perfil = p;
        // Reaproveita apenas uma escolha que o próprio usuário já fez antes
        this.consentimentoWhatsapp = p.consentimentoWhatsapp;
      },
      error: () => this.erro = 'Não foi possível carregar seus dados.'
    });
  }

  confirmar() {
    if (!this.aceiteTermos) {
      this.erro = 'Para continuar, é necessário aceitar os Termos de Uso e a Política de Privacidade.';
      return;
    }
    this.enviando = true;
    this.erro = '';
    this.perfilService.registrarConsentimento({
      versaoTermos: LEGAL_VERSION,
      aceiteTermos: true,
      consentimentoWhatsapp: this.consentimentoWhatsapp
    }).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        this.enviando = false;
        this.erro = err.error?.message || 'Não foi possível registrar o consentimento.';
      }
    });
  }

  sair() {
    this.auth.logout();
    this.perfilService.limpar();
    this.router.navigate(['/login']);
  }
}
