import { Pipe, PipeTransform } from '@angular/core';

const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

const formatador = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

/** Tempo relativo: "há 5 minutos", "ontem", "em 2 horas". Use junto com a data completa em `title`. */
@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe implements PipeTransform {
  transform(valor: string | Date | null | undefined, vazio = '—'): string {
    if (!valor) return vazio;
    const data = valor instanceof Date ? valor : new Date(valor);
    if (isNaN(data.getTime())) return vazio;

    const segundos = Math.round((data.getTime() - Date.now()) / 1000);
    for (const [unidade, tamanho] of UNIDADES) {
      if (Math.abs(segundos) >= tamanho) {
        return formatador.format(Math.round(segundos / tamanho), unidade);
      }
    }
    return 'agora mesmo';
  }
}
