"use client";

import { useEffect, useRef, useState } from "react";

import type { DashboardMilestone } from "@/domain/dashboard/types";
import { formatMonthLabel } from "@/features/contributions/lib/months";
import { formatCurrencyWhole } from "@/lib/formatting/currency";

type DashboardMilestonesProps = {
  milestones: DashboardMilestone[];
  currentWealth: number;
  targetWealth: number | null;
};

const TIMELINE_HEIGHT = 8;
const MARKER_RADIUS = 6;
const ANIMATION_DURATION_MS = 1000;

function formatMonthsFromNow(months: number) {
  if (months === 0) return "jetzt";
  if (months === 1) return "in 1 Monat";
  if (months < 12) return `in ${months} Monaten`;
  const years = Math.floor(months / 12);
  const remainderMonths = months % 12;
  if (remainderMonths === 0) {
    return years === 1 ? "in 1 Jahr" : `in ${years} Jahren`;
  }
  const yearPart = years === 1 ? "1 Jahr" : `${years} Jahren`;
  const monthPart = remainderMonths === 1 ? "1 Monat" : `${remainderMonths} Monaten`;
  return `in ${yearPart} und ${monthPart}`;
}

function wealthToPosition(
  wealth: number,
  currentWealth: number,
  targetWealth: number,
) {
  if (targetWealth <= currentWealth) return 0;
  const position = (wealth - currentWealth) / (targetWealth - currentWealth);
  return Math.max(0, Math.min(1, position));
}

export function DashboardMilestones({
  milestones,
  currentWealth,
  targetWealth,
}: DashboardMilestonesProps) {
  const [progressRatio, setProgressRatio] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    if (!targetWealth || targetWealth <= currentWealth) {
      setProgressRatio(1);
      return;
    }

    const finalRatio = currentWealth / targetWealth;
    const startTime = performance.now();

    let frameId: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgressRatio(finalRatio * eased);

      if (t < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [currentWealth, targetWealth]);

  if (milestones.length === 0 || !targetWealth || targetWealth <= 0) {
    return (
      <div className="app-card">
        <div className="mb-6 space-y-2">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Meilensteine
          </h3>
          <p className="text-sm leading-6 text-slate-300">
            Wegmarken auf dem Weg zu deinem Ziel.
          </p>
        </div>
        <div className="app-card-muted">
          <p className="text-sm font-medium text-foreground">
            Noch keine Meilensteine verfügbar
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-300">
            Sobald Portfolio, Einzahlungen, Allokation, Annahmen und ein Ziel
            zusammenkommen, erscheinen hier deine persönlichen Wegmarken.
          </p>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round((currentWealth / targetWealth) * 100);

  return (
    <div className="app-card">
      <div className="mb-6 space-y-2">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          Meilensteine
        </h3>
        <p className="text-sm leading-6 text-slate-300">
          Wegmarken auf dem Weg zu deinem Ziel. Zeitpunkte zeigen, wann mindestens 50 % aller Simulationen den Betrag erreichen.
        </p>
      </div>

      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
          Aktueller Fortschritt
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-foreground">
          {progressPercent} %
        </p>
      </div>

      <div className="mb-6">
        <svg
          viewBox="0 0 400 40"
          className="h-10 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Fortschritt: ${progressPercent} Prozent des Zielvermögens erreicht`}
        >
          <defs>
            <linearGradient id="milestoneProgressGradient" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.6)" />
              <stop offset="100%" stopColor="rgba(103, 232, 249, 1)" />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y={20 - TIMELINE_HEIGHT / 2}
            width="400"
            height={TIMELINE_HEIGHT}
            rx={TIMELINE_HEIGHT / 2}
            fill="rgba(148, 163, 184, 0.12)"
          />
          <rect
            x="0"
            y={20 - TIMELINE_HEIGHT / 2}
            width={400 * progressRatio}
            height={TIMELINE_HEIGHT}
            rx={TIMELINE_HEIGHT / 2}
            fill="url(#milestoneProgressGradient)"
          />
          <circle
            cx="0"
            cy="20"
            r={MARKER_RADIUS}
            fill="rgb(34, 211, 238)"
            stroke="rgb(15, 20, 22)"
            strokeWidth="2"
          />
          {milestones.map((milestone) => {
            const position = wealthToPosition(
              milestone.targetWealth,
              currentWealth,
              targetWealth,
            );
            const cx = position * 400;
            const isReached = milestone.status === "reached";
            return (
              <circle
                key={`${milestone.label}-${milestone.targetWealth}`}
                cx={cx}
                cy="20"
                r={MARKER_RADIUS}
                fill={isReached ? "rgb(34, 211, 238)" : "rgb(241, 245, 249)"}
                stroke="rgb(15, 20, 22)"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>

      <ul className="space-y-2.5">
        {milestones.map((milestone) => {
          const isReached = milestone.status === "reached";
          const isOutOfHorizon = milestone.status === "out-of-horizon";
          return (
            <li
              key={`${milestone.label}-list-${milestone.targetWealth}`}
              className="flex items-baseline justify-between gap-4 border-t border-border/40 pt-2.5 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  {milestone.label}
                </span>
                <span className="text-base font-semibold tracking-[-0.02em] text-foreground">
                  {formatCurrencyWhole(milestone.targetWealth)}
                </span>
              </div>
              <div className="text-right">
                {isReached ? (
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-cyan-300">
                    Erreicht
                  </span>
                ) : isOutOfHorizon ? (
                  <span className="text-xs leading-5 text-slate-400">
                    Nicht in 10 Jahren
                  </span>
                ) : milestone.monthsFromNow !== null && milestone.targetMonth ? (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs leading-5 text-slate-300">
                      {formatMonthsFromNow(milestone.monthsFromNow)}
                    </span>
                    <span className="text-[11px] leading-4 text-slate-400">
                      {formatMonthLabel(milestone.targetMonth)}
                    </span>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
