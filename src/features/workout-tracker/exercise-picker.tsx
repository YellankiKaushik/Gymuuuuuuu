import { useEffect, useState } from "react";
import { getPublishedExercises } from "../exercises/repository";
import {
  allowedScopes,
  performanceModes,
  type CustomExercise,
  type WorkoutExercise,
} from "./schema";
import { getCustomExercises, saveCustomExercise } from "./storage";
import { localId, newExercise } from "./domain";
export function WorkoutExercisePicker({
  add,
  disabled = false,
}: {
  add: (exercise: WorkoutExercise) => void;
  disabled?: boolean;
}) {
  const [labels, setLabels] = useState<CustomExercise[]>([]),
    [selection, setSelection] = useState(""),
    [name, setName] = useState(""),
    [mode, setMode] = useState<WorkoutExercise["performanceMode"]>("load_reps"),
    [scope, setScope] =
      useState<WorkoutExercise["loadScope"]>("total_external"),
    [message, setMessage] = useState("");
  useEffect(() => {
    void getCustomExercises()
      .then(setLabels)
      .catch((error: Error) => setMessage(error.message));
  }, []);
  const submit = async () => {
    try {
      let custom = labels.find((item) => item.id === selection);
      const now = new Date().toISOString();
      if (!selection && name.trim()) {
        custom = {
          id: localId("custom_exercise"),
          schemaVersion: 1,
          displayName: name.trim(),
          performanceMode: mode,
          loadScope: scope,
          createdAt: now,
          updatedAt: now,
          archivedAt: null,
        };
        await saveCustomExercise(custom);
        setLabels([...labels, custom]);
      }
      if (custom) add(newExercise(custom, 1));
      else {
        const canonical = getPublishedExercises().find(
          (item) => item.id === selection,
        );
        if (!canonical)
          throw new Error(
            "Choose a reviewed exercise or enter a personal label.",
          );
        add({
          ...newExercise(
            {
              id: "custom_exercise_temporary",
              schemaVersion: 1,
              displayName: canonical.displayName,
              performanceMode: mode,
              loadScope: scope,
              createdAt: now,
              updatedAt: now,
              archivedAt: null,
            },
            1,
          ),
          exerciseRef: { kind: "canonical", exerciseId: canonical.id },
        });
      }
      setName("");
      setSelection("");
      setMessage("Exercise added to the workout.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Exercise could not be added.",
      );
    }
  };
  return (
    <section className="detail-section">
      <h2>Add exercise to this workout</h2>
      <fieldset className="local-form" disabled={disabled}>
        <label>
          Reviewed exercise or saved personal label
          <select
            value={selection}
            onChange={(event) => setSelection(event.target.value)}
          >
            <option value="">New personal label</option>
            {[
              ...getPublishedExercises(),
              ...labels.filter((item) => !item.archivedAt),
            ].map((item) => (
              <option key={item.id} value={item.id}>
                {item.displayName}
              </option>
            ))}
          </select>
        </label>
        {!selection && (
          <label>
            New personal label
            <input
              value={name}
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}
        <label>
          Performance mode for new entries
          <select
            value={mode}
            onChange={(event) => {
              const value = event.target.value as typeof mode;
              setMode(value);
              setScope(allowedScopes[value][0]);
            }}
          >
            {performanceModes.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Load scope
          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as typeof scope)}
          >
            {allowedScopes[mode].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            void submit();
          }}
        >
          Add exercise
        </button>
      </fieldset>
      <p role="status">{message}</p>
    </section>
  );
}
