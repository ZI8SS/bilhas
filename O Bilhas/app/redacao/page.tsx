import { RedacaoForm } from "@/components/RedacaoForm";
import { getMatches } from "@/lib/matches-repository";

export const dynamic = "force-dynamic";

export default async function RedacaoPage() {
  const matches = await getMatches();

  return (
    <>
      <section className="screen-title">
        <div>
          <h1>Redacao do Bilhas.</h1>
          <p>
            Painel interno: a equipa escolhe o jogo, confirma o lance, pede sugestoes a AI e so publica depois
            de editar/aprovar. Isto nao e uma caixa de comentarios publica.
          </p>
        </div>
      </section>

      <RedacaoForm matches={matches} />
    </>
  );
}
