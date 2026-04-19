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
import { formatCurrencyWhole } from "@/lib/formatting/currency";

export type PlausibilityNotice = {
  id: string;
  title: string;
  body: string;
  category: "data_quality" | "plausibility" | "model";
  action?: {
    label: string;
    href: string;
  };
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

function formatCountLabel(count: number, singular: string, plural: string) {
  return count === 1 ? singular : `${count} ${plural}`;
}

function shortenEtfName(name: string) {
  const normalized = normalizeEtfName(name);

  if (normalized.includes("MSCI ACWI")) {
    return "MSCI ACWI";
  }

  if (normalized.includes("MSCI WORLD")) {
    return "MSCI World";
  }

  if (normalized.includes("FTSE ALL-WORLD") || normalized.includes("FTSE ALL WORLD")) {
    return "FTSE All-World";
  }

  if (normalized.includes("S&P 500") || normalized.includes("SP 500")) {
    return "S&P 500";
  }

  return name
    .replace(/\b(ISHARES|XTRACKERS|VANGUARD|AMUNDI|INVESCO|LYXOR|SPDR|UBS)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
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
    const shortNames = globalCore
      .slice(0, 3)
      .map(shortenEtfName)
      .filter((name) => name.length > 0);

    notices.push({
      id: "overlap-global-equity-core",
      title: `Mögliche Überlappung zwischen ${globalCore.length} ETFs`,
      body:
        shortNames.length > 0
          ? `${shortNames.join(", ")} decken ähnliche globale Aktienmärkte ab. Die tatsächliche Streuung kann geringer sein als gedacht.`
          : "Mehrere ETFs decken ähnliche globale Aktienmärkte ab. Die tatsächliche Streuung kann geringer sein als gedacht.",
      category: "plausibility",
      action: {
        label: "Allokation prüfen",
        href: "/allokation",
      },
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
      title: "Noch keine Einzahlungen geplant",
      body: "Ohne Monatsbeitrag oder Sonderzahlung bleibt deine Planung vorerst stehen.",
      category: "data_quality",
      action: {
        label: "Einzahlungen einrichten",
        href: "/einzahlungen",
      },
      tone: "warning",
    });
  } else if (rules.length === 0) {
    notices.push({
      id: "contributions-no-recurring",
      title: "Keine laufende Monatsrate",
      body: "Bisher fließen nur Sonderzahlungen ein. Für einen regelmäßigen Plan fehlt noch ein Monatsbeitrag.",
      category: "data_quality",
      action: {
        label: "Einzahlungen einrichten",
        href: "/einzahlungen",
      },
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
      title: "Allokation noch unvollständig",
      body: "Neue Einzahlungen können noch nicht automatisch auf ETFs verteilt werden.",
      category: "data_quality",
      action: {
        label: "Allokation prüfen",
        href: "/allokation",
      },
      tone: "warning",
    });
  }

  const monthsWithUnallocated = timeline.filter(
    (month) => month.unallocatedAmount > 0,
  );

  if (monthsWithUnallocated.length > 0) {
    notices.push({
      id: "allocation-unallocated",
      title: "Ein Teil bleibt unverplant",
      body: "In deiner Verteilung bleibt ein Rest ohne Zuordnung. Meist fehlen aktive Zielquoten oder die Summe liegt unter 100 %.",
      category: "data_quality",
      action: {
        label: "Allokation prüfen",
        href: "/allokation",
      },
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
      title: "Vereinfachtes Modell",
      body: "Ohne Steuern, Inflation, Rebalancing und Entnahme. Monte-Carlo zeigt Bandbreiten, keine Garantie.",
      category: "model",
      tone: "info",
    },
  ];

  if (allocationRules.length === 0) {
    notices.push({
      id: "analysis-no-allocation",
      title: "Neue Beiträge ohne Zuordnung",
      body: "Für künftige Einzahlungen fehlt noch eine Verteilung auf ETFs.",
      category: "data_quality",
      action: {
        label: "Allokation prüfen",
        href: "/allokation",
      },
      tone: "warning",
    });
  }

  if (allocationTimeline.some((month) => month.unallocatedAmount > 0)) {
    notices.push({
      id: "analysis-unallocated",
      title: "Ein Teil bleibt unverplant",
      body: "Ein Teil deiner geplanten Einzahlungen fließt aktuell in keinen ETF. Dadurch bleibt mehr Geld als Reserve liegen.",
      category: "data_quality",
      action: {
        label: "Allokation prüfen",
        href: "/allokation",
      },
      tone: "warning",
    });
  }

  const missingStartingValueCount = assumptions.filter(
    (assumption) => assumption.startingValue <= 0,
  ).length;

  if (missingStartingValueCount > 0) {
    notices.push({
      id: "analysis-missing-price",
      title:
        missingStartingValueCount === 1
          ? "Ein ETF ohne Startwert"
          : `${missingStartingValueCount} ETFs ohne Startwert`,
      body: "Bei mindestens einem ETF fehlt Stückzahl oder Einstandskurs. So lange bleibt der Startwert 0 € und die Prognose ist weniger aussagekräftig.",
      category: "data_quality",
      action: {
        label: "Im Portfolio ergänzen",
        href: "/portfolio",
      },
      tone: "warning",
    });
  }

  if (assumptions.some((assumption) => assumption.expectedReturnAnnual > 0.1)) {
    notices.push({
      id: "analysis-high-return",
      title: "Rendite eher optimistisch",
      body: "Mindestens eine Renditeannahme liegt über 10 % pro Jahr. Das ist möglich, für lange Zeiträume aber oft sehr ambitioniert.",
      category: "plausibility",
      action: {
        label: "Annahmen prüfen",
        href: "/analyse",
      },
      tone: "warning",
    });
  }

  if (assumptions.some((assumption) => assumption.terBps > 100)) {
    notices.push({
      id: "analysis-high-ter",
      title: "Kostenannahmen eher hoch",
      body: "Mindestens ein ETF liegt über 1,00 % laufenden Kosten pro Jahr. Prüfe, ob dieser Wert zu deinem ETF passt.",
      category: "plausibility",
      action: {
        label: "Annahmen prüfen",
        href: "/analyse",
      },
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
      title: "Schwankungen eher hoch",
      body: "Mindestens eine Schwankungsannahme ist sehr hoch. Dadurch wird die Bandbreite der möglichen Ergebnisse deutlich größer.",
      category: "plausibility",
      action: {
        label: "Annahmen prüfen",
        href: "/analyse",
      },
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
      title: "Sehr hoher Sicherheitswunsch",
      body: "Eine gewünschte Zielwahrscheinlichkeit ab 85 % erhöht oft den nötigen Monatsbeitrag deutlich.",
      category: "plausibility",
      action: {
        label: "Ziel anpassen",
        href: "/ziele",
      },
      tone: "info",
    });
  }

  if (yearsUntilTarget <= 7 && goalSettings.targetWealth >= 1000000) {
    notices.push({
      id: "goal-short-horizon",
      title: "Kurzer Horizont für hohes Ziel",
      body: `Für ${formatCurrencyWhole(goalSettings.targetWealth)} in ${yearsUntilTarget} Jahren ist die Bandbreite weit. Höhere Monatsrate oder späteres Zieljahr machen den Plan belastbarer.`,
      category: "plausibility",
      action: {
        label: "Ziel anpassen",
        href: "/ziele",
      },
      tone: "warning",
    });
  }

  if (!optimizationResult.isReachableWithinSearchRange) {
    notices.push({
      id: "goal-unreachable",
      title: "Ziel derzeit sehr anspruchsvoll",
      body: "Selbst mit einer deutlich höheren Monatsrate bleibt dein Ziel im aktuellen Rahmen schwer erreichbar. Ein späteres Zieljahr oder ein niedrigeres Ziel kann den Plan robuster machen.",
      category: "plausibility",
      action: {
        label: "Ziel anpassen",
        href: "/ziele",
      },
      tone: "warning",
    });
  } else if (evaluation.successProbability < 0.25) {
    notices.push({
      id: "goal-ambitious",
      title: "Aktueller Plan eher ambitioniert",
      body: "Mit deinem heutigen Plan bleibt die Zielerreichung eher niedrig. Prüfe Zielhöhe, Zieljahr oder künftige Monatsrate.",
      category: "plausibility",
      action: {
        label: "Ziel anpassen",
        href: "/ziele",
      },
      tone: "warning",
    });
  }

  if (evaluation.isTargetOutsideSimulationHorizon) {
    notices.push({
      id: "goal-horizon-adjusted",
      title: "Zieljahr liegt außerhalb des Blicks",
      body: "Für dein Zieljahr reicht der aktuelle Analysezeitraum nicht aus. Bitte prüfe Zieljahr und Analysehorizont.",
      category: "data_quality",
      action: {
        label: "Ziel anpassen",
        href: "/ziele",
      },
      tone: "warning",
    });
  }

  return dedupeNotices(notices);
}
