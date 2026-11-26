import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Maximize2, Monitor, Smartphone, Tablet } from "lucide-react";
import { devices, examples, viewerCopy, type DeviceId, type ExampleSlug } from "@/content/examples";
import { withBase } from "@/lib/paths";

const ICONS = { celular: Smartphone, tablet: Tablet, pc: Monitor };

// A página de exemplo dentro de uma moldura com o tamanho de cada aparelho, reduzida para caber
// na tela de quem está vendo. É a ferramenta de apresentação em reunião.
export function ExampleViewer({ slug }: { slug: ExampleSlug }) {
  const example = examples[slug];
  const [deviceId, setDeviceId] = useState<DeviceId>("celular");
  const [space, setSpace] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const device = devices.find((d) => d.id === deviceId)!;
  const src = withBase(`/demos/${slug}/index.html`);

  // Em telas grandes a apresentação começa pelo computador.
  useEffect(() => {
    if (window.innerWidth >= 1024) setDeviceId("pc");
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setSpace(el.clientWidth);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const scale = space ? Math.min(1, space / device.width) : 1;

  return (
    <main className="min-h-screen bg-secondary px-4 py-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/portfolio"
            className="tap inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            {viewerCopy.back}
          </Link>
          <a
            href={src}
            data-track={`exemplo-tela-cheia-${slug}`}
            className="tap inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            <Maximize2 aria-hidden="true" className="h-4 w-4" />
            {viewerCopy.fullScreen}
          </a>
        </div>

        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Aruá · {viewerCopy.notice} · {example.segment}
        </p>
        <h1 className="text-2xl font-semibold text-primary">{example.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{example.description}</p>

        <div role="group" aria-label={viewerCopy.devices} className="mt-4 flex flex-wrap gap-2">
          {devices.map((d) => {
            const Icon = ICONS[d.id];
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={d.id === deviceId}
                onClick={() => setDeviceId(d.id)}
                className={`tap inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${d.id === deviceId ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary"}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {d.label}
              </button>
            );
          })}
        </div>

        <div ref={stage} className="mt-4 w-full overflow-hidden">
          <div
            className="mx-auto overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
            style={{ width: device.width * scale, height: device.height * scale }}
          >
            <iframe
              src={src}
              title={`${example.title} no ${device.label.toLowerCase()}`}
              width={device.width}
              height={device.height}
              className="origin-top-left border-0"
              style={{ transform: `scale(${scale})` }}
            />
          </div>
        </div>

        <nav aria-label={viewerCopy.others} className="flex flex-wrap gap-4 py-5 text-sm">
          {(Object.keys(examples) as ExampleSlug[])
            .filter((other) => other !== slug)
            .map((other) => (
              <Link
                key={other}
                to="/exemplos/$slug"
                params={{ slug: other }}
                className="tap inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4"
              >
                {viewerCopy.others}: {examples[other].title}
              </Link>
            ))}
        </nav>
      </div>
    </main>
  );
}
