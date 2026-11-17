import { createFileRoute, notFound } from "@tanstack/react-router";
import { DemoPanel } from "@/components/demos/DemoShell";
import { demoAreas, getDemo, isDemoArea } from "@/content/demos";

export const Route = createFileRoute("/demonstracoes/$client/$area")({
  loader: ({ params }) => {
    if (!getDemo(params.client) || !isDemoArea(params.area)) throw notFound();
  },
  head: ({ params }) => {
    const label = demoAreas.find((a) => a.id === params.area)?.label;
    return {
      meta: label
        ? [{ title: `${label} · Tlim — Aruá` }, { name: "robots", content: "noindex, nofollow" }]
        : [],
    };
  },
  component: DemoAreaPage,
});

function DemoAreaPage() {
  const { client, area } = Route.useParams();
  const demo = getDemo(client);
  if (!demo || !isDemoArea(area)) throw notFound();
  return <DemoPanel demo={demo} area={area} />;
}
