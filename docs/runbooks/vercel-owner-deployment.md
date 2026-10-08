# Owner-controlled Vercel Preview and deployment

This is the next stage after the final readiness tag. No project creation, linking,
domain connection or deployment is performed by the engineering pass. Keep
`vercel.json`'s `git.deploymentEnabled: false` until you explicitly choose to change
that policy. A Git push alone must not deploy this candidate.

## Project and build settings

1. Sign into your own Vercel account. Create a project using the repository
   `YellankiKaushik/Gymuuuuuuu`, or link an existing project to that repository.
   Confirm the release tag/commit in the final report before selecting code.
   Creating/importing a project can offer a first production deployment: do not
   accept production promotion as your initial verification step. Prefer creating
   and linking the project from the Vercel CLI, then using its default Preview
   command below; connecting the Git repository is a separate project setting.
2. Use repository root `.` and framework **TanStack Start**. Install with `npm ci`,
   build with `npm run build`, and retain the framework's automatic output settings.
   Do not replace the output directory with `dist` or deploy the local Node server
   entry as a static file. Nitro's Vercel preset produces platform output; the local
   production equivalent uses `.output/server/index.mjs` through `npm start`.
3. Choose **Node.js 24.x** in Build and Deployment settings. Local/CI verification
   uses Node 24.16.0 and npm 11.9.0 from `.nvmrc`/`packageManager`. Vercel controls
   minor/patch runtime updates, so inspect actual build versions and investigate any
   engine mismatch. Keep `package-lock.json`; do not switch package managers.
4. Configure the sole required public setting, `VITE_PUBLIC_APP_ORIGIN`, to the
   planned stable HTTPS production origin, for example `https://fitness.example.com`.
   Replace the example with your real domain; no path, query, fragment or secret.
   Use the planned canonical origin for Preview as well so canonical tags can be
   inspected before promotion. Keep Preview access protected. No API key, database,
   authentication, analytics, payment or personal-data environment variable is
   required. Never put a secret in a `VITE_*` variable.

## Preview first

5. From a checkout of the release tag, use the current official Vercel CLI to run
   `vercel link`, choose your own account/project, then `vercel` (without `--prod`).
   Confirm the CLI identifies **Preview** before proceeding. Connecting the Git
   repository in project settings does not require enabling automatic deployments.
   The retained Git policy disables automatic deployments on every branch.
6. Use a separate browser profile and synthetic records on that Preview URL. Check
   SSR and reload/deep links, home/navigation, public content and source links,
   search/favourites/comparisons, programs/workouts, diet/nutrition/recipes,
   recovery/sleep, cardio, supplements, progress, settings, backup and CSV. Prepare
   local storage from the global restore screen before a fresh-profile restore.
   Export, preview, restore, reload and compare exact records and immutable snapshots;
   reject a corrupted file and confirm existing records survive.
7. Inspect real HTTPS response headers: nonce-based CSP, `nosniff`, referrer policy,
   permissions policy, frame protection and HSTS. Check hydration, failed assets,
   console/policy errors and the request log. Personal fields must stay out of URLs,
   requests and separately requested SSR HTML. Optional external demonstration
   playback is a deliberate user action; no personal record accompanies it.
8. Exercise keyboard/focus, reduced motion, zoom/reflow, both themes and real iOS/
   Android. Review print and human screen-reader behavior. Automated checks are
   evidence, not a substitute for these human checks.

## Stable domain and production

9. Add the chosen stable custom domain in Vercel project settings only after Preview
   succeeds. Follow the exact DNS records Vercel provides for your domain. Verify
   resolution, HTTPS certificate and redirects; do not invent a universal DNS value.
10. Check canonical URLs against `VITE_PUBLIC_APP_ORIGIN`. Choose the stable browser
    origin before entering real data. Preview URLs, localhost, different ports,
    browser profiles and production are separate IndexedDB profiles. There is no
    automatic transfer or cloud sync. Keep a private external backup before moving.
11. Promote an approved Preview or create production with the owner-operated CLI/
    dashboard flow only after these checks. Keep automatic Git deployment disabled
    if you want every release to remain manual. Enabling it later requires a separate
    reviewed change: pushes to the production branch can trigger production releases.
12. Run the same critical smoke flows on the production domain, including actual
    HTTPS headers, canonical tags, navigation, local save/reload and synthetic
    backup/restore. HSTS, DNS, TLS and hosted behavior are not certified by a local
    build. Keep deployment ID, commit, build evidence and prior deployment for rollback.
13. Never change the production origin casually after real local data exists. Back
    up first and verify export/restore at the new origin. Code rollback does not
    roll back browser records; follow [release and rollback](release-and-rollback.md).

Official references checked during this pass:
[TanStack Start with Nitro](https://vercel.com/docs/frameworks/full-stack/tanstack-start),
[Git deployment controls](https://vercel.com/docs/project-configuration/git-configuration),
[Node runtime versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions),
[Preview CLI deployment](https://vercel.com/docs/cli/deploy).

Production deployment remains an owner-controlled action after this runbook.
