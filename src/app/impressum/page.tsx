import { PublicFooter } from "@/components/public/public-footer";

export default function ImpressumPage() {
  return (
    <main className="app-shell">
      <div className="app-surface flex min-h-screen flex-col">
        <section className="app-panel mx-auto w-full max-w-4xl p-8 md:p-10">
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="app-eyebrow">
                Rechtliches
              </span>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                  Impressum
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300">
                  Angaben und rechtliche Hinweise zu FONDR in ruhiger,
                  übersichtlicher Form.
                </p>
              </div>
            </div>

            <div className="space-y-8 text-sm leading-7 text-slate-300">
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Angaben gemäß § 5 DDG
                </h2>
                <p>
                  Daniel Torka
                  <br />
                  Johannisplatz 3
                  <br />
                  10117 Berlin
                  <br />
                  Deutschland
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Kontakt
                </h2>
                <p>E-Mail: hi@fondr.de</p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Keine Anlageberatung
                </h2>
                <p>
                  Die auf dieser Website und in der Anwendung FONDR bereitgestellten
                  Inhalte, Berechnungen, Simulationen und Auswertungen dienen
                  ausschließlich der allgemeinen Information und der
                  eigenverantwortlichen Finanzplanung. Sie stellen keine
                  Anlageberatung, keine Anlagevermittlung, keine
                  Finanzportfolioverwaltung und keine Empfehlung zum Kauf oder
                  Verkauf von Finanzinstrumenten dar.
                </p>
                <p>
                  Die Inhalte berücksichtigen keine individuellen persönlichen,
                  finanziellen oder steuerlichen Verhältnisse. Entscheidungen über
                  Geldanlagen sollten nur auf Grundlage eigener Prüfung und
                  gegebenenfalls nach Beratung durch entsprechend qualifizierte
                  Fachpersonen getroffen werden.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Haftung für Inhalte
                </h2>
                <p>
                  Als Diensteanbieter bin ich gemäß den allgemeinen Gesetzen für
                  eigene Inhalte auf diesen Seiten verantwortlich. Ich übernehme
                  jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und
                  Aktualität der bereitgestellten Inhalte.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Haftung für Links
                </h2>
                <p>
                  Diese Website kann Links zu externen Websites Dritter enthalten,
                  auf deren Inhalte ich keinen Einfluss habe. Für diese fremden
                  Inhalte übernehme ich keine Gewähr. Für die Inhalte der verlinkten
                  Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
                  verantwortlich.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Urheberrecht
                </h2>
                <p>
                  Die auf dieser Website veröffentlichten Inhalte und Werke
                  unterliegen dem deutschen Urheberrecht. Jede Verwertung außerhalb
                  der Grenzen des Urheberrechts bedarf der vorherigen schriftlichen
                  Zustimmung der jeweiligen Rechteinhaberin bzw. des jeweiligen
                  Rechteinhabers.
                </p>
              </section>
            </div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </main>
  );
}
