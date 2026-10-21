import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieBannerComponent } from '@shared/components/cookie-banner/cookie-banner.component';
import { ToastContainerComponent } from '@shared/components/toast-container/toast-container.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

/** Raiz da aplicação: os layouts (app, páginas legais, login) são definidos pelas rotas. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CookieBannerComponent, ToastContainerComponent, ConfirmDialogComponent],
  template: `
    <router-outlet />
    <app-toast-container />
    <app-confirm-dialog />
    <app-cookie-banner />
  `,
})
export class AppComponent {}
