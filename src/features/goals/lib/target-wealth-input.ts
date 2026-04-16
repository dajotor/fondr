function hasOnlyAllowedCharacters(value: string) {
  return /^[0-9.,\s€]+$/.test(value);
}

function normalizeDotOnlyInput(value: string) {
  const dotCount = value.split(".").length - 1;

  if (dotCount === 0) {
    return value;
  }

  if (dotCount > 1) {
    const parts = value.split(".");

    if (parts.some((part) => part.length !== 3 && part !== parts[0])) {
      return null;
    }

    return parts.join("");
  }

  const [integerPart, fractionPart] = value.split(".");

  if (!integerPart || !fractionPart) {
    return null;
  }

  if (fractionPart.length === 3) {
    return `${integerPart}${fractionPart}`;
  }

  if (fractionPart.length <= 2) {
    return `${integerPart}.${fractionPart}`;
  }

  return null;
}

export function parseTargetWealthInput(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  const sanitizedValue = trimmedValue.replace(/\s/g, "").replace(/€/g, "");

  if (!hasOnlyAllowedCharacters(sanitizedValue)) {
    return null;
  }

  if (sanitizedValue.includes(",") && sanitizedValue.includes(".")) {
    const normalizedValue = sanitizedValue.replace(/\./g, "").replace(",", ".");
    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  if (sanitizedValue.includes(",")) {
    const commaCount = sanitizedValue.split(",").length - 1;

    if (commaCount > 1) {
      return null;
    }

    const [integerPart, fractionPart] = sanitizedValue.split(",");

    if (!integerPart || !fractionPart || fractionPart.length > 2) {
      return null;
    }

    const parsedValue = Number(`${integerPart}.${fractionPart}`);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  const normalizedDotValue = normalizeDotOnlyInput(sanitizedValue);

  if (normalizedDotValue === null) {
    return null;
  }

  const parsedValue = Number(normalizedDotValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function formatTargetWealthInput(value: number) {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}
