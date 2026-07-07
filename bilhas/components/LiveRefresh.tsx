"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type LiveRefreshProps = {
  intervalMs?: number;
  updatedAt?: string | null;
};

function formatUpdatedAt(value?: string | null) {
  if (!value) return "a aguardar dados";

  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/Lisbon",
  }).format(new Date(value));
}

export function LiveRefresh({ intervalMs = 25_000, updatedAt }: LiveRefreshProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastTick, setLastTick] = useState(() => Date.now());

  useEffect(() => {
    function refresh() {
      if (document.visibilityState !== "visible") return;

      setLastTick(Date.now());
      startTransition(() => {
        router.refresh();
      });
    }

    const interval = window.setInterval(refresh, intervalMs);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [intervalMs, router]);

  return (
    <div className="live-refresh" aria-live="polite">
      <span className="live-dot" />
      <span>{isPending ? "A atualizar..." : "Atualização automática ativa"}</span>
      <small>
        BD {formatUpdatedAt(updatedAt)} · check {formatUpdatedAt(new Date(lastTick).toISOString())}
      </small>
    </div>
  );
}
