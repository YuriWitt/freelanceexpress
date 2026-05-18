# Freelance Express

Projeto com frontend estatico (GitHub Pages) + backend Node.js/Express para envio de contatos por e-mail.

## Arquitetura de publicacao

- Frontend: GitHub Pages (HTML/CSS/JS)
- Backend: servidor Node externo (Render, Railway ou similar)
- Formulario: envia para `POST /api/contact`

## Recursos de seguranca do backend

- `helmet` para headers HTTP de protecao
- CORS por allowlist (`ALLOWED_ORIGINS`)
- Rate limit global e rate limit especifico no formulario
- Validacao server-side de todos os campos
- Honeypot anti-bot (`company`)
- Limite de payload JSON (`20kb`)
- `x-powered-by` desabilitado

## Como rodar localmente

1. Instale dependencias:

```bash
npm install
```

2. Crie seu `.env` local:

```bash
copy .env.example .env
```

3. Preencha as variaveis no `.env` (SMTP e CORS).

4. Inicie:

```bash
npm start
```

5. Acesse:

```bash
http://localhost:3000
```

6. Verifique saude da API:

```bash
http://localhost:3000/api/health
```

## Variaveis de ambiente

Use `.env.example` como referencia:

- `NODE_ENV`
- `PORT`
- `TRUST_PROXY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `CONTACT_EMAIL`
- `ALLOWED_ORIGINS` (lista separada por virgula)

Exemplo de `ALLOWED_ORIGINS`:

```env
ALLOWED_ORIGINS=https://seu-usuario.github.io,https://www.seudominio.com
```

## Configurando URL do backend no frontend

Edite `config.js`:

```js
window.__APP_CONFIG__ = {
  apiBaseUrl: 'https://seu-backend.onrender.com',
};
```

Para ambiente local com frontend e backend no mesmo host, pode deixar vazio:

```js
window.__APP_CONFIG__ = {
  apiBaseUrl: '',
};
```

## Deploy do frontend no GitHub Pages

Este repositorio ja possui workflow em `.github/workflows/deploy.yml` para publicar automaticamente ao fazer push em `main`/`master`.

Passos:

1. Suba o repositorio no GitHub.
2. Em `Settings > Pages`, confirme que o deploy esta usando GitHub Actions.
3. Aguarde o workflow concluir.
4. Seu site ficara em `https://seu-usuario.github.io/seu-repo` (ou dominio customizado).

## Deploy do backend (Node) no Render

1. Crie uma Web Service no Render conectando este repositorio.
2. Configure:
- Build Command: `npm install`
- Start Command: `npm start`
3. Adicione as variaveis de ambiente do `.env.example`.
4. Em `ALLOWED_ORIGINS`, inclua a URL publica do seu GitHub Pages.
5. Copie a URL final do backend (`https://...onrender.com`) e cole em `config.js`.

## Checklist de seguranca antes de publicar

- Nunca subir `.env` com credenciais reais.
- Usar senha de app SMTP (nao senha principal da conta).
- Definir `ALLOWED_ORIGINS` com seus dominios reais.
- Revisar logs do provedor para tentativas de abuso.
- Rotacionar imediatamente credenciais antigas, se ja foram expostas.

## Observacao importante

GitHub Pages NAO executa backend Node.js. Ele publica somente arquivos estaticos. Por isso o backend precisa ficar em um servidor Node separado.
