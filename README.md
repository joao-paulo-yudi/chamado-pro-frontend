# ChamadoPro - Frontend

Aplicação Angular 17 (standalone components) do ChamadoPro.

## Como rodar em desenvolvimento

1. Instale as dependências (versões fixadas no `package-lock.json`):
   ```bash
   npm ci
   ```
2. Suba o backend em `http://localhost:8080` (veja o README do backend).
3. Rode o frontend:
   ```bash
   npm start
   ```
   O `npm start` usa `ng serve --proxy-config proxy.conf.json`, que encaminha as chamadas
   `/api/*` para o backend (removendo o prefixo `/api`). Assim o navegador fala só com uma origem e não é preciso liberar CORS.

## Estrutura de pastas

Componentes standalone, organizados por responsabilidade (padrão do Angular Style Guide).
Os imports usam os aliases `@core`, `@shared`, `@layout` e `@features` (veja `tsconfig.json`).

```
src/
├── styles.css              # importa os estilos globais abaixo
├── styles/                 # design system: tokens (cores da marca), base, componentes, páginas legais
└── app/
    ├── app.config.ts       # providers (router, HTTP, interceptor, título, locale pt-BR)
    ├── app.routes.ts       # rotas raiz: login, consentimento, páginas legais e área autenticada
    ├── core/               # singletons usados no app todo
    │   ├── auth/           # AuthService, guards (auth, role, home, guest) e interceptor
    │   ├── constants/      # dados da empresa e rótulos/tons de status, prioridade, SLA...
    │   ├── models/         # interfaces da API
    │   └── services/       # API, perfil, toasts, diálogo de confirmação, consentimento de cookies
    ├── layout/             # moldura da área logada: main-layout, sidebar e topbar
    ├── shared/             # componentes e pipes reutilizáveis (badges, estados vazios, estrelas...)
    └── features/           # uma pasta por funcionalidade, com rotas e serviços próprios
        ├── auth/           # login
        ├── chamados/       # lista, detalhe (conversa e histórico) e abertura de chamado
        ├── conta/          # consentimento e "Meus dados"
        ├── dashboard/      # painel do administrador
        ├── legal/          # políticas e termos (com layout próprio)
        ├── notificacoes/   # sino de notificações
        ├── sla/            # configuração de SLA
        └── usuarios/       # lista e formulário (cadastro/edição) de usuários
```

Rotas principais: `/dashboard`, `/chamados`, `/chamados/novo`, `/chamados/:id`, `/usuarios`,
`/usuarios/novo`, `/usuarios/:id/editar`, `/sla` e `/meus-dados`. Os endereços antigos
(`/detalhe/:id`, `/meus-chamados`, `/chamados-pendentes`, `/novo`, `/sla-config`) redirecionam para os novos.

## Build de produção

```bash
npm run build
```

Os arquivos ficam em `dist/chamado-pro-frontend/browser` e são servidos pelo NGINX
(`nginx.conf`), que também faz o proxy para a API e envia os cabeçalhos de segurança
(CSP, HSTS, X-Frame-Options etc.). Veja o `Dockerfile`.

## Antes de publicar

- Preencha os dados da empresa em `src/app/core/constants/business-info.ts` (razão social, CNPJ,
  endereço, contatos e encarregado de dados). Eles aparecem nas políticas e nos termos.
- Se alterar os textos de Termos de Uso ou Política de Privacidade, atualize `LEGAL_VERSION`
  nesse arquivo **e** `app.legal.versao-termos` no backend: todos os usuários terão que aceitar de novo.

Veja também [SECURITY.md](SECURITY.md) e [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
