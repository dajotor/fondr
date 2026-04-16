export function formatQuantity(value: number) {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatPercentage(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)} %`;
}

export function formatPercentFromRate(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return formatPercentage(value * 100);
}

export function formatProbabilityFromRate(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${Math.round(value * 100)} %`;
}

export function formatPercentFromBps(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${(value / 100).toFixed(2)} %`;
}
