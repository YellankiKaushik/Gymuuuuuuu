import { expect, it, vi } from "vitest";
import { IDBFactory, IDBKeyRange } from "fake-indexeddb";
import {
  makeSegment,
  newCardioId,
  startCardioSession,
  transitionCardio,
  validateCardioBackup,
  emptyCardioBackup,
} from "../src/features/cardio/domain";
import {
  saveCardioVersion,
  saveCardioSession,
  readCardioBackup,
  readCardioView,
  mergeCardio,
  deleteCardioEntity,
  undoCardioDelete,
} from "../src/features/cardio/storage";
import type { Plan } from "../src/features/cardio/schema";
it("keeps immutable plan snapshots through revisions, deletion, copying and repeated database opens", async () => {
  vi.stubGlobal("window", { indexedDB: new IDBFactory() });
  vi.stubGlobal("IDBKeyRange", IDBKeyRange);
  vi.stubGlobal("BroadcastChannel", undefined);
  try {
    const now = new Date().toISOString(),
      plan: Plan = {
        id: newCardioId(),
        planIdentityId: newCardioId(),
        versionNumber: 1,
        title: "Synthetic plan",
        goal: "User choice",
        durationWeeks: 2,
        sessions: [
          {
            id: newCardioId(),
            dayIndex: 1,
            title: "Synthetic plan session",
            modalityId: "modality_walking_outdoor",
            sessionTypeId: "manual_other",
            segments: [makeSegment("User segment", "duration", 120)],
            notes: "",
          },
        ],
        publicationStatus: "local_active",
        createdAt: now,
        revisionReason: "Initial version",
        progressionNotes: "No auto-progression",
        sourceIds: [],
      };
    await saveCardioVersion(plan, null);
    const planned = plan.sessions[0]!;
    let s = startCardioSession(
      {
        title: planned.title,
        modalityId: planned.modalityId,
        sessionTypeId: planned.sessionTypeId,
        timezone: "UTC",
        segments: planned.segments,
        frozenSource: {
          kind: "plan",
          version: plan,
          sessionId: planned.id,
          weekNumber: 1,
        },
      },
      now,
      "version-owner",
    );
    s = transitionCardio(s, "finish", now);
    await saveCardioSession(s, null, "version-owner");
    const next = {
      ...structuredClone(plan),
      id: newCardioId(),
      versionNumber: 2,
      title: "Revised synthetic plan",
      revisionReason: "User changed title",
    };
    await saveCardioVersion(next, plan.id);
    await expect(
      saveCardioVersion({ ...next, id: newCardioId() }, plan.id),
    ).rejects.toThrow("changed");
    let root = await readCardioBackup();
    expect(root.customPlanVersions).toHaveLength(2);
    expect(root.cardioSessions[0]?.frozenSource?.version.title).toBe(
      "Synthetic plan",
    );
    expect((await readCardioView()).plans).toHaveLength(1);
    expect((await readCardioView()).plans[0]?.versionNumber).toBe(2);
    const copy = mergeCardio(root, root, "copy");
    expect(copy.customPlanIdentities).toHaveLength(2);
    expect(copy.customPlanVersions).toHaveLength(4);
    expect(copy.cardioSessions[1]?.sourcePlanSnapshot?.planVersionId).not.toBe(
      plan.id,
    );
    expect(copy.cardioSessions[1]?.sourcePlanSnapshot?.planVersionId).toBe(
      copy.cardioSessions[1]?.frozenSource?.version.id,
    );
    await deleteCardioEntity("plan", plan.planIdentityId, true);
    root = await readCardioBackup();
    expect(root.customPlanVersions).toHaveLength(0);
    expect(root.cardioSessions[0]?.frozenSource?.version.title).toBe(
      "Synthetic plan",
    );
    await undoCardioDelete(root.deletedRecords[0]!.id);
    expect((await readCardioBackup()).customPlanVersions).toHaveLength(2);
    const invalid = emptyCardioBackup();
    invalid.customPlanVersions = [plan];
    expect(() => validateCardioBackup(invalid)).toThrow("Orphaned");
  } finally {
    vi.unstubAllGlobals();
  }
});
