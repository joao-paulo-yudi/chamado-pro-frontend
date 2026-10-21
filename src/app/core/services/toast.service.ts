import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  tipo: ToastTipo;
  mensagem: string;
}

/** Mensagens rápidas de retorno (substitui `alert()`), exibidas pelo ToastContainerComponent. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  success(mensagem: string) {
    this.mostrar('success', mensagem);
  }

  error(mensagem: string) {
    this.mostrar('error', mensagem, 7000);
  }

  info(mensagem: string) {
    this.mostrar('info', mensagem);
  }

  warning(mensagem: string) {
    this.mostrar('warning', mensagem, 6000);
  }

  fechar(id: number) {
    this.toasts.update(lista => lista.filter(t => t.id !== id));
  }

  private mostrar(tipo: ToastTipo, mensagem: string, duracao = 4000) {
    const id = ++this.seq;
    this.toasts.update(lista => [...lista.slice(-3), { id, tipo, mensagem }]);
    setTimeout(() => this.fechar(id), duracao);
  }
}

/** Extrai uma mensagem legível de um erro HTTP do backend. */
export function mensagemDeErro(err: unknown, padrao: string): string {
  const e = err as { error?: { message?: string; error?: string } | string } | null;
  if (e && typeof e.error === 'object' && e.error) {
    return e.error.message || e.error.error || padrao;
  }
  return padrao;
}
