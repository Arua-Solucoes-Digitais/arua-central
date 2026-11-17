// A experiência guiada de ponta a ponta, num roteador em memória com as mesmas
// rotas (caminhos) de src/routes/demonstracoes.*. Nada é salvo nem enviado.
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "@/components/site/Motion";
import { CONCEPT_LABEL, demoAreas, demoCopy, getDemo, isDemoArea } from "@/content/demos";
import { DemoEntry, DemoPanel } from "./DemoShell";
import { TourProvider } from "./DemoTour";

function buildRouter(initial: string) {
  const root = createRootRoute({
    component: () => (
      <MotionProvider>
        <Outlet />
      </MotionProvider>
    ),
  });
  const home = createRoute({
    getParentRoute: () => root,
    path: "/",
    component: () => <p>Início</p>,
  });
  const index = createRoute({
    getParentRoute: () => root,
    path: "/demonstracoes",
    component: () => <p>Índice de demonstrações</p>,
  });
  const client = createRoute({
    getParentRoute: () => root,
    path: "/demonstracoes/$client",
    component: () => (
      <TourProvider>
        <Outlet />
      </TourProvider>
    ),
  });
  const entry = createRoute({
    getParentRoute: () => client,
    path: "/",
    component: function Entry() {
      const { client: slug } = entry.useParams();
      return <DemoEntry demo={getDemo(slug)!} />;
    },
  });
  const area = createRoute({
    getParentRoute: () => client,
    path: "$area",
    component: function Area() {
      const p = area.useParams();
      if (!isDemoArea(p.area)) return <p>não encontrada</p>;
      return <DemoPanel demo={getDemo(p.client)!} area={p.area} />;
    },
  });
  const routeTree = root.addChildren([home, index, client.addChildren([entry, area])]);
  return createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [initial] }) });
}

async function open(path: string) {
  const router = buildRouter(path);
  await act(async () => {
    render(<RouterProvider router={router} />);
  });
  return router;
}

const BASE = "/demonstracoes/rogerinho-burguers";
const h1 = () => screen.getByRole("heading", { level: 1 });

async function click(el: HTMLElement) {
  await act(async () => {
    fireEvent.click(el);
  });
}

let setItem: ReturnType<typeof vi.spyOn>;
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  setItem = vi.spyOn(Storage.prototype, "setItem");
  consoleError = vi.spyOn(console, "error");
});

afterEach(() => {
  cleanup();
  // Nenhuma decisão ou preferência do visitante é guardada no navegador.
  expect(setItem).not.toHaveBeenCalled();
  expect(consoleError).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

describe("guided demo — entry", () => {
  it("presents the Central, the business, the purpose and the demo notice", async () => {
    await open(BASE);
    expect(h1()).toHaveTextContent("Rogerinho Burguer's");
    expect(screen.getByText(demoCopy.product)).toBeInTheDocument();
    expect(screen.getByText(demoCopy.entryPurpose)).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("diagnóstico inicial de 31/10/2026");
  });

  it("starts the demo on the overview with the tour at step 1", async () => {
    await open(BASE);
    await click(screen.getByRole("link", { name: /Iniciar demonstração/ }));
    expect(h1()).toHaveTextContent("Visão geral");
    expect(screen.getByTestId("tour-progress")).toHaveTextContent("Etapa 1 de 9");
  });
});

describe("guided demo — navigation and tour", () => {
  it("navigates between all areas from the area menu", async () => {
    await open(`${BASE}/visao-geral`);
    const nav = screen.getByRole("navigation", { name: demoCopy.areasNav });
    for (const a of demoAreas) {
      await click(within(nav).getByRole("link", { name: new RegExp(a.label) }));
      expect(h1()).toHaveTextContent(a.label);
      expect(within(nav).getByRole("link", { name: new RegExp(a.label) })).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
  });

  it("moves forward and back through the tour with progress", async () => {
    await open(`${BASE}/visao-geral`);
    await click(screen.getByRole("link", { name: /Próxima área/ }));
    expect(h1()).toHaveTextContent("Diagnóstico digital");
    expect(screen.getByTestId("tour-progress")).toHaveTextContent("Etapa 2 de 9");
    await click(screen.getByRole("link", { name: /Próxima área/ }));
    expect(screen.getByTestId("tour-progress")).toHaveTextContent("Etapa 3 de 9");
    await click(screen.getByRole("link", { name: /Anterior/ }));
    expect(h1()).toHaveTextContent("Diagnóstico digital");
    expect(screen.getByTestId("tour-progress")).toHaveTextContent("Etapa 2 de 9");
  });

  it("explains each area: what it is, the problem, Aruá's use, what is real and what needs a backend", async () => {
    await open(`${BASE}/aprovacoes`);
    const panel = screen.getByTestId("tour-panel");
    for (const label of [
      demoCopy.guide.represents,
      demoCopy.guide.problem,
      demoCopy.guide.howAruaUses,
      demoCopy.guide.whatIsReal,
      demoCopy.guide.needsBackend,
    ]) {
      expect(within(panel).getByText(label)).toBeInTheDocument();
    }
  });

  it("closes the tour, keeps it closed across areas and reopens it", async () => {
    await open(`${BASE}/visao-geral`);
    await click(screen.getByRole("button", { name: demoCopy.guide.close }));
    expect(screen.queryByTestId("tour-panel")).not.toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: demoCopy.areasNav });
    await click(within(nav).getByRole("link", { name: /Atividades/ }));
    expect(screen.queryByTestId("tour-panel")).not.toBeInTheDocument();
    await click(screen.getByRole("button", { name: demoCopy.guide.reopen }));
    expect(screen.getByTestId("tour-progress")).toHaveTextContent("Etapa 3 de 9");
  });

  it("returns to the overview and finishes on the last step", async () => {
    await open(`${BASE}/proposta-e-estrategia`);
    expect(screen.getByTestId("tour-progress")).toHaveTextContent("Etapa 9 de 9");
    await click(screen.getByRole("button", { name: demoCopy.guide.finish }));
    expect(screen.getByRole("status")).toHaveTextContent("Visita concluída");
    await click(screen.getByRole("link", { name: demoCopy.backToOverview }));
    expect(h1()).toHaveTextContent("Visão geral");
  });

  it("moves keyboard focus to the new area title after navigating", async () => {
    await open(`${BASE}/visao-geral`);
    await click(screen.getByRole("link", { name: /Próxima área/ }));
    expect(document.activeElement).toBe(h1());
  });
});

describe("guided demo — data honesty", () => {
  it("shows each real baseline number with its date, source and nature", async () => {
    await open(`${BASE}/presenca-digital`);
    const main = screen.getByRole("main");
    for (const [label, value] of [
      ["Nota no Google", "4,4"],
      ["Avaliações no Google", "419"],
      ["Seguidores no Instagram", "1.188"],
      ["Publicações no Instagram", "69"],
    ] as const) {
      const card = within(main).getByRole("heading", { name: label }).closest("li")!;
      expect(card).toHaveTextContent(value);
      expect(card).toHaveTextContent("31/10/2026");
      expect(card).toHaveTextContent(/Fonte:.*Capturas de tela/);
      expect(card).toHaveTextContent("Dado: Real");
    }
  });

  it("shows unavailable metrics without any value", async () => {
    await open(`${BASE}/presenca-digital`);
    for (const label of [
      "Alcance",
      "Visualizações",
      "Visitas ao perfil",
      "Pedidos com origem identificada",
    ]) {
      const card = screen.getByRole("heading", { name: label }).closest("li")!;
      expect(card).toHaveTextContent("Ainda não disponível");
      expect(card).toHaveTextContent("—");
      expect(card.textContent).not.toMatch(/\d{2,}/);
    }
  });

  it("labels every conceptual post as not published and as simulation", async () => {
    await open(`${BASE}/publicacoes`);
    expect(screen.getAllByText(CONCEPT_LABEL)).toHaveLength(3);
    expect(screen.getAllByText("Dado: Simulação")).toHaveLength(3);
    expect(screen.getByText(/Nenhuma publicação foi feita/)).toBeInTheDocument();
  });

  it("never shows percentages, growth or completed work in any area", async () => {
    for (const a of demoAreas) {
      await open(`${BASE}/${a.id}`);
      const text = screen.getByRole("main").textContent ?? "";
      expect(text, a.id).not.toMatch(/%/);
      expect(text, a.id).not.toMatch(/crescimento de|aumento de|\+\d/i);
      expect(screen.queryAllByText("Concluído"), a.id).toHaveLength(0);
      cleanup();
    }
  });
});

describe("guided demo — no fake auth, no fake decisions, accessible controls", () => {
  it("has no forms, inputs or login anywhere", async () => {
    for (const path of [BASE, ...demoAreas.map((a) => `${BASE}/${a.id}`)]) {
      await open(path);
      expect(document.querySelectorAll("form, input, textarea, select"), path).toHaveLength(0);
      expect(document.body.textContent, path).not.toMatch(/digite (seu|o) PIN|entrar com senha/i);
      cleanup();
    }
  });

  it("demo approval buttons only explain that the action needs the operational version", async () => {
    await open(`${BASE}/aprovacoes`);
    await click(screen.getByRole("button", { name: "Aprovar" }));
    expect(screen.getByRole("status")).toHaveTextContent(demoCopy.operationalOnly);
    expect(document.body.textContent).not.toMatch(
      /aprovado com sucesso|aprovação registrada|decisão registrada/i,
    );
    expect(
      screen.getByText(/Aprovações registradas na Central original até 31\/10\/2026: nenhuma/),
    ).toBeInTheDocument();
  });

  it("uses only native, keyboard-reachable controls with safe external links", async () => {
    for (const a of demoAreas) {
      await open(`${BASE}/${a.id}`);
      expect(document.querySelector('a[href="#conteudo"]'), a.id).not.toBeNull();
      for (const el of document.querySelectorAll<HTMLElement>("[tabindex]")) {
        expect(Number(el.getAttribute("tabindex")), a.id).toBeLessThanOrEqual(0);
      }
      for (const el of document.querySelectorAll(
        "[onclick], div[role=button], span[role=button]",
      )) {
        throw new Error(`controle não nativo em ${a.id}: ${el.outerHTML}`);
      }
      for (const link of document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')) {
        expect(link.href, a.id).toMatch(/^https:\/\//);
        expect(link.rel, a.id).toContain("noopener");
      }
      for (const b of document.querySelectorAll("button")) {
        expect(b.getAttribute("type"), a.id).toBe("button");
      }
      cleanup();
    }
  });
});
