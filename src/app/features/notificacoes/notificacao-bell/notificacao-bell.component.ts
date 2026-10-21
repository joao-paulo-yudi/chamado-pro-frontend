import { Component, DestroyRef, ElementRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, interval, of, startWith, switchMap } from 'rxjs';
import { Notificacao } from '@core/models';
import { HumanizeEnumsPipe } from '@shared/pipes/humanize-enums.pipe';
import { RelativeTimePipe } from '@shared/pipes/relative-time.pipe';
import { NotificacoesService } from '../services/notificacoes.service';

/** Sino de notificações da barra superior, com contador atualizado a cada 30 segundos. */
@Component({
  selector: 'app-notificacao-bell',
  standalone: true,
  imports: [DatePipe, HumanizeEnumsPipe, RelativeTimePipe],
  templateUrl: './notificacao-bell.component.html',
  styleUrl: './notificacao-bell.component.css',
})
export class NotificacaoBellComponent implements OnInit {
  private readonly service = inject(NotificacoesService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly naoLidas = signal(0);
  readonly notificacoes = signal<Notificacao[]>([]);
  readonly carregando = signal(false);
  readonly aberto = signal(false);

  ngOnInit() {
    interval(30000)
      .pipe(
        startWith(0),
        // Silencioso: o usuário pode ainda não ter permissão (ex.: consentimento pendente)
        switchMap(() => this.service.contarNaoLidas().pipe(catchError(() => of(this.naoLidas())))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(count => this.naoLidas.set(count));
  }

  @HostListener('document:keydown.escape')
  fecharComEsc() {
    this.aberto.set(false);
  }

  @HostListener('document:click', ['$event'])
  fecharAoClicarFora(event: MouseEvent) {
    if (this.aberto() && !this.host.nativeElement.contains(event.target as Node)) {
      this.aberto.set(false);
    }
  }

  toggle() {
    this.aberto.update(v => !v);
    if (this.aberto()) {
      this.carregar();
    }
  }

  private carregar() {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: data => {
        this.notificacoes.set(data);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  abrir(n: Notificacao) {
    if (!n.lida) {
      this.service.marcarComoLida(n.id).subscribe({
        next: () => {
          this.notificacoes.update(lista => lista.map(x => (x.id === n.id ? { ...x, lida: true } : x)));
          this.naoLidas.update(v => Math.max(0, v - 1));
        },
      });
    }
    if (n.chamadoId) {
      this.aberto.set(false);
      this.router.navigate(['/chamados', n.chamadoId]);
    }
  }
}
