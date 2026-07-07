import { scoreText } from "@/lib/data";
import { kickoffTimeText, timeText } from "@/lib/match-format";
import type { Match } from "@/lib/types";

function updatedAtText(value?: string | null) {
  if (!value) return "Sem sync";

  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Lisbon",
  }).format(new Date(value));
}

export function MatchFacts({ match }: { match: Match }) {
  const facts = [
    { label: "Estado", value: match.status },
    { label: "Minuto", value: timeText(match.minute) },
    { label: "Resultado", value: scoreText(match) },
    { label: "Início", value: kickoffTimeText(match) },
    { label: "Eventos", value: String(match.events.length) },
    { label: "Último sync", value: updatedAtText(match.updatedAt) },
  ];

  return (
    <section className="match-facts" aria-label="Informação live do jogo">
      {facts.map((fact) => (
        <div className="match-fact" key={fact.label}>
          <span>{fact.label}</span>
          <strong>{fact.value}</strong>
        </div>
      ))}
    </section>
  );
}
