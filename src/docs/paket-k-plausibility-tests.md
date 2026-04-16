# Paket K: Plausibilitaetsfaelle

Diese Faelle sind bewusst klein und manuell nachvollziehbar. Sie haerten keine neue Kernlogik, sondern pruefen Guardrails und Randfaelle.

## 1. Zielmonat-Mapping

- Ausgangslage: aktueller Monat April 2026.
- Eingabe: Zieljahr 2026.
- Erwartung: Zielmonat ist Dezember 2026 und liegt 8 Monate nach April 2026.
- Eingabe: Zieljahr 2025.
- Erwartung: Formular blockiert die Eingabe; Helper clampen defensiv auf den ersten verfuegbaren Monat.

## 2. Erfolgswahrscheinlichkeit

- Rohpfade: `[100, 110]`, `[100, 90]`, `[100, 130]`, Zielmonatindex `1`, Ziel `100`.
- Erwartung: 2 von 3 Laeufen erfolgreich, Erfolgswahrscheinlichkeit `0.666...`.
- Anzeige: gerundet als `67 %`.

## 3. Optimierung mit 0 EUR

- Monte Carlo des aktuellen Plans erreicht das Ziel bereits oberhalb der Zielwahrscheinlichkeit.
- Erwartung: `findRequiredMonthlyContribution(...)` liefert `0`.
- UI: Text erklaert, dass aktuell keine zusaetzliche Monatsrate noetig ist.

## 4. Optimierung praktisch unerreichbar

- Ziel sehr hoch, Zieljahr sehr nah, Erfolgswahrscheinlichkeit hoch.
- Erwartung: Suche erreicht den Maximalrahmen und markiert `isReachableWithinSearchRange = false`.
- UI: verstaendlicher Hinweis statt pseudo-exakter Rate.

## 5. Cap-Sprung innerhalb eines Monats

- ETF A Cap 10.000 EUR, kumuliert bereits 9.500 EUR.
- Monatsbeitrag 1.000 EUR, ETF B naechste Reihenfolge.
- Erwartung: 500 EUR in ETF A, 500 EUR in ETF B.

## 6. Nicht zugewiesene Beitraege

- Monatsbeitrag vorhanden, aber keine Allokationsregeln oder alle Caps erschoepft.
- Erwartung: Betrag bleibt sichtbar als `Nicht zugewiesen` und taucht in Analyse/Ziele als Hinweis auf.

## 7. Leerer Portfoliozustand

- Keine Holdings vorhanden.
- Erwartung: Analyse und Ziele zeigen keine harte Fehlerspur, sondern einen klaren Empty State mit naechstem sinnvollen Schritt.

## 8. Ueberlappungs-Heuristik

- ETF-Namen: `MSCI World`, `ACWI`, `FTSE All-World`.
- Erwartung: kurzer Hinweis auf wahrscheinliche starke Ueberschneidung.
