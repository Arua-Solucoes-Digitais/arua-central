// @vitest-environment node
// Fidelidade e privacidade dos dados das demonstrações: o que aparece na tela
// precisa ter fonte e data, e nada privado pode entrar no bundle público.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { safeHttpUrl } from "@/lib/safe-url";
import { demoAreas, demos, getDemo } from "./index";
import { rogerinhoBurguers as rb } from "./rogerinho-burguers";

const ALLOWED_HOSTS = ["pedido.anota.ai", "www.instagram.com"];

function allUrls(value: unknown): string[] {
  if (typeof value === "string")
    return /^[a-z][a-z0-9+.-]*:\/\/|^(javascript|data|vbscript|mailto|tel):/i.test(value)
      ? [value]
      : [];
  if (Array.isArray(value)) return value.flatMap(allUrls);
  if (value && typeof value === "object") return Object.values(value).flatMap(allUrls);
  return [];
}

describe("demo registry", () => {
  it("finds the Rogerinho demo and ignores prototype keys", () => {
    expect(getDemo("rogerinho-burguers")).toBe(rb);
    expect(getDemo("__proto__")).toBeUndefined();
    expect(getDemo("constructor")).toBeUndefined();
    expect(getDemo("outro-cliente")).toBeUndefined();
  });

  it("has a guide step for every area, in a unique order", () => {
    const ids = demoAreas.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const demo of Object.values(demos)) {
      for (const id of ids) {
        const step = demo.guide[id];
        expect(step.represents && step.problem && step.howAruaUses).toBeTruthy();
        expect(step.whatIsReal).toBeTruthy();
      }
    }
  });
});

describe("Rogerinho demo data — fidelity", () => {
  it("shows exactly the four documented baseline numbers, dated and sourced", () => {
    const real = rb.indicators.filter((i) => i.value !== null);
    expect(real.map((i) => [i.id, i.value])).toEqual([
      ["g_rating", 4.4],
      ["g_reviews", 419],
      ["ig_followers", 1188],
      ["ig_posts", 69],
    ]);
    for (const i of real) {
      expect(i.referenceDate).toBe("2026-10-31");
      expect(i.source.length).toBeGreaterThan(10);
      expect(i.nature).toBe("real");
    }
  });

  it("never invents metrics that depend on dashboards the project had no access to", () => {
    const unavailable = [
      "ig_reach",
      "ig_impressions",
      "ig_profile_visits",
      "anota_clicks",
      "anota_orders",
    ];
    for (const id of unavailable) {
      const i = rb.indicators.find((x) => x.id === id);
      expect(i, id).toBeDefined();
      expect(i!.value).toBeNull();
      expect(i!.referenceDate).toBeNull();
      expect(i!.nature).toBeNull();
      expect(i!.unavailableReason).toBeTruthy();
    }
    // Nenhum indicador sem valor carrega natureza; nenhum com valor fica sem data ou fonte.
    for (const i of rb.indicators) {
      if (i.value === null) expect(i.nature).toBeNull();
      else expect(i.referenceDate && i.source && i.nature).toBeTruthy();
    }
  });

  it("keeps the documented activity statuses (1 in progress, 18 planned, none done)", () => {
    expect(rb.activities).toHaveLength(19);
    expect(rb.activities.filter((a) => a.status === "andamento")).toHaveLength(1);
    expect(rb.activities.filter((a) => a.status === "planejado")).toHaveLength(18);
    for (const a of rb.activities) {
      if (a.status === "concluido" || a.status === "aprovado")
        expect(a.evidence.length).toBeGreaterThan(0);
    }
  });

  it("marks an action as done only with evidence", () => {
    for (const a of rb.nextActions) {
      if (a.state === "realizada") expect(a.evidence).toBeTruthy();
    }
  });

  it("records no approvals, publications or survey answers that did not happen", () => {
    expect(rb.approvals.recordedApprovals).toBe(0);
    expect(rb.publications.realPublications).toEqual([]);
    for (const c of rb.publications.concepts) expect(c.nature).toBe("simulacao");
  });

  it("keeps the pilot as an unapproved proposal and shows no prices", () => {
    expect(rb.strategy.proposalStatus).toMatch(/aguardando aprovação/i);
    expect(rb.diagnosis.projectStatus).toMatch(/aguardando aprovação/i);
    expect(JSON.stringify(rb)).not.toMatch(/R\$\s?\d/);
  });

  it("does not pick an address number before the owner confirms it", () => {
    expect(rb.business.location).not.toMatch(/225/);
    expect(rb.business.addressNote).toMatch(/225A/);
    expect(rb.business.addressNote).toMatch(/225 /);
  });

  it("lists all eight documented opportunities and labels hypotheses", () => {
    const o = rb.diagnosis.opportunities;
    expect(o.filter((x) => x.certainty !== "hipotese")).toHaveLength(8);
    expect(o.filter((x) => x.certainty === "hipotese").length).toBeGreaterThan(0);
    for (const x of o) expect(x.channel && x.evidence && x.recommendation).toBeTruthy();
  });

  it("follows the review policy: no reward for reviews, invite everyone", () => {
    const rules = rb.relationship.rules.join(" ");
    expect(rules).toMatch(/Nunca oferecer desconto, brinde ou vantagem/);
    expect(rules).toMatch(/todos os clientes/);
  });
});

describe("Rogerinho demo data — privacy and links", () => {
  const serialized = JSON.stringify(rb);

  it("contains no phone numbers, credentials or private files", () => {
    expect(serialized).not.toMatch(/\(\d{2}\)\s?\d/); // (31) 9...
    expect(serialized).not.toMatch(/\d{4,5}-\d{4}/); // 3467-4665
    expect(serialized).not.toMatch(/\bPIN\b|senha|token|cookie|hash/i);
    expect(serialized).not.toMatch(/central\.db|ACESSOS|conversas_originais|sistema\/dados/);
    expect(serialized).not.toMatch(/@[a-z0-9.-]+\.(com|br)\b/i); // e-mails
  });

  it("uses only https links to the business' own public pages", () => {
    const urls = allUrls(rb);
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(safeHttpUrl(url), url).toBe(url);
      const parsed = new URL(url);
      expect(parsed.protocol).toBe("https:");
      expect(ALLOWED_HOSTS).toContain(parsed.hostname);
    }
  });

  it("rejects non-http protocols before they become links", () => {
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("data:text/html,x")).toBeNull();
    expect(safeHttpUrl("not a url")).toBeNull();
    expect(safeHttpUrl("https://www.instagram.com/rogerinhoburguers/")).toBe(
      "https://www.instagram.com/rogerinhoburguers/",
    );
  });
});

describe("propostas e valores", () => {
  it("Rogerinho: a proposta não fala de valor nem de plano pago", () => {
    const text = JSON.stringify(demos["rogerinho-burguers"]);
    expect(text).not.toMatch(/R\$|de graça|gratuit|Digital Performance/i);
    expect(demos["rogerinho-burguers"]!.strategy.proposalStatus).toMatch(/aguardando aprovação/i);
  });

  it("o site do Encanto na demonstração usa o WhatsApp da Aruá, nunca o do proprietário", () => {
    const site = readFileSync("public/demos/encanto-da-mata/index.html", "utf8");
    expect(site).not.toContain("5531984721918");
    expect(site).toContain("whatsapp: '5538999636208'");
    expect(site).toContain('<script src="arua-preview.js" defer></script>');
  });
});
