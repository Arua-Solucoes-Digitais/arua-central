// Tlim © Aruá Soluções Digitais · desenvolvido por CjotaDEV7.
// Cardápio online do restaurante, como o cliente vê. O pedido enviado aqui chega na central de
// pedidos do gestor (mesma sessão da página). Nada é salvo, cobrado nem enviado.
import { Link } from "@tanstack/react-router";
import { CheckCircle2, CupSoda, Minus, Plus, Sandwich, ShoppingBag, Soup } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { Reveal, RevealItem, RevealList } from "@/components/site/Motion";
import { formatBRL, paymentLabels } from "@/content/demos";
import type { ClientDemo, OrderMode, Payment } from "@/content/demos/types";
import { DemoFrame } from "./DemoShell";
import { totalOf, useTlim } from "./tlim-store";

const categoryIcons: Record<string, typeof Sandwich> = {
  Lanches: Sandwich,
  Espaguetes: Soup,
  Bebidas: CupSoda,
};

const field =
  "mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

export function TlimStorefront({ demo }: { demo: ClientDemo }) {
  const { state, dispatch } = useTlim();
  const id = useId();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [mode, setMode] = useState<OrderMode>("entrega");
  const [payment, setPayment] = useState<Payment>("pix");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [placedId, setPlacedId] = useState<number | null>(null);

  const lines = useMemo(
    () =>
      demo.menu.items
        .filter((i) => (cart[i.id] ?? 0) > 0 && !state.soldOut[i.id])
        .map((i) => ({
          itemId: i.id,
          name: i.name,
          qty: cart[i.id] ?? 0,
          priceCents: i.priceCents,
        })),
    [cart, demo.menu.items, state.soldOut],
  );
  const total = totalOf(lines);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  const change = (itemId: string, delta: number) =>
    setCart((c) => ({ ...c, [itemId]: Math.max(0, Math.min(20, (c[itemId] ?? 0) + delta)) }));

  function placeOrder() {
    if (count === 0) return setError("Adicione pelo menos um item.");
    if (!name.trim()) return setError("Informe seu nome para o pedido.");
    setError("");
    const nextId = Math.max(0, ...state.orders.map((o) => o.id)) + 1;
    dispatch({
      type: "placeOrder",
      input: { customerName: name, cart, mode, payment, note },
      menu: demo.menu.items,
    });
    setPlacedId(nextId);
    setCart({});
    setNote("");
  }

  if (placedId !== null) {
    return (
      <DemoFrame demo={demo}>
        <main id="conteudo" className="mx-auto max-w-xl px-4 py-16 text-center md:py-24">
          <Reveal onMount>
            <CheckCircle2 aria-hidden="true" className="mx-auto h-14 w-14 text-accent" />
            <h1 className="mt-4 text-3xl font-semibold text-foreground">
              Pedido #{placedId} recebido!
            </h1>
            <p className="mt-3 text-muted-foreground">
              Na vida real, o restaurante já estaria vendo seu pedido. Aqui também: ele acabou de
              chegar na central do gestor.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/demonstracoes/$client/$area"
                params={{ client: demo.slug, area: "pedidos" }}
                className="tap inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
              >
                Ver o pedido na central
              </Link>
              <button
                type="button"
                onClick={() => setPlacedId(null)}
                className="tap inline-flex min-h-12 items-center rounded-full border border-border bg-card px-6 py-3 font-semibold text-foreground"
              >
                Fazer outro pedido
              </button>
            </div>
          </Reveal>
        </main>
      </DemoFrame>
    );
  }

  return (
    <DemoFrame demo={demo}>
      <main id="conteudo">
        <section className="bg-primary text-primary-foreground">
          <Reveal onMount className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-10 md:py-14">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground font-display text-2xl font-bold text-primary">
              {demo.business.initials}
            </span>
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">{demo.business.name}</h1>
              <p className="mt-1 opacity-85">{demo.business.tagline}</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#7CF29C]" aria-hidden="true" />
                Aberto agora · entrega e retirada
              </p>
            </div>
          </Reveal>
        </section>

        <div className="mx-auto grid grid-cols-1 max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <nav
              aria-label="Categorias"
              className="sticky top-0 z-10 -mx-4 bg-background/90 px-4 py-3 backdrop-blur"
            >
              <ul className="flex gap-2 overflow-x-auto">
                {demo.menu.categories.map((cat) => (
                  <li key={cat} className="shrink-0">
                    <a
                      href={`#cat-${cat}`}
                      className="tap inline-flex min-h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:border-primary/40"
                    >
                      {cat}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {demo.menu.categories.map((cat) => {
              const Icon = categoryIcons[cat] ?? Sandwich;
              return (
                <section
                  key={cat}
                  id={`cat-${cat}`}
                  aria-labelledby={`h-${cat}`}
                  className="scroll-mt-16 pt-6"
                >
                  <h2 id={`h-${cat}`} className="mb-4 text-xl font-semibold text-foreground">
                    {cat}
                  </h2>
                  <RevealList className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {demo.menu.items
                      .filter((i) => i.category === cat)
                      .map((item) => {
                        const soldOut = Boolean(state.soldOut[item.id]);
                        const qty = cart[item.id] ?? 0;
                        return (
                          <RevealItem
                            key={item.id}
                            className={`flex gap-4 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md ${soldOut ? "opacity-60" : ""}`}
                          >
                            <span
                              aria-hidden="true"
                              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"
                            >
                              <Icon className="h-7 w-7" />
                            </span>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <h3 className="font-semibold text-foreground">{item.name}</h3>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                                <span className="font-semibold text-foreground">
                                  {formatBRL(item.priceCents)}
                                </span>
                                {soldOut ? (
                                  <span className="text-sm font-semibold text-muted-foreground">
                                    Esgotado
                                  </span>
                                ) : qty === 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => change(item.id, 1)}
                                    aria-label={`Adicionar ${item.name}`}
                                    className="tap inline-flex min-h-10 items-center gap-1 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
                                  >
                                    <Plus aria-hidden="true" className="h-4 w-4" />
                                    Adicionar
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-border">
                                    <button
                                      type="button"
                                      onClick={() => change(item.id, -1)}
                                      aria-label={`Tirar um ${item.name}`}
                                      className="tap flex h-10 w-10 items-center justify-center rounded-full"
                                    >
                                      <Minus aria-hidden="true" className="h-4 w-4" />
                                    </button>
                                    <span
                                      aria-live="polite"
                                      className="w-5 text-center text-sm font-semibold"
                                    >
                                      {qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => change(item.id, 1)}
                                      aria-label={`Mais um ${item.name}`}
                                      className="tap flex h-10 w-10 items-center justify-center rounded-full"
                                    >
                                      <Plus aria-hidden="true" className="h-4 w-4" />
                                    </button>
                                  </span>
                                )}
                              </div>
                            </div>
                          </RevealItem>
                        );
                      })}
                  </RevealList>
                </section>
              );
            })}
            <p className="mt-6 text-xs text-muted-foreground">
              Cardápio e valores de exemplo (simulação). Nada é cobrado.
            </p>
          </div>

          <aside
            id="carrinho"
            aria-labelledby="carrinho-titulo"
            className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-6"
          >
            <h2
              id="carrinho-titulo"
              className="flex items-center gap-2 text-lg font-semibold text-foreground"
            >
              <ShoppingBag aria-hidden="true" className="h-5 w-5 text-primary" />
              Seu pedido
            </h2>
            {lines.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Seu carrinho está vazio.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {lines.map((l) => (
                  <li key={l.itemId} className="flex justify-between gap-2">
                    <span>
                      {l.qty}× {l.name}
                    </span>
                    <span>{formatBRL(l.qty * l.priceCents)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 flex justify-between border-t border-border pt-3 font-semibold text-foreground">
              Total <span>{formatBRL(total)}</span>
            </p>

            <label htmlFor={`${id}-n`} className="mt-4 block text-sm font-semibold text-foreground">
              Seu nome
            </label>
            <input
              id={`${id}-n`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoComplete="off"
              className={field}
            />

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold text-foreground">Como receber</legend>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {(["entrega", "retirada"] as const).map((m) => (
                  <label
                    key={m}
                    className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                  >
                    <input
                      type="radio"
                      name={`${id}-mode`}
                      value={m}
                      checked={mode === m}
                      onChange={() => setMode(m)}
                      className="accent-[var(--primary)]"
                    />
                    {m === "entrega" ? "Entrega" : "Retirada"}
                  </label>
                ))}
              </div>
            </fieldset>

            <label htmlFor={`${id}-p`} className="mt-4 block text-sm font-semibold text-foreground">
              Pagamento
            </label>
            <select
              id={`${id}-p`}
              value={payment}
              onChange={(e) => setPayment(e.target.value as Payment)}
              className={field}
            >
              {(Object.keys(paymentLabels) as Payment[]).map((p) => (
                <option key={p} value={p}>
                  {paymentLabels[p]}
                </option>
              ))}
            </select>

            <label htmlFor={`${id}-o`} className="mt-4 block text-sm font-semibold text-foreground">
              Observações <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              id={`${id}-o`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={200}
              className={field}
              placeholder="Ex.: sem cebola"
            />

            {error && (
              <p role="alert" className="mt-2 text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={placeOrder}
              className="tap mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Enviar pedido · {formatBRL(total)}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Demonstração: nada é cobrado. O pedido vai para a central do gestor.
            </p>
          </aside>
        </div>

        {count > 0 && (
          <a
            href="#carrinho"
            className="tap fixed inset-x-4 bottom-24 z-30 flex min-h-12 items-center justify-between rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-xl lg:hidden"
          >
            <span className="inline-flex items-center gap-2">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary-foreground px-2 text-sm font-bold text-primary">
                {count}
              </span>
              Ver pedido
            </span>
            {formatBRL(total)}
          </a>
        )}
      </main>
    </DemoFrame>
  );
}
