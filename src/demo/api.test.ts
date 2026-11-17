// @vitest-environment node
import { describe, expect, it } from "vitest";
import * as real from "@/lib/api";
import * as demo from "./api";

describe("static demo API", () => {
  it("replaces every export of the real API", () => {
    const missing = Object.keys(real).filter((name) => !(name in demo));
    expect(missing).toEqual([]);
  });

  it("builds a WhatsApp link for a demo reservation without saving anything", async () => {
    const page = await demo.getPropertyPage({ data: { slug: "demonstracao" } });
    expect(page?.is_demo).toBe(true);
    const stay = page!.stays[0]!;
    const result = await demo.submitReservation({
      data: {
        id: "00000000-0000-4000-8000-000000000000",
        property_slug: "demonstracao",
        stay_id: stay.id,
        check_in: "2099-01-10",
        check_out: "2099-01-12",
        guests: 1,
        name: "Ana",
        phone: "11999999999",
        email: "",
        notes: "",
        consent: true,
      },
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.whatsapp_url).toMatch(/^https:\/\/wa\.me\/\?text=/);
  });

  it("shows the Encanto da Mata showcase with every photo bundled, never /media", async () => {
    const page = await demo.getPropertyPage({ data: { slug: "encanto-da-mata" } });
    expect(page?.is_demo).toBe(true);
    expect(page?.whatsapp).toBe("");
    const result = await demo.submitReservation({
      data: {
        id: "00000000-0000-4000-8000-000000000001",
        property_slug: "encanto-da-mata",
        stay_id: page!.stays[0]!.id,
        check_in: "2099-01-10",
        check_out: "2099-01-12",
        guests: 2,
        name: "Ana",
        phone: "11999999999",
        email: "",
        notes: "",
        consent: true,
      },
    });
    // O pedido da demonstração vai para o WhatsApp da Aruá, nunca para a pousada.
    if (!result.ok) throw new Error(result.message);
    expect(result.whatsapp_url).toMatch(/^https:\/\/wa\.me\/5538999636208\?text=/);
    const items = [...page!.banners, ...page!.gallery, ...page!.stays.flatMap((s) => s.photos)];
    expect(items).toHaveLength(14);
    for (const item of items) {
      expect(item.src).toBeTruthy();
      expect(item.src).toMatch(/^\/demos\/encanto-da-mata\/(img|video)\//);
    }
  });

  it("refuses writes and the restricted area", async () => {
    await expect(demo.getDashboard()).rejects.toThrow(demo.DEMO_DISABLED_MESSAGE);
    expect(await demo.getCurrentUser()).toBeNull();
  });
});
