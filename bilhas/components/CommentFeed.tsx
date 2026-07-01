import { scoreText } from "@/lib/data";
import type { Match } from "@/lib/types";
import { MatchMedia } from "./MatchMedia";
import { ShareButtons } from "./ShareButtons";

export function CommentFeed({ match }: { match: Match }) {
  return (
    <section className="feed panel">
      <div className="feed-header">
        <h2>O Bilhas ao minuto</h2>
        <span className="pill">{match.comments.length} comentarios</span>
      </div>
      <div>
        {match.comments.map((comment) => (
          <article className={`comment ${comment.featured ? "featured" : ""}`} id={comment.id} key={comment.id}>
            <span className="comment-minute">{comment.minute}</span>
            <div className="comment-body">
              <MatchMedia media={comment.media} />
              <p>{comment.text}</p>
              <small>
                {comment.intensity}
                {comment.featured ? " · frase quente" : ""}
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
  );
}
