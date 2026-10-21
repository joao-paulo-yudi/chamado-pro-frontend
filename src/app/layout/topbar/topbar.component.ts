import { Component, ElementRef, HostListener, inject, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { PerfilService } from '@core/services/perfil.service';
import { NotificacaoBellComponent } from '@features/notificacoes/notificacao-bell/notificacao-bell.component';
import { InitialsPipe } from '@shared/pipes/initials.pipe';
import { LabelPipe } from '@shared/pipes/label.pipe';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [FormsModule, RouterLink, NotificacaoBellComponent, InitialsPipe, LabelPipe],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
})
export class TopbarComponent {
  private readonly router = inject(Router);
  private readonly perfilService = inject(PerfilService);
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly auth = inject(AuthService);

  readonly abrirMenu = output<void>();

  protected readonly perfil = toSignal(this.perfilService.me().pipe(catchError(() => of(null))), {
    initialValue: null,
  });
  protected readonly menuUsuarioAberto = signal(false);
  protected busca = '';

  /** Busca rápida: "#123" ou "123" abre o chamado; texto filtra a lista. */
  buscar() {
    const termo = this.busca.trim();
    if (!termo) return;
    const numero = termo.replace(/^#/, '');
    if (/^\d+$/.test(numero)) {
      this.router.navigate(['/chamados', Number(numero)]);
    } else {
      this.router.navigate(['/chamados'], { queryParams: { q: termo }, queryParamsHandling: 'merge' });
    }
    this.busca = '';
  }

  toggleMenuUsuario() {
    this.menuUsuarioAberto.update(v => !v);
  }

  @HostListener('document:keydown.escape')
  fecharComEsc() {
    this.menuUsuarioAberto.set(false);
  }

  @HostListener('document:click', ['$event'])
  fecharAoClicarFora(event: MouseEvent) {
    const menu = this.host.nativeElement.querySelector('.user-menu');
    if (this.menuUsuarioAberto() && menu && !menu.contains(event.target as Node)) {
      this.menuUsuarioAberto.set(false);
    }
  }

  sair() {
    this.menuUsuarioAberto.set(false);
    this.auth.logout();
    this.perfilService.limpar();
    this.router.navigate(['/login']);
  }
}
