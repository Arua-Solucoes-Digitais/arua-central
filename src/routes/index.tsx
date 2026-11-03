import { createFileRoute } from "@tanstack/react-router";
import { hero, services, baseProjects, process, contact, values } from "@/content/site";
import { fetchPublishedBaseProjects } from "@/lib/api";
import { LogoSymbol, SoftWaves, Swoosh } from "@/components/site/Shapes";
import { ShieldCheck, Rocket, Handshake, Gem, ExternalLink } from "lucide-react";

const icons = { shield: ShieldCheck, rocket: Rocket, handshake: Handshake, gem: Gem } as const;
import { SiteHeader, SiteFooter } from "@/components/site/SiteHeader";
import { ContactForm } from "@/components/site/ContactForm";

export const Route = createFileRoute("/")({
  loader: () => fetchPublishedBaseProjects(),
  head: () => ({
    meta: [
      { title: "Aruá — Inovação com harmonia, soluções com propósito" },
      { name: "description", content: "Aruá é uma empresa brasileira de tecnologia. Conheça nossos serviços, produtos e como trabalhamos." },
      { property: "og:title", content: "Aruá — Tecnologia com propósito" },
      { property: "og:description", content: "Empresa brasileira de tecnologia. Inovação com harmonia, soluções com propósito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function SectionTitle({ id, title, intro }: { id: string; title: string; intro: string }) {
  return (
    <div className="mb-10 max-w-2xl">
      <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded-full bg-brand-gradient" />
      <h2 id={id} className="text-3xl font-bold text-primary sm:text-4xl">{title}</h2>
      <p className="mt-3 text-lg text-muted-foreground">{intro}</p>
    </div>
  );
}

function Index() {
  const projects = Route.useLoaderData();
  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        {/* APRESENTAÇÃO */}
        <section aria-labelledby="hero-title" className="relative overflow-hidden">
          <SoftWaves />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
            <div>
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">{hero.eyebrow}</p>
              <h1 id="hero-title" className="text-4xl font-semibold leading-tight text-primary sm:text-5xl">{hero.title}</h1>
              <p className="mt-5 text-lg font-light text-muted-foreground">{hero.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#contato" data-track="hero-contato" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-90">{hero.primaryCta}</a>
                <a href="#servicos" data-track="hero-servicos" className="rounded-full border border-border bg-background px-6 py-3 font-semibold text-primary transition-colors hover:bg-secondary">{hero.secondaryCta}</a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-8">
              <LogoSymbol className="w-56 max-w-full sm:w-72" />
              <p className="text-center text-2xl font-light italic leading-snug text-primary">
                Inovação com harmonia, soluções com <strong className="font-semibold text-accent">propósito.</strong>
                <Swoosh className="mx-auto mt-2 w-48" />
              </p>
            </div>
          </div>
        </section>

        {/* VALORES */}
        <section id="sobre" aria-labelledby="valores-title" className="bg-primary py-16 text-primary-foreground">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 id="valores-title" className="text-3xl font-normal leading-tight sm:text-4xl">
                {values.title}<br /><span className="font-semibold text-accent">{values.titleHighlight}</span>
              </h2>
              <span aria-hidden="true" className="my-5 block h-0.5 w-20 bg-accent" />
              <p className="font-light opacity-85">{values.text}</p>
            </div>
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:divide-x sm:divide-primary-foreground/15">
              {values.items.map((v) => {
                const Icon = icons[v.icon as keyof typeof icons];
                return (
                  <li key={v.title} className="flex flex-col items-center gap-3 px-2 text-center">
                    <Icon aria-hidden="true" className="h-10 w-10" strokeWidth={1.4} />
                    <p className="text-sm">{v.title}<br /><span className="opacity-80">{v.subtitle}</span></p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* SERVIÇOS */}
        <section id="servicos" aria-labelledby="servicos-title" className="bg-secondary py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle id="servicos-title" title={services.title} intro={services.intro} />
            <ul className="grid gap-6 md:grid-cols-3">
              {services.items.map((s, i) => (
                <li key={i} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <span aria-hidden="true" className="mb-4 block h-10 w-10 rounded-lg bg-brand-gradient" />
                  <h3 className="text-lg font-semibold text-primary">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PROJETOS */}
        <section id="projetos" aria-labelledby="projetos-title" className="py-20">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle id="projetos-title" title={baseProjects.title} intro={baseProjects.intro} />
            {projects.length === 0 ? (
              <p className="text-muted-foreground">{baseProjects.empty}</p>
            ) : (
              <ul className="grid gap-6 md:grid-cols-2">
                {projects.map((p) => (
                  <li key={p.id} className="flex gap-5 rounded-2xl border border-border p-6">
                    <span aria-hidden="true" className="h-12 w-12 shrink-0 rounded-full border-4 border-highlight" />
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{p.title}</h3>
                      <p className="mt-2 text-muted-foreground">{p.description}</p>
                      <a href={p.demo_url} target="_blank" rel="noopener noreferrer" data-track={`demo-${p.title}`} className="mt-4 inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4">
                        {baseProjects.demoCta}
                        <ExternalLink aria-hidden="true" className="h-4 w-4" />
                        <span className="sr-only">: {p.title} (abre em nova aba)</span>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* COMO TRABALHAMOS */}
        <section id="como-trabalhamos" aria-labelledby="processo-title" className="bg-primary py-20 text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4">
            <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded-full bg-brand-gradient" />
            <h2 id="processo-title" className="text-3xl font-bold sm:text-4xl">{process.title}</h2>
            <p className="mt-3 max-w-2xl text-lg opacity-80">{process.intro}</p>
            <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {process.steps.map((s, i) => (
                <li key={i} className="rounded-2xl border border-primary-foreground/15 p-6">
                  <span className="font-display text-3xl font-bold text-highlight">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 opacity-80">{s.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CONTATO */}
        <section id="contato" aria-labelledby="contato-title" className="py-20">
          <div className="mx-auto max-w-3xl px-4">
            <SectionTitle id="contato-title" title={contact.title} intro={contact.intro} />
            <ContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
