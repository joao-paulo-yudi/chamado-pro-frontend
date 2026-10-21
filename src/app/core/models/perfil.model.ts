import { Role } from './auth.model';

/** Dados do usuário autenticado (GET /usuarios/me). */
export interface Perfil {
  id: number;
  nome: string;
  email: string;
  tipoUsuario: Role;
  nivelTecnico?: string | null;
  telefone?: string | null;
  whatsappConfigurado: boolean;
  consentimentoWhatsapp: boolean;
  dataConsentimentoWhatsapp?: string | null;
  versaoTermosAceita?: string | null;
  dataAceiteTermos?: string | null;
  versaoTermosAtual: string;
}

export interface ConsentimentoRequest {
  versaoTermos: string;
  aceiteTermos: boolean;
  consentimentoWhatsapp: boolean;
}
