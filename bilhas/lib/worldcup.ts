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
  stadium_id?: string;
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
  "Bosnia and Herzegovina": "Bosnia e Herzegovina",
  Brazil: "Brasil",
  Canada: "Canada",
  "Cape Verde": "Cabo Verde",
  Colombia: "Colombia",
  Croatia: "Croacia",
  "Czech Republic": "Chequia",
  "Curaçao": "Curacao",
  "Democratic Republic of the Congo": "RD Congo",
  Ecuador: "Equador",
  Egypt: "Egito",
  England: "Inglaterra",
  France: "Franca",
  Germany: "Alemanha",
  Ghana: "Gana",
  Haiti: "Haiti",
  Iran: "Irao",
  Iraq: "Iraque",
  "Ivory Coast": "Costa do Marfim",
  Japan: "Japao",
  Mexico: "Mexico",
  Morocco: "Marrocos",
  Netherlands: "Paises Baixos",
  "New Zealand": "Nova Zelandia",
  Norway: "Noruega",
  Panama: "Panama",
  Paraguay: "Paraguai",
  Portugal: "Portugal",
  Qatar: "Catar",
  "Saudi Arabia": "Arabia Saudita",
  Scotland: "Escocia",
  Senegal: "Senegal",
  "South Africa": "Africa do Sul",
  "South Korea": "Coreia do Sul",
  Spain: "Espanha",
  Sweden: "Suecia",
  Switzerland: "Suica",
  Tunisia: "Tunisia",
  Turkey: "Turquia",
  "United States": "Estados Unidos",
  Uruguay: "Uruguai",
  Uzbekistan: "Uzbequistao",
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

const portugalKickoffOverrides: Record<string, string> = {
  // Source cross-check, 30 Jun 2026:
  // Ivory Coast-Norway 1pm ET, France-Sweden 5pm ET, Mexico-Ecuador 9pm ET.
  "77": "2026-06-30T21:00:00.000Z",
  "78": "2026-06-30T17:00:00.000Z",
  "79": "2026-07-01T01:00:00.000Z",
};

const stadiumTimeZones: Record<string, string> = {
  "1": "America/Mexico_City",
  "2": "America/Mexico_City",
  "3": "America/Monterrey",
  "4": "America/Chicago",
  "5": "America/Chicago",
  "6": "America/Chicago",
  "7": "America/New_York",
  "8": "America/New_York",
  "9": "America/New_York",
  "10": "America/New_York",
  "11": "America/New_York",
  "12": "America/Toronto",
  "13": "America/Vancouver",
  "14": "America/Los_Angeles",
  "15": "America/Los_Angeles",
  "16": "America/Los_Angeles",
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

export function parseWorldCupDate(game: WorldCupGame) {
  return kickoffDate(game);
}

function parseLocalDateParts(value?: string) {
  if (!value) return null;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, month, day, year, hour, minute] = match;

  return {
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    month: Number(month),
    year: Number(year),
  };
}

function partsInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    month: Number(values.month),
    year: Number(values.year),
  };
}

function zonedDateToUtc(value: string | undefined, timeZone: string) {
  const desired = parseLocalDateParts(value);
  if (!desired) return null;

  const utcGuess = Date.UTC(desired.year, desired.month - 1, desired.day, desired.hour, desired.minute);
  const actual = partsInTimeZone(new Date(utcGuess), timeZone);
  const desiredAsUtc = Date.UTC(desired.year, desired.month - 1, desired.day, desired.hour, desired.minute);
  const actualAsUtc = Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute);

  return new Date(utcGuess + (desiredAsUtc - actualAsUtc));
}

function kickoffDate(game: WorldCupGame) {
  const override = portugalKickoffOverrides[game.id];
  if (override) return new Date(override);

  const timeZone = stadiumTimeZones[game.stadium_id ?? ""];
  if (timeZone) return zonedDateToUtc(game.local_date, timeZone);

  const date = parseLocalDateParts(game.local_date);
  if (!date) return null;

  return new Date(Date.UTC(date.year, date.month - 1, date.day, date.hour, date.minute));
}

function portugalParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Lisbon",
    year: "numeric",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function portugalDayKey(date: Date) {
  const parts = portugalParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function displayKickoff(date: Date | null, now = new Date()) {
  if (!date) return "Brevemente";

  const parts = portugalParts(date);
  const time = `${parts.hour}h${parts.minute}`;

  if (portugalDayKey(date) === portugalDayKey(now)) return time;

  return `${parts.day}/${parts.month} ${time}`;
}

function status(game: WorldCupGame, now = new Date()) {
  if (game.finished?.toUpperCase() === "TRUE" || game.time_elapsed === "finished") return "Terminado";
  const date = kickoffDate(game);
  const liveWindowEnd = date ? new Date(date.getTime() + 150 * 60 * 1000) : null;

  if (game.time_elapsed && game.time_elapsed !== "notstarted") {
    if (!date || now <= liveWindowEnd!) return "Ao vivo";
    return "Por atualizar";
  }

  if (date && now > liveWindowEnd!) return "Por atualizar";
  if (date && portugalDayKey(date) !== portugalDayKey(now)) return "Agendado";
  return "Hoje";
}

function liveMinute(game: WorldCupGame) {
  if (!game.time_elapsed || game.time_elapsed === "notstarted") return null;
  if (/^\d+$/.test(game.time_elapsed)) return `${game.time_elapsed}'`;
  if (game.time_elapsed === "finished") return "Fim";

  return "Ao vivo";
}

function minuteFor(game: WorldCupGame, currentStatus: string, startsAt: Date | null) {
  if (currentStatus === "Terminado") return "Fim";
  if (currentStatus === "Ao vivo") return liveMinute(game) ?? "Ao vivo";

  return displayKickoff(startsAt);
}

function competition(game: WorldCupGame) {
  return stageNames[game.type ?? ""] ?? "Mundial 2026";
}

function scorerItems(value?: string | null) {
  if (!value || value === "null") return [];

  return [...value.matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

function scorerEvent(item: string, team: string, opponent: string): MatchEvent {
  const minuteMatch = item.match(/(\d+(?:\+\d+)?)'/);
  const minute = minuteMatch ? `${minuteMatch[1]}'` : "Golo";
  const player = item.replace(/\s+\d+(?:\+\d+)?'.*$/, "").trim();

  return {
    minute,
    type: "Golo",
    player,
    scoringTeam: team,
    concedingTeam: opponent,
    text: `Golo de ${player} para ${team}.`,
  };
}

function eventsFor(game: WorldCupGame): MatchEvent[] {
  const home = teamName(game.home_team_name_en);
  const away = teamName(game.away_team_name_en);
  const events = [
    ...scorerItems(game.home_scorers).map((item) => scorerEvent(item, home, away)),
    ...scorerItems(game.away_scorers).map((item) => scorerEvent(item, away, home)),
  ];

  return events.sort((a, b) => Number.parseInt(a.minute, 10) - Number.parseInt(b.minute, 10));
}

function hashText(value: string) {
  return [...value].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 9973, 7);
}

function pickLine(lines: string[], seed: string, offset = 0) {
  return lines[(hashText(seed) + offset * 7) % lines.length];
}

function commentForEvent(game: WorldCupGame, event: MatchEvent, index: number): BilhasComment {
  const home = teamName(game.home_team_name_en);
  const away = teamName(game.away_team_name_en);
  const player = event.player ?? "Alguem";
  const concedingTeam = event.concedingTeam ?? (event.scoringTeam === home ? away : home);
  const scoringTeam = event.scoringTeam ?? (concedingTeam === home ? away : home);
  const seed = `${game.id}-${event.minute}-${player}-${home}-${away}`;
  const openers = [
    `${player} marca no ${home}-${away}.`,
    `Golo de ${player}.`,
    `${player} apareceu na zona proibida e nao pediu licenca.`,
    `A bola entrou, ${player} sorriu e o plano A ficou sem advogado.`,
    `${player} finaliza e muda a temperatura do jogo.`,
    `${scoringTeam} acaba de ganhar novo argumento: golo de ${player}.`,
    `${player} fez o que todos prometem na flash interview: foi eficaz.`,
    `Golo. ${player} tratou a area como se tivesse reserva marcada.`,
    `${player} encostou a bola para dentro e deixou o jogo menos diplomatico.`,
    `A jogada acaba em golo de ${player}, porque alguem tinha de dar um fim ao episodio.`,
    `${player} marcou e interrompeu a reuniao taticamente motivacional do ${concedingTeam}.`,
    `Golo de ${player}, daqueles que entram primeiro na baliza e depois na cabeca da defesa.`,
  ];
  const closers = [
    `O ${concedingTeam} ficou com ar de quem abriu o Excel errado em plena apresentacao.`,
    `Foi uma decisao tao limpa que ate num debate televisivo parecia consenso.`,
    `Se isto fosse cinema, era o momento em que a banda sonora entra e alguem percebe que devia ter corrido mais cedo.`,
    `O ${concedingTeam} ficou a olhar para a bola como quem ve a renda de Lisboa em 2026: sem resposta e com alguma indignacao.`,
    `A marcacao desapareceu com a subtileza de uma promessa eleitoral depois das urnas fecharem.`,
    `Houve ali mais espaco do que numa explanada em janeiro, e ${player} aproveitou sem pedir manta.`,
    `O ${concedingTeam} tentou ser adulto, mas acabou a entregar um episodio piloto de panico organizado.`,
    `Nao foi magia; foi so futebol a lembrar que a concentracao tambem paga imposto.`,
    `A bola entrou com tanta naturalidade que quase parecia ter cartao de socio.`,
    `O lance teve ritmo de thriller barato: vimos o final a chegar e mesmo assim ninguem travou.`,
    `No VAR emocional, isto dava vermelho direto a metade das decisoes tomadas antes do remate.`,
    `Foi menos jogada estudada e mais "quem deixou isto acontecer?" com relvado.`,
    `O ${concedingTeam} ficou com cara de quem acabou de perceber a clausula pequena do contrato.`,
    `A baliza abriu-se como loja em saldos: muita gente entrou tarde e ninguem controlou a porta.`,
    `O lance teve aquele dramatismo de aeroporto quando o voo muda de porta e toda a gente finge calma.`,
    `Se havia plano defensivo, ficou guardado numa pasta chamada "versao_final_agora_sim_2".`,
    `A bancada percebeu antes do defesa, e isso raramente e bom sinal para o defesa.`,
    `Foi servido com a frieza de uma conta no restaurante quando ninguem pediu entradas.`,
    `O ${concedingTeam} defendeu aquilo como Governo em votacao dificil: primeiro hesitou, depois esperou que passasse.`,
    `A organizacao do ${concedingTeam} teve mais buracos do que promessa sobre o novo aeroporto.`,
    `O ${concedingTeam} ficou em modo revista cor-de-rosa: muita pose, pouca explicacao convincente.`,
    `Se isto fosse Eurovisao, o ${concedingTeam} ainda estava a pedir votos ao juri quando a bola ja tinha entrado.`,
    `A defesa do ${concedingTeam} abriu uma autoestrada tao generosa que faltou so cobrar portagem.`,
    `O ${concedingTeam} ficou com a serenidade de quem recebe notificacao das Financas numa sexta-feira a noite.`,
    `Foi tao facil que parecia debate europeu sobre burocracia: muita estrutura, resultado lentissimo.`,
    `O ${concedingTeam} reagiu tarde, como comboio suburbano em dia de chuva e comunicados vagos.`,
  ];
  const text = `${pickLine(openers, seed, index)} ${pickLine(closers, seed, index + 2)}`;

  return {
    id: `wc-${game.id}-${index}`,
    minute: event.minute,
    intensity: index % 3 === 0 ? "forte" : "medio",
    featured: index === 0,
    text,
  };
}

function previewComment(game: WorldCupGame): BilhasComment {
  const home = teamName(game.home_team_name_en);
  const away = teamName(game.away_team_name_en);
  const templates = [
    `${home}-${away} a caminho. No papel e um jogo; na pratica e uma auditoria publica a onze pessoas de cada lado.`,
    `Daqui a pouco ha ${home}-${away}. Os nervos ja entraram em campo, os jogadores ainda estao a fingir que controlam a situacao.`,
    `${home} contra ${away}. Uma daquelas noites em que o futebol promete xadrez e ao minuto 12 ja estamos todos a ver matraquilhos com imprensa.`,
    `Pre-jogo de ${home}-${away}. Ha planos, ha discurso, ha quadro tatico. Depois a bola bate num joelho e vira cinema independente.`,
    `${home}-${away} vem ai. Cheira a jogo onde alguem vai dizer "era evitar erros" e depois oferecer um erro em formato familiar.`,
    `Tudo pronto para ${home}-${away}. Se isto fosse restaurante, a carta prometia fine dining; veremos se a cozinha nao serve pregos frios.`,
    `${home}-${away}. O tipo de jogo em que toda a gente parece confiante ate a primeira perda de bola com narracao interior.`,
    `A caminho de ${home}-${away}. Ha equipas que entram com estrategia; outras entram com fe. Hoje vamos descobrir quem trouxe PowerPoint e quem trouxe vela.`,
    `${home}-${away} em modo quase a comecar. A bola ainda nem rolou e ja ha gente a preparar opinioes definitivas para usar no intervalo.`,
    `Pre-jogo. ${home} e ${away} prometeram intensidade, palavra bonita que no futebol tanto quer dizer pressao alta como duas faltas e um olhar feio.`,
    `${home}-${away} esta a chegar. Pode ser drama, pode ser sono, pode ser aquele filme que so fica bom quando ja estavamos a desistir.`,
    `Daqui a pouco ha futebol. ${home}-${away}, ou como se diz tecnicamente: 90 minutos para transformar certezas em memes.`,
  ];

  return {
    id: `wc-${game.id}-pre`,
    minute: "Pre",
    intensity: "leve",
    featured: true,
    text: pickLine(templates, `${game.id}-${home}-${away}`),
  };
}

function eventMinuteNumber(event: MatchEvent) {
  const match = event.minute.match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

function elapsedMinute(game: WorldCupGame, currentStatus: string, startsAt: Date | null, now = new Date()) {
  if (currentStatus === "Terminado") return 90;
  if (currentStatus !== "Ao vivo") return 0;
  if (game.time_elapsed && /^\d+$/.test(game.time_elapsed)) return Number(game.time_elapsed);
  if (!startsAt) return 0;

  return Math.max(0, Math.min(90, Math.floor((now.getTime() - startsAt.getTime()) / 60000)));
}

function clockComment(game: WorldCupGame, minute: number, index: number): BilhasComment {
  const home = teamName(game.home_team_name_en);
  const away = teamName(game.away_team_name_en);
  const seed = `${game.id}-${home}-${away}`;
  const lines = [
    `O jogo esta naquela fase em que toda a gente parece ter uma ideia, mas ninguem quer ficar com a ata.`,
    `A bola circula com a conviccao de um processo europeu: devagar, formal e sempre a prometer consequencias.`,
    `Ha mais estudo aqui do que numa comissao parlamentar, mas para ja menos conclusoes.`,
    `O ${home} tenta mandar, o ${away} tenta responder, e a paciencia do espectador vai fazendo cardio.`,
    `Isto esta equilibrado como orcamento familiar depois de ver a renda, portanto convem ninguem respirar demasiado forte.`,
    `O jogo entrou em modo novela das nove: toda a gente olha muito, alguem vai acabar a chorar, mas ainda nao sabemos quem.`,
    `A pressao sobe aos bocadinhos, como preco de cafe em zona turistica: ninguem gosta, todos aceitam.`,
    `Ha espaco entre linhas suficiente para uma discussao sobre o novo aeroporto e ainda sobra para estacionamento.`,
    `O jogo esta vivo, mas por enquanto naquele vivo de sala de espera: respira, mexe-se, mas ninguem chama pelo nome.`,
    `As duas equipas negociam territorio como ministros em Bruxelas: muitos gestos, frases longas e um acordo que fica para depois.`,
    `Se isto fosse cinema, estavamos na parte em que a realizacao mostra uma janela com chuva para dizer que algo pode acontecer.`,
    `O publico ja percebeu que isto pode dar drama ou uma sesta com estatisticas, que tambem e uma tradicao respeitavel.`,
    `O ${away} esta a defender como quem responde "vamos ver" a todos os problemas da vida.`,
    `O ${home} tem bola, tem intencao e tem aquele risco de transformar posse em PowerPoint sem botao de play.`,
    `Ainda ha tempo para tudo: golo, falhanco, VAR, ou uma opiniao muito convicta de alguem que chegou agora ao sofa.`,
    `O ritmo esta tao tactico que ate a RTP2 chamaria isto de conteudo exigente.`,
    `A coisa nao esta parada; esta so a pensar demasiado sobre si propria.`,
    `Ha ali uma ala tao aberta que uma revista social ja estaria a perguntar se ha crise na relacao.`,
  ];
  const text = lines[(hashText(seed) + index) % lines.length];

  return {
    featured: index === 0,
    id: `wc-${game.id}-tick-${minute}`,
    intensity: minute % 15 === 0 ? "medio" : "leve",
    minute: `${minute}'`,
    text,
  };
}

function clockComments(game: WorldCupGame, events: MatchEvent[], currentStatus: string, startsAt: Date | null) {
  const elapsed = elapsedMinute(game, currentStatus, startsAt);
  if (elapsed < 5) return [];

  const eventMinutes = new Set(events.map(eventMinuteNumber).filter((minute): minute is number => minute !== null));
  const comments: BilhasComment[] = [];

  for (let minute = 5; minute <= elapsed; minute += 5) {
    if ([minute - 1, minute, minute + 1].some((value) => eventMinutes.has(value))) continue;
    comments.push(clockComment(game, minute, comments.length));
  }

  return comments;
}

function commentMinuteOrder(comment: BilhasComment) {
  if (comment.minute === "Pre") return -1;
  const match = comment.minute.match(/^(\d+)/);
  return match ? Number(match[1]) : 999;
}

function isRelevant(game: WorldCupGame, now: Date) {
  const date = kickoffDate(game);
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
  const hasNamedTeams = Boolean(game.home_team_name_en && game.away_team_name_en);
  const currentStatus = status(game);
  const startsAt = kickoffDate(game);
  const tickerComments = clockComments(game, events, currentStatus, startsAt);
  const comments = hasNamedTeams
    ? events.length > 0
      ? [...tickerComments, ...events.map((event, index) => commentForEvent(game, event, index))].sort(
          (left, right) => commentMinuteOrder(left) - commentMinuteOrder(right),
        )
      : [previewComment(game)]
    : [];

  return {
    id: publicId(game),
    competition: competition(game),
    minute: minuteFor(game, currentStatus, startsAt),
    status: currentStatus,
    startsAt: startsAt?.toISOString() ?? null,
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
    .sort((left, right) => Number(kickoffDate(left)) - Number(kickoffDate(right)))
    .map(mapGame);
}
