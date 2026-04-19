"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Menu,
  Target,
  Wallet,
} from "lucide-react";

import { MobileMoreSheet } from "@/components/mobile-more-sheet";

const PRIMARY_NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/portfolio",
    label: "Portfolio",
    icon: Wallet,
  },
  {
    href: "/analyse",
    label: "Analyse",
    icon: LineChart,
  },
  {
    href: "/ziele",
    label: "Ziele",
    icon: Target,
  },
] as const;

const MORE_PATHS = ["/einzahlungen", "/allokation"] as const;

function getTabClasses(isActive: boolean) {
  return `relative flex flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium tracking-[0.01em] transition ${
    isActive ? "text-white" : "text-muted-foreground"
  }`;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[#070909]/96 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.02),0_-12px_28px_rgba(0,0,0,0.26)] backdrop-blur-sm lg:hidden">
        <nav className="grid grid-cols-5">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={getTabClasses(isActive)}
              >
                {isActive ? (
                  <span
                    className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-full bg-cyan-300/60"
                    aria-hidden="true"
                  />
                ) : null}
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {(() => {
            const isActive = MORE_PATHS.some(
              (path) => pathname === path || pathname.startsWith(`${path}/`),
            );

            return (
              <button
                type="button"
                className={getTabClasses(isActive)}
                onClick={() => setIsSheetOpen(true)}
                aria-expanded={isSheetOpen}
                aria-controls="mobile-more-sheet"
              >
                {isActive ? (
                  <span
                    className="absolute left-1/2 top-0 h-1 w-8 -translate-x-1/2 rounded-full bg-cyan-300/60"
                    aria-hidden="true"
                  />
                ) : null}
                <Menu size={20} />
                <span>Mehr</span>
              </button>
            );
          })()}
        </nav>
      </div>

      <div id="mobile-more-sheet">
        <MobileMoreSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
        />
      </div>
    </>
  );
}
