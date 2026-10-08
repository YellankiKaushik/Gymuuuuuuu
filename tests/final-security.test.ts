import { expect, it, vi } from "vitest";
import {
  validateBackup,
  encodeCsv,
} from "../src/features/data-management/service";
import { validatePhotoInput } from "../src/features/progress/image-input";
import { recipeVersionSchema } from "../src/features/recipes-meal-plans/schema";
import { publicRecipes } from "../src/features/recipes-meal-plans/public-records";
import { certificationSchema } from "../src/features/supplements/schema";

it("rejects deep, cyclic, oversized and non-finite import values before recursive work", () => {
  let nested: unknown = "leaf";
  for (let index = 0; index < 70; index++) nested = { nested };
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  for (const input of [
    nested,
    cycle,
    { text: "x".repeat(3_000_001) },
    { n: Infinity },
    { n: NaN },
  ])
    expect(validateBackup(input).errors.length).toBeGreaterThan(0);
});

it("rejects unsafe imported recipe provenance and media URLs while accepting HTTPS", () => {
  const recipe = publicRecipes[0]!.version;
  expect(recipeVersionSchema.safeParse(recipe).success).toBe(true);
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,test",
    "vbscript:msgbox(1)",
  ])
    expect(
      recipeVersionSchema.safeParse({
        ...recipe,
        source: { ...recipe.source, url },
      }).success,
    ).toBe(false);
  expect(
    recipeVersionSchema.safeParse({
      ...recipe,
      source: { ...recipe.source, url: "https://example.test/source" },
    }).success,
  ).toBe(true);
});

it("rejects unsafe personal certification registry URLs", () => {
  const certification = {
    id: "synthetic-certification",
    schemeId: "synthetic-scheme",
    status: "not_checked",
    productOrLotIdentifier: null,
    verifiedAt: null,
    registryUrl: "https://example.test/registry",
    evidenceNote: "Synthetic only",
    lotSpecific: false,
    matchedLot: null,
    scope: [],
    validUntil: null,
  };
  expect(certificationSchema.safeParse(certification).success).toBe(true);
  for (const registryUrl of [
    "javascript:alert(1)",
    "data:text/html,test",
    "vbscript:msgbox(1)",
  ])
    expect(
      certificationSchema.safeParse({ ...certification, registryUrl }).success,
    ).toBe(false);
});

it("rejects credentials in the public canonical origin instead of silently dropping them", async () => {
  vi.stubEnv(
    "VITE_PUBLIC_APP_ORIGIN",
    "https://synthetic-user:synthetic-pass@example.test",
  );
  vi.resetModules();
  try {
    await expect(import("../src/config/app")).rejects.toThrow("HTTP(S) origin");
  } finally {
    vi.unstubAllEnvs();
    vi.resetModules();
  }
});

it("checks photo MIME, signature and size before decoding or storage", async () => {
  const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  await expect(
    validatePhotoInput(new File([png], "synthetic.png", { type: "image/png" })),
  ).resolves.toBeUndefined();
  await expect(
    validatePhotoInput(
      new File([png], "synthetic.jpg", { type: "image/jpeg" }),
    ),
  ).rejects.toThrow("signature");
  await expect(
    validatePhotoInput(
      new File(["<svg>"], "synthetic.png", { type: "image/png" }),
    ),
  ).rejects.toThrow("signature");
  await expect(
    validatePhotoInput(new File([], "empty.png", { type: "image/png" })),
  ).rejects.toThrow("10 MiB");
});

it("neutralizes all specified CSV prefixes and quotes Unicode, quotes and multiline text", () => {
  for (const prefix of ["=", "+", "-", "@", "\t", "\r"])
    expect(encodeCsv([{ note: `${prefix}SYNTHETIC` }])).toContain(
      `'${prefix}SYNTHETIC`,
    );
  expect(encodeCsv([{ note: 'synthetic, "Unicode Ω"\r\nnext' }])).toContain(
    '"synthetic, ""Unicode Ω""\r\nnext"',
  );
});
