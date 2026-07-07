import type { Match } from "./types";

export function hasStarted(match: Match) {
  if (!match.startsAt) return false;
  return Date.now() >= new Date(match.startsAt).getTime();
}

export function isLiveMatch(match: Match) {
  return match.status === "Ao vivo" || match.status === "A decorrer";
}

export function isFinishedMatch(match: Match) {
  return match.status === "Terminado";
}

export function scoreIsPublic(match: Match) {
  if (match.status === "Agendado") return false;
  if (match.status === "Hoje" && !hasStarted(match)) return false;
  if (match.status === "Por atualizar") return false;
  if (match.home.score === null && match.away.score === null) return false;

  return true;
}

export function teamScoreText(match: Match, side: "home" | "away") {
  if (!scoreIsPublic(match)) return "-";

  const score = side === "home" ? match.home.score : match.away.score;
  return score ?? "-";
}

export function scoreText(match: Match) {
  return `${teamScoreText(match, "home")}-${teamScoreText(match, "away")}`;
}

export function timeText(value: string) {
  if (/^\d{2}:\d{2}$/.test(value)) {
    return value.replace(":", "h");
  }

  return value.replace(/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/, "$1/$2 $3h$4");
}

export function kickoffTimeText(match: Match) {
  if (!match.startsAt) return timeText(match.minute);

  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Lisbon",
  })
    .format(new Date(match.startsAt))
    .replace(":", "h");
}

export function matchSignal(match: Match, now = new Date()) {
  if (isLiveMatch(match)) {
    return { label: "A decorrer", tone: "live" as const };
  }

  if (!match.startsAt || isFinishedMatch(match)) {
    return null;
  }

  const startsAt = new Date(match.startsAt);
  const diffMinutes = Math.round((startsAt.getTime() - now.getTime()) / 60000);

  if (diffMinutes < 0 && match.status === "Por atualizar") {
    return { label: "Pode já ter começado", tone: "warning" as const };
  }

  if (diffMinutes >= 0 && diffMinutes <= 90) {
    if (diffMinutes <= 1) return { label: "Começa agora", tone: "soon" as const };
    return { label: `Começa em ${diffMinutes} min`, tone: "soon" as const };
  }

  if (match.status === "Hoje") {
    return { label: `Hoje às ${kickoffTimeText(match)}`, tone: "today" as const };
  }

  return null;
}
