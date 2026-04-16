export const ANALYSIS_HORIZON_STORAGE_KEY = "wealth-manager:analysis-years";
export const ANALYSIS_HORIZON_OPTIONS = [2, 3, 5, 10, 20, 30, 40] as const;
export const DEFAULT_ANALYSIS_HORIZON_YEARS = 10;

export function normalizeAnalysisYears(value: string | undefined) {
  const parsedValue = Number(value);

  if (
    !Number.isFinite(parsedValue) ||
    !ANALYSIS_HORIZON_OPTIONS.includes(
      parsedValue as (typeof ANALYSIS_HORIZON_OPTIONS)[number],
    )
  ) {
    return DEFAULT_ANALYSIS_HORIZON_YEARS;
  }

  return parsedValue;
}
