export const MONTH_INPUT_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const MONTH_INPUT_FALLBACK_LABEL =
  "Wähle Monat und Jahr. Falls dein Browser keine Monatsauswahl zeigt, nutze das Format JJJJ-MM, z. B. 2026-04.";

export function normalizeMonthInput(monthInput: string): string {
  const trimmed = monthInput.trim();

  if (MONTH_INPUT_REGEX.test(trimmed)) {
    return `${trimmed}-01`;
  }

  return trimmed;
}

export function toMonthKey(month: string): string {
  return month.slice(0, 7);
}

export function addMonths(month: string, amount: number): string {
  const [yearPart, monthPart] = toMonthKey(month).split("-");
  const date = new Date(
    Date.UTC(Number(yearPart), Number(monthPart) - 1 + amount, 1),
  );

  return date.toISOString().slice(0, 10);
}

export function getCurrentMonthStart(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = `${now.getUTCMonth() + 1}`.padStart(2, "0");

  return `${year}-${month}-01`;
}

export function formatMonthLabel(month: string): string {
  const [yearPart, monthPart] = toMonthKey(month).split("-");
  const monthNames = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

  return `${monthNames[Number(monthPart) - 1]} ${yearPart}`;
}
