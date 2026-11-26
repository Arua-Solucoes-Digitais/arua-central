import { useEffect } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Gem, Handshake, Rocket, ShieldCheck } from "lucide-react";
import {
  baseProjects,
  contact,
  hero,
  pains,
  plans,
  process,
  services,
  testimonials,
  values,
} from "@/content/site";
import { fetchShowcase } from "@/lib/api";
import { LogoSymbol, SoftWaves, Swoosh } from "@/components/site/Shapes";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal, RevealItem, RevealList } from "@/components/site/Motion";
import { SwipeItem, SwipeRow } from "@/components/site/SwipeRow";
import {
  ContactDetails,
  hasContactDetails,
  Icon,
  PlanCards,
  ProjectCard,
  Section,
  TestimonialList,
} from "@/components/site/Sections";

const valueIcons = { shield: ShieldCheck, rocket: Rocket, handshake: Handshake, gem: Gem } as const;

export const Route = createFileRoute("/")({
  loader: () => fetchShowcase(),
  // A lista sai sempre do banco: uma publicação no painel aparece já na próxima visita.
  headers: () => ({ "Cache-Control": "no-cache" }),
  head: () => ({
    meta: [
      { title: "Aruá Soluções Digitais — sites, sistemas e social media" },
      {
        name: "description",
        content:
          "Sites, aplicações sob medida, social media e produção audiovisual com hospedagem, manutenção e suporte. Conheça os planos e veja projetos ao vivo.",
      },
      { property: "og:title", content: "Aruá Soluções Digitais" },
      { property: "og:description", content: "Inovação com harmonia, soluções com propósito." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { projects, deployments, testimonials: quotes } = Route.useLoaderData();
  const products = projects.filter((p) => p.kind === "product");
  const router = useRouter();
  // Quem voltar a uma aba que já estava aberta vê a lista atualizada, sem recarregar.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") void router.invalidate();
    };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [router]);

  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        {/* PROPOSTA DE VALOR */}
        <section aria-labelledby="hero-title" className="relative overflow-hidden">
          <SoftWaves />
          <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-12 pt-10 md:grid-cols-[1.2fr_1fr] md:gap-10 md:py-24">
            <RevealList as="div" onMount>
              <RevealItem
                as="div"
                className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground md:mb-5"
              >
                {hero.eyebrow}
              </RevealItem>
              <RevealItem as="div">
                <h1
                  id="hero-title"
                  className="text-[2.1rem] font-semibold leading-tight text-primary sm:text-5xl"
                >
                  {hero.title}
                </h1>
              </RevealItem>
              <RevealItem as="div">
                <p className="mt-4 text-lg font-light text-muted-foreground md:mt-5">
                  {hero.subtitle}
                </p>
              </RevealItem>
              <RevealItem as="div" className="mt-7 flex flex-col gap-3 sm:flex-row md:mt-8">
                <a
                  href="#contato"
                  data-track="hero-orcamento"
                  className="tap flex min-h-12 items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
                >
                  {hero.primaryCta}
                </a>
                <Link
                  to="/portfolio"
                  data-track="hero-portfolio"
                  className="tap flex min-h-12 items-center justify-center rounded-full border border-border bg-background px-6 py-3 font-semibold text-primary transition-colors hover:bg-secondary"
                >
                  {hero.secondaryCta}
                </Link>
              </RevealItem>
            </RevealList>
            <Reveal onMount delay={0.35} className="flex flex-col items-center gap-5 md:gap-8">
              <LogoSymbol className="w-32 max-w-full sm:w-56 md:w-72" />
              <p className="text-center text-xl font-light italic leading-snug text-primary md:text-2xl">
                Inovação com harmonia, soluções com{" "}
                <strong className="font-semibold text-accent">propósito.</strong>
                <Swoosh className="mx-auto mt-2 w-40 md:w-48" />
              </p>
            </Reveal>
          </div>
        </section>

        {/* PROBLEMAS */}
        <Section id="problemas" title={pains.title} tone="muted">
          <RevealList as="ul" className="grid gap-3 sm:grid-cols-2">
            {pains.items.map((item) => (
              <RevealItem
                key={item}
                className="rounded-2xl border border-border bg-card p-5 text-lg text-primary shadow-soft"
              >
                {item}
              </RevealItem>
            ))}
          </RevealList>
        </Section>

        {/* VALORES */}
        <section
          id="sobre"
          aria-labelledby="valores-title"
          className="bg-primary py-14 text-primary-foreground md:py-16"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-[1fr_1.4fr]">
            <Reveal>
              <h2 id="valores-title" className="text-3xl font-normal leading-tight sm:text-4xl">
                {values.title}
                <br />
                <span className="font-semibold text-accent">{values.titleHighlight}</span>
              </h2>
              <span aria-hidden="true" className="my-5 block h-0.5 w-20 bg-accent" />
              <p className="font-light opacity-85">{values.text}</p>
            </Reveal>
            <RevealList className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:divide-x sm:divide-primary-foreground/15">
              {values.items.map((v) => {
                const ValueIcon = valueIcons[v.icon as keyof typeof valueIcons];
                return (
                  <RevealItem
                    key={v.title}
                    className="flex flex-col items-center gap-3 px-2 text-center"
                  >
                    <ValueIcon aria-hidden="true" className="h-10 w-10" strokeWidth={1.4} />
                    <p className="text-sm">
                      {v.title}
                      <br />
                      <span className="opacity-80">{v.subtitle}</span>
                    </p>
                  </RevealItem>
                );
              })}
            </RevealList>
          </div>
        </section>

        {/* DESTAQUES DOS SERVIÇOS */}
        <Section id="servicos" title={services.title} intro={services.intro} tone="muted">
          <SwipeRow label={services.title} desktop="md:grid-cols-2 lg:grid-cols-4">
            {services.groups.map((s) => (
              <SwipeItem
                key={s.id}
                className="flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground">
                  <Icon name={s.icon} className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              </SwipeItem>
            ))}
          </SwipeRow>
          <Link
            to="/servicos"
            data-track="home-servicos"
            className="mt-8 inline-block font-semibold text-primary underline underline-offset-4"
          >
            {services.more}
          </Link>
        </Section>

        {/* PRODUTOS ARUÁ (do banco) */}
        <Section id="projetos" title={baseProjects.title} intro={baseProjects.intro}>
          {products.length === 0 ? (
            <p className="text-muted-foreground">{baseProjects.empty}</p>
          ) : (
            <SwipeRow label={baseProjects.title}>
              {products.map((p) => (
                <SwipeItem key={p.id}>
                  <ProjectCard project={p} deployments={deployments} />
                </SwipeItem>
              ))}
            </SwipeRow>
          )}
          <Link
            to="/portfolio"
            data-track="home-portfolio"
            className="mt-8 inline-block font-semibold text-primary underline underline-offset-4"
          >
            {baseProjects.allCta}
          </Link>
        </Section>

        {/* PLANOS (RESUMO) */}
        <Section id="planos" title={plans.title} intro={plans.intro} tone="muted">
          <PlanCards compact />
          <p className="mt-6 text-sm text-muted-foreground">{plans.note}</p>
          <Link
            to="/planos"
            data-track="home-planos"
            className="mt-4 inline-block font-semibold text-primary underline underline-offset-4"
          >
            {plans.more}
          </Link>
        </Section>

        {/* DEPOIMENTOS: só aparecem quando houver depoimentos reais autorizados */}
        {quotes.length > 0 && (
          <Section id="depoimentos" title={testimonials.title} intro={testimonials.intro}>
            <TestimonialList items={quotes} />
          </Section>
        )}

        {/* PROCESSO DE IMPLANTAÇÃO */}
        <section
          id="como-trabalhamos"
          aria-labelledby="processo-title"
          className="bg-primary py-14 text-primary-foreground md:py-20"
        >
          <div className="mx-auto max-w-6xl px-4">
            <Reveal>
              <span
                aria-hidden="true"
                className="mb-4 block h-1 w-12 rounded-full bg-brand-gradient"
              />
              <h2 id="processo-title" className="text-3xl font-bold sm:text-4xl">
                {process.title}
              </h2>
              <p className="mt-3 max-w-2xl text-lg opacity-80">{process.intro}</p>
            </Reveal>
            <div className="mt-8 md:mt-10">
              <SwipeRow
                label={process.title}
                as="ol"
                tone="dark"
                desktop="md:grid-cols-2 lg:grid-cols-5"
              >
                {process.steps.map((s, i) => (
                  <SwipeItem
                    key={s.title}
                    className="flex-col rounded-2xl border border-primary-foreground/15 p-6"
                  >
                    <span className="font-display text-3xl font-bold text-highlight">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm opacity-80">{s.description}</p>
                  </SwipeItem>
                ))}
              </SwipeRow>
            </div>
            <p className="mt-8 font-medium text-highlight">{process.deadline}</p>
          </div>
        </section>

        {/* CONTATO */}
        <section
          id="contato"
          aria-labelledby="contato-title"
          className="scroll-mt-20 py-14 md:py-20"
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.5fr_1fr]">
            <Reveal>
              <span
                aria-hidden="true"
                className="mb-4 block h-1 w-12 rounded-full bg-brand-gradient"
              />
              <h2 id="contato-title" className="text-3xl font-bold text-primary sm:text-4xl">
                {contact.title}
              </h2>
              <p className="mb-8 mt-3 text-lg text-muted-foreground">{contact.intro}</p>
              <ContactForm />
            </Reveal>
            <ContactAside />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ContactAside() {
  if (!hasContactDetails()) return null;
  return (
    <aside aria-labelledby="contato-info" className="h-fit rounded-2xl bg-secondary p-6">
      <h3 id="contato-info" className="mb-4 text-lg font-semibold text-primary">
        {contact.infoTitle}
      </h3>
      <ContactDetails />
    </aside>
  );
}
