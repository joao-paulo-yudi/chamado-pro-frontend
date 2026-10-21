import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { PerfilService } from '@core/services/perfil.service';
import { mensagemDeErro } from '@core/services/toast.service';
import { LEGAL_VERSION } from '@core/constants/business-info';
import { Perfil } from '@core/models';

/**
 * Aceite obrigatório dos Termos de Uso e da Política de Privacidade (versão vigente)
 * e consentimento opcional, separado, para notificações por WhatsApp.
 * Nenhuma caixa vem marcada por padrão.
 */
@Component({
  selector: 'app-consentimento',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './consentimento.component.html',
  styleUrl: './consentimento.component.css',
})
export class ConsentimentoComponent implements OnInit {
  private readonly perfilService = inject(PerfilService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly perfil = signal<Perfil | null>(null);
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');
  protected aceiteTermos = false;
  protected consentimentoWhatsapp = false;

  ngOnInit() {
    this.perfilService.me().subscribe({
      next: p => {
        this.perfil.set(p);
        // Reaproveita apenas uma escolha que o próprio usuário já fez antes
        this.consentimentoWhatsapp = p.consentimentoWhatsapp;
      },
      error: () => this.erro.set('Não foi possível carregar seus dados.'),
    });
  }

  confirmar() {
    if (!this.aceiteTermos) {
      this.erro.set('Para continuar, é necessário aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }
    this.enviando.set(true);
    this.erro.set('');
    this.perfilService
      .registrarConsentimento({
        versaoTermos: LEGAL_VERSION,
        aceiteTermos: true,
        consentimentoWhatsapp: this.consentimentoWhatsapp,
      })
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: err => {
          this.enviando.set(false);
          this.erro.set(mensagemDeErro(err, 'Não foi possível registrar o consentimento.'));
        },
      });
  }

  sair() {
    this.auth.logout();
    this.perfilService.limpar();
    this.router.navigate(['/login']);
  }
}
