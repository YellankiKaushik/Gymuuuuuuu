import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { hydrateStart } from "@tanstack/react-start/client";
import { RouterProvider } from "@tanstack/react-router";

// The streamed inline bootstrap must execute before the cached module hydrates.
// WebKit can evaluate a cached module while the HTML parser is still running.
async function bootstrap() {
  // Hydration needs the streamed router payload, not merely a readyState value.
  // Cached WebKit documents can evaluate the entry before that payload exists.
  const ready = await new Promise<boolean>((resolve) => {
    const finish = (value: boolean) => {
      observer.disconnect();
      document.removeEventListener("DOMContentLoaded", check);
      window.removeEventListener("load", check);
      window.removeEventListener("pagehide", cancel);
      resolve(value);
    };
    const check = () => {
      if (window.$_TSR) finish(true);
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
  const router = await hydrateStart();
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  });
}

void bootstrap();
