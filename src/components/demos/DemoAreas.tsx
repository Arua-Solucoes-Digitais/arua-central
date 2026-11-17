// As nove áreas do painel. Recebem só os dados do cliente: nenhuma área busca,
// grava ou envia nada.
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, FileSearch, MapPin, Quote } from "lucide-react";
import type { ReactNode } from "react";
import { CONCEPT_LABEL, formatDate, formatNumber, natureLabels } from "@/content/demos";
import type { ActionState, ClientDemo, DemoArea, Indicator } from "@/content/demos/types";
import {
  ActionStateChip,
  ActivityStatusChip,
  AreaSection,
  Card,
  CertaintyChip,
  ConceptChip,
  ExternalSource,
  NatureChip,
  OperationalOnlyButton,
} from "./DemoUi";

type AreaProps = { demo: ClientDemo };

function realIndicators(demo: ClientDemo) {
  return demo.indicators.filter(
    (i): i is Indicator & { value: number; referenceDate: string } =>
      i.value !== null && i.referenceDate !== null,
  );
}

function IndicatorValue({ value, decimals }: { value: number; decimals?: number | undefined }) {
  return (
    <span className="font-display text-3xl font-bold text-foreground">
      {formatNumber(value, decimals ?? 0)}
    </span>
  );
}

function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const available = indicator.value !== null && indicator.referenceDate !== null;
  return (
    <Card as="li" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {indicator.channel}
        </span>
        {indicator.nature ? (
          <NatureChip nature={indicator.nature} />
        ) : (
          <span className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            Ainda não disponível
          </span>
        )}
      </div>
      <h3 className="font-semibold text-foreground">{indicator.label}</h3>
      {available && indicator.value !== null ? (
        <IndicatorValue value={indicator.value} decimals={indicator.decimals} />
      ) : (
        <span
          className="font-display text-3xl font-bold text-muted-foreground"
          aria-label="Sem valor"
        >
          —
        </span>
      )}
      <p className="text-sm text-muted-foreground">{indicator.explain}</p>
      <dl className="mt-auto grid gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex gap-1">
          <dt className="font-semibold text-foreground">Data de referência:</dt>
          <dd>{indicator.referenceDate ? formatDate(indicator.referenceDate) : "—"}</dd>
        </div>
        <div className="flex flex-wrap gap-1">
          <dt className="font-semibold text-foreground">Fonte:</dt>
          <dd>{indicator.source}</dd>
        </div>
        {indicator.unavailableReason && (
          <div className="flex flex-wrap gap-1">
            <dt className="font-semibold text-foreground">Situação:</dt>
            <dd>{indicator.unavailableReason}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}

function RatingMeter({ value, date }: { value: number; date: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <figure className="mt-4">
      <div
        role="img"
        aria-label={`Nota ${formatNumber(value, 1)} de 5 no Google em ${formatDate(date)}`}
        className="h-3 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <figcaption className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>
          Nota {formatNumber(value, 1)} de 5 · {formatDate(date)}
        </span>
        <span>5</span>
      </figcaption>
    </figure>
  );
}

function AreaLink({
  demo,
  area,
  children,
}: {
  demo: ClientDemo;
  area: DemoArea;
  children: ReactNode;
}) {
  return (
    <Link
      to="/demonstracoes/$client/$area"
      params={{ client: demo.slug, area }}
      className="inline-flex items-center gap-1 text-sm font-semibold text-accent underline underline-offset-4"
    >
      {children}
      <ArrowRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  );
}

/* ------------------------------ Visão geral ------------------------------ */

function Overview({ demo }: AreaProps) {
  const reals = realIndicators(demo);
  const opportunities = demo.diagnosis.opportunities.filter((o) => o.certainty === "verificado");
  const pending = demo.nextActions.filter((a) => a.state !== "realizada").slice(0, 4);
  const inProgress = demo.activities.filter((a) => a.status === "andamento").length;
  const planned = demo.activities.filter((a) => a.status === "planejado").length;

  return (
    <>
      <AreaSection title="Identificação do negócio">
        <Card className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="font-display text-xl font-semibold text-foreground">
              {demo.business.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {demo.business.segment} · {demo.business.instagramHandle}
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm text-foreground">
              <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {demo.business.location}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{demo.business.addressNote}</p>
          </div>
          <ul className="grid content-start gap-2 text-sm">
            {demo.business.links.map((l) => (
              <li key={l.url}>
                <ExternalSource link={l} />
                {l.note && <span className="block text-xs text-muted-foreground">{l.note}</span>}
              </li>
            ))}
          </ul>
        </Card>
      </AreaSection>

      <AreaSection
        title="Situação documentada do projeto"
        intro={`Registrada em ${formatDate(demo.diagnosis.projectStatusDate)}.`}
      >
        <Card className="border-highlight/60">
          <p className="font-semibold text-foreground">{demo.diagnosis.projectStatus}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Plano de 2 meses: {inProgress} atividade em andamento e {planned} planejadas. Nenhuma
            concluída.
          </p>
        </Card>
      </AreaSection>

      <AreaSection
        title="Marco inicial dos indicadores"
        intro={`Coletados em ${formatDate(demo.diagnosis.date)}, antes de qualquer atividade. São o ponto de partida, não resultados da Aruá nem números atuais.`}
      >
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reals.map((i) => (
            <Card as="li" key={i.id}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {i.label}
              </p>
              <p className="mt-2">
                <IndicatorValue value={i.value} decimals={i.decimals} />
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(i.referenceDate)} · {natureLabels.real.label} · {i.channel}
              </p>
            </Card>
          ))}
        </ul>
      </AreaSection>

      <AreaSection title="Resumo do diagnóstico">
        <p className="max-w-3xl text-foreground">{demo.diagnosis.summary}</p>
      </AreaSection>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <AreaSection title="Principais oportunidades">
          <ul className="grid gap-2">
            {opportunities.slice(0, 5).map((o) => (
              <li key={o.title} className="flex items-start gap-2 text-sm text-foreground">
                <FileSearch aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {o.title}
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <AreaLink demo={demo} area="diagnostico">
              Ver diagnóstico completo
            </AreaLink>
          </div>
        </AreaSection>
        <AreaSection title="Próximas ações">
          <ul className="grid gap-3">
            {pending.map((a) => (
              <li
                key={a.title}
                className="flex flex-wrap items-center gap-2 text-sm text-foreground"
              >
                <ActionStateChip state={a.state} />
                {a.title}
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <AreaLink demo={demo} area="proximas-acoes">
              Ver todas as próximas ações
            </AreaLink>
          </div>
        </AreaSection>
      </div>
    </>
  );
}

/* ------------------------------ Diagnóstico ------------------------------ */

function Diagnosis({ demo }: AreaProps) {
  const d = demo.diagnosis;
  return (
    <>
      <AreaSection title="Fonte" intro={`${d.source} Data do levantamento: ${formatDate(d.date)}.`}>
        <p className="text-sm text-muted-foreground">
          Só entra como fato o que aparece nas capturas. Hipóteses e pendências estão marcadas.
        </p>
      </AreaSection>

      <AreaSection title="Pontos fortes">
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {d.strengths.map((s) => (
            <Card as="li" key={s.title}>
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">Evidência: {s.evidence}</p>
            </Card>
          ))}
        </ul>
      </AreaSection>

      <AreaSection
        title="Oportunidades"
        intro="Cada achado com canal, evidência, grau de certeza e ação possível."
      >
        <ol className="grid gap-4">
          {d.opportunities.map((o, idx) => (
            <Card as="li" key={o.title}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground">
                  <span className="mr-2 text-primary">{String(idx + 1).padStart(2, "0")}</span>
                  {o.title}
                </h3>
                <CertaintyChip certainty={o.certainty} />
              </div>
              <p className="mt-2 text-sm text-foreground">{o.description}</p>
              <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground">Canal</dt>
                  <dd className="text-foreground">{o.channel}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground">
                    Evidência ou fonte
                  </dt>
                  <dd className="text-foreground">{o.evidence}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground">Ação recomendada</dt>
                  <dd className="text-foreground">{o.recommendation}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </ol>
      </AreaSection>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <AreaSection title="Informações que ainda faltam">
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
            {d.missingInfo.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </AreaSection>
        <AreaSection
          title="Publicações de referência"
          intro="Indicadas pelo gestor; datas aproximadas."
        >
          <ul className="grid gap-2 text-sm">
            {d.referenceLinks.map((l) => (
              <li key={l.url}>
                <ExternalSource link={l} />
              </li>
            ))}
          </ul>
        </AreaSection>
      </div>
    </>
  );
}

/* ------------------------------ Atividades ------------------------------ */

function Activities({ demo }: AreaProps) {
  const months = [1, 2] as const;
  return (
    <>
      <p className="max-w-3xl text-sm text-muted-foreground">{demo.activitiesNote}</p>
      {months.map((month) => {
        const goal = demo.strategy.months[month - 1];
        return (
          <AreaSection
            key={month}
            title={goal?.title ?? `Mês ${month}`}
            {...(goal ? { intro: goal.description } : {})}
          >
            <ul className="grid gap-3">
              {demo.activities
                .filter((a) => a.month === month)
                .map((a) => (
                  <Card as="li" key={a.title}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {a.category}
                        </p>
                        <h3 className="font-semibold text-foreground">{a.title}</h3>
                      </div>
                      <ActivityStatusChip status={a.status} />
                    </div>
                    <p className="mt-2 text-sm text-foreground">{a.description}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Objetivo: {a.objective}</p>
                    <div className="mt-3 border-t border-border pt-3 text-xs">
                      <span className="font-semibold text-foreground">Evidências: </span>
                      {a.evidence.length > 0 ? (
                        <span className="text-foreground">{a.evidence.join(" · ")}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          Nenhuma evidência registrada ainda.
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
            </ul>
          </AreaSection>
        );
      })}
      <div className="mt-8 flex flex-wrap gap-3">
        <OperationalOnlyButton label="Registrar atividade" />
        <OperationalOnlyButton label="Anexar evidência" />
      </div>
    </>
  );
}

/* ---------------------------- Presença digital ---------------------------- */

function Presence({ demo }: AreaProps) {
  const reals = realIndicators(demo);
  const unavailable = demo.indicators.filter((i) => i.value === null);
  const rating = reals.find((i) => i.id === "g_rating");
  return (
    <>
      <AreaSection title="Natureza dos dados">
        <ul className="grid gap-3 sm:grid-cols-3">
          {(["real", "estimativa", "simulacao"] as const).map((n) => (
            <Card as="li" key={n} className="flex flex-col gap-2">
              <NatureChip nature={n} />
              <p className="text-sm text-muted-foreground">{natureLabels[n].explain}</p>
              <p className="text-xs text-muted-foreground">
                Nesta área: {demo.indicators.filter((i) => i.nature === n).length} indicador(es).
              </p>
            </Card>
          ))}
        </ul>
      </AreaSection>

      <AreaSection
        title="Marco inicial"
        intro="Valores observados nos perfis públicos. Não são números atuais nem resultados do trabalho."
      >
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reals.map((i) => (
            <IndicatorCard key={i.id} indicator={i} />
          ))}
        </ul>
        {rating && (
          <Card className="mt-4">
            <h3 className="font-semibold text-foreground">Nota no Google na escala de 1 a 5</h3>
            <RatingMeter value={rating.value} date={rating.referenceDate} />
          </Card>
        )}
      </AreaSection>

      <AreaSection
        title="Evolução"
        intro="Ainda não há série histórica: existe uma única medição (o marco inicial). O gráfico de evolução aparece a partir da segunda medição real, feita do mesmo jeito e no mesmo período."
      >
        <Card className="border-dashed text-sm text-muted-foreground">
          <CalendarDays aria-hidden="true" className="mb-2 h-5 w-5 text-accent" />
          Sem gráfico de evolução: nenhum dado foi inventado para preencher a linha do tempo.
        </Card>
      </AreaSection>

      <AreaSection
        title="Indicadores ainda não disponíveis"
        intro="Dependem de acesso aos painéis profissionais. Nenhum valor foi estimado."
      >
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {unavailable.map((i) => (
            <IndicatorCard key={i.id} indicator={i} />
          ))}
        </ul>
      </AreaSection>

      <div className="mt-8">
        <OperationalOnlyButton label="Registrar medição" />
      </div>
    </>
  );
}

/* ------------------------------ Publicações ------------------------------ */

function Publications({ demo }: AreaProps) {
  const p = demo.publications;
  return (
    <>
      <p className="max-w-3xl text-foreground">{p.intro}</p>

      <AreaSection title="Publicações realizadas">
        {p.realPublications.length > 0 ? (
          <ul className="grid gap-3">
            {p.realPublications.map((r) => (
              <Card as="li" key={r.title}>
                <h3 className="font-semibold text-foreground">{r.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(r.date)} · {r.evidence}
                </p>
              </Card>
            ))}
          </ul>
        ) : (
          <Card className="border-dashed text-sm text-muted-foreground">
            {p.noRealPublicationsNote}
          </Card>
        )}
      </AreaSection>

      <AreaSection
        title="Exemplos conceituais"
        intro="Mostram como uma peça é organizada na Central. Não foram aprovados nem publicados e não usam artes ou fotos da loja."
      >
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {p.concepts.map((c) => (
            <Card as="li" key={c.title} className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <ConceptChip>{CONCEPT_LABEL}</ConceptChip>
                <NatureChip nature={c.nature} />
              </div>
              <div
                aria-hidden="true"
                className="flex aspect-4/3 items-center justify-center rounded-xl border border-dashed border-border bg-secondary px-4 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground"
              >
                Espaço da arte · aguardando fotos reais autorizadas
              </div>
              <h3 className="font-semibold text-foreground">{c.title}</h3>
              <dl className="grid gap-1 text-sm">
                <div className="flex flex-wrap gap-1">
                  <dt className="font-semibold text-foreground">Formato:</dt>
                  <dd className="text-muted-foreground">{c.format}</dd>
                </div>
                <div className="flex flex-wrap gap-1">
                  <dt className="font-semibold text-foreground">Canal:</dt>
                  <dd className="text-muted-foreground">{c.channel}</dd>
                </div>
                <div className="flex flex-wrap gap-1">
                  <dt className="font-semibold text-foreground">Objetivo:</dt>
                  <dd className="text-muted-foreground">{c.goal}</dd>
                </div>
              </dl>
              <blockquote className="rounded-xl bg-secondary p-3 text-sm italic text-foreground">
                {c.caption}
              </blockquote>
            </Card>
          ))}
        </ul>
      </AreaSection>

      <AreaSection title="Princípios do calendário">
        <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
          {p.calendarPrinciples.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </AreaSection>

      <div className="mt-8">
        <OperationalOnlyButton label="Registrar publicação" />
      </div>
    </>
  );
}

/* ------------------------------ Aprovações ------------------------------ */

function Approvals({ demo }: AreaProps) {
  const a = demo.approvals;
  return (
    <>
      <p className="max-w-3xl text-foreground">{a.intro}</p>

      <AreaSection title="Fluxo de aprovação">
        <ol className="grid gap-3 md:grid-cols-5">
          {a.steps.map((s, i) => (
            <Card as="li" key={s.title} className="relative">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
            </Card>
          ))}
        </ol>
      </AreaSection>

      <AreaSection title="Aprovações registradas">
        <Card>
          <p className="font-display text-3xl font-bold text-foreground">{a.recordedApprovals}</p>
          <p className="mt-1 text-sm text-muted-foreground">{a.recordedNote}</p>
        </Card>
      </AreaSection>

      <AreaSection
        title="Como um material chega ao proprietário"
        intro="Os botões abaixo não registram nada: aprovar de verdade exige login do proprietário e armazenamento seguro."
      >
        <Card className="max-w-xl">
          <div className="flex flex-wrap gap-2">
            <ConceptChip>{CONCEPT_LABEL}</ConceptChip>
          </div>
          <h3 className="mt-3 font-semibold text-foreground">{a.sample.title}</h3>
          <p className="text-xs text-muted-foreground">Canal: {a.sample.channel}</p>
          <p className="mt-2 text-sm text-foreground">{a.sample.description}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <OperationalOnlyButton label="Aprovar" variant="solid" />
            <OperationalOnlyButton label="Solicitar ajustes" />
          </div>
        </Card>
      </AreaSection>
    </>
  );
}

/* ------------------------- Pesquisas e avaliações ------------------------- */

function Relationship({ demo }: AreaProps) {
  const r = demo.relationship;
  return (
    <>
      <AreaSection
        title="Regras das avaliações no Google"
        intro="Não negociáveis, para respeitar as políticas do Google e a confiança de quem pesquisa a loja."
      >
        <ul className="grid gap-2">
          {r.rules.map((rule) => (
            <li
              key={rule}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
            >
              {rule}
            </li>
          ))}
        </ul>
      </AreaSection>

      <AreaSection title="Pesquisa rápida de satisfação" intro={r.survey.privacy}>
        <ol className="grid gap-3 md:grid-cols-3">
          {r.survey.questions.map((q, i) => (
            <Card as="li" key={q.question}>
              <p className="text-xs font-semibold text-muted-foreground">Pergunta {i + 1}</p>
              <h3 className="mt-1 font-semibold text-foreground">{q.question}</h3>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {q.options.map((o) => (
                  <li
                    key={o}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs text-foreground"
                  >
                    {o}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </ol>
      </AreaSection>

      <AreaSection
        title="Roteiros de mensagem"
        intro="Enviados pela própria loja, sem sugerir nota e sem oferecer vantagem."
      >
        <ul className="grid gap-3 md:grid-cols-3">
          {r.reviewScripts.map((s) => (
            <Card as="li" key={s.heading}>
              <Quote aria-hidden="true" className="h-4 w-4 text-primary" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">{s.heading}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </Card>
          ))}
        </ul>
      </AreaSection>

      <AreaSection title="Respostas registradas">
        <Card className="border-dashed text-sm text-muted-foreground">{r.responsesNote}</Card>
      </AreaSection>
    </>
  );
}

/* ----------------------------- Próximas ações ----------------------------- */

const actionGroups: { state: ActionState; title: string }[] = [
  { state: "aguardando-confirmacao", title: "Aguardando confirmação do proprietário" },
  { state: "depende-acesso", title: "Dependem de acesso" },
  { state: "depende-autorizacao", title: "Dependem de autorização" },
  { state: "proposta", title: "Ações propostas" },
  { state: "realizada", title: "Realizadas (com evidência)" },
];

function NextActions({ demo }: AreaProps) {
  return (
    <>
      {actionGroups.map((g) => {
        const items = demo.nextActions.filter((a) => a.state === g.state);
        if (items.length === 0) return null;
        return (
          <AreaSection key={g.state} title={g.title}>
            <ul className="grid gap-3 md:grid-cols-2">
              {items.map((a) => (
                <Card as="li" key={a.title}>
                  <ActionStateChip state={a.state} />
                  <h3 className="mt-2 font-semibold text-foreground">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{a.detail}</p>
                  {a.evidence && (
                    <p className="mt-2 text-xs text-foreground">
                      <span className="font-semibold">Evidência: </span>
                      {a.evidence}
                    </p>
                  )}
                </Card>
              ))}
            </ul>
          </AreaSection>
        );
      })}
      <AreaSection
        title="Oportunidades para depois do piloto"
        intro="Possibilidades a decidir juntos, com base no que o período mostrar."
      >
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {demo.strategy.continuity.map((c) => (
            <Card as="li" key={c.title}>
              <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            </Card>
          ))}
        </ul>
      </AreaSection>
    </>
  );
}

/* ------------------------- Proposta e estratégia ------------------------- */

function Strategy({ demo }: AreaProps) {
  const s = demo.strategy;
  return (
    <>
      <Card className="border-highlight/60">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Situação da proposta
        </p>
        <p className="mt-1 font-semibold text-foreground">{s.proposalStatus}</p>
      </Card>

      <AreaSection title="Posicionamento">
        <p className="max-w-3xl text-lg text-foreground">{s.positioning}</p>
      </AreaSection>

      <AreaSection title="Cinco pilares do trabalho">
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {s.pillars.map((p, i) => (
            <Card as="li" key={p.title}>
              <span className="font-display text-2xl font-bold text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 font-semibold text-foreground">{p.title}</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {p.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </Card>
          ))}
        </ol>
      </AreaSection>

      <AreaSection title="Plano proposto em dois meses">
        <ol className="grid gap-4 md:grid-cols-2">
          {s.months.map((m) => (
            <Card as="li" key={m.title}>
              <h3 className="font-semibold text-foreground">{m.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
            </Card>
          ))}
        </ol>
      </AreaSection>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <AreaSection title="Como medimos">
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
            {s.measurement.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </AreaSection>
        <AreaSection title="O que fica para a loja">
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
            {s.lasting.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </AreaSection>
      </div>
    </>
  );
}

const views: Record<DemoArea, (props: AreaProps) => ReactNode> = {
  "visao-geral": Overview,
  diagnostico: Diagnosis,
  atividades: Activities,
  "presenca-digital": Presence,
  publicacoes: Publications,
  aprovacoes: Approvals,
  "pesquisas-e-avaliacoes": Relationship,
  "proximas-acoes": NextActions,
  "proposta-e-estrategia": Strategy,
};

export function AreaView({ demo, area }: { demo: ClientDemo; area: DemoArea }) {
  const View = views[area];
  return <View demo={demo} />;
}
