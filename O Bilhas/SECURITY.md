# Security Notes

## Baseline

- Never commit `.env` or real credentials.
- Use strong database passwords and rotate them before production.
- Use `DATABASE_SSL=true` when the database is outside the same private host/network.
- Keep the editorial area behind authentication before public deployment.
- Run migrations from a trusted deployment job, not from public request handlers.
- Keep database backups encrypted and test restores regularly.

## Database

The app user should only have the privileges it needs on the Bilhas database.

For production, prefer:

- one database user for the app runtime;
- one separate migration user for schema changes;
- network access limited to the app host/private network;
- automated daily backups plus point-in-time recovery if available.

## Observability Later

Next phase:

- structured logs;
- Sentry;
- Prometheus metrics endpoint;
- Grafana + Loki;
- uptime checks;
- audit log review for editorial actions.
