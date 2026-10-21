# Segurança, privacidade e acessibilidade — ChamadoPro Frontend

## Segurança

| Item | Situação |
|---|---|
| Content-Security-Policy | `nginx.conf` restringe scripts, estilos, fontes, imagens e conexões à própria origem; `frame-ancestors 'none'` |
| Outros cabeçalhos | HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, `server_tokens off` |
| Recursos de terceiros | Font Awesome agora é empacotado localmente (antes vinha do cdnjs, o que enviava o IP dos usuários a um terceiro e não tinha verificação de integridade) |
| Proxy da API | Corrigido: `/notificacoes`, `/sla-config` e `/dashboard` não estavam no `nginx.conf` e falhavam em produção |
| Sessão | Interceptor só envia o token para a própria API; em resposta 401 a sessão local é encerrada e o usuário volta ao login |
| Dados expostos | A tela não baixa mais a lista de todos os usuários (com e-mails e telefones) para descobrir o próprio id: usa `GET /usuarios/me`. A lista de técnicos usa um endpoint com id, nome e nível apenas |
| Vazamento em console | Removido `console.log` que registrava o formulário de login, **incluindo a senha** |
| Autor de comentários | Não é mais enviado pelo navegador (era possível comentar em nome de outra pessoa) |
| Build | `npm ci` com lockfile; imagem NGINX atualizada para 1.27; arquivos ocultos (`.env`, `.git`) bloqueados |
| Arquivo morto | Removido `vite.config.ts`, que referenciava um pacote não instalado |

### Limitação conhecida

O token JWT fica no `localStorage`. Com a CSP restritiva o risco de roubo por XSS é baixo, mas a
alternativa mais segura é um cookie `HttpOnly; Secure; SameSite=Strict` emitido pelo backend,
o que exige proteção CSRF. Recomendado como próxima etapa.

## Privacidade (LGPD) e transparência

- Páginas públicas: Política de Privacidade (`/privacidade`), Termos de Uso (`/termos`),
  Política de Cookies (`/cookies`), Política de Reembolso (`/reembolso`) e Licenças (`/licencas`).
- **Banner de cookies**: informa que só há armazenamento essencial; "Aceitar" e "Rejeitar" com o
  mesmo destaque; categorias opcionais desmarcadas; escolha reabrível pelo rodapé. Scripts não
  essenciais futuros devem checar `CookieConsentService.permitido('analiticos')`.
- **Consentimento nos formulários**: no primeiro acesso (e a cada nova versão dos termos) o usuário
  precisa aceitar Termos + Privacidade. O consentimento de WhatsApp é separado, opcional e vem desmarcado.
- **Meus dados** (`/meus-dados`): ver dados e consentimentos, ativar/desativar WhatsApp, exportar
  dados em JSON e excluir a conta.
- **Dados mínimos**: o formulário de chamado orienta a não incluir dados sensíveis; o admin só cadastra
  telefone/API Key se o usuário pedir.
- **Dados da empresa** no rodapé e nas políticas (`src/app/shared/business-info.ts` — preencher).

### Revisão de padrões enganosos, taxas e afirmações

- Dark patterns: nenhuma caixa pré-marcada; recusar é tão fácil quanto aceitar; exclusão de conta
  acessível pelo próprio usuário.
- Taxas ocultas: o sistema não faz cobranças; a Política de Reembolso deixa isso explícito.
- Afirmações sem suporte removidas da documentação: "Vite" (o projeto usa Angular CLI), credencial
  `admin123` e instruções de configuração do CallMeBot que não existiam no código; os prazos de SLA
  são descritos como metas, não garantias.

## Acessibilidade (WCAG 2.1 AA)

- `lang="pt-BR"`, `meta viewport`, título da página atualizado a cada rota.
- Link "Pular para o conteúdo"; contorno de foco visível (`:focus-visible`) em todo o app.
- Cards de chamado e notificações operáveis por teclado (Tab + Enter); painel de notificações fecha com Esc.
- Botão de mostrar senha focável (antes tinha `tabindex="-1"`) e com `aria-label`/`aria-pressed`.
- Rótulos associados a todos os campos (`<label for>`), `aria-required`, mensagens de erro com `role="alert"`.
- Texto alternativo: logos com `alt` descritivo; imagem decorativa duplicada com `alt=""`;
  ícones com `aria-hidden`; botões só com ícone ganharam `aria-label`.
- Contraste: `--muted` de #6b7280 (4,4:1 no fundo) para #4b5563 (6,8:1); `--success`, vermelhos,
  cinza dos comentários, bordas de campos (3:1) e barras do dashboard (3:1) ajustados.
- Menu com `aria-current="page"` (o `routerLinkActive` não funcionava por falta de import).
- `prefers-reduced-motion` respeitado.
