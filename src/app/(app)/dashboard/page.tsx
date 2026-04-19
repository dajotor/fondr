import { DashboardMiniTrend } from "@/components/dashboard/dashboard-mini-trend";
import { DashboardNextActions } from "@/components/dashboard/dashboard-next-actions";
import { DashboardStatusPanel } from "@/components/dashboard/dashboard-status-panel";
import { DashboardSummaryCards } from "@/components/dashboard/dashboard-summary-cards";
import { normalizeAnalysisYears } from "@/features/analysis/lib/horizon";
import { getDashboardOverview } from "@/features/dashboard/queries/get-dashboard-overview";
import { requireUser } from "@/lib/auth/guard";

type DashboardPageProps = {
  searchParams: Promise<{
    years?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const years = normalizeAnalysisYears(params.years);
  const user = await requireUser();
  const overview = await getDashboardOverview(user.id, years);

  return (
    <section className="space-y-8">
      <div className="app-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-fuchsia-500/18 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-10 h-36 w-36 rounded-full bg-orange-500/14 blur-3xl" />
        <div className="relative space-y-4">
          <span className="app-eyebrow">
            Dashboard
          </span>
          <div className="space-y-4">
            <h2 className="max-w-5xl text-5xl font-semibold tracking-[-0.055em] text-foreground md:text-6xl">
              So steht deine Planung gerade da.
            </h2>
            <p className="max-w-3xl text-[15px] leading-8 text-slate-300">
              Hier bekommst du in wenigen Minuten ein Gefühl dafür, wie dein
              Portfolio dasteht, was als Nächstes wichtig ist und ob du deinem
              Ziel näherkommst.
            </p>
          </div>
          <div className="app-accent-line max-w-2xl" />
        </div>
      </div>

      <DashboardSummaryCards overview={overview} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <DashboardStatusPanel overview={overview} />
        <DashboardMiniTrend projection={overview.projection} />
      </div>

      <DashboardNextActions steps={overview.setupSteps} />
    </section>
  );
}
