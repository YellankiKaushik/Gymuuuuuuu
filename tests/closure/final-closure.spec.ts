import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { BackupEnvelope } from "../../src/features/data-management/service";

const routes = [
  "/",
  "/search",
  "/workout",
  "/foods",
  "/nutrition",
  "/diet-planning",
  "/recipes/chickpea-cucumber-bowl",
  "/recovery",
  "/cardio",
  "/supplements",
  "/progress",
  "/settings/data/backup",
];
const marker = "SYNTHETIC-CLOSURE-PRIVATE";
const databases = [
  "fitness-os",
  "fitness-os-local",
  "fitness-os-diet-planning",
  "fitness-os-recipes-meal-plans",
  "fitness-os-recovery-sleep-mobility",
  "fitness-os-cardio-conditioning",
  "fitness-os-supplements-evidence",
];
type Observation = {
  requests: number;
  remotes: string[];
  leaks: string[];
  errors: string[];
  failedAssets: string[];
};

async function monitor(
  context: BrowserContext,
  origin: string,
  observation: Observation,
) {
  context.on("request", (request) => {
    observation.requests++;
    if (new URL(request.url()).origin !== origin)
      observation.remotes.push(request.url());
    if (
      (
        request.url() +
        JSON.stringify(request.headers()) +
        (request.postData() ?? "")
      ).includes(marker)
    )
      observation.leaks.push(request.url());
  });
  context.on("response", (response) => {
    if (
      response.status() >= 500 ||
      (!response.request().isNavigationRequest() && response.status() >= 400)
    )
      observation.failedAssets.push(response.url());
  });
  const attach = (page: Page) =>
    page.on("pageerror", (error) => observation.errors.push(error.message));
  context.on("page", attach);
  for (const page of context.pages()) attach(page);
}

async function ready(page: Page, route: string) {
  const response = await page.goto(route);
  expect(response?.status(), route).toBeLessThan(400);
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Search Fitness OS", exact: true }),
  ).toBeEnabled();
}

async function geometry(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const outside = await page
    .locator("main button, main input, main select")
    .evaluateAll((elements) =>
      elements
        .filter((element) => {
          const rect = element.getBoundingClientRect(),
            style = getComputedStyle(element);
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== "hidden" &&
            (rect.left < -1 || rect.right > innerWidth + 1) &&
            !element.closest('[role="region"]')
          );
        })
        .map((element) => element.outerHTML.slice(0, 160)),
    );
  expect(outside).toEqual([]);
}

async function snapshot(page: Page) {
  return page.evaluate(async (names) => {
    const result: Record<string, Record<string, unknown[]>> = {};
    for (const name of names) {
      const available = await indexedDB.databases();
      if (!available.some((database) => database.name === name)) continue;
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(name);
        request.onupgradeneeded = () => request.transaction?.abort();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      try {
        result[name] = {};
        for (const store of db.objectStoreNames) {
          result[name]![store] = await new Promise<unknown[]>(
            (resolve, reject) => {
              const request = db
                .transaction(store, "readonly")
                .objectStore(store)
                .getAll();
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            },
          );
        }
      } finally {
        db.close();
      }
    }
    return result;
  }, databases);
}

async function downloadBackup(page: Page, fullMedia = false) {
  await ready(page, "/settings/data/backup");
  if (fullMedia)
    await page.getByLabel("Include progress-photo binary media").check();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Create backup file", exact: true })
    .click();
  return JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  ) as BackupEnvelope;
}

function canonical(backup: BackupEnvelope) {
  return backup.payload.modules
    .flatMap((module) =>
      module.stores.map((store) => ({
        database: store.databaseName,
        store: store.storeId,
        records: store.records,
      })),
    )
    .filter(
      (store) =>
        !/phase17(?:AuditEvents|BackupReceipts|RestoreJournal)/.test(
          store.store,
        ),
    )
    .sort((a, b) =>
      `${a.database}:${a.store}`.localeCompare(`${b.database}:${b.store}`),
    );
}

test.beforeEach(async ({ context, baseURL }) => {
  if (!baseURL) throw Error("Closure requires an explicit origin.");
  await context.addInitScript(() =>
    Reflect.deleteProperty(window, "showSaveFilePicker"),
  );
});

test("touch/orientation, keyboard-height approximation and tablet split widths", async ({
  page,
  isMobile,
  hasTouch,
  viewport,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const initial = viewport ?? { width: 1440, height: 900 };
  const sizes = isMobile
    ? [
        initial,
        { width: initial.height, height: initial.width },
        { width: 512, height: 768 },
        { width: initial.width, height: 360 },
      ]
    : [initial, { width: 768, height: 1024 }, { width: 512, height: 768 }];
  const states: unknown[] = [];
  for (const route of routes) {
    await ready(page, route);
    for (const size of sizes) {
      await page.setViewportSize(size);
      for (const theme of ["light", "dark"]) {
        await page.evaluate(
          (value) => (document.documentElement.dataset.theme = value),
          theme,
        );
        await geometry(page);
        states.push({ route, ...size, theme });
      }
    }
  }
  await ready(page, "/");
  if (hasTouch) {
    expect(
      await page.evaluate(() => matchMedia("(pointer: coarse)").matches),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Search Fitness OS", exact: true })
      .tap();
  } else
    await page
      .getByRole("button", { name: "Search Fitness OS", exact: true })
      .click();
  await expect(
    page.getByRole("dialog", { name: "Search Fitness OS" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Search Fitness OS on this device" })
    .fill("food");
  await expect(page.getByRole("option").first()).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/foods/);
  await info.attach("device-states", {
    body: JSON.stringify({ isMobile, hasTouch, states }),
    contentType: "application/json",
  });
});

test("persistent daily records survive browser restart, cross-tab edit and independent backup restore", async ({
  playwright,
  browserName,
  baseURL,
}, info) => {
  if (!baseURL) throw Error("Missing origin.");
  const origin = new URL(baseURL).origin;
  const observation: Observation = {
    requests: 0,
    remotes: [],
    leaks: [],
    errors: [],
    failedAssets: [],
  };
  const directory = resolve(
    "artifacts/final-closure/profiles",
    `${info.project.name}-${Date.now()}`,
  );
  const configured = info.project.use;
  const options = {
    baseURL,
    viewport: configured.viewport,
    screen: configured.contextOptions?.screen,
    deviceScaleFactor: configured.deviceScaleFactor,
    isMobile: configured.isMobile,
    hasTouch: configured.hasTouch,
    userAgent: configured.userAgent,
    acceptDownloads: true,
  };
  let context = await playwright[browserName].launchPersistentContext(
    directory,
    options,
  );
  const observe = async () => {
    await monitor(context, origin, observation);
    await context.addInitScript(() =>
      Reflect.deleteProperty(window, "showSaveFilePicker"),
    );
  };
  await observe();
  let page = context.pages()[0] ?? (await context.newPage());
  try {
    await ready(page, "/settings/data/restore");
    await page
      .getByRole("button", { name: "Prepare local storage", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText(
      "Local storage is ready",
    );
    await ready(page, "/workout");
    await page
      .getByLabel("Personal exercise label", { exact: true })
      .fill(`${marker} lift`);
    await page.getByRole("button", { name: "Save label and select" }).click();
    await page
      .getByLabel("Workout title", { exact: true })
      .fill(`${marker} workout`);
    await page
      .getByRole("button", { name: "Start workout", exact: true })
      .click();
    await page.getByRole("button", { name: "Take over editor" }).click();
    await page.getByLabel("Load (kg)", { exact: true }).fill("20");
    await page.getByLabel("Repetitions", { exact: true }).fill("5");
    await page
      .getByRole("button", { name: "Complete set", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Finish workout", exact: true })
      .click();
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(page).toHaveURL(/workout\/summary\//);
    await ready(page, "/nutrition/add");
    await page.getByLabel("Quick-add description").fill(`${marker} meal`);
    await page.getByLabel("Energy (kcal) · required").fill("100");
    await page
      .getByRole("button", { name: "Save consumed entry", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Saved on this device" }),
    ).toBeVisible();
    await ready(page, "/diet-planning/energy");
    await page.getByLabel("I understand this limitation").check();
    await page.getByLabel("Age (years)", { exact: true }).fill("30");
    await page
      .getByLabel("Sex used by the source equation")
      .selectOption("male");
    await page.getByLabel("Height (cm)", { exact: true }).fill("175");
    await page.getByLabel("Current weight (kg)", { exact: true }).fill("75");
    await page.getByLabel("Physical-activity category").selectOption("active");
    await expect(
      page.getByText("3025 kcal/day", { exact: true }).first(),
    ).toBeVisible();
    await page.getByRole("link", { name: "Next: Goal", exact: true }).click();
    await page.getByRole("link", { name: "Next: Macros", exact: true }).click();
    await expect(page).toHaveURL(/diet-planning\/macros$/);
    await expect(
      page.getByRole("heading", { name: "Macros planner", exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Plan name", { exact: true })
      .fill(`${marker} target`);
    await page
      .getByRole("button", { name: "Save on this device", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Saved on this device" }),
    ).toBeVisible();
    await ready(page, "/recovery/check-in");
    await page.getByLabel("Energy", { exact: true }).selectOption("2");
    await page.getByLabel("General fatigue", { exact: true }).selectOption("4");
    await page
      .getByRole("button", { name: "Save check-in", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Check-in saved" }),
    ).toBeVisible();
    await ready(page, "/cardio/session/new");
    await page
      .getByLabel("Session title", { exact: true })
      .fill(`${marker} cardio`);
    await page.getByLabel("Record a completed session manually").check();
    await page
      .getByLabel("Actual start timestamp with offset")
      .fill("2026-10-04T10:00:00Z");
    await page
      .getByLabel("Actual elapsed seconds", { exact: true })
      .fill("1500");
    await page
      .getByRole("button", { name: "Save completed manual session" })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Manual session saved" }),
    ).toBeVisible();
    await ready(page, "/progress/weight");
    await page.getByLabel("Weight", { exact: true }).fill("70.5");
    await page
      .getByRole("button", { name: "Save measurement", exact: true })
      .click();
    await expect(page.getByText("70.5 kg", { exact: true })).toBeVisible();
    await ready(page, "/progress/photos");
    await page
      .getByLabel("Image file", { exact: true })
      .setInputFiles("tests/fixtures/closure/synthetic.png");
    await page
      .getByRole("button", { name: "Sanitize and save photo", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Saved successfully");
    await ready(page, "/search?q=apple&type=food");
    await page
      .getByRole("button", { name: "Favourite", exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Add to compare", exact: true })
      .first()
      .click();
    await page.reload();
    const portable = await downloadBackup(page);
    expect(portable.manifest.totalBinaryAssetCount).toBe(0);
    const before = await downloadBackup(page, true);
    expect(before.manifest.totalBinaryAssetCount).toBe(1);
    expect(before.manifest.totalRecordCount).toBeGreaterThan(10);
    const custodyDirectory = resolve(
      "artifacts/final-closure/custody",
      `${info.project.name}-${Date.now()}`,
    );
    await mkdir(custodyDirectory, { recursive: true });
    await writeFile(
      resolve(custodyDirectory, "synthetic-portable.json"),
      JSON.stringify(portable),
    );
    const custodyFile = resolve(custodyDirectory, "synthetic-full-media.json");
    await writeFile(custodyFile, JSON.stringify(before));
    await context.close();
    context = await playwright[browserName].launchPersistentContext(
      directory,
      options,
    );
    await observe();
    page = context.pages()[0] ?? (await context.newPage());
    expect(canonical(await downloadBackup(page, true))).toEqual(
      canonical(before),
    );
    await ready(page, "/progress/weight");
    await expect(page.getByText("70.5 kg", { exact: true })).toBeVisible();
    const second = await context.newPage();
    await ready(second, "/progress/weight");
    await second.getByLabel("Weight", { exact: true }).fill("71");
    await second
      .getByRole("button", { name: "Save measurement", exact: true })
      .click();
    await expect(second.getByText("71 kg", { exact: true })).toBeVisible();
    // Progress rereads another tab's committed changes on reload.
    await page.reload();
    await expect(page.getByText("71 kg", { exact: true })).toBeVisible();
    await second.close();
    await page
      .getByRole("button", { name: "Edit", exact: true })
      .first()
      .click();
    const editor = page.getByLabel("Validated record JSON");
    const edited = JSON.parse(await editor.inputValue()) as Record<
      string,
      unknown
    >;
    expect(edited.enteredUnit).toBe("kg");
    edited.enteredValue = 70.6;
    edited.valueKg = 70.6;
    await editor.fill(JSON.stringify(edited));
    await page.getByRole("button", { name: "Save edit", exact: true }).click();
    await expect(page.getByText("70.6 kg", { exact: true })).toBeVisible();
    await ready(page, "/workout/history");
    await page.goBack();
    await page.goForward();
    await expect(
      page.getByText(`${marker} workout`, { exact: true }),
    ).toBeVisible();
    for (const route of [
      "/",
      "/workout",
      "/nutrition",
      "/recovery",
      "/cardio",
      "/supplements",
      "/progress",
      "/search",
      "/settings/data/backup",
    ])
      expect(
        await (await page.request.get(baseURL + route)).text(),
      ).not.toContain(marker);
    const afterEdit = await downloadBackup(page, true);
    const editedCustodyFile = resolve(
      custodyDirectory,
      "synthetic-after-edit.json",
    );
    await writeFile(editedCustodyFile, JSON.stringify(afterEdit));
    const fresh = await playwright[browserName].launchPersistentContext(
      directory + "-fresh",
      options,
    );
    await monitor(fresh, origin, observation);
    try {
      const restored = fresh.pages()[0] ?? (await fresh.newPage());
      await restored.addInitScript(() =>
        Reflect.deleteProperty(window, "showSaveFilePicker"),
      );
      await ready(restored, "/settings/data/restore");
      await restored
        .getByRole("button", { name: "Prepare local storage", exact: true })
        .click();
      await expect(restored.getByRole("status")).toContainText(
        "Local storage is ready",
      );
      await restored
        .getByLabel("Backup file", { exact: true })
        .setInputFiles(editedCustodyFile);
      await expect(
        restored.getByRole("heading", { name: "Preview passed", exact: true }),
      ).toBeVisible();
      restored.once("dialog", (dialog) => void dialog.accept());
      await restored
        .getByRole("button", { name: "Replace matching stores", exact: true })
        .click();
      await expect(restored.getByRole("status")).toContainText(
        "Restore completed",
        // Use the existing live-smoke bound for journaled seven-database I/O.
        { timeout: 15000 },
      );
      expect(canonical(await downloadBackup(restored, true))).toEqual(
        canonical(afterEdit),
      );
    } finally {
      await fresh.close();
    }
  } finally {
    await context.close();
  }
  expect(observation.remotes).toEqual([]);
  expect(observation.leaks).toEqual([]);
  expect(observation.errors).toEqual([]);
  expect(observation.failedAssets).toEqual([]);
  await info.attach("persistent-privacy", {
    body: JSON.stringify(observation),
    contentType: "application/json",
  });
});

test("keyboard-only navigation, dialog containment and restored visible focus", async ({
  page,
}) => {
  for (const route of routes) {
    await ready(page, route);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");
    for (let step = 0; step < 4; step++) {
      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => {
        const element = document.activeElement;
        if (!(element instanceof HTMLElement)) return null;
        const style = getComputedStyle(element);
        const wrapper = element.closest("label");
        const wrapperStyle = wrapper ? getComputedStyle(wrapper) : null;
        return {
          tag: element.tagName,
          html: element.outerHTML.slice(0, 180),
          outline: style.outlineStyle,
          shadow: style.boxShadow,
          wrapperOutline: wrapperStyle?.outlineStyle ?? "none",
          wrapperShadow: wrapperStyle?.boxShadow ?? "none",
        };
      });
      expect(focus?.tag).not.toBe("BODY");
      expect(
        focus?.outline !== "none" ||
          focus?.shadow !== "none" ||
          focus?.wrapperOutline !== "none" ||
          focus?.wrapperShadow !== "none",
        `${route} ${JSON.stringify(focus)}`,
      ).toBe(true);
    }
    await page.keyboard.press("Shift+Tab");
  }
  await ready(page, "/");
  const trigger = page.getByRole("button", {
    name: "Search Fitness OS",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Search Fitness OS" });
  await expect(dialog).toBeVisible();
  for (let step = 0; step < 12; step++) {
    await page.keyboard.press(step % 2 ? "Shift+Tab" : "Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await ready(page, "/diet-planning/energy");
  const consent = page.getByLabel("I understand this limitation");
  await consent.focus();
  await page.keyboard.press("Space");
  await expect(consent).toBeChecked();
});

test("screen-reader semantics proxy: snapshots, landmarks, names, states and live feedback", async ({
  page,
}, info) => {
  const snapshots: Record<string, string> = {};
  for (const route of routes) {
    await ready(page, route);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    snapshots[route] = await page.locator("body").ariaSnapshot();
    expect(snapshots[route]).toContain("heading");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await ready(page, "/settings/data/restore");
  await expect(
    page.getByRole("button", { name: "Keep existing records" }),
  ).toHaveCount(0);
  await page.getByLabel("Backup file", { exact: true }).setInputFiles({
    name: "synthetic-invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.getByRole("alert")).toContainText(
    /invalid|JSON|Unexpected/i,
  );
  snapshots["invalid-restore"] = await page.locator("body").ariaSnapshot();
  expect(snapshots["invalid-restore"]).toContain("alert");
  await info.attach("aria-snapshots", {
    body: JSON.stringify(snapshots),
    contentType: "application/json",
  });
});

test("200/400 percent effective viewport and large-text theme reflow", async ({
  page,
}, info) => {
  const states: unknown[] = [];
  for (const route of routes) {
    await ready(page, route);
    for (const [width, fontSize, scenario] of [
      [640, "16px", "200-percent-effective"],
      [320, "16px", "400-percent-effective"],
      [640, "32px", "200-percent-root-text"],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["light", "dark"]) {
        await page.evaluate(
          ({ fontSize, theme }) => {
            if (fontSize === "32px") {
              // Many established components use px text. Doubling only the root
              // would leave them unchanged, so scale their measured text too.
              const elements = [
                ...document.querySelectorAll<HTMLElement>("body, body *"),
              ];
              const sizes = elements.map(
                (element) =>
                  element.dataset.closureBaseFont ??
                  getComputedStyle(element).fontSize,
              );
              elements.forEach((element, index) => {
                element.dataset.closureBaseFont = sizes[index]!;
                element.style.fontSize = `${parseFloat(sizes[index]!) * 2}px`;
              });
            }
            document.documentElement.style.fontSize = fontSize;
            document.documentElement.dataset.theme = theme;
          },
          { fontSize, theme },
        );
        if (fontSize === "32px")
          expect(
            await page
              .locator("body")
              .evaluate(
                (element) =>
                  parseFloat(getComputedStyle(element).fontSize) /
                  parseFloat((element as HTMLElement).dataset.closureBaseFont!),
              ),
          ).toBe(2);
        await geometry(page);
        states.push({ route, width, fontSize, theme, scenario });
      }
    }
  }
  await info.attach("zoom-states", {
    body: JSON.stringify(states),
    contentType: "application/json",
  });
});

test("read-only print rendering retains headings, units and provenance without navigation", async ({
  page,
  browserName,
}, info) => {
  await ready(page, "/progress/weight");
  await page.getByLabel("Weight", { exact: true }).fill("70.5");
  await page
    .getByRole("button", { name: "Save measurement", exact: true })
    .click();
  await expect(page.getByText("70.5 kg", { exact: true })).toBeVisible();
  const samples = [
    "/exercises/push-up",
    "/foods/apple",
    "/recipes/chickpea-cucumber-bowl",
    "/progress/weight",
  ];
  for (const route of samples) {
    // Print uses an A4-sized CSS viewport, not a phone-sized sheet of paper.
    await page.setViewportSize({ width: 794, height: 1123 });
    await page.emulateMedia({ media: "screen" });
    await ready(page, route);
    await page.emulateMedia({ media: "print" });
    if (route === "/progress/weight")
      await expect(page.getByText("70.5 kg", { exact: true })).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    for (const selector of [".sidebar", ".topbar", ".mobile-nav", ".skip-link"])
      await expect(page.locator(selector)).toBeHidden();
    if (!route.startsWith("/progress"))
      await expect(
        page
          .getByRole("heading", { name: /sources|provenance|ingredients/i })
          .first(),
      ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const directory = resolve(
      "artifacts/final-closure/print",
      info.project.name,
    );
    await mkdir(directory, { recursive: true });
    const name = route.replaceAll("/", "_");
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (value) => (document.documentElement.dataset.theme = value),
        theme,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      if (theme === "dark")
        await page.screenshot({
          path: info.outputPath(name + "-dark-print.png"),
          fullPage: true,
        });
    }
    await page.evaluate(
      () => (document.documentElement.dataset.theme = "light"),
    );
    await page.screenshot({
      path: resolve(directory, name + ".png"),
      fullPage: true,
    });
    if (browserName === "chromium" && info.project.name === "closure-chromium")
      await page.pdf({
        path: resolve(directory, name + ".pdf"),
        format: "A4",
        margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
        printBackground: true,
      });
  }
});

test("file chooser clearing, same-file reselect and invalid import preserve canonical records", async ({
  page,
}) => {
  await ready(page, "/settings/data/restore");
  await page
    .getByRole("button", { name: "Prepare local storage", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Local storage is ready",
  );
  const before = await snapshot(page);
  const file = page.getByLabel("Backup file", { exact: true });
  for (let attempt = 0; attempt < 2; attempt++) {
    const pending = page.waitForEvent("filechooser");
    await file.click();
    const chooser = await pending;
    await chooser.setFiles({
      name: "synthetic-invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from("invalid"),
    });
    await expect(page.getByRole("alert")).toContainText(
      /invalid|JSON|Unexpected/i,
    );
    expect(await snapshot(page)).toEqual(before);
    await file.setInputFiles([]);
    expect(await snapshot(page)).toEqual(before);
  }
  for (const [name, buffer] of [
    ["future.json", Buffer.from('{"formatVersion":999}')],
    ["unsupported.gz", Buffer.from("not gzip")],
  ] as const) {
    await file.setInputFiles({
      name,
      mimeType: "application/octet-stream",
      buffer,
    });
    await expect(
      page.getByRole("button", { name: "Keep existing records" }),
    ).toHaveCount(0);
    expect(await snapshot(page)).toEqual(before);
  }
  await ready(page, "/settings/data/backup");
  // Exercise the actual application save-picker rejection branch without an OS dialog.
  await page.evaluate(() =>
    Reflect.set(window, "showSaveFilePicker", async () => {
      throw new DOMException("Synthetic save cancellation", "AbortError");
    }),
  );
  await page
    .getByRole("button", { name: "Create backup file", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "Synthetic save cancellation",
  );
  expect(await snapshot(page)).toEqual(before);
  await page.evaluate(() =>
    Reflect.deleteProperty(window, "showSaveFilePicker"),
  );
  await ready(page, "/settings/data/export");
  const csvDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export spreadsheet-safe CSV", exact: true })
    .click();
  expect(
    (await readFile((await (await csvDownload).path())!, "utf8")).length,
  ).toBeGreaterThan(0);
});

test("photo chooser accepts sanitized formats and preserves photos after rejected inputs", async ({
  page,
  baseURL,
}) => {
  if (!baseURL) throw Error("Missing origin.");
  const remote: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL).origin)
      remote.push(request.url());
  });
  await ready(page, "/progress/photos");
  const file = page.getByLabel("Image file", { exact: true });
  const save = page.getByRole("button", {
    name: "Sanitize and save photo",
    exact: true,
  });
  for (const [extension, mime] of [
    ["png", "image/png"],
    ["jpg", "image/jpeg"],
    ["webp", "image/webp"],
  ] as const) {
    const pending = page.waitForEvent("filechooser");
    await file.click();
    await (
      await pending
    ).setFiles({
      name: `synthetic.${extension}`,
      mimeType: mime,
      buffer: await readFile(`tests/fixtures/closure/synthetic.${extension}`),
    });
    await save.click();
    await expect(page.getByRole("status")).toContainText("Saved successfully");
  }
  await expect(page.locator(".progress-photo-grid img")).toHaveCount(3);
  await file.setInputFiles([]);
  await page.reload();
  await expect(page.locator(".progress-photo-grid img")).toHaveCount(3);
  const bad = [
    {
      name: "mismatch.png",
      mimeType: "image/png",
      buffer: await readFile("tests/fixtures/closure/synthetic.jpg"),
    },
    {
      name: "corrupt.png",
      mimeType: "image/png",
      buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0]),
    },
    {
      name: "large.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
    },
    {
      name: "dimensions.png",
      mimeType: "image/png",
      buffer: await readFile("tests/fixtures/closure/too-many-pixels.png"),
    },
  ];
  for (const input of bad) {
    await file.setInputFiles(input);
    await save.click();
    await expect(page.getByRole("status")).toContainText(
      /signature|decod|image|limit|MiB|Loading error/i,
    );
    await expect(page.locator(".progress-photo-grid img")).toHaveCount(3);
  }
  await file.setInputFiles("tests/fixtures/closure/synthetic.png");
  await file.setInputFiles("tests/fixtures/closure/synthetic.png");
  const backup = await downloadBackup(page);
  expect(
    backup.payload.modules
      .flatMap((module) => module.stores)
      .some((store) => store.storeId === "progressPhotoBlobs"),
  ).toBe(false);
  expect(remote).toEqual([]);
});
