import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell, Section } from "@/components/site/Sections";
import { demoCopy, demos } from "@/content/demos";

export const Route = createFileRoute("/demonstracoes/")({
  head: () => ({
    meta: [
      { title: `${demoCopy.indexTitle} — Aruá Soluções Digitais` },
      { name: "description", content: demoCopy.indexIntro },
      { property: "og:title", content: `${demoCopy.indexTitle} — Aruá` },
    ],
  }),
  component: DemoIndexPage,
});

function DemoIndexPage() {
  return (
    <PageShell title={demoCopy.indexTitle} intro={demoCopy.indexIntro}>
      <Section id="produtos" title="Produtos da Aruá">
        <ul className="grid gap-6 sm:grid-cols-2">
          {Object.values(demos).map((d) => (
            <li key={d.slug} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {demoCopy.productTagline}
              </p>
              <h3 className="mt-1 text-xl font-semibold text-primary">{demoCopy.product}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{demoCopy.entryNotice}</p>
              <Link
                to="/demonstracoes/$client"
                params={{ client: d.slug }}
                data-track={`demonstracoes-${d.slug}`}
                className="tap mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              >
                Abrir demonstração
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </PageShell>
  );
}
