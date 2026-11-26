// @vitest-environment node
// Preços: só os três planos aprovados em 26/11/2026 aparecem no site.
import { describe, expect, it } from "vitest";
import * as site from "./site";

describe("valores do site", () => {
  it("os planos têm os valores aprovados em 26/11/2026", () => {
    expect(site.plans.items.map((p) => [p.name, p.setup, p.price + p.period])).toEqual([
      ["Essencial", "Implantação: R$ 490", "R$ 149/mês"],
      ["Negócio + Redes", "Implantação: R$ 690", "R$ 649/mês"],
      ["Digital Profissional", "Implantação: sob proposta", "R$ 1.149/mês"],
    ]);
    for (const row of site.plans.comparison.rows) {
      expect(row.plans).toHaveLength(site.plans.items.length);
    }
  });

  it("fora dos planos, nenhum texto público mostra preço", () => {
    const { plans: _plans, ...others } = site;
    expect(JSON.stringify(others)).not.toMatch(/R\$\s?\d/);
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
