# FONDR

Neue deutschsprachige Web-App fuer ETF-basiertes Wealth Planning.

## Lokales Setup

1. Abhaengigkeiten installieren:

```bash
npm install
```

2. Umgebungsvariablen anlegen:

```bash
cp .env.local.example .env.local
```

3. Werte in `.env.local` eintragen:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional: `ETF_PROVIDER_MODE` (`mock`, `disabled` oder `eodhd`)
- optional: `ETF_PROVIDER_API_KEY` (z. B. EODHD API Key)
- optional: `ETF_PROVIDER_BASE_URL`
- optional: `CRON_SECRET` fuer geschuetzte Cron-Endpunkte

4. Entwicklungsserver starten:

```bash
npm run dev
```

## Enthalten in Paket A

- Next.js App Router mit TypeScript
- Tailwind-Setup
- shadcn/ui Grundkonfiguration
- globale Styling-Basis und Design Tokens
- Root Layout
- Supabase Client, Server Client und Middleware
- Magic-Link-Login, Callback, Logout und geschuetzter Dashboard-Bereich

## ETF-Daten-Layer

- Fuer automatisches ISIN-Autofill kann `ETF_PROVIDER_MODE=eodhd` gesetzt werden.
- Ohne API-Key oder bei Quellfehlern faellt der ETF-Layer defensiv auf Mock- oder manuelle Stammdaten zurueck.
- Ohne funktionierende Provider-Konfiguration faellt der ETF-Layer defensiv auf Mock- oder manuelle Stammdaten zurueck.
- Dadurch sollen Portfolio- und Erfassungsfluesse nicht wegen externer Datenquellen abbrechen.
- Ein taeglicher Cron-Job kann den Provider-Referenzpreis in `etfs.last_known_price` serverseitig aktualisieren.
- Manuelle Holding-Overrides in `unit_price_manual` bleiben davon unberuehrt.
- Der taegliche Refresh prueft nur ETFs/Fonds, die bereits in echten Holdings verwendet werden und deren Stammdatenquelle `provider` ist.
- Fuer lokales Testen kann der Cron-Endpoint mit `Authorization: Bearer <CRON_SECRET>` gegen `/api/cron/refresh-etf-prices` aufgerufen werden.

## Deployment auf Vercel + Supabase

1. Vercel-Projekt mit dem Repo verbinden.
2. Diese ENV-Werte in Vercel setzen:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - optional `ETF_PROVIDER_MODE`
   - optional `ETF_PROVIDER_API_KEY`
   - optional `ETF_PROVIDER_BASE_URL`
   - optional `CRON_SECRET`
3. In Supabase unter `Authentication > URL Configuration` setzen:
   - `Site URL`: deine Vercel-Domain
   - `Redirect URL`: `https://deine-domain.tld/auth/confirm`
4. Nach dem ersten Deploy pruefen:
   - Magic-Link-Login
   - Zugriff auf geschuetzte Routen
   - Report-Export
   - Print/PDF aus `/report`

## Empfehlte Checks vor Deploy

```bash
npm install
npm run typecheck
npm run build
```

Wenn ein echter ETF-Provider spaeter angebunden wird, sollte er weiterhin nur optional sein und bei Ausfall nie die Kernfluesse blockieren.
