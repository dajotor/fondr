type CurrencyFormatOptions = {
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
};

export function formatCurrency(
  value: number | null | undefined,
  options?: CurrencyFormatOptions,
) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value);
}

export function formatCurrencyWhole(value: number | null | undefined) {
  return formatCurrency(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
