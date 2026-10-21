export interface Notificacao {
  id: number;
  chamadoId?: number;
  chamadoTitulo?: string;
  mensagem: string;
  canal: string;
  status: string;
  lida: boolean;
  dataEnvio: string;
}
