import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="pt-6">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border/80 pt-4 text-xs text-muted-foreground">
        <Link
          href="/impressum"
          className="transition hover:text-foreground"
        >
          Impressum
        </Link>
        <Link
          href="/datenschutz"
          className="transition hover:text-foreground"
        >
          Datenschutz
        </Link>
      </div>
    </footer>
  );
}
