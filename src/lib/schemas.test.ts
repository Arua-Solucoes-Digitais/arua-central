import { describe, expect, it } from "vitest";
import { baseProjectSchema, contactSchema, deploymentSchema } from "./schemas";

const valid = {
  title: "Projeto",
  description: "Descrição",
  slug: "",
  problem: "",
  features: "",
  demo_url: "https://demo.exemplo.com/inicio",
  sort_order: "1",
  status: "draft",
  kind: "case",
  category: "site",
  client: "",
  results: "",
};

describe("baseProjectSchema", () => {
  it("aceita um projeto válido e converte a ordem em número", () => {
    const parsed = baseProjectSchema.parse(valid);
    expect(parsed.sort_order).toBe(1);
  });

  it.each([
    "javascript:alert(1)",
    "http://demo.exemplo.com",
    "data:text/html,oi",
    "demo.exemplo.com",
    "https://demo exemplo.com",
    "//site-externo.com",
    "/com espaco",
  ])("recusa o link %s", (demo_url) => {
    expect(baseProjectSchema.safeParse({ ...valid, demo_url }).success).toBe(false);
  });

  it.each(["", "/hospedagens/demonstracao", "https://demo.exemplo.com"])(
    "aceita o link %s",
    (demo_url) => {
      expect(baseProjectSchema.safeParse({ ...valid, demo_url }).success).toBe(true);
    },
  );

  it.each([
    { title: "  " },
    { slug: "Com Maiuscula" },
    { slug: "../fora" },
    { status: "apagado" },
    { description: "" },
    { sort_order: "-1" },
    { sort_order: "1.5" },
    { sort_order: "abc" },
  ])("recusa o campo inválido %o", (field) => {
    expect(baseProjectSchema.safeParse({ ...valid, ...field }).success).toBe(false);
  });
});

describe("deploymentSchema", () => {
  const deployment = {
    project_id: "8f14e45f-ceea-4e7a-9f1b-0a1b2c3d4e5f",
    environment: "production",
    url: "https://sistema.exemplo.com",
    health_url: "",
    host: "",
    mode: "active",
    is_public: true,
    notes: "",
  };

  it("aceita endereço https e verificação opcional", () => {
    expect(deploymentSchema.safeParse(deployment).success).toBe(true);
  });

  it.each([
    "",
    "http://sistema.exemplo.com",
    "https://user:senha@sistema.exemplo.com",
    "ftp://a.com",
  ])("recusa o endereço %s", (url) => {
    expect(deploymentSchema.safeParse({ ...deployment, url }).success).toBe(false);
  });
});

describe("contactSchema", () => {
  it("usa orçamento como assunto padrão e recusa assunto desconhecido", () => {
    const base = { name: "Ana", email: "a@b.com", message: "Oi", consent: true };
    expect(contactSchema.parse(base).topic).toBe("orcamento");
    expect(contactSchema.safeParse({ ...base, topic: "spam" }).success).toBe(false);
  });
});
