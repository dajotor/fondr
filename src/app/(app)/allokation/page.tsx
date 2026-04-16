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
import { NoticeList } from "@/components/ui/notice-list";
import { buildAllocationNotices } from "@/lib/plausibility";

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
            <h2 className="max-w-5xl text-5xl font-semibold tracking-[-0.055em] text-foreground md:text-6xl">
              Lege fest, wie neue Einzahlungen verteilt werden.
            </h2>
            <p className="max-w-3xl text-[15px] leading-8 text-slate-300">
              Hier bestimmst du, in welcher Reihenfolge neue Beiträge auf deine
              ETFs gehen. So bleibt deine Verteilung nachvollziehbar und
              planbar.
            </p>
          </div>
          <div className="app-accent-line max-w-2xl" />
        </div>
      </div>

      <NoticeList title="Einordnung" items={notices} />

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
                Reihenfolge und Grenzen
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
              Neue Einzahlungen fließen zuerst in den ETF mit der nächsten
              aktiven Reihenfolge. Ist eine Grenze erreicht, wird der restliche
              Betrag im selben Monat automatisch weiterverteilt. Die Grenze
              bezieht sich auf die bisher eingezahlte Summe inklusive Einstand,
              nicht auf den aktuellen Marktwert.
            </p>
          </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {portfolioEtfs.map((etf, index) => (
                <AllocationRuleCard
                  key={etf.etfId}
                  etf={etf}
                  rule={
                    allocationRules.find((rule) => rule.etfId === etf.etfId) ??
                    null
                  }
                  defaultSequenceOrder={index + 1}
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
                  deinen bestehenden Regeln weiter.
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
            würde und ob ein Rest übrig bleibt, weil keine passende Regel greift.
          </p>
        </div>
        <AllocationTimelinePreview timeline={allocationTimeline} />
      </div>
    </section>
  );
}
