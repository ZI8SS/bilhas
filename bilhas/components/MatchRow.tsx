import Link from "next/link";
import type { CSSProperties } from "react";
import type { Match, Team } from "@/lib/types";

function TeamLine({ team }: { team: Team }) {
  return (
    <div className="team">
      <span className="crest" style={{ "--team-color": team.color } as CSSProperties}>
        {team.short[0]}
      </span>
      <span className="team-name">{team.name}</span>
      <span className="score">{team.score ?? "-"}</span>
    </div>
  );
}

export function MatchRow({ match }: { match: Match }) {
  return (
    <article
      className="match-row"
      style={
        {
          "--home-color": match.home.color,
          "--away-color": match.away.color,
        } as CSSProperties
      }
    >
      <span className="minute">{match.minute}</span>
      <div className="teams">
        <TeamLine team={match.home} />
        <TeamLine team={match.away} />
      </div>
      <div className="match-actions">
        <span className="pill">{match.status}</span>
        <Link className="button primary" href={`/jogos/${match.id}`}>
          Abrir
        </Link>
      </div>
    </article>
  );
}
