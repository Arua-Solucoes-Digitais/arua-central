// @vitest-environment node
// Fidelidade e privacidade da demonstração do Tlim: restaurante fictício, números do caso real
// com fonte, nada que identifique o restaurante de origem, e a assinatura da Aruá.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { demoAreas, demos, getDemo, isDemoArea, signature } from "./index";
import { tlim } from "./tlim";

describe("Tlim demo data", () => {
  it("is the only registered demo and has a guide step for every area", () => {
    expect(Object.keys(demos)).toEqual(["tlim"]);
    expect(getDemo("tlim")).toBe(tlim);
    expect(getDemo("rogerinho-burguers")).toBeUndefined();
    const ids = demoAreas.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      const step = tlim.guide[id];
      expect(step.represents && step.problem && step.howAruaUses && step.whatIsReal).toBeTruthy();
    }
  });

  it("uses a fictional restaurant and never identifies the real one", () => {
    const text = JSON.stringify(tlim);
    expect(tlim.business.name).toBe("Burger do Bairro");
    expect(text).not.toMatch(/rogerinho|rogério|sagrada fam|anota\.?ai|225a?\b|pedido\.anota/i);
    expect(tlim.business.basis).toMatch(/fictício/);
  });

  it("keeps the real starting point numbers, marked as real", () => {
    const values = Object.fromEntries(tlim.indicators.map((i) => [i.id, i.value]));
    expect(values).toEqual({
      "google-nota": 4.4,
      "google-avaliacoes": 419,
      "ig-seguidores": 1188,
      "ig-publicacoes": 69,
    });
    expect(tlim.indicators.every((i) => i.nature === "real")).toBe(true);
    expect(tlim.indicatorsNote).toMatch(/31\/10\/2026/);
  });

  it("links every opportunity to an existing area and every order to real menu items", () => {
    for (const o of tlim.opportunities) expect(isDemoArea(o.solvedBy), o.title).toBe(true);
    const items = new Set(tlim.menu.items.map((i) => i.id));
    const customers = new Set(tlim.customers.map((c) => c.id));
    for (const item of tlim.menu.items) {
      expect(tlim.menu.categories).toContain(item.category);
      expect(item.priceCents).toBeGreaterThan(0);
    }
    for (const order of tlim.orders) {
      expect(customers.has(order.customerId)).toBe(true);
      for (const line of order.items) expect(items.has(line.itemId)).toBe(true);
    }
    for (const m of tlim.presentation.modules) expect(isDemoArea(m.area)).toBe(true);
  });

  it("signs the demo as Aruá's, developed by CjotaDEV7", () => {
    expect(signature.line).toMatch(/Aruá Soluções Digitais/);
    expect(signature.line).toMatch(/CjotaDEV7/);
  });
});

describe("site do Encanto na demonstração", () => {
  it("usa o WhatsApp da Aruá e carrega a marca d'água com o botão de voltar", () => {
    const site = readFileSync("public/demos/encanto-da-mata/index.html", "utf8");
    expect(site).not.toContain("5531984721918");
    expect(site).toContain("whatsapp: '5538999636208'");
    expect(site).toContain('<script src="arua-preview.js" defer></script>');
    const preview = readFileSync("public/demos/encanto-da-mata/arua-preview.js", "utf8");
    expect(preview).toContain("Voltar à Aruá");
  });
});
