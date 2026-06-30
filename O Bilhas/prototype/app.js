const matches = [
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

const bilhasTemplates = {
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

const app = document.querySelector("#app");
const toast = document.querySelector("#toast");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function scoreText(match) {
  const home = match.home.score ?? "-";
  const away = match.away.score ?? "-";
  return `${home}-${away}`;
}

function getCommentUrl(matchId, commentId) {
  return `${window.location.origin}${window.location.pathname}#comment/${matchId}/${commentId}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

async function shareComment(matchId, comment) {
  const match = matches.find((item) => item.id === matchId);
  const title = `O Bilhas · ${match.home.short} ${scoreText(match)} ${match.away.short}`;
  const text = `${comment.minute} ${comment.text}`;
  const url = getCommentUrl(matchId, comment.id);

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  await navigator.clipboard.writeText(`${text}\n${url}`);
  showToast("Comentario copiado para partilhar.");
}

function copyComment(matchId, comment) {
  const url = getCommentUrl(matchId, comment.id);
  navigator.clipboard.writeText(`${comment.minute} ${comment.text}\n${url}`);
  showToast("Link e frase copiados.");
}

function renderHome() {
  const best = matches.flatMap((match) =>
    match.comments
      .filter((comment) => comment.featured)
      .map((comment) => ({ match, comment })),
  );

  app.innerHTML = `
    <section class="hero-panel">
      <div>
        <span class="eyebrow">Live score com ma lingua saudavel</span>
        <h1>Resultados ao vivo, mas com alguem acordado a escrever.</h1>
        <p>Segue os jogos, apanha os momentos estranhos e partilha a frase do Bilhas quando o VAR, o frango ou a defesa pedirem intervencao editorial.</p>
      </div>
      <span class="pill"><span class="live-dot"></span> ${matches.filter((match) => match.status === "Ao vivo").length} jogo ao vivo</span>
    </section>

    <section class="layout">
      <div class="match-list" aria-label="Jogos">
        ${matches.map(renderMatchRow).join("")}
      </div>
      <aside class="side-panel">
        <h2>Frases quentes</h2>
        <div class="best-list">
          ${best.map(({ match, comment }) => `
            <a class="best-quote" href="#comment/${match.id}/${comment.id}">
              <strong>${escapeHtml(match.home.short)} ${scoreText(match)} ${escapeHtml(match.away.short)} · ${escapeHtml(comment.minute)}</strong>
              <p>${escapeHtml(comment.text)}</p>
            </a>
          `).join("")}
        </div>
      </aside>
    </section>
  `;
}

function renderMatchRow(match) {
  return `
    <article class="match-row" style="--home-color: ${match.home.color}; --away-color: ${match.away.color};">
      <span class="minute">${escapeHtml(match.minute)}</span>
      <div class="teams">
        ${renderTeam(match.home)}
        ${renderTeam(match.away)}
      </div>
      <div class="match-actions">
        <span class="pill">${escapeHtml(match.status)}</span>
        <a class="primary-button" href="#match/${match.id}" aria-label="Abrir ${escapeHtml(match.home.name)} contra ${escapeHtml(match.away.name)}">Abrir</a>
      </div>
    </article>
  `;
}

function renderTeam(team) {
  return `
    <div class="team">
      <span class="crest" style="--team-color: ${team.color};">${escapeHtml(team.short[0])}</span>
      <span class="team-name">${escapeHtml(team.name)}</span>
      <span class="score">${team.score ?? "-"}</span>
    </div>
  `;
}

function renderMatch(matchId, activeTab = "bilhas") {
  const match = matches.find((item) => item.id === matchId) ?? matches[0];
  app.innerHTML = `
    <section class="match-hero" style="--home-color: ${match.home.color}; --away-color: ${match.away.color};">
      <div class="pitch-strip" aria-hidden="true"></div>
      <div class="match-heading">
        <div class="match-team">
          <span class="crest" style="--team-color: ${match.home.color};">${escapeHtml(match.home.short[0])}</span>
          <strong>${escapeHtml(match.home.name)}</strong>
        </div>
        <div class="scoreboard">
          <span>${escapeHtml(match.competition)} · ${escapeHtml(match.minute)}</span>
          <strong>${scoreText(match)}</strong>
          <span>${escapeHtml(match.status)}</span>
        </div>
        <div class="match-team">
          <span class="crest" style="--team-color: ${match.away.color};">${escapeHtml(match.away.short[0])}</span>
          <strong>${escapeHtml(match.away.name)}</strong>
        </div>
      </div>
    </section>

    <div class="match-tabs" role="tablist" aria-label="Conteudo do jogo">
      <button class="tab-button ${activeTab === "bilhas" ? "active" : ""}" data-tab="bilhas">Bilhas</button>
      <button class="tab-button ${activeTab === "eventos" ? "active" : ""}" data-tab="eventos">Eventos</button>
          <a class="ghost-button" href="#home">Voltar</a>
    </div>

    ${activeTab === "eventos" ? renderEvents(match) : renderComments(match)}
  `;

  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => renderMatch(match.id, button.dataset.tab));
  });
}

function renderComments(match) {
  return `
    <section class="feed">
      <div class="feed-header">
        <h2>O Bilhas ao minuto</h2>
        <span class="pill">${match.comments.length} comentarios</span>
      </div>
      <div class="comment-list">
        ${match.comments.map((comment) => `
          <article class="comment ${comment.featured ? "featured" : ""}" id="${comment.id}">
            <span class="comment-minute">${escapeHtml(comment.minute)}</span>
            <div class="comment-body">
              <p>${escapeHtml(comment.text)}</p>
              <small>${escapeHtml(comment.intensity)}${comment.featured ? " · frase quente" : ""}</small>
            </div>
            <div class="share-cluster">
              <button class="icon-button" title="Partilhar" aria-label="Partilhar comentario" data-share="${comment.id}">↗</button>
              <button class="icon-button" title="Copiar" aria-label="Copiar comentario" data-copy="${comment.id}">⧉</button>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderEvents(match) {
  const events = match.events.length
    ? match.events
    : [{ minute: "-", type: "Sem eventos", text: "O jogo ainda nao comecou." }];

  return `
    <section class="feed">
      <div class="feed-header">
        <h2>Eventos do jogo</h2>
        <span class="pill">${events.length} eventos</span>
      </div>
      <div class="event-list">
        ${events.map((event) => `
          <article class="event">
            <span class="event-minute">${escapeHtml(event.minute)}</span>
            <div class="event-body">
              <p><strong>${escapeHtml(event.type)}</strong> · ${escapeHtml(event.text)}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderRanking() {
  const quotes = matches
    .flatMap((match) => match.comments.map((comment) => ({ match, comment })))
    .filter(({ comment }) => comment.featured);

  app.innerHTML = `
    <section class="screen-title">
      <div>
        <h1>As frases que sobreviveram ao jogo.</h1>
        <p>Arquivo rapido dos comentarios mais partilhaveis. No produto real, isto vira ranking da jornada.</p>
      </div>
    </section>
    <section class="feed">
      <div class="comment-list">
        ${quotes.map(({ match, comment }) => `
          <article class="comment featured">
            <span class="comment-minute">${escapeHtml(comment.minute)}</span>
            <div class="comment-body">
              <p>${escapeHtml(comment.text)}</p>
              <small>${escapeHtml(match.home.short)} ${scoreText(match)} ${escapeHtml(match.away.short)}</small>
            </div>
            <div class="share-cluster">
              <button class="icon-button" title="Partilhar" data-share-global="${match.id}:${comment.id}">↗</button>
              <button class="icon-button" title="Copiar" data-copy-global="${match.id}:${comment.id}">⧉</button>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderAdmin() {
  app.innerHTML = `
    <section class="screen-title">
      <div>
        <h1>Redacao do Bilhas.</h1>
        <p>Painel interno: a equipa escolhe o jogo, confirma o lance, pede sugestoes a AI e so publica depois de editar/aprovar. Isto nao e uma caixa de comentarios publica.</p>
      </div>
    </section>

    <section class="layout">
      <form class="admin-panel" id="admin-form">
        <h2>Gerar sugestoes internas</h2>
        <div class="form-grid">
          <label>
            Jogo
            <select name="match">
              ${matches.map((match) => `<option value="${match.id}">${escapeHtml(match.home.name)} vs ${escapeHtml(match.away.name)}</option>`).join("")}
            </select>
          </label>
          <label>
            Minuto
            <input name="minute" value="73'" />
          </label>
          <label>
            Jogador
            <input name="player" value="Bruno Varela" />
          </label>
          <label>
            Intensidade
            <select name="intensity">
              <option>leve</option>
              <option selected>medio</option>
              <option>forte</option>
              <option>absurdo</option>
            </select>
          </label>
          <label>
            Evento
            <textarea name="event">Bruno Varela deixa escapar um remate defensavel de fora da area.</textarea>
          </label>
          <button class="primary-button" type="submit">Gerar</button>
        </div>
      </form>

      <aside class="side-panel">
        <h2>Sugestoes</h2>
        <div class="generated" id="generated">
          <p class="pill">As frases aparecem aqui para a redacao escolher e afinar.</p>
        </div>
      </aside>
    </section>
  `;

  document.querySelector("#admin-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const minute = formData.get("minute");
    const intensity = formData.get("intensity");
    const player = formData.get("player") || "o jogador";
    const container = document.querySelector("#generated");
    const options = bilhasTemplates[intensity] ?? bilhasTemplates.medio;

    container.innerHTML = options
      .map((text) => text.replaceAll("{player}", player))
      .map((text, index) => `
        <div class="best-quote">
          <strong>${escapeHtml(minute)} · ${escapeHtml(intensity)} · opcao ${index + 1}</strong>
          <p>${escapeHtml(text)}</p>
        </div>
      `)
      .join("");
  });
}

function attachGlobalActions() {
  app.addEventListener("click", (event) => {
    const shareId = event.target.closest("[data-share]")?.dataset.share;
    const copyId = event.target.closest("[data-copy]")?.dataset.copy;
    const shareGlobal = event.target.closest("[data-share-global]")?.dataset.shareGlobal;
    const copyGlobal = event.target.closest("[data-copy-global]")?.dataset.copyGlobal;

    const route = window.location.hash.slice(1).split("/");
    const currentMatchId = route[0] === "match" ? route[1] : null;

    if (shareId && currentMatchId) {
      const match = matches.find((item) => item.id === currentMatchId);
      const comment = match.comments.find((item) => item.id === shareId);
      shareComment(currentMatchId, comment);
    }

    if (copyId && currentMatchId) {
      const match = matches.find((item) => item.id === currentMatchId);
      const comment = match.comments.find((item) => item.id === copyId);
      copyComment(currentMatchId, comment);
    }

    if (shareGlobal) {
      const [matchId, commentId] = shareGlobal.split(":");
      const match = matches.find((item) => item.id === matchId);
      const comment = match.comments.find((item) => item.id === commentId);
      shareComment(matchId, comment);
    }

    if (copyGlobal) {
      const [matchId, commentId] = copyGlobal.split(":");
      const match = matches.find((item) => item.id === matchId);
      const comment = match.comments.find((item) => item.id === commentId);
      copyComment(matchId, comment);
    }
  });
}

function router() {
  const [route, first, second] = window.location.hash.slice(1).split("/");

  if (!route || route === "home") renderHome();
  if (route === "match") renderMatch(first);
  if (route === "ranking") renderRanking();
  if (route === "admin") renderAdmin();
  if (route === "comment") {
    renderMatch(first);
    window.requestAnimationFrame(() => {
      document.querySelector(`#${CSS.escape(second)}`)?.scrollIntoView({ block: "center" });
    });
  }
}

attachGlobalActions();
window.addEventListener("hashchange", router);
router();
