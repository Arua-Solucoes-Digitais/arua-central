// Visita guiada: orientação contextual em cada área, progresso e navegação.
// É só apresentação: não há login, nem registro do que o visitante faz.
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Compass, Home, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { areaIndex, demoAreas, demoCopy } from "@/content/demos";
import type { ClientDemo, DemoArea } from "@/content/demos/types";
import { TourContext, useTour } from "./tour-context";

export function TourProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

const linkBtn =
  "tap inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold";

export function TourPanel({ demo, area }: { demo: ClientDemo; area: DemoArea }) {
  const { open, setOpen } = useTour();
  const [finished, setFinished] = useState(false);
  const idx = areaIndex(area);
  const total = demoAreas.length;
  const prev = demoAreas[idx - 1];
  const next = demoAreas[idx + 1];
  const step = demo.guide[area];
  const g = demoCopy.guide;

  if (!open) {
    return (
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${linkBtn} border border-border bg-card text-foreground`}
        >
          <Compass aria-hidden="true" className="h-4 w-4 text-accent" />
          {g.reopen}
        </button>
      </div>
    );
  }

  const pct = Math.round(((idx + 1) / total) * 100);

  return (
    <aside
      aria-label={g.title}
      data-testid="tour-panel"
      className="mb-8 rounded-2xl border border-accent/30 bg-card p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
          <Compass aria-hidden="true" className="h-4 w-4" />
          {g.title} · <span data-testid="tour-progress">{g.progress(idx + 1, total)}</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <X aria-hidden="true" className="h-4 w-4" />
          {g.close}
        </button>
      </div>
      <div
        aria-hidden="true"
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>

      <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
        {(
          [
            ["represents", g.represents],
            ["problem", g.problem],
            ["howAruaUses", g.howAruaUses],
            ["whatIsReal", g.whatIsReal],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <dt className="font-semibold text-foreground">{label}</dt>
            <dd className="mt-0.5 text-muted-foreground">{step[key]}</dd>
          </div>
        ))}
      </dl>

      {finished && !next && (
        <p role="status" className="mt-4 font-semibold text-foreground">
          {g.finished}
        </p>
      )}

      <nav
        aria-label="Navegação da visita guiada"
        className="mt-5 flex flex-wrap items-center gap-2"
      >
        {prev ? (
          <Link
            to="/demonstracoes/$client/$area"
            params={{ client: demo.slug, area: prev.id }}
            className={`${linkBtn} border border-border bg-card text-foreground`}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {g.previous}
            <span className="sr-only">: {prev.label}</span>
          </Link>
        ) : null}
        {next ? (
          <Link
            to="/demonstracoes/$client/$area"
            params={{ client: demo.slug, area: next.id }}
            className={`${linkBtn} bg-primary text-primary-foreground`}
          >
            {g.next}: {next.short}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setFinished(true)}
            className={`${linkBtn} bg-primary text-primary-foreground`}
          >
            {g.finish}
          </button>
        )}
        {area !== "visao-geral" && (
          <Link
            to="/demonstracoes/$client/$area"
            params={{ client: demo.slug, area: "visao-geral" }}
            className={`${linkBtn} text-accent underline underline-offset-4`}
          >
            <Home aria-hidden="true" className="h-4 w-4" />
            {demoCopy.backToOverview}
          </Link>
        )}
      </nav>
    </aside>
  );
}
