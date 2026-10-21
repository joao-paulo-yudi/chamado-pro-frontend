import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { PerfilService } from '../services/perfil.service';

export const authGuard: CanActivateFn = (route?: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const perfil = inject(PerfilService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    auth.logout();
    return router.createUrlTree(['/login']);
  }

  const userRole = auth.getUserRole();

  if (!userRole) {
    return router.createUrlTree(['/login']);
  }

  if (route?.routeConfig?.path === '') {
    if (userRole === 'ADMIN') {
      return router.createUrlTree(['/chamados']);
    } else if (userRole === 'CLIENTE' || userRole === 'TECNICO') {
      return router.createUrlTree(['/meus-chamados']);
    }
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = (route?.data?.['roles'] || []) as string[];

  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return router.createUrlTree(['/']);
  }

  if (route?.data?.['skipConsent']) {
    return true;
  }

  // Exige o aceite da versão vigente dos Termos de Uso e da Política de Privacidade
  return perfil.me().pipe(
    map(p => perfil.termosAceitos(p) ? true : router.createUrlTree(['/consentimento'])),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
