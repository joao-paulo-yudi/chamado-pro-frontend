import { Pipe, PipeTransform } from '@angular/core';
import { EnumKind, enumMeta } from '@core/constants/chamado.constants';

/** Rótulo legível de um valor de enum: `{{ c.status | label: 'status' }}` -> "Em andamento". */
@Pipe({ name: 'label', standalone: true })
export class LabelPipe implements PipeTransform {
  transform(value: string | null | undefined, kind: EnumKind, vazio = '—'): string {
    return enumMeta(kind, value)?.label ?? vazio;
  }
}
