export type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export function formatSupabaseError(
  context: string,
  error: SupabaseLikeError,
) {
  const parts = [
    context,
    error.code ? `code=${error.code}` : null,
    error.message ?? null,
    error.details ?? null,
    error.hint ?? null,
  ].filter(Boolean);

  return parts.join(" | ");
}

export function isMissingCostBasisColumnError(error: SupabaseLikeError) {
  const combinedMessage = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    combinedMessage.includes("cost_basis_per_share")
  );
}

export function getCostBasisMigrationMessage() {
  return "Der Einstandskurs konnte noch nicht gespeichert werden, weil die lokale Datenbank das neue Feld noch nicht kennt. Bitte führe die Migration für den Einstandskurs aus und versuche es erneut.";
}
