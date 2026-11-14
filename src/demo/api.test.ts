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

  it("refuses writes and the restricted area", async () => {
    await expect(demo.getDashboard()).rejects.toThrow(demo.DEMO_DISABLED_MESSAGE);
    expect(await demo.getCurrentUser()).toBeNull();
  });
});
