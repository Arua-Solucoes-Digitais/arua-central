// Tlim © Aruá Soluções Digitais · desenvolvido por CjotaDEV7.
// Estado da demonstração: pedidos, clientes, cardápio, disparos, agenda e pesquisas.
// Vive só na memória da página (nada é salvo nem enviado); recarregar recomeça do exemplo.
import { createContext, useContext } from "react";
import type {
  ClientDemo,
  Customer,
  MenuItem,
  OrderMode,
  OrderStatus,
  Payment,
  PostFormat,
} from "@/content/demos/types";

export type OrderLine = { itemId: string; name: string; qty: number; priceCents: number };
export type Order = {
  id: number;
  customerId: string;
  customerName: string;
  lines: OrderLine[];
  totalCents: number;
  status: OrderStatus;
  minutesAgo: number;
  mode: OrderMode;
  payment: Payment;
  note: string;
  /** Feito por quem está visitando a demonstração. */
  fromVisitor: boolean;
};
export type Broadcast = { id: number; segment: Segment; recipients: number; text: string };
export type ScheduledPost = {
  id: string;
  format: PostFormat;
  title: string;
  caption: string;
  dayOffset: number;
  time: string;
};
export type Segment = "todos" | "novos" | "recorrentes" | "inativos";

export type TlimState = {
  orders: Order[];
  customers: Customer[];
  soldOut: Record<string, boolean>;
  broadcasts: Broadcast[];
  posts: ScheduledPost[];
  surveysSent: number;
};

export type PlaceOrderInput = {
  customerName: string;
  cart: Record<string, number>;
  mode: OrderMode;
  payment: Payment;
  note: string;
};

export type TlimAction =
  | { type: "placeOrder"; input: PlaceOrderInput; menu: MenuItem[] }
  | { type: "advance"; id: number }
  | { type: "toggleSoldOut"; itemId: string }
  | { type: "broadcast"; segment: Segment; text: string }
  | { type: "schedulePost"; post: Omit<ScheduledPost, "id"> }
  | { type: "sendSurvey"; recipients: number };

export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  novo: "preparo",
  preparo: "saiu",
  saiu: "concluido",
  concluido: null,
};

const INACTIVE_AFTER_DAYS = 30;

export function segmentOf(c: Customer): Exclude<Segment, "todos"> {
  if (c.lastOrderDays > INACTIVE_AFTER_DAYS) return "inativos";
  return c.orders >= 2 ? "recorrentes" : "novos";
}

export function customersIn(customers: Customer[], segment: Segment) {
  return segment === "todos" ? customers : customers.filter((c) => segmentOf(c) === segment);
}

function linesFor(cart: Record<string, number>, menu: MenuItem[]): OrderLine[] {
  return Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .flatMap(([itemId, qty]) => {
      const item = menu.find((m) => m.id === itemId);
      return item ? [{ itemId, name: item.name, qty, priceCents: item.priceCents }] : [];
    });
}

export const totalOf = (lines: OrderLine[]) =>
  lines.reduce((sum, l) => sum + l.qty * l.priceCents, 0);

export function initialState(demo: ClientDemo): TlimState {
  const nameOf = (id: string) => demo.customers.find((c) => c.id === id)?.name ?? "Cliente";
  const orders = demo.orders.map((o): Order => {
    const lines = linesFor(
      Object.fromEntries(o.items.map((i) => [i.itemId, i.qty])),
      demo.menu.items,
    );
    return {
      id: o.id,
      customerId: o.customerId,
      customerName: nameOf(o.customerId),
      lines,
      totalCents: totalOf(lines),
      status: o.status,
      minutesAgo: o.minutesAgo,
      mode: o.mode,
      payment: o.payment,
      note: o.note ?? "",
      fromVisitor: false,
    };
  });
  return {
    orders,
    customers: demo.customers,
    // Como no diagnóstico: uma bebida esgotada. Liberar em Cardápio faz ela voltar ao cardápio online.
    soldOut: { "guarana-1l": true },
    broadcasts: [],
    posts: demo.posts.map((p) => ({ ...p })),
    surveysSent: 0,
  };
}

export function tlimReducer(state: TlimState, action: TlimAction): TlimState {
  switch (action.type) {
    case "placeOrder": {
      const lines = linesFor(action.input.cart, action.menu).filter(
        (l) => !state.soldOut[l.itemId],
      );
      const name = action.input.customerName.trim();
      if (!name || lines.length === 0) return state;
      const existing = state.customers.find((c) => c.name.toLowerCase() === name.toLowerCase());
      const customerId = existing?.id ?? `v${state.customers.length + 1}`;
      const total = totalOf(lines);
      const customers = existing
        ? state.customers.map((c) =>
            c.id === existing.id
              ? { ...c, orders: c.orders + 1, spentCents: c.spentCents + total, lastOrderDays: 0 }
              : c,
          )
        : [
            {
              id: customerId,
              name,
              orders: 1,
              spentCents: total,
              lastOrderDays: 0,
              channel: "cardapio" as const,
            },
            ...state.customers,
          ];
      const id = Math.max(0, ...state.orders.map((o) => o.id)) + 1;
      const order: Order = {
        id,
        customerId,
        customerName: name,
        lines,
        totalCents: total,
        status: "novo",
        minutesAgo: 0,
        mode: action.input.mode,
        payment: action.input.payment,
        note: action.input.note.trim(),
        fromVisitor: true,
      };
      return { ...state, orders: [order, ...state.orders], customers };
    }
    case "advance":
      return {
        ...state,
        orders: state.orders.map((o) => {
          const next = o.id === action.id ? NEXT_STATUS[o.status] : null;
          return next ? { ...o, status: next } : o;
        }),
      };
    case "toggleSoldOut":
      return {
        ...state,
        soldOut: { ...state.soldOut, [action.itemId]: !state.soldOut[action.itemId] },
      };
    case "broadcast": {
      const text = action.text.trim();
      const recipients = customersIn(state.customers, action.segment).length;
      if (!text || recipients === 0) return state;
      const broadcast = {
        id: state.broadcasts.length + 1,
        segment: action.segment,
        recipients,
        text,
      };
      return { ...state, broadcasts: [broadcast, ...state.broadcasts] };
    }
    case "schedulePost": {
      if (!action.post.title.trim() || !action.post.caption.trim()) return state;
      const post = { ...action.post, id: `n${state.posts.length + 1}` };
      return { ...state, posts: [...state.posts, post] };
    }
    case "sendSurvey":
      return action.recipients > 0 ? { ...state, surveysSent: action.recipients } : state;
  }
}

export type TlimStore = { state: TlimState; dispatch: (action: TlimAction) => void };
export const TlimContext = createContext<TlimStore | null>(null);

export function useTlim() {
  const store = useContext(TlimContext);
  if (!store) throw new Error("useTlim precisa de <TlimProvider>");
  return store;
}
