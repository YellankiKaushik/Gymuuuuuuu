import "./config/validation";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { hydrateStart } from "@tanstack/start-client-core/client";
import { Await, RouterProvider } from "@tanstack/react-router";

// The streamed inline bootstrap must execute before the cached module hydrates.
// WebKit can evaluate a cached module while the HTML parser is still running.
async function bootstrap() {
  // Both the parsed document and streamed router payload must be available.
  // Cached WebKit modules can observe the early bootstrap while parsing continues.
  const ready = await new Promise<boolean>((resolve) => {
    const finish = (value: boolean) => {
      observer.disconnect();
      document.removeEventListener("DOMContentLoaded", check);
      window.removeEventListener("load", check);
      window.removeEventListener("pagehide", cancel);
      resolve(value);
    };
    const check = () => {
      if (document.readyState !== "loading" && window.$_TSR) finish(true);
    };
    const cancel = () => finish(false);
    const observer = new MutationObserver(check);
    observer.observe(document, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", check);
    window.addEventListener("load", check);
    window.addEventListener("pagehide", cancel, { once: true });
    check();
  });
  if (!ready) return;
  // Register React's hydration root while TanStack initializes, rather than
  // clearing the streamed bootstrap before React has attached to the document.
  const hydrationDocument = document;
  const hydrationBootstrap = window.$_TSR;
  if (!hydrationBootstrap) return;
  let active = true;
  window.addEventListener(
    "pagehide",
    () => {
      active = false;
    },
    { once: true },
  );
  const router = hydrateStart().finally(() => {
    // A pending initialization from a departed document must not clear the
    // next document's bootstrap through WebKit's retained WindowProxy.
    if (
      active &&
      document === hydrationDocument &&
      window.$_TSR === hydrationBootstrap
    )
      hydrationBootstrap.h();
  });
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <Await
          promise={router}
          children={(value) =>
            active && document === hydrationDocument ? (
              <RouterProvider router={value} />
            ) : null
          }
        />
      </StrictMode>,
    );
  });
}

void bootstrap();
