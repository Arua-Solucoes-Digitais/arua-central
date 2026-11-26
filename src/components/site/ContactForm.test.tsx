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
import { WhatsappContact, whatsappContactUrl } from "./ContactForm";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const textOf = (href: string) => new URL(href).searchParams.get("text") ?? "";

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

  it("o botão acompanha o que a pessoa digita e nada é guardado", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const root = createRootRoute();
    const home = createRoute({
      getParentRoute: () => root,
      path: "/",
      component: () => <WhatsappContact />,
    });
    const router = createRouter({
      routeTree: root.addChildren([home]),
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await act(async () => {
      render(<RouterProvider router={router} />);
    });
    fireEvent.change(screen.getByLabelText("Seu nome (opcional)"), { target: { value: "Bia" } });
    const link = screen.getByRole("link", { name: "Enviar pelo WhatsApp" });
    expect(textOf(link.getAttribute("href")!)).toContain("Nome: Bia");
    expect(setItem).not.toHaveBeenCalled();
  });
});
