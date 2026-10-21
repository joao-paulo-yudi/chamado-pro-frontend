import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '@core/auth/auth.service';
import { Role } from '@core/models';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  roles: Role[];
  /** Define quando o item fica destacado; por padrão, a URL começa com `link`. */
  ativo?: (url: string) => boolean;
}

const emChamados = (url: string) => /^\/chamados(\/(?!novo)|\?|$)/.test(url);

interface NavGroup {
  titulo: string;
  itens: NavItem[];
}

/** Menu de navegação. Cada item declara os papéis que podem vê-lo. */
const MENU: NavGroup[] = [
  {
    titulo: 'Visão geral',
    itens: [{ label: 'Dashboard', icon: 'fa-chart-pie', link: '/dashboard', roles: ['ADMIN'] }],
  },
  {
    titulo: 'Atendimento',
    itens: [
      { label: 'Chamados', icon: 'fa-ticket', link: '/chamados', roles: ['ADMIN', 'TECNICO'], ativo: emChamados },
      { label: 'Meus chamados', icon: 'fa-ticket', link: '/chamados', roles: ['CLIENTE'], ativo: emChamados },
      { label: 'Novo chamado', icon: 'fa-circle-plus', link: '/chamados/novo', roles: ['ADMIN', 'CLIENTE'] },
    ],
  },
  {
    titulo: 'Administração',
    itens: [
      { label: 'Usuários', icon: 'fa-users', link: '/usuarios', roles: ['ADMIN'] },
      { label: 'Configuração de SLA', icon: 'fa-stopwatch', link: '/sla', roles: ['ADMIN'] },
    ],
  },
  {
    titulo: 'Conta',
    itens: [
      { label: 'Meus dados', icon: 'fa-user-shield', link: '/meus-dados', roles: ['ADMIN', 'TECNICO', 'CLIENTE'] },
    ],
  },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly aberto = input(false);
  readonly fechar = output<void>();

  protected readonly grupos = computed(() => {
    const role = this.auth.role();
    const url = this.url();
    return MENU.map(g => ({
      ...g,
      itens: g.itens
        .filter(i => !!role && i.roles.includes(role))
        .map(i => ({ ...i, isAtivo: i.ativo ? i.ativo(url) : url.startsWith(i.link) })),
    })).filter(g => g.itens.length > 0);
  });
}
