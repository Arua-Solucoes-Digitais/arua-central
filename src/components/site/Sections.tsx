// Blocos reaproveitados pelas páginas públicas. O texto vem de src/content/site.ts e do banco.
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Bed,
  Calendar,
  Camera,
  Check,
  Code2,
  Database,
  ExternalLink,
  Instagram,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Server,
  ShieldCheck,
  Store,
  TrendingUp,
  Utensils,
  Wrench,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  baseProjects,
  contactInfo,
  faq,
  environments,
  liveStates,
  plans,
  portfolio,
} from "@/content/site";
import type {
  LiveState,
  PublicBaseProject,
  PublicDeployment,
  PublicTestimonial,
} from "@/lib/schemas";
import { instagramUrl } from "@/lib/whatsapp";
import { withBase } from "@/lib/paths";
import { Reveal, RevealItem, RevealList } from "./Motion";
import { SiteFooter, SiteHeader } from "./SiteHeader";
import { SwipeItem, SwipeRow } from "./SwipeRow";

export const icons = {
  code: Code2,
  megaphone: Megaphone,
  camera: Camera,
  wrench: Wrench,
  database: Database,
  shield: ShieldCheck,
  server: Server,
  trending: TrendingUp,
  utensils: Utensils,
  store: Store,
  bed: Bed,
  calendar: Calendar,
} as const;

export function Icon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  const Component = icons[name as keyof typeof icons] ?? Code2;
  return <Component aria-hidden="true" className={className} />;
}

export function SectionTitle({ id, title, intro }: { id: string; title: string; intro?: string }) {
  return (
    <Reveal className="mb-8 max-w-2xl md:mb-10">
      <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded-full bg-brand-gradient" />
      <h2 id={id} className="text-3xl font-bold text-primary sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-3 text-lg text-muted-foreground">{intro}</p>}
    </Reveal>
  );
}

// Página interna: cabeçalho, título e rodapé iguais em todas.
export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <section className="bg-primary py-12 text-primary-foreground md:py-20">
          <Reveal onMount className="mx-auto max-w-6xl px-4">
            <span
              aria-hidden="true"
              className="mb-4 block h-1 w-12 rounded-full bg-brand-gradient"
            />
            <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-lg font-light opacity-85">{intro}</p>
          </Reveal>
        </section>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

export function Section({
  id,
  title,
  intro,
  tone = "plain",
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  tone?: "plain" | "muted";
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`py-14 md:py-20 ${tone === "muted" ? "bg-secondary" : ""}`}
    >
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle id={`${id}-title`} title={title} {...(intro ? { intro } : {})} />
        {children}
      </div>
    </section>
  );
}

export function CheckList({ items, columns = 2 }: { items: string[]; columns?: 1 | 2 | 3 }) {
  const grid =
    columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "";
  return (
    <RevealList className={`grid gap-3 ${grid}`}>
      {items.map((item) => (
        <RevealItem key={item} className="flex gap-3 rounded-xl border border-border bg-card p-4">
          <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <span>{item}</span>
        </RevealItem>
      ))}
    </RevealList>
  );
}

const STATE_STYLE: Record<LiveState, string> = {
  online: "border-accent text-accent",
  offline: "border-destructive text-destructive",
  maintenance: "border-border text-muted-foreground",
  planned: "border-border text-muted-foreground",
  unchecked: "border-border text-muted-foreground",
};

export function LiveBadge({ state }: { state: LiveState }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATE_STYLE[state]}`}
    >
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
      {liveStates[state]}
    </span>
  );
}

const isExternal = (url: string) => !url.startsWith("/");
const linkProps = (url: string) =>
  isExternal(url) ? { target: "_blank", rel: "noopener noreferrer" } : {};

// Endereço que o público pode abrir: produção no ar primeiro, depois demonstração no ar.
export function liveLink(deployments: PublicDeployment[], slug: string) {
  const mine = deployments.filter((d) => d.project_slug === slug && d.state === "online");
  return (
    mine.find((d) => d.environment === "production") ??
    mine.find((d) => d.environment === "demo") ??
    null
  );
}

export function ProjectCard({
  project,
  deployments,
}: {
  project: PublicBaseProject;
  deployments: PublicDeployment[];
}) {
  const live = liveLink(deployments, project.slug);
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-transform duration-300 md:hover:-translate-y-1">
      {project.image_id ? (
        <img
          src={withBase(`/media/${project.image_id}`)}
          alt=""
          loading="lazy"
          className="aspect-[2/1] w-full object-cover md:aspect-video"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex aspect-[2/1] w-full items-center justify-center bg-brand-gradient md:aspect-video"
        >
          <span className="font-display text-6xl font-bold text-primary-foreground/90">
            {project.title.charAt(0)}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          <span>{portfolio.kinds[project.kind]}</span>
          <span aria-hidden="true">·</span>
          <span>{portfolio.categories[project.category]}</span>
          {live && <LiveBadge state="online" />}
        </div>
        <h3 className="mt-2 text-lg font-semibold text-primary">{project.title}</h3>
        {project.client && <p className="text-sm text-muted-foreground">{project.client}</p>}
        <p className="mt-2 flex-1 text-muted-foreground">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Link
            to="/projetos/$slug"
            params={{ slug: project.slug }}
            data-track={`projeto-${project.slug}`}
            className="font-semibold text-primary underline underline-offset-4"
          >
            {baseProjects.detailsCta}
            <span className="sr-only">: {project.title}</span>
          </Link>
          {live ? (
            <a
              href={live.url}
              target="_blank"
              rel="noopener noreferrer"
              data-track={`ao-vivo-${project.slug}`}
              className="inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4"
            >
              {baseProjects.liveCta}
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              <span className="sr-only">: {project.title}</span>
            </a>
          ) : (
            project.demo_url && (
              <a
                href={withBase(project.demo_url)}
                {...linkProps(project.demo_url)}
                data-track={`demo-${project.slug}`}
                className="inline-flex items-center gap-2 font-semibold text-primary underline underline-offset-4"
              >
                {baseProjects.demoCta}
                {isExternal(project.demo_url) && (
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                )}
                <span className="sr-only">: {project.title}</span>
              </a>
            )
          )}
        </div>
      </div>
    </article>
  );
}

export function TestimonialList({ items }: { items: PublicTestimonial[] }) {
  return (
    <SwipeRow label="Depoimentos">
      {items.map((t) => (
        <SwipeItem key={t.id} className="flex-col rounded-2xl border border-border bg-card p-6">
          <blockquote className="flex-1 text-lg leading-relaxed text-primary">
            “{t.quote}”
          </blockquote>
          <p className="mt-4 font-semibold text-primary">{t.author}</p>
          {t.role && <p className="text-sm text-muted-foreground">{t.role}</p>}
          {t.project_slug && t.project_title && (
            <Link
              to="/projetos/$slug"
              params={{ slug: t.project_slug }}
              className="mt-2 text-sm text-primary underline underline-offset-4"
            >
              {t.project_title}
            </Link>
          )}
        </SwipeItem>
      ))}
    </SwipeRow>
  );
}

export function PlanCards({ compact = false }: { compact?: boolean }) {
  return (
    <SwipeRow label={plans.title} desktop="md:grid-cols-2 lg:grid-cols-4">
      {plans.items.map((plan) => (
        <SwipeItem
          key={plan.id}
          className="flex-col rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <h3 className="text-lg font-semibold text-primary">{plan.name}</h3>
          <p className="mt-3">
            <span className="font-display text-3xl font-bold text-primary">{plan.price}</span>
            <span className="text-muted-foreground">{plan.period}</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{plan.summary}</p>
          {!compact && (
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {plan.includes.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          )}
          {compact && <span aria-hidden="true" className="flex-1" />}
          <a
            href={withBase(`/?assunto=orcamento&plano=${plan.id}#contato`)}
            data-track={`plano-${plan.id}`}
            className="tap mt-6 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {plans.cta}
            <span className="sr-only">: {plan.name}</span>
          </a>
        </SwipeItem>
      ))}
    </SwipeRow>
  );
}

export function StatusTable({
  deployments,
  labels,
}: {
  deployments: PublicDeployment[];
  labels: { lastCheck: string; uptime: string; never: string; open: string };
}) {
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
      {deployments.map((d) => (
        <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="min-w-0">
            <p className="font-semibold text-primary">
              {d.project_title}{" "}
              <span className="font-normal text-muted-foreground">
                · {environments[d.environment]}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              {labels.lastCheck}:{" "}
              {d.last_checked_at
                ? new Date(d.last_checked_at).toLocaleString("pt-BR")
                : labels.never}
              {d.uptime_30d !== null &&
                ` · ${labels.uptime}: ${d.uptime_30d.toLocaleString("pt-BR")}%`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveBadge state={d.state} />
            {d.state === "online" && (
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4"
              >
                {labels.open}
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="sr-only">: {d.project_title}</span>
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export const hasContactDetails = () =>
  Object.values(contactInfo).some((value) => value.trim() !== "");

// Contato direto: só mostra o que estiver preenchido em contactInfo.
export function ContactDetails() {
  const instagram = contactInfo.instagram ? instagramUrl(contactInfo.instagram) : null;
  const rows = [
    contactInfo.whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      href: `https://wa.me/${contactInfo.whatsapp.replace(/\D/g, "")}`,
      text: "Conversar pelo WhatsApp",
    },
    contactInfo.email && {
      icon: Mail,
      label: "E-mail",
      href: `mailto:${contactInfo.email}`,
      text: contactInfo.email,
    },
    instagram && {
      icon: Instagram,
      label: "Instagram",
      href: instagram,
      text: `@${contactInfo.instagram.replace(/^@/, "")}`,
    },
    contactInfo.address && { icon: MapPin, label: "Endereço", href: "", text: contactInfo.address },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href: string; text: string }[];
  if (rows.length === 0 && !contactInfo.hours) return null;
  return (
    <ul className="grid gap-3">
      {rows.map(({ icon: RowIcon, label, href, text }) => (
        <li key={label} className="flex items-center gap-3">
          <RowIcon aria-hidden="true" className="h-5 w-5 shrink-0 text-accent" />
          <span className="sr-only">{label}:</span>
          {href ? (
            <a
              href={href}
              {...(href.startsWith("https")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              data-track={`contato-${label.toLowerCase()}`}
              className="text-primary underline underline-offset-4"
            >
              {text}
            </a>
          ) : (
            <span>{text}</span>
          )}
        </li>
      ))}
      {contactInfo.hours && <li className="text-sm text-muted-foreground">{contactInfo.hours}</li>}
    </ul>
  );
}

export function FaqList() {
  return (
    <Accordion
      type="single"
      collapsible
      className="max-w-3xl rounded-2xl border border-border bg-card px-6"
    >
      {faq.items.map((item, i) => (
        <AccordionItem key={item.q} value={`faq-${i}`}>
          <AccordionTrigger className="text-left text-base font-semibold text-primary">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
