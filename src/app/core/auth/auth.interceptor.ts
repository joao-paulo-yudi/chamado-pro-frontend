import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { PerfilService } from '../services/perfil.service';
import { API_PREFIX } from '../services/api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const perfil = inject(PerfilService);
  const router = inject(Router);
  const token = auth.getToken();

  // O token só é enviado para a própria API, nunca para outros domínios ou arquivos estáticos
  const ehApi = req.url.startsWith(`${API_PREFIX}/`);
  const authReq = token && ehApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Token expirado/inválido: encerra a sessão local e volta ao login
      if (err.status === 401 && !req.url.startsWith(`${API_PREFIX}/auth/`)) {
        auth.logout();
        perfil.limpar();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
