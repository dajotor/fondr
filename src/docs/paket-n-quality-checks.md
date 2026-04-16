# Paket N: Qualitaets- und Deploy-Checks

## 1. Typecheck / Build

- `npm install`
- `npm run typecheck`
- `npm run build`

## 2. ETF-Layer

- Mit `ETF_PROVIDER_MODE=mock` eine bekannte ISIN anlegen:
  Erwartung: Mock-Daten werden genutzt.
- Mit `ETF_PROVIDER_MODE=eodhd` aber ohne API-Key eine neue ISIN anlegen:
  Erwartung: kein Crash, sauberer manueller Fallback.

## 3. Mobile

- `Portfolio` auf kleiner Breite:
  Erwartung: Karten statt nur breite Tabelle.
- `Einzahlungen` auf kleiner Breite:
  Erwartung: Monatsvorschau bleibt lesbar als Karten.
- `Report` auf kleiner Breite:
  Erwartung: Toolbar und KPI-Karten umbrechen sauber.

## 4. Leere und unvollstaendige Setups

- Kein Portfolio:
  Dashboard zeigt naechsten Schritt.
- Keine Beitragsregeln:
  Einzahlungen, Dashboard und Report bleiben verstaendlich.
- Keine Allokation:
  Analyse und Report zeigen das als Hinweis.
- Kein Ziel:
  Ziele und Dashboard bleiben brauchbar statt leer.

## 5. Deploy

- Supabase Site URL und Redirect URL auf die echte Domain setzen.
- Vercel ENV-Werte fuer `NEXT_PUBLIC_APP_URL`, Supabase und optionalen ETF-Provider setzen.
- Login und Callback auf Production-Domain pruefen.
