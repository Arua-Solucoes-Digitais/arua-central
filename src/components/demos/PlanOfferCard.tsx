// A proposta comercial: o plano (lido de src/content/site.ts, a mesma fonte da página de planos),
// o período de teste e o contato com a Aruá. Igual para qualquer cliente.
import { Check, Gift, MessageCircle } from "lucide-react";
import { arualContact, getOfferPlan } from "@/content/demos";
import type { PlanOffer } from "@/content/demos/types";
import { buildWhatsappUrl } from "@/lib/whatsapp";

const monthsLabel = (n: number) => `${n} ${n === 1 ? "mês" : "meses"}`;

export function PlanOfferCard({ offer, business }: { offer: PlanOffer; business: string }) {
  const plan = getOfferPlan(offer);
  const message = `Olá! Vi a proposta da Aruá para ${business} (plano ${plan.name}, ${monthsLabel(offer.trialMonths)} de teste grátis) e quero conversar.`;
  return (
    <section
      aria-labelledby="proposta-plano"
      className="overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-sm"
    >
      <div className="bg-brand-gradient px-5 py-6 text-primary-foreground sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
          Proposta da Aruá para {business}
        </p>
        <h2 id="proposta-plano" className="mt-1 font-display text-3xl font-bold">
          {plan.name}
        </h2>
        <p className="mt-1 max-w-2xl opacity-95">{plan.summary}</p>
      </div>

      <div className="grid gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-highlight/30 px-3 py-1 text-sm font-semibold text-foreground">
            <Gift aria-hidden="true" className="h-4 w-4" />
            Teste grátis
          </p>
          <p className="mt-3 font-display text-4xl font-bold text-primary">
            {monthsLabel(offer.trialMonths)} sem custo
          </p>
          <p className="mt-2 text-muted-foreground">
            Depois do teste, {plan.price}
            {plan.period}, só se você decidir continuar.
          </p>
          <a
            href={buildWhatsappUrl(arualContact.whatsapp, message)}
            target="_blank"
            rel="noopener noreferrer"
            data-track={`proposta-whatsapp-${offer.planId}`}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
            Conversar sobre a proposta
          </a>
          <p className="mt-2 text-sm text-muted-foreground">
            WhatsApp da Aruá: {arualContact.display}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-foreground">O que está incluído</h3>
          <ul className="mt-3 space-y-2">
            {plan.includes.map((item) => {
              const later = offer.notInTrial.includes(item);
              return (
                <li key={item} className="flex items-start gap-2 text-foreground">
                  <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span>
                    {item}
                    {later && (
                      <span className="ml-1 text-sm text-muted-foreground">(depois do teste)</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">{offer.trialNote}</p>
          <p className="mt-4 border-t border-border pt-4 text-sm font-semibold text-foreground">
            {offer.status}
          </p>
        </div>
      </div>
    </section>
  );
}
