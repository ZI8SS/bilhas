import type { BilhasComment, Match, MatchEvent } from "./types";

export type WorldCupGame = {
  id: string;
  home_team_name_en?: string;
  away_team_name_en?: string;
  home_score?: string | null;
  away_score?: string | null;
  home_scorers?: string | null;
  away_scorers?: string | null;
  local_date?: string;
  finished?: string;
  time_elapsed?: string;
  type?: string;
};

type WorldCupResponse = {
  games?: WorldCupGame[];
};

const endpoint = process.env.WORLD_CUP_API_URL ?? "https://worldcup26.ir/get/games";

const teamNames: Record<string, string> = {
  Algeria: "Argelia",
  Argentina: "Argentina",
  Australia: "Australia",
  Austria: "Austria",
  Belgium: "Belgica",
  Brazil: "Brasil",
  Canada: "Canada",
  "Cape Verde": "Cabo Verde",
  Colombia: "Colombia",
  Croatia: "Croacia",
  "Democratic Republic of the Congo": "RD Congo",
  Ecuador: "Equador",
  Egypt: "Egito",
  England: "Inglaterra",
  France: "Franca",
  Germany: "Alemanha",
  Ghana: "Gana",
  Iraq: "Iraque",
  "Ivory Coast": "Costa do Marfim",
  Japan: "Japao",
  Mexico: "Mexico",
  Morocco: "Marrocos",
  Netherlands: "Paises Baixos",
  Norway: "Noruega",
  Paraguay: "Paraguai",
  Portugal: "Portugal",
  Qatar: "Catar",
  Senegal: "Senegal",
  "South Africa": "Africa do Sul",
  Spain: "Espanha",
  Sweden: "Suecia",
  Switzerland: "Suica",
  Turkey: "Turquia",
  "United States": "Estados Unidos",
};

const teamColors: Record<string, string> = {
  Argentina: "#75aadb",
  Australia: "#ffcd00",
  Brazil: "#009b3a",
  Canada: "#d80621",
  Colombia: "#fcd116",
  Croatia: "#e31b23",
  Ecuador: "#ffdd00",
  France: "#1d4ed8",
  Germany: "#111111",
  Ghana: "#fcd116",
  "Ivory Coast": "#f77f00",
  Japan: "#bc002d",
  Mexico: "#006847",
  Morocco: "#c1272d",
  Netherlands: "#f36c21",
  Norway: "#ba0c2f",
  Portugal: "#006600",
  Spain: "#c60b1e",
  Sweden: "#006aa7",
  Switzerland: "#d52b1e",
  "United States": "#3c3b6e",
};

const stageNames: Record<string, string> = {
  final: "Mundial 2026 - Final",
  group: "Mundial 2026 - Grupo",
  qf: "Mundial 2026 - Quartos",
  r16: "Mundial 2026 - Oitavos",
  r32: "Mundial 2026 - 16 avos",
  sf: "Mundial 2026 - Meias",
};

function teamName(name?: string) {
  if (!name) return "A definir";
  return teamNames[name] ?? name;
}

function shortName(name?: string) {
  return teamName(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

function publicId(game: WorldCupGame) {
  const left = (game.home_team_name_en ?? "tbd").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const right = (game.away_team_name_en ?? "tbd").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `mundial-${game.id}-${left}-${right}`;
}

function parseScore(value?: string | null) {
  if (!value || value === "null") return null;
  const score = Number.parseInt(value, 10);
  return Number.isFinite(score) ? score : null;
}

export function worldCupPublicId(game: WorldCupGame) {
  return publicId(game);
}

export function worldCupTeamName(name?: string) {
  return teamName(name);
}

export function worldCupTeamShortName(name?: string) {
  return shortName(name);
}

export function worldCupTeamColor(name?: string) {
  return teamColors[name ?? ""] ?? "#555555";
}

export function parseWorldCupDate(value?: string) {
  return parseDate(value);
}

function parseDate(value?: string) {
  if (!value) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, month, day, year, hour, minute] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));
}

function isSameUtcDay(left: Date, right: Date) {
  return (
    left.getUTCFullYear() === right.getUTCFullYear() &&
    left.getUTCMonth() === right.getUTCMonth() &&
    left.getUTCDate() === right.getUTCDate()
  );
}

function displayKickoff(value?: string, now = new Date()) {
  const match = value?.match(/^(\d{2})\/(\d{2})\/\d{4} (\d{2}:\d{2})$/);
  if (!match) return "Brevemente";

  const date = parseDate(value);
  if (date && isSameUtcDay(date, now)) return match[3];

  return `${match[2]}/${match[1]} ${match[3]}`;
}

function status(game: WorldCupGame, now = new Date()) {
  if (game.finished?.toUpperCase() === "TRUE") return "Terminado";
  if (game.time_elapsed && game.time_elapsed !== "notstarted") return "Ao vivo";
  const date = parseDate(game.local_date);
  if (date && !isSameUtcDay(date, now)) return "Agendado";
  return "Hoje";
}

function competition(game: WorldCupGame) {
  return stageNames[game.type ?? ""] ?? "Mundial 2026";
}

function scorerItems(value?: string | null) {
  if (!value || value === "null") return [];

  return [...value.matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function scorerEvent(item: string, team: string): MatchEvent {
  const minuteMatch = item.match(/(\d+(?:\+\d+)?)'/);
  const minute = minuteMatch ? `${minuteMatch[1]}'` : "Golo";
  const player = item.replace(/\s+\d+(?:\+\d+)?'.*$/, "").trim();

  return {
    minute,
    type: "Golo",
    player,
    text: `Golo de ${player} para ${team}.`,
  };
}

function eventsFor(game: WorldCupGame): MatchEvent[] {
  const home = teamName(game.home_team_name_en);
  const away = teamName(game.away_team_name_en);
  const events = [
    ...scorerItems(game.home_scorers).map((item) => scorerEvent(item, home)),
    ...scorerItems(game.away_scorers).map((item) => scorerEvent(item, away)),
  ];

  return events.sort((a, b) => Number.parseInt(a.minute, 10) - Number.parseInt(b.minute, 10));
}

function commentForEvent(game: WorldCupGame, event: MatchEvent, index: number): BilhasComment {
  const home = teamName(game.home_team_name_en);
  const away = teamName(game.away_team_name_en);
  const templates = [
    `${event.player ?? "Alguem"} marca e o jogo ${home}-${away} ganha aquele ar de jantar de familia depois da primeira boca: agora ninguem sabe bem onde pousar os olhos.`,
    `Golo de ${event.player ?? "um protagonista improvavel"}. A defesa ficou a acompanhar como quem ve a encomenda passar de carrinha e aceita o destino.`,
    `${event.player ?? "O marcador"} apareceu na area com mais pontualidade do que muita reuniao marcada no calendario. A bola entrou e a vergonha pediu baixa.`,
  ];

  return {
    id: `wc-${game.id}-${index}`,
    minute: event.minute,
    intensity: index % 3 === 0 ? "forte" : "medio",
    featured: index === 0,
    text: templates[index % templates.length],
  };
}

function previewComment(game: WorldCupGame): BilhasComment {
  const home = teamName(game.home_team_name_en);
  const away = teamName(game.away_team_name_en);

  return {
    id: `wc-${game.id}-pre`,
    minute: "Pre",
    intensity: "leve",
    featured: true,
    text: `${home}-${away} a caminho. Nesta fase do Mundial, qualquer jogo pode ser historico ou so uma forma cara de descobrir quem aguenta melhor os nervos.`,
  };
}

function isRelevant(game: WorldCupGame, now: Date) {
  const date = parseDate(game.local_date);
  if (!date) return false;

  const twoDaysAgo = new Date(now);
  twoDaysAgo.setUTCDate(now.getUTCDate() - 2);
  twoDaysAgo.setUTCHours(0, 0, 0, 0);

  const tenDaysAhead = new Date(now);
  tenDaysAhead.setUTCDate(now.getUTCDate() + 10);
  tenDaysAhead.setUTCHours(23, 59, 59, 999);

  return date >= twoDaysAgo && date <= tenDaysAhead;
}

function mapGame(game: WorldCupGame): Match {
  const events = eventsFor(game);
  const comments = events.length > 0 ? events.map((event, index) => commentForEvent(game, event, index)) : [previewComment(game)];
  const currentStatus = status(game);

  return {
    id: publicId(game),
    competition: competition(game),
    minute: currentStatus === "Hoje" || currentStatus === "Agendado" ? displayKickoff(game.local_date) : "Fim",
    status: currentStatus,
    home: {
      name: teamName(game.home_team_name_en),
      short: shortName(game.home_team_name_en),
      score: parseScore(game.home_score),
      color: teamColors[game.home_team_name_en ?? ""] ?? "#555555",
    },
    away: {
      name: teamName(game.away_team_name_en),
      short: shortName(game.away_team_name_en),
      score: parseScore(game.away_score),
      color: teamColors[game.away_team_name_en ?? ""] ?? "#0f766e",
    },
    events,
    comments,
  };
}

export function mapWorldCupGame(game: WorldCupGame) {
  return mapGame(game);
}

export async function getWorldCupGames() {
  const response = await fetch(endpoint, {
    headers: { accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`World Cup API failed with ${response.status}`);
  }

  const data = (await response.json()) as WorldCupResponse;
  return data.games ?? [];
}

export async function getWorldCupMatches() {
  const games = await getWorldCupGames();
  const now = new Date();
  const relevant = games.filter((game) => isRelevant(game, now));
  const selected = relevant.length > 0 ? relevant : games.slice(-16);

  return selected
    .sort((left, right) => Number(parseDate(left.local_date)) - Number(parseDate(right.local_date)))
    .map(mapGame);
}
