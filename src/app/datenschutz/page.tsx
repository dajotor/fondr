import { PublicFooter } from "@/components/public/public-footer";

export default function DatenschutzPage() {
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
                  Datenschutzerklärung
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-300">
                  Hinweise zur Verarbeitung personenbezogener Daten auf der
                  Website und in der Web-Anwendung FONDR.
                </p>
              </div>
            </div>

            <div className="space-y-8 text-sm leading-7 text-slate-300">
              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  1. Verantwortlicher
                </h2>
                <p>
                  Verantwortlich für die Datenverarbeitung auf dieser Website und
                  in der Web-Anwendung FONDR ist:
                </p>
                <p>
                  Daniel Torka
                  <br />
                  Johannisplatz 3
                  <br />
                  10117 Berlin
                  <br />
                  Deutschland
                  <br />
                  E-Mail: hi@fondr.de
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  2. Allgemeine Hinweise zur Datenverarbeitung
                </h2>
                <p>
                  Ich verarbeite personenbezogene Daten ausschließlich im Rahmen
                  der geltenden datenschutzrechtlichen Vorschriften, insbesondere
                  der Datenschutz-Grundverordnung (DSGVO).
                </p>
                <p>
                  Personenbezogene Daten sind alle Informationen, die sich auf
                  eine identifizierte oder identifizierbare natürliche Person
                  beziehen.
                </p>
                <p>
                  Die Verarbeitung personenbezogener Daten erfolgt insbesondere,
                  um diese Website und die Anwendung FONDR technisch
                  bereitzustellen, die Nutzung der Anwendung zu ermöglichen,
                  Authentifizierung und Sicherheit sicherzustellen sowie die
                  Funktionalität der Finanzplanungs-App bereitzustellen.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  3. Aufruf der Website
                </h2>
                <p>
                  Beim Aufruf dieser Website bzw. Web-Anwendung werden durch den
                  Hosting-Provider automatisch technisch erforderliche
                  Informationen verarbeitet. Dazu können insbesondere gehören:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>IP-Adresse</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>aufgerufene URL</li>
                  <li>Referrer-URL</li>
                  <li>Browsertyp und Browserversion</li>
                  <li>Betriebssystem</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>technische Logdaten</li>
                </ul>
                <p>
                  Die Verarbeitung erfolgt zum Zweck der technischen
                  Bereitstellung der Website, der Stabilität und Sicherheit sowie
                  zur Fehleranalyse.
                </p>
                <p>
                  Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte
                  Interesse liegt in der sicheren, stabilen und funktionalen
                  Bereitstellung der Website und Anwendung.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  4. Nutzung der Web-Anwendung FONDR
                </h2>
                <p>
                  Wenn du FONDR nutzt, verarbeite ich die Daten, die zur
                  Bereitstellung der Anwendung und ihrer Funktionen erforderlich
                  sind. Dazu können insbesondere gehören:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Registrierungs- und Login-Daten, insbesondere E-Mail-Adresse</li>
                  <li>Authentifizierungs- und Sitzungsdaten</li>
                  <li>von dir eingegebene Finanz- und Planungsdaten</li>
                  <li>Portfolios, Einzahlungen, Allokationen, Ziele und Analysewerte</li>
                  <li>technische Nutzungsdaten, soweit dies zur Bereitstellung und Sicherheit der Anwendung erforderlich ist</li>
                </ul>
                <p>
                  Die Verarbeitung erfolgt, um dir die Nutzung der Anwendung zu
                  ermöglichen und die von dir gewünschten Funktionen
                  bereitzustellen.
                </p>
                <p>
                  Rechtsgrundlage ist in der Regel Art. 6 Abs. 1 lit. b DSGVO,
                  soweit die Verarbeitung zur Durchführung vorvertraglicher
                  Maßnahmen oder zur Erfüllung des Nutzungsverhältnisses
                  erforderlich ist. Soweit die Verarbeitung zur sicheren und
                  stabilen Bereitstellung der Anwendung erforderlich ist, erfolgt
                  sie zusätzlich auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  5. Benutzerkonto und Login
                </h2>
                <p>
                  Wenn du dich registrierst oder per Magic Link einloggst,
                  verarbeite ich deine E-Mail-Adresse sowie die für
                  Authentifizierung und Sitzungsverwaltung erforderlichen
                  technischen Daten.
                </p>
                <p>
                  Die Verarbeitung erfolgt zum Zweck der Anmeldung,
                  Authentifizierung, Kontoverwaltung und Zugangssicherung.
                </p>
                <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.</p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  6. Versand von Authentifizierungs- und System-E-Mails
                </h2>
                <p>
                  Für den Versand von Login-Links, Bestätigungs- und System-E-Mails
                  können externe technische Dienstleister eingesetzt werden.
                </p>
                <p>
                  Dabei kann insbesondere deine E-Mail-Adresse verarbeitet werden,
                  ebenso Versand-, Zustell- und technische Metadaten, soweit dies
                  zur Zustellung und Absicherung des E-Mail-Versands erforderlich
                  ist.
                </p>
                <p>
                  Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit der Versand
                  zur Nutzung des Benutzerkontos erforderlich ist, sowie ergänzend
                  Art. 6 Abs. 1 lit. f DSGVO zur Sicherstellung eines zuverlässigen
                  und sicheren E-Mail-Versands.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  7. Eingesetzte technische Dienstleister
                </h2>
                <p>
                  Zur Bereitstellung der Website und Anwendung werden technische
                  Dienstleister eingesetzt, insbesondere für Hosting, Datenbank,
                  Authentifizierung, E-Mail-Versand und die Bereitstellung von ETF-
                  bzw. Marktreferenzdaten.
                </p>
                <p>
                  Die Einbindung dieser Dienste erfolgt zur technischen
                  Bereitstellung und Funktionalität von FONDR.
                </p>
                <p>
                  Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Dienste
                  zur Nutzung der Anwendung erforderlich sind, sowie Art. 6 Abs. 1
                  lit. f DSGVO für den sicheren und effizienten Betrieb der
                  Anwendung.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  8. Empfänger personenbezogener Daten
                </h2>
                <p>
                  Empfänger personenbezogener Daten können technische Dienstleister
                  und Auftragsverarbeiter sein, die für Hosting, Authentifizierung,
                  E-Mail-Versand, Datenbankbetrieb, Infrastruktur und technische
                  Bereitstellung eingesetzt werden.
                </p>
                <p>
                  Eine Weitergabe erfolgt nur, soweit dies zur Bereitstellung der
                  Website und Anwendung, zur Erfüllung vertraglicher oder
                  gesetzlicher Pflichten oder zur Wahrung berechtigter Interessen
                  erforderlich ist.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  9. Drittlandübermittlungen
                </h2>
                <p>
                  Soweit bei eingesetzten Dienstleistern eine Verarbeitung
                  personenbezogener Daten in Staaten außerhalb der Europäischen
                  Union oder des Europäischen Wirtschaftsraums erfolgt oder nicht
                  ausgeschlossen werden kann, erfolgt dies nur im Rahmen der
                  gesetzlichen Voraussetzungen.
                </p>
                <p>
                  Eine Übermittlung in Drittländer ist nach Kapitel V DSGVO nur
                  unter besonderen Voraussetzungen zulässig, insbesondere bei einem
                  Angemessenheitsbeschluss oder geeigneten Garantien wie
                  Standardvertragsklauseln.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  10. Speicherdauer
                </h2>
                <p>
                  Personenbezogene Daten werden nur so lange gespeichert, wie dies
                  für die jeweiligen Zwecke erforderlich ist oder gesetzliche
                  Aufbewahrungspflichten bestehen.
                </p>
                <p>
                  Kontodaten, Finanzplanungsdaten und nutzungsbezogene Daten werden
                  grundsätzlich so lange gespeichert, wie ein Benutzerkonto besteht
                  oder die Speicherung für die Bereitstellung der Anwendung
                  erforderlich ist, sofern keine gesetzlichen Pflichten oder
                  berechtigten Interessen einer Löschung entgegenstehen.
                </p>
                <p>
                  Wenn du die Löschung deines Benutzerkontos oder deiner Daten
                  wünschst, kannst du dich per E-Mail an hi@fondr.de wenden.
                </p>
                <p>
                  Technische Logdaten werden grundsätzlich nur so lange gespeichert,
                  wie dies für den sicheren Betrieb, die Fehleranalyse und die
                  Missbrauchserkennung erforderlich ist.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  11. Rechtsgrundlagen der Verarbeitung
                </h2>
                <p>
                  Soweit in dieser Datenschutzerklärung nichts Abweichendes
                  angegeben ist, kommen insbesondere folgende Rechtsgrundlagen in
                  Betracht:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Art. 6 Abs. 1 lit. b DSGVO für Verarbeitungen zur Bereitstellung der Anwendung und zur Durchführung des Nutzungsverhältnisses</li>
                  <li>Art. 6 Abs. 1 lit. c DSGVO, soweit eine gesetzliche Verpflichtung besteht</li>
                  <li>Art. 6 Abs. 1 lit. f DSGVO für technisch erforderliche Verarbeitung, IT-Sicherheit, Stabilität, Missbrauchsverhinderung und effizienten Betrieb der Website und Anwendung</li>
                  <li>Art. 6 Abs. 1 lit. a DSGVO, soweit eine Einwilligung erteilt wurde</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  12. Cookies und ähnliche Technologien
                </h2>
                <p>
                  Diese Website bzw. Anwendung verwendet ausschließlich technisch
                  notwendige Cookies oder vergleichbare Technologien, insbesondere
                  für Login, Sitzungsverwaltung, Sicherheit und den stabilen
                  Betrieb.
                </p>
                <p>
                  Eine Nutzung von Analyse-, Tracking- oder Marketing-Cookies findet
                  derzeit nicht statt.
                </p>
                <p>
                  Soweit ausschließlich technisch notwendige Technologien eingesetzt
                  werden, ist hierfür grundsätzlich keine Einwilligung erforderlich.
                  Für nicht notwendige Zugriffe auf Informationen in
                  Endeinrichtungen wäre grundsätzlich eine Einwilligung erforderlich.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  13. Betroffenenrechte
                </h2>
                <p>
                  Du hast im Rahmen der gesetzlichen Voraussetzungen insbesondere
                  folgende Rechte:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Recht auf Auskunft über die verarbeiteten personenbezogenen Daten</li>
                  <li>Recht auf Berichtigung unrichtiger Daten</li>
                  <li>Recht auf Löschung</li>
                  <li>Recht auf Einschränkung der Verarbeitung</li>
                  <li>Recht auf Datenübertragbarkeit</li>
                  <li>Recht auf Widerspruch gegen die Verarbeitung, soweit diese auf Art. 6 Abs. 1 lit. e oder lit. f DSGVO beruht</li>
                  <li>Recht, eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft zu widerrufen</li>
                  <li>Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  14. Widerspruchsrecht
                </h2>
                <p>
                  Soweit ich personenbezogene Daten auf Grundlage von Art. 6 Abs. 1
                  lit. f DSGVO verarbeite, hast du das Recht, aus Gründen, die sich
                  aus deiner besonderen Situation ergeben, jederzeit Widerspruch
                  gegen die Verarbeitung einzulegen.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  15. Datensicherheit
                </h2>
                <p>
                  Ich treffe angemessene technische und organisatorische Maßnahmen,
                  um personenbezogene Daten gegen Verlust, Missbrauch, unbefugten
                  Zugriff, unbefugte Offenlegung oder unbefugte Veränderung zu
                  schützen.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  16. Keine Pflicht zur Bereitstellung bestimmter Daten
                </h2>
                <p>
                  Soweit die Bereitstellung personenbezogener Daten für die Nutzung
                  der Anwendung oder einzelner Funktionen erforderlich ist, ist ohne
                  diese Daten eine Nutzung unter Umständen nicht oder nur
                  eingeschränkt möglich.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  17. Keine automatisierte Entscheidungsfindung
                </h2>
                <p>
                  Eine automatisierte Entscheidungsfindung einschließlich Profiling
                  im Sinne von Art. 22 DSGVO findet nicht statt, sofern in dieser
                  Datenschutzerklärung nicht ausdrücklich etwas anderes angegeben
                  ist.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">
                  18. Änderungen dieser Datenschutzerklärung
                </h2>
                <p>
                  Ich behalte mir vor, diese Datenschutzerklärung anzupassen, wenn
                  dies aufgrund technischer, rechtlicher oder inhaltlicher Änderungen
                  der Website oder Anwendung erforderlich wird.
                </p>
                <p>Stand: 17.04.2026</p>
              </section>
            </div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </main>
  );
}
