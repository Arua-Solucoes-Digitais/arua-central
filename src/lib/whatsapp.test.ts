import { describe, expect, it } from "vitest";
import {
  buildReservationMessage,
  buildWhatsappUrl,
  formatDate,
  formatPrice,
  instagramUrl,
} from "./whatsapp";
import { slugify } from "./slug";

const summary = {
  propertyName: "Sítio",
  isDemo: false,
  stayName: "Day use",
  checkIn: "2030-01-10",
  checkOut: "2030-01-10",
  guests: 4,
  name: "Ana",
  phone: "11 91234-5678",
  email: "",
  notes: "",
};

describe("mensagem de WhatsApp", () => {
  it("organiza os dados e omite o que não foi preenchido", () => {
    const message = buildReservationMessage(summary);
    expect(message).toContain("*Entrada:* 10/01/2030");
    expect(message).not.toContain("E-mail");
    expect(message).not.toContain("Observações");
    expect(message).not.toContain("demonstração");
    expect(message).toContain("Aguardo a confirmação");
  });

  it("marca a mensagem da demonstração e inclui os opcionais", () => {
    const message = buildReservationMessage({
      ...summary,
      isDemo: true,
      email: "a@b.com",
      notes: "Oi",
    });
    expect(message).toContain("demonstração");
    expect(message).toContain("*E-mail:* a@b.com");
    expect(message).toContain("*Observações:* Oi");
  });

  it("codifica o texto, inclusive caracteres que quebrariam o link", () => {
    const url = buildWhatsappUrl("55 (11) 91234-5678", "Olá & até?\nlinha #2");
    expect(url.startsWith("https://wa.me/5511912345678?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1] ?? "")).toBe("Olá & até?\nlinha #2");
  });

  it("sem número, abre o WhatsApp para escolher o contato", () => {
    expect(buildWhatsappUrl("", "Oi").startsWith("https://wa.me/?text=")).toBe(true);
  });
});

describe("formatos", () => {
  it("formata data e preço", () => {
    expect(formatDate("2030-12-05")).toBe("05/12/2030");
    expect(formatPrice(35050).replace(/\s/g, " ")).toBe("R$ 350,50");
  });

  it("aceita @usuario e link do Instagram, e recusa o resto", () => {
    expect(instagramUrl("@pousada.a")).toBe("https://www.instagram.com/pousada.a");
    expect(instagramUrl("https://www.instagram.com/pousada_a/")).toBe(
      "https://www.instagram.com/pousada_a",
    );
    expect(instagramUrl("")).toBeNull();
    expect(instagramUrl("javascript:alert(1)")).toBeNull();
  });

  it("cria endereços sem acentos", () => {
    expect(slugify("  Aruá Hospedagens — Sítio! ")).toBe("arua-hospedagens-sitio");
  });
});
