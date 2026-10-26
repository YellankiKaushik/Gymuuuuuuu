import { useId } from "react";
import type { Muscle } from "../muscles/schema";
import { isPilotMuscle } from "./scope";

// Broad location zones derived from the named records, never muscle boundaries.
const zones: Record<
  string,
  readonly [number, number, number, number, "Front" | "Back", boolean]
> = {
  muscle_biceps_brachii: [104, 182, 12, 28, "Front", false],
  muscle_triceps_brachii: [104, 182, 12, 28, "Back", false],
  muscle_deltoid: [110, 123, 17, 18, "Front", false],
  muscle_pectoralis_major: [135, 146, 18, 17, "Front", false],
  muscle_latissimus_dorsi: [131, 204, 18, 32, "Back", false],
  muscle_gluteus_maximus: [131, 276, 16, 21, "Back", false],
  muscle_rectus_femoris: [132, 342, 9, 33, "Front", false],
  muscle_vastus_lateralis: [121, 342, 7, 30, "Front", false],
  muscle_vastus_medialis: [143, 342, 6, 28, "Front", false],
  muscle_vastus_intermedius: [132, 342, 9, 33, "Front", true],
  muscle_gastrocnemius: [132, 432, 10, 29, "Back", false],
  muscle_soleus: [132, 432, 10, 29, "Back", true],
};
export function MuscleLocationFigure({
  record,
  compact = false,
}: {
  record: Pick<Muscle, "id" | "displayName" | "locationSummary">;
  compact?: boolean;
}) {
  const title = useId(),
    desc = useId();
  const zone = zones[record.id];
  if (!isPilotMuscle(record.id) || !zone) return null;
  const [x, y, rx, ry, side, deep] = zone;
  return (
    <figure
      className={`pilot-location ${compact ? "pilot-compact" : ""}`}
      data-muscle-id={record.id}
    >
      <svg
        viewBox="40 10 220 510"
        role="img"
        aria-labelledby={`${title} ${desc}`}
      >
        <title id={title}>
          {`${record.displayName}: approximate location, ${side.toLowerCase()} view`}
        </title>
        <desc id={desc}>
          {record.locationSummary ?? "Not specified in current sources"}. The
          marked zone locates a general region on one side, not exact boundaries
          or activation.{" "}
          {deep
            ? "The source describes a deep structure; the dashed zone does not show a surface muscle."
            : ""}
        </desc>
        <g className="pilot-body">
          <circle cx="150" cy="47" r="26" />
          <path d="M136 77h28l4 22 40 17 26 72 12 90-17 9-23-94-17-36-8 82 13 36-15 123-10 83 10 22-31 1-4-130-5-69-5 69-4 130-31-1 10-22-10-83-15-123 13-36-8-82-17 36-23 94-17-9 12-90 26-72 40-17z" />
          {side === "Back" ? (
            <path d="M150 110v130" />
          ) : (
            <path d="M125 126q25 16 50 0" />
          )}
        </g>
        <ellipse
          className="pilot-zone"
          cx={x}
          cy={y}
          rx={rx}
          ry={ry}
          strokeDasharray={deep ? "5 3" : undefined}
        />
      </svg>
      <figcaption>
        <strong>{side} · approximate location</strong>
        {!compact && (
          <>
            <p>
              {record.locationSummary ?? "Not specified in current sources"}
            </p>
            <p>
              {deep
                ? "Deep structure: the dashed zone indicates location, not a surface outline. "
                : "One illustrative region is highlighted. "}
              Not to scale; no exact boundaries or activation measurement.
            </p>
            <a href="#sources">Source basis & limitations</a>
          </>
        )}
      </figcaption>
    </figure>
  );
}

type Pose = {
  head: readonly [number, number];
  body: string;
  arms?: readonly string[];
  legs: readonly string[];
  weights?: readonly string[];
};
const curl: readonly [Pose, Pose] = [
  {
    head: [140, 55],
    body: "140,78 140,160",
    arms: ["140,95 108,130 108,177", "140,95 172,130 172,177"],
    legs: ["140,160 118,235", "140,160 162,235"],
    weights: ["108,177", "172,177"],
  },
  {
    head: [140, 55],
    body: "140,78 140,160",
    arms: ["140,95 108,130 127,95", "140,95 172,130 153,95"],
    legs: ["140,160 118,235", "140,160 162,235"],
    weights: ["127,95", "153,95"],
  },
];
const poses: Record<string, readonly [Pose, Pose]> = {
  exercise_dumbbell_curl: curl,
  exercise_bodyweight_squat: [
    {
      head: [140, 55],
      body: "140,78 140,160",
      legs: ["140,160 120,235", "140,160 160,235"],
    },
    {
      head: [120, 85],
      body: "120,108 100,165",
      legs: ["100,165 155,180 120,235", "100,165 170,180 160,235"],
    },
  ],
  exercise_incline_push_up: [
    {
      head: [140, 65],
      body: "147,87 115,175",
      arms: ["145,105 190,105 230,105"],
      legs: ["115,175 85,235", "115,175 110,235"],
    },
    {
      head: [185, 65],
      body: "180,88 140,175",
      arms: ["180,105 195,135 230,105"],
      legs: ["140,175 85,235", "140,175 110,235"],
    },
  ],
  exercise_one_arm_dumbbell_row: [
    {
      head: [205, 95],
      body: "183,104 100,110",
      arms: ["180,105 180,160", "150,105 150,160 150,212"],
      legs: ["100,110 115,160", "100,110 65,235"],
      weights: ["150,212"],
    },
    {
      head: [205, 95],
      body: "183,104 100,110",
      arms: ["180,105 180,160", "150,105 120,135 160,150"],
      legs: ["100,110 115,160", "100,110 65,235"],
      weights: ["160,150"],
    },
  ],
  exercise_seated_dumbbell_shoulder_press: [
    {
      head: [150, 70],
      body: "150,93 150,170",
      arms: ["150,105 115,125 115,95", "150,105 185,125 185,95"],
      legs: ["150,170 110,185 110,235", "150,170 190,185 190,235"],
      weights: ["115,95", "185,95"],
    },
    {
      head: [150, 70],
      body: "150,93 150,170",
      arms: ["150,105 120,85 125,30", "150,105 180,85 175,30"],
      legs: ["150,170 110,185 110,235", "150,170 190,185 190,235"],
      weights: ["125,30", "175,30"],
    },
  ],
  exercise_standing_calf_raise: [
    {
      head: [130, 55],
      body: "130,78 130,160",
      arms: ["130,100 180,120 205,120"],
      legs: ["130,160 130,235 150,235"],
    },
    {
      head: [130, 43],
      body: "130,66 130,148",
      arms: ["130,88 180,115 205,120"],
      legs: ["130,148 138,220 150,235"],
    },
  ],
};
export function ExercisePose({
  exerciseId,
  action,
  label,
}: {
  exerciseId: string;
  action: boolean;
  label: string;
}) {
  const title = useId(),
    desc = useId(),
    pair = poses[exerciseId];
  if (!pair) return null;
  const pose = pair[action ? 1 : 0];
  return (
    <svg
      className="pilot-pose"
      viewBox="30 5 240 245"
      role="img"
      aria-labelledby={`${title} ${desc}`}
    >
      <title
        id={title}
      >{`${label} — original approximate cue illustration`}</title>
      <desc id={desc}>
        Only source-described movement cues are illustrated; unpictured details
        are not specified. This is not a measured pose, joint-angle diagram or
        guarantee of technique. Read the adjacent instructions and safety
        guidance.
      </desc>
      <g className="pilot-apparatus" fill="none" stroke="currentColor">
        <path d="M40 240h220" />
        {exerciseId === "exercise_incline_push_up" && <path d="M230 25v215" />}
        {exerciseId === "exercise_one_arm_dumbbell_row" && (
          <path d="M85 160h120v10H85zM100 170v70M190 170v70" />
        )}
        {exerciseId === "exercise_seated_dumbbell_shoulder_press" && (
          <path d="M100 180h100M110 180v60M190 180v60" />
        )}
        {exerciseId === "exercise_standing_calf_raise" && (
          <path d="M205 100v140M185 155h55v85" />
        )}
      </g>
      <g
        className="pilot-person"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx={pose.head[0]} cy={pose.head[1]} r="17" />
        <polyline points={pose.body} />
        {pose.arms?.map((p, i) => (
          <polyline key={`arm${i}`} points={p} />
        ))}
        {pose.legs.map((p, i) => (
          <polyline key={`leg${i}`} points={p} />
        ))}
        {pose.weights?.map((p) => {
          const [x, y] = p.split(",").map(Number);
          return <path key={p} d={`M${x! - 9} ${y}h18m-18-5v10m18-10v10`} />;
        })}
      </g>
    </svg>
  );
}
