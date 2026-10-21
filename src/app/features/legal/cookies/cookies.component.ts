import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalShellComponent } from '../legal-shell/legal-shell.component';
import { BUSINESS_INFO, LEGAL_VERSION } from '../../../shared/business-info';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [LegalShellComponent, RouterLink],
  templateUrl: './cookies.component.html',
})
export class PoliticaCookiesComponent {
  info = BUSINESS_INFO;
  versao = LEGAL_VERSION;
}
