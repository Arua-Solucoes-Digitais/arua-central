import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { TourProvider } from "@/components/demos/DemoTour";
import { demoCopy, getDemo } from "@/content/demos";

// Dados estáticos (src/content/demos): sem servidor, sem banco, igual no site e no GitHub Pages.
export const Route = createFileRoute("/demonstracoes/$client")({
  loader: ({ params }) => {
    const demo = getDemo(params.client);
    if (!demo) throw notFound();
    return { name: demo.business.name };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} · ${demoCopy.product} — Aruá` },
          {
            name: "description",
            content: `Demonstração guiada da ${demoCopy.product} da Aruá para ${loaderData.name}, baseada no diagnóstico inicial.`,
          },
          // Demonstração de cliente: acessível pelo link, fora dos buscadores.
          { name: "robots", content: "noindex, nofollow" },
        ]
      : [],
  }),
  component: DemoLayout,
});

function DemoLayout() {
  // A orientação continua aberta ou fechada ao trocar de área (estado só em memória).
  return (
    <TourProvider>
      <Outlet />
    </TourProvider>
  );
}
