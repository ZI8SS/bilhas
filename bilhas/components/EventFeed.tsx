import type { Match } from "@/lib/types";
import { MatchMedia } from "./MatchMedia";

export function EventFeed({ match }: { match: Match }) {
  const events = match.events.length
    ? match.events
    : [{ minute: "-", type: "Sem eventos", text: "O jogo ainda não começou." }];

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
