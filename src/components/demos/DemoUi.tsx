// Peças visuais das demonstrações guiadas. Status sempre com ícone + rótulo, nunca só cor.
import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  CircleHelp,
  Clock,
  FlaskConical,
  Info,
  KeyRound,
  Lightbulb,
  Lock,
  PlayCircle,
  ShieldCheck,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";
import {
  actionStateLabels,
  activityStatusLabels,
  certaintyLabels,
  demoCopy,
  natureLabels,
} from "@/content/demos";
import type {
  ActionState,
  ActivityStatus,
  Certainty,
  DataNature,
  SourceLink,
} from "@/content/demos/types";
import { safeHttpUrl } from "@/lib/safe-url";

type Tone = "neutral" | "info" | "warn" | "good" | "brand";

const toneClass: Record<Tone, string> = {
  neutral: "border-border bg-card text-muted-foreground",
  info: "border-accent/30 bg-accent/10 text-accent",
  warn: "border-highlight/60 bg-highlight/20 text-foreground",
  good: "border-accent/30 bg-card text-foreground",
  brand: "border-primary/30 bg-primary/10 text-primary",
};

export function Chip({
  icon: IconCmp,
  tone = "neutral",
  children,
  title,
}: {
  icon: LucideIcon;
  tone?: Tone;
  children: ReactNode;
  title?: string;
}) {
  return (
    <span
      {...(title ? { title } : {})}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass[tone]}`}
    >
      <IconCmp aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      {children}
    </span>
  );
}

const activityIcons: Record<ActivityStatus, { icon: LucideIcon; tone: Tone }> = {
  planejado: { icon: CircleDashed, tone: "neutral" },
  andamento: { icon: PlayCircle, tone: "info" },
  aguardando: { icon: Clock, tone: "warn" },
  aprovado: { icon: ThumbsUp, tone: "good" },
  concluido: { icon: CheckCircle2, tone: "good" },
  ajustes: { icon: AlertTriangle, tone: "brand" },
};

export function ActivityStatusChip({ status }: { status: ActivityStatus }) {
  const s = activityIcons[status];
  return (
    <Chip icon={s.icon} tone={s.tone}>
      {activityStatusLabels[status]}
    </Chip>
  );
}

const certaintyIcons: Record<Certainty, { icon: LucideIcon; tone: Tone }> = {
  verificado: { icon: ShieldCheck, tone: "info" },
  hipotese: { icon: Lightbulb, tone: "warn" },
  pendente: { icon: CircleHelp, tone: "warn" },
};

export function CertaintyChip({ certainty }: { certainty: Certainty }) {
  const c = certaintyIcons[certainty];
  return (
    <Chip icon={c.icon} tone={c.tone}>
      {certaintyLabels[certainty]}
    </Chip>
  );
}

const natureIcons: Record<DataNature, { icon: LucideIcon; tone: Tone }> = {
  real: { icon: ShieldCheck, tone: "info" },
  estimativa: { icon: Info, tone: "warn" },
  simulacao: { icon: FlaskConical, tone: "brand" },
};

export function NatureChip({ nature }: { nature: DataNature }) {
  const n = natureIcons[nature];
  return (
    <Chip icon={n.icon} tone={n.tone} title={natureLabels[nature].explain}>
      <span data-nature={nature}>Dado: {natureLabels[nature].label}</span>
    </Chip>
  );
}

const actionIcons: Record<ActionState, { icon: LucideIcon; tone: Tone }> = {
  proposta: { icon: Lightbulb, tone: "neutral" },
  "aguardando-confirmacao": { icon: CircleHelp, tone: "warn" },
  "depende-acesso": { icon: KeyRound, tone: "info" },
  "depende-autorizacao": { icon: Lock, tone: "brand" },
  realizada: { icon: CheckCircle2, tone: "good" },
};

export function ActionStateChip({ state }: { state: ActionState }) {
  const a = actionIcons[state];
  return (
    <Chip icon={a.icon} tone={a.tone}>
      {actionStateLabels[state]}
    </Chip>
  );
}

export function ConceptChip({ children }: { children: ReactNode }) {
  return (
    <Chip icon={FlaskConical} tone="brand">
      {children}
    </Chip>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "section";
}) {
  return (
    <Tag className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      {children}
    </Tag>
  );
}

export function AreaSection({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  const id = `sec-${title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="mt-10 first:mt-0">
      <h2 id={id} className="text-lg font-semibold text-foreground">
        {title}
      </h2>
      {intro && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{intro}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ExternalSource({ link }: { link: SourceLink }) {
  const href = safeHttpUrl(link.url);
  if (!href) return <span>{link.label}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent underline underline-offset-4"
    >
      {link.label}
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}

/**
 * Botão de ação que existe só na versão operacional. Não muda nenhum dado:
 * mostra apenas o aviso de que a ação exige implantação.
 */
export function OperationalOnlyButton({
  label,
  variant = "outline",
}: {
  label: string;
  variant?: "solid" | "outline";
}) {
  const [shown, setShown] = useState(false);
  const noteId = `op-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        aria-describedby={noteId}
        data-demo-action="operational-only"
        onClick={() => setShown(true)}
        className={`tap inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
          variant === "solid"
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-card text-foreground"
        }`}
      >
        <Lock aria-hidden="true" className="h-4 w-4" />
        {label}
      </button>
      <span
        id={noteId}
        role={shown ? "status" : undefined}
        className={`text-xs ${shown ? "font-semibold text-primary" : "text-muted-foreground"}`}
      >
        {shown ? `${label}: ${demoCopy.operationalOnly}` : "Ação demonstrativa"}
      </span>
    </span>
  );
}
