import type { Match } from "./types";

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
        text: "2-1, Bruno Varela deixa escapar um remate defensavel.",
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
        text: "Golo de Rafa Silva. A defesa do Vitoria abriu uma faixa tao bonita que faltou so cortar a fita e chamar o presidente da camara.",
      },
      {
        id: "c3",
        minute: "41'",
        intensity: "leve",
        featured: false,
        text: "Tomas Handel leva amarelo e faz cara de injusticado. Uma expressao muito usada por quem estaciona em cima do passeio com os quatro piscas.",
      },
      {
        id: "c4",
        minute: "58'",
        intensity: "medio",
        featured: false,
        text: "Jota Silva empata. Canto bem batido, defesa do Benfica em modo visita guiada: muita gente presente, pouca intervencao.",
      },
      {
        id: "c5",
        minute: "73'",
        intensity: "forte",
        featured: true,
        text: "Bruno Varela tinha aquele remate na mao ate a bola se lembrar que tambem tinha planos. Entrou devagarinho, quase a tirar senha.",
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
        text: "Possivel penalti sobre Evanilson analisado e revertido.",
      },
    ],
    comments: [
      {
        id: "c6",
        minute: "18'",
        intensity: "medio",
        featured: false,
        text: "Tiago Esgaio chega tarde, leva amarelo e ainda protesta. Energia de quem recebe multa em segunda fila e pergunta se a policia nao tem mais nada para fazer.",
      },
      {
        id: "c7",
        minute: "34'",
        intensity: "forte",
        featured: true,
        text: "VAR a ver o possivel penalti sobre Evanilson. Ja deu para fazer cafe, beber cafe e arrepender-nos do cafe.",
      },
      {
        id: "c8",
        minute: "45+2'",
        intensity: "absurdo",
        featured: false,
        text: "Intervalo no Dragao. Primeira parte tao fechada que a chave deve estar com um tio em emigracao e so volta em agosto.",
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
        text: "Daqui a pouco ha bola em Alvalade. O relvado parece pronto; falta saber se a nossa sanidade tambem.",
      },
    ],
  },
];

export function getMatch(id: string) {
  return matches.find((match) => match.id === id);
}

export function scoreText(match: Match) {
  const home = match.home.score ?? "-";
  const away = match.away.score ?? "-";
  return `${home}-${away}`;
}

export function featuredComments() {
  return matches.flatMap((match) =>
    match.comments
      .filter((comment) => comment.featured)
      .map((comment) => ({ match, comment })),
  );
}
