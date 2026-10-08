import "./config/validation";
import { createRouter } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getStartContext } from "@tanstack/start-storage-context";
import { routeTree } from "./routeTree.gen";
import {
  ErrorState,
  LoadingState,
  NotFoundState,
} from "./components/common/states";
const getCspNonce = createIsomorphicFn()
  .server(() => {
    const context: unknown = getStartContext().contextAfterGlobalMiddlewares;
    if (
      typeof context !== "object" ||
      context === null ||
      !("cspNonce" in context)
    )
      return undefined;
    const nonce = context.cspNonce;
    return typeof nonce === "string" ? nonce : undefined;
  })
  .client(
    () =>
      document
        .querySelector('meta[name="csp-nonce"]')
        ?.getAttribute("content") ?? undefined,
  );
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPendingComponent: LoadingState,
    defaultErrorComponent: ErrorState,
    defaultNotFoundComponent: NotFoundState,
    ssr: { nonce: getCspNonce() },
  });
}
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
