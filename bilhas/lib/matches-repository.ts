import { matches as mockMatches } from "./data";
import { hasDatabase, requireDatabase } from "./db";
import type { BilhasComment, Match, MatchEvent } from "./types";
import { getWorldCupMatches } from "./worldcup";

type MatchRow = {
  public_id: string;
  competition: string;
  minute: string;
  status: string;
  home_name: string;
  home_short: string;
  home_color: string;
  home_score: number | null;
  away_name: string;
  away_short: string;
  away_color: string;
  away_score: number | null;
  events: MatchEvent[] | null;
  comments: BilhasComment[] | null;
};

function readableStatus(status: string) {
  const labels: Record<string, string> = {
    scheduled: "Hoje",
    live: "Ao vivo",
    half_time: "Intervalo",
    finished: "Terminado",
    postponed: "Adiado",
    cancelled: "Cancelado",
  };

  return labels[status] ?? status;
}

function mapMatch(row: MatchRow): Match {
  return {
    id: row.public_id,
    competition: row.competition,
    minute: row.minute,
    status: readableStatus(row.status),
    home: {
      name: row.home_name,
      short: row.home_short,
      color: row.home_color,
      score: row.home_score,
    },
    away: {
      name: row.away_name,
      short: row.away_short,
      color: row.away_color,
      score: row.away_score,
    },
    events: row.events ?? [],
    comments: row.comments ?? [],
  };
}

export async function getMatches(): Promise<Match[]> {
  if (!hasDatabase) {
    if (process.env.WORLD_CUP_SOURCE !== "disabled") {
      try {
        return await getWorldCupMatches();
      } catch (error) {
        console.error("World Cup source unavailable, falling back to local demo data.", error);
      }
    }

    if (process.env.NODE_ENV === "production" && process.env.ALLOW_MOCK_DATA !== "true") {
      requireDatabase();
    }

    return mockMatches;
  }

  const sql = requireDatabase();
  const rows = await sql<MatchRow[]>`
    SELECT
      matches.public_id,
      matches.competition,
      matches.minute,
      matches.status::text AS status,
      home.name AS home_name,
      home.short_name AS home_short,
      home.color AS home_color,
      matches.home_score,
      away.name AS away_name,
      away.short_name AS away_short,
      away.color AS away_color,
      matches.away_score,
      COALESCE(events.items, '[]'::jsonb) AS events,
      COALESCE(comments.items, '[]'::jsonb) AS comments
    FROM matches
    JOIN teams home ON home.id = matches.home_team_id
    JOIN teams away ON away.id = matches.away_team_id
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(
        jsonb_build_object(
          'minute', match_events.minute,
          'type', match_events.event_type::text,
          'player', players.display_name,
          'text', match_events.description
        )
        ORDER BY match_events.created_at
      ) AS items
      FROM match_events
      LEFT JOIN players ON players.id = match_events.player_id
      WHERE match_events.match_id = matches.id
    ) events ON true
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', bilhas_comments.public_id,
          'minute', bilhas_comments.minute,
          'intensity', bilhas_comments.intensity::text,
          'featured', bilhas_comments.featured,
          'text', bilhas_comments.body
        )
        ORDER BY bilhas_comments.created_at
      ) AS items
      FROM bilhas_comments
      WHERE bilhas_comments.match_id = matches.id
        AND bilhas_comments.published_at IS NOT NULL
    ) comments ON true
    ORDER BY matches.starts_at NULLS LAST, matches.created_at
  `;

  return rows.map(mapMatch);
}

export async function getMatch(id: string): Promise<Match | undefined> {
  const allMatches = await getMatches();
  return allMatches.find((match) => match.id === id);
}

export async function featuredComments() {
  const allMatches = await getMatches();

  return allMatches.flatMap((match) =>
    match.comments
      .filter((comment) => comment.featured)
      .map((comment) => ({ match, comment })),
  );
}
