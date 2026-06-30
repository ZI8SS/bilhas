type MediaKind = "goal" | "referee" | "stadium" | "var";

const mediaByKind: Record<MediaKind, { alt: string; src: string }> = {
  goal: {
    alt: "Jogadores a festejar um golo",
    src: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
  },
  referee: {
    alt: "Arbitro em campo",
    src: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=900&q=80",
  },
  stadium: {
    alt: "Estadio de futebol",
    src: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80",
  },
  var: {
    alt: "Ecra de decisao no futebol",
    src: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=900&q=80",
  },
};

export function mediaKindFromText(text: string): MediaKind {
  const value = text.toLowerCase();

  if (value.includes("var")) return "var";
  if (value.includes("amarelo") || value.includes("vermelho") || value.includes("falta")) return "referee";
  if (value.includes("golo") || value.includes("marca") || value.includes("bola entrou")) return "goal";

  return "stadium";
}

export function MatchMedia({ kind }: { kind: MediaKind }) {
  const media = mediaByKind[kind];

  return (
    <figure className="match-media">
      <img src={media.src} alt={media.alt} loading="lazy" />
      <figcaption>Imagem editorial ilustrativa</figcaption>
    </figure>
  );
}
