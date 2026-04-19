"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CalendarPlus, PieChart } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";

type MobileMoreSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SheetLinkProps = {
  href: string;
  icon: React.ReactNode;
  onNavigate: () => void;
  children: React.ReactNode;
};

function SheetLink({ href, icon, onNavigate, children }: SheetLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-[10px] px-3 py-3 text-sm font-medium text-foreground hover:bg-[#0f1416]"
      onClick={onNavigate}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}

export function MobileMoreSheet({
  isOpen,
  onClose,
}: MobileMoreSheetProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 rounded-t-[20px] border-t border-border bg-[#070909]/98 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2 shadow-[0_-12px_28px_rgba(0,0,0,0.4)]">
        <div
          className="mx-auto mb-4 h-1 w-10 rounded-full bg-border"
          aria-hidden="true"
        />
        <nav className="flex flex-col gap-1 px-3 pb-2">
          <SheetLink
            href="/einzahlungen"
            icon={<CalendarPlus size={18} />}
            onNavigate={onClose}
          >
            Einzahlungen
          </SheetLink>
          <SheetLink
            href="/allokation"
            icon={<PieChart size={18} />}
            onNavigate={onClose}
          >
            Allokation
          </SheetLink>
        </nav>
        <div className="border-t border-border/60 px-3 pt-3">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
