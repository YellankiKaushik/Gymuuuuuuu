# Release, rollback and local-data recovery runbook

## Before a candidate

1. Start from a clean, reviewed feature branch and open a pull request. Require CI and the current release checks before merge.
2. Confirm the Node/npm versions and single `package-lock.json`; run `npm ci`, `npm run check`, `npm run test:coverage`, and the production-browser and accessibility suites.
3. Review dependency audit output, outbound request changes, response headers, performance budgets, public content validation, and migration compatibility.
4. When a release changes browser schemas, create and verify an owner-held Phase 17 backup outside this device before the upgrade. Do not place personal data in CI, Git, issue trackers, build artifacts or Vercel environment variables.
5. Deploy a Vercel Preview only after the owner connects the project. Test its canonical links, server rendering, critical journeys, network requests, keyboard/screen-reader behavior, and data isolation. A browser origin change does not move IndexedDB records.
6. Set `VITE_PUBLIC_APP_ORIGIN` to the exact stable production domain in Vercel's Production environment, then verify canonical links and origin continuity in the Preview and Production builds. This is a public value, never a secret. Changing it after users save browser data strands that data at the old origin.
7. Complete the supplied 15-gate checklist. Record actual evidence and generate the release manifest from observed metadata. A failed or unverified gate blocks release; never mark it waived to make a candidate pass.

## Production release

Production remains an owner-operated Vercel action. Confirm the approved stable domain, DNS and TLS; separately verify production environment and smoke tests after promotion. Do not infer production readiness from Preview results. Keep the previous deployment ID, commit, manifest, changelog and rollback compatibility evidence.

Generate the manifest only after collecting real evidence for every required gate. Prepare an evidence JSON that follows the supplied Phase 18 deployment schema's `testSummary`, `contentVersions`, `dataCompatibility`, `deployment` and `rollback` shapes, then run `npm run release:manifest -- path/to/observed-release-evidence.json`. The command reads the Git commit, branch, package versions and lock hash itself, enforces all 15 reference gates, validates the finished object against the supplied JSON Schema and writes to the ignored `artifacts/release-manifest.json`. Its input file should contain no user data or secrets. A partial gate list, unobserved deployment values or a schema mismatch fails generation.

## Code rollback

1. Record the incident, current deployment ID, affected routes and local-schema changes.
2. If old code was verified against the candidate's migrated data, use Vercel's deployment rollback to route traffic to the recorded prior deployment.
3. Smoke-test the restored code and confirm the stable origin remains unchanged.
4. If old code cannot read candidate data, do not rely on code rollback to repair browser records. Ship a forward-compatible fix and keep the device-local records intact.

## Browser data recovery

Server rollback does not revert IndexedDB. Ask the owner to use the app's Phase 17 backup/restore flow on the same browser profile and origin. Validate an archive before writes; preserve a before-image; require explicit confirmation for destructive restore; document affected stores. Never request or transmit the backup file to support or CI.

## Security or domain incident

Revoke only credentials proven affected, rotate them in their owning provider, and verify that no secret was bundled in client assets. For DNS/TLS problems, preserve the canonical origin and correct the project DNS records before asking users to move origins. Moving origins can strand local IndexedDB data and requires an explicit tested export/import recovery plan.
