import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { TourProvider } from "@/components/demos/DemoTour";
import { TlimProvider } from "@/components/demos/TlimProvider";
import { demoCopy, getDemo } from "@/content/demos";

// Dados estáticos (src/content/demos): sem servidor, sem banco, igual no site e no GitHub Pages.
export const Route = createFileRoute("/demonstracoes/$client")({
  loader: ({ params }) => {
    if (!getDemo(params.client)) throw notFound();
  },
  head: () => ({
    meta: [
      { title: `${demoCopy.product} — ${demoCopy.productTagline} · Aruá` },
      {
        name: "description",
        content: `Demonstração do ${demoCopy.product}, da Aruá: ${demoCopy.productTagline.toLowerCase()}.`,
      },
      // Demonstração com restaurante fictício: acessível pelo portfólio, fora dos buscadores.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DemoLayout,
});

function DemoLayout() {
  const { client } = Route.useParams();
  const demo = getDemo(client);
  if (!demo) throw notFound();
  // O estado (pedidos, clientes, agenda…) e a orientação valem para toda a visita, em memória.
  return (
    <TlimProvider demo={demo}>
      <TourProvider>
        <Outlet />
      </TourProvider>
    </TlimProvider>
  );
}
