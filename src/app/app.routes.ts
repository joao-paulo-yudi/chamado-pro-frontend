import { Routes } from '@angular/router';
import { LEGAL_ROUTES } from './features/legal/legal.routes';
import { authGuard, guestGuard, homeRedirectGuard, roleGuard } from '@core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Entrar',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'consentimento',
    title: 'Consentimento',
    canActivate: [authGuard],
    data: { skipConsent: true },
    loadComponent: () =>
      import('./features/conta/consentimento/consentimento.component').then(m => m.ConsentimentoComponent),
  },

  // Área autenticada: menu lateral + barra superior
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
      {
        path: 'dashboard',
        title: 'Dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/dashboard/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent),
      },
      {
        path: 'chamados',
        loadChildren: () => import('./features/chamados/chamados.routes').then(m => m.CHAMADOS_ROUTES),
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES),
      },
      {
        path: 'sla',
        title: 'Configuração de SLA',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/sla/sla-config/sla-config.component').then(m => m.SlaConfigComponent),
      },
      {
        path: 'meus-dados',
        title: 'Meus dados e privacidade',
        loadComponent: () => import('./features/conta/meus-dados/meus-dados.component').then(m => m.MeusDadosComponent),
      },

      // Endereços antigos, mantidos para links salvos e notificações já enviadas
      { path: 'meus-chamados', redirectTo: '/chamados' },
      { path: 'chamados-pendentes', redirectTo: '/chamados?visao=fila' },
      { path: 'novo', redirectTo: '/chamados/novo' },
      { path: 'detalhe/:id', redirectTo: '/chamados/:id' },
      { path: 'sla-config', redirectTo: '/sla' },
    ],
  },

  // Páginas públicas (políticas e termos), acessíveis sem login. Ficam depois da área
  // autenticada: como as duas usam path '', a raiz "/" deve cair no layout principal.
  {
    path: '',
    loadComponent: () => import('./features/legal/legal-layout/legal-layout.component').then(m => m.LegalLayoutComponent),
    children: LEGAL_ROUTES,
  },

  { path: '**', redirectTo: '' },
];
