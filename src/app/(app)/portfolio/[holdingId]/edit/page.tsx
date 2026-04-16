import { notFound } from "next/navigation";

import { DeleteHoldingDialog } from "@/components/portfolio/delete-holding-dialog";
import { HoldingForm } from "@/components/portfolio/holding-form";
import { initialHoldingFormState } from "@/features/portfolio/actions/holding-form-state";
import { updateHolding } from "@/features/portfolio/actions/update-holding";
import { getHoldingById } from "@/features/portfolio/queries/get-holding-by-id";
import { requireUser } from "@/lib/auth/guard";

type EditHoldingPageProps = {
  params: Promise<{
    holdingId: string;
  }>;
};

export default async function EditHoldingPage({ params }: EditHoldingPageProps) {
  const user = await requireUser();
  const { holdingId } = await params;
  const holding = await getHoldingById(user.id, holdingId);

  if (!holding) {
    notFound();
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <span className="inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Position bearbeiten
        </span>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            {holding.nameSnapshot}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Passe Name, ISIN, Stückzahl, Einstandskurs, manuellen Kurs oder
            deine Notiz an.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6 md:p-8">
          <HoldingForm
            submitAction={updateHolding}
            initialState={initialHoldingFormState}
            defaultValues={{
              isin: holding.isinSnapshot,
              name: holding.nameSnapshot,
              quantity: holding.quantity.toString(),
              costBasisPerShare:
                holding.costBasisPerShare === null
                  ? ""
                  : holding.costBasisPerShare.toString(),
              unitPriceManual:
                holding.unitPriceManual === null
                  ? ""
                  : holding.unitPriceManual.toString(),
              notes: holding.notes ?? "",
            }}
            submitLabel="Änderungen speichern"
            isEdit
            holdingId={holding.id}
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6">
            <p className="text-sm font-medium text-foreground">Hinweis</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Wenn du die ISIN änderst und dieser ETF schon im Portfolio
              vorhanden ist, blockieren wir das Speichern bewusst. So entstehen
              keine doppelten Positionen.
            </p>
          </div>

          <div className="rounded-[calc(var(--radius)+2px)] border border-border bg-background/80 p-6">
            <p className="text-sm font-medium text-foreground">Löschen</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Dadurch verschwindet nur diese Position aus deinem Portfolio. Die
              ETF-Referenzdaten bleiben erhalten.
            </p>
            <div className="mt-4">
              <DeleteHoldingDialog
                holdingId={holding.id}
                holdingName={holding.nameSnapshot}
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
