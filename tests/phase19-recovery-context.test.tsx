// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecoveryPage } from "../src/features/recovery/workspace";
import { RecoveryCheckIn } from "../src/features/recovery/pages";
import * as storage from "../src/features/recovery/storage";
import * as tracker from "../src/features/workout-tracker/storage";
import { checkInSchema } from "../src/features/recovery/schema";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("keeps workout-link controls disabled through the context refresh, then saves the removed link", async () => {
  const record = checkInSchema.parse({
    id: "recovery_missing_link",
    date: "2026-10-05",
    timezone: "UTC",
    createdAt: "2026-10-05T00:00:00Z",
    updatedAt: "2026-10-05T00:00:00Z",
    linkedWorkoutSessionIds: ["missing_fixture_workout"],
  });
  const view: storage.RecoveryView = {
    data: { ...storage.emptyRecoveryBackup(), recoveryCheckIns: [record] },
    quarantined: 0,
  };
  let finishRefresh!: (value: storage.RecoveryView) => void;
  const refreshing = new Promise<storage.RecoveryView>((resolve) => {
    finishRefresh = resolve;
  });
  const read = vi
    .spyOn(storage, "readRecoveryView")
    .mockResolvedValue(view)
    .mockResolvedValueOnce(view)
    .mockReturnValueOnce(refreshing);
  vi.spyOn(tracker, "allTracker").mockResolvedValue([]);
  const save = vi.spyOn(storage, "saveCheckIn").mockResolvedValue(undefined);
  const user = userEvent.setup();
  render(
    <RecoveryPage title="Check-in">
      <RecoveryCheckIn />
    </RecoveryPage>,
  );
  await user.selectOptions(
    await screen.findByLabelText("Edit an existing check-in"),
    record.id,
  );
  const remove = screen.getByRole("button", {
    name: "Remove unavailable workout link",
  });
  await user.click(
    screen.getByRole("button", { name: "Load completed workouts" }),
  );
  await waitFor(() => expect(read).toHaveBeenCalledTimes(2));
  expect(remove.closest("fieldset")?.disabled).toBe(true);
  await user.click(remove);
  expect(screen.getByText(/^1 linked sessions\./)).toBeTruthy();
  expect(save).not.toHaveBeenCalled();
  await act(async () => finishRefresh(view));
  expect(remove.closest("fieldset")?.disabled).toBe(false);
  expect(screen.getByRole("status").textContent).toContain(
    "Completed workout context loaded",
  );
  await user.click(remove);
  expect(
    screen.queryByRole("button", { name: "Remove unavailable workout link" }),
  ).toBeNull();
  await user.click(screen.getByRole("button", { name: "Save check-in" }));
  await waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(save.mock.calls[0]?.[0]).toMatchObject({
    id: record.id,
    linkedWorkoutSessionIds: [],
  });
  expect(save.mock.calls[0]?.[1]).toBe(record.updatedAt);
});
