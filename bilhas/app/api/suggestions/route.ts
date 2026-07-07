import { NextResponse } from "next/server";
import type { SuggestionRequest } from "@/lib/types";

const templates: Record<SuggestionRequest["intensity"], string[]> = {
  leve: [
    "{minute}. {player} entrou no lance com cara de quem vinha so buscar pao e acabou numa assembleia de condominio.",
    "{player} tentou resolver isto com calma. A bola preferiu uma abordagem mais telenovela das nove.",
    "O lance parecia simples, que e geralmente o primeiro erro antes de uma coisa deixar de ser simples.",
    "{player} fez ali uma coisa discreta, mas discreta como vizinho que arrasta moveis as duas da manha.",
    "Isto teve aquele ritmo de domingo a tarde: nao muda a vida de ninguem, mas ficamos a comentar na mesma.",
    "{player} apareceu bem. Nao salvou a patria, mas tambem nao obrigou ninguem a chamar uma reuniao de crise.",
    "A jogada passou pelo relvado com ar de quem sabe onde vai, mesmo que o GPS esteja claramente a mentir.",
    "{event}. Dito assim parece normal; visto com olhos, ja pede uma pequena auditoria emocional.",
  ],
  medio: [
    "{minute}. {player} tinha isto controlado ate o futebol pedir comprovativo. Nao havia.",
    "O lance foi resolvido com a serenidade de uma reparticao publica as 16h58: tecnicamente aberto, espiritualmente fechado.",
    "{player} entrou na jogada como quem entra num restaurante caro sem ver os precos: confiante demais, tarde demais.",
    "A equipa tentou parecer adulta. Durou pouco, como promessa de ano novo feita ainda com passas na boca.",
    "{event}. Ha frases que no relatorio parecem neutras; esta no relvado parecia uma notificacao das Financas.",
    "Isto teve energia de filme portugues com baixo orcamento: muita intencao, dois sustos e alguem a olhar para longe.",
    "{player} deixou a jogada num estado que a Protecao Civil classificaria como amarelo carregado.",
    "O lance ficou tao aberto que parecia discussao sobre obras em casa: toda a gente tinha uma ideia e nenhuma resolvia.",
    "A bola andou ali como rumor em grupo de WhatsApp: passou por muita gente e chegou ao fim mais perigosa.",
  ],
  forte: [
    "{minute}. {player} tomou uma decisao tao discutivel que ate uma caixa de comentarios pediria intervalo.",
    "Isto nao foi azar, foi uma candidatura espontanea ao Museu Nacional das Mas Ideias.",
    "{player} ficou tao exposto que por momentos pareceu conferencia de imprensa sem assessor e com microfone aberto.",
    "A defesa abriu-se com a disciplina de fila de embarque low-cost: muita intencao, zero civilizacao.",
    "{event}. Este lance devia vir com aviso: pode ferir sensibilidades, estatisticas e contratos de renovacao.",
    "{player} fez ali uma escolha com aroma a comissao parlamentar: muita explicacao futura e pouca conviccao presente.",
    "A jogada teve menos controlo do que caixa de comentarios em noite eleitoral.",
    "Se isto fosse no Parlamento, ja havia tres versoes, duas indignacoes e uma pessoa a dizer que foi mal interpretada.",
    "A equipa ficou a defender como quem perdeu o comando e esta a ver publicidade por respeito ao sofrimento.",
  ],
  absurdo: [
    "A bola passou por {player} com a naturalidade de quem tem passe anual e cumprimenta o seguranca pelo nome.",
    "{player} transformou o lance num parecer juridico: longo, confuso e no fim ninguem ficou satisfeito.",
    "Se isto fosse cinema, o realizador cortava a cena por falta de verosimilhanca e excesso de vergonha alheia.",
    "O relvado viu coisas hoje. E, honestamente, talvez precise de ferias e uma conversa com alguem de confianca.",
    "{event}. A jogada teve mais buracos do que um orcamento explicado em direto na televisao.",
    "{player} tratou o lance como cinema de autor: ninguem percebeu tudo, mas houve sofrimento com enquadramento.",
    "Isto foi tao estranho que ate o algoritmo das redes sociais pediria contexto adicional.",
    "{minute}. A jogada parecia escrita por alguem que adormeceu no VAR e acordou num debate sobre rotundas.",
    "Houve ali um segundo em que o futebol deixou de ser desporto e passou a ser conteudo para explicar ao jantar.",
  ],
};

function pickTemplates(intensity: SuggestionRequest["intensity"], seed: string) {
  const list = templates[intensity];
  const start = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0) % list.length;

  return [0, 1, 2].map((offset) => list[(start + offset) % list.length]);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SuggestionRequest>;
  const player = body.player?.trim() || "o jogador";
  const intensity = body.intensity && body.intensity in templates ? body.intensity : "medio";
  const event = body.event?.trim() || "lance do jogo";
  const minute = body.minute?.trim() || "agora";

  const suggestions = pickTemplates(intensity, `${player}-${event}-${minute}`)
    .map((template) =>
      template
        .replaceAll("{event}", event)
        .replaceAll("{minute}", minute)
        .replaceAll("{player}", player),
    );

  return NextResponse.json({
    minute,
    event,
    suggestions,
  });
}
