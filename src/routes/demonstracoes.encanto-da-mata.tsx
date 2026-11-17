import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, MapPin } from "lucide-react";
import { PlanOfferCard } from "@/components/demos/PlanOfferCard";
import { encantoShowcase as s, type ShowcasePiece } from "@/content/demos/encanto-da-mata";
import { withBase } from "@/lib/paths";

// Página estática (sem banco): igual no site e no GitHub Pages.
export const Route = createFileRoute("/demonstracoes/encanto-da-mata")({
  head: () => ({
    meta: [
      { title: `${s.name} · Projeto Aruá` },
      { name: "description", content: s.intro },
      // Apresentação de cliente: acessível pelo link e pelo portfólio, fora dos buscadores.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EncantoShowcase,
});

const buttonClass =
  "mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90";

function PieceLink({ piece }: { piece: ShowcasePiece }) {
  if (piece.kind === "route") {
    return (
      <Link to={piece.href} data-track={`encanto-${piece.id}`} className={buttonClass}>
        {piece.cta}
      </Link>
    );
  }
  return (
    <a
      href={withBase(piece.href)}
      target="_blank"
      rel="noopener"
      data-track={`encanto-${piece.id}`}
      className={buttonClass}
    >
      {piece.cta}
      <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}

function EncantoShowcase() {
  return (
    <div>
      <p
        role="note"
        className="bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
      >
        {s.notice}
      </p>
      <header className="relative overflow-hidden">
        <img
          src={withBase(s.hero.src)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/65" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-primary-foreground md:py-24">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-90">{s.eyebrow}</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{s.name}</h1>
          <p className="mt-3 flex items-center gap-2">
            <MapPin aria-hidden="true" className="h-4 w-4" />
            {s.place}
          </p>
          <p className="mt-5 max-w-2xl text-lg opacity-95">{s.intro}</p>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-5xl space-y-14 px-4 py-10 md:py-14">
        <section aria-labelledby="projeto">
          <h2 id="projeto" className="mb-5 text-2xl font-bold text-primary">
            {s.piecesTitle}
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {s.pieces.map((piece) => (
              <li
                key={piece.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
              >
                <img
                  src={withBase(piece.image)}
                  alt={piece.imageAlt}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-lg font-semibold text-primary">{piece.title}</h3>
                  <p className="text-muted-foreground">{piece.description}</p>
                  <ul className="space-y-1.5 text-sm text-foreground">
                    {piece.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {piece.note && <p className="text-sm text-muted-foreground">{piece.note}</p>}
                  <PieceLink piece={piece} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <PlanOfferCard offer={s.offer} business={s.name} />
      </main>
    </div>
  );
}
