import { matches as mockMatches } from "./data";
import { hasDatabase, requireDatabase } from "./db";
import type { BilhasComment, Match, MatchEvent } from "./types";
import { getWorldCupMatches } from "./worldcup";

type MatchRow = {
  public_id: string;
  competition: string;
  starts_at: Date | string | null;
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

function lisbonDayKey(value: Date | string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Lisbon",
    year: "numeric",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isToday(value: Date | string | null) {
  if (!value) return false;
  return lisbonDayKey(value) === lisbonDayKey(new Date());
}

function readableStatus(row: MatchRow) {
  if (row.status === "scheduled" && row.starts_at) {
    const startsAt = new Date(row.starts_at);
    const now = new Date();

    if (now.getTime() >= startsAt.getTime()) {
      return "Por atualizar";
    }

    return isToday(row.starts_at) ? "Hoje" : "Agendado";
  }

  const labels: Record<string, string> = {
    scheduled: "Hoje",
    live: "Ao vivo",
    half_time: "Intervalo",
    finished: "Terminado",
    postponed: "Adiado",
    cancelled: "Cancelado",
  };

  return labels[row.status] ?? row.status;
}

function mapMatch(row: MatchRow): Match {
  return {
    id: row.public_id,
    competition: row.competition,
    minute: row.minute,
    status: readableStatus(row),
    startsAt: row.starts_at ? new Date(row.starts_at).toISOString() : null,
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
      matches.starts_at,
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
          'scoringTeam', match_events.payload->>'scoringTeam',
          'concedingTeam', match_events.payload->>'concedingTeam',
          'text', match_events.description,
          'media', NULLIF(jsonb_strip_nulls(jsonb_build_object(
            'url', match_events.media_url,
            'credit', match_events.media_credit,
            'sourceUrl', match_events.media_source_url,
            'license', match_events.media_license,
            'kind', match_events.media_kind
          )), '{}'::jsonb)
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
          'text', bilhas_comments.body,
          'media', NULLIF(jsonb_strip_nulls(jsonb_build_object(
            'url', bilhas_comments.media_url,
            'credit', bilhas_comments.media_credit,
            'sourceUrl', bilhas_comments.media_source_url,
            'license', bilhas_comments.media_license,
            'kind', bilhas_comments.media_kind
          )), '{}'::jsonb)
        )
        ORDER BY
          CASE
            WHEN bilhas_comments.minute = 'Pre' THEN -1
            WHEN bilhas_comments.minute ~ '^[0-9]+' THEN substring(bilhas_comments.minute FROM '^[0-9]+')::int
            ELSE 999
          END,
          bilhas_comments.created_at
      ) AS items
      FROM bilhas_comments
      WHERE bilhas_comments.match_id = matches.id
        AND bilhas_comments.published_at IS NOT NULL
    ) comments ON true
    WHERE matches.starts_at IS NULL
      OR matches.starts_at BETWEEN now() - interval '2 days' AND now() + interval '14 days'
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
  const seenMatches = new Set<string>();
  const seenTexts = new Set<string>();

  return allMatches
    .flatMap((match) =>
      match.comments
        .filter((comment) => comment.featured)
        .map((comment) => ({ match, comment })),
    )
    .filter(({ match, comment }) => {
      const textKey = comment.text.toLowerCase().replace(/\s+/g, " ").slice(0, 80);
      if (seenMatches.has(match.id) || seenTexts.has(textKey)) return false;

      seenMatches.add(match.id);
      seenTexts.add(textKey);
      return true;
    })
    .slice(0, 8);
}
