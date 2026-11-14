import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { faq, plans, pricing } from "@/content/site";
import { FaqList, PageShell, PlanCards, Section } from "@/components/site/Sections";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos e preços — Aruá Soluções Digitais" },
      {
        name: "description",
        content:
          "Planos mensais a partir de R$ 149: presença digital, social media, produção audiovisual e performance.",
      },
      { property: "og:title", content: "Planos — Aruá" },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  return (
    <PageShell title={plans.title} intro={plans.intro}>
      <section aria-label="Planos" className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <PlanCards />
          <p className="mt-6 text-sm text-muted-foreground">{plans.note}</p>
        </div>
      </section>

      <Section id="comparativo" title={plans.comparison.title} tone="muted">
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">{plans.comparison.title}</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-4 text-left font-semibold text-primary">
                  Inclui
                </th>
                {plans.items.map((p) => (
                  <th key={p.id} scope="col" className="p-4 text-center font-semibold text-primary">
                    {p.name}
                    <br />
                    <span className="font-normal text-muted-foreground">
                      {p.price}
                      {p.period}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans.comparison.rows.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0">
                  <th scope="row" className="p-4 text-left font-normal">
                    {row.label}
                  </th>
                  {row.plans.map((included, i) => (
                    <td key={plans.items[i]?.id ?? i} className="p-4 text-center">
                      {included ? (
                        <Check aria-label="Incluído" className="mx-auto h-5 w-5 text-accent" />
                      ) : (
                        <Minus
                          aria-label="Não incluído"
                          className="mx-auto h-5 w-5 text-muted-foreground"
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="modelo-comercial" title={pricing.title} intro={pricing.intro}>
        <div className="grid gap-6 md:grid-cols-3">
          {pricing.groups.map((g) => (
            <div key={g.title} className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-primary">{g.title}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="faq" title={faq.title} tone="muted">
        <FaqList />
      </Section>
    </PageShell>
  );
}
