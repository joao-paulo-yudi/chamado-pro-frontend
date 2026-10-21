import { Role } from './auth.model';
import { Nivel } from './chamado.model';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  tipoUsuario: Role;
  nivelTecnico?: Nivel | null;
  telefone?: string | null;
  whatsappApiKey?: string | null;
  consentimentoWhatsapp?: boolean;
}

export type UsuarioRequest = Omit<Usuario, 'id' | 'consentimentoWhatsapp'>;

/** Dados mínimos de um técnico (GET /usuarios/tecnicos). */
export interface TecnicoResumo {
  id: number;
  nome: string;
  nivelTecnico?: Nivel | null;
}
