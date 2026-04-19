import { LoadingHero } from "@/components/loading-hero";

export default function GoalsLoading() {
  return (
    <div className="space-y-8">
      <LoadingHero eyebrow="Ziele" title="Deine Ziele werden berechnet" />
    </div>
  );
}
