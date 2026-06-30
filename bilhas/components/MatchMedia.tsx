type MediaKind = "goal" | "referee" | "stadium" | "var";

const mediaByKind: Record<MediaKind, { alt: string; src: string }> = {
  goal: {
    alt: "Jogadores a festejar um golo",
    src: "/media/goal.png",
  },
  referee: {
    alt: "Arbitro em campo",
    src: "/media/referee.png",
  },
  stadium: {
    alt: "Estadio de futebol",
    src: "/media/stadium.png",
  },
  var: {
    alt: "Ecra de decisao no futebol",
    src: "/media/var.png",
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
