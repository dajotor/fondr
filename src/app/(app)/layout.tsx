import type { ReactNode } from "react";

import { AppNav } from "@/components/app-nav";
import { DesktopUserMenu } from "@/components/desktop-user-menu";
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
          <header className="relative flex flex-col gap-5 border-b app-divider px-5 py-4 md:px-8 md:py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
              <p
                className="text-[1.7rem] font-semibold uppercase tracking-[0.38em] text-white md:text-[2rem]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                FONDR
              </p>
              <div className="hidden lg:block">
                <AppNav />
              </div>
            </div>

            <div className="hidden lg:block">
              <DesktopUserMenu email={user.email ?? ""} />
            </div>
          </header>

          <main className="flex-1 px-5 pb-28 pt-8 md:px-8 lg:py-10">{children}</main>
          <div className="px-5 pb-6 md:px-8 md:pb-8">
            <PublicFooter />
          </div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
