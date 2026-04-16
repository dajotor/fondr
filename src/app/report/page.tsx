import { redirect } from "next/navigation";

import { normalizeAnalysisYears } from "@/features/analysis/lib/horizon";

type ReportPageProps = {
  searchParams: Promise<{
    years?: string;
  }>;
};

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const params = await searchParams;
  const years = normalizeAnalysisYears(params.years);
  redirect(years ? `/dashboard?years=${years}` : "/dashboard");
}
