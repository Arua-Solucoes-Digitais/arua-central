// A demonstração do Tlim de ponta a ponta, num roteador em memória com os mesmos caminhos de
// src/routes/demonstracoes.*. Nada é salvo nem enviado.
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
import { demoAreas, demoCopy, getDemo, isDemoArea, signature } from "@/content/demos";
import { DemoEntry, DemoPanel } from "./DemoShell";
import { TourProvider } from "./DemoTour";
import { TlimProvider } from "./TlimProvider";
import { TlimStorefront } from "./TlimStore";

function buildRouter(initial: string) {
  const root = createRootRoute({
    component: () => (
      <MotionProvider>
        <Outlet />
      </MotionProvider>
    ),
  });
  const stub = (path: string, text: string) =>
    createRoute({ getParentRoute: () => root, path, component: () => <p>{text}</p> });
  const client = createRoute({
    getParentRoute: () => root,
    path: "/demonstracoes/$client",
    component: function Layout() {
      const { client: slug } = client.useParams();
      return (
        <TlimProvider demo={getDemo(slug)!}>
          <TourProvider>
            <Outlet />
          </TourProvider>
        </TlimProvider>
      );
    },
  });
  const entry = createRoute({
    getParentRoute: () => client,
    path: "/",
    component: function Entry() {
      return <DemoEntry demo={getDemo(entry.useParams().client)!} />;
    },
  });
  const store = createRoute({
    getParentRoute: () => client,
    path: "loja",
    component: function Store() {
      return <TlimStorefront demo={getDemo(store.useParams().client)!} />;
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
  const routeTree = root.addChildren([
    stub("/", "Início"),
    stub("/portfolio", "Portfólio da Aruá"),
    stub("/demonstracoes", "Índice"),
    client.addChildren([entry, store, area]),
  ]);
  return createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [initial] }) });
}

async function open(path: string) {
  const router = buildRouter(path);
  await act(async () => {
    render(<RouterProvider router={router} />);
  });
  return router;
}

async function click(el: HTMLElement) {
  await act(async () => {
    fireEvent.click(el);
  });
}

async function type(el: HTMLElement, value: string) {
  await act(async () => {
    fireEvent.change(el, { target: { value } });
  });
}

const BASE = "/demonstracoes/tlim";
const h1 = () => screen.getByRole("heading", { level: 1 });

let setItem: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  setItem = vi.spyOn(Storage.prototype, "setItem");
});

afterEach(() => {
  cleanup();
  // Nada do que o visitante faz é guardado no navegador.
  expect(setItem).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

function expectAruaBrand() {
  const back = screen.getByRole("link", { name: new RegExp(demoCopy.backToArua) });
  expect(back.getAttribute("href")).toMatch(/\/portfolio$/);
  expect(screen.getByRole("note", { name: demoCopy.watermark })).toBeInTheDocument();
  expect(screen.getByText(signature.line)).toBeInTheDocument();
}

describe("Tlim — presentation", () => {
  it("presents the product, the example restaurant and both ways in", async () => {
    await open(BASE);
    expect(h1()).toHaveTextContent(getDemo("tlim")!.presentation.headline);
    expect(screen.getAllByRole("link", { name: new RegExp(demoCopy.storeCta) })[0]).toHaveAttribute(
      "href",
      `${BASE}/loja`,
    );
    expect(screen.getByRole("link", { name: new RegExp(demoCopy.start) })).toHaveAttribute(
      "href",
      `${BASE}/visao-geral`,
    );
    expect(screen.getByRole("heading", { name: "Burger do Bairro" })).toBeInTheDocument();
    expectAruaBrand();
  });
});

describe("Tlim — every page shows the Aruá brand", () => {
  it.each([...demoAreas.map((a) => a.id), "loja"])("%s", async (page) => {
    await open(`${BASE}/${page}`);
    expectAruaBrand();
    expect(document.body.textContent).not.toMatch(/rogerinho/i);
  });
});

describe("Tlim — order flow", () => {
  it("an order placed on the online menu arrives in the order center and goes through the kitchen", async () => {
    const router = await open(`${BASE}/loja`);
    await click(screen.getByRole("button", { name: /Enviar pedido · R\$\s0,00/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/pelo menos um item/);

    await click(screen.getByRole("button", { name: "Adicionar X-Burger" }));
    await click(screen.getByRole("button", { name: /Mais um X-Burger/ }));
    await click(screen.getByRole("button", { name: /Enviar pedido/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/seu nome/);

    await type(screen.getByLabelText("Seu nome"), "Visitante");
    await click(screen.getByRole("button", { name: /Enviar pedido · R\$\s44,00/ }));
    expect(h1()).toHaveTextContent("Pedido #42 recebido!");

    await click(screen.getByRole("link", { name: "Ver o pedido na central" }));
    expect(router.state.location.pathname).toBe(`${BASE}/pedidos`);
    const novos = screen.getByRole("region", { name: /Novos/ });
    expect(within(novos).getByText("#42 · Visitante")).toBeInTheDocument();
    expect(within(novos).getByText("Seu pedido de teste")).toBeInTheDocument();

    await click(within(novos).getByRole("button", { name: /Aceitar e imprimir: pedido 42/ }));
    const preparo = screen.getByRole("region", { name: /Em preparo/ });
    expect(within(preparo).getByLabelText("Comanda do pedido 42")).toHaveTextContent("2× X-Burger");
  });

  it("an item marked sold out in the manager disappears from the online menu", async () => {
    await open(`${BASE}/cardapio`);
    const bacon = screen.getByRole("switch", { name: "X-Bacon disponível no cardápio" });
    expect(bacon).toHaveAttribute("aria-checked", "true");
    await click(bacon);
    expect(bacon).toHaveAttribute("aria-checked", "false");
    await click(screen.getByRole("link", { name: /Ver como o cliente vê/ }));
    expect(screen.queryByRole("button", { name: "Adicionar X-Bacon" })).toBeNull();
  });
});

describe("Tlim — manager tools", () => {
  it("WhatsApp: refuses an empty message and logs a simulated blast", async () => {
    await open(`${BASE}/whatsapp`);
    await type(screen.getByLabelText(/Mensagem/), "");
    await click(screen.getByRole("button", { name: /Disparar para/ }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Escreva a mensagem/);
    await type(screen.getByLabelText(/Mensagem/), "Oi, {nome}! Volte a pedir.");
    await click(screen.getByRole("button", { name: /Disparar para/ }));
    expect(screen.getByText("Disparado (simulação)")).toBeInTheDocument();
  });

  it("Instagram: schedules a post only with title and caption", async () => {
    await open(`${BASE}/instagram`);
    await click(screen.getByRole("button", { name: "Agendar" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/título e a legenda/);
    await type(screen.getByLabelText("Título"), "Promoção de quarta");
    await type(screen.getByLabelText("Legenda"), "X-Tudo com refri.");
    await click(screen.getByRole("button", { name: "Agendar" }));
    expect(screen.getByText("Promoção de quarta")).toBeInTheDocument();
  });

  it("Surveys: results appear only after sending", async () => {
    await open(`${BASE}/pesquisas`);
    expect(screen.getByText(/Envie a pesquisa para ver/)).toBeInTheDocument();
    await click(screen.getByRole("button", { name: /Enviar para quem pediu/ }));
    expect(screen.getByRole("button", { name: /Enviada para/ })).toBeDisabled();
    expect(screen.getByText(/Tema mais citado/)).toBeInTheDocument();
  });

  it("Approvals: adjustment needs a note, then resend and approve", async () => {
    await open(`${BASE}/aprovacoes`);
    const text = () => document.body.textContent ?? "";
    await click(screen.getByRole("button", { name: "Pedir ajustes" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Descreva o que precisa mudar/);
    await type(screen.getByRole("textbox"), "Trocar a foto");
    await click(screen.getByRole("button", { name: "Pedir ajustes" }));
    expect(text()).toMatch(/Ajustes solicitados/);
    await click(screen.getByRole("button", { name: "Reenviar com ajustes (Aruá)" }));
    await click(screen.getByRole("button", { name: "Aprovar" }));
    expect(text()).toMatch(/Aprovado/);
  });

  it("the guided tour walks through every area in order", async () => {
    await open(`${BASE}/visao-geral`);
    for (const [i, a] of demoAreas.entries()) {
      expect(h1()).toHaveTextContent(a.label);
      expect(screen.getByTestId("tour-progress")).toHaveTextContent(
        `Etapa ${i + 1} de ${demoAreas.length}`,
      );
      const next = demoAreas[i + 1];
      if (next) {
        await click(screen.getByRole("link", { name: new RegExp(`Próxima área: ${next.short}`) }));
      }
    }
  });
});
