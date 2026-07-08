import { requireDatabase } from "./db";
import {
  getWorldCupGames,
  mapWorldCupGame,
  parseWorldCupDate,
  worldCupPublicId,
  worldCupTeamColor,
  worldCupTeamName,
  worldCupTeamShortName,
  type WorldCupGame,
} from "./worldcup";

type SyncStats = {
  comments: number;
  events: number;
  matches: number;
  teams: number;
};

function isDefaultSyncRelevant(game: WorldCupGame, now = new Date()) {
  const date = parseWorldCupDate(game);
  if (!date) return false;

  const threeDaysAgo = new Date(now);
  threeDaysAgo.setUTCDate(now.getUTCDate() - 3);
  threeDaysAgo.setUTCHours(0, 0, 0, 0);

  const fourteenDaysAhead = new Date(now);
  fourteenDaysAhead.setUTCDate(now.getUTCDate() + 14);
  fourteenDaysAhead.setUTCHours(23, 59, 59, 999);

  return date >= threeDaysAgo && date <= fourteenDaysAhead;
}

function dbStatus(status: string) {
  const labels: Record<string, string> = {
    Agendado: "scheduled",
    "Ao vivo": "live",
    Hoje: "scheduled",
    Terminado: "finished",
  };

  return labels[status] ?? "scheduled";
}

function eventType(type: string) {
  const labels: Record<string, string> = {
    Golo: "goal",
  };

  return labels[type] ?? "other";
}

function eventExternalId(matchId: string, minute: string, type: string, player?: string) {
  return [matchId, type, minute, player ?? "event"]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function upsertTeam(externalId: string | undefined, fallback: string) {
  const sql = requireDatabase();
  const sourceId = externalId ? `worldcup:${externalId}` : `worldcup:${fallback}`;
  const name = worldCupTeamName(externalId ?? fallback);
  const shortName = worldCupTeamShortName(externalId ?? fallback);
  const color = worldCupTeamColor(externalId ?? fallback);

  const rows = await sql<{ id: string }[]>`
    INSERT INTO teams (external_id, name, short_name, color)
    VALUES (${sourceId}, ${name}, ${shortName || "TBD"}, ${color})
    ON CONFLICT (external_id) DO UPDATE SET
      name = EXCLUDED.name,
      short_name = EXCLUDED.short_name,
      color = EXCLUDED.color
    RETURNING id
  `;

  return rows[0].id;
}

async function upsertGame(game: WorldCupGame) {
  const sql = requireDatabase();
  const match = mapWorldCupGame(game);
  const homeTeamId = await upsertTeam(game.home_team_name_en, `home-${game.id}`);
  const awayTeamId = await upsertTeam(game.away_team_name_en, `away-${game.id}`);
  const startsAt = parseWorldCupDate(game);

  const matchRows = await sql<{ id: string }[]>`
    INSERT INTO matches (
      public_id,
      external_id,
      competition,
      starts_at,
      minute,
      status,
      home_team_id,
      away_team_id,
      home_score,
      away_score
    )
    VALUES (
      ${worldCupPublicId(game)},
      ${`worldcup:${game.id}`},
      ${match.competition},
      ${startsAt},
      ${match.minute},
      ${dbStatus(match.status)}::match_status,
      ${homeTeamId},
      ${awayTeamId},
      ${match.home.score},
      ${match.away.score}
    )
    ON CONFLICT (external_id) DO UPDATE SET
      public_id = EXCLUDED.public_id,
      competition = EXCLUDED.competition,
      starts_at = EXCLUDED.starts_at,
      minute = EXCLUDED.minute,
      status = EXCLUDED.status,
      home_team_id = EXCLUDED.home_team_id,
      away_team_id = EXCLUDED.away_team_id,
      home_score = EXCLUDED.home_score,
      away_score = EXCLUDED.away_score
    RETURNING id
  `;

  const matchId = matchRows[0].id;
  let events = 0;
  let comments = 0;

  for (const event of match.events) {
    const rows = await sql<{ id: string }[]>`
      INSERT INTO match_events (
        match_id,
        external_id,
        minute,
        event_type,
        payload,
        description
      )
      VALUES (
        ${matchId},
        ${eventExternalId(match.id, event.minute, event.type, event.player)},
        ${event.minute},
        ${eventType(event.type)}::match_event_type,
        ${sql.json({
          concedingTeam: event.concedingTeam,
          scoringTeam: event.scoringTeam,
        })},
        ${event.text}
      )
      ON CONFLICT (match_id, external_id) DO UPDATE SET
        minute = EXCLUDED.minute,
        event_type = EXCLUDED.event_type,
        payload = EXCLUDED.payload,
        description = EXCLUDED.description
      RETURNING id
    `;

    events += rows.length;
  }

  for (const comment of match.comments) {
    const rows = await sql<{ id: string }[]>`
      INSERT INTO bilhas_comments (
        public_id,
        match_id,
        minute,
        intensity,
        body,
        featured,
        published_at
      )
      VALUES (
        ${comment.id},
        ${matchId},
        ${comment.minute},
        ${comment.intensity}::comment_intensity,
        ${comment.text},
        ${comment.featured},
        now()
      )
      ON CONFLICT (public_id) DO UPDATE SET
        minute = EXCLUDED.minute,
        intensity = EXCLUDED.intensity,
        body = EXCLUDED.body,
        featured = EXCLUDED.featured,
        published_at = COALESCE(bilhas_comments.published_at, now()),
        updated_at = now()
      RETURNING id
    `;

    comments += rows.length;
  }

  if (match.events.length > 0) {
    const automaticCommentIds = match.comments.map((comment) => comment.id);

    await sql`
      UPDATE bilhas_comments
      SET published_at = NULL, updated_at = now()
      WHERE match_id = ${matchId}
        AND public_id = ${`wc-${game.id}-pre`}
    `;

    await sql`
      UPDATE bilhas_comments
      SET published_at = NULL, updated_at = now()
      WHERE match_id = ${matchId}
        AND public_id LIKE ${`wc-${game.id}-%`}
        AND public_id <> ALL(${automaticCommentIds})
    `;
  }

  if (match.comments.length === 0) {
    await sql`
      UPDATE bilhas_comments
      SET published_at = NULL, updated_at = now()
      WHERE match_id = ${matchId}
        AND public_id LIKE ${`wc-${game.id}-%`}
    `;
  }

  if (match.comments.length > 0) {
    const visibleRows = await sql<{ count: string }[]>`
      SELECT count(*) AS count
      FROM bilhas_comments
      WHERE match_id = ${matchId}
        AND published_at IS NOT NULL
    `;

    if (Number(visibleRows[0]?.count ?? 0) === 0) {
      await sql`
        UPDATE bilhas_comments
        SET published_at = now(), updated_at = now()
        WHERE public_id = ${match.comments[0].id}
      `;
    }
  }

  return { comments, events, matches: 1, teams: 2 };
}

export async function syncWorldCupToDatabase(ids?: string[]): Promise<SyncStats> {
  const games = await getWorldCupGames();
  const selectedGames = ids?.length ? games.filter((game) => ids.includes(game.id)) : games.filter((game) => isDefaultSyncRelevant(game));
  const stats: SyncStats = { comments: 0, events: 0, matches: 0, teams: 0 };

  for (const game of selectedGames) {
    const result = await upsertGame(game);
    stats.comments += result.comments;
    stats.events += result.events;
    stats.matches += result.matches;
    stats.teams += result.teams;
  }

  return stats;
}
