import Link from "next/link";
import { MatchRow } from "@/components/MatchRow";
import { scoreText } from "@/lib/data";
import { featuredComments, getMatches } from "@/lib/matches-repository";
import { groupMatchesByDay } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const matches = await getMatches();
  const liveMatches = matches.filter((match) => match.status === "Ao vivo" || match.status === "A decorrer").length;
  const best = await featuredComments();
  const schedule = groupMatchesByDay(matches);

  return (
    <>
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Mundial 2026 com má língua saudável</span>
          <h1>Jogos ao vivo, mas com alguém acordado a escrever.</h1>
          <p>
            Segue os jogos do Mundial, apanha os momentos estranhos e partilha a frase do Bilhas quando o VAR,
            o frango ou a defesa pedirem intervenção editorial.
          </p>
        </div>
        <span className="pill">
          <span className="live-dot" />
          {liveMatches} jogo ao vivo
        </span>
      </section>

      <section className="layout">
        <div className="schedule-list panel" aria-label="Agenda do Mundial">
          {schedule.map((group) => (
            <section className="schedule-day" key={group.key}>
              <header className="schedule-day-header">
                <h2>{group.label}</h2>
                <span className="pill">{group.matches.length} jogos</span>
              </header>
              <div className="match-list">
                {group.matches.map((match) => (
                  <MatchRow match={match} key={match.id} />
                ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="side-panel panel">
          <h2>Frases quentes</h2>
          <div className="best-list">
            {best.map(({ match, comment }) => (
              <Link className="best-quote" href={`/jogos/${match.id}#${comment.id}`} key={`${match.id}-${comment.id}`}>
                <strong>
                  {match.home.short} {scoreText(match)} {match.away.short} · {comment.minute}
                </strong>
                <p>{comment.text}</p>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </>
  );
}
