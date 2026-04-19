"use client";

import { useEffect, useRef, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";

type DesktopUserMenuProps = {
  email: string;
};

export function DesktopUserMenu({ email }: DesktopUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  const initial = email.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Benutzermenü"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-[#070909] text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:border-cyan-300/30 hover:bg-[#0c1012]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {initial}
      </button>

      <div
        role="menu"
        aria-hidden={!isOpen}
        className={`absolute right-0 top-12 z-50 w-64 origin-top-right rounded-[12px] border border-border bg-[#070909]/98 p-3 shadow-[0_12px_28px_rgba(0,0,0,0.4)] transition-all duration-150 ${
          isOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <p className="truncate rounded-[8px] border border-cyan-300/12 bg-[#080b0c] px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-slate-300">
          {email}
        </p>
        <div className="mt-3 border-t border-border/60 pt-3">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
