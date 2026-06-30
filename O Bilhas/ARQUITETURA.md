# Arquitetura Inicial

## Principios

- API-first para permitir web, PWA e app no futuro.
- Dados de jogos vindos de API externa, nao scraping.
- Comentarios humoristicos como camada proprietaria.
- AI assistida por editor humano no inicio.
- Observabilidade e backups desde cedo.

## Stack Sugerida Para MVP

- Frontend: Next.js
- Backend: Next.js API routes ou Fastify/NestJS
- Base de dados: PostgreSQL
- Cache/live state: Redis
- Jobs/filas: BullMQ ou Redis Streams
- Observabilidade: Grafana, Prometheus, Loki, Sentry
- CDN/WAF: Cloudflare
- AI: OpenAI API ou outro LLM configuravel

## Fluxo De Dados

```text
API Futebol
   |
Ingestion Worker
   |
PostgreSQL + Redis
   |
Backend API
   |
Web / PWA / App
```

## Fluxo Editorial

```text
Evento do jogo
   |
Contexto preparado para AI, incluindo jogador principal quando existir
   |
AI sugere comentarios
   |
Editor aprova ou edita
   |
Comentario publicado
   |
Link/card partilhavel
```

## Dados De Jogadores

No MVP real, nomes de jogadores devem vir da API de dados desportivos quando o evento tiver essa informacao.

Exemplos:

- golo: marcador e assistente;
- cartao: jogador sancionado;
- substituicao: jogador que entra e jogador que sai;
- penalti/VAR: jogador envolvido quando disponivel;
- frango ou erro: pode exigir input editorial, porque nem sempre a API classifica "erro do guarda-redes".

Fallback: se a API nao trouxer nome suficiente, a redacao pode preencher manualmente no painel antes de pedir sugestoes a AI.

## Observabilidade

Comecar com:

- Prometheus: metricas de app, workers, API externa, latencia;
- Grafana: dashboards;
- Loki: logs aplicacionais;
- Sentry: erros frontend/backend;
- uptime monitor externo.

Kafka e ELK ficam para uma fase posterior, se o volume justificar. Para o MVP, Redis Streams ou BullMQ devem chegar.

## Seguranca

Minimo desde o inicio:

- HTTPS obrigatorio;
- WAF e rate limiting;
- admin com 2FA;
- roles e permissoes;
- audit log;
- sanitizacao de conteudo;
- protecao XSS;
- secrets fora do repositorio;
- backups automaticos;
- teste de restore;
- staging separado.
