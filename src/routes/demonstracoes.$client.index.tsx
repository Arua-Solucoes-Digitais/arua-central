import { createFileRoute, notFound } from "@tanstack/react-router";
import { DemoEntry } from "@/components/demos/DemoShell";
import { getDemo } from "@/content/demos";

export const Route = createFileRoute("/demonstracoes/$client/")({
  component: DemoEntryPage,
});

function DemoEntryPage() {
  const { client } = Route.useParams();
  const demo = getDemo(client);
  if (!demo) throw notFound();
  return <DemoEntry demo={demo} />;
}
