import { indexedDB } from "fake-indexeddb";
import { it, expect, vi } from "vitest";
import { dietPlanFixture } from "./fixtures/diet";
import {
  readDietBackup,
  mutateDietPlans,
  exportDietBackup,
  previewDietImport,
} from "../src/features/diet-planning/storage";
it("transacts CRUD, current selection, audit, conflict restore and failed-import preservation", async () => {
  vi.stubGlobal("window", { indexedDB, dispatchEvent: () => true });
  vi.stubGlobal("crypto", globalThis.crypto);
  try {
    const first = dietPlanFixture(),
      second = { ...first, id: "dietplan_second", name: "Second" };
    expect((await readDietBackup()).plans).toHaveLength(0);
    await mutateDietPlans({ action: "created", plan: first });
    await mutateDietPlans({ action: "created", plan: second });
    await Promise.all([
      mutateDietPlans({ action: "set_current", planId: first.id }),
      mutateDietPlans({ action: "set_current", planId: second.id }),
    ]);
    let backup = await readDietBackup();
    expect(backup.plans.filter((p) => p.status === "current")).toHaveLength(1);
    await mutateDietPlans({
      action: "updated",
      plan: { ...backup.plans.find((p) => p.id === first.id)!, name: "Edited" },
      expectedUpdatedAt: backup.plans.find((p) => p.id === first.id)!.updatedAt,
    });
    backup = await readDietBackup();
    const edited = backup.plans.find((p) => p.id === first.id)!;
    expect(edited.name).toBe("Edited");
    await expect(
      mutateDietPlans({
        action: "updated",
        plan: first,
        expectedUpdatedAt: first.updatedAt,
      }),
    ).rejects.toThrow(/another tab/);
    const exported = exportDietBackup(backup, true),
      preview = previewDietImport(exported, backup);
    expect(preview.conflicts).toHaveLength(2);
    await expect(
      mutateDietPlans({
        action: "imported",
        backup: {
          ...backup,
          plans: [{ ...first, energy: { ...first.energy, targetKcal: 999 } }],
        },
      }),
    ).rejects.toThrow();
    expect((await readDietBackup()).plans).toEqual(backup.plans);
    await mutateDietPlans({ action: "archived", planId: second.id });
    expect(
      (await readDietBackup()).plans.find((p) => p.id === second.id)?.status,
    ).toBe("archived");
    await mutateDietPlans({ action: "deleted", planId: first.id });
    expect((await readDietBackup()).plans).toHaveLength(1);
    await mutateDietPlans({
      action: "imported",
      backup: preview.backup,
      conflicts: "keep",
    });
    backup = await readDietBackup();
    expect(backup.plans).toHaveLength(2);
    expect(backup.plans.find((p) => p.id === second.id)?.status).toBe(
      "archived",
    );
    expect(backup.auditLog?.some((a) => a.action === "deleted")).toBe(true);
  } finally {
    vi.unstubAllGlobals();
  }
});
