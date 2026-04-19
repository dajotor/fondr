"use client";

import Link from "next/link";
import { useState } from "react";

import type { DashboardSetupStep } from "@/domain/dashboard/types";

type DashboardNextActionsProps = {
  steps: DashboardSetupStep[];
};

function getStatusLabel(status: DashboardSetupStep["status"]) {
  if (status === "done") {
    return "Erledigt";
  }

  if (status === "attention") {
    return "Achtung";
  }

  return "Offen";
}

function getStatusClasses(step: DashboardSetupStep) {
  if (step.status === "open") {
    return {
      dot: "bg-slate-500",
      row: "border-border bg-background/70",
      text: "Offen",
    };
  }

  if (step.hasDataQualityNotice) {
    return {
      dot: "bg-orange-300",
      row: "border-orange-400/20 bg-orange-500/6",
      text: "Prüfen",
    };
  }

  return {
    dot: "bg-emerald-300",
    row: "border-border bg-background/70",
    text: "Erledigt",
  };
}

function buildRecommendation(steps: DashboardSetupStep[]) {
  const pendingSteps = steps.filter((step) => step.status !== "done");

  if (pendingSteps.length !== 1) {
    return null;
  }

  const [step] = pendingSteps;
  const firstNotice = step.notices.find((notice) => notice.category === "data_quality");

  return {
    title: step.status === "open" ? `${step.title} einrichten` : `${step.title} prüfen`,
    body: firstNotice?.body ?? step.summary,
    href: step.href,
    label: step.linkLabel,
  };
}

export function DashboardNextActions({ steps }: DashboardNextActionsProps) {
  const [collapsedById, setCollapsedById] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        steps.flatMap((step) =>
          step.notices
            .filter((notice) => notice.category === "plausibility")
            .map((notice) => [notice.id, true] as const),
        ),
      ),
  );
  const recommendation = buildRecommendation(steps);

  return (
    <div className="space-y-6">
      <div className="app-card">
        <div className="mb-6 space-y-2">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            Dein Setup
          </h3>
          <p className="text-sm leading-6 text-slate-300">
            Vier Schritte für einen vollständigen Plan.
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const statusClasses = getStatusClasses(step);

            return (
              <div
                key={step.key}
                className={`rounded-[22px] border px-4 py-4 ${statusClasses.row}`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${statusClasses.dot}`}
                        aria-hidden="true"
                      />
                      <span className="sr-only">
                        {getStatusLabel(step.status)}
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        {step.title}
                      </p>
                    </div>
                    <p className="pl-5 text-sm leading-6 text-muted-foreground">
                      {step.summary}
                    </p>
                  </div>

                  <Link
                    href={step.href}
                    className="inline-flex min-h-9 items-center gap-1 self-start py-1 text-sm font-medium text-foreground transition hover:underline"
                  >
                    {step.linkLabel}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                {step.notices.length > 0 ? (
                  <div className="mt-4 space-y-2 pl-5">
                    {step.notices
                      .filter((notice) => notice.category === "data_quality")
                      .map((notice) => (
                        <div
                          key={notice.id}
                          className="rounded-2xl bg-orange-500/8 px-3 py-2"
                        >
                          <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-1">
                              <p className="text-sm leading-6 text-muted-foreground">
                                {notice.body}
                              </p>
                            </div>
                            {notice.action ? (
                              <Link
                                href={notice.action.href}
                                className="inline-flex min-h-9 items-center gap-1 py-1 text-sm font-medium text-orange-200 transition hover:text-orange-100 hover:underline"
                              >
                                {notice.action.label}
                                <span aria-hidden="true">→</span>
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      ))}

                    {step.notices
                      .filter((notice) => notice.category === "plausibility")
                      .map((notice) => {
                        const isCollapsed = collapsedById[notice.id] ?? true;

                        return (
                          <div key={notice.id} className="px-3 py-1">
                            <button
                              type="button"
                              aria-expanded={!isCollapsed}
                              onClick={() =>
                                setCollapsedById((current) => ({
                                  ...current,
                                  [notice.id]: !isCollapsed,
                                }))
                              }
                              className="flex w-full items-start justify-between gap-4 text-left"
                            >
                              <span className="text-sm font-medium text-foreground">
                                {notice.title}
                              </span>
                              <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-muted-foreground">
                                Details
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 20 20"
                                  className={`h-4 w-4 transition-transform ${
                                    isCollapsed ? "" : "rotate-180"
                                  }`}
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M5 8L10 13L15 8"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </button>
                            {!isCollapsed ? (
                              <div className="mt-2 space-y-2">
                                <p className="text-sm leading-6 text-muted-foreground">
                                  {notice.body}
                                </p>
                                {notice.action ? (
                                  <Link
                                    href={notice.action.href}
                                    className="inline-flex min-h-9 items-center gap-1 py-1 text-sm font-medium text-foreground transition hover:underline"
                                  >
                                    {notice.action.label}
                                    <span aria-hidden="true">→</span>
                                  </Link>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {recommendation ? (
        <div className="app-card">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Nächster Schritt
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              {recommendation.body}
            </p>
          </div>
          <div className="mt-4">
            <Link
              href={recommendation.href}
              className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
            >
              {recommendation.label}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
