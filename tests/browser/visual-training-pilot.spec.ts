import { test, expect, settleLayout, type Page } from "./test";
import AxeBuilder from "@axe-core/playwright";
import { readFile, mkdir } from "node:fs/promises";
import muscles from "../../src/content/muscles/records.json" with { type: "json" };
import exercises from "../../src/content/exercises/records.json" with { type: "json" };
import {
  pilotMuscleIds,
  pilotExerciseIds,
} from "../../src/features/visual-training/scope";
import type { BackupEnvelope } from "../../src/features/data-management/service";
import { muscleSchema } from "../../src/features/muscles/schema";

const status = (page: Page) => page.locator(".personal-plans [role=status]");
async function answerConfirmation(page: Page, name: string, accept: boolean) {
  const dialog = page.waitForEvent("dialog");
  const clicked = page.getByRole("button", { name, exact: true }).click();
  const shown = await dialog;
  if (accept) await shown.accept();
  else await shown.dismiss();
  await clicked;
}
async function openPlan(page: Page, name = "SYNTHETIC-PRIVATE-PILOT") {
  await page.goto("/workout/plans");
  await page.getByLabel("Plan name", { exact: true }).fill(name);
  await page
    .getByRole("combobox", { name: "Exercise for Session A", exact: true })
    .selectOption("exercise_dumbbell_curl");
  await page
    .getByRole("button", { name: "Add exercise to Session A", exact: true })
    .click();
}
async function save(page: Page) {
  await page
    .getByRole("button", { name: "Save personal plan", exact: true })
    .click();
  await expect(status(page)).toHaveText("Saved personal plan in this browser.");
}
async function readPlans(page: Page) {
  return page.evaluate(async () => {
    const request = indexedDB.open("fitness-os-local");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<
        {
          id: string;
          payload: {
            name: string;
            revision: number;
            sessions: {
              id: string;
              entries: {
                exerciseId: string;
                repetitions: number | null;
                restSeconds: number | null;
              }[];
            }[];
          };
        }[]
      >((resolve, reject) => {
        const read = db.transaction("records").objectStore("records").getAll();
        read.onsuccess = () => resolve(read.result);
        read.onerror = () => reject(read.error);
      });
    } finally {
      db.close();
    }
  });
}
for (const id of pilotMuscleIds) {
  const record = muscleSchema.parse(muscles.find((r) => r.id === id));
  test(`pilot muscle immutable visual ${id}`, async ({ page }) => {
    await page.goto(`/muscles/${record.slug}`);
    const visual = page.locator(`[data-muscle-id="${id}"]`);
    await expect(visual).toHaveCount(1);
    await expect(visual.getByRole("img")).toHaveAccessibleName(
      new RegExp(record.displayName),
    );
    await expect(visual).toContainText(record.locationSummary!);
    await expect(page.locator("#sources")).toBeVisible();
    for (const action of record.jointActions)
      if (action.qualifier)
        await expect(page.locator("#actions")).toContainText(action.qualifier);
  });
}
for (const id of pilotExerciseIds) {
  const record = exercises.find((r) => r.id === id)!;
  test(`pilot guide states and add link ${id}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/exercises/${record.slug}`);
    const guide = page.locator(`[data-exercise-id="${id}"]`);
    await expect(guide).toContainText(record.difficulty);
    for (const state of ["ACTION", "RESET", "SETUP"]) {
      const button = guide.getByRole("button", { name: state, exact: true });
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(guide.getByRole("img")).toHaveAccessibleName(
        new RegExp(state.toLowerCase()),
      );
    }
    await expect(page.locator("#muscles")).toBeVisible();
    await expect(page.locator("#safety")).toBeVisible();
    if (id === "exercise_one_arm_dumbbell_row")
      await expect(guide).toContainText("intermediate");
    await guide
      .getByRole("link", { name: "Add to personal plan", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", {
        name: "Exercise for Session A",
        exact: true,
      }),
    ).toHaveValue(id);
    expect(errors).toEqual([]);
  });
}

test("pilot complete muscle-to-history journey preserves a workout after later plan edits", async ({
  page,
  context,
}) => {
  const requests: string[] = [],
    errors: string[] = [],
    marker = "SYNTHETIC-PRIVATE-PILOT";
  page.on("request", (r) =>
    requests.push(
      JSON.stringify({
        url: r.url(),
        body: r.postData(),
        headers: r.headers(),
      }),
    ),
  );
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/muscles/biceps-brachii");
  await page
    .locator("#exercises")
    .getByRole("link", { name: /Dumbbell curl/ })
    .click();
  await page
    .getByRole("link", { name: "Add to personal plan", exact: true })
    .click();
  await page.getByLabel("Plan name", { exact: true }).fill(marker);
  await page
    .getByRole("button", { name: "Add exercise to Session A", exact: true })
    .click();
  await page.getByLabel("Intended sets", { exact: true }).fill("1");
  await page.getByLabel("Intended repetitions", { exact: true }).fill("5");
  await page.getByLabel("Rest (optional)", { exact: true }).fill("0.5");
  await page
    .getByRole("combobox", { name: "Rest unit", exact: true })
    .selectOption("min");
  await page
    .getByRole("button", { name: "Add Session B", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Add Session B", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("combobox", { name: "Exercise for Session B", exact: true })
    .selectOption("exercise_one_arm_dumbbell_row");
  await page
    .getByRole("button", { name: "Add exercise to Session B", exact: true })
    .click();
  await save(page);
  await expect(
    page.getByRole("button", { name: "Save personal plan", exact: true }),
  ).toBeDisabled();
  expect(await readPlans(page)).toHaveLength(1);
  await page.reload();
  await page
    .getByRole("button", { name: `${marker} · revision 1`, exact: true })
    .click();
  await expect(
    page.getByLabel("Intended repetitions", { exact: true }).first(),
  ).toHaveValue("5");
  await expect(
    page.getByLabel("Rest (optional)", { exact: true }).first(),
  ).toHaveValue("30");
  await expect(
    page.getByLabel("Intended sets", { exact: true }).nth(1),
  ).toHaveValue("");
  await page
    .getByRole("button", { name: "Start Session A", exact: true })
    .click();
  await expect(page).toHaveURL(/\/workout\/session\//);
  const sessionUrl = page.url();
  await page
    .getByRole("button", { name: "Take over editor", exact: true })
    .click();
  await page.getByLabel("Repetitions", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Complete set", exact: true }).click();
  await expect(
    page.getByText("Set 1 · completed", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page).toHaveURL(/\/workout\/summary\//);
  await page.getByRole("link", { name: "History", exact: true }).click();
  await expect(
    page.getByRole("link", { name: new RegExp(marker) }).first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "Personal plans", exact: true }).click();
  await page
    .getByRole("button", { name: `${marker} · revision 1`, exact: true })
    .click();
  await page
    .getByLabel("Intended repetitions", { exact: true })
    .first()
    .fill("9");
  await save(page);
  await page.goto(sessionUrl);
  await expect(page.getByLabel("Repetitions", { exact: true })).toHaveValue(
    "5",
  );
  expect(
    await page.evaluate(async () => {
      const req = indexedDB.open("fitness-os");
      const db = await new Promise<IDBDatabase>((resolve) => {
        req.onsuccess = () => resolve(req.result);
      });
      const rows = await new Promise<
        { exercises: { sets: { plannedTarget: { repsMin: number } }[] }[] }[]
      >((resolve) => {
        const read = db
          .transaction("workoutSessions")
          .objectStore("workoutSessions")
          .getAll();
        read.onsuccess = () => resolve(read.result);
      });
      db.close();
      return rows[0]!.exercises[0]!.sets[0]!.plannedTarget.repsMin;
    }),
  ).toBe(5);
  expect(
    await (await context.request.get("/workout/plans")).text(),
  ).not.toContain(marker);
  expect(requests.every((r) => !r.includes(marker))).toBe(true);
  expect(
    requests.every(
      (r) => new URL(JSON.parse(r).url).origin === "http://127.0.0.1:3000",
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      (m) => JSON.stringify(localStorage).includes(m),
      marker,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
});

test("pilot empty/invalid targets, reordering, removal and two-session cap", async ({
  page,
}) => {
  await page.goto("/workout/plans");
  await expect(
    page.getByRole("button", { name: "Start Session A", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Save personal plan", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Name the plan");
  await page.getByLabel("Plan name", { exact: true }).fill("Empty saved draft");
  await save(page);
  await expect(
    page.getByRole("button", { name: "Start Session A", exact: true }),
  ).toBeDisabled();
  for (const id of ["exercise_dumbbell_curl", "exercise_standing_calf_raise"]) {
    await page
      .getByRole("combobox", { name: "Exercise for Session A", exact: true })
      .selectOption(id);
    await page
      .getByRole("button", { name: "Add exercise to Session A", exact: true })
      .click();
  }
  await page
    .getByRole("button", {
      name: "Move up Standing calf raise in Session A",
      exact: true,
    })
    .click();
  await expect(page.locator(".personal-plan-entries h3").first()).toHaveText(
    "Standing calf raise",
  );
  for (const [label, value] of [
    ["Intended sets", "0"],
    ["Intended repetitions", "-1"],
    ["Rest (optional)", "-1"],
  ]) {
    const input = page.getByLabel(label!, { exact: true }).first();
    await input.fill(value!);
    await page
      .getByRole("button", { name: "Save personal plan", exact: true })
      .click();
    await expect(page.getByRole("alert")).not.toBeEmpty();
    await expect(input).toHaveValue(value!);
    await input.fill("");
  }
  await page
    .getByRole("button", {
      name: "Remove Dumbbell curl from Session A",
      exact: true,
    })
    .click();
  await expect(page.locator(".personal-plan-entries h3")).toHaveCount(1);
  await save(page);
  expect(
    (await readPlans(page))[0]!.payload.sessions[0]!.entries[0],
  ).toMatchObject({ repetitions: null, restSeconds: null });
});

test("pilot cross-tab conflicts keep drafts and deletion requires confirmation", async ({
  page,
  context,
}) => {
  await openPlan(page, "Concurrent pilot");
  await save(page);
  const second = await context.newPage();
  await second.goto("http://127.0.0.1:3000/workout/plans");
  await second
    .getByRole("button", { name: "Concurrent pilot · revision 1", exact: true })
    .click();
  await second
    .getByLabel("Plan name", { exact: true })
    .fill("Keep stale draft");
  await page
    .getByLabel("Plan name", { exact: true })
    .fill("First committed edit");
  await save(page);
  await second
    .getByRole("button", { name: "Save personal plan", exact: true })
    .click();
  await expect(second.getByRole("alert")).toContainText("another tab");
  await expect(second.getByLabel("Plan name", { exact: true })).toHaveValue(
    "Keep stale draft",
  );
  await answerConfirmation(second, "Reload saved plan", false);
  await expect(second.getByLabel("Plan name", { exact: true })).toHaveValue(
    "Keep stale draft",
  );
  await answerConfirmation(second, "Reload saved plan", true);
  await expect(second.getByLabel("Plan name", { exact: true })).toHaveValue(
    "First committed edit",
  );
  await answerConfirmation(second, "Delete personal plan", false);
  expect(await readPlans(second)).toHaveLength(1);
  await answerConfirmation(second, "Delete personal plan", true);
  await expect(status(second)).toContainText("Personal plan deleted");
  expect(await readPlans(second)).toHaveLength(0);
  await second.close();
});

test("pilot failed writes keep both saved revision and visible draft", async ({
  page,
}) => {
  await openPlan(page, "Before failed write");
  await save(page);
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (
      value: unknown,
      key?: IDBValidKey,
    ) {
      if (this.name === "records")
        throw new DOMException("Synthetic quota fault", "QuotaExceededError");
      return put.call(this, value, key);
    };
  });
  await page
    .getByLabel("Plan name", { exact: true })
    .fill("Draft survives fault");
  await page
    .getByRole("button", { name: "Save personal plan", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "draft is still on this page",
  );
  await expect(page.getByLabel("Plan name", { exact: true })).toHaveValue(
    "Draft survives fault",
  );
  expect((await readPlans(page))[0]!.payload.name).toBe("Before failed write");
});

test("pilot global backup UI restores plan into a fresh profile and CSV neutralizes formulas", async ({
  page,
  browser,
}) => {
  await page.addInitScript(() =>
    Reflect.deleteProperty(window, "showSaveFilePicker"),
  );
  await openPlan(page, "=SYNTHETIC_FORMULA");
  await save(page);
  const csvEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export saved plan CSV", exact: true })
    .click();
  const csv = await readFile((await (await csvEvent).path())!, "utf8");
  expect(csv).toContain('"\'=SYNTHETIC_FORMULA"');
  expect(csv).toContain('"exercise_dumbbell_curl"');
  await page.goto("/settings/data/backup");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Create backup file", exact: true })
    .click();
  const path = (await (await download).path())!;
  const archive: BackupEnvelope = JSON.parse(await readFile(path, "utf8"));
  expect(
    archive.payload.modules
      .flatMap((m) => m.stores)
      .find((s) => s.databaseName === "fitness-os-local")!.records,
  ).toHaveLength(1);
  const clean = await browser.newContext();
  try {
    const restored = await clean.newPage();
    await restored.goto("http://127.0.0.1:3000/settings/data/restore");
    await restored
      .getByRole("button", { name: "Prepare local storage", exact: true })
      .click();
    await expect(restored.getByRole("status")).toContainText(
      "Local storage is ready",
    );
    await restored
      .getByLabel("Backup file", { exact: true })
      .setInputFiles(path);
    await expect(
      restored.getByRole("heading", { name: "Preview passed", exact: true }),
    ).toBeVisible();
    expect(await readPlans(restored)).toHaveLength(0);
    await restored
      .getByRole("button", { name: "Keep existing records", exact: true })
      .click();
    await expect(restored.getByRole("status")).toContainText(
      "Restore completed",
    );
    await restored.goto("http://127.0.0.1:3000/workout/plans");
    await restored
      .getByRole("button", {
        name: "=SYNTHETIC_FORMULA · revision 1",
        exact: true,
      })
      .click();
    await expect(restored.locator(".personal-plan-entries h3")).toHaveText(
      "Dumbbell curl",
    );
  } finally {
    await clean.close();
  }
});

for (const [kind, path] of [
  ["muscle", "/muscles/vastus-intermedius"],
  ["guide", "/exercises/one-arm-dumbbell-row"],
  ["plans", "/workout/plans"],
] as const)
  for (const width of [320, 375, 393, 768, 1024, 1280, 1440])
    test(`@a11y pilot ${kind} ${width}px light/dark/Auto reduced-motion`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      if (kind === "plans") {
        await openPlan(page);
        await page
          .getByRole("button", { name: "Add Session B", exact: true })
          .click();
      } else await page.goto(path);
      for (const [theme, scheme] of [
        ["light", "light"],
        ["dark", "dark"],
        ["system", "light"],
        ["system", "dark"],
      ] as const) {
        await page.emulateMedia({ colorScheme: scheme });
        await page.evaluate((value) => {
          const key = "fitness-os:preferences:v1";
          localStorage.setItem(
            key,
            JSON.stringify({
              ...JSON.parse(localStorage.getItem(key) ?? "{}"),
              theme: value,
              units: "metric",
            }),
          );
          window.dispatchEvent(new StorageEvent("storage", { key }));
        }, theme);
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          theme === "system" ? scheme : theme,
        );
        await settleLayout(page);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${kind} ${width} ${theme} ${scheme}`,
        ).toBe(true);
        expect(await page.locator("main").count()).toBe(1);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        if (
          info.project.name === "chromium" &&
          [320, 768, 1440].includes(width) &&
          theme !== "system"
        ) {
          await mkdir("artifacts/phase20/screenshots", { recursive: true });
          await page.screenshot({
            path: `artifacts/phase20/screenshots/${kind}-${width}-${theme}.png`,
            fullPage: true,
          });
        }
      }
      const input = page.locator(".personal-plan-editor input").first();
      if (kind === "plans") {
        await input.focus();
        await expect(input).toBeFocused();
        expect(
          await input.evaluate((el) => getComputedStyle(el).outlineStyle),
        ).not.toBe("none");
      }
    });
