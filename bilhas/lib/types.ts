export type Team = {
  name: string;
  short: string;
  score: number | null;
  color: string;
};

export type TickerMedia = {
  url: string;
  credit?: string | null;
  sourceUrl?: string | null;
  license?: string | null;
  kind?: string | null;
};

export type MatchEvent = {
  minute: string;
  type: string;
  player?: string;
  text: string;
  media?: TickerMedia | null;
};

export type BilhasComment = {
  id: string;
  minute: string;
  intensity: "leve" | "medio" | "forte" | "absurdo";
  featured: boolean;
  text: string;
  media?: TickerMedia | null;
};

export type Match = {
  id: string;
  competition: string;
  minute: string;
  status: string;
  startsAt?: string | null;
  home: Team;
  away: Team;
  events: MatchEvent[];
  comments: BilhasComment[];
};

export type SuggestionRequest = {
  matchId?: string;
  minute: string;
  player: string;
  event: string;
  intensity: BilhasComment["intensity"];
  mediaUrl?: string;
  mediaCredit?: string;
  mediaSourceUrl?: string;
  mediaLicense?: string;
};
