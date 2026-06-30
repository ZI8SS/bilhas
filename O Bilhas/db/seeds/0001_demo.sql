INSERT INTO teams (external_id, name, short_name, color) VALUES
  ('benfica', 'Benfica', 'BEN', '#d71920'),
  ('vitoria-sc', 'Vitoria SC', 'VSC', '#111111'),
  ('fc-porto', 'FC Porto', 'FCP', '#0050a4'),
  ('arouca', 'Arouca', 'ARO', '#f4c542'),
  ('sporting', 'Sporting', 'SCP', '#00843d'),
  ('farense', 'Farense', 'FAR', '#111111')
ON CONFLICT (external_id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  color = EXCLUDED.color;

INSERT INTO players (external_id, team_id, name, display_name, position)
SELECT player.external_id, teams.id, player.name, player.display_name, player.position
FROM (
  VALUES
    ('rafa-silva', 'benfica', 'Rafa Silva', 'Rafa Silva', 'forward'),
    ('tomas-handel', 'vitoria-sc', 'Tomas Handel', 'Tomas Handel', 'midfielder'),
    ('jota-silva', 'vitoria-sc', 'Jota Silva', 'Jota Silva', 'forward'),
    ('bruno-varela', 'vitoria-sc', 'Bruno Varela', 'Bruno Varela', 'goalkeeper'),
    ('tiago-esgaio', 'arouca', 'Tiago Esgaio', 'Tiago Esgaio', 'defender'),
    ('evanilson', 'fc-porto', 'Evanilson', 'Evanilson', 'forward')
) AS player(external_id, team_external_id, name, display_name, position)
JOIN teams ON teams.external_id = player.team_external_id
ON CONFLICT (external_id) DO UPDATE SET
  team_id = EXCLUDED.team_id,
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  position = EXCLUDED.position;

INSERT INTO matches (public_id, external_id, competition, minute, status, home_team_id, away_team_id, home_score, away_score)
SELECT match.public_id, match.external_id, match.competition, match.minute, match.status::match_status,
       home.id, away.id, match.home_score, match.away_score
FROM (
  VALUES
    ('benfica-vitoria', 'demo-benfica-vitoria', 'Liga Portugal', '73''', 'live', 'benfica', 'vitoria-sc', 2, 1),
    ('porto-arouca', 'demo-porto-arouca', 'Liga Portugal', '45+2''', 'half_time', 'fc-porto', 'arouca', 0, 0),
    ('sporting-farense', 'demo-sporting-farense', 'Liga Portugal', '21:30', 'scheduled', 'sporting', 'farense', NULL, NULL)
) AS match(public_id, external_id, competition, minute, status, home_external_id, away_external_id, home_score, away_score)
JOIN teams home ON home.external_id = match.home_external_id
JOIN teams away ON away.external_id = match.away_external_id
ON CONFLICT (public_id) DO UPDATE SET
  minute = EXCLUDED.minute,
  status = EXCLUDED.status,
  home_score = EXCLUDED.home_score,
  away_score = EXCLUDED.away_score;

INSERT INTO match_events (match_id, external_id, minute, event_type, player_id, description)
SELECT matches.id, event.external_id, event.minute, event.event_type::match_event_type, players.id, event.description
FROM (
  VALUES
    ('benfica-vitoria', 'e-ben-vsc-12', '12''', 'goal', 'rafa-silva', '1-0, Rafa Silva remata cruzado depois de uma perda no meio-campo.'),
    ('benfica-vitoria', 'e-ben-vsc-41', '41''', 'yellow_card', 'tomas-handel', 'Amarelo para Tomas Handel por travar o contra-ataque.'),
    ('benfica-vitoria', 'e-ben-vsc-58', '58''', 'goal', 'jota-silva', '1-1, Jota Silva aparece ao segundo poste e cabeceia limpo.'),
    ('benfica-vitoria', 'e-ben-vsc-73', '73''', 'goal', 'bruno-varela', '2-1, Bruno Varela deixa escapar um remate defensavel.'),
    ('porto-arouca', 'e-fcp-aro-18', '18''', 'yellow_card', 'tiago-esgaio', 'Amarelo para Tiago Esgaio depois de chegar tarde ao lance.'),
    ('porto-arouca', 'e-fcp-aro-34', '34''', 'var', 'evanilson', 'Possivel penalti sobre Evanilson analisado e revertido.')
) AS event(match_public_id, external_id, minute, event_type, player_external_id, description)
JOIN matches ON matches.public_id = event.match_public_id
LEFT JOIN players ON players.external_id = event.player_external_id
ON CONFLICT (match_id, external_id) DO UPDATE SET
  minute = EXCLUDED.minute,
  event_type = EXCLUDED.event_type,
  player_id = EXCLUDED.player_id,
  description = EXCLUDED.description;

INSERT INTO bilhas_comments (public_id, match_id, minute, intensity, body, featured, published_at)
SELECT comment.public_id, matches.id, comment.minute, comment.intensity::comment_intensity,
       comment.body, comment.featured, now()
FROM (
  VALUES
    ('c1', 'benfica-vitoria', '03''', 'leve', 'O Benfica comeca a trocar a bola e o Vitoria observa com respeito institucional. Tambem conta como posse, se formos generosos.', false),
    ('c2', 'benfica-vitoria', '12''', 'medio', 'Golo de Rafa Silva. A defesa do Vitoria abriu uma faixa tao bonita que faltou so cortar a fita e chamar o presidente da camara.', true),
    ('c3', 'benfica-vitoria', '41''', 'leve', 'Tomas Handel leva amarelo e faz cara de injusticado. Uma expressao muito usada por quem estaciona em cima do passeio com os quatro piscas.', false),
    ('c4', 'benfica-vitoria', '58''', 'medio', 'Jota Silva empata. Canto bem batido, defesa do Benfica em modo visita guiada: muita gente presente, pouca intervencao.', false),
    ('c5', 'benfica-vitoria', '73''', 'forte', 'Bruno Varela tinha aquele remate na mao ate a bola se lembrar que tambem tinha planos. Entrou devagarinho, quase a tirar senha.', true),
    ('c6', 'porto-arouca', '18''', 'medio', 'Tiago Esgaio chega tarde, leva amarelo e ainda protesta. Energia de quem recebe multa em segunda fila e pergunta se a policia nao tem mais nada para fazer.', false),
    ('c7', 'porto-arouca', '34''', 'forte', 'VAR a ver o possivel penalti sobre Evanilson. Ja deu para fazer cafe, beber cafe e arrepender-nos do cafe.', true),
    ('c8', 'porto-arouca', '45+2''', 'absurdo', 'Intervalo no Dragao. Primeira parte tao fechada que a chave deve estar com um tio em emigracao e so volta em agosto.', false),
    ('c9', 'sporting-farense', 'Pre', 'leve', 'Daqui a pouco ha bola em Alvalade. O relvado parece pronto; falta saber se a nossa sanidade tambem.', true)
) AS comment(public_id, match_public_id, minute, intensity, body, featured)
JOIN matches ON matches.public_id = comment.match_public_id
ON CONFLICT (public_id) DO UPDATE SET
  minute = EXCLUDED.minute,
  intensity = EXCLUDED.intensity,
  body = EXCLUDED.body,
  featured = EXCLUDED.featured,
  published_at = EXCLUDED.published_at;
