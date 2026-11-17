// Tlim © Aruá Soluções Digitais · desenvolvido por CjotaDEV7.
// Moldura da demonstração: a marca Aruá por fora (topo, assinatura e marca d'água), a identidade
// do restaurante (tema escopado em src/styles.css) por dentro.
import { Link } from "@tanstack/react-router";
import { ArrowRight, Info, LayoutDashboard, ShoppingBag } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Logo } from "@/components/site/Shapes";
import { Reveal, RevealItem, RevealList } from "@/components/site/Motion";
import {
  demoAreas,
  demoCopy,
  formatNumber,
  minutesAgoLabel,
  orderStatusLabels,
  signature,
} from "@/content/demos";
import type { ClientDemo, DemoArea } from "@/content/demos/types";
import { withBase } from "@/lib/paths";
import { areaIcons } from "./area-icons";
import { CountUp } from "./CountUp";
import { AreaView } from "./DemoAreas";
import { TourPanel } from "./DemoTour";
import { DemoWatermark, WATERMARK_SPACE } from "./DemoWatermark";
import { useTlim } from "./tlim-store";

export function Monogram({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-base font-bold text-primary-foreground"
    >
      {initials}
    </span>
  );
}

/** Marca do produto: "Tlim" com a assinatura "por Aruá". */
export function TlimMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span
        className={`font-display text-2xl font-bold tracking-tight ${inverted ? "text-white" : "text-[#0B2D5B]"}`}
      >
        Tlim
      </span>
      <span className={`text-xs font-medium ${inverted ? "text-white/70" : "text-[#0B2D5B]/60"}`}>
        por Aruá
      </span>
    </span>
  );
}

export function SignatureFooter() {
  return (
    <footer className="border-t border-border bg-background px-4 py-6 text-center text-xs text-muted-foreground">
      {signature.line}
    </footer>
  );
}

export function DemoFrame({ demo, children }: { demo: ClientDemo; children: ReactNode }) {
  return (
    <div className="demo-frame min-h-screen">
      <header className="border-b border-[#0B2D5B]/10 bg-white">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Pular para o conteúdo
        </a>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <div className="flex items-center gap-4">
            <a href={withBase("/")} aria-label="Aruá — início" className="tap">
              <Logo />
            </a>
            <span aria-hidden="true" className="hidden h-6 w-px bg-[#0B2D5B]/15 sm:block" />
            <Link to="/demonstracoes/$client" params={{ client: demo.slug }} className="tap">
              <TlimMark />
            </Link>
          </div>
          <nav aria-label="Demonstração" className="flex items-center gap-1 text-sm font-medium">
            <Link
              to="/demonstracoes/$client/loja"
              params={{ client: demo.slug }}
              className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[#0B2D5B] hover:bg-[#0B2D5B]/5"
            >
              <ShoppingBag aria-hidden="true" className="h-4 w-4" />
              Cardápio
            </Link>
            <Link
              to="/demonstracoes/$client/$area"
              params={{ client: demo.slug, area: "visao-geral" }}
              className="tap inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[#0B2D5B] hover:bg-[#0B2D5B]/5"
            >
              <LayoutDashboard aria-hidden="true" className="h-4 w-4" />
              Gestor
            </Link>
          </nav>
        </div>
      </header>
      <div className={`${demo.themeClass} bg-background text-foreground ${WATERMARK_SPACE}`}>
        {children}
        <SignatureFooter />
      </div>
      <DemoWatermark />
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
          <Monogram initials={demo.business.initials} />
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

      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:py-10">
        <nav
          ref={navRef}
          aria-label={demoCopy.areasNav}
          className="min-w-0 lg:sticky lg:top-6 lg:self-start"
        >
          <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {demoAreas.map((a) => {
              const Icon = areaIcons[a.id];
              return (
                <li key={a.id} className="shrink-0">
                  <Link
                    to="/demonstracoes/$client/$area"
                    params={{ client: demo.slug, area: a.id }}
                    aria-current={a.id === area ? "page" : undefined}
                    className="tap flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 aria-[current=page]:border-primary aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground lg:rounded-xl"
                  >
                    <Icon aria-hidden="true" className="h-4 w-4 opacity-70" />
                    {a.label}
                  </Link>
                </li>
              );
            })}
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

/** Últimos pedidos, ao vivo: o que o visitante pede no cardápio aparece aqui. */
function LiveOrders() {
  const { state } = useTlim();
  const latest = state.orders.slice(0, 3);
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-x-2 -inset-y-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-[#0B2D5B]/10 blur-2xl"
      />
      <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-black/5">
        <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Pedidos agora
          <span className="inline-flex items-center gap-1.5 text-accent">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
            ao vivo
          </span>
        </p>
        <RevealList onMount as="ol" className="mt-4 space-y-3">
          {latest.map((o) => (
            <RevealItem
              key={o.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  #{o.id} · {o.customerName}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs">
                <p className="font-semibold text-primary">{orderStatusLabels[o.status]}</p>
                <p className="text-muted-foreground">{minutesAgoLabel(o.minutesAgo)}</p>
              </div>
            </RevealItem>
          ))}
        </RevealList>
        <p className="mt-4 text-xs text-muted-foreground">Pedidos de exemplo (simulação).</p>
      </div>
    </div>
  );
}

const ctaPrimary =
  "tap group inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 motion-reduce:transition-none";
const ctaSecondary =
  "tap inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-semibold text-foreground transition-colors hover:border-primary/40";

/** Apresentação do Tlim para o cliente: problema, solução e o exemplo com números reais. */
export function DemoEntry({ demo }: { demo: ClientDemo }) {
  const p = demo.presentation;
  return (
    <DemoFrame demo={demo}>
      <main id="conteudo">
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 overflow-x-clip px-4 py-14 md:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Reveal onMount>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {demoCopy.productTagline}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              {p.headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{p.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/demonstracoes/$client/loja"
                params={{ client: demo.slug }}
                data-track="tlim-loja"
                className={ctaPrimary}
              >
                <ShoppingBag aria-hidden="true" className="h-5 w-5" />
                {demoCopy.storeCta}
              </Link>
              <Link
                to="/demonstracoes/$client/$area"
                params={{ client: demo.slug, area: "visao-geral" }}
                data-track="tlim-gestor"
                className={ctaSecondary}
              >
                {demoCopy.start}
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
            <p
              role="note"
              className="mt-6 flex max-w-xl items-start gap-2 text-sm text-muted-foreground"
            >
              <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              {demoCopy.entryNotice}
            </p>
          </Reveal>
          <Reveal onMount delay={0.15}>
            <LiveOrders />
          </Reveal>
        </section>

        <section aria-labelledby="problema" className="bg-card py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Reveal>
              <h2 id="problema" className="text-3xl font-semibold text-foreground">
                O que trava as vendas hoje
              </h2>
            </Reveal>
            <RevealList className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              {p.problems.map((x, i) => (
                <RevealItem key={x.title} className="rounded-2xl border border-border p-6">
                  <span className="font-display text-sm font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{x.title}</h3>
                  <p className="mt-2 text-muted-foreground">{x.text}</p>
                </RevealItem>
              ))}
            </RevealList>
          </div>
        </section>

        <section aria-labelledby="solucao" className="py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Reveal>
              <h2 id="solucao" className="text-3xl font-semibold text-foreground">
                O que o Tlim faz
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Clique em um módulo para usar a demonstração.
              </p>
            </Reveal>
            <RevealList className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.modules.map((m) => {
                const Icon = areaIcons[m.area];
                return (
                  <RevealItem key={m.area}>
                    <Link
                      to="/demonstracoes/$client/$area"
                      params={{ client: demo.slug, area: m.area }}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-lg font-semibold text-foreground">{m.title}</h3>
                      <p className="mt-2 flex-1 text-muted-foreground">{m.text}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        Ver na demonstração
                        <ArrowRight
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                        />
                      </span>
                    </Link>
                  </RevealItem>
                );
              })}
            </RevealList>
          </div>
        </section>

        <section aria-labelledby="exemplo" className="bg-[#0B2D5B] py-16 text-white md:py-20">
          <div className="mx-auto max-w-7xl px-4">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                Exemplo
              </p>
              <h2 id="exemplo" className="mt-2 text-3xl font-semibold">
                {demo.business.name}
              </h2>
              <p className="mt-2 max-w-3xl text-white/75">{demo.business.basis}</p>
            </Reveal>
            <RevealList className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {demo.indicators.map((i) => (
                <RevealItem key={i.id} className="border-l border-white/20 pl-4">
                  <p className="font-display text-4xl font-bold sm:text-5xl">
                    <CountUp value={i.value} decimals={i.decimals ?? 0} />
                  </p>
                  <p className="mt-1 font-semibold">{i.label}</p>
                  <p className="text-sm text-white/60">{i.channel}</p>
                </RevealItem>
              ))}
            </RevealList>
            <p className="mt-8 text-sm text-white/60">{demo.indicatorsNote}</p>
            <Link
              to="/demonstracoes/$client/$area"
              params={{ client: demo.slug, area: "ponto-de-partida" }}
              className="tap mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-white underline underline-offset-4"
            >
              Ver o diagnóstico completo
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="py-16 text-center md:py-20">
          <Reveal className="mx-auto max-w-2xl px-4">
            <h2 className="text-3xl font-semibold text-foreground">Experimente agora</h2>
            <p className="mt-3 text-muted-foreground">
              Faça um pedido como cliente e acompanhe ele chegar na central do gestor.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/demonstracoes/$client/loja"
                params={{ client: demo.slug }}
                className={ctaPrimary}
              >
                <ShoppingBag aria-hidden="true" className="h-5 w-5" />
                {demoCopy.storeCta}
              </Link>
              <Link
                to="/demonstracoes/$client/$area"
                params={{ client: demo.slug, area: "pedidos" }}
                className={ctaSecondary}
              >
                Ver a central de pedidos
              </Link>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              {formatNumber(demo.menu.items.length)} itens no cardápio de exemplo ·{" "}
              {formatNumber(demo.customers.length)} clientes simulados
            </p>
          </Reveal>
        </section>
      </main>
    </DemoFrame>
  );
}
