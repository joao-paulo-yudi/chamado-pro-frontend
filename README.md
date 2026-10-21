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
   de API para o backend. Assim o navegador fala só com uma origem e não é preciso liberar CORS.

## Build de produção

```bash
npm run build
```

Os arquivos ficam em `dist/chamado-pro-frontend/browser` e são servidos pelo NGINX
(`nginx.conf`), que também faz o proxy para a API e envia os cabeçalhos de segurança
(CSP, HSTS, X-Frame-Options etc.). Veja o `Dockerfile`.

## Antes de publicar

- Preencha os dados da empresa em `src/app/shared/business-info.ts` (razão social, CNPJ,
  endereço, contatos e encarregado de dados). Eles aparecem no rodapé e nas políticas.
- Se alterar os textos de Termos de Uso ou Política de Privacidade, atualize `LEGAL_VERSION`
  nesse arquivo **e** `app.legal.versao-termos` no backend: todos os usuários terão que aceitar de novo.

Veja também [SECURITY.md](SECURITY.md) e [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
