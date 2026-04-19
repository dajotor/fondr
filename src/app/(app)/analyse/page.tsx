import { AssumptionFormCard } from "@/components/analysis/assumption-form-card";
import { AnalysisHorizonNav } from "@/components/analysis/analysis-horizon-nav";
import { EndValueDistribution } from "@/components/analysis/end-value-distribution";
import { MonteCarloBandChart } from "@/components/analysis/monte-carlo-band-chart";
import { MonteCarloSummary } from "@/components/analysis/monte-carlo-summary";
import { ProjectionChart } from "@/components/analysis/projection-chart";
import { ProjectionEtfBreakdown } from "@/components/analysis/projection-etf-breakdown";
import { ProjectionMilestones } from "@/components/analysis/projection-milestones";
import { ProjectionSummary } from "@/components/analysis/projection-summary";
import { buildAllocationTimelinePreview } from "@/features/allocation/lib/calculate";
import { normalizeAnalysisYears } from "@/features/analysis/lib/horizon";
import { runMonteCarloSimulation } from "@/features/analysis/lib/monte-carlo";
import { getAllocationRules } from "@/features/allocation/queries/get-allocation-rules";
import { getManualAllocationOverrides } from "@/features/allocation/queries/get-manual-allocation-overrides";
import { getPortfolioAllocationEtfs } from "@/features/allocation/queries/get-portfolio-allocation-etfs";
import { projectPortfolioDeterministically } from "@/features/analysis/lib/projection";
import { getProjectionAssumptions } from "@/features/analysis/queries/get-projection-assumptions";
import { buildContributionTimelinePreview } from "@/features/contributions/lib/timeline";
import { getContributionRules } from "@/features/contributions/queries/get-contribution-rules";
import { getLumpSumContributions } from "@/features/contributions/queries/get-lump-sum-contributions";
import { requireUser } from "@/lib/auth/guard";
import { buildAnalysisNotices } from "@/lib/plausibility";

type AnalysisPageProps = {
  searchParams: Promise<{
    years?: string;
  }>;
};

export default async function AnalysisPage({ searchParams }: AnalysisPageProps) {
  const params = await searchParams;
  const years = normalizeAnalysisYears(params.years);
  const monthsAhead = years * 12;
  const user = await requireUser();
  const [
    assumptions,
    contributionRules,
    lumpSums,
    allocationRules,
    overrides,
    portfolioEtfs,
  ] = await Promise.all([
    getProjectionAssumptions(user.id),
    getContributionRules(user.id),
    getLumpSumContributions(user.id),
    getAllocationRules(user.id),
    getManualAllocationOverrides(user.id),
    getPortfolioAllocationEtfs(user.id),
  ]);

  const contributionTimeline = buildContributionTimelinePreview(
    contributionRules,
    lumpSums,
    monthsAhead,
  );
  const allocationTimeline = buildAllocationTimelinePreview(
    contributionTimeline,
    allocationRules,
    overrides,
    portfolioEtfs,
  );
  const projection = projectPortfolioDeterministically({
    assumptions,
    allocationTimeline,
  });
  const monteCarloSimulation = runMonteCarloSimulation({
    assumptions,
    allocationTimeline,
    runs: 1000,
  });
  const notices = buildAnalysisNotices({
    assumptions,
    contributionRules,
    lumpSums,
    allocationRules,
    allocationTimeline,
  });

  return (
    <section className="space-y-8">
      <div className="app-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-fuchsia-500/18 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-10 h-36 w-36 rounded-full bg-orange-500/14 blur-3xl" />
        <div className="relative space-y-4">
          <span className="app-eyebrow">
            Analyse
          </span>
          <div className="space-y-4">
            <h2 className="max-w-5xl text-[2rem] leading-[1.1] font-semibold tracking-[-0.055em] text-foreground sm:text-5xl md:text-6xl">
              Verstehe, was aus deinem Plan werden kann.
            </h2>
            <p className="max-w-3xl text-[15px] leading-8 text-slate-300">
              Die Analyse zeigt dir zwei Blickwinkel: einen ruhigen Referenzverlauf
              ohne Marktschwankungen und eine Bandbreite möglicher Ergebnisse,
              wenn Märkte nicht planbar laufen.
            </p>
          </div>
          <div className="app-accent-line max-w-2xl" />
        </div>
      </div>

      {assumptions.length === 0 ? (
        <div className="app-card">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Für die Analyse fehlt noch eine Grundlage
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Lege zuerst mindestens eine Position im Portfolio an. Danach kannst
            du Annahmen hinterlegen und sehen, wie sich dein Vermögen über
            2 bis 40 Jahre entwickeln könnte.
          </p>
        </div>
      ) : (
        <>
          <AnalysisHorizonNav years={years} />

          <div className="app-card">
            <div className="mb-6 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Mögliche Entwicklung mit Schwankungen
                </h3>
                <details className="group text-sm text-muted-foreground">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full px-1 py-1 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border text-[11px] font-medium">
                      i
                    </span>
                    <span>Hinweis zu Endwert und P50</span>
                  </summary>
                  <p className="mt-2 max-w-2xl leading-6 text-muted-foreground">
                    Endwert und P50 zeigen zwei verschiedene Perspektiven: Der
                    Endwert zeigt die Entwicklung bei durchschnittlicher Rendite.
                    P50 ist der Median aller simulierten Verläufe. Die Hälfte
                    endet darüber, die andere darunter. Bei hoher
                    Schwankungsbreite liegen beide Werte weiter auseinander.
                  </p>
                </details>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Wir rechnen 1.000 mögliche Verläufe mit denselben Einzahlungen
                und derselben Verteilung durch. So bekommst du ein Gefühl dafür,
                wie breit die Ergebnisse am Ende ausfallen können.
              </p>
            </div>

            <MonteCarloSummary simulation={monteCarloSimulation} />

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
              <div className="space-y-3">
                <div className="app-card-muted">
                  <MonteCarloBandChart simulation={monteCarloSimulation} />
                </div>
                <p className="text-xs leading-6 text-muted-foreground">
                  Vereinfachtes Modell: ohne Steuern, Inflation, Rebalancing und
                  Entnahme. Monte-Carlo zeigt Bandbreiten, keine Garantie.
                </p>
              </div>

              <div className="app-card-muted">
                <div className="mb-4 space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Endwertverteilung
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Hier siehst du, wie sich die möglichen Endwerte am Ende der
                    Laufzeit verteilen.
                  </p>
                </div>
                <EndValueDistribution simulation={monteCarloSimulation} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Ruhiger Referenzverlauf
            </h3>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Diese Sicht rechnet mit denselben Eingaben, aber ohne zufällige
              Marktschwankungen. Sie hilft dir, deinen Plan in einer einfachen
              Grundlinie zu lesen.
            </p>
          </div>

          <ProjectionSummary projection={projection} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
            <div className="app-card">
              <div className="mb-6 space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Verlauf
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  So könnte sich dein Vermögen Monat für Monat über {years} Jahre
                  entwickeln. Nicht investierte Restbeträge bleiben als
                  Cash-Reserve sichtbar.
                </p>
              </div>
              <ProjectionChart projection={projection} />
            </div>

            <ProjectionEtfBreakdown month={projection.months.at(-1)} />
          </div>

          <div className="app-card">
            <div className="mb-6 space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Annahmen je ETF
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Hier hinterlegst du deine Annahmen je ETF. Etwas konservativere
                  Werte machen die Ergebnisse oft besser einordbar.
                </p>
              </div>

            {notices
              .filter((notice) =>
                notice.id === "analysis-high-return" ||
                notice.id === "analysis-high-ter" ||
                notice.id === "analysis-high-volatility",
              )
              .map((notice) => (
                <details
                  key={notice.id}
                  className="mb-4 text-sm text-foreground"
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
              {assumptions.map((assumption) => (
                <AssumptionFormCard
                  key={assumption.etfId}
                  assumption={assumption}
                />
              ))}
            </div>
          </div>

          <div className="app-card">
            <div className="mb-6 space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Eckpunkte
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  Die wichtigsten Zwischenstände auf dem Weg zum Endwert.
                </p>
              </div>
            <ProjectionMilestones projection={projection} />
          </div>
        </>
      )}
    </section>
  );
}
