"use client";

import Link from "next/link";
import { useState } from "react";

import type { PlausibilityNotice } from "@/lib/plausibility";

type NoticeListProps = {
  title?: string;
  items: PlausibilityNotice[];
};

export function NoticeList({ title, items }: NoticeListProps) {
  const dataQualityItems = items.filter(
    (item) => item.category === "data_quality",
  );
  const plausibilityItems = items.filter(
    (item) => item.category === "plausibility",
  );
  const [collapsedById, setCollapsedById] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(plausibilityItems.map((item) => [item.id, true])),
  );

  if (dataQualityItems.length === 0 && plausibilityItems.length === 0) {
    return null;
  }

  return (
    <div className="app-card">
      {title ? (
        <div className="mb-5 space-y-2">
          <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {title}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Kurze Hinweise, die dir helfen, deinen Plan besser einzuordnen.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {dataQualityItems.map((item) => (
          <div
            key={item.id}
            className="rounded-[22px] border border-orange-400/20 bg-orange-500/6 px-4 py-3"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                {item.body ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.body}
                  </p>
                ) : null}
              </div>
              {item.action ? (
                <Link
                  href={item.action.href}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-3 text-xs font-medium text-foreground transition hover:bg-secondary"
                >
                  {item.action.label}
                </Link>
              ) : null}
            </div>
          </div>
        ))}

        {plausibilityItems.map((item) => {
          const isCollapsed = collapsedById[item.id] ?? true;

          return (
            <div
              key={item.id}
              className="rounded-[22px] border border-border bg-background/60 px-4 py-3"
            >
              <button
                type="button"
                aria-expanded={!isCollapsed}
                onClick={() =>
                  setCollapsedById((current) => ({
                    ...current,
                    [item.id]: !isCollapsed,
                  }))
                }
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                <span className="text-sm font-semibold text-foreground">
                  {item.title}
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
                <div className="mt-3 space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.body}
                  </p>
                  {item.action ? (
                    <Link
                      href={item.action.href}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-medium text-foreground transition hover:bg-secondary"
                    >
                      {item.action.label}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
