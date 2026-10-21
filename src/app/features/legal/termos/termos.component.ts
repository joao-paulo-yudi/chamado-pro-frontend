import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUSINESS_INFO, LEGAL_VERSION } from '@core/constants/business-info';

@Component({
  selector: 'app-termos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './termos.component.html',
  host: { class: 'legal-prose' },
})
export class TermosUsoComponent {
  protected readonly info = BUSINESS_INFO;
  protected readonly versao = LEGAL_VERSION;
}
