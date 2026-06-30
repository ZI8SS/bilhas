# Hosting E Dominios

Pesquisa feita em 2026-06-30.

## Recomendacao Curta

Para validar:

- Web: Vercel Hobby ou Render Free;
- DB: Supabase Free ou Render Postgres Free/Trial;
- Dominio: usar subdominio gratuito no inicio;
- Dominio proprio: comprar `.pt` ou `.com` quando o nome estiver decidido.

Para primeira producao barata:

- Hetzner VPS pequeno ou Railway/Render pago;
- PostgreSQL gerido se o orcamento permitir;
- Cloudflare para DNS, SSL, CDN e WAF.

## Opcoes Gratuitas/Baratas

### Vercel

Bom para Next.js e demos.

- Hobby: $0/mo;
- Pro: $20/mo;
- excelente para frontend/Next.js;
- nao e ideal sozinho para workers long-running e filas.

Uso recomendado:

- demo publica;
- landing/MVP inicial;
- frontend ligado a Supabase/DB externa.

### Render

Bom para app + serviços simples.

- tem free web services, Postgres e key-value com limites;
- docs avisam que free nao e para producao;
- planos pagos simples quando precisarmos de always-on.

Uso recomendado:

- MVP completo barato;
- web service + worker;
- migrar para plano pago se houver uso real.

### Railway

Muito bom para developer experience.

- trial de 30 dias com creditos;
- depois modelo de uso/pago;
- facil para app + Postgres + Redis;
- pode ficar caro se deixarmos tudo sempre ligado sem controlo.

Uso recomendado:

- prototipagem rapida;
- staging;
- producao inicial se aceitarmos custos variaveis.

### Supabase

Bom para Postgres gerido.

- free tier com limites;
- Pro começa nos $25/mo;
- bom para DB gerida, auth e realtime;
- pode ser combinado com Vercel.

Uso recomendado:

- DB inicial gerida;
- evitar gerir Postgres no primeiro deploy.

### Hetzner

Bom custo/controlo.

- VPS baratos;
- mais DevOps;
- bom para Docker Compose com web, workers, Postgres e Redis;
- backups e seguranca ficam mais a nosso cargo.

Uso recomendado:

- producao barata com controlo total;
- quando quisermos meter Grafana/Loki/Prometheus sem pagar SaaS.

### AWS EC2/RDS

Bom se quisermos ficar no ecossistema AWS.

- novos free tiers/creditos dependem da conta;
- EC2 + RDS pode deixar de ser barato rapidamente;
- excelente para crescer, mas exige controlo de custos.

Uso recomendado:

- quando a infra for mais seria;
- se quisermos RDS, SSM, Secrets Manager, CloudWatch, ALB.

## Dominio

Evitar depender de "dominio gratuito" para algo serio. Normalmente vem com problemas:

- pouca confianca;
- renovacoes estranhas;
- risco de perder o dominio;
- ma percecao para marca.

Melhor abordagem:

1. usar subdominio gratuito primeiro:
   - `bilhas.vercel.app`;
   - `bilhas.onrender.com`;
   - `bilhas.up.railway.app`.
2. quando o nome estiver validado, comprar dominio proprio.

Possiveis nomes a verificar:

- `bilhas.pt`;
- `obilhas.pt`;
- `bilhas.com`;
- `obilhas.com`;
- `bilhas.app`.

`dig` local nao encontrou DNS ativo para estes nomes em 2026-06-30, mas isso nao garante disponibilidade. Confirmar no registrar antes de decidir.

## Registar Dominio

Opcoes:

- Cloudflare Registrar: bom para dominios suportados, preco at-cost, DNS/SSL/WAF excelentes;
- Porkbun: `.com` barato e simples;
- DNS.pt/registrars portugueses: melhor para `.pt`;
- Namecheap: bom para promos, mas olhar sempre para preco de renovacao.

Para Portugal, um `.pt` faz sentido se quisermos identidade local. Para produto/app, `.app` tambem e interessante, mas costuma exigir HTTPS e pode ser mais caro.

## Minha Escolha Para bilhas

### Fase Demo

```text
Vercel Hobby + Supabase Free + subdominio gratuito
```

Racional:

- zero/baixo custo;
- deploy simples;
- Next.js fica natural;
- DB gerida;
- bom para mostrar a amigos e testar.

### Fase MVP Com Workers

```text
Render ou Railway com web + worker + Postgres/Redis
```

Racional:

- menos DevOps;
- mais rapido para iterar;
- workers sao mais naturais do que em Vercel puro.

### Fase Producao Controlada

```text
Hetzner VPS + Docker Compose + Cloudflare + backups
```

Racional:

- barato;
- controlo total;
- bom para Grafana/Loki/Prometheus;
- exige mais disciplina DevOps.

## Decisao Recomendada Agora

Nao comprar dominio ainda se ainda vamos testar nomes.

Avancar com:

1. criar repo GitHub;
2. deploy gratuito em Vercel ou Render;
3. Supabase Free para Postgres;
4. testar com amigos;
5. comprar dominio quando o nome estiver fechado.
