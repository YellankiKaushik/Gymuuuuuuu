import { z } from "zod/v4";
export * from "zod/v4";

// Strict CSP must not trigger even a caught capability probe for new Function.
// Run before browser route/schema imports; SSR keeps its existing parser mode.
if (!import.meta.env.SSR) z.config({ jitless: true });
