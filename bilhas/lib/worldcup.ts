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
  Algeria: "Argélia",
  Argentina: "Argentina",
  Australia: "Austrália",
  Austria: "Áustria",
  Belgium: "Bélgica",
  "Bosnia and Herzegovina": "Bósnia e Herzegovina",
  Brazil: "Brasil",
  Canada: "Canadá",
  "Cape Verde": "Cabo Verde",
  Colombia: "Colômbia",
  Croatia: "Croácia",
  "Czech Republic": "Chequia",
  "Curaçao": "Curaçau",
  "Democratic Republic of the Congo": "RD Congo",
  Ecuador: "Equador",
  Egypt: "Egito",
  England: "Inglaterra",
  France: "França",
  Germany: "Alemanha",
  Ghana: "Gana",
  Haiti: "Haiti",
  Iran: "Irão",
  Iraq: "Iraque",
  "Ivory Coast": "Costa do Marfim",
  Japan: "Japão",
  Mexico: "México",
  Morocco: "Marrocos",
  Netherlands: "Países Baixos",
  "New Zealand": "Nova Zelândia",
  Norway: "Noruega",
  Panama: "Panamá",
  Paraguay: "Paraguai",
  Portugal: "Portugal",
  Qatar: "Catar",
  "Saudi Arabia": "Arábia Saudita",
  Scotland: "Escócia",
  Senegal: "Senegal",
  "South Africa": "África do Sul",
  "South Korea": "Coreia do Sul",
  Spain: "Espanha",
  Sweden: "Suécia",
  Switzerland: "Suíça",
  Tunisia: "Tunísia",
  Turkey: "Turquia",
  "United States": "Estados Unidos",
  Uruguay: "Uruguai",
  Uzbekistan: "Uzbequistão",
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

function articleForTeam(team: string) {
  const pluralMasculine = new Set(["Estados Unidos", "Países Baixos"]);
  const feminine = new Set([
    "África do Sul",
    "Argélia",
    "Argentina",
    "Arábia Saudita",
    "Austrália",
    "Áustria",
    "Bélgica",
    "Bósnia e Herzegovina",
    "Chequia",
    "Colômbia",
    "Coreia do Sul",
    "Costa do Marfim",
    "Croácia",
    "Espanha",
    "França",
    "Inglaterra",
    "Nova Zelândia",
    "Noruega",
    "Tunísia",
    "Turquia",
    "Suíça",
    "Suécia",
  ]);

  if (pluralMasculine.has(team)) return "Os";
  return feminine.has(team) ? "A" : "O";
}

function teamWithArticle(team: string) {
  return `${articleForTeam(team)} ${team}`;
}

function teamWithLowerArticle(team: string) {
  return `${articleForTeam(team).toLowerCase()} ${team}`;
}

function teamWithOf(team: string) {
  const article = articleForTeam(team);
  const contraction = article === "A" ? "da" : article === "Os" ? "dos" : "do";

  return `${contraction} ${team}`;
}

function commentForEvent(game: WorldCupGame, event: MatchEvent, index: number): BilhasComment {
  const home = teamName(game.home_team_name_en);
  const away = teamName(game.away_team_name_en);
  const player = event.player ?? "Alguém";
  const concedingTeam = event.concedingTeam ?? (event.scoringTeam === home ? away : home);
  const scoringTeam = event.scoringTeam ?? (concedingTeam === home ? away : home);
  const seed = `${game.id}-${event.minute}-${player}-${home}-${away}`;
  const openers = [
    `${player} marca no ${home}-${away}.`,
    `Golo de ${player}.`,
    `${player} apareceu na zona proibida e nem tocou a campainha.`,
    `A bola entrou, ${player} sorriu e o plano A foi pedir baixa psicológica.`,
    `${player} finaliza e muda a temperatura do jogo.`,
    `${teamWithArticle(scoringTeam)} acaba de ganhar novo argumento: golo de ${player}.`,
    `${player} fez o que todos prometem na flash interview: foi eficaz.`,
    `Golo. ${player} tratou a área como se tivesse reserva marcada.`,
    `${player} encostou a bola para dentro e deixou o jogo menos diplomático.`,
    `A jogada acaba em golo de ${player}, porque alguém tinha de dar um fim ao episódio.`,
    `${player} marcou e interrompeu a reunião taticamente motivacional ${teamWithOf(concedingTeam)}.`,
    `Golo de ${player}, daqueles que entram primeiro na baliza e depois na cabeça da defesa.`,
    `${player} resolveu o lance com a delicadeza de quem fecha a porta do Metro quando ainda vinha alguém a correr.`,
    `Golo de ${player}. Curto, seco, e com aquele ar de talho antigo: pediu-se um corte e veio sem conversa.`,
    `${player} meteu a bola lá dentro e deixou o jogo com menos teorias e mais recibos.`,
  ];
  const closers = [
    `${teamWithArticle(concedingTeam)} ficou com ar de quem abriu o Excel errado em plena apresentação.`,
    `Foi uma decisão tão limpa que até num debate televisivo parecia consenso.`,
    `Se isto fosse cinema, era o momento em que a banda sonora entra e alguém percebe que devia ter corrido mais cedo.`,
    `${teamWithArticle(concedingTeam)} ficou a olhar para a bola como quem vê a renda de Lisboa em 2026: sem resposta e com alguma indignação.`,
    `A marcação desapareceu com a subtileza de uma promessa eleitoral depois das urnas fecharem.`,
    `Houve ali mais espaço do que numa explanada em janeiro, e ${player} aproveitou sem pedir manta.`,
    `${teamWithArticle(concedingTeam)} tentou ser adulto, mas acabou a entregar um episódio piloto de pânico organizado.`,
    `Não foi magia; foi só futebol a lembrar que a concentração também paga imposto.`,
    `A bola entrou com tanta naturalidade que quase parecia ter cartão de sócio.`,
    `O lance teve ritmo de thriller barato: vimos o final a chegar e mesmo assim ninguém travou.`,
    `No VAR emocional, isto dava vermelho direto a metade das decisões tomadas antes do remate.`,
    `Foi menos jogada estudada e mais "quem deixou isto acontecer?" com relvado.`,
    `${teamWithArticle(concedingTeam)} ficou com cara de quem acabou de perceber a cláusula pequena do contrato.`,
    `A baliza abriu-se como loja em saldos: muita gente entrou tarde e ninguém controlou a porta.`,
    `O lance teve aquele dramatismo de aeroporto quando o voo muda de porta e toda a gente finge calma.`,
    `Se havia plano defensivo, ficou guardado numa pasta chamada "versao_final_agora_sim_2".`,
    `A bancada percebeu antes do defesa, e isso raramente é bom sinal para o defesa.`,
    `Foi servido com a frieza de uma conta no restaurante quando ninguém pediu entradas.`,
    `${teamWithArticle(concedingTeam)} defendeu aquilo como Governo em votação difícil: primeiro hesitou, depois esperou que passasse.`,
    `A organização ${teamWithOf(concedingTeam)} teve mais buracos do que promessa sobre o novo aeroporto.`,
    `${teamWithArticle(concedingTeam)} ficou em modo revista cor-de-rosa: muita pose, pouca explicação convincente.`,
    `Se isto fosse Eurovisão, ${teamWithLowerArticle(concedingTeam)} ainda estava a pedir votos ao júri quando a bola já tinha entrado.`,
    `A defesa ${teamWithOf(concedingTeam)} abriu uma autoestrada tão generosa que faltou só cobrar portagem.`,
    `${teamWithArticle(concedingTeam)} ficou com a serenidade de quem recebe notificação das Finanças numa sexta-feira à noite.`,
    `Foi tão fácil que parecia debate europeu sobre burocracia: muita estrutura, resultado lentíssimo.`,
    `${teamWithArticle(concedingTeam)} reagiu tarde, como comboio suburbano em dia de chuva e comunicados vagos.`,
    `A defesa ficou a discutir responsabilidades com a urgência de uma assembleia de condomínio.`,
    `Aquilo foi menos erro individual e mais reunião familiar no Natal: toda a gente fala, ninguém resolve.`,
    `O banco olhou para o relvado como quem vê a conta da luz: sabia que vinha mau, mas não assim.`,
    `A jogada passou pela defesa com etiqueta de "prioritário" dos CTT: surpreendentemente chegou.`,
    `Houve mais abandono naquela zona do que numa explanada as quatro da tarde em agosto.`,
    `A linha defensiva fez cosplay de atendimento telefónico: esteve lá, mas não ajudou ninguém.`,
    `No resumo da noite, isto vai aparecer entre "erro evitável" e "imagem que não convém repetir no balneário".`,
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
    `${home}-${away} a caminho. No papel é um jogo; na prática é uma auditoria pública a onze pessoas de cada lado.`,
    `Daqui a pouco há ${home}-${away}. Os nervos já entraram em campo, os jogadores ainda estão a fingir que controlam a situação.`,
    `${home} contra ${away}. Uma daquelas noites em que o futebol promete xadrez e ao minuto 12 já estamos todos a ver matraquilhos com imprensa.`,
    `Pre-jogo de ${home}-${away}. Há planos, há discurso, há quadro tático. Depois a bola bate num joelho e vira cinema independente.`,
    `${home}-${away} vem aí. Cheira a jogo onde alguém vai dizer "era evitar erros" e depois oferecer um erro em formato familiar.`,
    `Tudo pronto para ${home}-${away}. Se isto fosse restaurante, a carta prometia fine dining; veremos se a cozinha não serve pregos frios.`,
    `${home}-${away}. O tipo de jogo em que toda a gente parece confiante até à primeira perda de bola com narração interior.`,
    `A caminho de ${home}-${away}. Há equipas que entram com estratégia; outras entram com fé. Hoje vamos descobrir quem trouxe PowerPoint e quem trouxe vela.`,
    `${home}-${away} em modo quase a começar. A bola ainda nem rolou e já há gente a preparar opiniões definitivas para usar no intervalo.`,
    `Pre-jogo. ${home} e ${away} prometeram intensidade, palavra bonita que no futebol tanto quer dizer pressão alta como duas faltas e um olhar feio.`,
    `${home}-${away} está a chegar. Pode ser drama, pode ser sono, pode ser aquele filme que só fica bom quando já estávamos a desistir.`,
    `Daqui a pouco há futebol. ${home}-${away}, ou como se diz tecnicamente: 90 minutos para transformar certezas em memes.`,
    `${home}-${away} quase a começar. As táticas estão bonitas, o problema é que a bola costuma ter opinião própria.`,
    `Pre-jogo de ${home}-${away}. Muita concentração, muita garrafa de água alinhada, e aquela fé portuguesa em que alguém vai estragar o plano ao minuto 8.`,
    `${home}-${away} vem aí. Se correr bem, falamos de estratégia; se correr mal, chamamos-lhe "detalhes".`,
    `Tudo pronto para ${home}-${away}. O relvado está impecável, que é sempre suspeito antes de noventa minutos de decisões humanas.`,
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
  const seed = `${game.id}-${home}-${away}-${minute}`;
  const lines = [
    `O jogo está naquela fase em que toda a gente parece ter uma ideia, mas ninguém quer ficar com a ata.`,
    `A bola circula com a convicção de um processo europeu: devagar, formal e sempre a prometer consequências.`,
    `Há mais estudo aqui do que numa comissão parlamentar, mas para já menos conclusões.`,
    `${teamWithArticle(home)} tenta mandar, ${teamWithLowerArticle(away)} tenta responder, e a paciência do espectador vai fazendo cardio.`,
    `Isto está equilibrado como orçamento familiar depois de ver a renda, portanto convém ninguém respirar demasiado forte.`,
    `O jogo entrou em modo novela das nove: toda a gente olha muito, alguém vai acabar a chorar, mas ainda não sabemos quem.`,
    `A pressão sobe aos bocadinhos, como preço de café em zona turística: ninguém gosta, todos aceitam.`,
    `Há espaço entre linhas suficiente para uma discussão sobre o novo aeroporto e ainda sobra para estacionamento.`,
    `O jogo está vivo, mas por enquanto naquele vivo de sala de espera: respira, mexe-se, mas ninguém chama pelo nome.`,
    `As duas equipas negociam território como ministros em Bruxelas: muitos gestos, frases longas e um acordo que fica para depois.`,
    `Se isto fosse cinema, estávamos na parte em que a realização mostra uma janela com chuva para dizer que algo pode acontecer.`,
    `O público já percebeu que isto pode dar drama ou uma sesta com estatísticas, que também é uma tradição respeitável.`,
    `${teamWithArticle(away)} está a defender como quem responde "vamos ver" a todos os problemas da vida.`,
    `${teamWithArticle(home)} tem bola, tem intenção e tem aquele risco de transformar posse em PowerPoint sem botão de play.`,
    `Ainda há tempo para tudo: golo, falhanço, VAR, ou uma opinião muito convicta de alguém que chegou agora ao sofá.`,
    `O ritmo está tão tático que até a RTP2 chamaria isto de conteúdo exigente.`,
    `A coisa não está parada; está só a pensar demasiado sobre si própria.`,
    `Há ali uma ala tão aberta que uma revista social já estaria a perguntar se há crise na relação.`,
    `A posse anda de pé em pé como segredo num grupo de WhatsApp: toda a gente toca, ninguém assume.`,
    `O jogo está a pedir uma ideia nova, mas para já recebeu uma fatura pro-forma e dois passes para trás.`,
    `Há intensidade, sim. Também há aquela sensação de jantar em que toda a gente evita falar do assunto principal.`,
    `O meio-campo está tão apertado que nem uma família no IKEA discutiria com tanto contacto.`,
    `A bola foi ao corredor e voltou, tipo pessoa que entrou no Continente só para comprar pão e saiu com dúvidas existenciais.`,
    `Neste momento a melhor movimentação é a das opiniões no sofá, que já trocaram de lado três vezes.`,
    `A defesa está organizada, mas com aquele organizado de gaveta onde juramos que sabemos onde está tudo.`,
    `O jogo tem ritmo de repartição pública: há senhas, há espera, e de vez em quando alguém levanta a voz.`,
    `A pressão subiu um bocadinho. Nada de PÂNICO, mas já se sente o cheiro a café queimado no banco.`,
    `A bancada quer velocidade; o relvado respondeu com uma versão em modo economizador de bateria.`,
  ];
  const text = lines[(hashText(seed) + index * 5) % lines.length];

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
