"use client";

import { useState } from "react";

import type { PlausibilityNotice } from "@/lib/plausibility";

type NoticeTone = "info" | "warning";

type NoticeListProps = {
  title?: string;
  items: PlausibilityNotice[];
};

const toneClasses: Record<NoticeTone, string> = {
  info: "border-fuchsia-400/15 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/8 to-transparent",
  warning: "border-orange-400/25 bg-gradient-to-r from-orange-500/16 via-pink-500/10 to-transparent",
};

export function NoticeList({ title, items }: NoticeListProps) {
  const [collapsedById, setCollapsedById] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(items.map((item) => [item.id, true])),
  );

  if (items.length === 0) {
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
            Kurze Hinweise, die dir helfen, Ergebnisse und Annahmen besser zu verstehen.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => {
          const tone = item.tone ?? "info";
          const isCollapsed = collapsedById[item.id] ?? true;

          return (
            <div
              key={item.id}
              className={`rounded-[22px] border p-4 ${toneClasses[tone]}`}
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
                <span className="text-sm font-semibold text-white">
                  {item.title}
                </span>
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs uppercase tracking-[0.14em] text-slate-300">
                  {isCollapsed ? "Öffnen" : "Schließen"}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className={`h-4 w-4 transition-transform ${
                      isCollapsed ? "rotate-180" : ""
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
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {item.body}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
