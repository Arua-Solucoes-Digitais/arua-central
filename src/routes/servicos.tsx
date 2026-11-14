import { createFileRoute, Link } from "@tanstack/react-router";
import { evolution, management, navigation, process, services, technical } from "@/content/site";
import { CheckList, Icon, PageShell, Section } from "@/components/site/Sections";
import { withBase } from "@/lib/paths";

export const Route = createFileRoute("/servicos")({
  head: () => ({
    meta: [
      { title: "Serviços — Aruá Soluções Digitais" },
      {
        name: "description",
        content:
          "Sites, aplicações, social media, produção audiovisual, hospedagem, manutenção e suporte.",
      },
      { property: "og:title", content: "Serviços — Aruá" },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <PageShell title={services.title} intro={services.intro}>
      <section aria-label="Serviços" className="py-16 md:py-20">
        <ul className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2">
          {services.groups.map((s) => (
            <li
              key={s.id}
              id={s.id}
              className="scroll-mt-24 rounded-2xl border border-border bg-card p-7 shadow-soft"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground">
                <Icon name={s.icon} />
              </span>
              <h2 className="text-2xl font-semibold text-primary">{s.title}</h2>
              <p className="mt-2 text-muted-foreground">{s.description}</p>
              <ul className="mt-4 list-disc space-y-1 pl-5">
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <Section id="implantacao" title={process.title} intro={process.intro} tone="muted">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {process.steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-border bg-card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-primary">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 font-medium text-primary">{process.deadline}</p>
      </Section>

      <Section id="estrutura" title={technical.title} intro={technical.intro}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {technical.items.map((t) => (
            <li key={t.title} className="rounded-2xl border border-border bg-card p-5">
              <Icon name={t.icon} className="h-6 w-6 text-accent" />
              <h3 className="mt-3 font-semibold text-primary">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="resultados" title={management.title} intro={management.intro} tone="muted">
        <CheckList items={management.items} />
      </Section>

      <Section id="evolucao" title={evolution.title} intro={evolution.intro}>
        <CheckList items={evolution.items} columns={3} />
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={withBase("/#contato")}
            data-track="servicos-orcamento"
            className="tap rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {navigation.cta}
          </a>
          <Link
            to="/planos"
            data-track="servicos-planos"
            className="rounded-full border border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-secondary"
          >
            Ver planos
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
