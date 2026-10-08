import { expect, test } from "@playwright/test";

test("@security server issues a per-response nonce CSP and hydrates without policy violations", async ({
  page,
  request,
}) => {
  const first = await request.get("/");
  const firstPolicy = first.headers()["content-security-policy"];
  expect(firstPolicy).toBeTruthy();
  expect(firstPolicy).toContain("script-src 'self' 'nonce-");
  expect(firstPolicy).toContain("frame-src https://www.youtube-nocookie.com");
  expect(firstPolicy).not.toContain("script-src 'self' 'unsafe-inline'");

  const html = await first.text();
  const nonce = firstPolicy?.match(/script-src[^;]*'nonce-([^']+)'/)?.[1];
  expect(nonce).toBeTruthy();
  const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map(
    ([tag]) => tag ?? "",
  );
  expect(scripts.some((tag) => tag.includes(`nonce="${nonce}"`))).toBe(true);

  const second = await request.get("/");
  const secondHeaders = second.headers();
  const secondNonce = secondHeaders["content-security-policy"]?.match(
    /script-src[^;]*'nonce-([^']+)'/,
  )?.[1];
  expect(secondNonce).toBeTruthy();
  expect(secondNonce).not.toBe(nonce);

  const violations: string[] = [];
  await page.addInitScript(() => {
    Reflect.set(window, "fitnessOsPolicyEvents", []);
    document.addEventListener("securitypolicyviolation", (event) => {
      (Reflect.get(window, "fitnessOsPolicyEvents") as string[]).push(
        `${event.violatedDirective}:${event.blockedURI}`,
      );
    });
  });
  page.on("console", (message) => {
    if (message.text().toLowerCase().includes("content security policy"))
      violations.push(message.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Your fitness, connected.",
  );
  await page.getByRole("button", { name: "Search Fitness OS" }).click();
  await expect(
    page.getByRole("combobox", { name: "Search Fitness OS on this device" }),
  ).toBeVisible();
  expect(violations).toEqual([]);
  for (const route of [
    "/muscles",
    "/foods",
    "/nutrition/custom-foods",
    "/recipes/create",
    "/supplements/products/create",
    "/progress/weight",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("button", { name: "Search Fitness OS", exact: true }),
    ).toBeEnabled();
    expect(
      await page.evaluate(() => Reflect.get(window, "fitnessOsPolicyEvents")),
      route,
    ).toEqual([]);
  }
  expect(
    await page.evaluate(() => Reflect.get(window, "fitnessOsPolicyEvents")),
  ).toEqual([]);
});
