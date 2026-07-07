import type { Match } from "./types";
import { scoreText as formattedScoreText } from "./match-format";

export const matches: Match[] = [
  {
    id: "benfica-vitoria",
    competition: "Liga Portugal",
    minute: "73'",
    status: "Ao vivo",
    home: { name: "Benfica", short: "BEN", score: 2, color: "#d71920" },
    away: { name: "Vitoria SC", short: "VSC", score: 1, color: "#111111" },
    events: [
      {
        minute: "12'",
        type: "Golo",
        player: "Rafa Silva",
        text: "1-0, Rafa Silva remata cruzado depois de uma perda no meio-campo.",
      },
      {
        minute: "41'",
        type: "Cartao",
        player: "Tomas Handel",
        text: "Amarelo para Tomas Handel por travar o contra-ataque.",
      },
      {
        minute: "58'",
        type: "Golo",
        player: "Jota Silva",
        text: "1-1, Jota Silva aparece ao segundo poste e cabeceia limpo.",
      },
      {
        minute: "73'",
        type: "Golo",
        player: "Bruno Varela",
        text: "2-1, Bruno Varela deixa escapar um remate defensável.",
      },
    ],
    comments: [
      {
        id: "c1",
        minute: "03'",
        intensity: "leve",
        featured: false,
        text: "O Benfica comeca a trocar a bola e o Vitoria observa com respeito institucional. Tambem conta como posse, se formos generosos.",
      },
      {
        id: "c2",
        minute: "12'",
        intensity: "medio",
        featured: true,
        text: "Golo de Rafa Silva. A defesa do Vitória abriu uma faixa tão bonita que faltou só cortar a fita e chamar o presidente da câmara.",
      },
      {
        id: "c3",
        minute: "41'",
        intensity: "leve",
        featured: false,
        text: "Tomás Händel leva amarelo e faz cara de injustiçado. Uma expressão muito usada por quem estaciona em cima do passeio com os quatro piscas.",
      },
      {
        id: "c4",
        minute: "58'",
        intensity: "medio",
        featured: false,
        text: "Jota Silva empata. Canto bem batido, defesa do Benfica em modo visita guiada: muita gente presente, pouca intervenção.",
      },
      {
        id: "c5",
        minute: "73'",
        intensity: "forte",
        featured: true,
        text: "Bruno Varela tinha aquele remate na mão até a bola se lembrar que também tinha planos. Entrou devagarinho, quase a tirar senha.",
      },
    ],
  },
  {
    id: "porto-arouca",
    competition: "Liga Portugal",
    minute: "45+2'",
    status: "Intervalo",
    home: { name: "FC Porto", short: "FCP", score: 0, color: "#0050a4" },
    away: { name: "Arouca", short: "ARO", score: 0, color: "#f4c542" },
    events: [
      {
        minute: "18'",
        type: "Cartao",
        player: "Tiago Esgaio",
        text: "Amarelo para Tiago Esgaio depois de chegar tarde ao lance.",
      },
      {
        minute: "34'",
        type: "VAR",
        player: "Evanilson",
        text: "Possível penálti sobre Evanilson analisado e revertido.",
      },
    ],
    comments: [
      {
        id: "c6",
        minute: "18'",
        intensity: "medio",
        featured: false,
        text: "Tiago Esgaio chega tarde, leva amarelo e ainda protesta. Energia de quem recebe multa em segunda fila e pergunta se a polícia não tem mais nada para fazer.",
      },
      {
        id: "c7",
        minute: "34'",
        intensity: "forte",
        featured: true,
        text: "VAR a ver o possível penálti sobre Evanilson. Já deu para fazer café, beber café e arrepender-nos do café.",
      },
      {
        id: "c8",
        minute: "45+2'",
        intensity: "absurdo",
        featured: false,
        text: "Intervalo no Dragão. Primeira parte tão fechada que a chave deve estar com um tio em emigração e só volta em agosto.",
      },
    ],
  },
  {
    id: "sporting-farense",
    competition: "Liga Portugal",
    minute: "21:30",
    status: "Hoje",
    home: { name: "Sporting", short: "SCP", score: null, color: "#00843d" },
    away: { name: "Farense", short: "FAR", score: null, color: "#111111" },
    events: [],
    comments: [
      {
        id: "c9",
        minute: "Pre",
        intensity: "leve",
        featured: true,
        text: "Daqui a pouco há bola em Alvalade. O relvado parece pronto; falta saber se a nossa sanidade também.",
      },
    ],
  },
];

export function getMatch(id: string) {
  return matches.find((match) => match.id === id);
}

export function scoreText(match: Match) {
  return formattedScoreText(match);
}

export function featuredComments() {
  return matches.flatMap((match) =>
    match.comments
      .filter((comment) => comment.featured)
      .map((comment) => ({ match, comment })),
  );
}
