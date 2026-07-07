import type { Match } from "@/lib/types";
import { hasStarted, isFinishedMatch, isLiveMatch } from "@/lib/match-format";
import { MatchMedia } from "./MatchMedia";

function emptyEventText(match: Match) {
  if (isLiveMatch(match)) return "O jogo está a decorrer, mas a fonte ainda não enviou eventos detalhados.";
  if (isFinishedMatch(match)) return "A fonte não enviou eventos detalhados para este jogo.";
  if (hasStarted(match)) return "A hora de início já passou; estamos à espera da próxima sincronização.";

  return "O jogo ainda não começou.";
}

export function EventFeed({ match }: { match: Match }) {
  const events = match.events.length
    ? match.events
    : [{ minute: "-", type: "Sem eventos", text: emptyEventText(match) }];

  return (
    <section className="feed panel">
      <div className="feed-header">
        <h2>Eventos do jogo</h2>
        <span className="pill">{events.length} eventos</span>
      </div>
      <div>
        {events.map((event) => (
          <article className="event" key={`${event.minute}-${event.type}`}>
            <span className="event-minute">{event.minute}</span>
            <div className="event-body">
              <MatchMedia media={event.media} />
              <p>
                <strong>{event.type}</strong> · {event.text}
              </p>
              {"player" in event && event.player ? <small>{event.player}</small> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
