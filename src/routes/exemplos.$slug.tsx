import { createFileRoute, notFound } from "@tanstack/react-router";
import { ExampleViewer } from "@/components/site/ExampleViewer";
import { examples, isExample } from "@/content/examples";

export const Route = createFileRoute("/exemplos/$slug")({
  beforeLoad: ({ params }) => {
    if (!isExample(params.slug)) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `${isExample(params.slug) ? examples[params.slug].title : "Exemplo"} — Exemplos Aruá`,
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ExamplePage,
});

function ExamplePage() {
  const { slug } = Route.useParams();
  // key: trocar de exemplo recomeça a moldura.
  return isExample(slug) ? <ExampleViewer key={slug} slug={slug} /> : null;
}
