import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUSINESS_INFO, LEGAL_VERSION } from '@core/constants/business-info';

@Component({
  selector: 'app-privacidade',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './privacidade.component.html',
  host: { class: 'legal-prose' },
})
export class PoliticaPrivacidadeComponent {
  protected readonly info = BUSINESS_INFO;
  protected readonly versao = LEGAL_VERSION;
}
