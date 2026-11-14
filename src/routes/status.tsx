import { createFileRoute } from "@tanstack/react-router";
import { status } from "@/content/site";
import { fetchShowcase } from "@/lib/api";
import { PageShell, StatusTable } from "@/components/site/Sections";

export const Route = createFileRoute("/status")({
  loader: async () => (await fetchShowcase()).deployments,
  headers: () => ({ "Cache-Control": "no-cache" }),
  head: () => ({
    meta: [{ title: "Status dos sistemas — Aruá" }, { name: "description", content: status.intro }],
  }),
  component: StatusPage,
});

function StatusPage() {
  const deployments = Route.useLoaderData();
  return (
    <PageShell title={status.title} intro={status.intro}>
      <section aria-label={status.title} className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          {deployments.length === 0 ? (
            <p className="text-muted-foreground">{status.empty}</p>
          ) : (
            <StatusTable deployments={deployments} labels={status} />
          )}
        </div>
      </section>
    </PageShell>
  );
}
