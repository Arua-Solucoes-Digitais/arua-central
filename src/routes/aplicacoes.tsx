import { createFileRoute, Link } from "@tanstack/react-router";
import { customApps, evolution, process } from "@/content/site";
import { CheckList, Icon, PageShell, Section } from "@/components/site/Sections";
import { withBase } from "@/lib/paths";

export const Route = createFileRoute("/aplicacoes")({
  head: () => ({
    meta: [
      { title: "Aplicações personalizadas — Aruá Soluções Digitais" },
      {
        name: "description",
        content:
          "Sistemas sob medida para restaurantes, lojas, hospedagens e prestadores de serviço: pedidos, reservas, agendamentos e painel próprio.",
      },
      { property: "og:title", content: "Aplicações personalizadas — Aruá" },
    ],
  }),
  component: CustomAppsPage,
});

function CustomAppsPage() {
  return (
    <PageShell title={customApps.title} intro={customApps.intro}>
      <Section id="exemplos" title={customApps.examplesTitle}>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {customApps.examples.map((e) => (
            <li key={e.title} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground">
                <Icon name={e.icon} />
              </span>
              <h3 className="font-semibold text-primary">{e.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
            </li>
          ))}
        </ul>
        <Link
          to="/portfolio"
          data-track="aplicacoes-portfolio"
          className="mt-8 inline-block font-semibold text-primary underline underline-offset-4"
        >
          Ver sistemas funcionando no portfólio
        </Link>
        <Link
          to="/demonstracoes"
          data-track="aplicacoes-demonstracoes"
          className="mt-3 block font-semibold text-primary underline underline-offset-4"
        >
          Conhecer a Central de Presença Digital em uma demonstração guiada
        </Link>
      </Section>

      <Section id="funcionalidades" title={customApps.featuresTitle} tone="muted">
        <CheckList items={customApps.features} columns={3} />
      </Section>

      <Section id="processo-de-venda" title={customApps.salesTitle}>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {customApps.sales.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-border bg-card p-5">
              <span className="font-display text-2xl font-bold text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-semibold text-primary">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="implantacao"
        title="Implantação e manutenção"
        intro={process.deadline}
        tone="muted"
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold text-primary">{process.title}</h3>
            <ol className="list-decimal space-y-1 pl-5">
              {process.steps.map((s) => (
                <li key={s.title}>{s.title}</li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-primary">{evolution.title}</h3>
            <ul className="list-disc space-y-1 pl-5">
              {evolution.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <a
          href={withBase("/?assunto=orcamento#contato")}
          data-track="aplicacoes-orcamento"
          className="tap mt-10 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {customApps.cta}
        </a>
      </Section>
    </PageShell>
  );
}
