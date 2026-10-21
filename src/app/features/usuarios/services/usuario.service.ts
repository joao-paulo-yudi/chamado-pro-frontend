import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  tipoUsuario: string;
  nivelTecnico?: string | null;
  telefone?: string | null;
  whatsappApiKey?: string | null;
  consentimentoWhatsapp?: boolean;
}

/** Dados mínimos de um técnico (GET /usuarios/tecnicos). */
export interface TecnicoResumo {
  id: number;
  nome: string;
  nivelTecnico?: string | null;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly apiUrl = '/usuarios';

  constructor(private api: ApiService) {}

  listar(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>(this.apiUrl);
  }

  /**
   * Lista apenas os usuários técnicos (com seus níveis N1/N2/N3),
   * usado para popular seletores de escalonamento.
   */
  listarTecnicos(): Observable<TecnicoResumo[]> {
    return this.api.get<TecnicoResumo[]>(`${this.apiUrl}/tecnicos`);
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  criar(usuario: { nome: string; email: string; senha: string, tipoUsuario: string, nivelTecnico?: string | null, telefone?: string | null, whatsappApiKey?: string | null }): Observable<Usuario> {
    return this.api.post<Usuario>(this.apiUrl, usuario);
  }

  atualizar(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.api.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  excluir(id: number): Observable<void> {
    return this.api.delete<void>(`${this.apiUrl}/${id}`);
  }
}
