import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  titulo: string;
  mensagem: string;
  confirmar?: string;
  cancelar?: string;
  perigo?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  resolver: (ok: boolean) => void;
}

/** Diálogo de confirmação acessível (substitui `confirm()`), exibido pelo ConfirmDialogComponent. */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly estado = signal<ConfirmState | null>(null);

  confirmar(opcoes: ConfirmOptions): Promise<boolean> {
    this.estado()?.resolver(false);
    return new Promise(resolver => this.estado.set({ ...opcoes, resolver }));
  }

  responder(ok: boolean) {
    const atual = this.estado();
    this.estado.set(null);
    atual?.resolver(ok);
  }
}
