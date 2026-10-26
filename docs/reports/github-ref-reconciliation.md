# GitHub ref reconciliation

Reviewed 2026-10-26 (Asia/Calcutta). This task reconciles remote refs, reviews existing dependency PRs and prepares one roadmap. Main remains the authoritative permanent development branch; eight temporary automated dependency branches and one frozen historical citation ref remain. No application redesign, content publication, dependency upgrade, broad test run or deployment was performed.

## Repository identity and result

- Starting main SHA: `a946027b1f3a8754928c393228df696400b6b391`.
- Final application/ref-reconciliation SHA: `a946027b1f3a8754928c393228df696400b6b391` (unchanged by ref retirement).
- Final repository SHA after the documentation push: the Git commit containing this report and the [JSON report](github-ref-reconciliation.json). Resolve it with `git log -1 --format=%H -- docs/reports/github-ref-reconciliation.json`; the exact post-push SHA is supplied in the final owner handoff. A committed file cannot contain its own future self-hash; none is invented here.
- GitHub branches: **13 → 10**; tags: **26 → 26**; open PRs: **8 → 8**.
- Tracked files: **1,334 → 1,337**, consisting of three new report/roadmap files. Existing paths, contents, archive, README and DESIGN.md are preserved.
- Remote default remains `main`. No historical branch was merged; the retired tips were already ancestors of main.

## Complete original branch inventory

Ahead/behind counts are relative to the fixed starting SHA above. Unique commits are fully recorded in JSON. A zero-ahead ancestor has every branch commit reachable from main. Open PRs here include a matching head or base; main is the base of all eight dependency PRs.

| Original ref                                                         | Exact original SHA                                                                                                                          | Ahead / behind | Ancestor / unique commits | PRs                            | Disposition                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------- | ------------------------------ | ----------------------------------- |
| `refs/heads/codex/final-pre-vercel-readiness`                        | [`26281fdb9fa6058eabdbf032336e5e54b2a1da62`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/26281fdb9fa6058eabdbf032336e5e54b2a1da62) | 0 / 20         | yes / 0                   | none                           | RETIRED_REDUNDANT_REMOTE_REF        |
| `refs/heads/codex/final-security-hygiene-testing`                    | [`80f06ab2b6b1f6d4da252455efcc71a1daecde09`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/80f06ab2b6b1f6d4da252455efcc71a1daecde09) | 0 / 16         | yes / 0                   | none                           | RETIRED_REDUNDANT_REMOTE_REF        |
| `refs/heads/codex/phase-18-release-controls`                         | [`0473d0b65acffac51254b4fa07d5ef301e0cd727`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/0473d0b65acffac51254b4fa07d5ef301e0cd727) | 0 / 54         | yes / 0                   | none                           | RETIRED_REDUNDANT_REMOTE_REF        |
| `refs/heads/codex/phase-19-verified-content`                         | [`684345c41207c2d54044e79be52c42a303bfee90`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/684345c41207c2d54044e79be52c42a303bfee90) | 0 / 22         | yes / 0                   | none                           | PRESERVED_LIVE_PROVENANCE_REFERENCE |
| `refs/heads/dependabot/github_actions/actions/checkout-7.0.1`        | [`445fbbf08b3bfa32f05221c7c8f3f7f6b5c61b9c`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/445fbbf08b3bfa32f05221c7c8f3f7f6b5c61b9c) | 1 / 5          | no / 1                    | #2                             | PRESERVED_OPEN_DEPENDENCY_PR        |
| `refs/heads/dependabot/github_actions/actions/setup-node-7.1.0`      | [`e4db5591d4ba4b27f07880be5988fcedb9fd50b7`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/e4db5591d4ba4b27f07880be5988fcedb9fd50b7) | 1 / 5          | no / 1                    | #3                             | PRESERVED_OPEN_DEPENDENCY_PR        |
| `refs/heads/dependabot/github_actions/actions/upload-artifact-7.0.2` | [`707e15ca0dc2615815c09507b273067ac9699145`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/707e15ca0dc2615815c09507b273067ac9699145) | 1 / 4          | no / 1                    | #4                             | PRESERVED_OPEN_DEPENDENCY_PR        |
| `refs/heads/dependabot/npm_and_yarn/lucide-react-1.55.0`             | [`8a87868b22af73b3b34a95f962b28b98b7bcd49c`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/8a87868b22af73b3b34a95f962b28b98b7bcd49c) | 1 / 8          | no / 1                    | #6                             | PRESERVED_OPEN_DEPENDENCY_PR        |
| `refs/heads/dependabot/npm_and_yarn/tanstack/react-start-1.168.61`   | [`f56a88dedee3f7be6b1647070e3b41b2175f0596`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/f56a88dedee3f7be6b1647070e3b41b2175f0596) | 1 / 8          | no / 1                    | #5                             | PRESERVED_OPEN_DEPENDENCY_PR        |
| `refs/heads/dependabot/npm_and_yarn/types/node-26.6.5`               | [`93946b2a4a751c4c1d75d9f8057ba0ac2709398d`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/93946b2a4a751c4c1d75d9f8057ba0ac2709398d) | 1 / 8          | no / 1                    | #8                             | PRESERVED_OPEN_DEPENDENCY_PR        |
| `refs/heads/dependabot/npm_and_yarn/typescript-7.0.2`                | [`638a5294c60407aa02b558725eda126852e3264e`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/638a5294c60407aa02b558725eda126852e3264e) | 1 / 54         | no / 1                    | #1                             | PRESERVED_OPEN_DEPENDENCY_PR        |
| `refs/heads/dependabot/npm_and_yarn/vite-8.3.4`                      | [`ba5dd2afd45d6cc3b132076fcebbbf19cef55e1a`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/ba5dd2afd45d6cc3b132076fcebbbf19cef55e1a) | 1 / 1          | no / 1                    | #7                             | PRESERVED_OPEN_DEPENDENCY_PR        |
| `refs/heads/main`                                                    | [`a946027b1f3a8754928c393228df696400b6b391`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/a946027b1f3a8754928c393228df696400b6b391) | 0 / 0          | yes / 0                   | #1, #2, #3, #4, #5, #6, #7, #8 | AUTHORITATIVE_PERMANENT_DEVELOPMENT |

### Retirement evidence and workflow interpretation

The three retired refs passed a fresh exact-SHA check, default-branch exclusion, local ancestry check (exit 0), GitHub comparison (ahead 0), open-PR head/base check, and deployment/release/workflow dependency checks before one normal atomic delete push. No force option was used. Full tip SHAs, commands, comparison URLs and guard states are in JSON; their commits remain reachable from main.

| Retired ref                                       | Ancestry proof against starting main                                                                                 | Unique commits | Open PR dependencies |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------: | -------------------: |
| `refs/heads/codex/final-pre-vercel-readiness`     | `git merge-base --is-ancestor 26281fdb9fa6058eabdbf032336e5e54b2a1da62 a946027b1f3a8754928c393228df696400b6b391` → 0 |              0 |                    0 |
| `refs/heads/codex/final-security-hygiene-testing` | `git merge-base --is-ancestor 80f06ab2b6b1f6d4da252455efcc71a1daecde09 a946027b1f3a8754928c393228df696400b6b391` → 0 |              0 |                    0 |
| `refs/heads/codex/phase-18-release-controls`      | `git merge-base --is-ancestor 0473d0b65acffac51254b4fa07d5ef301e0cd727 a946027b1f3a8754928c393228df696400b6b391` → 0 |              0 |                    0 |

The active cross-browser workflow names phase-19, final-pre-Vercel and final-security branches only as push-event matching patterns at [lines 9–11](../../.github/workflows/cross-browser.yml#L9). Jobs check out the triggering event SHA; they do not require these named refs. Main, pull-request, scheduled and manual entry points remain independent. There were no active workflow runs, GitHub releases or environment branch policies dependent on the retired refs. All six Vercel deployment records say `main`, and all three aliases target the current main production deployment. Thus the two obsolete optional filter matches are not execution dependencies; their removal leaves current-main execution intact. Workflow bytes were preserved. [GitHub filter semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushbranchestagsbranches-ignoretags-ignore).

### Historical ref deliberately preserved

`refs/heads/codex/phase-19-verified-content` remains at `684345c41207c2d54044e79be52c42a303bfee90`, despite ahead 0 / behind 22. Twenty GitHub tree/blob URL occurrences in runtime provenance files refer to it, including [the source registry](../../src/content/provenance/verified-sources.json#L439). The [source loader](../../src/features/sources/loader.ts#L4) imports that registry; exercise/program source links render their recorded URLs. Deleting this ref would break existing citations. It is a frozen citation reference, not an alternative development base. A separate authorized change could replace branch URLs with verified immutable commit URLs before retirement; this task makes no runtime/source edit. All reference locations are in JSON.

Local historical branch refs were not deleted. Remote retirement does not remove their commits, main ancestry, tags or deployed snapshots.

## Outstanding dependency PRs

All eight PRs and their exact branches remain open and untouched. Versions below are lock-resolved package versions or pinned action SHAs. `MERGE_LATER` is conditional future maintenance after separate authorization and current-main validation; it is not merge approval. `DEFER` retains a PR while a demonstrated compatibility/policy question is unresolved. No evidence warranted `CLOSE_AS_UNNECESSARY`. Current application runtime is Node 24.16.0 / npm 11.9.0; action runtimes and TypeScript declaration versions are separate from application Node.

| PR                                                                                 | Current → proposed                                                                                  | Risk                                                                                               | Existing PR workflow checks                        | Decision        |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------- |
| [#1](https://github.com/YellankiKaushik/Gymuuuuuuu/pull/1) typescript              | 6.0.3 → 7.0.2                                                                                       | HIGH — compiler major/native-port and compiler-API ecosystem compatibility                         | Cross-browser regression: failure; CI: failure     | **DEFER**       |
| [#2](https://github.com/YellankiKaushik/Gymuuuuuuu/pull/2) actions/checkout        | 6.1.0 @ d23441a48e516b6c34aea4fa41551a30e30af803 → 7.0.1 @ 3d3c42e5aac5ba805825da76410c181273ba90b1 | MEDIUM — Actions major with intentional checkout security behavior changes                         | Cross-browser regression: failure; CI: success     | **MERGE_LATER** |
| [#3](https://github.com/YellankiKaushik/Gymuuuuuuu/pull/3) actions/setup-node      | 7.0.0 @ 820762786026740c76f36085b0efc47a31fe5020 → 7.1.0 @ 949feb2413d6458794dcd2491c4babbbce0c15c1 | LOW/MEDIUM — minor CI setup/cache and download behavior                                            | Cross-browser regression: failure; CI: success     | **MERGE_LATER** |
| [#4](https://github.com/YellankiKaushik/Gymuuuuuuu/pull/4) actions/upload-artifact | 7.0.1 @ 043fb46d1a93c77aae656e7c1c64a875d1fc6a0a → 7.0.2 @ cf430e030ddbb5b0abf93d22962f4752f3646cd9 | LOW — patch to diagnostics artifact transport                                                      | CI: success; Cross-browser regression: success     | **MERGE_LATER** |
| [#5](https://github.com/YellankiKaushik/Gymuuuuuuu/pull/5) @tanstack/react-start   | 1.168.60 → 1.168.61                                                                                 | HIGH for this application — transitive router/client/server version coherence despite patch number | CI: failure; Cross-browser regression: failure     | **DEFER**       |
| [#6](https://github.com/YellankiKaushik/Gymuuuuuuu/pull/6) lucide-react            | 1.52.0 → 1.55.0                                                                                     | LOW/MEDIUM — icon exports and visible geometry/bundle surface                                      | CI: success; Cross-browser regression: cancelled   | **MERGE_LATER** |
| [#7](https://github.com/YellankiKaushik/Gymuuuuuuu/pull/7) vite                    | 8.3.2 → 8.3.4                                                                                       | MEDIUM — build/dev server and stylesheet/preload/transitive Rolldown changes                       | CI: success; Cross-browser regression: failure     | **MERGE_LATER** |
| [#8](https://github.com/YellankiKaushik/Gymuuuuuuu/pull/8) @types/node             | 26.6.4 → 26.6.5                                                                                     | MEDIUM policy risk, otherwise small type-definition patch                                          | CI: cancelled; Cross-browser regression: cancelled | **DEFER**       |

### #1: typescript

- Head: `dependabot/npm_and_yarn/typescript-7.0.2` at `638a5294c60407aa02b558725eda126852e3264e`.
- Security relevance: No security label or specific security fix established for this PR; compiler/tooling change, not a production Node upgrade.
- Compatibility: TypeScript 7.0.2 declares Node >=16.20.0, which Node24 satisfies. But npm11 CI already fails dependency resolution: typescript-eslint8.71.0 requires TypeScript >=4.8.4 <6.1.0. TS7.0 has no compiler API; Microsoft describes a TS6 compatibility alias for API consumers. Replacing one package is not a valid current-toolchain migration.
- Decision: **DEFER**. A verified npm ci ERESOLVE blocker exists before application tests. Preserve TS6 and plan a separately authorized compiler/parser/tooling migration with Node24/npm11 validation. Do not use --force or --legacy-peer-deps to bypass it.
- Evidence: package-lock.json: node_modules/typescript-eslint peerDependencies; eslint.config.js imports typescript-eslint; PR1 CI job111808767041 fails at Run npm ci.
- Sources: [Primary source 1](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [Primary source 2](https://typescript-eslint.io/users/dependency-versions/).
- PR runs: [Cross-browser regression](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/37323651720): failure; [CI](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/37323651652): failure.

### #2: actions/checkout

- Head: `dependabot/github_actions/actions/checkout-7.0.1` at `445fbbf08b3bfa32f05221c7c8f3f7f6b5c61b9c`.
- Security relevance: Upstream v7 blocks unsafe fork checkout by default for pull_request_target/workflow_run and updates vulnerable transitive dependencies; v7.0.1 adds input/escaping hardening. Current workflows use pull_request/push/schedule/workflow_dispatch and persist-credentials:false, so the newly blocked pattern was not found here.
- Compatibility: Proposed action.yml uses node24; the Node24 action runtime requires a sufficiently current runner (documented minimum2.327.1). ubuntu-latest is GitHub-hosted; no unsupported self-hosted runner was found. This action runtime is separate from the application Node chosen by setup-node and npm11. Preserve SHA pins and persist-credentials:false.
- Decision: **MERGE_LATER**. A reasonable security/maintenance upgrade after current-main integration checks. Existing PR CI passes, but cross-browser run fails on the old head; red status alone does not implicate checkout. No merge now.
- Evidence: All three workflow diffs replace only the checkout SHA/comment and preserve inputs; Proposed pinned action.yml verified node24; PR2 CI success; Cross-browser regression failure.
- Sources: [Primary source 1](https://github.com/actions/checkout/releases/tag/v7.0.0), [Primary source 2](https://github.com/actions/checkout/releases/tag/v7.0.1), [Primary source 3](https://github.com/actions/checkout#checkout-v5), [Primary source 4](https://raw.githubusercontent.com/actions/checkout/3d3c42e5aac5ba805825da76410c181273ba90b1/action.yml).
- PR runs: [Cross-browser regression](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38916486803): failure; [CI](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38916486782): success.

### #3: actions/setup-node

- Head: `dependabot/github_actions/actions/setup-node-7.1.0` at `e4db5591d4ba4b27f07880be5988fcedb9fd50b7`.
- Security relevance: Release lists version-file/retry improvements and transitive dependency updates; no PR-specific advisory or urgent exposure established.
- Compatibility: Pinned action.yml uses node24. Project Node stays .nvmrc24.16.0 and npm11.9.0; setup-node action version7 does not mean application Node7. Current explicit cache:npm and package-manager-cache:false remain intact. The v7 ESM/NODE_AUTH_TOKEN change already exists in baseline7.0.0; current workflows do not set registry-url.
- Decision: **MERGE_LATER**. Use later as a separate small CI maintenance change after refreshing against current main and verifying exact Node/cache behavior. Existing PR CI passes while cross-browser fails on its old head; do not treat that as proof this setup update is broken.
- Evidence: Three workflow diffs replace only setup-node SHA/comment; Proposed pinned action.yml verified node24; PR3 CI success; Cross-browser regression failure.
- Sources: [Primary source 1](https://github.com/actions/setup-node/releases/tag/v7.1.0), [Primary source 2](https://github.com/actions/setup-node#breaking-changes-in-v5), [Primary source 3](https://raw.githubusercontent.com/actions/setup-node/949feb2413d6458794dcd2491c4babbbce0c15c1/action.yml).
- PR runs: [Cross-browser regression](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38916483181): failure; [CI](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38916483023): success.

### #4: actions/upload-artifact

- Head: `dependabot/github_actions/actions/upload-artifact-7.0.2` at `707e15ca0dc2615815c09507b273067ac9699145`.
- Security relevance: Release improves HTTP429 retry/Retry-After handling and updates @actions/artifact6.3.1. Reliability improvement, not an established fix for a product security defect.
- Compatibility: Pinned action.yml uses node24, already used by current artifact major. Does not change application Node24/npm11, upload paths, names, retention, hidden-file inputs or workflow permissions. Action v4+ targets github.com rather than GHES, matching this repository.
- Decision: **MERGE_LATER**. Best small maintenance candidate: both actual PR workflows pass. Later verify against current main and one bounded artifact-upload check because failure-only upload steps are skipped in green jobs. Do not merge in this task.
- Evidence: Only ci.yml and cross-browser.yml artifact SHA pins change; all existing upload uses are covered; PR4 CI and Cross-browser regression both success; Proposed pinned action.yml verified node24.
- Sources: [Primary source 1](https://github.com/actions/upload-artifact/releases/tag/v7.0.2), [Primary source 2](https://raw.githubusercontent.com/actions/upload-artifact/cf430e030ddbb5b0abf93d22962f4752f3646cd9/action.yml).
- PR runs: [CI](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38922972004): success; [Cross-browser regression](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38922972041): success.

### #5: @tanstack/react-start

- Head: `dependabot/npm_and_yarn/tanstack/react-start-1.168.61` at `f56a88dedee3f7be6b1647070e3b41b2175f0596`.
- Security relevance: Official patch notes list dependency updates; no PR-specific security advisory or demonstrated vulnerability established.
- Compatibility: Proposed package engine Node>=22.12.0 and React19/Vite8 peers fit Node24/npm11 baseline. However, release updates router and client/server packages and wants start-client-core1.170.35 while root deliberately pins1.170.34. Existing CI fails strict typing at src/client.tsx(63,31): incompatible AnyRouter types from two router-core installations.
- Decision: **DEFER**. Confirmed toolchain/application integration failure, not merely an old red badge. Plan a coherent TanStack family update and validate client hydration, CSP/nonces, SSR and routing in a separately authorized change; no blind patch merge.
- Evidence: PR5 CI job115640844612 fails Run npm run check with TS2322 at src/client.tsx(63,31); PR lock diff upgrades router/core/client/server transitive packages; Root package.json pins @tanstack/start-client-core1.170.34.
- Sources: [Primary source 1](https://github.com/TanStack/router/releases/tag/%40tanstack%2Freact-start%401.168.61), [Primary source 2](https://registry.npmjs.org/%40tanstack%2Freact-start/1.168.61).
- PR runs: [CI](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38498883535): failure; [Cross-browser regression](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38498883569): failure.

### #6: lucide-react

- Head: `dependabot/npm_and_yarn/lucide-react-1.55.0` at `8a87868b22af73b3b34a95f962b28b98b7bcd49c`.
- Security relevance: Release is primarily icon additions and library/test maintenance. No specific security fix for this application established; upstream monorepo dev-dependency changes do not automatically become application dependencies.
- Compatibility: Proposed React peer includes React19; no package Node engine restriction. npm11 can resolve the ordinary React library, and application Node24 stays unchanged. Review used imports, visual changes and retained ISC/Feather notices when updated.
- Decision: **MERGE_LATER**. Routine future maintenance after fresh current-main type/build/accessibility and representative icon checks. PR CI passes but cross-browser run was cancelled, so complete integration evidence is absent. No present need to change icons during branch reconciliation.
- Evidence: PR changes only package.json and lockfile lucide version; Official1.55.0 adds icons and DynamicIcon-related tests; PR6 CI success; Cross-browser regression cancelled.
- Sources: [Primary source 1](https://github.com/lucide-icons/lucide/releases/tag/1.55.0), [Primary source 2](https://registry.npmjs.org/lucide-react/1.55.0).
- PR runs: [CI](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38498896041): success; [Cross-browser regression](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38498896040): cancelled.

### #7: vite

- Head: `dependabot/npm_and_yarn/vite-8.3.4` at `ba5dd2afd45d6cc3b132076fcebbbf19cef55e1a`.
- Security relevance: Release lists build/preload/HMR/path fixes and dependency updates. No PR-specific advisory or confirmed vulnerability established; do not label every dev-server patch a security fix.
- Compatibility: Proposed Node engine ^20.19.0 || >=22.12.0 includes24.16.0; npm11 is suitable. Existing CI passes. Cross-browser has one Firefox geometry assertion failure: height43.99998474121094 versus minimum44, which is not evidence that Vite changed application behavior.
- Decision: **MERGE_LATER**. Reasonable separate patch candidate once refreshed against current main and the existing failed geometry case is resolved/validated without weakening assertions. Compare dev startup, SSR/hydration, build output and budgets. Release notes do not establish a fix for the previously documented AsyncLocalStorage development limitation.
- Evidence: PR7 CI success; Cross-browser failure only Firefox shard1; PR7 job117345954863 logs design-system.spec.ts:90 fractional bounding-box failure; Official patch notes include stylesheets/preload/build and Rolldown updates.
- Sources: [Primary source 1](https://github.com/vitejs/vite/releases/tag/v8.3.4), [Primary source 2](https://vite.dev/guide/#scaffolding-your-first-vite-project), [Primary source 3](https://registry.npmjs.org/vite/8.3.4).
- PR runs: [CI](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/39015262446): success; [Cross-browser regression](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/39015262448): failure.

### #8: @types/node

- Head: `dependabot/npm_and_yarn/types/node-26.6.5` at `93946b2a4a751c4c1d75d9f8057ba0ac2709398d`.
- Security relevance: Types only; this does not patch or upgrade the Node runtime and is not an established runtime security fix.
- Compatibility: npm11 can install declarations, but Node26 declarations describe a newer runtime surface than the project Node24 requirement. Baseline already has this mismatch; the patch neither creates nor resolves it. DefinitelyTyped patch numbers are independent of Node runtime patch releases and can include type changes.
- Decision: **DEFER**. Decide the runtime/type-major policy first and review alignment with Node24 types in a separate task. Do not infer that Node26 APIs exist on Node24 merely because strict compilation accepts them. PR CI/cross-browser were cancelled/incomplete and one WebKit check failed; no clean current-main compatibility proof.
- Evidence: package.json engine >=24.16.0 <25; .nvmrc24.16.0; lock @types/node26.6.4; PR8 changes only declarations version26.6.5; PR8 pull-request CI and Cross-browser both cancelled; push CI success is separate.
- Sources: [Primary source 1](https://github.com/DefinitelyTyped/DefinitelyTyped#how-do-definitely-typed-package-versions-relate-to-versions-of-the-corresponding-library), [Primary source 2](https://registry.npmjs.org/%40types%2Fnode/26.6.5).
- PR runs: [CI](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38498926210): cancelled; [Cross-browser regression](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38498926282): cancelled.

### Evidence limits

Check-run totals can include both push and pull-request events; the per-PR workflow conclusions identify actual PR runs. Historical failures/cancellations do not prove current product defects. Metadata mergeability is unknown and is not a merge decision. No advisory inventory or full security audit was run. “No specific fix established” is not a claim that a package has no vulnerabilities. Source and package changes were inspected without installing proposed versions.

## Preserved tag navigation

All 26 original tags are preserved: ten annotated tag objects and sixteen lightweight tags. This index groups existing names; it creates no release state, tag or retargeting. The JSON includes original ref/object/type, peeled object and final commit target. An annotated tag's object SHA is distinct from its peeled commit SHA.

### owner testing

| Tag                                                                                                                   | Kind      | Original object SHA                        | Peeled commit target                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`codex-first-manual-test-ready`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/codex-first-manual-test-ready)   | annotated | `1d2e8d16ea899151fd208140c2346e65046e96ca` | [`684345c41207c2d54044e79be52c42a303bfee90`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/684345c41207c2d54044e79be52c42a303bfee90) |
| [`fitness-os-owner-testing-ready`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/fitness-os-owner-testing-ready) | annotated | `95e8728e17344180a9eab8f35f8aebc4cfe70534` | [`dbf72ad557c42daa8c1cbcb98b225cae7bd29c75`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/dbf72ad557c42daa8c1cbcb98b225cae7bd29c75) |

### engineering completion

| Tag                                                                                                                               | Kind      | Original object SHA                        | Peeled commit target                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`fitness-os-automatable-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/fitness-os-automatable-complete)           | annotated | `880c73119fb222b794bc9f1a859656a0f64b6775` | [`e03ab59533f8bbde47807c192adcbf4bfee30b9f`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/e03ab59533f8bbde47807c192adcbf4bfee30b9f) |
| [`fitness-os-maximum-autonomy-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/fitness-os-maximum-autonomy-complete) | annotated | `6375a5daecf457a6f1c6971c9dc2403ae9a71b24` | [`976b4b291ed7e33bb3872401fb9be5e73fd9124d`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/976b4b291ed7e33bb3872401fb9be5e73fd9124d) |

### security verification

| Tag                                                                                                             | Kind      | Original object SHA                        | Peeled commit target                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`fitness-os-security-audited`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/fitness-os-security-audited) | annotated | `0e598534ccb239b7c5f379b298920118ffe19956` | [`80f06ab2b6b1f6d4da252455efcc71a1daecde09`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/80f06ab2b6b1f6d4da252455efcc71a1daecde09) |

### historical phase checkpoints

| Tag                                                                                                                                                 | Kind        | Original object SHA                        | Peeled commit target                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`phase-01-shell-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-01-shell-complete)                                             | lightweight | `7fde2a56abe59d3565388f3d46cf2119a2418936` | [`7fde2a56abe59d3565388f3d46cf2119a2418936`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/7fde2a56abe59d3565388f3d46cf2119a2418936) |
| [`phase-02-infrastructure-verified`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-02-infrastructure-verified)                           | lightweight | `4388980e111af35b874d1dde1ac637095294fde0` | [`4388980e111af35b874d1dde1ac637095294fde0`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/4388980e111af35b874d1dde1ac637095294fde0) |
| [`phase-03-exercise-infrastructure-verified`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-03-exercise-infrastructure-verified)         | lightweight | `9e4a7d129d9d07acc316d3580c6bb47c2767a1e9` | [`9e4a7d129d9d07acc316d3580c6bb47c2767a1e9`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/9e4a7d129d9d07acc316d3580c6bb47c2767a1e9) |
| [`phase-04-science-infrastructure-verified`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-04-science-infrastructure-verified)           | lightweight | `3c681ec45c9d18661b241e438a2320905de5f579` | [`3c681ec45c9d18661b241e438a2320905de5f579`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/3c681ec45c9d18661b241e438a2320905de5f579) |
| [`phase-05-program-infrastructure-verified`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-05-program-infrastructure-verified)           | lightweight | `75795a21d0097f29c4a66dd02acd148387cb3256` | [`75795a21d0097f29c4a66dd02acd148387cb3256`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/75795a21d0097f29c4a66dd02acd148387cb3256) |
| [`phase-06-workout-engineering-verified`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-06-workout-engineering-verified)                 | lightweight | `bdc7671e5da4fe573be79bab4fe6f451a8c5052e` | [`bdc7671e5da4fe573be79bab4fe6f451a8c5052e`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/bdc7671e5da4fe573be79bab4fe6f451a8c5052e) |
| [`phase-07-food-infrastructure-verified`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-07-food-infrastructure-verified)                 | lightweight | `29e3b30a2b4621039f4f893b095838b1a3c8f32a` | [`29e3b30a2b4621039f4f893b095838b1a3c8f32a`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/29e3b30a2b4621039f4f893b095838b1a3c8f32a) |
| [`phase-08-nutrient-infrastructure-verified`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-08-nutrient-infrastructure-verified)         | lightweight | `8e98b93989d87755746a14f180d28ffb78e42e6e` | [`8e98b93989d87755746a14f180d28ffb78e42e6e`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/8e98b93989d87755746a14f180d28ffb78e42e6e) |
| [`phase-09-diet-planning-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-09-diet-planning-complete)                             | lightweight | `9f19ec9d03235683e389951342b16a3c5fddeab7` | [`9f19ec9d03235683e389951342b16a3c5fddeab7`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/9f19ec9d03235683e389951342b16a3c5fddeab7) |
| [`phase-10-nutrition-tracker-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-10-nutrition-tracker-complete)                     | lightweight | `17a8f880dd15a7296932f5505a942522672e2f82` | [`17a8f880dd15a7296932f5505a942522672e2f82`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/17a8f880dd15a7296932f5505a942522672e2f82) |
| [`phase-11-recipes-meal-plans-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-11-recipes-meal-plans-complete)                   | lightweight | `45c204cb2f31a1905ff47945e13e01c2d698abc2` | [`45c204cb2f31a1905ff47945e13e01c2d698abc2`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/45c204cb2f31a1905ff47945e13e01c2d698abc2) |
| [`phase-12-recovery-sleep-mobility-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-12-recovery-sleep-mobility-complete)         | lightweight | `e6d6fcb640fdc8e2048f2a7330971c073d3e1239` | [`e6d6fcb640fdc8e2048f2a7330971c073d3e1239`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/e6d6fcb640fdc8e2048f2a7330971c073d3e1239) |
| [`phase-13-cardio-conditioning-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-13-cardio-conditioning-complete)                 | lightweight | `19585d57211849359e7abbc5e27e2bcd2bd82c32` | [`19585d57211849359e7abbc5e27e2bcd2bd82c32`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/19585d57211849359e7abbc5e27e2bcd2bd82c32) |
| [`phase-14-supplements-evidence-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-14-supplements-evidence-complete)               | annotated   | `c89f6918e80b22392664868e061e03fc65009ec0` | [`1039b6e970595b3aab706e696150eed7dc03a189`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/1039b6e970595b3aab706e696150eed7dc03a189) |
| [`phase-15-body-progress-analytics-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-15-body-progress-analytics-complete)         | annotated   | `8e2de553f6530f7f9b33ef3a817e8a0a536350be` | [`f121e8b2bc221123f6779b4c695bce865b8a2909`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/f121e8b2bc221123f6779b4c695bce865b8a2909) |
| [`phase-16-global-search-saved-compare-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-16-global-search-saved-compare-complete) | lightweight | `3d0df3876c3107a7437541e15bfea867c7969b92` | [`3d0df3876c3107a7437541e15bfea867c7969b92`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/3d0df3876c3107a7437541e15bfea867c7969b92) |
| [`phase-17-local-backup-export-complete`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/phase-17-local-backup-export-complete)                 | lightweight | `88b4efc48fbb77c37e2cd9873fed97d548f6546b` | [`88b4efc48fbb77c37e2cd9873fed97d548f6546b`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/88b4efc48fbb77c37e2cd9873fed97d548f6546b) |

### safety checkpoints

| Tag                                                                                                                                         | Kind        | Original object SHA                        | Peeled commit target                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`pre-repository-structure-cleanup`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/pre-repository-structure-cleanup)                   | lightweight | `b7f332a9ef2344113cf27ff9ff07dd4618c3f785` | [`b7f332a9ef2344113cf27ff9ff07dd4618c3f785`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/b7f332a9ef2344113cf27ff9ff07dd4618c3f785) |
| [`pre-security-hygiene-final-test`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/pre-security-hygiene-final-test)                     | annotated   | `aedae89c61955cead25835577359095cf97ddddb` | [`26281fdb9fa6058eabdbf032336e5e54b2a1da62`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/26281fdb9fa6058eabdbf032336e5e54b2a1da62) |
| [`pre-vercel-finalization-safety-checkpoint`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/pre-vercel-finalization-safety-checkpoint) | annotated   | `11fa811d55dd0a223bc97303dead18ac65e1c4e1` | [`684345c41207c2d54044e79be52c42a303bfee90`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/684345c41207c2d54044e79be52c42a303bfee90) |

### release readiness

| Tag                                                                                                       | Kind      | Original object SHA                        | Peeled commit target                                                                                                                        |
| --------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`pre-vercel-release-ready`](https://github.com/YellankiKaushik/Gymuuuuuuu/tree/pre-vercel-release-ready) | annotated | `27fb7596a5fb1c318169a21529153efba134f920` | [`26281fdb9fa6058eabdbf032336e5e54b2a1da62`](https://github.com/YellankiKaushik/Gymuuuuuuu/commit/26281fdb9fa6058eabdbf032336e5e54b2a1da62) |

## October 19 scheduled CI investigation

[Run 39271935022](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/39271935022), attempt 1, used the unchanged application SHA `a946027b1f3a8754928c393228df696400b6b391`. Its record was created October 19 at 14:46:06 UTC (20:16:06 Asia/Calcutta).

**Classification: `INFRASTRUCTURE_ACCOUNT_BILLING_STARTUP_DENIAL`.** All twelve matrix job records have runner ID 0, blank runner/group names and zero steps. Job-record lifecycle timestamps 14:46:07–14:46:10/11 UTC are not execution evidence. Every check annotation explicitly reports a payment/spending-limit startup denial. No checkout, installation, build, harness or browser test started; no application defect is established. The Ubuntu 26 migration annotation is informational, not the demonstrated failure reason.

**`ROOT_CAUSE_UNVERIFIED` for unavailable log-level evidence and the exact account condition.** All twelve log requests returned 404 BlobNotFound; artifacts: 0. The annotations establish the startup-denial category, but do not distinguish failed payment from spending cap, and account settings were not available. Inspecting a red conclusion alone would not justify a product diagnosis.

Earlier same-SHA passing runs were [CI 39016089588](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/39016089588) and [Cross-browser 39016089544](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/39016089544), October 17. No old job or full matrix was rerun to investigate this failure; no test or deadline was weakened. The owner should inspect GitHub Billing & plans / Actions payment and spending controls before any future authorized rerun.

## Production identity preserved

- Project: `prj_1FC5ytETu88SnshSUWGHtjvWcQBN` (gymuuuuuuu).
- Deployment: `dpl_5sLqYJstGvCKQWkMyh3A9vNQqVx7`; target production; state **READY**.
- Production Git SHA: `a946027b1f3a8754928c393228df696400b6b391`; Git ref `main`.
- Stable URL: [kaush-ka-gym.vercel.app](https://kaush-ka-gym.vercel.app).
- All three project aliases target that deployment. Automatic Git deployments remain disabled in the unchanged [Vercel config](../../vercel.json).
- New deployments/promotions/rollbacks/environment changes: **0**. Documentation-only reconciliation does not change browser origins, storage or deployed code.

## Visual-training handoff

The [bounded next-phase roadmap](../roadmap/visual-training-next-phase.md) separates verified capabilities, UX gaps, educational gaps, unavailable/unlicensed visuals and proposed work. Baseline is 70 published muscles, 32 exercises, 32 science topics and four programs. It proposes six existing exercises, twelve existing linked muscle IDs and at most two personal sessions. It does not publish the 900-item backlog or authorize implementation.

## Focused validation and safety

- **status**: Passed focused documentation/ref/workflow checks
- **originalTrackedFilesPreserved**: 1334
- **originalTrackedFilesModified**: 0
- **filesDeleted**: 0
- **filesMoved**: 0
- **filesRenamed**: 0
- **intendedAdditions**: 3
- **jsonSyntax**: passed
- **markdown**: {"fileLinks":25,"headingAnchors":0,"externalSourceLinksRecorded":117,"brokenInternalLinks":0}
- **workflows**: {"parsed":3,"pinnedActionUses":14,"permissions":"unchanged contents:read","files":[{"path":".github/workflows/ci.yml","byteIdentical":true,"syntaxValid":true,"events":["pull_request","push","workflow_dispatch"]},{"path":".github/workflows/cross-browser.yml","byteIdentical":true,"syntaxValid":true,"events":["pull_request","push","schedule","workflow_dispatch"]},{"path":".github/workflows/release-evidence.yml","byteIdentical":true,"syntaxValid":true,"events":["workflow_dispatch"]}]}
- **refs**: {"githubBranches":10,"retired":3,"preservedOriginalTags":26,"annotatedTagsPeeledVerified":10,"newTags":0}
- **pilot**: {"publishedMuscles":70,"publishedExercises":32,"publishedScience":32,"publishedPrograms":4,"exerciseAllowlist":6,"muscleAllowlist":12,"idGraph":"valid"}
- **runtimeChanges**: false
- **automaticGitDeploymentEnabled**: false
- **broadBrowserRunsRequested**: 0
- **securityAuditsRequested**: 0
- **transientLogsStaged**: 0

Validation is deliberately limited to the three documentation files, JSON syntax, links, original-file hashes, remote refs/tags/PRs and unchanged workflow configuration/pins. No 942-case browser run, dependency install/upgrade or complete security audit was started. Existing automatic push workflows remain configured; this report does not claim future job outcomes.

Files deleted: **0**. Files moved/renamed: **0**. Source content lost: **0**. Existing tracked content preserved: **1,334 files**. History rewritten: **no**. Force pushes: **0**. Tags changed/created/deleted: **0**. Dependency PR merges/closes and Dependabot branch deletions: **0**. Runtime, datasets, archive, README and DESIGN.md remain unchanged.

## Outstanding owner decisions

- Inspect GitHub Billing & plans / Actions payment and spending controls before a future authorized rerun; account details are not available here.
- Authorize a separate immutable provenance-URL repair before retiring codex/phase-19-verified-content; keep it frozen meanwhile.
- Approve or revise the single bounded pilot before implementation. Dependency updates remain separately authorized work; retain all PRs until resolved.
