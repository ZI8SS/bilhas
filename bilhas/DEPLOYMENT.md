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

Isto serve para mostrar a app sem Supabase. Neste modo a app tenta usar a fonte externa do Mundial e cai para dados demo se a fonte falhar.

Variáveis no Vercel:

```text
ALLOW_MOCK_DATA=true
WORLD_CUP_SOURCE=enabled
```

Não usar isto como produção real de longo prazo, porque não guarda cache, histórico editorial nem comentários editados.

## Deploy Com Supabase

1. Criar projeto Supabase.
2. Copiar a connection string PostgreSQL.
3. Configurar variáveis na Vercel:

```text
DATABASE_URL=postgres://...
DATABASE_SSL=true
ALLOW_MOCK_DATA=false
WORLD_CUP_SOURCE=enabled
SYNC_SECRET=um_valor_longo_aleatorio
```

4. Correr migrations:

```bash
DATABASE_URL="postgres://..." DATABASE_SSL=true pnpm db:migrate
```

5. Fazer redeploy na Vercel.
6. Sincronizar o Mundial para a base:

```bash
curl -X POST \
  -H "Authorization: Bearer $SYNC_SECRET" \
  https://bilhas.vercel.app/api/sync/worldcup
```

Depois disto, `/api/health` deve indicar `database: "postgres"` e a app deve ler da base de dados.

## Vercel Settings

Se o repo GitHub tiver a pasta `bilhas` dentro de `ZIBS`, configurar:

```text
Root Directory: bilhas
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
{ "ok": true, "database": "none", "source": "worldcup-api" }
```

ou:

```json
{ "ok": true, "database": "postgres", "source": "database" }
```

## Próxima Fase

Quando começarmos workers:

- Render/Railway ficam mais práticos;
- ou Hetzner VPS com Docker Compose para controlo total;
- Vercel continua possível para o frontend, mas os workers devem viver noutro serviço.
