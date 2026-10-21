import { Component, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/auth/auth.service';
import { PerfilService } from '@core/services/perfil.service';
import { ConfirmDialogService } from '@core/services/confirm-dialog.service';
import { ToastService, mensagemDeErro } from '@core/services/toast.service';
import { Comentario } from '@core/models';
import { InitialsPipe } from '@shared/pipes/initials.pipe';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';
import { ComentariosService } from '../../services/comentarios.service';

/** Conversa do chamado entre cliente e equipe de atendimento. */
@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [DatePipe, FormsModule, InitialsPipe, RelativeTimePipe],
  templateUrl: './comentarios.component.html',
  styleUrl: './comentarios.component.css',
})
export class ComentariosComponent {
  private readonly service = inject(ComentariosService);
  private readonly auth = inject(AuthService);
  private readonly perfil = inject(PerfilService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  readonly chamadoId = input.required<number>();
  /** Avisa o pai para recarregar o histórico. */
  readonly alterado = output<void>();

  protected readonly comentarios = signal<Comentario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly enviando = signal(false);
  protected readonly usuarioId = signal<number | null>(null);
  protected novoComentario = '';

  constructor() {
    this.perfil.me().subscribe({ next: p => this.usuarioId.set(p.id) });
    toObservable(this.chamadoId)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.carregar());
  }

  carregar() {
    this.carregando.set(true);
    this.service.listarPorChamado(this.chamadoId()).subscribe({
      next: data => {
        const tempo = (c: Comentario) => new Date(c.dataCriacao ?? 0).getTime();
        this.comentarios.set([...data].sort((a, b) => tempo(a) - tempo(b)));
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  enviar() {
    const texto = this.novoComentario.trim();
    if (!texto || this.enviando()) return;

    this.enviando.set(true);
    this.service.criar(this.chamadoId(), { texto }).subscribe({
      next: novo => {
        this.comentarios.update(lista => [...lista, novo]);
        this.novoComentario = '';
        this.enviando.set(false);
        this.alterado.emit();
      },
      error: err => {
        this.enviando.set(false);
        this.toast.error(mensagemDeErro(err, 'Não foi possível enviar o comentário.'));
      },
    });
  }

  /** Ctrl/Cmd + Enter envia o comentário. */
  atalhoEnviar(event: Event) {
    const e = event as KeyboardEvent;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      this.enviar();
    }
  }

  meu(c: Comentario): boolean {
    return this.usuarioId() !== null && c.autorId === this.usuarioId();
  }

  podeExcluir(c: Comentario): boolean {
    return this.auth.isAdmin() || this.meu(c);
  }

  async excluir(c: Comentario) {
    const ok = await this.confirm.confirmar({
      titulo: 'Excluir comentário?',
      mensagem: 'O comentário será removido da conversa. Esta ação não pode ser desfeita.',
      confirmar: 'Excluir',
      perigo: true,
    });
    if (!ok) return;

    this.service.excluir(c.id).subscribe({
      next: () => {
        this.comentarios.update(lista => lista.filter(x => x.id !== c.id));
        this.toast.success('Comentário excluído.');
      },
      error: err => this.toast.error(mensagemDeErro(err, 'Não foi possível excluir o comentário.')),
    });
  }
}
