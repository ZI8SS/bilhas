import type { TickerMedia } from "@/lib/types";

function mediaLabel(media: TickerMedia) {
  if (media.credit && media.sourceUrl) return `Foto: ${media.credit}`;
  if (media.credit) return `Foto: ${media.credit}`;
  if (media.license) return media.license;

  return "Imagem editorial";
}

export function MatchMedia({ media }: { media?: TickerMedia | null }) {
  if (!media?.url) return null;

  const caption = mediaLabel(media);

  return (
    <figure className="match-media">
      <img src={media.url} alt={media.kind ?? "Imagem do jogo"} loading="lazy" />
      <figcaption>
        {media.sourceUrl ? (
          <a href={media.sourceUrl} rel="noreferrer" target="_blank">
            {caption}
          </a>
        ) : (
          caption
        )}
      </figcaption>
    </figure>
  );
}
