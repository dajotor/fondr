import type { GoalEvaluation, GoalSettings } from "@/domain/goals/types";
import { formatProbabilityFromRate } from "@/lib/formatting/number";

export type GoalStatusKind =
  | "on-track"
  | "near"
  | "needs-revision"
  | "setup-incomplete";

export type GoalStatus = {
  kind: GoalStatusKind;
  label: string;
  description: string;
};

const NEAR_MIN_PROBABILITY = 0.3;
const NEAR_BAND_PERCENTAGE_POINTS = 0.1;

function formatPercentPointsSimple(rate: number) {
  const points = Math.round(rate * 100);
  return `${points} Prozentpunkte`;
}

export function resolveGoalStatus(params: {
  goalSettings: GoalSettings | null;
  goalEvaluation: GoalEvaluation | null;
}): GoalStatus {
  const { goalSettings, goalEvaluation } = params;

  if (goalSettings === null || goalEvaluation === null) {
    return {
      kind: "setup-incomplete",
      label: "Setup unvollständig",
      description:
        goalSettings === null
          ? "Lege ein Ziel fest, damit FONDR deinen Plan einordnen kann."
          : "Sobald Portfolio, Annahmen und Allokation vollständig sind, ordnet FONDR deinen Plan ein.",
    };
  }

  const {
    successProbability,
    requiredProbability,
    isTargetOutsideSimulationHorizon,
  } = goalEvaluation;

  if (isTargetOutsideSimulationHorizon) {
    return {
      kind: "setup-incomplete",
      label: "Zieljahr zu weit",
      description:
        "Dein Zieljahr liegt außerhalb des aktuellen Analysezeitraums. Bitte prüfe Zieljahr und Horizont.",
    };
  }

  const nearThreshold = Math.max(
    NEAR_MIN_PROBABILITY,
    requiredProbability - NEAR_BAND_PERCENTAGE_POINTS,
  );

  if (successProbability >= requiredProbability) {
    return {
      kind: "on-track",
      label: "Im Plan",
      description: `Deine Erfolgswahrscheinlichkeit liegt bei ${formatProbabilityFromRate(
        successProbability,
      )}. Das entspricht deiner Wunsch-Sicherheit von ${formatProbabilityFromRate(
        requiredProbability,
      )} oder liegt darüber.`,
    };
  }

  const gapRate = requiredProbability - successProbability;

  if (successProbability >= nearThreshold) {
    return {
      kind: "near",
      label: "Nah dran",
      description: `Deine Erfolgswahrscheinlichkeit liegt bei ${formatProbabilityFromRate(
        successProbability,
      )}. Du bist ${formatPercentPointsSimple(
        gapRate,
      )} unter deiner Wunsch-Sicherheit von ${formatProbabilityFromRate(
        requiredProbability,
      )}.`,
    };
  }

  return {
    kind: "needs-revision",
    label: "Plan überarbeiten",
    description: `Deine Erfolgswahrscheinlichkeit liegt bei ${formatProbabilityFromRate(
      successProbability,
    )}. Das ist deutlich unter deiner Wunsch-Sicherheit von ${formatProbabilityFromRate(
      requiredProbability,
    )}. Eine höhere Monatsrate oder ein späteres Zieljahr könnten helfen.`,
  };
}
