"use client";

import { useState } from "react";
import type { Match, SuggestionRequest } from "@/lib/types";

type SuggestionResponse = {
  suggestions: string[];
};

export function RedacaoForm({ matches }: { matches: Match[] }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<SuggestionRequest>({
    minute: "73'",
    player: "Bruno Varela",
    intensity: "medio",
    event: "Bruno Varela deixa escapar um remate defensavel de fora da area.",
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await response.json()) as SuggestionResponse;
    setSuggestions(data.suggestions);
    setLoading(false);
  }

  function update<K extends keyof SuggestionRequest>(key: K, value: SuggestionRequest[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="layout">
      <form className="admin-panel panel" onSubmit={submit}>
        <h2>Gerar sugestoes internas</h2>
        <div className="form-grid">
          <label>
            Jogo
            <select defaultValue={matches[0]?.id}>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.home.name} vs {match.away.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Minuto
            <input value={form.minute} onChange={(event) => update("minute", event.target.value)} />
          </label>
          <label>
            Jogador
            <input value={form.player} onChange={(event) => update("player", event.target.value)} />
          </label>
          <label>
            Intensidade
            <select
              value={form.intensity}
              onChange={(event) => update("intensity", event.target.value as SuggestionRequest["intensity"])}
            >
              <option value="leve">leve</option>
              <option value="medio">medio</option>
              <option value="forte">forte</option>
              <option value="absurdo">absurdo</option>
            </select>
          </label>
          <label>
            Evento
            <textarea value={form.event} onChange={(event) => update("event", event.target.value)} />
          </label>
          <button className="button primary" disabled={loading} type="submit">
            {loading ? "A pensar..." : "Gerar"}
          </button>
        </div>
      </form>

      <aside className="side-panel panel">
        <h2>Sugestoes</h2>
        <div className="generated">
          {suggestions.length ? (
            suggestions.map((suggestion, index) => (
              <div className="best-quote" key={suggestion}>
                <strong>
                  {form.minute} · {form.intensity} · opcao {index + 1}
                </strong>
                <p>{suggestion}</p>
              </div>
            ))
          ) : (
            <p className="pill">As frases aparecem aqui para a redacao escolher e afinar.</p>
          )}
        </div>
      </aside>
    </section>
  );
}
