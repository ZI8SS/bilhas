import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentFeed } from "@/components/CommentFeed";
import { EventFeed } from "@/components/EventFeed";
import { MatchHero } from "@/components/MatchHero";
import { getMatch } from "@/lib/matches-repository";

export const dynamic = "force-dynamic";

type MatchPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function MatchPage({ params, searchParams }: MatchPageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const match = await getMatch(id);

  if (!match) notFound();

  const activeTab = tab === "eventos" ? "eventos" : "bilhas";

  return (
    <>
      <MatchHero match={match} />

      <div className="match-tabs" role="tablist" aria-label="Conteudo do jogo">
        <Link className={`tab-button ${activeTab === "bilhas" ? "active" : ""}`} href={`/jogos/${match.id}`}>
          Bilhas
        </Link>
        <Link
          className={`tab-button ${activeTab === "eventos" ? "active" : ""}`}
          href={`/jogos/${match.id}?tab=eventos`}
        >
          Eventos
        </Link>
        <Link className="button ghost" href="/">
          Voltar
        </Link>
      </div>

      {activeTab === "eventos" ? <EventFeed match={match} /> : <CommentFeed match={match} />}
    </>
  );
}
