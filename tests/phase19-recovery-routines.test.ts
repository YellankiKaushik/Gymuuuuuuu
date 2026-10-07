import { expect, it, vi } from "vitest";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import { createHash } from "node:crypto";
import {
  publicRecoveryArticles,
  publicRecoveryRoutines,
  validateRecoveryRelease,
} from "../src/features/recovery/publication";
import { createPublicRoutineCopy } from "../src/features/recovery/public-routines";
import {
  saveRoutine,
  readRecoveryBackup,
  restoreRecoveryBackup,
  purgeRecovery,
} from "../src/features/recovery/storage";
import pins from "../src/content/provenance/recovery-routine-version-pins.json";
it("keeps walking doses, immutable source versions and draft exercise boundaries", () => {
  expect(publicRecoveryRoutines.map((r) => r.article.id)).toEqual([
    "routine_running_warmup",
    "routine_post_run_cooldown",
  ]);
  expect(() => validateRecoveryRelease()).not.toThrow();
  for (const entry of publicRecoveryRoutines) {
    expect(entry.routine.steps[0]!.doseValue).toBe(300);
    expect(entry.routine.steps[0]!.phase03ExerciseId).toBeNull();
    expect(pins.find((p) => p.id === entry.routine.id)?.sha256).toBe(
      createHash("sha256").update(JSON.stringify(entry)).digest("hex"),
    );
  }
  const broken = structuredClone(publicRecoveryRoutines);
  broken[0]!.routine.routineIdentityId = "different_identity";
  expect(() => validateRecoveryRelease(publicRecoveryArticles, broken)).toThrow(
    /identity/,
  );
  expect(() => createPublicRoutineCopy("routine_full_body_warmup_5")).toThrow(
    /unavailable/,
  );
});
it("retains original instructions in independent local copies through backup, replacement and revisions", async () => {
  vi.stubGlobal("window", {
    indexedDB: new IDBFactory(),
    dispatchEvent: () => true,
  });
  vi.stubGlobal("IDBKeyRange", IDBKeyRange);
  try {
    const first = createPublicRoutineCopy("routine_running_warmup");
    const second = createPublicRoutineCopy("routine_running_warmup");
    expect(first.routineIdentityId).not.toBe(second.routineIdentityId);
    expect(first.steps[0]!.id).not.toBe(
      publicRecoveryRoutines[0]!.routine.steps[0]!.id,
    );
    await saveRoutine(first);
    const backup = await readRecoveryBackup();
    const provenance: unknown = JSON.parse(first.notes!);
    expect(provenance).toMatchObject({
      publicIdentity: "routine_running_warmup",
      publicVersion: "routine_running_warmup_v1",
      reviewLevel: "published_personal_use",
      sourceSteps: [{ doseValue: 300 }],
    });
    await purgeRecovery("DELETE RECOVERY DATA");
    await restoreRecoveryBackup(backup, "replace_local", true);
    expect((await readRecoveryBackup()).customRoutineVersions[0]).toEqual(
      first,
    );
    await saveRoutine(
      {
        ...first,
        id: second.id,
        versionNumber: 2,
        revisionReason: "Synthetic local change",
        steps: first.steps.map((s) => ({ ...s, doseValue: 120 })),
      },
      first.id,
    );
    const restored = await readRecoveryBackup();
    expect(
      restored.customRoutineVersions.find((r) => r.id === first.id)!.steps[0]!
        .doseValue,
    ).toBe(300);
    expect(
      JSON.parse(
        restored.customRoutineVersions.find((r) => r.versionNumber === 2)!
          .notes!,
      ).sourceSteps[0].doseValue,
    ).toBe(300);
  } finally {
    vi.unstubAllGlobals();
  }
});
