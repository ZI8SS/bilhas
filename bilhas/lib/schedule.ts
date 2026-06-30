import type { Match } from "./types";

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "long",
  weekday: "long",
});

const compactDateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "2-digit",
});

function dateKey(match: Match) {
  if (!match.startsAt) return "sem-data";
  return match.startsAt.slice(0, 10);
}

export function matchDateLabel(match: Match) {
  if (!match.startsAt) return "Data a confirmar";
  return compactDateFormatter.format(new Date(match.startsAt));
}

export function scheduleLabel(match: Match) {
  if (!match.startsAt) return "Data a confirmar";

  const date = new Date(match.startsAt);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const key = date.toISOString().slice(0, 10);
  const todayKey = today.toISOString().slice(0, 10);
  const tomorrowKey = tomorrow.toISOString().slice(0, 10);

  if (key === todayKey) return "Hoje";
  if (key === tomorrowKey) return "Amanha";

  return dateFormatter.format(date);
}

export function groupMatchesByDay(matches: Match[]) {
  const groups = new Map<string, Match[]>();

  for (const match of matches) {
    const key = dateKey(match);
    groups.set(key, [...(groups.get(key) ?? []), match]);
  }

  return [...groups.entries()].map(([key, items]) => ({
    key,
    label: key === "sem-data" ? "Data a confirmar" : scheduleLabel(items[0]),
    matches: items,
  }));
}
