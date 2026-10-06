import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { publicPlanSchema } from "../../src/features/cardio/public-plan";

export function extractRunningSessions(html: string) {
  const text = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?(?:p|li|h[1-6]|dt|dd)\b[^>]*>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
  const parts = text.split(/(Week [1-9]: Run [1-3])/).slice(1);
  const seconds = (value: string) => {
    const match = /^(\d+) minutes?(?: (\d+) seconds?)?$/.exec(
      value.replace(" and ", " "),
    );
    if (!match) throw Error(`Unsupported source duration: ${value}`);
    return Number(match[1]) * 60 + Number(match[2] ?? 0);
  };
  const sessions: {
    week: number;
    run: number;
    totalSeconds: number;
    segments: {
      kind: "warm_up" | "run" | "walk" | "cool_down";
      seconds: number;
    }[];
  }[] = [];
  for (let index = 0; index < parts.length; index += 2) {
    const title = parts[index]!,
      body = parts[index + 1]!;
    const identity = /^Week (\d): Run (\d)$/.exec(title)!;
    const total = /Total time: (.*?) \(excluding stretches\)/.exec(body);
    if (!total) throw Error(`Source total missing: ${title}`);
    const lines = body.split("\n"),
      start = lines.indexOf("Warm-up:");
    if (start < 0) throw Error(`Source warm-up missing: ${title}`);
    const segments: (typeof sessions)[number]["segments"] = [];
    const labels: Readonly<Record<string, (typeof segments)[number]["kind"]>> =
      {
        "Warm-up": "warm_up",
        Run: "run",
        Walk: "walk",
        "Final run": "run",
        "Cool-down": "cool_down",
      };
    for (let offset = start; offset < lines.length; offset++) {
      const label = lines[offset]!.replace(/:$/, ""),
        kind = labels[label];
      if (!kind) continue;
      const value = lines[offset + 1]!;
      if (value.startsWith("Run for ")) {
        const repeated =
          /^Run for (.*?) and walk for (.*?)\. Do this (\d+) times in total$/.exec(
            value,
          );
        if (!repeated) throw Error(`Unsupported source interval: ${value}`);
        for (let repetition = 0; repetition < Number(repeated[3]); repetition++)
          segments.push(
            { kind: "run", seconds: seconds(repeated[1]!) },
            { kind: "walk", seconds: seconds(repeated[2]!) },
          );
      } else
        segments.push({ kind, seconds: seconds(value.replace(" walk", "")) });
      if (kind === "cool_down") break;
    }
    const totalSeconds = seconds(total[1]!);
    if (segments.reduce((sum, part) => sum + part.seconds, 0) !== totalSeconds)
      throw Error(`Source interval total mismatch: ${title}`);
    sessions.push({
      week: Number(identity[1]),
      run: Number(identity[2]),
      totalSeconds,
      segments,
    });
  }
  if (sessions.length !== 27)
    throw Error("Source must contain all 27 runs; import was not written.");
  return sessions;
}

export function preserveImmutableRunningSnapshot(
  existing: unknown,
  next: unknown,
) {
  const saved = publicPlanSchema.parse(existing),
    proposed = publicPlanSchema.parse(next);
  if (
    saved.sourceHtmlSha256 !== proposed.sourceHtmlSha256 ||
    saved.sourceId !== proposed.sourceId ||
    saved.version !== proposed.version ||
    JSON.stringify(saved.sessions) !== JSON.stringify(proposed.sessions)
  )
    throw Error(
      "Source snapshot changed. Create and review a new immutable source/version; existing data was preserved.",
    );
  return saved;
}

if (process.argv.includes("--import")) {
  const filename = process.argv[process.argv.indexOf("--import") + 1];
  if (!filename) throw Error("Provide a saved original source HTML file.");
  const html = readFileSync(filename, "utf8");
  const plan = publicPlanSchema.parse({
    version: "1.0.0",
    sourceId: "nhs_running_plan_snapshot_2026",
    sourceUrl:
      "https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan/",
    sourceHtmlSha256: createHash("sha256").update(html).digest("hex"),
    extractedAt: new Date().toISOString(),
    sourceDate: null,
    goal: "Build toward 30 minutes of continuous running at your own comfortable pace.",
    experience: "beginner",
    durationWeeks: 9,
    sessionsPerWeek: 3,
    minimumRestDaysBetweenRuns: 1,
    equipment: ["A timer", "Comfortable running shoes"],
    intensity: {
      method: "manual_text",
      methodVersion: "source-running-comfortable-1",
      instruction:
        "Run at a pace that feels comfortable for you. Focus on time rather than speed; walk during the scheduled walking intervals.",
    },
    progression:
      "Follow the source's run durations in sequence, with a rest day between runs. The final week contains 30-minute runs; distance depends on your pace.",
    regression:
      "Repeat a week if you do not feel ready to progress. Slow down or take a walking break when needed; stop if something does not feel right.",
    attribution:
      "Contains public sector information licensed under the Open Government Licence v3.0. Original source schedule retrieved 5 October 2026; this rendering has no NHS endorsement or independent clinical review.",
    licenceUrl:
      "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    sessions: extractRunningSessions(html),
  });
  const destination = "src/content/provenance/running-plan-snapshot.json";
  if (existsSync(destination)) {
    preserveImmutableRunningSnapshot(
      JSON.parse(readFileSync(destination, "utf8")),
      plan,
    );
    console.log(
      "The existing immutable snapshot matches the source; extraction dates and data were preserved.",
    );
  } else {
    writeFileSync(`${destination}.tmp`, JSON.stringify(plan, null, 2) + "\n");
    renameSync(`${destination}.tmp`, destination);
  }
  console.log(
    "Validated 27 source runs before writing the immutable numeric snapshot; no media copied.",
  );
}
