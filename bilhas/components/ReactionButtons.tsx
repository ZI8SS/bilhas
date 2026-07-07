"use client";

import { useEffect, useState } from "react";

type ReactionButtonsProps = {
  commentId: string;
};

const reactions = [
  { emoji: "❤️", label: "Gostei" },
  { emoji: "🤣", label: "Ri-me" },
  { emoji: "👏", label: "Palmas" },
  { emoji: "😮", label: "Surpreendido" },
  { emoji: "👎", label: "Não curti" },
];

function storageKey(commentId: string) {
  return `bilhas:reaction:${commentId}`;
}

export function ReactionButtons({ commentId }: ReactionButtonsProps) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(window.localStorage.getItem(storageKey(commentId)));
  }, [commentId]);

  function react(label: string) {
    const next = selected === label ? null : label;
    setSelected(next);

    if (next) {
      window.localStorage.setItem(storageKey(commentId), next);
    } else {
      window.localStorage.removeItem(storageKey(commentId));
    }
  }

  return (
    <div className="reaction-row" aria-label="Reações ao comentário">
      {reactions.map((reaction) => (
        <button
          aria-pressed={selected === reaction.label}
          className={selected === reaction.label ? "reaction-button active" : "reaction-button"}
          key={reaction.label}
          title={reaction.label}
          type="button"
          onClick={() => react(reaction.label)}
        >
          <span aria-hidden="true">{reaction.emoji}</span>
          <span className="sr-only">{reaction.label}</span>
        </button>
      ))}
    </div>
  );
}
