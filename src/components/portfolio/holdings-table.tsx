import Link from "next/link";

import type { PortfolioHoldingView } from "@/domain/portfolio/types";
import { formatCurrency } from "@/lib/formatting/currency";
import { formatQuantity, formatPercentage } from "@/lib/formatting/number";

type HoldingsTableProps = {
  holdings: PortfolioHoldingView[];
};

function hasMissingStartingValue(holding: PortfolioHoldingView) {
  return holding.quantity <= 0 || holding.costBasisPerShare === null;
}

function getHoldingSourceLabel(dataSource: PortfolioHoldingView["dataSource"]) {
  if (dataSource === "provider") {
    return "Referenzdaten vom Anbieter";
  }

  if (dataSource === "mock") {
    return "Referenzdaten aus dem Testkatalog";
  }

  return "Manuell erfasst";
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:hidden">
        {holdings.map((holding) => (
          <div
            key={holding.id}
            className="app-card"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {holding.name}
              </p>
              <p className="text-xs text-muted-foreground">{holding.isin}</p>
              {hasMissingStartingValue(holding) ? (
                <p className="text-xs text-orange-200">
                  Startwert fehlt
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Stückzahl
                </p>
                <p className="mt-1 text-foreground">
                  {formatQuantity(holding.quantity)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Marktpreis
                </p>
                <p className="mt-1 text-foreground">
                  {formatCurrency(holding.unitPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Einstand
                </p>
                <p className="mt-1 text-foreground">
                  {formatCurrency(holding.costBasisPerShare)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Positionswert
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {formatCurrency(holding.positionValue)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Wertentwicklung vor Steuern
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {formatCurrency(holding.gainLossAbsolute)}
                  {holding.gainLossPercentage !== null
                    ? ` · ${formatPercentage(holding.gainLossPercentage)}`
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`/portfolio/${holding.id}/edit`}
                className="app-button-secondary h-10 w-full rounded-full px-4"
              >
                Bearbeiten
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="app-table-shell hidden lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-left">
            <thead className="bg-secondary/80">
            <tr className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <th className="px-5 py-4 font-medium">ETF</th>
              <th className="px-5 py-4 font-medium">ISIN</th>
              <th className="px-5 py-4 font-medium">Stückzahl</th>
              <th className="px-5 py-4 font-medium">Marktpreis</th>
              <th className="px-5 py-4 font-medium">Einstand</th>
              <th className="px-5 py-4 font-medium">Positionswert</th>
              <th className="px-5 py-4 font-medium">Wertentwicklung vor Steuern</th>
              <th className="px-5 py-4 font-medium">Aktionen</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-border">
              {holdings.map((holding) => (
                <tr key={holding.id} className="align-top transition hover:bg-secondary/40">
                  <td className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {holding.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getHoldingSourceLabel(holding.dataSource)}
                      </p>
                      {hasMissingStartingValue(holding) ? (
                        <p className="text-xs text-orange-200">
                          Startwert fehlt
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {holding.isin}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {formatQuantity(holding.quantity)}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {formatCurrency(holding.unitPrice)}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    {formatCurrency(holding.costBasisPerShare)}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-foreground">
                    {formatCurrency(holding.positionValue)}
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground">
                    <div className="space-y-1">
                      <p className="font-medium">{formatCurrency(holding.gainLossAbsolute)}</p>
                      {holding.gainLossPercentage !== null ? (
                        <p className="text-xs text-muted-foreground">
                          {formatPercentage(holding.gainLossPercentage)}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <Link
                      href={`/portfolio/${holding.id}/edit`}
                      className="app-button-secondary h-9 rounded-full px-4 text-sm"
                    >
                      Bearbeiten
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
