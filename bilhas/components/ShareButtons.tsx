"use client";

import { useState } from "react";

type ShareButtonsProps = {
  title: string;
  text: string;
  path: string;
};

export function ShareButtons({ title, text, path }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  function sharePayload() {
    const url = `${window.location.origin}${path}`;
    const message = `${text}\n${url}`;

    return {
      encodedMessage: encodeURIComponent(message),
      encodedText: encodeURIComponent(text),
      encodedUrl: encodeURIComponent(url),
      message,
      url,
    };
  }

  async function copy() {
    const { message } = sharePayload();

    try {
      await navigator.clipboard.writeText(message);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = message;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setOpen(false);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function share() {
    setOpen((value) => !value);
  }

  async function systemShare() {
    if (!navigator.share) return;

    try {
      const { url } = sharePayload();
      await navigator.share({ title, text, url });
      setOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  const payload = typeof window === "undefined" ? null : sharePayload();

  return (
    <div className="share-cluster">
      <button className="share-button" type="button" aria-expanded={open} onClick={share}>
        <span aria-hidden="true">↗</span>
        Partilhar
      </button>
      <button className="copy-button" type="button" onClick={copy}>
        {copied ? "Copiado" : "Copiar"}
      </button>
      {open && payload ? (
        <div className="share-menu">
          <a href={`https://wa.me/?text=${payload.encodedMessage}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${payload.encodedText}&url=${payload.encodedUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            X
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${payload.encodedUrl}`}
            target="_blank"
            rel="noreferrer"
          >
            Facebook
          </a>
          <a href={`https://t.me/share/url?url=${payload.encodedUrl}&text=${payload.encodedText}`} target="_blank" rel="noreferrer">
            Telegram
          </a>
          {typeof navigator !== "undefined" && "share" in navigator ? (
            <button type="button" onClick={systemShare}>
              Sistema
            </button>
          ) : null}
          <button type="button" onClick={copy}>
            Copiar link
          </button>
        </div>
      ) : null}
    </div>
  );
}
