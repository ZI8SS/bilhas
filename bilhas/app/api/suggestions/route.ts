import { NextResponse } from "next/server";
import type { SuggestionRequest } from "@/lib/types";

const templates: Record<SuggestionRequest["intensity"], string[]> = {
  leve: [
    "{player} apareceu no lance com aquele ar de quem leu o briefing, mas era o briefing de outro jogo.",
    "O lance pediu uma decisao simples. {player} respondeu com uma pequena dissertacao sobre o caos.",
    "{player} tentou dar normalidade ao momento. A bola, como muita gente em reunioes, escolheu o caminho mais dramatico.",
    "Ha jogadas que parecem futebol; esta pareceu uma chamada de grupo onde ninguem sabe quem esta a falar.",
    "{player} fez o suficiente para entrar no resumo. Se era esse o objetivo, missao cumprida com algum ruido.",
    "O jogo pediu uma nota de rodape e {player} entregou um capitulo pequeno mas inconveniente.",
    "{player} mexeu no lance como quem mexe no comando da televisao: sem grande plano, mas alguma fe.",
  ],
  medio: [
    "{player} tinha isto controlado ate ao instante em que o futebol pediu comprovativo. Nao havia.",
    "O lance foi tao mal resolvido que parecia obra publica: muita gente a olhar, ninguem a assumir.",
    "{player} entrou na jogada como quem entra num restaurante caro sem ver os precos: confiante demais, tarde demais.",
    "A equipa tentou parecer adulta. Durou pouco, como promessa de ano novo feita a 1 de janeiro.",
    "Isto teve energia de filme de domingo a tarde: previsivel, ligeiramente triste, e mesmo assim ficamos a ver.",
    "{player} deixou a jogada num estado que a Protecao Civil classificaria como amarelo carregado.",
    "O lance ficou tao aberto que parecia discussao sobre obras em casa: toda a gente tinha uma ideia e nenhuma resolvia.",
  ],
  forte: [
    "{player} tomou uma decisao tao discutivel que ate uma caixa de comentarios do Facebook pediria moderacao.",
    "Isto nao foi azar, foi uma candidatura espontanea ao Museu Nacional das Mas Ideias.",
    "{player} ficou tao exposto que por momentos pareceu uma conferencia de imprensa sem assessor.",
    "A defesa abriu-se com a disciplina de uma fila de embarque low-cost. Muita intencao, zero civilizacao.",
    "Este lance devia vir com aviso: pode ferir sensibilidades, estatisticas e contratos de renovacao.",
    "{player} fez ali uma escolha com aroma a comissao parlamentar: muita explicacao futura e pouca conviccao presente.",
    "A jogada teve menos controlo do que caixa de comentarios em noite eleitoral.",
  ],
  absurdo: [
    "A bola passou por {player} com a naturalidade de quem tem passe anual e conhece o seguranca.",
    "{player} transformou o lance num parecer juridico: longo, confuso e no fim ninguem ficou satisfeito.",
    "Se isto fosse cinema, o realizador cortava a cena por falta de verosimilhanca.",
    "O relvado viu coisas hoje. E, honestamente, talvez precise de acompanhamento.",
    "A jogada teve mais buracos do que um orcamento explicado em direto na televisao.",
    "{player} tratou o lance como cinema de autor: ninguem percebeu tudo, mas houve sofrimento com enquadramento.",
    "Isto foi tao estranho que ate o algoritmo das redes sociais pediria contexto adicional.",
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
    .map((template) => template.replaceAll("{player}", player));

  return NextResponse.json({
    minute,
    event,
    suggestions,
  });
}
