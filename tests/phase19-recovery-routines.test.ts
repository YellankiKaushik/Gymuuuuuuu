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
import { routineSchema } from "../src/features/recovery/schema";
import { recoveryCsv } from "../src/features/recovery/export";
it("keeps walking doses, immutable source versions and draft exercise boundaries", () => {
  expect(publicRecoveryRoutines.slice(0, 2).map((r) => r.article.id)).toEqual([
    "routine_running_warmup",
    "routine_post_run_cooldown",
  ]);
  expect(() => validateRecoveryRelease()).not.toThrow();
  for (const entry of publicRecoveryRoutines) {
    if (entry.article.sourceIds.includes("nhs_walking_transitions_2026"))
      expect(entry.routine.steps[0]!.doseValue).toBe(300);
    else {
      expect(entry.routine.steps).toHaveLength(6);
      expect(entry.routine.steps.every((step) => step.doseValue === 10)).toBe(
        true,
      );
      expect(entry.routine.estimatedMinutes).toBeNull();
    }
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
    expect(recoveryCsv(backup, "routines")).toContain("publication_provenance");
    expect(recoveryCsv(backup, "routines")).toContain(
      "routine_running_warmup_v1",
    );
    const malformed = structuredClone(backup);
    malformed.customRoutineVersions[0]!.publicationProvenance!.sourceReferences[0]!.url =
      "javascript:alert(1)";
    await expect(
      restoreRecoveryBackup(malformed, "replace_local", true),
    ).rejects.toThrow();
    expect((await readRecoveryBackup()).customRoutineVersions).toEqual(
      backup.customRoutineVersions,
    );
    const provenance: unknown = first.publicationProvenance;
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
      restored.customRoutineVersions.find((r) => r.versionNumber === 2)!
        .publicationProvenance!.sourceSteps[0]!.doseValue,
    ).toBe(300);
  } finally {
    vi.unstubAllGlobals();
  }
});
it("accepts legacy routine versions and rejects malformed original snapshots", () => {
  const current = createPublicRoutineCopy("routine_calf_flexibility");
  const legacy = structuredClone(current);
  delete legacy.publicationProvenance;
  expect(routineSchema.parse(legacy).publicationProvenance).toBeUndefined();
  const oversized = structuredClone(current);
  oversized.publicationProvenance!.limitations = ["x".repeat(1501)];
  expect(routineSchema.safeParse(oversized).success).toBe(false);
  const unordered = structuredClone(current);
  unordered.publicationProvenance!.sourceSteps[0]!.order = 2;
  expect(routineSchema.safeParse(unordered).success).toBe(false);
  const falseReview = {
    ...current,
    publicationProvenance: {
      ...current.publicationProvenance,
      reviewLevel: "published_reviewed",
    },
  };
  expect(routineSchema.safeParse(falseReview).success).toBe(false);
});
