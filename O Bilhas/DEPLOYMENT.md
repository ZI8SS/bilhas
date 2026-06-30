# Deployment

## Opção Recomendada Agora

Para o primeiro deploy público:

```text
Vercel Hobby + Supabase Free + subdomínio gratuito
```

Resultado esperado:

```text
https://bilhas.vercel.app
```

ou parecido, dependendo do nome disponível no Vercel.

## O Que Precisa De Conta/Login

Eu consigo preparar tudo localmente, mas para criar recursos externos é preciso login/autorização:

- GitHub: repo para o código;
- Vercel: projeto e subdomínio gratuito;
- Supabase: projeto PostgreSQL gratuito.

## Deploy Rápido Sem DB

Isto serve só para mostrar a app com dados mockados.

Variável no Vercel:

```text
ALLOW_MOCK_DATA=true
```

Não usar isto como produção real.

## Deploy Com Supabase

1. Criar projeto Supabase.
2. Copiar a connection string PostgreSQL.
3. Configurar variáveis na Vercel:

```text
DATABASE_URL=postgres://...
DATABASE_SSL=true
ALLOW_MOCK_DATA=false
```

4. Correr migrations:

```bash
DATABASE_URL="postgres://..." DATABASE_SSL=true pnpm db:migrate
DATABASE_URL="postgres://..." DATABASE_SSL=true pnpm db:seed
```

5. Fazer redeploy na Vercel.

## Vercel Settings

Se o repo GitHub tiver a pasta `O Bilhas` dentro de `ZIBS`, configurar:

```text
Root Directory: O Bilhas
Framework Preset: Next.js
Install Command: pnpm install
Build Command: pnpm build
Output Directory: .next
```

## Healthcheck

Depois do deploy:

```text
/api/health
```

Respostas esperadas:

```json
{ "ok": true, "database": "mock" }
```

ou:

```json
{ "ok": true, "database": "postgres" }
```

## Próxima Fase

Quando começarmos workers:

- Render/Railway ficam mais práticos;
- ou Hetzner VPS com Docker Compose para controlo total;
- Vercel continua possível para o frontend, mas os workers devem viver noutro serviço.
