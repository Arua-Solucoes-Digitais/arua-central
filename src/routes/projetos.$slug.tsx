import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteHeader";
import { baseProjects, COMING_SOON, environments, portfolio } from "@/content/site";
import { ComingSoonBadge, LiveBadge, liveLink, TestimonialList } from "@/components/site/Sections";
import { isComingSoon } from "@/lib/coming-soon";
import { getProjectPage } from "@/lib/api";
import { withBase } from "@/lib/paths";

const copy = baseProjects.page;

export const Route = createFileRoute("/projetos/$slug")({
  loader: async ({ params }) => {
    const project = await getProjectPage({ data: { slug: params.slug } });
    if (!project) throw notFound();
    return project;
  },
  headers: () => ({ "Cache-Control": "no-cache" }),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Aruá` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.title} — Aruá` },
          { property: "og:description", content: loaderData.description },
          ...(loaderData.status === "published"
            ? []
            : [{ name: "robots", content: "noindex, nofollow" }]),
        ]
      : [],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const project = Route.useLoaderData();
  const isExternal = project.demo_url && !project.demo_url.startsWith("/");
  const live = liveLink(project.deployments, project.slug);
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="mx-auto max-w-4xl px-4 py-10 md:py-16">
        {project.status !== "published" && (
          <p
            role="note"
            className="mb-6 rounded-xl border border-border bg-secondary p-4 text-sm text-primary"
          >
            {copy.previewNotice}
          </p>
        )}
        <a
          href={withBase("/portfolio")}
          className="text-sm font-medium text-muted-foreground underline underline-offset-4"
        >
          {copy.back}
        </a>
        <p className="mt-6 text-sm font-medium text-muted-foreground">
          {portfolio.kinds[project.kind]} · {portfolio.categories[project.category]}
          {project.client && ` · ${copy.client}: ${project.client}`}
        </p>
        {isComingSoon(project, live) && (
          <p className="mt-4">
            <ComingSoonBadge label={COMING_SOON} />
          </p>
        )}
        <h1 className="mt-4 text-4xl font-semibold text-primary sm:text-5xl">{project.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{project.description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {live && (
            <a
              href={live.url}
              target="_blank"
              rel="noopener noreferrer"
              data-track={`ao-vivo-${project.slug}`}
              className="tap min-h-12 justify-center inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {baseProjects.liveCta}
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          )}
          {project.demo_url && (
            <a
              href={withBase(project.demo_url)}
              {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              data-track={`demo-${project.slug}`}
              className="tap min-h-12 justify-center inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {baseProjects.demoCta}
              {isExternal && <ExternalLink aria-hidden="true" className="h-4 w-4" />}
            </a>
          )}
          <a
            href={withBase("/#contato")}
            data-track={`contato-${project.slug}`}
            className="tap inline-flex min-h-12 items-center justify-center rounded-full border border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-secondary"
          >
            {copy.contactCta}
          </a>
        </div>
        {project.image_id && (
          <img
            src={`/media/${project.image_id}`}
            alt={`Apresentação de ${project.title}`}
            className="mt-10 aspect-video w-full rounded-2xl object-cover"
          />
        )}
        {project.problem && (
          <section aria-labelledby="problema" className="mt-12">
            <h2 id="problema" className="text-2xl font-bold text-primary">
              {copy.problem}
            </h2>
            <p className="mt-3 whitespace-pre-line text-lg text-muted-foreground">
              {project.problem}
            </p>
          </section>
        )}
        {project.features.length > 0 && (
          <section aria-labelledby="funcionalidades" className="mt-12">
            <h2 id="funcionalidades" className="text-2xl font-bold text-primary">
              {copy.features}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {project.features.map((feature) => (
                <li key={feature} className="flex gap-3 rounded-xl border border-border p-4">
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {project.results.length > 0 && (
          <section aria-labelledby="resultados" className="mt-12">
            <h2 id="resultados" className="text-2xl font-bold text-primary">
              {copy.results}
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-lg text-muted-foreground">
              {project.results.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        )}
        {project.deployments.length > 0 && (
          <section aria-labelledby="ao-vivo" className="mt-12">
            <h2 id="ao-vivo" className="text-2xl font-bold text-primary">
              {copy.live}
            </h2>
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
              {project.deployments.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <span className="font-medium">{environments[d.environment]}</span>
                  <span className="flex items-center gap-3">
                    <LiveBadge state={d.state} />
                    {d.state === "online" && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4"
                      >
                        Abrir
                        <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {project.testimonials.length > 0 && (
          <section aria-labelledby="depoimentos" className="mt-12">
            <h2 id="depoimentos" className="mb-4 text-2xl font-bold text-primary">
              {copy.testimonials}
            </h2>
            <TestimonialList items={project.testimonials} />
          </section>
        )}
        <section aria-labelledby="contato-projeto" className="mt-12 rounded-2xl bg-secondary p-8">
          <h2 id="contato-projeto" className="text-2xl font-bold text-primary">
            {copy.contactTitle}
          </h2>
          <p className="mt-2 text-muted-foreground">{copy.contactText}</p>
          <Link
            to="/"
            hash="contato"
            data-track={`contato-final-${project.slug}`}
            className="mt-5 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {copy.contactCta}
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
