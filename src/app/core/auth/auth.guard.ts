import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';
import { PerfilService } from '../services/perfil.service';
import { Role } from '../models';

/** Página inicial de cada papel. */
export function homeDoPapel(role: Role | null): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard';
    case 'TECNICO':
    case 'CLIENTE':
      return '/chamados';
    default:
      return '/login';
  }
}

/**
 * Exige sessão válida e o aceite da versão vigente dos Termos de Uso e da
 * Política de Privacidade. Rotas com `data.skipConsent` só exigem a sessão.
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const perfil = inject(PerfilService);
  const router = inject(Router);

  if (!auth.isAuthenticated() || !auth.getUserRole()) {
    auth.logout();
    return router.createUrlTree(['/login']);
  }

  if (route.data['skipConsent']) {
    return true;
  }

  return perfil.me().pipe(
    map(p => (perfil.termosAceitos(p) ? true : router.createUrlTree(['/consentimento']))),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};

/** Restringe a rota aos papéis listados em `data.roles`. */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as Role[];
  const role = auth.getUserRole();

  if (!roles.length || (role && roles.includes(role))) {
    return true;
  }
  return router.createUrlTree([homeDoPapel(role)]);
};

/** Redireciona a raiz para a página inicial do papel do usuário. */
export const homeRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return inject(Router).createUrlTree([homeDoPapel(auth.getUserRole())]);
};

/** Evita mostrar o login para quem já está autenticado. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/']) : true;
};
