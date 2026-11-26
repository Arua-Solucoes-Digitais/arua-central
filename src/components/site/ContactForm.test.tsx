// Contato do site do domínio: sem servidor, a mensagem vai pronta para o WhatsApp da Aruá.
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { contact } from "@/content/site";
import { WhatsappContact, whatsappContactUrl } from "./ContactForm";

// O formulário com servidor não é testado aqui; sem isto o teste carregaria o banco (node:sqlite).
vi.mock("@/lib/api", () => ({ sendContactMessage: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const textOf = (href: string) => new URL(href).searchParams.get("text") ?? "";

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

async function renderForm(canStore: boolean) {
  const root = createRootRoute();
  const home = createRoute({
    getParentRoute: () => root,
    path: "/",
    component: () => <WhatsappContact canStore={canStore} />,
  });
  const router = createRouter({
    routeTree: root.addChildren([home]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await act(async () => {
    render(<RouterProvider router={router} />);
  });
}

describe("contato pelo WhatsApp", () => {
  it("vai para o número da Aruá com assunto, nome e mensagem", () => {
    const url = whatsappContactUrl("orcamento", " Ana ", "Tenho uma lanchonete.");
    expect(url.startsWith("https://wa.me/5538999636208?")).toBe(true);
    expect(textOf(url)).toBe(
      "Olá! Vim pelo site da Aruá.\nAssunto: Solicitar orçamento\nNome: Ana\nTenho uma lanchonete.",
    );
    expect(textOf(whatsappContactUrl("suporte", "", ""))).toBe(
      "Olá! Vim pelo site da Aruá.\nAssunto: Suporte técnico",
    );
  });

  it("sem armazenamento, o botão acompanha o que a pessoa digita e nada é guardado", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await renderForm(false);
    type("Seu nome (opcional)", "Bia");
    const link = screen.getByRole("link", { name: "Enviar pelo WhatsApp" });
    expect(textOf(link.getAttribute("href")!)).toContain("Nome: Bia");
    expect(screen.queryByRole("checkbox")).toBeNull();
    fireEvent.click(link);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
  });

  it("sem marcar a autorização, nada é enviado ao banco", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await renderForm(true);
    type("Seu nome (opcional)", "Bia");
    type(contact.save.phoneLabel, "38 99999-0000");
    fireEvent.click(screen.getByRole("link", { name: "Enviar pelo WhatsApp" }));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("autorizado: pede nome e telefone, grava uma vez e não trava o WhatsApp se falhar", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("sem rede"));
    await renderForm(true);
    const link = screen.getByRole("link", { name: "Enviar pelo WhatsApp" });
    fireEvent.click(screen.getByRole("checkbox"));
    expect(fireEvent.click(link)).toBe(false); // incompleto: não segue
    expect(screen.getByRole("alert")).toHaveTextContent(contact.save.nameError);
    type("Seu nome (opcional)", "Bia");
    expect(fireEvent.click(link)).toBe(false);
    expect(screen.getByRole("alert")).toHaveTextContent(contact.save.phoneError);
    type(contact.save.phoneLabel, "(38) 99999-0000");
    await act(async () => {
      expect(fireEvent.click(link)).toBe(true); // segue para o WhatsApp
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(String(url)).toMatch(/\/rest\/v1\/rpc\/submit_contact$/);
    expect(JSON.parse(String(init!.body))).toMatchObject({
      p_name: "Bia",
      p_phone: "(38) 99999-0000",
      p_consent: true,
      p_website: "",
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
