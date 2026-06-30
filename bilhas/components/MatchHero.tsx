import type { CSSProperties } from "react";
import type { Match, Team } from "@/lib/types";
import { scoreText } from "@/lib/data";
import { timeText } from "@/lib/match-format";

function HeroTeam({ team }: { team: Team }) {
  return (
    <div className="match-team">
      <span className="crest" style={{ "--team-color": team.color } as CSSProperties}>
        {team.short[0]}
      </span>
      <strong>{team.name}</strong>
    </div>
  );
}

export function MatchHero({ match }: { match: Match }) {
  return (
    <section
      className="match-hero panel"
      style={
        {
          "--home-color": match.home.color,
          "--away-color": match.away.color,
        } as CSSProperties
      }
    >
      <div className="pitch-strip" aria-hidden="true" />
      <div className="match-heading">
        <HeroTeam team={match.home} />
        <div className="scoreboard">
          <span>
            {match.competition} · {timeText(match.minute)}
          </span>
          <strong>{scoreText(match)}</strong>
          <span>{match.status}</span>
        </div>
        <HeroTeam team={match.away} />
      </div>
    </section>
  );
}
