/**
 * Debug-Script: Vergleicht die Monte-Carlo-Inputs von Dashboard und Ziele-Seite
 * fuer einen gegebenen User, um die Ursache einer verbleibenden Abweichung zu finden.
 *
 * Ausfuehrung:
 *   npx tsx scripts/debug-simulation-diff.ts <USER_UUID>
 *
 * Oder:
 *   DEBUG_USER_ID=<USER_UUID> npx tsx scripts/debug-simulation-diff.ts
 *
 * Anforderungen:
 * - .env.local muss gesetzt sein (Supabase URL, Service Role Key).
 * - Das Script fuehrt keine Schreibvorgaenge aus; es ist reine Lesediagnose.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "../src/db/types/database";
import type { ProjectionAssumption } from "../src/domain/analysis/types";
import type {
  AllocationEtfOption,
  AllocationRuleView,
  AllocationTimelineMonth,
  ManualAllocationOverrideView,
} from "../src/domain/allocation/types";
import type {
  ContributionRule,
  LumpSumContribution,
} from "../src/domain/contributions/types";
import type { GoalSettings } from "../src/domain/goals/types";
import { buildAllocationTimelinePreview } from "../src/features/allocation/lib/calculate";
import {
  calculatePercentile,
  DEFAULT_MONTE_CARLO_RUNS,
  DEFAULT_MONTE_CARLO_SEED,
  runMonteCarloSimulation,
} from "../src/features/analysis/lib/monte-carlo";
import { buildContributionTimelinePreview } from "../src/features/contributions/lib/timeline";
import {
  calculateSuccessProbability,
  evaluateGoalAgainstSimulation,
  getTargetMonthIndex,
} from "../src/features/goals/lib/goal-optimization";

const DASHBOARD_FORECAST_YEARS = 10;
const TARGET_MONTH_SNAPSHOT_POINTS = [0, 10, 20, 30, 40];
const DEFAULT_EXPECTED_RETURN = 0.06;
const DEFAULT_TER_BPS = 20;
const DEFAULT_VOLATILITY = 0.15;

type TypedSupabaseClient = ReturnType<typeof createClient<Database>>;

type AllocationRuleRow = {
  id: string;
  user_id: string;
  etf_id: string;
  is_active: boolean;
  sequence_order: number;
  contribution_cap: string | null;
  target_percentage: string | null;
  created_at: string;
  updated_at: string;
  etf:
    | {
        name: string | null;
        isin: string | null;
      }
    | Array<{
        name: string | null;
        isin: string | null;
      }>
    | null;
};

type LegacyAllocationRuleRow = Omit<
  AllocationRuleRow,
  "is_active" | "target_percentage"
>;

type PortfolioAllocationHoldingRow = {
  etf_id: string;
  name_snapshot: string;
  isin_snapshot: string;
  quantity: string;
  cost_basis_per_share: string | null;
};

type LegacyPortfolioAllocationHoldingRow = Omit<
  PortfolioAllocationHoldingRow,
  "cost_basis_per_share"
>;

function loadEnvFileIfPresent() {
  const envPath = path.resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const envContent = readFileSync(envPath, "utf8");

  for (const rawLine of envContent.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (!key || process.env[key] !== undefined) {
      continue;
    }

    const quotedWithDouble =
      rawValue.startsWith('"') && rawValue.endsWith('"');
    const quotedWithSingle =
      rawValue.startsWith("'") && rawValue.endsWith("'");
    const value =
      quotedWithDouble || quotedWithSingle
        ? rawValue.slice(1, -1)
        : rawValue;

    process.env[key] = value;
  }
}

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function parseNumericValue(value: string | null): number | null {
  if (value === null) {
    return null;
  }

  return Number(value);
}

function isMissingPreparedAllocationColumnsError(error: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}) {
  const combinedMessage = [
    error.code,
    error.message,
    error.details,
    error.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    combinedMessage.includes("is_active") ||
    combinedMessage.includes("target_percentage") ||
    combinedMessage.includes("column") ||
    error.code === "42703" ||
    error.code === "PGRST204"
  );
}

function isMissingCostBasisColumnError(error: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}) {
  const combinedMessage = [
    error.message,
    error.details,
    error.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    combinedMessage.includes("cost_basis_per_share")
  );
}

function getNestedSingle<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function sortAllocationEntries(
  entries: AllocationTimelineMonth["entries"],
) {
  return [...entries].sort((left, right) => {
    const etfComparison = (left.etfId ?? "").localeCompare(right.etfId ?? "");

    if (etfComparison !== 0) {
      return etfComparison;
    }

    if (left.source !== right.source) {
      return left.source.localeCompare(right.source);
    }

    return left.amount - right.amount;
  });
}

function normalizeTimelineMonth(month: AllocationTimelineMonth) {
  return {
    month: month.month,
    totalContribution: month.totalContribution,
    activeEtfId: month.activeEtfId,
    activeEtfName: month.activeEtfName,
    unallocatedAmount: month.unallocatedAmount,
    entries: sortAllocationEntries(month.entries).map((entry) => ({
      etfId: entry.etfId,
      etfName: entry.etfName,
      amount: entry.amount,
      percentage: entry.percentage,
      source: entry.source,
      resultingCumulativeContribution: entry.resultingCumulativeContribution,
      capReachedAfterAllocation: entry.capReachedAfterAllocation,
    })),
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRatio(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPathSnapshot(pathValues: Array<number | undefined>) {
  return pathValues
    .map((value, index) =>
      value === undefined
        ? `${index}: n/a`
        : `${index}: ${Math.round(value).toLocaleString("de-DE")}`,
    )
    .join(" | ");
}

async function getPrimaryPortfolioId(
  supabase: TypedSupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to load primary portfolio.");
  }

  if (!data?.id) {
    throw new Error(
      "No primary portfolio found for this user. The debug script is read-only and will not create one.",
    );
  }

  return data.id;
}

async function getProjectionAssumptionsDebug(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<ProjectionAssumption[]> {
  const portfolioId = await getPrimaryPortfolioId(supabase, userId);
  const { data, error } = await supabase
    .from("portfolio_holdings")
    .select(
      "quantity, unit_price_manual, updated_at, etf:etfs(id, isin, name, ter_bps, last_known_price, data_source, expected_return_annual, volatility_annual, updated_at)",
    )
    .eq("portfolio_id", portfolioId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load projection assumptions.");
  }

  return (data ?? [])
    .map((row): ProjectionAssumption | null => {
      const etf = getNestedSingle(row.etf);

      if (!etf) {
        return null;
      }

      const quantity = Number(row.quantity);
      const manualUnitPrice = parseNumericValue(row.unit_price_manual);
      const currentUnitPrice =
        manualUnitPrice ?? parseNumericValue(etf.last_known_price);
      const startingValue =
        currentUnitPrice === null ? 0 : quantity * currentUnitPrice;

      return {
        etfId: etf.id,
        isin: etf.isin,
        etfName: etf.name,
        currentUnitPrice,
        quantity,
        startingValue,
        expectedReturnAnnual:
          etf.expected_return_annual === null
            ? DEFAULT_EXPECTED_RETURN
            : Number(etf.expected_return_annual),
        terBps: etf.ter_bps ?? DEFAULT_TER_BPS,
        volatilityAnnual:
          etf.volatility_annual === null
            ? DEFAULT_VOLATILITY
            : Number(etf.volatility_annual),
        dataSource: etf.data_source,
        updatedAt: etf.updated_at,
      };
    })
    .filter((assumption): assumption is ProjectionAssumption => assumption !== null);
}

async function getContributionRulesDebug(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<ContributionRule[]> {
  const { data, error } = await supabase
    .from("contribution_rules")
    .select("*")
    .eq("user_id", userId)
    .order("start_month", { ascending: true });

  if (error) {
    throw new Error("Failed to load contribution rules.");
  }

  return (data ?? []).map((rule) => ({
    id: rule.id,
    userId: rule.user_id,
    startMonth: rule.start_month,
    monthlyAmount: Number(rule.monthly_amount),
    createdAt: rule.created_at,
    updatedAt: rule.updated_at,
  }));
}

async function getLumpSumsDebug(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<LumpSumContribution[]> {
  const { data, error } = await supabase
    .from("lump_sum_contributions")
    .select("*")
    .eq("user_id", userId)
    .order("contribution_month", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load lump sum contributions.");
  }

  return (data ?? []).map((contribution) => ({
    id: contribution.id,
    userId: contribution.user_id,
    contributionMonth: contribution.contribution_month,
    amount: Number(contribution.amount),
    note: contribution.note,
    createdAt: contribution.created_at,
    updatedAt: contribution.updated_at,
  }));
}

async function getGoalSettingsDebug(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<GoalSettings | null> {
  const { data, error } = await supabase
    .from("goal_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to load goal settings.");
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    targetWealth: Number(data.target_wealth),
    targetYear: data.target_year,
    requiredProbability: Number(data.required_probability),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

async function getPortfolioAllocationEtfsDebug(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<AllocationEtfOption[]> {
  const portfolioId = await getPrimaryPortfolioId(supabase, userId);
  const { data, error } = await supabase
    .from("portfolio_holdings")
    .select(
      "etf_id, sort_order, created_at, isin_snapshot, name_snapshot, quantity, cost_basis_per_share",
    )
    .eq("portfolio_id", portfolioId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error && !isMissingCostBasisColumnError(error)) {
    throw new Error("Failed to load portfolio ETFs for allocation.");
  }

  if (error) {
    const { data: legacyData, error: legacyError } = await supabase
      .from("portfolio_holdings")
      .select(
        "etf_id, sort_order, created_at, isin_snapshot, name_snapshot, quantity",
      )
      .eq("portfolio_id", portfolioId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (legacyError) {
      throw new Error(
        "Failed to load portfolio ETFs for allocation after legacy fallback.",
      );
    }

    return ((legacyData ?? []) as LegacyPortfolioAllocationHoldingRow[]).map(
      (holding) => ({
        etfId: holding.etf_id,
        etfName: holding.name_snapshot,
        isin: holding.isin_snapshot,
        portfolioCostBasis: null,
      }),
    );
  }

  return ((data ?? []) as PortfolioAllocationHoldingRow[]).map((holding) => ({
    etfId: holding.etf_id,
    etfName: holding.name_snapshot,
    isin: holding.isin_snapshot,
    portfolioCostBasis:
      holding.cost_basis_per_share === null
        ? null
        : Number(holding.quantity) * Number(holding.cost_basis_per_share),
  }));
}

async function getAllocationRulesDebug(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<AllocationRuleView[]> {
  const { data, error } = await supabase
    .from("allocation_rules")
    .select(
      "id, user_id, etf_id, is_active, sequence_order, contribution_cap, target_percentage, created_at, updated_at, etf:etfs(name, isin)",
    )
    .eq("user_id", userId)
    .order("sequence_order", { ascending: true });

  if (!error) {
    return ((data ?? []) as AllocationRuleRow[]).map((rule) => {
      const etf = getNestedSingle(rule.etf);

      return {
        id: rule.id,
        userId: rule.user_id,
        etfId: rule.etf_id,
        isActive: rule.is_active,
        sequenceOrder: rule.sequence_order,
        contributionCap:
          rule.contribution_cap === null ? null : Number(rule.contribution_cap),
        targetPercentage:
          rule.target_percentage === null ? null : Number(rule.target_percentage),
        createdAt: rule.created_at,
        updatedAt: rule.updated_at,
        etfName: etf?.name ?? "Unbekannter ETF",
        isin: etf?.isin ?? "—",
      };
    });
  }

  if (!isMissingPreparedAllocationColumnsError(error)) {
    throw new Error("Failed to load allocation rules.");
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("allocation_rules")
    .select(
      "id, user_id, etf_id, sequence_order, contribution_cap, created_at, updated_at, etf:etfs(name, isin)",
    )
    .eq("user_id", userId)
    .order("sequence_order", { ascending: true });

  if (legacyError) {
    throw new Error("Failed to load allocation rules.");
  }

  return ((legacyData ?? []) as LegacyAllocationRuleRow[]).map((rule) => {
    const etf = getNestedSingle(rule.etf);

    return {
      id: rule.id,
      userId: rule.user_id,
      etfId: rule.etf_id,
      isActive: true,
      sequenceOrder: rule.sequence_order,
      contributionCap:
        rule.contribution_cap === null ? null : Number(rule.contribution_cap),
      targetPercentage: null,
      createdAt: rule.created_at,
      updatedAt: rule.updated_at,
      etfName: etf?.name ?? "Unbekannter ETF",
      isin: etf?.isin ?? "—",
    };
  });
}

async function getManualAllocationOverridesDebug(
  supabase: TypedSupabaseClient,
  userId: string,
): Promise<ManualAllocationOverrideView[]> {
  const { data, error } = await supabase
    .from("manual_allocation_overrides")
    .select(
      "id, user_id, month, etf_id, percentage, created_at, updated_at, etf:etfs(name, isin)",
    )
    .eq("user_id", userId)
    .order("month", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to load manual allocation overrides.");
  }

  return (data ?? []).map((override) => {
    const etf = getNestedSingle(override.etf);

    return {
      id: override.id,
      userId: override.user_id,
      month: override.month,
      etfId: override.etf_id,
      percentage: Number(override.percentage),
      createdAt: override.created_at,
      updatedAt: override.updated_at,
      etfName: etf?.name ?? "Unbekannter ETF",
      isin: etf?.isin ?? "—",
    };
  });
}

async function main() {
  loadEnvFileIfPresent();

  const userId = process.argv[2] ?? process.env.DEBUG_USER_ID;

  if (!userId) {
    throw new Error(
      "Missing user id. Usage: npx tsx scripts/debug-simulation-diff.ts <USER_UUID>",
    );
  }

  const supabase = createClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const [
    assumptions,
    contributionRules,
    lumpSums,
    allocationRules,
    overrides,
    portfolioEtfs,
    goalSettings,
  ] = await Promise.all([
    getProjectionAssumptionsDebug(supabase, userId),
    getContributionRulesDebug(supabase, userId),
    getLumpSumsDebug(supabase, userId),
    getAllocationRulesDebug(supabase, userId),
    getManualAllocationOverridesDebug(supabase, userId),
    getPortfolioAllocationEtfsDebug(supabase, userId),
    getGoalSettingsDebug(supabase, userId),
  ]);

  if (!goalSettings) {
    throw new Error("No goal settings found for this user.");
  }

  const validEtfIds = new Set(portfolioEtfs.map((etf) => etf.etfId));
  const validAllocationRules = allocationRules.filter((rule) =>
    validEtfIds.has(rule.etfId),
  );
  const validOverrides = overrides.filter((override) =>
    validEtfIds.has(override.etfId),
  );
  const targetMonthIndex = getTargetMonthIndex(goalSettings.targetYear);
  const dashboardForecastMonthsAhead = DASHBOARD_FORECAST_YEARS * 12;
  const goalMonthsAhead = targetMonthIndex + 1;
  const simulationMonthsAhead_Dashboard = Math.max(
    dashboardForecastMonthsAhead,
    goalMonthsAhead,
  );
  const monthsAhead_Goals = goalMonthsAhead;

  const contributionTimeline_Dashboard = buildContributionTimelinePreview(
    contributionRules,
    lumpSums,
    simulationMonthsAhead_Dashboard,
  );
  const allocationTimeline_Dashboard = buildAllocationTimelinePreview(
    contributionTimeline_Dashboard,
    validAllocationRules,
    validOverrides,
    portfolioEtfs,
  );
  const contributionTimeline_Goals = buildContributionTimelinePreview(
    contributionRules,
    lumpSums,
    monthsAhead_Goals,
  );
  const allocationTimeline_Goals = buildAllocationTimelinePreview(
    contributionTimeline_Goals,
    validAllocationRules,
    validOverrides,
    portfolioEtfs,
  );

  const sim_Dashboard = runMonteCarloSimulation({
    assumptions,
    allocationTimeline: allocationTimeline_Dashboard,
    runs: DEFAULT_MONTE_CARLO_RUNS,
    seed: DEFAULT_MONTE_CARLO_SEED,
  });
  const sim_Goals = runMonteCarloSimulation({
    assumptions,
    allocationTimeline: allocationTimeline_Goals,
    runs: DEFAULT_MONTE_CARLO_RUNS,
    seed: DEFAULT_MONTE_CARLO_SEED,
  });

  const dashboardEvaluation = evaluateGoalAgainstSimulation({
    goalSettings,
    simulation: sim_Dashboard,
  });
  const goalsEvaluation = evaluateGoalAgainstSimulation({
    goalSettings,
    simulation: sim_Goals,
  });

  console.log("=== INPUT META ===");
  console.log(`userId:                          ${userId}`);
  console.log(`targetYear:                      ${goalSettings.targetYear}`);
  console.log(`targetMonthIndex:                ${targetMonthIndex}`);
  console.log(
    `simulationMonthsAhead_Dashboard: ${simulationMonthsAhead_Dashboard}`,
  );
  console.log(`monthsAhead_Goals:               ${monthsAhead_Goals}`);
  console.log(`assumptions.length:              ${assumptions.length}`);
  console.log(
    `allocationRules.length_raw:      ${allocationRules.length}`,
  );
  console.log(`validAllocationRules.length:     ${validAllocationRules.length}`);
  console.log(`overrides.length_raw:            ${overrides.length}`);
  console.log(`validOverrides.length:           ${validOverrides.length}`);
  console.log(`portfolioEtfs.length:            ${portfolioEtfs.length}`);
  console.log("");

  console.log(
    `=== TIMELINE DIFF (Monate 0 bis ${Math.max(monthsAhead_Goals - 1, 0)}) ===`,
  );

  const differingMonths: number[] = [];

  for (let index = 0; index < monthsAhead_Goals; index += 1) {
    const dashboardMonth = allocationTimeline_Dashboard[index];
    const goalsMonth = allocationTimeline_Goals[index];
    const isIdentical =
      JSON.stringify(normalizeTimelineMonth(dashboardMonth)) ===
      JSON.stringify(normalizeTimelineMonth(goalsMonth));

    if (isIdentical) {
      console.log(`Month ${index}: identisch`);
      continue;
    }

    differingMonths.push(index);
    console.log(`Month ${index}: ABWEICHEND`);
  }

  if (differingMonths.length === 0) {
    console.log(`Summary: alle ${monthsAhead_Goals} Monate identisch`);
  } else {
    const firstDifferingMonthIndex = differingMonths[0];
    console.log(
      `Summary: ${differingMonths.length} Monate abweichend, erster Unterschied bei Monat ${firstDifferingMonthIndex}`,
    );
    console.log("");
    console.log("Erster abweichender Monat - Dashboard:");
    console.dir(
      normalizeTimelineMonth(allocationTimeline_Dashboard[firstDifferingMonthIndex]),
      { depth: null },
    );
    console.log("");
    console.log("Erster abweichender Monat - Goals:");
    console.dir(
      normalizeTimelineMonth(allocationTimeline_Goals[firstDifferingMonthIndex]),
      { depth: null },
    );
  }

  console.log("");
  console.log("=== SIMULATION OUTPUT ===");
  console.log(
    `sim_Dashboard.rawPaths.length:    ${sim_Dashboard.rawPaths.length}`,
  );
  console.log(
    `sim_Goals.rawPaths.length:        ${sim_Goals.rawPaths.length}`,
  );
  console.log(
    `Erster Pfad, Monat 0 (Dashboard): ${Math.round(sim_Dashboard.rawPaths[0]?.[0] ?? 0).toLocaleString("de-DE")}`,
  );
  console.log(
    `Erster Pfad, Monat 0 (Goals):     ${Math.round(sim_Goals.rawPaths[0]?.[0] ?? 0).toLocaleString("de-DE")}`,
  );
  console.log(
    `Erster Pfad, Monat ${targetMonthIndex} (Dashboard): ${Math.round(sim_Dashboard.rawPaths[0]?.[targetMonthIndex] ?? 0).toLocaleString("de-DE")}`,
  );
  console.log(
    `Erster Pfad, Monat ${targetMonthIndex} (Goals):     ${Math.round(sim_Goals.rawPaths[0]?.[targetMonthIndex] ?? 0).toLocaleString("de-DE")}`,
  );

  const dashboardValuesAtTarget = sim_Dashboard.rawPaths.map(
    (currentPath) => currentPath[targetMonthIndex] ?? 0,
  );
  const goalsValuesAtTarget = sim_Goals.rawPaths.map(
    (currentPath) => currentPath[targetMonthIndex] ?? 0,
  );
  const p50_Dashboard = calculatePercentile(dashboardValuesAtTarget, 0.5);
  const p50_Goals = calculatePercentile(goalsValuesAtTarget, 0.5);
  const success_Dashboard = calculateSuccessProbability(
    sim_Dashboard,
    goalSettings.targetWealth,
    targetMonthIndex,
  );
  const success_Goals = calculateSuccessProbability(
    sim_Goals,
    goalSettings.targetWealth,
    targetMonthIndex,
  );

  console.log(
    `P50 bei Monat ${targetMonthIndex} (Dashboard): ${formatCurrency(p50_Dashboard)}`,
  );
  console.log(
    `P50 bei Monat ${targetMonthIndex} (Goals):     ${formatCurrency(p50_Goals)}`,
  );
  console.log("");
  console.log(`Erfolgswahrscheinlichkeit bei Monat ${targetMonthIndex}:`);
  console.log(`  Dashboard: ${formatRatio(success_Dashboard)}`);
  console.log(`  Goals:     ${formatRatio(success_Goals)}`);
  console.log("");
  console.log(
    `evaluateGoalAgainstSimulation Dashboard: ${formatRatio(dashboardEvaluation.successProbability)} (P50 ${formatCurrency(dashboardEvaluation.p50TargetValue)})`,
  );
  console.log(
    `evaluateGoalAgainstSimulation Goals:     ${formatRatio(goalsEvaluation.successProbability)} (P50 ${formatCurrency(goalsEvaluation.p50TargetValue)})`,
  );

  const differingPathIndexes: number[] = [];

  for (let index = 0; index < sim_Dashboard.rawPaths.length; index += 1) {
    if (
      sim_Dashboard.rawPaths[index]?.[targetMonthIndex] !==
      sim_Goals.rawPaths[index]?.[targetMonthIndex]
    ) {
      differingPathIndexes.push(index);
    }
  }

  console.log("");
  console.log(
    `Abweichung Pfade bei Monat ${targetMonthIndex}: ${differingPathIndexes.length} von ${sim_Dashboard.rawPaths.length}`,
  );

  if (differingPathIndexes.length > 0) {
    console.log("");
    console.log(
      `=== ERSTE ${Math.min(5, differingPathIndexes.length)} ABWEICHENDE PFADE BEI MONAT ${targetMonthIndex} ===`,
    );

    const snapshotMonths = [...TARGET_MONTH_SNAPSHOT_POINTS, targetMonthIndex]
      .filter((month, index, array) => month <= targetMonthIndex && array.indexOf(month) === index)
      .sort((left, right) => left - right);

    for (const pathIndex of differingPathIndexes.slice(0, 5)) {
      const dashboardPath = sim_Dashboard.rawPaths[pathIndex] ?? [];
      const goalsPath = sim_Goals.rawPaths[pathIndex] ?? [];

      console.log(`Path ${pathIndex}:`);
      console.log(
        `  Dashboard: ${formatPathSnapshot(snapshotMonths.map((month) => dashboardPath[month]))}`,
      );
      console.log(
        `  Goals:     ${formatPathSnapshot(snapshotMonths.map((month) => goalsPath[month]))}`,
      );
    }
  }
}

void main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exit(1);
});
