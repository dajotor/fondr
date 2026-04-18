import type { ProjectionAssumption } from "@/domain/analysis/types";
import type {
  AllocationEtfOption,
  AllocationRuleView,
  AllocationTimelineMonth,
} from "@/domain/allocation/types";
import type { ContributionRule, LumpSumContribution } from "@/domain/contributions/types";
import type {
  GoalEvaluation,
  GoalOptimizationResult,
  GoalSettings,
} from "@/domain/goals/types";
import { getCurrentMonthStart, toMonthKey } from "@/features/contributions/lib/months";

export type PlausibilityNotice = {
  id: string;
  title: string;
  body: string;
  tone?: "info" | "warning";
};

function dedupeNotices(items: PlausibilityNotice[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function normalizeEtfName(name: string) {
  return name.toUpperCase().replace(/\s+/g, " ").trim();
}

function getOverlapBucket(name: string) {
  const normalized = normalizeEtfName(name);

  if (
    normalized.includes("MSCI WORLD") ||
    normalized.includes("ACWI") ||
    normalized.includes("ALL-WORLD") ||
    normalized.includes("ALL WORLD")
  ) {
    return "global-equity-core";
  }

  if (normalized.includes("S&P 500") || normalized.includes("SP 500")) {
    return "us-large-cap";
  }

  return null;
}

export function buildEtfOverlapNotices(
  etfNames: string[],
): PlausibilityNotice[] {
  const buckets = new Map<string, string[]>();

  for (const name of etfNames) {
    const bucket = getOverlapBucket(name);

    if (!bucket) {
      continue;
    }

    const current = buckets.get(bucket) ?? [];
    current.push(name);
    buckets.set(bucket, current);
  }

  const notices: PlausibilityNotice[] = [];
  const globalCore = buckets.get("global-equity-core") ?? [];

  if (globalCore.length >= 2) {
    notices.push({
      id: "overlap-global-equity-core",
      title: "Moegliche ETF-Ueberlappung",
      body: `${globalCore.slice(0, 3).join(", ")} bilden wahrscheinlich aehnliche globale Aktienmaerkte ab. Das kann okay sein, fuehrt aber oft zu mehr Ueberschneidung als erwartet.`,
      tone: "warning",
    });
  }

  return notices;
}

export function buildContributionNotices(params: {
  rules: ContributionRule[];
  lumpSums: LumpSumContribution[];
}): PlausibilityNotice[] {
  const { rules, lumpSums } = params;
  const notices: PlausibilityNotice[] = [];

  if (rules.length === 0 && lumpSums.length === 0) {
    notices.push({
      id: "contributions-empty",
      title: "Noch keine zukuenftigen Einzahlungen geplant",
      body: "Ohne monatliche Regeln oder Sonderzahlungen bleibt die Vorschau bis auf Weiteres bei 0 EUR pro Monat.",
      tone: "warning",
    });
  } else if (rules.length === 0) {
    notices.push({
      id: "contributions-no-recurring",
      title: "Keine laufende Monatsrate",
      body: "Aktuell beruecksichtigt die Planung nur Sonderzahlungen. Wenn du regelmaessig investieren willst, lege eine monatliche Regel an.",
      tone: "info",
    });
  }

  return notices;
}

export function buildAllocationNotices(params: {
  rules: AllocationRuleView[];
  timeline: AllocationTimelineMonth[];
  etfs: AllocationEtfOption[];
  contributionRules: ContributionRule[];
  lumpSums: LumpSumContribution[];
}): PlausibilityNotice[] {
  const { rules, timeline, etfs, contributionRules, lumpSums } = params;
  const notices: PlausibilityNotice[] = [
    ...buildContributionNotices({
      rules: contributionRules,
      lumpSums,
    }),
    ...buildEtfOverlapNotices(etfs.map((etf) => etf.etfName)),
  ];

  if (rules.length === 0) {
    notices.push({
      id: "allocation-no-rules",
      title: "Noch keine Allokationsregeln aktiv",
      body: "Ohne aktive ETFs und Zielquoten können neue Beiträge noch nicht automatisch verteilt werden.",
      tone: "warning",
    });
  }

  const monthsWithUnallocated = timeline.filter(
    (month) => month.unallocatedAmount > 0,
  );

  if (monthsWithUnallocated.length > 0) {
    notices.push({
      id: "allocation-unallocated",
      title: "Ein Teil der Beitraege bleibt uninvestiert",
      body: "In der Vorschau gibt es Monate mit unverplantem Rest. Typische Ursachen sind fehlende aktive Zielquoten oder eine Summe unter 100 %.",
      tone: "warning",
    });
  }

  return dedupeNotices(notices);
}

export function buildAnalysisNotices(params: {
  assumptions: ProjectionAssumption[];
  contributionRules: ContributionRule[];
  lumpSums: LumpSumContribution[];
  allocationRules: AllocationRuleView[];
  allocationTimeline: AllocationTimelineMonth[];
}): PlausibilityNotice[] {
  const {
    assumptions,
    contributionRules,
    lumpSums,
    allocationRules,
    allocationTimeline,
  } = params;
  const notices: PlausibilityNotice[] = [
    ...buildContributionNotices({
      rules: contributionRules,
      lumpSums,
    }),
    ...buildEtfOverlapNotices(assumptions.map((assumption) => assumption.etfName)),
    {
      id: "analysis-methodology",
      title: "Wichtiger Modellhinweis",
      body: "Die Analyse beruecksichtigt aktuell keine Steuern, keine Inflation, kein Rebalancing und keine Entnahmephase. Monte Carlo zeigt Bandbreiten, keine Garantie.",
      tone: "info",
    },
  ];

  if (allocationRules.length === 0) {
    notices.push({
      id: "analysis-no-allocation",
      title: "Neue Beitraege koennen noch nicht investiert werden",
      body: "Solange keine Allokationsregeln hinterlegt sind, bleiben zukuenftige Einzahlungen in der Analyse als nicht investierter Anteil sichtbar.",
      tone: "warning",
    });
  }

  if (allocationTimeline.some((month) => month.unallocatedAmount > 0)) {
    notices.push({
      id: "analysis-unallocated",
      title: "Nicht zugewiesene Beitraege vorhanden",
      body: "Ein Teil der geplanten Einzahlungen findet aktuell keinen aktiven ETF. Das drueckt die Aussagekraft der Projektion fuer investiertes Vermoegen.",
      tone: "warning",
    });
  }

  if (assumptions.some((assumption) => assumption.startingValue <= 0)) {
    notices.push({
      id: "analysis-missing-price",
      title: "Einige Startwerte sind unvollstaendig",
      body: "Mindestens ein ETF startet mit 0 EUR, weil Stueckzahl oder Preisbasis fehlen. Pruefe Portfolio und manuelle Kurse fuer eine belastbarere Analyse.",
      tone: "warning",
    });
  }

  if (assumptions.some((assumption) => assumption.expectedReturnAnnual > 0.1)) {
    notices.push({
      id: "analysis-high-return",
      title: "Renditeannahmen eher offensiv",
      body: "Mindestens eine erwartete Rendite liegt ueber 10 % pro Jahr. Solche Werte sind moeglich, aber fuer langfristige Planung oft optimistisch.",
      tone: "warning",
    });
  }

  if (assumptions.some((assumption) => assumption.terBps > 100)) {
    notices.push({
      id: "analysis-high-ter",
      title: "TER-Annahmen eher hoch",
      body: "Mindestens ein ETF liegt ueber 1,00 % TER. Das ist nicht unmoeglich, sollte fuer ein ETF-Portfolio aber bewusst geprueft werden.",
      tone: "warning",
    });
  }

  if (
    assumptions.some(
      (assumption) =>
        assumption.volatilityAnnual !== null &&
        assumption.volatilityAnnual > 0.35,
    )
  ) {
    notices.push({
      id: "analysis-high-volatility",
      title: "Volatilitaetsannahmen eher hoch",
      body: "Mindestens ein ETF liegt ueber 35 % erwarteter Volatilitaet pro Jahr. Das sorgt in Monte Carlo fuer sehr breite Bandbreiten.",
      tone: "warning",
    });
  }

  return dedupeNotices(notices);
}

export function buildGoalNotices(params: {
  goalSettings: GoalSettings;
  evaluation: GoalEvaluation;
  optimizationResult: GoalOptimizationResult;
  assumptions: ProjectionAssumption[];
  contributionRules: ContributionRule[];
  lumpSums: LumpSumContribution[];
  allocationRules: AllocationRuleView[];
  allocationTimeline: AllocationTimelineMonth[];
}): PlausibilityNotice[] {
  const {
    goalSettings,
    evaluation,
    optimizationResult,
    assumptions,
    contributionRules,
    lumpSums,
    allocationRules,
    allocationTimeline,
  } = params;
  const notices = buildAnalysisNotices({
    assumptions,
    contributionRules,
    lumpSums,
    allocationRules,
    allocationTimeline,
  });
  const currentYear = Number(toMonthKey(getCurrentMonthStart()).slice(0, 4));
  const yearsUntilTarget = goalSettings.targetYear - currentYear;

  if (goalSettings.requiredProbability >= 0.85) {
    notices.push({
      id: "goal-high-probability",
      title: "Sehr hoher Zielkorridor",
      body: "Eine gewuenschte Erfolgswahrscheinlichkeit von 85 % oder mehr ist moeglich, fuehrt aber oft zu deutlich hoeheren noetigen Monatsraten.",
      tone: "info",
    });
  }

  if (yearsUntilTarget <= 7 && goalSettings.targetWealth >= 1000000) {
    notices.push({
      id: "goal-short-horizon",
      title: "Kurzer Horizont fuer ein hohes Ziel",
      body: "Ein grosses Ziel in wenigen Jahren ist oft besonders anspruchsvoll. Nutze das Ergebnis eher als Groessenordnung als als exakte Zusage.",
      tone: "warning",
    });
  }

  if (!optimizationResult.isReachableWithinSearchRange) {
    notices.push({
      id: "goal-unreachable",
      title: "Ziel im MVP aktuell kaum erreichbar",
      body: "Innerhalb unseres Suchrahmens bleibt das Ziel selbst mit sehr hoher konstanter Monatsrate ausser Reichweite. Ein spaeteres Zieljahr oder ein niedrigeres Ziel kann sinnvoller sein.",
      tone: "warning",
    });
  } else if (evaluation.successProbability < 0.25) {
    notices.push({
      id: "goal-ambitious",
      title: "Mit dem aktuellen Plan eher ambitioniert",
      body: "Die Monte-Carlo-Laeufe zeigen derzeit nur eine geringe Zielerreichung. Pruefe Zielhoehe, Zieljahr oder kuenftige Monatsrate.",
      tone: "warning",
    });
  }

  if (evaluation.isTargetOutsideSimulationHorizon) {
    notices.push({
      id: "goal-horizon-adjusted",
      title: "Zielmonat wurde an den verfuegbaren Horizont angepasst",
      body: "Die Auswertung musste auf den letzten verfuegbaren Simulationsmonat begrenzt werden. Bitte pruefe Zieljahr und Analysehorizont.",
      tone: "warning",
    });
  }

  return dedupeNotices(notices);
}
