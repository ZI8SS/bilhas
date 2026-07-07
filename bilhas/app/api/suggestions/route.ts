import { NextResponse } from "next/server";
import type { SuggestionRequest } from "@/lib/types";

const templates: Record<SuggestionRequest["intensity"], string[]> = {
  leve: [
    "{minute}. {player} entrou no lance com cara de quem vinha só buscar pão e acabou numa assembleia de condomínio.",
    "{player} tentou resolver isto com calma. A bola preferiu uma abordagem mais telenovela das nove.",
    "O lance parecia simples, que é geralmente o primeiro erro antes de uma coisa deixar de ser simples.",
    "{player} fez ali uma coisa discreta, mas discreta como vizinho que arrasta móveis às duas da manhã.",
    "Isto teve aquele ritmo de domingo à tarde: não muda a vida de ninguém, mas ficamos a comentar na mesma.",
    "{player} apareceu bem. Não salvou a pátria, mas também não obrigou ninguém a chamar uma reunião de crise.",
    "A jogada passou pelo relvado com ar de quem sabe onde vai, mesmo que o GPS esteja claramente a mentir.",
    "{event}. Dito assim parece normal; visto com olhos, já pede uma pequena auditoria emocional.",
  ],
  medio: [
    "{minute}. {player} tinha isto controlado até o futebol pedir comprovativo. Não havia.",
    "O lance foi resolvido com a serenidade de uma repartição pública às 16h58: tecnicamente aberto, espiritualmente fechado.",
    "{player} entrou na jogada como quem entra num restaurante caro sem ver os preços: confiante demais, tarde demais.",
    "A equipa tentou parecer adulta. Durou pouco, como promessa de ano novo feita ainda com passas na boca.",
    "{event}. Há frases que no relatório parecem neutras; esta no relvado parecia uma notificação das Finanças.",
    "Isto teve energia de filme português com baixo orçamento: muita intenção, dois sustos e alguém a olhar para longe.",
    "{player} deixou a jogada num estado que a Proteção Civil classificaria como amarelo carregado.",
    "O lance ficou tão aberto que parecia discussão sobre obras em casa: toda a gente tinha uma ideia e nenhuma resolvia.",
    "A bola andou ali como rumor em grupo de WhatsApp: passou por muita gente e chegou ao fim mais perigosa.",
  ],
  forte: [
    "{minute}. {player} tomou uma decisão tão discutível que até uma caixa de comentários pediria intervalo.",
    "Isto não foi azar, foi uma candidatura espontânea ao Museu Nacional das Más Ideias.",
    "{player} ficou tão exposto que por momentos pareceu conferência de imprensa sem assessor e com microfone aberto.",
    "A defesa abriu-se com a disciplina de fila de embarque low-cost: muita intenção, zero civilização.",
    "{event}. Este lance devia vir com aviso: pode ferir sensibilidades, estatísticas e contratos de renovação.",
    "{player} fez ali uma escolha com aroma a comissão parlamentar: muita explicação futura e pouca convicção presente.",
    "A jogada teve menos controlo do que caixa de comentários em noite eleitoral.",
    "Se isto fosse no Parlamento, já havia três versões, duas indignações e uma pessoa a dizer que foi mal interpretada.",
    "A equipa ficou a defender como quem perdeu o comando e está a ver publicidade por respeito ao sofrimento.",
  ],
  absurdo: [
    "A bola passou por {player} com a naturalidade de quem tem passe anual e cumprimenta o segurança pelo nome.",
    "{player} transformou o lance num parecer jurídico: longo, confuso e no fim ninguém ficou satisfeito.",
    "Se isto fosse cinema, o realizador cortava a cena por falta de verosimilhança e excesso de vergonha alheia.",
    "O relvado viu coisas hoje. E, honestamente, talvez precise de férias e uma conversa com alguém de confiança.",
    "{event}. A jogada teve mais buracos do que um orçamento explicado em direto na televisão.",
    "{player} tratou o lance como cinema de autor: ninguém percebeu tudo, mas houve sofrimento com enquadramento.",
    "Isto foi tão estranho que até o algoritmo das redes sociais pediria contexto adicional.",
    "{minute}. A jogada parecia escrita por alguém que adormeceu no VAR e acordou num debate sobre rotundas.",
    "Houve ali um segundo em que o futebol deixou de ser desporto e passou a ser conteúdo para explicar ao jantar.",
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
