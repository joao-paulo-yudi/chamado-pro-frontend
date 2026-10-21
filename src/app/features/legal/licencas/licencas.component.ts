import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BUSINESS_INFO, LEGAL_VERSION } from '@core/constants/business-info';

@Component({
  selector: 'app-licencas',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './licencas.component.html',
  host: { class: 'legal-prose' },
})
export class LicencasComponent {
  protected readonly info = BUSINESS_INFO;
  protected readonly versao = LEGAL_VERSION;
}
