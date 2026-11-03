import { describe, expect, it } from "vitest";
import { baseProjectSchema } from "./schemas";

const valid = {
  title: "Projeto",
  description: "Descrição",
  demo_url: "https://demo.exemplo.com/inicio",
  sort_order: "1",
  is_published: false,
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
    "",
  ])("recusa o link %s", (demo_url) => {
    expect(baseProjectSchema.safeParse({ ...valid, demo_url }).success).toBe(false);
  });

  it.each([
    { title: "  " },
    { description: "" },
    { sort_order: "-1" },
    { sort_order: "1.5" },
    { sort_order: "abc" },
  ])("recusa o campo inválido %o", (field) => {
    expect(baseProjectSchema.safeParse({ ...valid, ...field }).success).toBe(false);
  });
});
