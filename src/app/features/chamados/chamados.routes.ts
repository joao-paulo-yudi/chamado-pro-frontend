import { Routes } from '@angular/router';
import { roleGuard } from '@core/auth/auth.guard';

export const CHAMADOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Chamados',
    loadComponent: () => import('./lista-chamados/lista-chamados.component').then(m => m.ListaChamadosComponent),
  },
  {
    path: 'novo',
    title: 'Novo chamado',
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'CLIENTE'] },
    loadComponent: () => import('./novo-chamado/novo-chamado.component').then(m => m.NovoChamadoComponent),
  },
  {
    path: ':id',
    title: 'Detalhe do chamado',
    loadComponent: () => import('./detalhe-chamado/detalhe-chamado.component').then(m => m.DetalheChamadoComponent),
  },
];
