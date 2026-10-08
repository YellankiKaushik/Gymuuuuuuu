# Final security and non-destructive hygiene pass

Direct CSP-event observation identified Zod's caught eval capability probe in the existing live deployment. The browser build aliases the exact zod package entry to a wrapper that configures jitless before dependent schemas initialize; simply configuring it in the client entry ran too late after bundling. The wrapper re-exports the same v4 API, leaves SSR parser mode unchanged and adds no unsafe-eval permission. The security regression now observes policy events across schema-heavy routes. The old live probe is classified separately until the owner redeploys.

The owner authorized a final audit of the already deployed application and explicitly prohibited deletion, renaming, moving tracked files, history rewriting, content expansion and automatic deployment.

Targeted changes bound untrusted global backup traversal before recursive work, restrict imported recipe/certification provenance to HTTP(S), reject credentials in canonical-origin configuration, and verify photo magic bytes before browser decoding. Existing generated/normative schemas and factual datasets remain intact; owning schemas enforce stronger runtime constraints.

The audit branch receives the existing hosted browser matrix. No test assertion, timeout, performance budget or framework version is weakened. Local temporary/editor patterns apply to future untracked artifacts only.

Historical pre-Vercel reports remain evidence for their recorded commits. Current README deployment guidance is updated separately. The documented inline-style CSP exception remains because React positioning/media/layout code uses style attributes. Script policy is not weakened.

Local npm 11.9.0 does not expose npm install-scripts ls. Its requested attempt is retained as evidence; the lockfile and installed manifests provide an alternative inventory. esbuild 0.28.2 postinstall is expected build tooling; fsevents 2.3.3 is optional macOS tooling. No allowScripts setting is introduced that this pinned local npm cannot validate. No dependencies are updated merely to silence the newer hosted npm warning.
