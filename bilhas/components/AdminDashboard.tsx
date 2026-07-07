"use client";

import { useMemo, useState } from "react";
import type { AdminBilhasComment, AdminMatch, BilhasComment } from "@/lib/types";

type Message = {
  tone: "success" | "danger";
  text: string;
};

type DraftComment = Pick<AdminBilhasComment, "featured" | "intensity" | "minute" | "text"> & {
  published: boolean;
};

const intensityOptions: BilhasComment["intensity"][] = ["leve", "medio", "forte", "absurdo"];

function score(match: AdminMatch) {
  const home = match.home.score ?? "-";
  const away = match.away.score ?? "-";
  return `${home}-${away}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Sem data";

  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Lisbon",
  }).format(new Date(value));
}

function makeDraft(comment: AdminBilhasComment): DraftComment {
  return {
    featured: comment.featured,
    intensity: comment.intensity,
    minute: comment.minute,
    published: Boolean(comment.publishedAt),
    text: comment.text,
  };
}

export function AdminDashboard({ matches }: { matches: AdminMatch[] }) {
  const [items, setItems] = useState(matches);
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id ?? "");
  const [editorSecret, setEditorSecret] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [manual, setManual] = useState<DraftComment>({
    featured: true,
    intensity: "medio",
    minute: "Pre",
    published: true,
    text: "",
  });
  const [drafts, setDrafts] = useState<Record<string, DraftComment>>(() =>
    Object.fromEntries(matches.flatMap((match) => match.comments.map((comment) => [comment.id, makeDraft(comment)]))),
  );

  const selectedMatch = useMemo(
    () => items.find((match) => match.id === selectedMatchId) ?? items[0],
    [items, selectedMatchId],
  );

  function authHeaders() {
    return {
      "content-type": "application/json",
      ...(editorSecret ? { "x-bilhas-editor-secret": editorSecret } : {}),
    };
  }

  function show(tone: Message["tone"], text: string) {
    setMessage({ tone, text });
  }

  function updateDraft(id: string, patch: Partial<DraftComment>) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }

  async function createManualComment() {
    if (!selectedMatch || !manual.text.trim()) {
      show("danger", "Escolhe um jogo e escreve o comentário manual.");
      return;
    }

    setBusy("create");
    const response = await fetch("/api/ticker/comments", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        featured: manual.featured,
        intensity: manual.intensity,
        matchId: selectedMatch.id,
        minute: manual.minute,
        text: manual.text,
      }),
    });
    const data = (await response.json()) as { error?: string; id?: string; ok?: boolean };
    setBusy(null);

    if (!response.ok || !data.ok || !data.id) {
      show("danger", data.error ?? "Não foi possível criar o comentário.");
      return;
    }

    const created: AdminBilhasComment = {
      id: data.id,
      featured: manual.featured,
      intensity: manual.intensity,
      minute: manual.minute,
      publishedAt: new Date().toISOString(),
      text: manual.text,
    };

    setItems((current) =>
      current.map((match) =>
        match.id === selectedMatch.id ? { ...match, comments: [created, ...match.comments] } : match,
      ),
    );
    setDrafts((current) => ({ ...current, [created.id]: makeDraft(created) }));
    setManual((current) => ({ ...current, text: "" }));
    show("success", "Comentário criado e publicado.");
  }

  async function saveComment(comment: AdminBilhasComment) {
    const draft = drafts[comment.id];
    if (!draft?.text.trim()) {
      show("danger", "O comentário não pode ficar vazio.");
      return;
    }

    setBusy(comment.id);
    const response = await fetch(`/api/admin/comments/${comment.id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(draft),
    });
    const data = (await response.json()) as { error?: string; ok?: boolean };
    setBusy(null);

    if (!response.ok || !data.ok) {
      show("danger", data.error ?? "Não foi possível guardar.");
      return;
    }

    setItems((current) =>
      current.map((match) => ({
        ...match,
        comments: match.comments.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                featured: draft.featured,
                intensity: draft.intensity,
                minute: draft.minute,
                publishedAt: draft.published ? (item.publishedAt ?? new Date().toISOString()) : null,
                text: draft.text,
              }
            : item,
        ),
      })),
    );
    show("success", "Comentário atualizado.");
  }

  async function deleteComment(comment: AdminBilhasComment) {
    const confirmed = window.confirm("Apagar este comentário do Bilhas?");
    if (!confirmed) return;

    setBusy(comment.id);
    const response = await fetch(`/api/admin/comments/${comment.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = (await response.json()) as { error?: string; ok?: boolean };
    setBusy(null);

    if (!response.ok || !data.ok) {
      show("danger", data.error ?? "Não foi possível apagar.");
      return;
    }

    setItems((current) =>
      current.map((match) => ({ ...match, comments: match.comments.filter((item) => item.id !== comment.id) })),
    );
    show("success", "Comentário apagado.");
  }

  async function syncMatch() {
    if (!selectedMatch) return;

    setBusy("sync");
    const response = await fetch("/api/admin/sync", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ matchId: selectedMatch.id }),
    });
    const data = (await response.json()) as { error?: string; ok?: boolean; stats?: unknown };
    setBusy(null);

    if (!response.ok || !data.ok) {
      show("danger", data.error ?? "Não foi possível sincronizar.");
      return;
    }

    show("success", "Sync executado. A página vai atualizar os dados.");
    window.setTimeout(() => window.location.reload(), 900);
  }

  if (!selectedMatch) {
    return <p className="pill danger">Ainda não há jogos para gerir.</p>;
  }

  return (
    <section className="admin-dashboard">
      <div className="admin-toolbar panel">
        <label>
          Chave editorial
          <input
            placeholder="EDITOR_SECRET ou SYNC_SECRET"
            type="password"
            value={editorSecret}
            onChange={(event) => setEditorSecret(event.target.value)}
          />
        </label>
        <label>
          Jogo
          <select value={selectedMatch.id} onChange={(event) => setSelectedMatchId(event.target.value)}>
            {items.map((match) => (
              <option key={match.id} value={match.id}>
                {match.home.name} vs {match.away.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-layout">
        <aside className="admin-match-list panel">
          <h2>Jogos</h2>
          {items.map((match) => (
            <button
              className={match.id === selectedMatch.id ? "admin-match active" : "admin-match"}
              key={match.id}
              type="button"
              onClick={() => setSelectedMatchId(match.id)}
            >
              <span>
                {match.home.name} vs {match.away.name}
              </span>
              <strong>
                {score(match)} · {match.status}
              </strong>
            </button>
          ))}
        </aside>

        <div className="admin-workspace">
          <section className="admin-status panel">
            <div>
              <span className="eyebrow admin-eyebrow">Estado do jogo</span>
              <h2>
                {selectedMatch.home.name} vs {selectedMatch.away.name}
              </h2>
            </div>
            <div className="admin-metrics">
              <span className="pill">{selectedMatch.status}</span>
              <span className="pill">Resultado {score(selectedMatch)}</span>
              <span className="pill">Minuto {selectedMatch.minute || "-"}</span>
              <span className="pill">{selectedMatch.events.length} eventos</span>
              <span className="pill">{selectedMatch.comments.length} comentários</span>
            </div>
            <div className="admin-sync-row">
              <small>
                Início: {formatDate(selectedMatch.startsAt)} · Última atualização:{" "}
                {formatDate(selectedMatch.updatedAt)}
              </small>
              <button className="button primary" disabled={busy === "sync"} type="button" onClick={syncMatch}>
                {busy === "sync" ? "A sincronizar..." : "Forçar sync deste jogo"}
              </button>
            </div>
          </section>

          <section className="admin-editor panel">
            <h2>Criar comentário manual</h2>
            <div className="admin-comment-grid">
              <input value={manual.minute} onChange={(event) => setManual({ ...manual, minute: event.target.value })} />
              <select
                value={manual.intensity}
                onChange={(event) => setManual({ ...manual, intensity: event.target.value as BilhasComment["intensity"] })}
              >
                {intensityOptions.map((intensity) => (
                  <option key={intensity} value={intensity}>
                    {intensity === "medio" ? "médio" : intensity}
                  </option>
                ))}
              </select>
              <label className="admin-check">
                <input
                  checked={manual.featured}
                  type="checkbox"
                  onChange={(event) => setManual({ ...manual, featured: event.target.checked })}
                />
                destaque
              </label>
            </div>
            <textarea
              placeholder="Escreve aqui a frase do Bilhas para este jogo."
              value={manual.text}
              onChange={(event) => setManual({ ...manual, text: event.target.value })}
            />
            <button className="button primary" disabled={busy === "create"} type="button" onClick={createManualComment}>
              {busy === "create" ? "A criar..." : "Criar e publicar"}
            </button>
          </section>

          <section className="admin-editor panel">
            <h2>Comentários do jogo</h2>
            {selectedMatch.comments.length ? (
              <div className="admin-comments">
                {selectedMatch.comments.map((comment) => {
                  const draft = drafts[comment.id] ?? makeDraft(comment);

                  return (
                    <article className="admin-comment" key={comment.id}>
                      <div className="admin-comment-grid">
                        <input
                          aria-label="Minuto"
                          value={draft.minute}
                          onChange={(event) => updateDraft(comment.id, { minute: event.target.value })}
                        />
                        <select
                          aria-label="Intensidade"
                          value={draft.intensity}
                          onChange={(event) =>
                            updateDraft(comment.id, { intensity: event.target.value as BilhasComment["intensity"] })
                          }
                        >
                          {intensityOptions.map((intensity) => (
                            <option key={intensity} value={intensity}>
                              {intensity === "medio" ? "médio" : intensity}
                            </option>
                          ))}
                        </select>
                        <label className="admin-check">
                          <input
                            checked={draft.featured}
                            type="checkbox"
                            onChange={(event) => updateDraft(comment.id, { featured: event.target.checked })}
                          />
                          destaque
                        </label>
                        <label className="admin-check">
                          <input
                            checked={draft.published}
                            type="checkbox"
                            onChange={(event) => updateDraft(comment.id, { published: event.target.checked })}
                          />
                          público
                        </label>
                      </div>
                      <textarea value={draft.text} onChange={(event) => updateDraft(comment.id, { text: event.target.value })} />
                      <div className="admin-comment-actions">
                        <small>
                          {comment.id} · criado {formatDate(comment.createdAt)} ·{" "}
                          {draft.published ? "publicado" : "oculto"}
                        </small>
                        <span>
                          <button
                            className="button ghost"
                            disabled={busy === comment.id}
                            type="button"
                            onClick={() => deleteComment(comment)}
                          >
                            Apagar
                          </button>
                          <button
                            className="button primary"
                            disabled={busy === comment.id}
                            type="button"
                            onClick={() => saveComment(comment)}
                          >
                            {busy === comment.id ? "A guardar..." : "Guardar"}
                          </button>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="pill">Este jogo ainda não tem comentários.</p>
            )}
          </section>

          {message ? <p className={`pill ${message.tone}`}>{message.text}</p> : null}
        </div>
      </div>
    </section>
  );
}
