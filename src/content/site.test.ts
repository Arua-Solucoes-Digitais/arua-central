// @vitest-environment node
// Regra de 17/11/2026: nenhum preço no site público enquanto os valores não forem divulgados.
import { describe, expect, it } from "vitest";
import * as site from "./site";

describe("valores do site", () => {
  it("nenhum texto público mostra preço", () => {
    expect(JSON.stringify(site)).not.toMatch(/R\$\s?\d/);
  });

  it("todo plano mostra Em breve no lugar do preço", () => {
    for (const plan of site.plans.items) {
      expect(plan.price).toBe(site.COMING_SOON);
      expect(plan.period).toBe("");
    }
  });

  it("a Área do cliente aparece no menu e é só uma explicação, sem login", () => {
    expect(site.navigation.items.map((n) => n.href)).toContain("/area-do-cliente");
    expect(site.clientArea.badge).toBe(site.COMING_SOON);
    expect(site.clientArea.features.map((f) => f.title)).toEqual([
      "Acompanhar o trabalho",
      "Aprovar materiais",
      "Relatórios",
      "Suporte e arquivos",
    ]);
  });
});
