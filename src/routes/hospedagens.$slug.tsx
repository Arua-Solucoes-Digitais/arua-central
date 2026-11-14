import { useEffect, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Clock, Instagram, MapPin, Users } from "lucide-react";
import { ReservationForm } from "@/components/hospedagens/ReservationForm";
import { hospedagensCopy as copy } from "@/content/hospedagens";
import { getPropertyPage } from "@/lib/api";
import type { MediaItem } from "@/lib/schemas";
import { formatPrice, instagramUrl } from "@/lib/whatsapp";

export const Route = createFileRoute("/hospedagens/$slug")({
  loader: async ({ params }) => {
    const property = await getPropertyPage({ data: { slug: params.slug } });
    if (!property) throw notFound();
    return property;
  },
  headers: () => ({ "Cache-Control": "no-cache" }),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.name },
          { name: "description", content: loaderData.description.slice(0, 160) },
          { property: "og:title", content: loaderData.name },
          { property: "og:description", content: loaderData.description.slice(0, 160) },
          // Demonstrações e pré-visualizações não devem aparecer em buscadores.
          ...(loaderData.is_demo || loaderData.status !== "published"
            ? [{ name: "robots", content: "noindex, nofollow" }]
            : []),
        ]
      : [],
  }),
  component: Vitrine,
});

function Media({
  item,
  fallbackAlt,
  className,
}: {
  item: MediaItem;
  fallbackAlt: string;
  className: string;
}) {
  if (item.kind === "video") {
    return (
      <video
        controls
        preload="metadata"
        playsInline
        aria-label={item.alt || fallbackAlt}
        className={className}
      >
        <source src={`/media/${item.id}`} />
      </video>
    );
  }
  return (
    <img
      src={`/media/${item.id}`}
      alt={item.alt || fallbackAlt}
      loading="lazy"
      className={className}
    />
  );
}

function DemoPhoto({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-brand-gradient p-4 text-center text-sm font-medium text-primary-foreground ${className}`}
    >
      {copy.demoPhoto}
    </div>
  );
}

function Vitrine() {
  const property = Route.useLoaderData();
  const [stayId, setStayId] = useState("");
  // O botão fixo some quando o formulário está na tela, para não competir com o envio pelo WhatsApp.
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const form = document.getElementById("reserva");
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) =>
      setFormVisible(Boolean(entry?.isIntersecting)),
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);
  const amenities = property.amenities
    .split("\n")
    .map((a) => a.trim())
    .filter(Boolean);
  const instagram = instagramUrl(property.instagram);
  const banner = property.banners[0];
  const placeholders = property.is_demo && property.gallery.length === 0;

  function chooseStay(id: string) {
    setStayId(id);
    document.getElementById("reserva")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="pb-24 md:pb-0">
      {property.is_demo && (
        <p
          role="note"
          className="bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
        >
          {copy.demoNotice}
        </p>
      )}
      {property.status !== "published" && (
        <p
          role="note"
          className="bg-secondary px-4 py-2 text-center text-sm font-medium text-primary"
        >
          {copy.previewNotice}
        </p>
      )}
      <header className="relative overflow-hidden">
        {banner ? (
          <Media
            item={banner}
            fallbackAlt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-brand-gradient" />
        )}
        <div className="absolute inset-0 bg-primary/60" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-primary-foreground md:py-24">
          {property.logo && (
            <img
              src={`/media/${property.logo.id}`}
              alt={property.logo.alt || `Logotipo de ${property.name}`}
              className="mb-5 h-20 w-auto rounded-xl bg-background object-contain p-1"
            />
          )}
          <h1 className="text-4xl font-semibold sm:text-5xl">{property.name}</h1>
          {property.address && (
            <p className="mt-3 flex items-start gap-2">
              <MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" />
              {property.address}
            </p>
          )}
          <a
            href="#reserva"
            data-track={`vitrine-cta-${property.slug}`}
            className="mt-7 hidden rounded-full bg-background px-7 py-3 font-semibold text-primary transition-opacity hover:opacity-90 md:inline-block"
          >
            {copy.cta}
          </a>
        </div>
      </header>

      <main id="conteudo" className="mx-auto max-w-5xl space-y-14 px-4 py-10 md:py-14">
        {property.description && (
          <p className="whitespace-pre-line text-lg text-muted-foreground">
            {property.description}
          </p>
        )}

        {(property.gallery.length > 0 || placeholders) && (
          <section aria-labelledby="galeria">
            <h2 id="galeria" className="mb-5 text-2xl font-bold text-primary">
              {copy.sections.gallery}
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {placeholders &&
                [1, 2, 3].map((n) => (
                  <li key={n}>
                    <DemoPhoto className="aspect-video rounded-xl" />
                  </li>
                ))}
              {property.gallery.map((item) => (
                <li key={item.id}>
                  <Media
                    item={item}
                    fallbackAlt={`Foto de ${property.name}`}
                    className="aspect-video w-full rounded-xl object-cover"
                  />
                  {item.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {property.stays.length > 0 && (
          <section aria-labelledby="modalidades">
            <h2 id="modalidades" className="mb-5 text-2xl font-bold text-primary">
              {copy.sections.stays}
            </h2>
            <ul className="grid gap-5 md:grid-cols-2">
              {property.stays.map((stay) => {
                const unavailable = stay.availability === "unavailable";
                return (
                  <li
                    key={stay.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
                  >
                    {stay.photos[0] ? (
                      <Media
                        item={stay.photos[0]}
                        fallbackAlt={`Foto de ${stay.name}`}
                        className="aspect-video w-full object-cover"
                      />
                    ) : property.is_demo ? (
                      <DemoPhoto className="aspect-video" />
                    ) : null}
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-lg font-semibold text-primary">{stay.name}</h3>
                        <span className="text-sm font-medium text-muted-foreground">
                          {copy.availability[stay.availability]}
                        </span>
                      </div>
                      {stay.description && (
                        <p className="text-muted-foreground">{stay.description}</p>
                      )}
                      <p className="text-xl font-bold text-primary">
                        {stay.price_cents === null
                          ? copy.priceOnRequest
                          : formatPrice(stay.price_cents)}
                        {stay.price_cents !== null && stay.billing && (
                          <span className="ml-1 text-sm font-normal text-muted-foreground">
                            {stay.billing}
                          </span>
                        )}
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {stay.capacity !== null && (
                          <li className="flex items-center gap-2">
                            <Users aria-hidden="true" className="h-4 w-4" />
                            {copy.capacity(stay.capacity)}
                          </li>
                        )}
                        {(stay.check_in_time || stay.check_out_time) && (
                          <li className="flex items-center gap-2">
                            <Clock aria-hidden="true" className="h-4 w-4" />
                            {stay.check_in_time && `Entrada ${stay.check_in_time}`}
                            {stay.check_in_time && stay.check_out_time && " · "}
                            {stay.check_out_time && `Saída ${stay.check_out_time}`}
                          </li>
                        )}
                      </ul>
                      {stay.rules && <p className="text-sm text-muted-foreground">{stay.rules}</p>}
                      {stay.availability_note && (
                        <p className="text-sm text-muted-foreground">{stay.availability_note}</p>
                      )}
                      <button
                        type="button"
                        disabled={unavailable}
                        aria-pressed={stayId === stay.id}
                        data-track={`modalidade-${property.slug}`}
                        onClick={() => chooseStay(stay.id)}
                        className="mt-auto rounded-full border border-primary px-5 py-2.5 font-semibold text-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                      >
                        {unavailable
                          ? copy.availability.unavailable
                          : stayId === stay.id
                            ? copy.chosenStay
                            : copy.chooseStay}
                        <span className="sr-only">: {stay.name}</span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {amenities.length > 0 && (
          <section aria-labelledby="comodidades">
            <h2 id="comodidades" className="mb-5 text-2xl font-bold text-primary">
              {copy.sections.amenities}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <li
                  key={a}
                  className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-primary"
                >
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(property.address || property.maps_url || instagram) && (
          <section aria-labelledby="localizacao">
            <h2 id="localizacao" className="mb-3 text-2xl font-bold text-primary">
              {copy.sections.location}
            </h2>
            {property.address && <p className="text-muted-foreground">{property.address}</p>}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {property.maps_url && (
                <a
                  href={property.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4"
                >
                  <MapPin aria-hidden="true" className="h-4 w-4" />
                  {copy.openMaps}
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4"
                >
                  <Instagram aria-hidden="true" className="h-4 w-4" />
                  {copy.instagram}
                </a>
              )}
            </div>
          </section>
        )}

        <section
          id="reserva"
          aria-labelledby="reserva-titulo"
          className="scroll-mt-4 rounded-2xl border border-border bg-card p-5 sm:p-8"
        >
          <h2 id="reserva-titulo" className="text-2xl font-bold text-primary">
            {copy.sections.reservation}
          </h2>
          <p className="mt-2 text-muted-foreground">{copy.reservationIntro}</p>
          <ReservationForm property={property} stayId={stayId} onStayChange={setStayId} />
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
        <a href="/projetos/arua-hospedagens" className="underline underline-offset-4">
          {copy.poweredBy}
        </a>
      </footer>

      {!formVisible && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background p-3 md:hidden">
          <a
            href="#reserva"
            data-track={`vitrine-cta-fixo-${property.slug}`}
            className="block rounded-full bg-primary py-3 text-center font-semibold text-primary-foreground"
          >
            {copy.cta}
          </a>
        </div>
      )}
    </div>
  );
}
