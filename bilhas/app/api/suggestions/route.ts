import { NextResponse } from "next/server";
import type { SuggestionRequest } from "@/lib/types";

const templates: Record<SuggestionRequest["intensity"], string[]> = {
  leve: [
    "{player} tentou resolver com as maos, mas a bola preferiu uma carreira independente. Bonito para ela, menos para ele.",
    "{player} ficou ali a meio caminho entre defender e pedir esclarecimentos. A bola escolheu a opcao mais simples: entrou.",
    "O remate nao levava veneno nenhum, mas {player} tratou aquilo como se viesse com bula e efeitos secundarios.",
  ],
  medio: [
    "{player} tinha este lance controlado ate ao preciso momento em que deixou de ter. Uma autobiografia em tres segundos.",
    "Frango de {player}. A bola entrou tao devagar que ainda teve tempo de aceitar cookies e escolher idioma.",
    "{player} abordou o lance como quem tenta apanhar uma torrada a cair: fe, panico e zero plano de contingencia.",
  ],
  forte: [
    "{player} fez uma defesa em diferido. Infelizmente, a bola estava em direto.",
    "Isto nao foi bem um frango, foi um menu completo. {player} serviu, empratou e ainda perguntou se queriamos sobremesa.",
    "{player} olhou para a bola a passar com a serenidade de quem ja aceitou a reuniao de condominio das 21h30.",
  ],
  absurdo: [
    "A bola passou por {player} com a confianca de quem conhece alguem na portaria.",
    "{player} abriu uma excecao administrativa e a bola entrou sem preencher o formulario.",
    "Neste lance, {player} foi menos guarda-redes e mais testemunha ocular.",
  ],
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<SuggestionRequest>;
  const player = body.player?.trim() || "o jogador";
  const intensity = body.intensity && body.intensity in templates ? body.intensity : "medio";

  const suggestions = templates[intensity].map((template) => template.replaceAll("{player}", player));

  return NextResponse.json({
    minute: body.minute ?? "",
    event: body.event ?? "",
    suggestions,
  });
}
