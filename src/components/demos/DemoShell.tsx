// Moldura das demonstrações: faixa institucional da Aruá por fora, identidade do
// cliente (tema escopado em src/styles.css) por dentro.
import { Link } from "@tanstack/react-router";
import { ArrowRight, Info, LogOut } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Logo } from "@/components/site/Shapes";
import { Reveal } from "@/components/site/Motion";
import { demoAreas, demoCopy } from "@/content/demos";
import type { ClientDemo, DemoArea } from "@/content/demos/types";
import { AreaView } from "./DemoAreas";
import { TourPanel } from "./DemoTour";

function Monogram({ name }: { name: string }) {
  // Sem logotipo autorizado: identificação tipográfica neutra.
  const initials = name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-base font-bold text-primary-foreground"
    >
      {initials}
    </span>
  );
}

export function DemoFrame({ demo, children }: { demo: ClientDemo; children: ReactNode }) {
  return (
    <div className="demo-frame min-h-screen">
      <header className="border-b border-border bg-background">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Pular para o conteúdo
        </a>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link to="/" aria-label="Aruá — início" className="tap">
            <Logo />
          </Link>
          <p className="order-3 w-full text-xs text-muted-foreground sm:order-none sm:w-auto">
            {demoCopy.product} · demonstração guiada
          </p>
          <Link
            to="/demonstracoes"
            className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary hover:bg-secondary"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            {demoCopy.exit}
          </Link>
        </div>
      </header>
      <div className={`${demo.themeClass} bg-background text-foreground`}>{children}</div>
    </div>
  );
}

export function DemoPanel({ demo, area }: { demo: ClientDemo; area: DemoArea }) {
  const current = demoAreas.find((a) => a.id === area);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // No celular o menu de áreas rola na horizontal: a área atual fica sempre à vista.
  useEffect(() => {
    navRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView?.({ block: "nearest", inline: "center" });
  }, [area]);

  // Ao trocar de área, o foco vai para o título: teclado e leitor de tela acompanham a troca.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [area]);

  return (
    <DemoFrame demo={demo}>
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
          <Monogram name={demo.business.name} />
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-foreground">
              {demo.business.name}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              {demoCopy.panelNotice}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-10">
        <nav
          ref={navRef}
          aria-label={demoCopy.areasNav}
          className="min-w-0 lg:sticky lg:top-6 lg:self-start"
        >
          <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {demoAreas.map((a, i) => (
              <li key={a.id} className="shrink-0">
                <Link
                  to="/demonstracoes/$client/$area"
                  params={{ client: demo.slug, area: a.id }}
                  aria-current={a.id === area ? "page" : undefined}
                  className="tap flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground lg:rounded-xl"
                >
                  <span aria-hidden="true" className="text-xs opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {a.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <main id="conteudo" className="min-w-0">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl"
          >
            {current?.label}
          </h1>
          <TourPanel demo={demo} area={area} />
          <Reveal key={area} onMount>
            <AreaView demo={demo} area={area} />
          </Reveal>
        </main>
      </div>
    </DemoFrame>
  );
}

export function DemoEntry({ demo }: { demo: ClientDemo }) {
  return (
    <DemoFrame demo={demo}>
      <main id="conteudo" className="mx-auto max-w-5xl px-4 py-12 md:py-20">
        <Reveal onMount>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {demoCopy.product}
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Monogram name={demo.business.name} />
            <div>
              <h1 className="text-3xl font-semibold text-foreground sm:text-5xl">
                {demo.business.name}
              </h1>
              <p className="mt-1 text-muted-foreground">
                {demo.business.segment} · {demo.business.location}
              </p>
            </div>
          </div>
          <p className="mt-8 max-w-2xl text-lg text-foreground">{demoCopy.entryPurpose}</p>

          <p
            role="note"
            className="mt-6 flex max-w-2xl items-start gap-2 rounded-xl border border-highlight/60 bg-highlight/20 p-4 text-sm text-foreground"
          >
            <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {demoCopy.entryNotice}
          </p>

          <Link
            to="/demonstracoes/$client/$area"
            params={{ client: demo.slug, area: "visao-geral" }}
            data-track={`demo-iniciar-${demo.slug}`}
            className="tap mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            {demoCopy.start}
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </Link>
        </Reveal>

        <section aria-labelledby="o-que-ver" className="mt-16">
          <h2 id="o-que-ver" className="text-lg font-semibold text-foreground">
            O que você vai ver
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {demoAreas.map((a, i) => (
              <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
                <span className="text-xs font-semibold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="font-semibold text-foreground">{a.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{demo.guide[a.id].represents}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </DemoFrame>
  );
}
