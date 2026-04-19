import { LoadingHero } from "@/components/loading-hero";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <LoadingHero eyebrow="Dashboard" title="Deine Planung wird geladen" />
    </div>
  );
}
