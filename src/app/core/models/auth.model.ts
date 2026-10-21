export type Role = 'ADMIN' | 'TECNICO' | 'CLIENTE';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface TokenResponse {
  token: string;
  type: string;
}

export interface DecodedToken {
  sub: string;
  role: Role;
  exp: number;
  iat: number;
  [key: string]: unknown;
}
