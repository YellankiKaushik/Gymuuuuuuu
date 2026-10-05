import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";

const csrfMiddleware = createCsrfMiddleware({
  filter: (context) => context.handlerType === "serverFn",
});

const contentSecurityPolicyMiddleware = createMiddleware().server(
  async ({ next }) => {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const nonce = btoa(String.fromCharCode(...bytes));
    const result = await next({ context: { cspNonce: nonce } });
    result.response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        `style-src 'self' 'nonce-${nonce}'`,
        "style-src-attr 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-src https://www.youtube-nocookie.com",
      ].join("; "),
    );
    return result;
  },
);

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, contentSecurityPolicyMiddleware],
}));
