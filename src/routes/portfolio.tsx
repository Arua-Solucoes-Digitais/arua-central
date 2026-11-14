import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { portfolio } from "@/content/site";
import { fetchShowcase } from "@/lib/api";
import type { ProjectCategory } from "@/lib/schemas";
import { PageShell, ProjectCard, Section, TestimonialList } from "@/components/site/Sections";
import { RevealItem, RevealList } from "@/components/site/Motion";

export const Route = createFileRoute("/portfolio")({
  loader: () => fetchShowcase(),
  headers: () => ({ "Cache-Control": "no-cache" }),
  head: () => ({
    meta: [
      { title: "Portfólio — Aruá Soluções Digitais" },
      {
        name: "description",
        content:
          "Produtos da Aruá e trabalhos para clientes, com sistemas que você pode abrir e usar ao vivo.",
      },
      { property: "og:title", content: "Portfólio — Aruá" },
    ],
  }),
  component: PortfolioPage,
});

type Filter = ProjectCategory | "all";

function PortfolioPage() {
  const { projects, deployments, testimonials } = Route.useLoaderData();
  const [filter, setFilter] = useState<Filter>("all");
  // Só mostra os filtros de categorias que têm projetos publicados.
  const categories = (Object.keys(portfolio.categories) as ProjectCategory[]).filter((c) =>
    projects.some((p) => p.category === c),
  );
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <PageShell title={portfolio.title} intro={portfolio.intro}>
      <section aria-label="Projetos" className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          {categories.length > 1 && (
            <div
              role="group"
              aria-label="Filtrar por categoria"
              className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden"
            >
              {(["all", ...categories] as Filter[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={filter === c}
                  onClick={() => setFilter(c)}
                  data-track={`portfolio-filtro-${c}`}
                  className={`tap min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-primary hover:bg-secondary"}`}
                >
                  {c === "all" ? portfolio.all : portfolio.categories[c]}
                </button>
              ))}
            </div>
          )}
          {visible.length === 0 ? (
            <p className="text-muted-foreground">{portfolio.empty}</p>
          ) : (
            <RevealList key={filter} onMount className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => (
                <RevealItem key={p.id} className="flex">
                  <ProjectCard project={p} deployments={deployments} />
                </RevealItem>
              ))}
            </RevealList>
          )}
        </div>
      </section>

      {testimonials.length > 0 && (
        <Section id="depoimentos" title={portfolio.testimonialsTitle} tone="muted">
          <TestimonialList items={testimonials} />
        </Section>
      )}
    </PageShell>
  );
}
