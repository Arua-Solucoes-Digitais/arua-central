import { createFileRoute, notFound } from "@tanstack/react-router";
import { TlimStorefront } from "@/components/demos/TlimStore";
import { getDemo } from "@/content/demos";

// Cardápio online do restaurante de exemplo (visão do cliente).
export const Route = createFileRoute("/demonstracoes/$client/loja")({
  head: () => ({
    meta: [
      { title: "Cardápio online · Tlim — Aruá" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StorePage,
});

function StorePage() {
  const { client } = Route.useParams();
  const demo = getDemo(client);
  if (!demo) throw notFound();
  return <TlimStorefront demo={demo} />;
}
