import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../app/features/auth/services/auth.service';
import { PerfilService } from './core/services/perfil.service';
import { NotificacaoBellComponent } from './features/notificacoes/components/notificacao-bell/notificacao-bell.component';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';
import { SiteFooterComponent } from './shared/components/site-footer/site-footer.component';
import { jwtDecode } from 'jwt-decode';

/** Rotas exibidas sem o menu lateral (login, políticas e consentimento). */
const ROTAS_SEM_MENU = ['/login', '/privacidade', '/termos', '/cookies', '/reembolso', '/licencas', '/consentimento'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgClass, NgIf, NotificacaoBellComponent, CookieBannerComponent, SiteFooterComponent],
  template: `
  <a class="skip-link" href="#conteudo" (click)="pularParaConteudo($event)">Pular para o conteúdo</a>

  <div *ngIf="pronto && !isPublicPage" class="app">
    <aside class="sidebar">
      <div>
        <h2>Menu</h2>
        <nav class="nav-menu" aria-label="Menu principal">
          <!-- ADMIN: Dashboard -->
          <a *ngIf="isAdmin" routerLink="/dashboard" class="nav-link" routerLinkActive="active" ariaCurrentWhenActive="page">
            <div class="icon-box">
              <i class="fa-solid fa-chart-line" aria-hidden="true"></i>
            </div>
            <span>Dashboard</span>
          </a>

          <!-- ADMIN: Chamados -->
          <a *ngIf="isAdmin" routerLink="/chamados" class="nav-link" routerLinkActive="active" ariaCurrentWhenActive="page">
            <div class="icon-box">
              <i class="fa-solid fa-ticket" aria-hidden="true"></i>
            </div>
            <span>Chamados</span>
          </a>

          <!-- CLIENTE: Meus Chamados -->
          <a *ngIf="isCliente || isTecnico" routerLink="/meus-chamados" class="nav-link" routerLinkActive="active" ariaCurrentWhenActive="page">
            <div class="icon-box">
              <i class="fa-solid fa-ticket" aria-hidden="true"></i>
            </div>
            <span>Meus Chamados</span>
          </a>

          <!-- TÉCNICO: Chamados Pendentes -->
          <a *ngIf="isTecnico" routerLink="/chamados-pendentes" class="nav-link" routerLinkActive="active" ariaCurrentWhenActive="page">
            <div class="icon-box">
              <i class="fa-solid fa-hourglass-half" aria-hidden="true"></i>
            </div>
            <span>Chamados Pendentes</span>
          </a>

          <!-- ADMIN e CLIENTE: Novo Chamado -->
          <a *ngIf="isAdmin || isCliente" routerLink="/novo" class="nav-link" routerLinkActive="active" ariaCurrentWhenActive="page">
            <div class="icon-box">
              <i class="fa-solid fa-circle-plus" aria-hidden="true"></i>
            </div>
            <span>Novo Chamado</span>
          </a>

          <!-- ADMIN: Usuários -->
          <a *ngIf="isAdmin" routerLink="/usuarios" class="nav-link" routerLinkActive="active" ariaCurrentWhenActive="page">
            <div class="icon-box">
              <i class="fa-solid fa-users" aria-hidden="true"></i>
            </div>
            <span>Usuários</span>
          </a>

          <!-- ADMIN: Configuração de SLA -->
          <a *ngIf="isAdmin" routerLink="/sla-config" class="nav-link" routerLinkActive="active" ariaCurrentWhenActive="page">
            <div class="icon-box">
              <i class="fa-solid fa-stopwatch" aria-hidden="true"></i>
            </div>
            <span>SLA</span>
          </a>

          <!-- Todos: dados pessoais e privacidade -->
          <a routerLink="/meus-dados" class="nav-link" routerLinkActive="active" ariaCurrentWhenActive="page">
            <div class="icon-box">
              <i class="fa-solid fa-user-shield" aria-hidden="true"></i>
            </div>
            <span>Meus dados</span>
          </a>
        </nav>
      </div>

      <button type="button" class="btn btn-outline" (click)="logout()">Sair</button>
    </aside>

    <div class="app-main">
      <header class="header">
        <div style="display:flex;align-items:center;gap:12px">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div style="display:flex;align-items:center;gap:16px">
          <app-notificacao-bell></app-notificacao-bell>
          <a routerLink="/" class="header-logo">
            <img src="assets/logo-vertical.svg" alt="ChamadoPro - página inicial" />
          </a>
        </div>
      </header>
      <main id="conteudo" class="content" tabindex="-1">
        <router-outlet></router-outlet>
      </main>
      <app-site-footer></app-site-footer>
    </div>
  </div>

  <router-outlet *ngIf="pronto && isPublicPage"></router-outlet>

  <app-cookie-banner></app-cookie-banner>
  `
})
export class AppComponent {
  pageTitle = 'Meus Chamados';
  isPublicPage = false;
  /** Evita montar o layout (e chamar a API) antes de saber qual rota será exibida. */
  pronto = false;
  isAdmin = false;
  isCliente = false;
  isTecnico = false;

  constructor(private router: Router, private auth: AuthService, private perfil: PerfilService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url: string = event.urlAfterRedirects;
        this.isPublicPage = ROTAS_SEM_MENU.some(r => url.startsWith(r));
        this.pronto = true;
        this.updateRole();
        this.updateTitle(url);
      });
  }

  private updateRole() {
    const token = this.auth.getToken();
    this.isAdmin = false;
    this.isCliente = false;
    this.isTecnico = false;
    if (!token) return;

    try {
      const decoded: any = jwtDecode(token);
      const role = decoded.role;
      this.isAdmin = role === 'ADMIN';
      this.isCliente = role === 'CLIENTE';
      this.isTecnico = role === 'TECNICO';
    } catch (e) {
      console.warn('Erro ao decodificar token');
    }
  }

  private updateTitle(url: string) {
    if (url.includes('/dashboard')) {
      this.pageTitle = 'Dashboard';
    } else if (url.includes('/sla-config')) {
      this.pageTitle = 'Configuração de SLA';
    } else if (url.includes('/novo')) {
      this.pageTitle = 'Novo Chamado';
    } else if (url.includes('/usuarios')) {
      this.pageTitle = 'Usuários';
    } else if (url.includes('/chamados-pendentes')) {
      this.pageTitle = 'Chamados Pendentes';
    } else if (url.includes('/chamados')) {
      this.pageTitle = 'Chamados';
    } else if (url.includes('/meus-dados')) {
      this.pageTitle = 'Meus dados e privacidade';
    } else if (url.includes('/detalhe')) {
      this.pageTitle = 'Detalhe do Chamado';
    } else if (url.includes('/login')) {
      this.pageTitle = 'Entrar';
    } else if (url.includes('/privacidade')) {
      this.pageTitle = 'Política de Privacidade';
    } else if (url.includes('/termos')) {
      this.pageTitle = 'Termos de Uso';
    } else if (url.includes('/cookies')) {
      this.pageTitle = 'Política de Cookies';
    } else if (url.includes('/reembolso')) {
      this.pageTitle = 'Política de Reembolso';
    } else if (url.includes('/licencas')) {
      this.pageTitle = 'Licenças';
    } else if (url.includes('/consentimento')) {
      this.pageTitle = 'Consentimento';
    } else {
      this.pageTitle = 'Meus Chamados';
    }
    document.title = `${this.pageTitle} | ChamadoPro`;
  }

  /** Com HashLocation, um href="#conteudo" trocaria a rota; por isso o foco é movido manualmente. */
  pularParaConteudo(event: Event) {
    event.preventDefault();
    document.getElementById('conteudo')?.focus();
  }

  logout() {
    this.auth.logout();
    this.perfil.limpar();
    location.reload();
  }
}
