import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  LifeBuoy,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react";
import { clientArea as c } from "@/content/site";
import { PageShell, Section } from "@/components/site/Sections";
import { Reveal, RevealItem, RevealList } from "@/components/site/Motion";
import { withBase } from "@/lib/paths";

const icons = {
  track: ClipboardCheck,
  approve: ThumbsUp,
  reports: BarChart3,
  support: LifeBuoy,
} as const;

export const Route = createFileRoute("/area-do-cliente")({
  head: () => ({
    meta: [
      { title: `${c.title} — Aruá Soluções Digitais` },
      { name: "description", content: c.intro },
      { property: "og:title", content: `${c.title} — Aruá` },
    ],
  }),
  component: ClientAreaPage,
});

function ClientAreaPage() {
  return (
    <PageShell title={c.title} intro={c.intro} badge={c.badge}>
      <Section id="recursos" title={c.featuresTitle}>
        <RevealList className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.features.map((f) => {
            const Icon = icons[f.icon as keyof typeof icons];
            return (
              <RevealItem
                key={f.title}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-primary-foreground transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-primary">{f.title}</h3>
                <p className="mt-2 text-muted-foreground">{f.text}</p>
              </RevealItem>
            );
          })}
        </RevealList>

        <Reveal className="mt-10 flex items-start gap-4 rounded-2xl border border-border bg-secondary p-6">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-accent" />
          <div>
            <h3 className="font-semibold text-primary">{c.accessTitle}</h3>
            <p className="mt-1 text-muted-foreground">{c.accessText}</p>
          </div>
        </Reveal>
      </Section>

      <section
        aria-labelledby="previa"
        className="bg-primary py-14 text-primary-foreground md:py-20"
      >
        <Reveal className="mx-auto max-w-3xl px-4 text-center">
          <h2 id="previa" className="text-3xl font-semibold sm:text-4xl">
            {c.previewTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg font-light opacity-85">{c.previewText}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={withBase(c.previewHref)}
              data-track="area-cliente-demo"
              className="tap group inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 font-semibold text-primary transition-opacity hover:opacity-90"
            >
              {c.previewCta}
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
              />
            </a>
            <a
              href={withBase("/#contato")}
              data-track="area-cliente-contato"
              className="tap inline-flex items-center rounded-full px-6 py-3 font-semibold text-primary-foreground ring-1 ring-primary-foreground/40 transition-colors hover:bg-primary-foreground/10"
            >
              {c.contactCta}
            </a>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}
