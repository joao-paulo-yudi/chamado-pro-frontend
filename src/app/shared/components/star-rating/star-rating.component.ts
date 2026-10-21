import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/** Avaliação de 1 a 5 estrelas, como grupo de rádios (teclado: setas). Somente leitura com `readonly`. */
@Component({
  selector: 'app-star-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (readonly()) {
      <span class="stars" role="img" [attr.aria-label]="(valor() || 0) + ' de 5 estrelas'">
        @for (n of estrelas; track n) {
          <i class="fa-star" [class.fa-solid]="n <= (valor() || 0)" [class.fa-regular]="n > (valor() || 0)" aria-hidden="true"></i>
        }
      </span>
    } @else {
      <fieldset class="stars stars--input">
        <legend class="sr-only">{{ rotulo() }}</legend>
        @for (n of estrelas; track n) {
          <label [title]="n + (n === 1 ? ' estrela' : ' estrelas')">
            <input type="radio" [name]="nome()" [value]="n" [checked]="valor() === n" (change)="valor.set(n)" />
            <span class="sr-only">{{ n }} {{ n === 1 ? 'estrela' : 'estrelas' }}</span>
            <i class="fa-star" [class.fa-solid]="n <= (valor() || 0)" [class.fa-regular]="n > (valor() || 0)" aria-hidden="true"></i>
          </label>
        }
      </fieldset>
    }
  `,
  styles: `
    .stars {
      display: inline-flex;
      gap: 2px;
      margin: 0;
      padding: 0;
      border: none;
    }
    .stars i {
      color: #f5a524;
    }
    .stars i.fa-regular {
      color: var(--border-strong);
    }
    .stars--input label {
      position: relative;
      padding: 2px;
      cursor: pointer;
    }
    .stars--input i {
      font-size: 1.5rem;
      transition: transform var(--transition);
    }
    .stars--input label:hover i {
      transform: scale(1.12);
    }
    .stars--input input {
      position: absolute;
      opacity: 0;
    }
    .stars--input input:focus-visible ~ i {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
      border-radius: 4px;
    }
  `,
})
export class StarRatingComponent {
  readonly valor = model<number | null>(null);
  readonly readonly = input(false);
  readonly nome = input('avaliacao');
  readonly rotulo = input('Avaliação');
  protected readonly estrelas = [1, 2, 3, 4, 5];
}
