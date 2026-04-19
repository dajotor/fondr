import { HoldingForm } from "@/components/portfolio/holding-form";

export default function NewPortfolioHoldingPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <span className="inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Neue Position
        </span>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            ETF zum Portfolio hinzufuegen
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Erfasse ISIN und Name. Stückzahl und Einstandskurs kannst du auch
            später ergänzen, wenn du den ETF erst künftig besparen möchtest.
          </p>
        </div>
      </div>

      <div className="max-w-3xl rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
        <HoldingForm />
      </div>
    </section>
  );
}
