type LoadingHeroProps = {
  eyebrow: string;
  title: string;
};

export function LoadingHero({ eyebrow, title }: LoadingHeroProps) {
  return (
    <div className="app-card relative overflow-hidden">
      <div className="pointer-events-none absolute -right-24 -top-20 h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-20 h-40 w-40 rounded-full bg-cyan-300/5 blur-3xl" />
      <div className="relative space-y-8">
        <span className="app-eyebrow">{eyebrow}</span>
        <div className="space-y-4">
          <h2 className="max-w-5xl text-[2rem] leading-[1.1] font-semibold tracking-[-0.055em] text-foreground md:text-5xl lg:text-6xl">
            {title}
          </h2>
          <div className="relative h-[3px] w-full max-w-xs overflow-hidden rounded-full bg-border/60">
            <div className="absolute inset-y-0 w-1/3 animate-loading-bar rounded-full bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
