"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { ANALYSIS_HORIZON_STORAGE_KEY } from "@/features/analysis/lib/horizon";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/einzahlungen", label: "Einzahlungen" },
  { href: "/allokation", label: "Allokation" },
  { href: "/analyse", label: "Analyse" },
  { href: "/ziele", label: "Ziele" },
];

export function AppNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [storedYears, setStoredYears] = useState<string | null>(null);

  useEffect(() => {
    setStoredYears(window.localStorage.getItem(ANALYSIS_HORIZON_STORAGE_KEY));
  }, []);

  return (
    <nav className="inline-flex flex-wrap items-center gap-2 rounded-[12px] border border-border bg-[#070909]/96 p-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_12px_28px_rgba(0,0,0,0.26)]">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const yearsParam = searchParams.get("years") ?? storedYears;
        const href =
          yearsParam && item.href === "/analyse"
            ? `${item.href}?years=${yearsParam}`
            : item.href;

        return (
          <Link
            key={item.href}
            href={href}
            className={`app-nav-link ${isActive ? "app-nav-link-active" : ""}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
