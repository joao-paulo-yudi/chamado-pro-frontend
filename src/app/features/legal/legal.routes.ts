import { Routes } from '@angular/router';

/** Documentos legais, exibidos dentro do LegalLayoutComponent (sem login). */
export const LEGAL_ROUTES: Routes = [
  {
    path: 'privacidade',
    title: 'Política de Privacidade',
    loadComponent: () => import('./privacidade/privacidade.component').then(m => m.PoliticaPrivacidadeComponent),
  },
  {
    path: 'termos',
    title: 'Termos de Uso',
    loadComponent: () => import('./termos/termos.component').then(m => m.TermosUsoComponent),
  },
  {
    path: 'cookies',
    title: 'Política de Cookies',
    loadComponent: () => import('./cookies/cookies.component').then(m => m.PoliticaCookiesComponent),
  },
  {
    path: 'reembolso',
    title: 'Política de Reembolso e Cancelamento',
    loadComponent: () => import('./reembolso/reembolso.component').then(m => m.PoliticaReembolsoComponent),
  },
  {
    path: 'licencas',
    title: 'Licenças e créditos',
    loadComponent: () => import('./licencas/licencas.component').then(m => m.LicencasComponent),
  },
];
