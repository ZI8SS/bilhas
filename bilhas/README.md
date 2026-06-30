# O Bilhas

Produto em exploracao: live score portugues com comentarios humoristicos ao vivo durante jogos de futebol.

## Ideia

Quando acontece um golo, frango, expulsao, VAR absurdo ou momento estranho num jogo, a pessoa pensa:

> "Deixa-me ver o que o Bilhas disse."

O produto junta duas camadas:

- dados objetivos do jogo: resultado, minuto, golos, cartoes, substituicoes e eventos;
- comentario editorial/humoristico ao vivo, com futebol, cultura pop, politica leve, comida, televisao, cinema e vida portuguesa.

## Principio

Nao queremos ser apenas mais um site de resultados. Queremos ser o sitio onde se vai ver a frase do momento.

## MVP

Comecar pequeno:

- site mobile-first;
- jogos importados de uma API externa;
- pagina por jogo;
- feed de eventos;
- feed de comentarios do Bilhas;
- painel privado para aprovar/publicar comentarios;
- links partilhaveis por comentario;
- cards/imagens para WhatsApp, Instagram e redes sociais.

## MVP Next.js

Existe agora uma primeira app Next.js na raiz do projeto.

Para correr localmente:

```bash
cd "/Users/lucagil/Documents/ZIBS/bilhas"
pnpm install
pnpm dev
```

Nota: se o terminal nao tiver `node` no `PATH`, instala Node.js localmente ou corre com o runtime bundled do Codex:

```bash
PATH="/Users/lucagil/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm dev
```

Abrir:

```text
http://127.0.0.1:3000/
```

Páginas principais:

- `/` - jogos e frases quentes;
- `/jogos/benfica-vitoria` - página de jogo;
- `/frases` - ranking/arquivo de frases;
- `/redacao` - painel editorial interno;
- `/api/matches` - dados mockados dos jogos;
- `/api/suggestions` - sugestões mockadas do Bilhas.

## Base De Dados

PostgreSQL fica preparado em `db/`.

Ficheiros:

- `db/migrations/0001_initial.sql` - schema inicial;
- `db/seeds/0001_demo.sql` - dados demo;
- `scripts/db/migrate.mjs` - aplica migrations;
- `scripts/db/seed.mjs` - carrega seeds;
- `.env.example` - variaveis esperadas;
- `docker-compose.yml` - Postgres local/servidor.

Fluxo local com Docker:

```bash
cp .env.example .env
# mudar passwords antes de usar fora da maquina local
POSTGRES_PASSWORD="uma_password_forte" docker compose up -d postgres
DATABASE_URL="postgres://bilhas_app:uma_password_forte@127.0.0.1:5432/bilhas" pnpm db:migrate
DATABASE_URL="postgres://bilhas_app:uma_password_forte@127.0.0.1:5432/bilhas" pnpm db:seed
```

Enquanto `DATABASE_URL` nao existir, a app usa dados mockados em desenvolvimento. Em producao, configurar `DATABASE_URL` e `DATABASE_SSL` quando aplicavel.

## Prototipo Estatico

Existe um primeiro prototipo estatico em `prototype/`.

Para correr localmente:

```bash
cd "/Users/lucagil/Documents/ZIBS/bilhas/prototype"
python3 -m http.server 8080
```

Abrir:

```text
http://127.0.0.1:8080/
```

## Regra De Ouro

A informacao vem de fornecedores de dados. A diferenciacao vem da voz do Bilhas.
