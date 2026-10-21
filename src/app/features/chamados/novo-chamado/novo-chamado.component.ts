import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Categoria, Prioridade } from '@core/models';
import {
  CATEGORIA_META,
  CATEGORIA_OPCOES,
  PRIORIDADE_META,
  PRIORIDADE_OPCOES,
  sugerirPrioridade,
} from '@core/constants/chamado.constants';
import { ToastService, mensagemDeErro } from '@core/services/toast.service';
import { ChamadosService } from '../services/chamados.service';

@Component({
  selector: 'app-novo-chamado',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './novo-chamado.component.html',
  styleUrl: './novo-chamado.component.css',
})
export class NovoChamadoComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly chamados = inject(ChamadosService);
  private readonly toast = inject(ToastService);

  protected readonly categorias = CATEGORIA_OPCOES;
  protected readonly categoriaMeta = CATEGORIA_META;
  protected readonly prioridades = PRIORIDADE_OPCOES;
  protected readonly prioridadeMeta = PRIORIDADE_META;

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(200)]],
    descricao: ['', [Validators.required, Validators.maxLength(5000)]],
    categoria: this.fb.control<Categoria | null>(null),
    prioridade: this.fb.control<Prioridade>('MEDIA'),
  });

  protected readonly enviando = signal(false);
  /** Enquanto o usuário não escolher a prioridade, ela acompanha a sugestão da categoria. */
  protected readonly prioridadeManual = signal(false);
  protected readonly descricaoValor = toSignal(this.form.controls.descricao.valueChanges, { initialValue: '' });

  constructor() {
    this.form.controls.categoria.valueChanges.subscribe(categoria => {
      if (!this.prioridadeManual()) {
        this.form.controls.prioridade.setValue(sugerirPrioridade(categoria));
      }
    });
  }

  escolherPrioridade(p: Prioridade) {
    this.prioridadeManual.set(true);
    this.form.controls.prioridade.setValue(p);
  }

  sugestao(): Prioridade {
    return sugerirPrioridade(this.form.controls.categoria.value);
  }

  invalido(campo: 'titulo' | 'descricao'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  enviar() {
    const { titulo, descricao, categoria, prioridade } = this.form.getRawValue();
    this.form.controls.titulo.setValue(titulo.trim());
    this.form.controls.descricao.setValue(descricao.trim());
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    this.enviando.set(true);
    this.chamados
      .criar({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria: categoria ?? undefined,
        prioridade,
      })
      .subscribe({
        next: chamado => {
          this.toast.success(`Chamado #${chamado.id} aberto com sucesso.`);
          this.router.navigate(['/chamados', chamado.id]);
        },
        error: err => {
          this.enviando.set(false);
          this.toast.error(mensagemDeErro(err, 'Não foi possível abrir o chamado. Tente novamente.'));
        },
      });
  }
}
