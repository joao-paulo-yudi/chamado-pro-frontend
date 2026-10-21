import { Pipe, PipeTransform } from '@angular/core';

const CONECTORES = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);

/** Iniciais para avatares: "Maria da Silva" -> "MS". */
@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(nome: string | null | undefined): string {
    const partes = (nome ?? '')
      .trim()
      .split(/\s+/)
      .filter(p => p && !CONECTORES.has(p.toLowerCase()));
    if (!partes.length) return '?';
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (partes[0][0] + ultima).toUpperCase();
  }
}
