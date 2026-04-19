import { GoalOptimizationCard } from "@/components/goals/goal-optimization-card";
import { GoalPlanComparison } from "@/components/goals/goal-plan-comparison";
import { GoalSettingsForm } from "@/components/goals/goal-settings-form";
import { GoalStatusCards } from "@/components/goals/goal-status-cards";
import type { GoalSettings } from "@/domain/goals/types";
import { getAllocationRules } from "@/features/allocation/queries/get-allocation-rules";
import { getManualAllocationOverrides } from "@/features/allocation/queries/get-manual-allocation-overrides";
import { getPortfolioAllocationEtfs } from "@/features/allocation/queries/get-portfolio-allocation-etfs";
import { getProjectionAssumptions } from "@/features/analysis/queries/get-projection-assumptions";
import { getContributionRules } from "@/features/contributions/queries/get-contribution-rules";
import { getLumpSumContributions } from "@/features/contributions/queries/get-lump-sum-contributions";
import {
  comparePlans,
  evaluateGoalAgainstSimulation,
  getTargetMonthIndex,
  findRequiredMonthlyContribution,
  GOAL_MONTE_CARLO_RUNS,
  GOAL_MONTE_CARLO_SEED,
} from "@/features/goals/lib/goal-optimization";
import { getGoalSettings } from "@/features/goals/queries/get-goal-settings";
import { requireUser } from "@/lib/auth/guard";
import { formatCurrencyWhole } from "@/lib/formatting/currency";
import { formatProbabilityFromRate } from "@/lib/formatting/number";
import { buildContributionTimelinePreview } from "@/features/contributions/lib/timeline";
import { buildAllocationTimelinePreview } from "@/features/allocation/lib/calculate";
import { runMonteCarloSimulation } from "@/features/analysis/lib/monte-carlo";
import { buildGoalNotices } from "@/lib/plausibility";
import { DEFAULT_REQUIRED_PROBABILITY_PERCENT } from "@/features/goals/validators/goal-settings.schema";

function buildDefaultGoalSettings(userId: string): GoalSettings {
  const currentYear = new Date().getUTCFullYear();

  return {
    id: "default-goal-settings",
    userId,
    targetWealth: 2000000,
    targetYear: currentYear + 15,
    requiredProbability: DEFAULT_REQUIRED_PROBABILITY_PERCENT / 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default async function GoalsPage() {
  const user = await requireUser();
  const [
    storedGoalSettings,
    assumptions,
    contributionRules,
    lumpSums,
    allocationRules,
    overrides,
    portfolioEtfs,
  ] = await Promise.all([
    getGoalSettings(user.id),
    getProjectionAssumptions(user.id),
    getContributionRules(user.id),
    getLumpSumContributions(user.id),
    getAllocationRules(user.id),
    getManualAllocationOverrides(user.id),
    getPortfolioAllocationEtfs(user.id),
  ]);
  const goalSettings = storedGoalSettings ?? buildDefaultGoalSettings(user.id);

  if (assumptions.length === 0) {
    return (
      <section className="space-y-8">
        <div className="app-card relative overflow-hidden">
          <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-fuchsia-500/18 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-10 h-36 w-36 rounded-full bg-orange-500/14 blur-3xl" />
          <div className="relative space-y-4">
            <span className="app-eyebrow">
              Ziele
            </span>
            <div className="space-y-4">
              <h2 className="max-w-5xl text-5xl font-semibold tracking-[-0.055em] text-foreground md:text-6xl">
                Ziele planen, sobald deine Grundlage steht
              </h2>
              <p className="max-w-3xl text-[15px] leading-8 text-slate-300">
                Lege zuerst Portfolio, Einzahlungen, Allokation und Annahmen an.
                Dann kann FONDR einschätzen, wie gut dein heutiger Plan zu deinem
                Ziel passt.
              </p>
            </div>
            <div className="app-accent-line max-w-2xl" />
          </div>
        </div>
      </section>
    );
  }

  const monthsAhead = getTargetMonthIndex(goalSettings.targetYear) + 1;
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
  const currentSimulation = runMonteCarloSimulation({
    assumptions,
    allocationTimeline,
    runs: GOAL_MONTE_CARLO_RUNS,
    seed: GOAL_MONTE_CARLO_SEED,
  });
  const currentEvaluation = evaluateGoalAgainstSimulation({
    goalSettings,
    simulation: currentSimulation,
  });
  const optimizationResult = findRequiredMonthlyContribution({
    assumptions,
    allocationRules,
    overrides,
    portfolioEtfs,
    existingRules: contributionRules,
    lumpSums,
    goalSettings,
  });
  const comparisons = comparePlans({
    assumptions,
    allocationRules,
    overrides,
    portfolioEtfs,
    existingRules: contributionRules,
    lumpSums,
    goalSettings,
  });
  const notices = buildGoalNotices({
    goalSettings,
    evaluation: currentEvaluation,
    optimizationResult,
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
            Ziele
          </span>
          <div className="space-y-4">
            <h2 className="max-w-5xl text-5xl font-semibold tracking-[-0.055em] text-foreground md:text-6xl">
              Prüfe, ob dein heutiger Plan zu deinem Ziel passt
            </h2>
            <p className="max-w-3xl text-[15px] leading-8 text-slate-300">
              Hier siehst du, wie gut dein heutiger Plan zu deinem Ziel passt und
              welcher monatliche Beitrag nötig wäre, wenn du nachsteuern möchtest.
              Im aktuellen Plan berücksichtigen wir dein Portfolio, laufende
              Monatsbeiträge, geplante Sonderzahlungen, die Allokation und deine
              ETF-Annahmen. Sonderzahlungen bleiben auch im Planvergleich erhalten.
            </p>
          </div>
          <div className="app-accent-line max-w-2xl" />
        </div>
      </div>
      <div className="app-card">
        <div className="mb-6 space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Zieldefinition
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Wir rechnen auf Dezember {goalSettings.targetYear}, also auf das Ende
            deines Zieljahres.
          </p>
        </div>
        <GoalSettingsForm goalSettings={goalSettings} />
        {notices
          .filter((notice) => notice.id === "goal-horizon-adjusted")
          .map((notice) => (
            <p
              key={notice.id}
              className="mt-4 text-sm leading-6 text-muted-foreground"
            >
              {notice.body}
            </p>
          ))}
      </div>

      <GoalStatusCards
        goalSettings={goalSettings}
        evaluation={currentEvaluation}
      />
      {notices
        .filter((notice) => notice.category === "plausibility" && notice.id.startsWith("goal-"))
        .map((notice) => (
          <details
            key={notice.id}
            className="text-sm text-foreground"
          >
            <summary className="cursor-pointer list-none font-medium">
              {notice.title}
            </summary>
            <p className="mt-2 leading-6 text-muted-foreground">
              {notice.body}
            </p>
          </details>
        ))}
      <p className="text-xs leading-6 text-muted-foreground">
        Vereinfachtes Modell: ohne Steuern, Inflation, Rebalancing und
        Entnahme. Monte-Carlo zeigt Bandbreiten, keine Garantie.
      </p>

      <div className="app-card">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            So sieht dein heutiger Plan aus
          </h3>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Mit deinem heutigen Plan aus Portfolio, laufenden Monatsbeiträgen
            und geplanten Sonderzahlungen liegt die Erfolgswahrscheinlichkeit bei{" "}
            {formatProbabilityFromRate(currentEvaluation.successProbability)}.
            Zum Ende von {goalSettings.targetYear} liegt der mittlere Verlauf bei{" "}
            {formatCurrencyWhole(currentEvaluation.p50TargetValue)}.
          </p>
        </div>
      </div>

      <GoalOptimizationCard
        goalSettings={goalSettings}
        optimizationResult={optimizationResult}
      />

      <div className="app-card">
        <div className="mb-6 space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            Planvergleich
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Zwei Vergleichsvarianten zeigen, was dein Plan bei anderer
            Zielsicherheit kosten würde. Sonderzahlungen bleiben unverändert.
          </p>
        </div>
        <GoalPlanComparison comparisons={comparisons} />
      </div>
    </section>
  );
}
