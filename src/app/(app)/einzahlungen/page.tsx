import { ContributionRuleForm } from "@/components/contributions/contribution-rule-form";
import { ContributionRulesList } from "@/components/contributions/contribution-rules-list";
import { ContributionTimelinePreview } from "@/components/contributions/contribution-timeline-preview";
import { LumpSumForm } from "@/components/contributions/lump-sum-form";
import { LumpSumList } from "@/components/contributions/lump-sum-list";
import { buildContributionTimelinePreview } from "@/features/contributions/lib/timeline";
import { getContributionRules } from "@/features/contributions/queries/get-contribution-rules";
import { getLumpSumContributions } from "@/features/contributions/queries/get-lump-sum-contributions";
import { requireUser } from "@/lib/auth/guard";
import { buildContributionNotices } from "@/lib/plausibility";

export default async function ContributionsPage() {
  const user = await requireUser();
  const [rules, lumpSums] = await Promise.all([
    getContributionRules(user.id),
    getLumpSumContributions(user.id),
  ]);
  const timeline = buildContributionTimelinePreview(rules, lumpSums, 24);
  const notices = buildContributionNotices({
    rules,
    lumpSums,
  });

  return (
    <section className="space-y-8">
      <div className="app-card relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 top-0 h-44 w-44 rounded-full bg-fuchsia-500/18 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-10 h-36 w-36 rounded-full bg-orange-500/14 blur-3xl" />
        <div className="relative space-y-4">
          <span className="app-eyebrow">
            Einzahlungen
          </span>
          <div className="space-y-4">
            <h2 className="max-w-5xl text-5xl font-semibold tracking-[-0.055em] text-foreground md:text-6xl">
              Plane, was du regelmäßig investieren möchtest.
            </h2>
            <p className="max-w-3xl text-[15px] leading-8 text-slate-300">
              Lege fest, wie viel du monatlich investieren willst und welche
              zusätzlichen Einzahlungen du bereits planst. So siehst du früh,
              was in den nächsten Monaten wirklich für deine Geldanlage
              bereitsteht.
            </p>
          </div>
          <div className="app-accent-line max-w-2xl" />
        </div>
      </div>

      {notices.some((notice) => notice.id === "contributions-no-recurring") ? (
        <p className="text-sm leading-6 text-muted-foreground">
          Bisher fließen nur Sonderzahlungen ein. Für einen regelmäßigen Plan
          fehlt noch ein Monatsbeitrag.
        </p>
      ) : notices.some((notice) => notice.id === "contributions-empty") ? (
        <p className="text-sm leading-6 text-muted-foreground">
          Lege einen Monatsbeitrag oder eine erste Sonderzahlung an, damit deine
          Planung in die Zukunft weiterläuft.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
          <div className="mb-6 space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Laufende Monatsbeiträge
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Diese Regel gilt ab dem gewählten Monat und bleibt aktiv, bis du
              sie durch eine neue ersetzt.
            </p>
          </div>
          <ContributionRuleForm />
        </div>

        <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
          <div className="mb-6 space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Sonderzahlungen
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Für einzelne Monate kannst du zusätzliche Einzahlungen festhalten.
              Mehrere Sonderzahlungen im selben Monat werden zusammengezählt.
            </p>
          </div>
          <LumpSumForm />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
          <div className="mb-6 space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Hinterlegte Monatsbeiträge
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Hier siehst du, welcher Monatsbeitrag ab wann gilt.
            </p>
          </div>
          <ContributionRulesList rules={rules} />
        </div>

        <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
          <div className="mb-6 space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Geplante Sonderzahlungen
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              So behältst du einmalige Einzahlungen im Blick, die später zusätzlich
              investiert werden sollen.
            </p>
          </div>
          <LumpSumList contributions={lumpSums} />
        </div>
      </div>

      <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
        <div className="mb-6 space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            So sehen die nächsten 24 Monate aus
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Für jeden Monat zeigen wir Monatsbeitrag, Sonderzahlungen und Summe
            getrennt. Die Verteilung auf ETFs legst du erst im nächsten Schritt
            unter Allokation fest.
          </p>
        </div>
        <ContributionTimelinePreview timeline={timeline} />
      </div>
    </section>
  );
}
