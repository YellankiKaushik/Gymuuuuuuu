import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const origin = "https://kaush-ka-gym.vercel.app";
const marker = "SYNTHETIC-FINAL-SECURITY-PRIVATE";
const payload = `${marker} <img src=x onerror=alert(1)>`;
const first = await fetch(origin);
const html = await first.text();
const second = await fetch(origin);
const policy = first.headers.get("content-security-policy") ?? "";
const nonce = policy.match(/script-src[^;]*'nonce-([^']+)'/)?.[1];
const secondNonce = second.headers
  .get("content-security-policy")
  ?.match(/script-src[^;]*'nonce-([^']+)'/)?.[1];
assert.equal(first.status, 200);
assert(nonce && secondNonce && nonce !== secondNonce);
assert(html.includes(`nonce="${nonce}"`));
for (const directive of [
  "default-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "connect-src 'self'",
])
  assert(policy.includes(directive));
const expected = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "strict-transport-security": "max-age=31536000",
};
for (const [key, value] of Object.entries(expected))
  assert.equal(first.headers.get(key), value);
const canonical =
  html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1] ??
  html.match(/<link[^>]*href="([^"]+)"[^>]*rel="canonical"/)?.[1];
assert.equal(canonical, `${origin}/`);
const browser = await chromium.launch();
const context = await browser.newContext();
const requests: { url: string; markerLeak: boolean; remote: boolean }[] = [];
const errors: string[] = [],
  violations: string[] = [],
  dialogs: string[] = [];
context.on("request", (request) => {
  const combined =
    request.url() +
    JSON.stringify(request.headers()) +
    (request.postData() ?? "");
  requests.push({
    url: request.url(),
    markerLeak: combined.includes(marker),
    remote: new URL(request.url()).origin !== origin,
  });
});
const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (/content security policy|violates.*directive/i.test(message.text()))
    violations.push(message.text());
});
page.on("dialog", (dialog) => {
  dialogs.push(dialog.type());
  void dialog.dismiss();
});
const routes = [
  "/",
  "/workout",
  "/workout/history",
  "/nutrition",
  "/diet-planning",
  "/recipes",
  "/sleep",
  "/recovery",
  "/cardio",
  "/supplements",
  "/progress",
  "/search",
  "/saved",
  "/settings/data",
];
const routeResults: {
  route: string;
  status: number;
  ssrMarkerLeak: boolean;
}[] = [];
try {
  await page.goto(`${origin}/nutrition/add`);
  await page.getByLabel("Quick-add description").fill(payload);
  await page.getByLabel("Energy (kcal) · required").fill("100");
  await page
    .getByRole("button", { name: "Save consumed entry", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Saved on this device" })
    .waitFor();
  await page.getByRole("link", { name: "Return to today’s diary" }).click();
  await page.getByRole("heading", { name: payload, exact: true }).waitFor();
  assert.equal(await page.locator("img[onerror]").count(), 0);
  for (const route of routes) {
    const response = await page.goto(origin + route);
    await page.locator("h1").first().waitFor();
    assert(response && response.status() < 400);
    const ssr = await fetch(origin + route);
    const text = await ssr.text();
    routeResults.push({
      route,
      status: ssr.status,
      ssrMarkerLeak: text.includes(marker),
    });
    assert(!text.includes(marker));
  }
  assert.equal(dialogs.length, 0);
  assert.equal(errors.length, 0);
  assert.equal(violations.length, 0);
  assert.equal(requests.filter((x) => x.markerLeak || x.remote).length, 0);
} finally {
  await mkdir("artifacts/final-security", { recursive: true });
  await writeFile(
    "artifacts/final-security/live.json",
    JSON.stringify(
      {
        schemaVersion: 1,
        observedAt: new Date().toISOString(),
        origin,
        tls: "HTTPS certificate verified by Node fetch and browser; no insecure bypass",
        status: first.status,
        headers: Object.fromEntries(first.headers),
        distinctNonces: Boolean(nonce && secondNonce && nonce !== secondNonce),
        canonical,
        routes: routeResults,
        requests: requests.length,
        personalMarkerLeaks: requests.filter((x) => x.markerLeak).length,
        unexpectedRemote: requests.filter((x) => x.remote).length,
        errors,
        violations,
        dialogs,
        syntheticXssRenderedAsText: dialogs.length === 0,
        limitation:
          "Fresh synthetic context only; no live owner records accessed or deployment performed.",
      },
      null,
      2,
    ) + "\n",
  );
  await context.close();
  await browser.close();
}
console.log(
  "Live HTTPS headers, nonces, canonical, synthetic XSS/privacy and representative routes passed.",
);
