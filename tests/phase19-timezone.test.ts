import { it, expect, vi } from "vitest";
import { validTimeZone } from "../src/features/nutrition-tracker/schema";

it("reuses successful ICU validation without accepting invalid timezone identifiers", () => {
  const formatter = vi.spyOn(Intl, "DateTimeFormat");
  try {
    expect(validTimeZone("Pacific/Chatham")).toBe(true);
    expect(validTimeZone("Pacific/Chatham")).toBe(true);
    expect(formatter).toHaveBeenCalledTimes(1);
    expect(validTimeZone("not-a-time-zone")).toBe(false);
    expect(validTimeZone("not-a-time-zone")).toBe(false);
  } finally {
    formatter.mockRestore();
  }
});
