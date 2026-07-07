import { ShareButtons } from "@/components/ShareButtons";
import { scoreText } from "@/lib/data";
import { featuredComments } from "@/lib/matches-repository";

export const dynamic = "force-dynamic";

export default async function FrasesPage() {
  const quotes = await featuredComments();

  return (
    <>
      <section className="screen-title">
        <div>
          <h1>As frases que sobreviveram ao jogo.</h1>
          <p>Arquivo rápido dos comentários mais partilháveis. No produto real, isto vira ranking da jornada.</p>
        </div>
      </section>

      <section className="feed panel">
        <div>
          {quotes.map(({ match, comment }) => (
            <article className="comment featured" key={`${match.id}-${comment.id}`}>
              <span className="comment-minute">{comment.minute}</span>
              <div className="comment-body">
                <p>{comment.text}</p>
                <small>
                  {match.home.short} {scoreText(match)} {match.away.short}
                </small>
              </div>
              <ShareButtons
                title={`Bilhas · ${match.home.short} ${scoreText(match)} ${match.away.short}`}
                text={`${comment.minute} ${comment.text}`}
                path={`/jogos/${match.id}#${comment.id}`}
              />
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
