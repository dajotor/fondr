"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ANALYSIS_HORIZON_OPTIONS,
  ANALYSIS_HORIZON_STORAGE_KEY,
} from "@/features/analysis/lib/horizon";

type AnalysisHorizonNavProps = {
  years: number;
};

export function AnalysisHorizonNav({ years }: AnalysisHorizonNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const yearsParam = searchParams.get("years");

    if (yearsParam) {
      window.localStorage.setItem(ANALYSIS_HORIZON_STORAGE_KEY, yearsParam);
      return;
    }

    const storedValue = window.localStorage.getItem(
      ANALYSIS_HORIZON_STORAGE_KEY,
    );

    if (
      storedValue &&
      storedValue !== String(years) &&
      ANALYSIS_HORIZON_OPTIONS.includes(
        Number(storedValue) as (typeof ANALYSIS_HORIZON_OPTIONS)[number],
      )
    ) {
      router.replace(`${pathname}?years=${storedValue}`);
    }
  }, [pathname, router, searchParams, years]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {ANALYSIS_HORIZON_OPTIONS.map((option) => {
        const isActive = option === years;

        return (
          <Link
            key={option}
            href={`${pathname}?years=${option}`}
            onClick={() => {
              window.localStorage.setItem(
                ANALYSIS_HORIZON_STORAGE_KEY,
                String(option),
              );
            }}
            className={`inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium transition ${
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-secondary"
            }`}
          >
            {option} Jahre
          </Link>
        );
      })}
    </div>
  );
}
