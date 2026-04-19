import { AllocationRuleCard } from "@/components/allocation/allocation-rule-card";
import { AllocationTimelinePreview } from "@/components/allocation/allocation-timeline-preview";
import { ManualAllocationOverrideForm } from "@/components/allocation/manual-allocation-override-form";
import { ManualAllocationOverridesList } from "@/components/allocation/manual-allocation-overrides-list";
import { buildAllocationTimelinePreview } from "@/features/allocation/lib/calculate";
import { getAllocationRules } from "@/features/allocation/queries/get-allocation-rules";
import { getManualAllocationOverrides } from "@/features/allocation/queries/get-manual-allocation-overrides";
import { getPortfolioAllocationEtfs } from "@/features/allocation/queries/get-portfolio-allocation-etfs";
import { buildContributionTimelinePreview } from "@/features/contributions/lib/timeline";
import { getContributionRules } from "@/features/contributions/queries/get-contribution-rules";
import { getLumpSumContributions } from "@/features/contributions/queries/get-lump-sum-contributions";
import { requireUser } from "@/lib/auth/guard";
import { buildAllocationNotices } from "@/lib/plausibility";
import { formatPercentage } from "@/lib/formatting/number";

const PERCENTAGE_CONFIGURATION_EPSILON = 0.01;

export default async function AllocationPage() {
  const user = await requireUser();
  const [
    portfolioEtfs,
    allocationRules,
    overrides,
    contributionRules,
    lumpSums,
  ] = await Promise.all([
    getPortfolioAllocationEtfs(user.id),
    getAllocationRules(user.id),
    getManualAllocationOverrides(user.id),
    getContributionRules(user.id),
    getLumpSumContributions(user.id),
  ]);

  const contributionTimeline = buildContributionTimelinePreview(
    contributionRules,
    lumpSums,
    24,
  );
  const allocationTimeline = buildAllocationTimelinePreview(
    contributionTimeline,
    allocationRules,
    overrides,
    portfolioEtfs,
  );
  const notices = buildAllocationNotices({
    rules: allocationRules,
    timeline: allocationTimeline,
    etfs: portfolioEtfs,
    contributionRules,
    lumpSums,
  });
  const activeRules = allocationRules.filter((rule) => rule.isActive);
  const configuredActiveRules = activeRules.filter(
    (rule) => (rule.targetPercentage ?? 0) > PERCENTAGE_CONFIGURATION_EPSILON,
  );
  const activePercentageTotal = configuredActiveRules.reduce(
    (sum, rule) => sum + (rule.targetPercentage ?? 0),
    0,
  );
  const activePercentageOverconfigured =
    activePercentageTotal - 100 > PERCENTAGE_CONFIGURATION_EPSILON;
  const activePercentageIncomplete =
    !activePercentageOverconfigured &&
    activeRules.length > 0 &&
    activePercentageTotal < 100 - PERCENTAGE_CONFIGURATION_EPSILON;
  const usesPercentageStandardModel =
    configuredActiveRules.length > 0 &&
    !activePercentageOverconfigured &&
    Math.abs(activePercentageTotal - 100) <= PERCENTAGE_CONFIGURATION_EPSILON;

  return (
    <section className="space-y-8">
      <div className="app-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-fuchsia-500/18 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-10 h-36 w-36 rounded-full bg-orange-500/14 blur-3xl" />
        <div className="relative space-y-4">
          <span className="app-eyebrow">
            Allokation
          </span>
          <div className="space-y-4">
            <h2 className="max-w-5xl text-[2rem] leading-[1.1] font-semibold tracking-[-0.055em] text-foreground sm:text-5xl md:text-6xl">
              Lege fest, wie neue Einzahlungen verteilt werden.
            </h2>
            <p className="max-w-3xl text-[15px] leading-8 text-slate-300">
              Hier legst du fest, welche ETFs aktiv bespart werden, mit welchem
              Anteil. So bleibt dein Sparplan klar, nachvollziehbar und ruhig
              steuerbar.
            </p>
          </div>
          <div className="app-accent-line max-w-2xl" />
        </div>
      </div>
      {portfolioEtfs.length === 0 ? (
        <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Noch keine ETFs im Portfolio
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Die Verteilung arbeitet nur mit ETFs, die bereits in deinem
            Portfolio liegen. Lege zuerst mindestens eine Position an, bevor du
            Regeln für künftige Einzahlungen festlegst.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
            <div className="mb-6 space-y-2">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Aktive Verteilung
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                Wähle je ETF, ob er aktiv bespart wird und mit welchem Anteil.
              </p>
            </div>

            <div className="mb-6 grid gap-4 rounded-[calc(var(--radius)+2px)] border border-border/80 bg-card/40 p-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Aktiv bespart
                </p>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {activeRules.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  von {portfolioEtfs.length} ETFs im Portfolio
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Summe der Zielquoten
                </p>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {formatPercentage(activePercentageTotal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activePercentageOverconfigured
                    ? "So ist die Verteilung noch nicht gültig. Bitte reduziere die aktiven Zielquoten zusammen auf höchstens 100 %."
                    : activePercentageIncomplete
                      ? "Der verbleibende Anteil bleibt vorerst unverplant und wird als Reserve weitergeführt."
                      : "Nur aktive ETFs mit hinterlegtem Anteil werden mitgezählt."}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Aktueller Modus
                </p>
                <p className="text-sm font-medium text-foreground">
                  {usesPercentageStandardModel
                    ? "Prozent-Allokation aktiv"
                    : activePercentageOverconfigured
                      ? "Zielquoten bitte anpassen"
                      : "Prozent-Allokation noch nicht vollständig"}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {usesPercentageStandardModel
                    ? "Die automatische Verteilung kann mit deinen aktiven Zielquoten rechnen."
                    : activePercentageOverconfigured
                      ? "Die aktiven Zielquoten dürfen zusammen nicht über 100 % liegen."
                      : "Sobald alle aktiven ETFs einen Anteil haben und zusammen 100 % ergeben, verteilt FONDR neue Einzahlungen automatisch danach."}
                </p>
              </div>
            </div>

            {notices
              .filter((notice) =>
                notice.id === "allocation-no-rules" ||
                notice.id === "allocation-unallocated",
              )
              .map((notice) => (
                <p
                  key={notice.id}
                  className="mb-3 text-sm leading-6 text-muted-foreground"
                >
                  {notice.body}
                </p>
              ))}

            {notices
              .filter((notice) => notice.id === "overlap-global-equity-core")
              .map((notice) => (
                <details
                  key={notice.id}
                  className="mb-3 text-sm text-foreground"
                >
                  <summary className="cursor-pointer list-none font-medium">
                    {notice.title}
                  </summary>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    {notice.body}
                  </p>
                </details>
              ))}

            <div className="grid gap-4 xl:grid-cols-2">
              {portfolioEtfs.map((etf) => (
                <AllocationRuleCard
                  key={etf.etfId}
                  etf={etf}
                  rule={
                    allocationRules.find((rule) => rule.etfId === etf.etfId) ??
                    null
                  }
                />
              ))}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
              <div className="mb-6 space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Monatliche Ausnahmen
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Für einzelne Monate kannst du feste Prozentanteile vorgeben.
                  Bleibt danach noch etwas übrig, verteilt FONDR den Rest nach
                  deiner aktiven Standard-Allokation weiter.
                </p>
              </div>
              <ManualAllocationOverrideForm etfs={portfolioEtfs} />
            </div>

            <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
              <div className="mb-6 space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Geplante Ausnahmen
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Diese Ausnahmen haben in ihrem Monat Vorrang. Ein verbleibender
                  Rest wird danach automatisch weiterverteilt.
                </p>
              </div>
              <ManualAllocationOverridesList overrides={overrides} />
            </div>
          </div>
        </>
      )}

      <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
        <div className="mb-6 space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            So würde die Verteilung in den nächsten 24 Monaten aussehen
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Die Vorschau zeigt dir pro Monat, wie dein Beitrag auf ETFs verteilt
            würde, welche Monats-Ausnahmen eingreifen und ob ein Rest übrig
            bleibt, weil keine passende Regel greift.
          </p>
        </div>
        <AllocationTimelinePreview timeline={allocationTimeline} />
      </div>
    </section>
  );
}
