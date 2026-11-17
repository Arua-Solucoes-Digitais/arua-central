// @vitest-environment node
// The route tree imports server code (node:sqlite); under jsdom, Node 22 cannot resolve that built-in.
import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the Tlim demo: presentation, manager areas and the online menu", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes("/demonstracoes").at(-1)?.routeId).toBe("/demonstracoes/");
    expect(router.matchRoutes("/demonstracoes/tlim").at(-1)?.routeId).toBe(
      "/demonstracoes/$client/",
    );
    expect(router.matchRoutes("/demonstracoes/tlim/pedidos").at(-1)?.routeId).toBe(
      "/demonstracoes/$client/$area",
    );
    expect(router.matchRoutes("/demonstracoes/tlim/loja").at(-1)?.routeId).toBe(
      "/demonstracoes/$client/loja",
    );
  });
});
