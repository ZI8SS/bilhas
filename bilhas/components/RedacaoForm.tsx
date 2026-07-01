"use client";

import { useState } from "react";
import type { Match, SuggestionRequest } from "@/lib/types";

type SuggestionResponse = {
  suggestions: string[];
};

type PublishState = {
  error?: string;
  ok?: string;
};

export function RedacaoForm({ matches }: { matches: Match[] }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishState, setPublishState] = useState<PublishState>({});
  const [editorSecret, setEditorSecret] = useState("");
  const [form, setForm] = useState<SuggestionRequest>({
    matchId: matches[0]?.id,
    minute: "73'",
    player: "Bruno Varela",
    intensity: "medio",
    event: "Bruno Varela deixa escapar um remate defensavel de fora da area.",
    mediaUrl: "",
    mediaCredit: "",
    mediaSourceUrl: "",
    mediaLicense: "",
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setPublishState({});
    const response = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = (await response.json()) as SuggestionResponse;
    setSuggestions(data.suggestions);
    setLoading(false);
  }

  async function publish(text: string) {
    setPublishing(true);
    setPublishState({});

    const response = await fetch("/api/ticker/comments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(editorSecret ? { "x-bilhas-editor-secret": editorSecret } : {}),
      },
      body: JSON.stringify({
        featured: true,
        intensity: form.intensity,
        matchId: form.matchId,
        mediaCredit: form.mediaCredit,
        mediaKind: form.mediaUrl ? "imagem real do jogo" : "",
        mediaLicense: form.mediaLicense,
        mediaSourceUrl: form.mediaSourceUrl,
        mediaUrl: form.mediaUrl,
        minute: form.minute,
        text,
      }),
    });
    const data = (await response.json()) as { error?: string; id?: string; ok?: boolean };

    setPublishing(false);

    if (!response.ok || !data.ok) {
      setPublishState({ error: data.error ?? "Nao foi possivel publicar." });
      return;
    }

    setPublishState({ ok: `Publicado no ticker (${data.id}).` });
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
            <select value={form.matchId} onChange={(event) => update("matchId", event.target.value)}>
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
          <label>
            URL da imagem real
            <input
              placeholder="https://..."
              value={form.mediaUrl}
              onChange={(event) => update("mediaUrl", event.target.value)}
            />
          </label>
          <label>
            Credito da imagem
            <input
              placeholder="Ex: IMAGO / Getty / fotografo"
              value={form.mediaCredit}
              onChange={(event) => update("mediaCredit", event.target.value)}
            />
          </label>
          <label>
            Fonte/licenca
            <input
              placeholder="Ex: Licenca editorial, embed autorizado..."
              value={form.mediaLicense}
              onChange={(event) => update("mediaLicense", event.target.value)}
            />
          </label>
          <label>
            Link da fonte
            <input
              placeholder="https://..."
              value={form.mediaSourceUrl}
              onChange={(event) => update("mediaSourceUrl", event.target.value)}
            />
          </label>
          <label>
            Chave editorial
            <input
              placeholder="Obrigatoria em producao"
              type="password"
              value={editorSecret}
              onChange={(event) => setEditorSecret(event.target.value)}
            />
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
                <button className="button primary" disabled={publishing} type="button" onClick={() => publish(suggestion)}>
                  {publishing ? "A publicar..." : "Publicar no ticker"}
                </button>
              </div>
            ))
          ) : (
            <p className="pill">As frases aparecem aqui para a redacao escolher e afinar.</p>
          )}
          {publishState.ok ? <p className="pill success">{publishState.ok}</p> : null}
          {publishState.error ? <p className="pill danger">{publishState.error}</p> : null}
        </div>
      </aside>
    </section>
  );
}
