"use client";

import { useState } from "react";

type ShareButtonsProps = {
  path: string;
  text: string;
  title: string;
};

export function ShareButtons({ path }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  function shareUrl() {
    return `${window.location.origin}${path}`;
  }

  async function copyLink() {
    const url = shareUrl();

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="share-cluster">
      <button className="share-button" type="button" onClick={copyLink}>
        <span aria-hidden="true">↗</span>
        {copied ? "Link copiado" : "Partilhar"}
      </button>
    </div>
  );
}
