/**
 * Dados do responsável pelo serviço, exibidos nas políticas e nos termos.
 *
 * ATENÇÃO: substitua todos os valores marcados com "preencher" pelos dados
 * reais da empresa antes de publicar em produção (exigência do CDC,
 * Decreto 7.962/2013 e LGPD).
 */
export const BUSINESS_INFO = {
  nomeFantasia: 'ChamadoPro',
  razaoSocial: '[Razão social — preencher]',
  cnpj: '[CNPJ — preencher]',
  endereco: '[Endereço completo — preencher]',
  emailContato: '[contato@seudominio.com.br — preencher]',
  telefone: '[Telefone — preencher]',
  /** Encarregado pelo tratamento de dados pessoais (DPO), art. 41 da LGPD. */
  encarregadoNome: '[Nome do encarregado (DPO) — preencher]',
  encarregadoEmail: '[privacidade@seudominio.com.br — preencher]',
  foro: '[Cidade/UF — preencher]',
};

/**
 * Versão vigente dos Termos de Uso e da Política de Privacidade.
 * Deve ser igual a `app.legal.versao-termos` no backend. Ao alterar os textos,
 * atualize os dois lados: todos os usuários precisarão aceitar de novo.
 */
export const LEGAL_VERSION = '2026-10-21';
export const LEGAL_LAST_UPDATE = '21/10/2026';
