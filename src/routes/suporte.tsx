import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ExternalLink } from "lucide-react";
import { faq, support } from "@/content/site";
import { ContactForm } from "@/components/site/ContactForm";
import {
  ContactDetails,
  FaqList,
  hasContactDetails,
  PageShell,
  Section,
} from "@/components/site/Sections";

export const Route = createFileRoute("/suporte")({
  head: () => ({
    meta: [
      { title: "Suporte — Aruá Soluções Digitais" },
      {
        name: "description",
        content: "Central de ajuda, contato direto, status dos sistemas e solicitação de suporte.",
      },
      { property: "og:title", content: "Suporte — Aruá" },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <PageShell title={support.title} intro={support.intro}>
      <Section id="ajuda" title={support.helpTitle} intro={faq.title}>
        <FaqList />
      </Section>

      {support.tutorials.length > 0 && (
        <Section id="tutoriais" title={support.tutorialsTitle} tone="muted">
          <ul className="grid gap-3 sm:grid-cols-2">
            {support.tutorials.map((t) => (
              <li key={t.url}>
                <a
                  href={t.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4"
                >
                  {t.title}
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <section aria-labelledby="status-title" className="bg-primary py-14 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4">
          <div className="flex items-start gap-4">
            <Activity aria-hidden="true" className="mt-1 h-8 w-8 text-highlight" />
            <div>
              <h2 id="status-title" className="text-2xl font-bold">
                {support.statusTitle}
              </h2>
              <p className="mt-1 opacity-85">{support.statusText}</p>
            </div>
          </div>
          <Link
            to="/status"
            data-track="suporte-status"
            className="rounded-full bg-primary-foreground px-6 py-3 font-semibold text-primary transition-opacity hover:opacity-90"
          >
            {support.statusCta}
          </Link>
        </div>
      </section>

      <section id="solicitar" aria-labelledby="solicitar-title" className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 id="solicitar-title" className="text-3xl font-bold text-primary">
              {support.requestTitle}
            </h2>
            <p className="mb-8 mt-3 text-muted-foreground">{support.requestText}</p>
            <ContactForm defaultTopic="suporte" prefix="suporte-" />
          </div>
          {hasContactDetails() && (
            <aside aria-labelledby="direto-title" className="h-fit rounded-2xl bg-secondary p-6">
              <h3 id="direto-title" className="mb-4 text-lg font-semibold text-primary">
                {support.directTitle}
              </h3>
              <ContactDetails />
            </aside>
          )}
        </div>
      </section>
    </PageShell>
  );
}
