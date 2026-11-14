import { describe, expect, it } from "vitest";
import { withBase } from "./paths";

describe("withBase", () => {
  // Tests run with BASE_URL "/", like the real site.
  it("keeps internal paths on the real site", () => {
    expect(withBase("/servicos")).toBe("/servicos");
    expect(withBase("/?assunto=orcamento#contato")).toBe("/?assunto=orcamento#contato");
  });

  it("leaves external, protocol-relative and hash links untouched", () => {
    expect(withBase("https://exemplo.com/a")).toBe("https://exemplo.com/a");
    expect(withBase("//cdn.exemplo.com/a")).toBe("//cdn.exemplo.com/a");
    expect(withBase("#contato")).toBe("#contato");
  });
});
