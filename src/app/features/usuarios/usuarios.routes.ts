import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Usuários',
    loadComponent: () => import('./lista-usuarios/lista-usuarios.component').then(m => m.ListaUsuariosComponent),
  },
  {
    path: 'novo',
    title: 'Novo usuário',
    loadComponent: () => import('./form-usuario/form-usuario.component').then(m => m.FormUsuarioComponent),
  },
  {
    path: ':id/editar',
    title: 'Editar usuário',
    loadComponent: () => import('./form-usuario/form-usuario.component').then(m => m.FormUsuarioComponent),
  },
  // Endereço antigo
  { path: 'editar/:id', redirectTo: ':id/editar' },
];
