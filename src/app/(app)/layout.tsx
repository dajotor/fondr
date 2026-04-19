import type { ReactNode } from "react";

import { AppNav } from "@/components/app-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PublicFooter } from "@/components/public/public-footer";
import { getOrCreatePrimaryPortfolio } from "@/features/portfolio/queries/get-or-create-primary-portfolio";
import { requireUser } from "@/lib/auth/guard";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await requireUser();
  await getOrCreatePrimaryPortfolio(user.id);

  return (
    <div className="app-shell pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="app-surface">
        <div className="app-panel flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden">
          <header className="relative flex flex-col gap-5 border-b app-divider px-5 py-4 md:px-8 md:py-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
            <div className="space-y-4 xl:max-w-[70%]">
              <div>
                <p
                  className="text-[1.7rem] font-semibold uppercase tracking-[0.38em] text-white md:text-[2rem]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  FONDR
                </p>
              </div>
              <div className="hidden md:block">
                <AppNav />
              </div>
            </div>

            <div className="hidden items-center gap-3 self-start md:flex xl:self-auto">
              <p className="hidden rounded-[8px] border border-cyan-300/12 bg-[#080b0c] px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-slate-300 md:block">
                {user.email}
              </p>
              <LogoutButton />
            </div>
          </header>

          <main className="flex-1 px-5 pb-28 pt-8 md:px-8 md:py-10">{children}</main>
          <div className="px-5 pb-6 md:px-8 md:pb-8">
            <PublicFooter />
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
