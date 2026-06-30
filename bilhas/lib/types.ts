export type Team = {
  name: string;
  short: string;
  score: number | null;
  color: string;
};

export type MatchEvent = {
  minute: string;
  type: string;
  player?: string;
  text: string;
};

export type BilhasComment = {
  id: string;
  minute: string;
  intensity: "leve" | "medio" | "forte" | "absurdo";
  featured: boolean;
  text: string;
};

export type Match = {
  id: string;
  competition: string;
  minute: string;
  status: string;
  home: Team;
  away: Team;
  events: MatchEvent[];
  comments: BilhasComment[];
};

export type SuggestionRequest = {
  minute: string;
  player: string;
  event: string;
  intensity: BilhasComment["intensity"];
};
