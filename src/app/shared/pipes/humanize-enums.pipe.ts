import { Pipe, PipeTransform } from '@angular/core';
import { PRIORIDADE_META, SLA_META, STATUS_META } from '@core/constants/chamado.constants';

const ROTULOS: Record<string, string> = Object.fromEntries(
  [STATUS_META, PRIORIDADE_META, SLA_META].flatMap(meta => Object.entries(meta).map(([k, v]) => [k, v.label]))
);
const PADRAO = new RegExp(`\\b(${Object.keys(ROTULOS).join('|')})\\b`, 'g');

/**
 * Troca valores de enum escritos pelo backend em textos livres (histórico,
 * notificações) por rótulos legíveis: "mudou para EM_ANDAMENTO" -> "mudou para Em andamento".
 */
@Pipe({ name: 'humanizeEnums', standalone: true })
export class HumanizeEnumsPipe implements PipeTransform {
  transform(texto: string | null | undefined): string {
    return (texto ?? '').replace(PADRAO, valor => ROTULOS[valor]);
  }
}
