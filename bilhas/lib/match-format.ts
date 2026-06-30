import type { Match } from "./types";

export function hasStarted(match: Match) {
  if (!match.startsAt) return false;
  return Date.now() >= new Date(match.startsAt).getTime();
}

export function scoreIsPublic(match: Match) {
  if (match.status === "Agendado") return false;
  if (match.status === "Hoje" && !hasStarted(match)) return false;
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
