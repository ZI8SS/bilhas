"use client";

import { useState } from "react";

type ShareButtonsProps = {
  title: string;
  text: string;
  path: string;
};

export function ShareButtons({ title, text, path }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(`${text}\n${url}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function share() {
    const url = `${window.location.origin}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    await copy();
  }

  return (
    <div className="share-cluster">
      <button className="icon-button" type="button" title="Partilhar" onClick={share}>
        ↗
      </button>
      <button className="icon-button" type="button" title="Copiar" onClick={copy}>
        {copied ? "✓" : "⧉"}
      </button>
    </div>
  );
}
