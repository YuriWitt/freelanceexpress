# Freelance Express

Site de serviços freelance com backend Node.js e suporte a contato via WhatsApp e e-mail.

## Como usar localmente

1. Instale o Node.js (versão 18 ou superior).
2. Abra o terminal na pasta `c:\Yuri\teste`.
3. Rode:

```bash
npm install
```

4. Copie o arquivo `.env.example` para `.env` e preencha com os dados SMTP:

```bash
copy .env.example .env
```

5. Inicie o servidor:

```bash
npm start
```

6. Acesse:

```bash
http://localhost:3000
```

## Contato do site

- Botão `Abrir WhatsApp` abre o WhatsApp Web com mensagem pronta.
- Botão `Enviar e-mail` abre o cliente de e-mail padrão.
- O formulário de contato também envia a mensagem ao backend para envio por e-mail.

## Publicação na web - GitHub Pages

### Opção 1: GitHub Pages + Domínio personalizado (Recomendado)

1. **Crie um repositório no GitHub:**
   - Vá para [github.com/new](https://github.com/new)
   - Nomeie como `freelanceexpress` ou similar
   - Clique em "Create repository"

2. **Configure Git localmente:**
   ```bash
   git init
   git add .
   git commit -m "Inicial: site freelance"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/freelanceexpress.git
   git push -u origin main
   ```

3. **Ative GitHub Pages:**
   - Vá para Settings > Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Salve

4. **Configure domínio (opcional):**
   - Em Settings > Pages, adicione `freelanceexpress.com`
   - Configure o CNAME no seu registrador de domínio

5. **O site ficará disponível em:**
   - `https://seu-usuario.github.io/freelanceexpress`
   - Ou `https://freelanceexpress.com` (com domínio)

### ⚠️ Observação: Backend não funciona no GitHub Pages

GitHub Pages é apenas para conteúdo estático. O backend Node.js não será executado lá. Isso significa:
- ✅ O site estático (HTML/CSS/JS) funcionará
- ❌ O formulário de contato NÃO enviará e-mails
- ✅ Links WhatsApp e e-mail continuarão funcionando

### Opção 2: Backend em outro servidor

Para manter o backend funcionando, hospede-o em:
- **Vercel** (recomendado): `npm i -g vercel` e `vercel deploy`
- **Render.com**: Conecte o repositório GitHub
- **Railway**: Deploy rápido com Node.js
- **Heroku**: Free tier descontinuado

Então, atualize a URL da API no `script.js` para apontar para seu servidor backend.

## Arquivos importantes

- `robots.txt` — permite indexação nos buscadores
- `sitemap.xml` — mapa do site para SEO
- `.github/workflows/deploy.yml` — deploy automático ao fazer push
