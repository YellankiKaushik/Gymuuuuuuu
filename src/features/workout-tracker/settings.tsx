import { useEffect, useState } from "react";
import { PageHeader } from "../../components/common/page-header";
import { InfoCallout } from "../../components/common/primitives";
import { WorkoutNav } from "./start";
import {
  allTracker,
  getCustomExercises,
  getPreferences,
  permanentDeleteWorkout,
  readTracker,
  saveCustomExercise,
  savePreferences,
} from "./storage";
import {
  downloadLocal,
  exportWorkoutBackup,
  exportWorkoutCsv,
  previewWorkoutBackup,
  restoreWorkoutBackup,
} from "./backup";
import type { CustomExercise, WorkoutPreferences } from "./schema";
import { performanceModes, allowedScopes } from "./schema";
export function WorkoutSettings() {
  const [preferences, setPreferences] = useState<WorkoutPreferences>(),
    [customs, setCustoms] = useState<CustomExercise[]>([]),
    [message, setMessage] = useState("Loading tracker settings…"),
    [storageStatus, setStorageStatus] = useState("Quota estimate unavailable"),
    [lastBackup, setLastBackup] = useState("No workout backup recorded"),
    [preview, setPreview] =
      useState<Awaited<ReturnType<typeof previewWorkoutBackup>>>(),
    [importReport, setImportReport] = useState<{
      accepted: number;
      skipped: number;
      rejected: number;
    }>(),
    [mode, setMode] = useState<"merge" | "replace">("merge"),
    [strategy, setStrategy] = useState<"keep" | "replace" | "copy">("keep"),
    [busy, setBusy] = useState(true),
    [deleted, setDeleted] = useState<{ id: string; title: string }[]>([]);
  const load = async () => {
    setPreferences(await getPreferences());
    setCustoms(await getCustomExercises());
    const meta = await readTracker<{ date: string }>(
      "appMeta",
      "last-workout-backup",
    );
    setLastBackup(meta?.date ?? "No workout backup recorded");
    setDeleted(
      (
        await allTracker<{
          id: string;
          title: string;
          deletedAt: string | null;
        }>("workoutSessions")
      ).filter((item) => item.deletedAt),
    );
    setMessage("");
    setBusy(false);
  };
  useEffect(() => {
    queueMicrotask(() => {
      void load().catch((error: Error) => {
        setMessage(error.message);
        setBusy(false);
      });
    });
    if (navigator.storage?.estimate)
      void Promise.all([
        navigator.storage.estimate(),
        navigator.storage.persisted(),
      ])
        .then(([estimate, persisted]) =>
          setStorageStatus(
            `${((estimate.usage ?? 0) / 1e6).toFixed(1)} MB used / ${((estimate.quota ?? 0) / 1e6).toFixed(0)} MB approximate quota · ${persisted ? "Persistent storage granted" : "Storage may be evicted"}`,
          ),
        )
        .catch(() => undefined);
  }, []);
  const action = async (fn: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await fn();
      setMessage(success);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Local data operation failed.",
      );
    } finally {
      setBusy(false);
    }
  };
  const update = (value: Partial<WorkoutPreferences>) => {
    if (!preferences) return;
    const next = {
      ...preferences,
      ...value,
      updatedAt: new Date().toISOString(),
    };
    setPreferences(next);
    void action(() => savePreferences(next), "Settings saved locally.");
  };
  return (
    <div className="page">
      <PageHeader
        title="Workout settings & backup"
        description="Manage local display preferences, labels, backups and storage."
      />
      <WorkoutNav />
      <p role="status">{message}</p>
      {preferences && (
        <form
          className="local-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <label>
            Weight unit
            <select
              value={preferences.weightUnit}
              onChange={(event) =>
                update({ weightUnit: event.target.value as "kg" | "lb" })
              }
            >
              <option>kg</option>
              <option>lb</option>
            </select>
          </label>
          <label>
            Distance unit
            <select
              value={preferences.distanceUnit}
              onChange={(event) =>
                update({ distanceUnit: event.target.value as "km" | "mi" })
              }
            >
              <option>km</option>
              <option>mi</option>
            </select>
          </label>
          <label>
            Effort mode
            <select
              value={preferences.effortMode}
              onChange={(event) =>
                update({
                  effortMode: event.target.value as "none" | "rir" | "rpe",
                })
              }
            >
              <option>none</option>
              <option>rir</option>
              <option>rpe</option>
            </select>
          </label>
          <label>
            Default rest (seconds)
            <input
              type="number"
              min="0"
              max="3600"
              value={preferences.defaultRestSeconds}
              onChange={(event) => {
                if (Number.isInteger(event.target.valueAsNumber))
                  update({ defaultRestSeconds: event.target.valueAsNumber });
              }}
            />
          </label>
          <label>
            Timer sound
            <select
              value={preferences.timerSound}
              onChange={(event) =>
                update({ timerSound: event.target.value as "off" | "beep" })
              }
            >
              <option>off</option>
              <option>beep</option>
            </select>
          </label>
          <label>
            Week begins
            <select
              value={preferences.weekStartsOn}
              onChange={(event) =>
                update({
                  weekStartsOn: event.target.value as "monday" | "sunday",
                })
              }
            >
              <option>monday</option>
              <option>sunday</option>
            </select>
          </label>
          {(
            [
              "autoStartRestTimer",
              "showPreviousPerformance",
              "confirmBeforeDiscard",
            ] as const
          ).map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={preferences[key]}
                onChange={(event) => update({ [key]: event.target.checked })}
              />
              {key.replace(/([A-Z])/g, " $1")}
            </label>
          ))}
        </form>
      )}
      <section className="detail-section">
        <h2>Local storage</h2>
        <p>{storageStatus}</p>
        <p>Last backup: {lastBackup}</p>
        <button
          className="button secondary"
          disabled={busy}
          onClick={() => {
            void action(async () => {
              const granted = await navigator.storage?.persist();
              setStorageStatus(
                granted
                  ? "Persistent storage granted. Backups are still recommended."
                  : "Persistent storage was not granted. Download regular backups.",
              );
            }, "Storage protection request completed.");
          }}
        >
          Protect local data
        </button>
      </section>
      <section className="detail-section">
        <h2>Backup and export</h2>
        {importReport && (
          <p role="status">
            Import report: {importReport.accepted} accepted,{" "}
            {importReport.skipped} skipped, {importReport.rejected} rejected.
          </p>
        )}
        <div className="actions">
          <button
            className="button primary"
            disabled={busy}
            onClick={() => {
              void action(async () => {
                await exportWorkoutBackup();
                await load();
              }, "Workout JSON backup created.");
            }}
          >
            Download workout JSON
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => {
              void action(exportWorkoutCsv, "Three workout CSV files created.");
            }}
          >
            Download workout CSVs
          </button>
          <button
            className="button secondary"
            disabled={busy}
            onClick={() => {
              void action(async () => {
                downloadLocal(
                  `fitness-os-workout-recovery-${Date.now()}.json`,
                  JSON.stringify(
                    {
                      format: "fitness-os-raw-workout-recovery",
                      sessions: await allTracker("workoutSessions"),
                      customExercises: await allTracker("customExercises"),
                    },
                    null,
                    2,
                  ),
                );
              }, "Raw recovery copy created. It requires repair before normal restore.");
            }}
          >
            Export raw recovery copy
          </button>
        </div>
        <label className="file-input">
          Preview workout backup
          <input
            type="file"
            accept=".json,application/json"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file)
                void action(
                  async () =>
                    setPreview(await previewWorkoutBackup(await file.text())),
                  "Backup validated. Review conflicts and choose a strategy before importing.",
                );
              event.target.value = "";
            }}
          />
        </label>
        {preview && (
          <div className="entity-card">
            <h3>Restore preview</h3>
            <p>
              {preview.counts.sessions} sessions ·{" "}
              {preview.counts.customExercises} labels ·{" "}
              {preview.conflicts.filter((item) => !item.identical).length}{" "}
              conflicting records ·{" "}
              {preview.conflicts.filter((item) => item.identical).length}{" "}
              identical records
            </p>
            <p>
              Date range: {preview.dates[0] ?? "No sessions"} —{" "}
              {preview.dates.at(-1) ?? "No sessions"}
            </p>
            <ul>
              {preview.conflicts
                .filter((item) => !item.identical)
                .map((item) => (
                  <li key={`${item.store}:${item.id}`}>
                    {item.store}: {item.id}
                  </li>
                ))}
            </ul>
            <label>
              Import mode
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as typeof mode)}
              >
                <option value="merge">Merge with local records</option>
                <option value="replace">
                  Replace workout records (safety backup first)
                </option>
              </select>
            </label>
            <label>
              Conflict strategy
              <select
                value={strategy}
                onChange={(event) =>
                  setStrategy(event.target.value as typeof strategy)
                }
              >
                <option value="keep">Keep existing / skip conflicts</option>
                <option value="replace">Replace with imported</option>
                <option value="copy">
                  Import conflicting sessions as new copies
                </option>
              </select>
            </label>
            <button
              className="button primary"
              disabled={busy}
              onClick={() => {
                void action(async () => {
                  const report = await restoreWorkoutBackup(
                    preview,
                    mode,
                    strategy,
                  );
                  setPreview(undefined);
                  await load();
                  setImportReport(report);
                }, "Import applied atomically. Derived records will rebuild from sessions.");
              }}
            >
              Confirm local import
            </button>
            <button
              className="button secondary"
              onClick={() => setPreview(undefined)}
            >
              Cancel import
            </button>
          </div>
        )}
      </section>
      <section className="detail-section">
        <h2>Personal exercise labels</h2>
        <p>
          Changing a label’s mode or load scope creates a comparison boundary.
          Historical snapshots remain intact.
        </p>
        {customs.map((item) => (
          <div className="entity-card" key={item.id}>
            <label>
              Label name
              <input
                value={item.displayName}
                maxLength={120}
                onChange={(event) =>
                  setCustoms((current) =>
                    current.map((label) =>
                      label.id === item.id
                        ? { ...label, displayName: event.target.value }
                        : label,
                    ),
                  )
                }
              />
            </label>
            <p>
              {item.performanceMode} · {item.loadScope}
            </p>
            <label>
              Label performance mode
              <select
                value={item.performanceMode}
                onChange={(event) => {
                  if (
                    !window.confirm(
                      "Change this label’s comparison mode for future workouts? Historical snapshots will retain their original mode.",
                    )
                  )
                    return;
                  const mode = event.target
                    .value as typeof item.performanceMode;
                  setCustoms((current) =>
                    current.map((label) =>
                      label.id === item.id
                        ? {
                            ...label,
                            performanceMode: mode,
                            loadScope: allowedScopes[mode][0],
                          }
                        : label,
                    ),
                  );
                }}
              >
                {performanceModes.map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </label>
            <label>
              Label load scope
              <select
                value={item.loadScope}
                onChange={(event) => {
                  if (
                    window.confirm(
                      "Change this label’s load scope for future workouts? Records with different scopes are not comparable.",
                    )
                  )
                    setCustoms((current) =>
                      current.map((label) =>
                        label.id === item.id
                          ? {
                              ...label,
                              loadScope: event.target
                                .value as typeof item.loadScope,
                            }
                          : label,
                      ),
                    );
                }}
              >
                {allowedScopes[item.performanceMode].map((scope) => (
                  <option key={scope}>{scope}</option>
                ))}
              </select>
            </label>
            <div className="actions">
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => {
                  void action(
                    () =>
                      saveCustomExercise({
                        ...item,
                        updatedAt: new Date().toISOString(),
                      }),
                    "Label saved.",
                  );
                }}
              >
                Save label
              </button>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => {
                  void action(async () => {
                    await saveCustomExercise({
                      ...item,
                      archivedAt: item.archivedAt
                        ? null
                        : new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    });
                    await load();
                  }, "Label archive state updated.");
                }}
              >
                {item.archivedAt ? "Restore label" : "Archive label"}
              </button>
              <a href={`/workout/exercises/${item.id}/history`}>
                Label history
              </a>
            </div>
          </div>
        ))}
      </section>
      {deleted.length > 0 && (
        <section className="detail-section">
          <h2>Deleted workouts</h2>
          <p>
            Restore a deleted workout from its history page. Permanent deletion
            cannot be undone without a backup.
          </p>
          {deleted.map((item) => (
            <div className="entity-card" key={item.id}>
              <a href={`/workout/history/${item.id}`}>{item.title}</a>
              <button
                className="button secondary"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      `Permanently delete ${item.title}? Download a backup first.`,
                    )
                  )
                    void action(async () => {
                      await permanentDeleteWorkout(item.id);
                      await load();
                    }, "Workout permanently deleted.");
                }}
              >
                Permanently delete
              </button>
            </div>
          ))}
        </section>
      )}
      <InfoCallout title="Device-local data">
        These downloads contain personal records. Keep them private. Clearing
        this browser’s storage removes local workouts and labels.
      </InfoCallout>
    </div>
  );
}
