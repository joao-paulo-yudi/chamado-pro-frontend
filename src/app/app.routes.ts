import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login/login.component')
        .then(m => m.LoginComponent),
  },
  // Páginas públicas (acessíveis sem login)
  {
    path: 'privacidade',
    loadComponent: () =>
      import('./features/legal/privacidade/privacidade.component').then(m => m.PoliticaPrivacidadeComponent),
  },
  {
    path: 'termos',
    loadComponent: () =>
      import('./features/legal/termos/termos.component').then(m => m.TermosUsoComponent),
  },
  {
    path: 'cookies',
    loadComponent: () =>
      import('./features/legal/cookies/cookies.component').then(m => m.PoliticaCookiesComponent),
  },
  {
    path: 'reembolso',
    loadComponent: () =>
      import('./features/legal/reembolso/reembolso.component').then(m => m.PoliticaReembolsoComponent),
  },
  {
    path: 'licencas',
    loadComponent: () =>
      import('./features/legal/licencas/licencas.component').then(m => m.LicencasComponent),
  },
  {
    path: 'consentimento',
    canActivate: [authGuard],
    data: { skipConsent: true },
    loadComponent: () =>
      import('./features/legal/consentimento/consentimento.component').then(m => m.ConsentimentoComponent),
  },
  {
    path: 'meus-dados',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/legal/meus-dados/meus-dados.component').then(m => m.MeusDadosComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [],
  },
  {
    path: 'chamados',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/chamados/components/lista-chamados/lista-chamados.component')
        .then(m => m.ListaChamadosComponent),
  },
  {
    path: 'chamados-pendentes',
    canActivate: [authGuard],
    data: { roles: ['TECNICO'] },
    loadComponent: () =>
      import('./features/chamados/components/lista-chamados/chamados-pendentes/chamados-pendentes.component')
        .then(m => m.ChamadosPendentesComponent),
  },
  {
    path: 'meus-chamados',
    canActivate: [authGuard],
    data: { roles: ['TECNICO', 'CLIENTE'] },
    loadComponent: () =>
      import('./features/chamados/components/lista-chamados/meus-chamados/meus-chamados.component')
        .then(m => m.MeusChamadosComponent),
  },
  {
    path: 'novo',
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'CLIENTE'] },
    loadComponent: () =>
      import('./features/chamados/components/novo-chamado/novo-chamado.component')
        .then(m => m.NovoChamadoComponent),
  },
  {
    path: 'detalhe/:id',
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'CLIENTE', 'TECNICO'] },
    loadComponent: () =>
      import('./features/chamados/components/detalhe-chamado/detalhe-chamado.component')
        .then(m => m.DetalheChamadoComponent),
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/usuarios/components/lista-usuarios/lista-usuarios.component')
        .then(m => m.ListaUsuariosComponent),
  },
  {
    path: 'usuarios/novo',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/usuarios/components/novo-usuario/novo-usuario.component')
        .then(m => m.NovoUsuarioComponent),
  },
  {
    path: 'usuarios/editar/:id',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/usuarios/components/editar-usuario/editar-usuario.component')
        .then(m => m.EditarUsuarioComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/dashboard/components/dashboard-admin/dashboard-admin.component')
        .then(m => m.DashboardAdminComponent),
  },
  {
    path: 'sla-config',
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () =>
      import('./features/sla-config/components/sla-config-admin/sla-config-admin.component')
        .then(m => m.SlaConfigAdminComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
