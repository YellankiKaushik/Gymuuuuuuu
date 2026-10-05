function getPublicOrigin() {
  const configuredOrigin = import.meta.env.VITE_PUBLIC_APP_ORIGIN?.trim();
  if (!configuredOrigin) return "http://localhost:3000";
  const parsed = new URL(configuredOrigin);
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error(
      "VITE_PUBLIC_APP_ORIGIN must be an HTTP(S) origin without a path, query or fragment.",
    );
  }
  return parsed.origin;
}

export const appConfig = {
  name: "Fitness OS",
  description:
    "Training, nutrition, recovery and optional tracking in one evidence-aware, device-local space.",
  origin: getPublicOrigin(),
  version: "0.1.0",
} as const;
