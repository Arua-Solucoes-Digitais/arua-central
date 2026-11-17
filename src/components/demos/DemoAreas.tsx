// Tlim © Aruá Soluções Digitais · desenvolvido por CjotaDEV7.
// As áreas do gestor. Tudo funciona de verdade na tela, mas só na memória da página:
// nada é salvo, enviado ou publicado.
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  ChefHat,
  CheckCircle2,
  Clock,
  ExternalLink,
  Printer,
  Send,
} from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import {
  channelLabels,
  demoAreas,
  formatBRL,
  formatNumber,
  minutesAgoLabel,
  orderModeLabels,
  orderStatusLabels,
  paymentLabels,
} from "@/content/demos";
import type { ClientDemo, DemoArea, OrderStatus, PostFormat } from "@/content/demos/types";
import { ApprovalSimulator } from "./ApprovalSimulator";
import { AreaSection, Card, CertaintyChip, Chip, NatureChip } from "./DemoUi";
import {
  customersIn,
  NEXT_STATUS,
  segmentOf,
  useTlim,
  type Order,
  type Segment,
} from "./tlim-store";

type AreaProps = { demo: ClientDemo };

const SIMULATION = "Simulação: nada é salvo, enviado ou publicado.";

const btnPrimary =
  "tap inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "tap inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/40";
const field =
  "mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

function Kpi({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card as="li">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

function SimulationNote({ children = SIMULATION }: { children?: ReactNode }) {
  return <p className="mt-3 text-xs text-muted-foreground">{children}</p>;
}

function AreaLink({ demo, area, children }: AreaProps & { area: DemoArea; children: ReactNode }) {
  return (
    <Link
      to="/demonstracoes/$client/$area"
      params={{ client: demo.slug, area }}
      className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-4"
    >
      {children}
      <ArrowRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  );
}

/* ------------------------------ Visão geral ------------------------------ */

function Overview({ demo }: AreaProps) {
  const { state } = useTlim();
  const open = state.orders.filter((o) => o.status !== "concluido");
  const revenue = state.orders.reduce((s, o) => s + o.totalCents, 0);
  const ticket = state.orders.length ? Math.round(revenue / state.orders.length) : 0;
  return (
    <>
      <AreaSection title="Hoje" intro="Pedidos e vendas do dia (simulação).">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Pedidos" value={formatNumber(state.orders.length)} />
          <Kpi
            label="Em andamento"
            value={formatNumber(open.length)}
            hint="Novos, em preparo e a caminho"
          />
          <Kpi label="Vendas" value={formatBRL(revenue)} />
          <Kpi label="Ticket médio" value={formatBRL(ticket)} />
        </ul>
      </AreaSection>

      <AreaSection title="Reputação" intro={demo.indicatorsNote}>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {demo.indicators.map((i) => (
            <Card as="li" key={i.id}>
              <NatureChip nature={i.nature} />
              <p className="mt-3 font-display text-3xl font-bold text-foreground">
                {formatNumber(i.value, i.decimals ?? 0)}
              </p>
              <p className="text-sm font-semibold text-foreground">{i.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{i.explain}</p>
            </Card>
          ))}
        </ul>
      </AreaSection>

      <AreaSection title="Atalhos">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {demoAreas
            .filter((a) => a.id !== "visao-geral")
            .map((a) => (
              <li key={a.id}>
                <Link
                  to="/demonstracoes/$client/$area"
                  params={{ client: demo.slug, area: a.id }}
                  className="flex min-h-12 items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 font-semibold text-foreground transition-colors hover:border-primary/40"
                >
                  {a.label}
                  <ArrowRight aria-hidden="true" className="h-4 w-4 text-primary" />
                </Link>
              </li>
            ))}
        </ul>
      </AreaSection>
    </>
  );
}

/* -------------------------------- Pedidos -------------------------------- */

const columns: OrderStatus[] = ["novo", "preparo", "saiu", "concluido"];
const advanceLabel: Record<OrderStatus, string> = {
  novo: "Aceitar e imprimir",
  preparo: "Pronto",
  saiu: "Concluir",
  concluido: "",
};

function Ticket({ order, business }: { order: Order; business: string }) {
  return (
    <div
      aria-label={`Comanda do pedido ${order.id}`}
      className="mt-3 rounded-lg border border-dashed border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground"
    >
      <p className="text-center font-bold">{business.toUpperCase()}</p>
      <p className="text-center">
        PEDIDO #{order.id} · {orderModeLabels[order.mode].toUpperCase()}
      </p>
      <p className="my-1 border-t border-dashed border-border" />
      {order.lines.map((l) => (
        <p key={l.itemId}>
          {l.qty}× {l.name}
        </p>
      ))}
      {order.note && <p className="mt-1">OBS: {order.note}</p>}
      <p className="my-1 border-t border-dashed border-border" />
      <p>
        {paymentLabels[order.payment]} · {formatBRL(order.totalCents)}
      </p>
      <p>Cliente: {order.customerName}</p>
    </div>
  );
}

function Orders({ demo }: AreaProps) {
  const { state, dispatch } = useTlim();
  const [printed, setPrinted] = useState<number[]>([]);

  function advance(order: Order) {
    if (order.status === "novo") setPrinted((p) => [...p, order.id]);
    dispatch({ type: "advance", id: order.id });
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-muted-foreground">
          Todo pedido do cardápio online chega aqui. Faça um pedido como cliente e veja ele aparecer
          em “Novos”.
        </p>
        <Link
          to="/demonstracoes/$client/loja"
          params={{ client: demo.slug }}
          className={btnPrimary}
        >
          Abrir o cardápio online
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((status) => {
          const list = state.orders.filter((o) => o.status === status);
          return (
            <section
              key={status}
              aria-labelledby={`col-${status}`}
              className="rounded-2xl border border-border bg-secondary/40 p-3"
            >
              <h2
                id={`col-${status}`}
                className="flex items-center justify-between px-1 text-sm font-semibold text-foreground"
              >
                {orderStatusLabels[status]}
                <span className="rounded-full bg-card px-2 py-0.5 text-xs">{list.length}</span>
              </h2>
              <ul className="mt-3 space-y-3">
                {list.map((o) => (
                  <li
                    key={o.id}
                    className={`rounded-xl border bg-card p-3 text-sm shadow-sm ${o.fromVisitor ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">
                        #{o.id} · {o.customerName}
                      </p>
                      <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <Clock aria-hidden="true" className="h-3.5 w-3.5" />
                        {minutesAgoLabel(o.minutesAgo)}
                      </span>
                    </div>
                    {o.fromVisitor && (
                      <p className="mt-1 text-xs font-semibold text-primary">Seu pedido de teste</p>
                    )}
                    <p className="mt-1 text-muted-foreground">
                      {o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {orderModeLabels[o.mode]} · {paymentLabels[o.payment]} ·{" "}
                      <span className="font-semibold text-foreground">
                        {formatBRL(o.totalCents)}
                      </span>
                    </p>
                    {printed.includes(o.id) && o.status !== "concluido" && (
                      <>
                        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                          <Printer aria-hidden="true" className="h-3.5 w-3.5" />
                          Comanda enviada à cozinha
                        </p>
                        <Ticket order={o} business={demo.business.name} />
                      </>
                    )}
                    {NEXT_STATUS[o.status] && (
                      <button
                        type="button"
                        onClick={() => advance(o)}
                        aria-label={`${advanceLabel[o.status]}: pedido ${o.id}`}
                        className={`${btnPrimary} mt-3 w-full`}
                      >
                        {o.status === "novo" ? (
                          <Printer aria-hidden="true" className="h-4 w-4" />
                        ) : o.status === "preparo" ? (
                          <ChefHat aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
                        )}
                        {advanceLabel[o.status]}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <SimulationNote>
        Simulação: na versão real, a comanda sai na impressora da cozinha e do balcão.
      </SimulationNote>
    </>
  );
}

/* -------------------------------- Cardápio ------------------------------- */

function Menu({ demo }: AreaProps) {
  const { state, dispatch } = useTlim();
  return (
    <>
      <Card className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-foreground">Link do cardápio online</p>
          <p className="text-sm text-muted-foreground">
            Vai na bio do Instagram, no Google e nas mensagens do WhatsApp.
          </p>
        </div>
        <Link
          to="/demonstracoes/$client/loja"
          params={{ client: demo.slug }}
          className={btnPrimary}
        >
          Ver como o cliente vê
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </Link>
      </Card>
      {demo.menu.categories.map((cat) => (
        <AreaSection key={cat} title={cat}>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {demo.menu.items
              .filter((i) => i.category === cat)
              .map((item) => {
                const soldOut = Boolean(state.soldOut[item.id]);
                return (
                  <Card as="li" key={item.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatBRL(item.priceCents)}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!soldOut}
                      aria-label={`${item.name} disponível no cardápio`}
                      onClick={() => dispatch({ type: "toggleSoldOut", itemId: item.id })}
                      className={`tap inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 text-sm font-semibold ${soldOut ? "bg-secondary text-muted-foreground" : "bg-accent/15 text-accent"}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 rounded-full ${soldOut ? "bg-muted-foreground" : "bg-accent"}`}
                      />
                      <span aria-hidden="true">{soldOut ? "Esgotado" : "Disponível"}</span>
                    </button>
                  </Card>
                );
              })}
          </ul>
        </AreaSection>
      ))}
      <SimulationNote>
        Itens e valores de exemplo. Marque um item como esgotado e ele sai do cardápio online na
        hora.
      </SimulationNote>
    </>
  );
}

/* ---------------------------------- CRM ---------------------------------- */

const segmentLabels: Record<Segment, string> = {
  todos: "Todos",
  novos: "Novos",
  recorrentes: "Recorrentes",
  inativos: "Inativos (+30 dias)",
};

function Crm(_: AreaProps) {
  const { state } = useTlim();
  const [segment, setSegment] = useState<Segment>("todos");
  const list = [...customersIn(state.customers, segment)].sort(
    (a, b) => b.spentCents - a.spentCents,
  );
  const funnel = [
    { label: "Pedidos recebidos", value: state.orders.length },
    {
      label: "Aceitos pela cozinha",
      value: state.orders.filter((o) => o.status !== "novo").length,
    },
    { label: "Concluídos", value: state.orders.filter((o) => o.status === "concluido").length },
  ];
  const max = Math.max(1, ...funnel.map((f) => f.value));
  return (
    <>
      <AreaSection title="Funil de vendas de hoje">
        <ol className="space-y-3">
          {funnel.map((f) => (
            <li key={f.label}>
              <div className="flex justify-between text-sm">
                <span className="text-foreground">{f.label}</span>
                <span className="font-semibold text-foreground">{f.value}</span>
              </div>
              <div
                aria-hidden="true"
                className="mt-1 h-2.5 overflow-hidden rounded-full bg-secondary"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
                  style={{ width: `${(f.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      </AreaSection>

      <AreaSection title="Clientes" intro="Cada cliente com histórico, total gasto e grupo.">
        <div role="group" aria-label="Filtrar por grupo" className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(segmentLabels) as Segment[]).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={segment === s}
              onClick={() => setSegment(s)}
              className="tap min-h-10 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {segmentLabels[s]} ({customersIn(state.customers, s).length})
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[560px] text-sm">
            <caption className="sr-only">Clientes do grupo {segmentLabels[segment]}</caption>
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th scope="col" className="p-3 font-semibold">
                  Cliente
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Grupo
                </th>
                <th scope="col" className="p-3 text-right font-semibold">
                  Pedidos
                </th>
                <th scope="col" className="p-3 text-right font-semibold">
                  Total gasto
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Último pedido
                </th>
                <th scope="col" className="p-3 font-semibold">
                  Origem
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <th scope="row" className="p-3 text-left font-semibold text-foreground">
                    {c.name}
                  </th>
                  <td className="p-3">{segmentLabels[segmentOf(c)]}</td>
                  <td className="p-3 text-right">{c.orders}</td>
                  <td className="p-3 text-right">{formatBRL(c.spentCents)}</td>
                  <td className="p-3">
                    {c.lastOrderDays === 0 ? "hoje" : `há ${c.lastOrderDays} dias`}
                  </td>
                  <td className="p-3">{channelLabels[c.channel]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SimulationNote>Clientes e valores de exemplo (simulação).</SimulationNote>
      </AreaSection>
    </>
  );
}

/* -------------------------------- WhatsApp ------------------------------- */

function Whatsapp({ demo }: AreaProps) {
  const { state, dispatch } = useTlim();
  const [segment, setSegment] = useState<Segment>("inativos");
  const [text, setText] = useState(demo.templates[1]?.text ?? "");
  const [error, setError] = useState("");
  const id = useId();
  const recipients = customersIn(state.customers, segment);
  const preview = text.replaceAll("{nome}", recipients[0]?.name ?? "Ana");

  function send() {
    if (!text.trim()) return setError("Escreva a mensagem antes de disparar.");
    if (recipients.length === 0) return setError("Nenhum cliente neste grupo.");
    setError("");
    dispatch({ type: "broadcast", segment, text });
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Card>
          <label htmlFor={`${id}-seg`} className="text-sm font-semibold text-foreground">
            Para quem
          </label>
          <select
            id={`${id}-seg`}
            value={segment}
            onChange={(e) => setSegment(e.target.value as Segment)}
            className={field}
          >
            {(Object.keys(segmentLabels) as Segment[]).map((s) => (
              <option key={s} value={s}>
                {segmentLabels[s]} · {customersIn(state.customers, s).length} clientes
              </option>
            ))}
          </select>

          <p className="mt-4 text-sm font-semibold text-foreground">Modelos</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {demo.templates.map((t) => (
              <button key={t.id} type="button" onClick={() => setText(t.text)} className={btnGhost}>
                {t.label}
              </button>
            ))}
          </div>

          <label htmlFor={`${id}-msg`} className="mt-4 block text-sm font-semibold text-foreground">
            Mensagem{" "}
            <span className="font-normal text-muted-foreground">
              ({"{nome}"} vira o nome do cliente)
            </span>
          </label>
          <textarea
            id={`${id}-msg`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            maxLength={600}
            className={field}
          />
          {error && (
            <p role="alert" className="mt-1 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <button type="button" onClick={send} className={`${btnPrimary} mt-4`}>
            <Send aria-hidden="true" className="h-4 w-4" />
            Disparar para {recipients.length} clientes
          </button>
          <SimulationNote>
            Simulação: nada é enviado. Na versão real, a API oficial do WhatsApp Business manda só
            para quem aceitou receber mensagens.
          </SimulationNote>
        </Card>

        <div className="rounded-3xl bg-[#e7ddd3] p-4">
          <p className="text-center text-xs text-[#54656f]">Prévia</p>
          <div className="mt-3 max-w-[85%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm text-[#111b21] shadow">
            <p className="text-xs font-semibold text-[#00a884]">{demo.business.name}</p>
            <p className="mt-1 whitespace-pre-line">{preview || "…"}</p>
          </div>
        </div>
      </div>

      {state.broadcasts.length > 0 && (
        <AreaSection title="Disparos feitos nesta visita">
          <ul aria-live="polite" className="space-y-3">
            {state.broadcasts.map((b) => (
              <Card as="li" key={b.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip icon={CheckCircle2} tone="good">
                    Disparado (simulação)
                  </Chip>
                  <span className="text-sm text-muted-foreground">
                    {segmentLabels[b.segment]} · {b.recipients} clientes
                  </span>
                </div>
                <p className="mt-2 text-sm text-foreground">{b.text}</p>
              </Card>
            ))}
          </ul>
        </AreaSection>
      )}
    </>
  );
}

/* -------------------------------- Instagram ------------------------------ */

const dayLabel = (offset: number) =>
  offset === 0 ? "Hoje" : offset === 1 ? "Amanhã" : `Em ${offset} dias`;

function InstagramArea({ demo }: AreaProps) {
  const { state, dispatch } = useTlim();
  const id = useId();
  const [format, setFormat] = useState<PostFormat>("Post");
  const [dayOffset, setDayOffset] = useState(3);
  const [time, setTime] = useState("19:00");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");

  function schedule() {
    if (!title.trim() || !caption.trim()) {
      return setError("Preencha o título e a legenda para agendar.");
    }
    setError("");
    dispatch({ type: "schedulePost", post: { format, dayOffset, time, title, caption } });
    setTitle("");
    setCaption("");
  }

  const posts = [...state.posts].sort(
    (a, b) => a.dayOffset - b.dayOffset || a.time.localeCompare(b.time),
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <AreaSection title="Agenda da semana">
        <ol aria-live="polite" className="space-y-3">
          {posts.map((p) => (
            <Card as="li" key={p.id} className="flex gap-4">
              <div className="w-20 shrink-0 text-center">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {dayLabel(p.dayOffset)}
                </p>
                <p className="font-display text-xl font-bold text-foreground">{p.time}</p>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip icon={CalendarClock} tone="brand">
                    {p.format} · agendado
                  </Chip>
                </div>
                <p className="mt-2 font-semibold text-foreground">{p.title}</p>
                <p className="text-sm text-muted-foreground">{p.caption}</p>
              </div>
            </Card>
          ))}
        </ol>
      </AreaSection>

      <AreaSection title="Agendar publicação">
        <Card>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor={`${id}-f`} className="text-sm font-semibold text-foreground">
                Formato
              </label>
              <select
                id={`${id}-f`}
                value={format}
                onChange={(e) => setFormat(e.target.value as PostFormat)}
                className={field}
              >
                {(["Post", "Reels", "Stories"] as const).map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-d`} className="text-sm font-semibold text-foreground">
                Dia
              </label>
              <select
                id={`${id}-d`}
                value={dayOffset}
                onChange={(e) => setDayOffset(Number(e.target.value))}
                className={field}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                  <option key={d} value={d}>
                    {dayLabel(d)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-t`} className="text-sm font-semibold text-foreground">
                Horário
              </label>
              <select
                id={`${id}-t`}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={field}
              >
                {["11:30", "12:00", "18:00", "18:30", "19:00", "20:00"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <label htmlFor={`${id}-ti`} className="mt-3 block text-sm font-semibold text-foreground">
            Título
          </label>
          <input
            id={`${id}-ti`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            className={field}
            placeholder="Ex.: Promoção de quarta"
          />
          <label htmlFor={`${id}-c`} className="mt-3 block text-sm font-semibold text-foreground">
            Legenda
          </label>
          <textarea
            id={`${id}-c`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            maxLength={500}
            className={field}
          />
          {error && (
            <p role="alert" className="mt-1 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          <button type="button" onClick={schedule} className={`${btnPrimary} mt-4`}>
            <CalendarClock aria-hidden="true" className="h-4 w-4" />
            Agendar
          </button>
          <SimulationNote>
            Simulação: nada é publicado. Na versão real, cada post passa por{" "}
            <AreaLink demo={demo} area="aprovacoes">
              Aprovações
            </AreaLink>{" "}
            antes de ir ao ar.
          </SimulationNote>
        </Card>
      </AreaSection>
    </div>
  );
}

/* -------------------------------- Pesquisas ------------------------------ */

// Resumo ilustrativo das respostas, mostrado só depois do envio simulado.
const SAMPLE_RESULTS = [
  { label: "Ótima", pct: 62 },
  { label: "Boa", pct: 28 },
  { label: "Regular", pct: 8 },
  { label: "Ruim", pct: 2 },
];

function Surveys({ demo }: AreaProps) {
  const { state, dispatch } = useTlim();
  const recent = state.customers.filter((c) => c.lastOrderDays <= 7);
  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <AreaSection title="A pesquisa" intro={demo.survey.privacy}>
          <ol className="space-y-3">
            {demo.survey.questions.map((q, i) => (
              <Card as="li" key={q.question}>
                <p className="text-xs font-semibold text-muted-foreground">Pergunta {i + 1}</p>
                <p className="mt-1 font-semibold text-foreground">{q.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">{q.options.join(" · ")}</p>
              </Card>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => dispatch({ type: "sendSurvey", recipients: recent.length })}
            disabled={state.surveysSent > 0}
            className={`${btnPrimary} mt-4`}
          >
            <Send aria-hidden="true" className="h-4 w-4" />
            {state.surveysSent > 0
              ? `Enviada para ${state.surveysSent} clientes`
              : `Enviar para quem pediu nos últimos 7 dias (${recent.length})`}
          </button>
          <SimulationNote />
        </AreaSection>

        <AreaSection title="Respostas">
          {state.surveysSent === 0 ? (
            <Card className="border-dashed text-sm text-muted-foreground">
              Envie a pesquisa para ver o resumo das respostas.
            </Card>
          ) : (
            <Card aria-live="polite">
              <NatureChip nature="simulacao" />
              <p className="mt-3 font-semibold text-foreground">
                Como foi sua experiência com nosso atendimento?
              </p>
              <ul className="mt-3 space-y-2">
                {SAMPLE_RESULTS.map((r) => (
                  <li key={r.label}>
                    <div className="flex justify-between text-sm">
                      <span>{r.label}</span>
                      <span className="font-semibold">{r.pct}%</span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="mt-1 h-2 overflow-hidden rounded-full bg-secondary"
                    >
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Tema mais citado em “o que melhorar”: tempo de entrega no horário de pico.
              </p>
            </Card>
          )}
        </AreaSection>
      </div>

      <AreaSection
        title="Regras das avaliações no Google"
        intro="Para respeitar as políticas do Google e a confiança de quem pesquisa o restaurante."
      >
        <ul className="grid gap-2">
          {demo.reviewRules.map((rule) => (
            <li
              key={rule}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
            >
              {rule}
            </li>
          ))}
        </ul>
      </AreaSection>
    </>
  );
}

/* ------------------------------- Aprovações ------------------------------ */

function Approvals({ demo }: AreaProps) {
  const a = demo.approvals;
  return (
    <>
      <p className="max-w-3xl text-foreground">{a.intro}</p>
      <AreaSection title="Fluxo de aprovação">
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {a.steps.map((s, i) => (
            <Card as="li" key={s.title}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
            </Card>
          ))}
        </ol>
      </AreaSection>
      <AreaSection
        title="Teste o fluxo de aprovação"
        intro="Aprove, peça ajustes ou comente, e veja o histórico se formar."
      >
        <ApprovalSimulator material={a.sample} />
      </AreaSection>
    </>
  );
}

/* ---------------------------- Ponto de partida --------------------------- */

function StartingPoint({ demo }: AreaProps) {
  const label = (area: DemoArea) => demoAreas.find((x) => x.id === area)?.label ?? area;
  return (
    <>
      <Card className="border-highlight/60 text-sm text-foreground">{demo.business.basis}</Card>

      <AreaSection title="Pontos fortes">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {demo.strengths.map((s) => (
            <Card as="li" key={s.title}>
              <h3 className="font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </Card>
          ))}
        </ul>
      </AreaSection>

      <AreaSection
        title="Oportunidades e onde o Tlim ajuda"
        intro="Hipóteses e pendências estão marcadas como tal."
      >
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {demo.opportunities.map((o) => (
            <Card as="li" key={o.title} className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <CertaintyChip certainty={o.certainty} />
                <span className="text-xs text-muted-foreground">{o.channel}</span>
              </div>
              <h3 className="mt-2 font-semibold text-foreground">{o.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{o.description}</p>
              <p className="mt-3 text-sm">
                <AreaLink demo={demo} area={o.solvedBy}>
                  Resolve: {label(o.solvedBy)}
                </AreaLink>
              </p>
            </Card>
          ))}
        </ul>
      </AreaSection>
    </>
  );
}

const views: Record<DemoArea, (props: AreaProps) => ReactNode> = {
  "visao-geral": Overview,
  pedidos: Orders,
  cardapio: Menu,
  crm: Crm,
  whatsapp: Whatsapp,
  instagram: InstagramArea,
  pesquisas: Surveys,
  aprovacoes: Approvals,
  "ponto-de-partida": StartingPoint,
};

export function AreaView({ demo, area }: { demo: ClientDemo; area: DemoArea }) {
  const View = views[area];
  return <View demo={demo} />;
}
