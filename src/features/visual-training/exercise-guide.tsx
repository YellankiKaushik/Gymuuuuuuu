import { useState } from "react";
import type { Exercise } from "../exercises/schema";
import { ExercisePose } from "./schematics";
import { isPilotExercise } from "./scope";

export function ExerciseLearningGuide({ record }: { record: Exercise }) {
  const [state, setState] = useState<"SETUP" | "ACTION" | "RESET">("SETUP");
  if (!isPilotExercise(record.id)) return null;
  const instructions =
    state === "SETUP"
      ? record.technique?.setup
      : state === "ACTION"
        ? record.technique?.executionSteps
        : [
            record.technique?.finishOrReset ??
              "Not specified in current sources",
          ];
  return (
    <section
      className="pilot-guide"
      aria-labelledby="pilot-guide-title"
      data-exercise-id={record.id}
    >
      <div className="pilot-heading">
        <div>
          <span className="eyebrow">LEARN → CHOOSE → PLAN</span>
          <h2 id="pilot-guide-title">See the movement, one step at a time</h2>
          <p>
            {record.displayName} · {record.difficulty}
            {record.id === "exercise_one_arm_dumbbell_row"
              ? " — this intermediate label is unchanged."
              : ""}
          </p>
        </div>
        <a
          className="button primary"
          href={`/workout/plans?exercise=${record.id}`}
        >
          Add to personal plan
        </a>
      </div>
      <div className="segmented" role="group" aria-label="Exercise guide state">
        {(["SETUP", "ACTION", "RESET"] as const).map((s) => (
          <button
            type="button"
            key={s}
            aria-pressed={state === s}
            onClick={() => setState(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="pilot-guide-grid">
        <figure>
          <ExercisePose
            exerciseId={record.id}
            action={state === "ACTION"}
            label={`${record.displayName}: ${state.toLowerCase()}`}
          />
          <figcaption>
            Original source-based cue schematic · approximate, not measured. No
            autoplay. Unspecified details are omitted.
          </figcaption>
        </figure>
        <div aria-live="polite">
          <h3>
            {state === "SETUP"
              ? "Starting position"
              : state === "ACTION"
                ? "Movement sequence"
                : "Finish and reset"}
          </h3>
          <ol>
            {instructions?.length ? (
              instructions.map((text, i) => <li key={i}>{text}</li>)
            ) : (
              <li>Not specified in current sources</li>
            )}
          </ol>
          <p>
            Check the equipment, muscle-role qualifiers, checkpoints, common
            mistakes and stop guidance below before choosing an exercise.
          </p>
          <a href="#sources">Sources & review limitations</a>
        </div>
      </div>
    </section>
  );
}
