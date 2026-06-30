CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'half_time', 'finished', 'postponed', 'cancelled');
CREATE TYPE match_event_type AS ENUM ('goal', 'yellow_card', 'red_card', 'substitution', 'var', 'penalty', 'other');
CREATE TYPE comment_intensity AS ENUM ('leve', 'medio', 'forte', 'absurdo');
CREATE TYPE suggestion_status AS ENUM ('draft', 'approved', 'rejected', 'published');
CREATE TYPE app_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT NOT NULL UNIQUE,
  external_id TEXT UNIQUE,
  competition TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  minute TEXT NOT NULL DEFAULT '',
  status match_status NOT NULL DEFAULT 'scheduled',
  home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  home_score INTEGER CHECK (home_score IS NULL OR home_score >= 0),
  away_score INTEGER CHECK (away_score IS NULL OR away_score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT different_teams CHECK (home_team_id <> away_team_id)
);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  position TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  external_id TEXT,
  minute TEXT NOT NULL,
  event_type match_event_type NOT NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT NOT NULL,
  occurred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, external_id)
);

CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE,
  display_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bilhas_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id TEXT NOT NULL UNIQUE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  event_id UUID REFERENCES match_events(id) ON DELETE SET NULL,
  author_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  minute TEXT NOT NULL,
  intensity comment_intensity NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 420),
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  event_id UUID REFERENCES match_events(id) ON DELETE SET NULL,
  requested_by UUID REFERENCES app_users(id) ON DELETE SET NULL,
  minute TEXT NOT NULL,
  player_name TEXT,
  intensity comment_intensity NOT NULL,
  prompt_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  suggestion TEXT NOT NULL CHECK (char_length(suggestion) BETWEEN 1 AND 420),
  status suggestion_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_status_starts_at ON matches(status, starts_at);
CREATE INDEX idx_match_events_match_created ON match_events(match_id, created_at);
CREATE INDEX idx_bilhas_comments_match_published ON bilhas_comments(match_id, published_at);
CREATE INDEX idx_bilhas_comments_featured ON bilhas_comments(featured) WHERE featured = true;
CREATE INDEX idx_ai_suggestions_match_created ON ai_suggestions(match_id, created_at);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER matches_updated_at
BEFORE UPDATE ON matches
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER players_updated_at
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER app_users_updated_at
BEFORE UPDATE ON app_users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER bilhas_comments_updated_at
BEFORE UPDATE ON bilhas_comments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
