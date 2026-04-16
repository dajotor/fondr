import Link from "next/link";

export function EmptyPortfolioState() {
  return (
    <div className="app-card border-dashed">
      <div className="max-w-xl space-y-4">
        <span className="app-eyebrow">
          Portfolio
        </span>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
            Noch keine Positionen im Portfolio
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Starte mit deiner ersten ETF-Position. Danach kannst du Wert,
            Entwicklung und spätere Analysen auf einer soliden Grundlage sehen.
          </p>
        </div>
        <Link
          href="/portfolio/new"
          className="app-button-primary"
        >
          Erste Position anlegen
        </Link>
      </div>
    </div>
  );
}
