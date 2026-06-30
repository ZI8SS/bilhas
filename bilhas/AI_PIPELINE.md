# Pipeline AI Do Bilhas

## Decisao Principal

O produto em producao nao deve depender de ter o Codex aberto no servidor.

Codex serve para:

- desenvolver o produto;
- fazer manutencao via SSH;
- ajudar em deploys, debugging, migrations e operacao;
- correr automacoes tecnicas ou CI quando fizer sentido.

A geracao de comentarios do Bilhas deve ser uma funcionalidade normal da app, usando API de LLM a partir de workers controlados por nos.

## Fluxo Ao Vivo

```text
API de futebol
   |
Ingestion worker
   |
PostgreSQL + Redis/queue
   |
AI comment worker
   |
ai_suggestions
   |
Redacao aprova/edita
   |
bilhas_comments
   |
Site/App atualiza em tempo real
```

## Passo A Passo

1. Worker de dados consulta a API de futebol a cada 10-30 segundos durante jogos ativos.
2. Eventos novos sao normalizados e gravados em `match_events`.
3. Cada evento relevante cria um job: golo, VAR, cartao, expulsao, penalti, frango assinalado pela redacao, intervalo e fim.
4. AI worker recebe o job, monta contexto e pede sugestoes ao modelo.
5. O modelo devolve JSON estruturado com 3-5 sugestoes, intensidade, risco e motivo.
6. Guardamos tudo em `ai_suggestions`.
7. A Redacao recebe as sugestoes em tempo real.
8. Editor aprova/edita uma frase.
9. A frase publicada entra em `bilhas_comments`.
10. Site e app recebem atualizacao por SSE/WebSocket.

## Primeiro Modo De Publicacao

No inicio, a AI nao publica sozinha.

Modo recomendado:

```text
AI sugere -> humano aprova -> publica
```

Depois, podemos testar auto-publicacao controlada:

```text
AI sugere -> safety check -> regras editoriais -> publica se risco baixo
```

Mesmo nesse modo, tudo deve ficar com audit log.

## Contexto Enviado A AI

```json
{
  "match": "Benfica vs Vitoria SC",
  "minute": "73'",
  "score": "2-1",
  "event_type": "goal",
  "player": "Bruno Varela",
  "event_description": "Bruno Varela deixa escapar um remate defensavel.",
  "previous_comments": [
    "Jota Silva empata. Canto bem batido..."
  ],
  "tone": "medio",
  "allowed_references": ["futebol", "cinema", "televisao", "comida", "vida portuguesa"],
  "blocked_topics": ["racismo", "xenofobia", "homofobia", "misoginia", "deficiencia", "doenca", "tragedias reais", "familia", "desejo de lesoes"]
}
```

## Output Esperado

```json
{
  "suggestions": [
    {
      "text": "Bruno Varela fez uma defesa em diferido. Infelizmente, a bola estava em direto.",
      "intensity": "forte",
      "risk": "low",
      "publishable": true,
      "notes": "Critica o lance, nao a pessoa fora do contexto."
    }
  ]
}
```

## Infra Recomendada

Para uma EC2 inicial:

- Next.js app;
- worker de ingestion;
- worker AI;
- PostgreSQL, idealmente RDS;
- Redis/Valkey para filas e pub/sub;
- Nginx ou ALB;
- Cloudflare;
- Sentry;
- Prometheus/Grafana/Loki numa fase seguinte.

Melhor separacao:

```text
web        -> serve site/admin/API
worker-api -> consulta API de futebol
worker-ai  -> gera sugestoes
postgres   -> dados persistentes
redis      -> filas/cache/live updates
```

## Seguranca

- `OPENAI_API_KEY` apenas no servidor/worker, nunca no browser.
- Secrets em AWS Secrets Manager, SSM Parameter Store ou ficheiro `.env` protegido em MVP.
- Rate limiting por jogo/evento.
- Guardar prompt, output e decisao editorial para auditoria.
- Nunca auto-publicar conteudo de risco alto.
- Logs sem tokens nem dados sensiveis.

## Codex No Servidor

Podemos usar Codex via SSH para operacao e manutencao, mas nao como motor runtime dos comentarios.

Exemplos onde Codex faz sentido:

- diagnosticar logs;
- corrigir deploy;
- escrever migrations;
- atualizar prompts;
- rever incidentes;
- preparar scripts;
- automatizar tarefas tecnicas.

Para gerar comentarios em direto, usar API de LLM diretamente no worker.
