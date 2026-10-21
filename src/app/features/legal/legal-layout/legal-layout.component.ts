import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { LEGAL_LAST_UPDATE } from '@core/constants/business-info';
import { SiteFooterComponent } from '@shared/components/site-footer/site-footer.component';

/**
 * Moldura das páginas públicas (políticas, termos, licenças):
 * logo, botão voltar, navegação entre os documentos e rodapé.
 */
@Component({
  selector: 'app-legal-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SiteFooterComponent],
  templateUrl: './legal-layout.component.html',
  styleUrl: './legal-layout.component.css',
})
export class LegalLayoutComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly auth = inject(AuthService);

  protected readonly atualizacao = LEGAL_LAST_UPDATE;
  protected readonly documentos = [
    { link: '/privacidade', label: 'Política de Privacidade', icon: 'fa-user-shield' },
    { link: '/termos', label: 'Termos de Uso', icon: 'fa-file-contract' },
    { link: '/cookies', label: 'Política de Cookies', icon: 'fa-cookie-bite' },
    { link: '/reembolso', label: 'Reembolso e Cancelamento', icon: 'fa-rotate-left' },
    { link: '/licencas', label: 'Licenças e créditos', icon: 'fa-scale-balanced' },
  ];

  protected readonly titulo = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      // O snapshot do filho só existe depois da ativação; o NavigationEnd seguinte preenche o título
      map(() => this.route.firstChild?.snapshot?.title ?? '')
    ),
    { initialValue: '' }
  );

  voltar() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  /** Com <base href="/">, um href="#conteudo" levaria para a raiz; por isso o foco é movido manualmente. */
  pularParaConteudo(event: Event) {
    event.preventDefault();
    document.getElementById('conteudo')?.focus();
  }
}
