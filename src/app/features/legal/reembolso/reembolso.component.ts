import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LegalShellComponent } from '../legal-shell/legal-shell.component';
import { BUSINESS_INFO, LEGAL_VERSION } from '../../../shared/business-info';

@Component({
  selector: 'app-reembolso',
  standalone: true,
  imports: [LegalShellComponent, RouterLink],
  templateUrl: './reembolso.component.html',
})
export class PoliticaReembolsoComponent {
  info = BUSINESS_INFO;
  versao = LEGAL_VERSION;
}
