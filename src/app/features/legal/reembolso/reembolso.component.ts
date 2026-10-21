import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUSINESS_INFO, LEGAL_VERSION } from '@core/constants/business-info';

@Component({
  selector: 'app-reembolso',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './reembolso.component.html',
  host: { class: 'legal-prose' },
})
export class PoliticaReembolsoComponent {
  protected readonly info = BUSINESS_INFO;
  protected readonly versao = LEGAL_VERSION;
}
