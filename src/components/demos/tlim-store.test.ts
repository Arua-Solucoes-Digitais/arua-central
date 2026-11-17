// @vitest-environment node
// Regras do estado da demonstração do Tlim, sem tela.
import { describe, expect, it } from "vitest";
import { tlim } from "@/content/demos/tlim";
import { customersIn, initialState, segmentOf, tlimReducer, type TlimState } from "./tlim-store";

const order = (state: TlimState, cart: Record<string, number>, name = "Teste") =>
  tlimReducer(state, {
    type: "placeOrder",
    input: { customerName: name, cart, mode: "retirada", payment: "pix", note: "" },
    menu: tlim.menu.items,
  });

describe("Tlim store", () => {
  it("a new order gets the next number, arrives as 'novo' and creates the customer", () => {
    const start = initialState(tlim);
    const next = order(start, { "x-burger": 2, "refri-lata": 1 }, "Marina");
    const placed = next.orders[0]!;
    expect(placed.id).toBe(Math.max(...start.orders.map((o) => o.id)) + 1);
    expect(placed.status).toBe("novo");
    expect(placed.fromVisitor).toBe(true);
    expect(placed.totalCents).toBe(2 * 2200 + 650);
    const marina = next.customers.find((c) => c.name === "Marina")!;
    expect(marina).toMatchObject({ orders: 1, spentCents: 5050, lastOrderDays: 0 });
    expect(segmentOf(marina)).toBe("novos");
  });

  it("an order from a known customer updates their history instead of duplicating", () => {
    const start = initialState(tlim);
    const ana = start.customers.find((c) => c.name === "Ana Paula")!;
    const next = order(start, { "x-tudo": 1 }, "ana paula");
    const after = next.customers.find((c) => c.id === ana.id)!;
    expect(next.customers).toHaveLength(start.customers.length);
    expect(after.orders).toBe(ana.orders + 1);
  });

  it("refuses an empty cart, a missing name and sold-out items", () => {
    const start = initialState(tlim);
    expect(order(start, {})).toBe(start);
    expect(order(start, { "x-burger": 1 }, "  ")).toBe(start);
    // Guaraná 1 L começa esgotado, como no diagnóstico.
    expect(order(start, { "guarana-1l": 1 })).toBe(start);
    const freed = tlimReducer(start, { type: "toggleSoldOut", itemId: "guarana-1l" });
    expect(order(freed, { "guarana-1l": 1 }).orders).toHaveLength(start.orders.length + 1);
  });

  it("moves an order through the kitchen flow and stops at 'concluido'", () => {
    let state = order(initialState(tlim), { "x-bacon": 1 });
    const id = state.orders[0]!.id;
    for (const expected of ["preparo", "saiu", "concluido", "concluido"]) {
      state = tlimReducer(state, { type: "advance", id });
      expect(state.orders[0]!.status).toBe(expected);
    }
  });

  it("broadcasts count the segment and refuse an empty message", () => {
    const start = initialState(tlim);
    expect(tlimReducer(start, { type: "broadcast", segment: "inativos", text: " " })).toBe(start);
    const next = tlimReducer(start, {
      type: "broadcast",
      segment: "inativos",
      text: "Oi, {nome}!",
    });
    const inactive = customersIn(start.customers, "inativos").length;
    expect(inactive).toBeGreaterThan(0);
    expect(next.broadcasts[0]).toMatchObject({ segment: "inativos", recipients: inactive });
  });

  it("schedules a post only with title and caption", () => {
    const start = initialState(tlim);
    const post = { format: "Reels" as const, dayOffset: 3, time: "19:00", title: "", caption: "x" };
    expect(tlimReducer(start, { type: "schedulePost", post })).toBe(start);
    const next = tlimReducer(start, { type: "schedulePost", post: { ...post, title: "Quarta" } });
    expect(next.posts).toHaveLength(start.posts.length + 1);
  });
});
