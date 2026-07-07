import { AdminDashboard } from "@/components/AdminDashboard";
import { RedacaoForm } from "@/components/RedacaoForm";
import { getAdminMatches, getMatches } from "@/lib/matches-repository";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminMatches = await getAdminMatches();
  const matches = await getMatches();

  return (
    <>
      <section className="screen-title">
        <div>
          <h1>Admin do Bilhas.</h1>
          <p>
            Painel interno: a equipa escolhe o jogo, confirma o lance, pede sugestões à IA e só publica depois
            de editar/aprovar. Isto não é uma caixa de comentários pública.
          </p>
        </div>
      </section>

      <AdminDashboard matches={adminMatches} />
      <RedacaoForm matches={matches} />
    </>
  );
}
