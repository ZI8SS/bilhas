import Link from "next/link";
import type { CSSProperties } from "react";
import { isLiveMatch, matchSignal, teamScoreText, timeText } from "@/lib/match-format";
import { matchDateLabel } from "@/lib/schedule";
import type { Match, Team } from "@/lib/types";

function TeamLine({ match, side, team }: { match: Match; side: "home" | "away"; team: Team }) {
  return (
    <div className="team">
      <span className="crest" style={{ "--team-color": team.color } as CSSProperties}>
        {team.short[0]}
      </span>
      <span className="team-name">{team.name}</span>
      <span className="score">{teamScoreText(match, side)}</span>
    </div>
  );
}

export function MatchRow({ match }: { match: Match }) {
  const signal = matchSignal(match);
  const rowClassName = ["match-row", signal ? `match-row-${signal.tone}` : "", isLiveMatch(match) ? "is-live" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={rowClassName}
      style={
        {
          "--home-color": match.home.color,
          "--away-color": match.away.color,
        } as CSSProperties
      }
    >
      <span className="minute">
        <strong>{timeText(match.minute)}</strong>
        <small>{matchDateLabel(match)}</small>
      </span>
      <div className="teams">
        <TeamLine match={match} side="home" team={match.home} />
        <TeamLine match={match} side="away" team={match.away} />
      </div>
      <div className="match-actions">
        {signal ? (
          <span className={`match-signal match-signal-${signal.tone}`}>
            {signal.tone === "live" ? <span className="live-dot" /> : null}
            {signal.label}
          </span>
        ) : null}
        <span className="pill">{match.status}</span>
        <Link className="button primary" href={`/jogos/${match.id}`}>
          Abrir
        </Link>
      </div>
    </article>
  );
}
