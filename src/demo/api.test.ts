// @vitest-environment node
import { describe, expect, it } from "vitest";
import * as real from "@/lib/api";
import * as demo from "./api";

describe("static demo API", () => {
  it("replaces every export of the real API", () => {
    const missing = Object.keys(real).filter((name) => !(name in demo));
    expect(missing).toEqual([]);
  });

  it("has no storefront left and refuses reservations for unknown places", async () => {
    expect(await demo.getPropertyPage({ data: { slug: "demonstracao" } })).toBeNull();
    expect(await demo.getPropertyPage({ data: { slug: "encanto-da-mata" } })).toBeNull();
    const result = await demo.submitReservation({
      data: {
        id: "00000000-0000-4000-8000-000000000000",
        property_slug: "demonstracao",
        stay_id: "00000000-0000-4000-8000-000000000001",
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
    expect(result.ok).toBe(false);
  });

  it("refuses writes and the restricted area", async () => {
    await expect(demo.getDashboard()).rejects.toThrow(demo.DEMO_DISABLED_MESSAGE);
    expect(await demo.getCurrentUser()).toBeNull();
  });
});
