# Final maximum-autonomy closure

Automatable engineering: **43/43 = 100%**. Former owner technical portions: **14/14 = 100%**. Full release checklist: **43/52 = 82.69%**. Equal-weight task accounting: 29 established engineering checkpoints plus 14 technical former-owner portions = 43 automated checkpoints. Nine separately stated irreducible physical/human boundaries remain, so 43/52 = 82.69%. This refinement changes the old category denominator; it is not certification or universal test coverage. Optional repository policy, prohibited/unsupported features and 900 frozen identities are excluded. A proxy completion never means its physical/human boundary passed.

Completion assertions take effect only at the verified annotated `fitness-os-maximum-autonomy-complete` tag after final main CI passes. Before tagging, these are release-candidate reports. Exact final SHA and CI run IDs are recorded in that tag annotation and the final handoff.

Verified implementation: **6ac581aa07d0480679cc3762aee05d4d9962fe1b**. Production deployment: **dpl_4cYvnfx5AAMTJJDhLRzqXoGKLhd3**, same runtime SHA, at https://kaush-ka-gym.vercel.app. Final documentation-only HEAD/CI are identified by the release tag and final response; no future self-hash is invented here.

## Gates and evidence

```json
{
  "implementationCommit": "6ac581aa07d0480679cc3762aee05d4d9962fe1b",
  "verifiedTestCommit": "252f8bc9e720f514db905257755d3f8f30d22a66",
  "runtimeUnchangedAfterDeployment": true,
  "runtimeDiffPaths": [],
  "production": {
    "id": "dpl_4cYvnfx5AAMTJJDhLRzqXoGKLhd3",
    "name": "gymuuuuuuu",
    "url": "gymuuuuuuu-ejb3vcnsq-kaushik-yellanki-project.vercel.app",
    "project": {
      "id": "prj_1FC5ytETu88SnshSUWGHtjvWcQBN",
      "name": "gymuuuuuuu",
      "framework": "tanstack-start"
    },
    "state": "READY",
    "target": "production",
    "aliases": [
      "kaush-ka-gym.vercel.app",
      "gymuuuuuuu-kaushik-yellanki-project.vercel.app",
      "gymuuuuuuu-git-main-kaushik-yellanki-project.vercel.app"
    ],
    "runtimeSha": "6ac581aa07d0480679cc3762aee05d4d9962fe1b",
    "branch": "main",
    "source": "server-side GitSource",
    "regions": ["iad1"],
    "verifiedAt": "2026-10-12T15:17:09.014Z"
  },
  "initialCi": [
    {
      "id": 38243072323,
      "name": "CI",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "e03ab59533f8bbde47807c192adcbf4bfee30b9f",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38243072323",
      "created_at": "2026-10-12T11:30:21Z"
    },
    {
      "id": 38243072054,
      "name": "CI",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "e03ab59533f8bbde47807c192adcbf4bfee30b9f",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38243072054",
      "created_at": "2026-10-12T11:30:21Z"
    },
    {
      "id": 38243072019,
      "name": "Cross-browser regression",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "e03ab59533f8bbde47807c192adcbf4bfee30b9f",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38243072019",
      "created_at": "2026-10-12T11:30:21Z"
    },
    {
      "id": 38134205091,
      "name": "CI",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "dbf72ad557c42daa8c1cbcb98b225cae7bd29c75",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38134205091",
      "created_at": "2026-10-11T11:04:00Z"
    },
    {
      "id": 38134196808,
      "name": "Cross-browser regression",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "dbf72ad557c42daa8c1cbcb98b225cae7bd29c75",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38134196808",
      "created_at": "2026-10-11T11:03:51Z"
    },
    {
      "id": 38134196792,
      "name": "CI",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "dbf72ad557c42daa8c1cbcb98b225cae7bd29c75",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38134196792",
      "created_at": "2026-10-11T11:03:51Z"
    },
    {
      "id": 38119964171,
      "name": "CI",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "80f06ab2b6b1f6d4da252455efcc71a1daecde09",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38119964171",
      "created_at": "2026-10-11T07:01:15Z"
    },
    {
      "id": 38113786188,
      "name": "CI",
      "event": "pull_request",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "51e95354e3f23af30be9955b953a9ceefd88f804",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38113786188",
      "created_at": "2026-10-11T05:07:40Z"
    },
    {
      "id": 38113786167,
      "name": "Cross-browser regression",
      "event": "pull_request",
      "status": "completed",
      "conclusion": "failure",
      "head_sha": "51e95354e3f23af30be9955b953a9ceefd88f804",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38113786167",
      "created_at": "2026-10-11T05:07:40Z"
    },
    {
      "id": 38113783943,
      "name": "CI",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "51e95354e3f23af30be9955b953a9ceefd88f804",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38113783943",
      "created_at": "2026-10-11T05:07:37Z"
    },
    {
      "id": 38113743086,
      "name": "github_actions in / for actions/checkout - Update #1621145440",
      "event": "dynamic",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "80f06ab2b6b1f6d4da252455efcc71a1daecde09",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38113743086",
      "created_at": "2026-10-11T05:06:54Z"
    },
    {
      "id": 38113668894,
      "name": "Cross-browser regression",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "80f06ab2b6b1f6d4da252455efcc71a1daecde09",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38113668894",
      "created_at": "2026-10-11T05:05:31Z"
    },
    {
      "id": 38113668825,
      "name": "CI",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "80f06ab2b6b1f6d4da252455efcc71a1daecde09",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38113668825",
      "created_at": "2026-10-11T05:05:31Z"
    },
    {
      "id": 38113666224,
      "name": "Cross-browser regression",
      "event": "push",
      "status": "completed",
      "conclusion": "failure",
      "head_sha": "80f06ab2b6b1f6d4da252455efcc71a1daecde09",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38113666224",
      "created_at": "2026-10-11T05:05:28Z"
    },
    {
      "id": 38113666181,
      "name": "CI",
      "event": "push",
      "status": "completed",
      "conclusion": "success",
      "head_sha": "80f06ab2b6b1f6d4da252455efcc71a1daecde09",
      "html_url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38113666181",
      "created_at": "2026-10-11T05:05:28Z"
    }
  ],
  "preFinalCi": {
    "checkedAt": "2026-10-12T16:11:39.359Z",
    "sha": "252f8bc9e720f514db905257755d3f8f30d22a66",
    "runs": [
      {
        "id": 38271577485,
        "name": "CI",
        "event": "push",
        "head_branch": "main",
        "sha": "252f8bc9e720f514db905257755d3f8f30d22a66",
        "status": "completed",
        "conclusion": "success",
        "url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38271577485",
        "jobs": [
          {
            "id": 114886847427,
            "name": "verify",
            "status": "completed",
            "conclusion": "success",
            "failedSteps": [],
            "skippedSteps": ["Preserve failed regression diagnostics"]
          },
          {
            "id": 114886847657,
            "name": "accessibility",
            "status": "completed",
            "conclusion": "success",
            "failedSteps": [],
            "skippedSteps": ["Preserve failed accessibility diagnostics"]
          }
        ]
      },
      {
        "id": 38271577458,
        "name": "Cross-browser regression",
        "event": "push",
        "head_branch": "main",
        "sha": "252f8bc9e720f514db905257755d3f8f30d22a66",
        "status": "completed",
        "conclusion": "failure",
        "url": "https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/38271577458",
        "jobs": [
          {
            "id": 114887006123,
            "name": "browser (chromium)",
            "status": "completed",
            "conclusion": "success",
            "failedSteps": [],
            "skippedSteps": ["Preserve failed browser diagnostics"]
          },
          {
            "id": 114887006493,
            "name": "browser (firefox)",
            "status": "completed",
            "conclusion": "success",
            "failedSteps": [],
            "skippedSteps": ["Preserve failed browser diagnostics"]
          },
          {
            "id": 114887006528,
            "name": "browser (webkit)",
            "status": "completed",
            "conclusion": "failure",
            "failedSteps": ["Verify closure proxies on the installed browser"],
            "skippedSteps": [
              "Post Run actions/setup-node@820762786026740c76f36085b0efc47a31fe5020"
            ]
          }
        ]
      }
    ],
    "allGreen": false
  },
  "assertionScope": {
    "ref": "fitness-os-maximum-autonomy-complete",
    "effectiveOnlyAtVerifiedTag": true,
    "beforeTag": "These assembled reports are release-candidate documentation, not a claim that their future commit CI has already passed.",
    "releaseRequirements": "Every final-main workflow/job completed successfully before tag creation; current production remains healthy with all runtime fixes deployed."
  },
  "finalDocumentationCiBinding": {
    "ref": "fitness-os-maximum-autonomy-complete",
    "source": "Annotated tag includes exact final documentation SHA and completed CI run IDs; final response lists them too.",
    "required": "Every final-main workflow/job completed successfully before tag creation. No future self-hash or future run ID is invented in this report."
  },
  "gates": {
    "cleanCloneCommit": "6ac581aa07d0480679cc3762aee05d4d9962fe1b",
    "cleanClone": "artifacts/final-closure/release-clone",
    "install": "PASS",
    "format": "PASS",
    "lint": "PASS",
    "strictTypes": "PASS",
    "contentAndSearch": "PASS",
    "units": {
      "passed": 360,
      "files": 95
    },
    "coverage": {
      "statements": 73.12,
      "branches": 64.94,
      "functions": 67.48,
      "lines": 77.05
    },
    "privacyStatic": {
      "passed": true,
      "sourceFiles": 393
    },
    "build": "PASS",
    "npmAudit": {
      "vulnerabilities": 0
    },
    "routes": {
      "passed": 702,
      "failed": 0,
      "skipped": 0,
      "flaky": 0,
      "sourceCommit": "6ac581aa07d0480679cc3762aee05d4d9962fe1b",
      "currentBuildReport": "PASS",
      "evidence": "artifacts/final-closure/release-routes.json"
    },
    "localScreen": {
      "sourceCommit": "dadcfdf5f0c97e88b5400bdc78cb236d1df3804c",
      "chromium": 287,
      "webkit": 287,
      "accessibilityPerEngine": 184,
      "failed": 0,
      "scope": "Frozen candidate full local screen matrix; later print-only token correction does not change screen styles. Final runtime has both-theme targeted/local/live print and full hosted screen matrices. The older build hash is not relabelled."
    },
    "localClosure": {
      "sourceCommit": "6ac581aa07d0480679cc3762aee05d4d9962fe1b",
      "passed": 48,
      "projects": {
        "closure-chromium": {
          "passed": 8,
          "failed": 0,
          "skipped": 0,
          "flaky": 0,
          "accessibility": 0,
          "privacy": {
            "cases": 1,
            "requests": 1041,
            "remotes": 0,
            "leaks": 0,
            "errors": 0,
            "failedAssets": 0
          }
        },
        "closure-webkit": {
          "passed": 8,
          "failed": 0,
          "skipped": 0,
          "flaky": 0,
          "accessibility": 0,
          "privacy": {
            "cases": 1,
            "requests": 1038,
            "remotes": 0,
            "leaks": 0,
            "errors": 0,
            "failedAssets": 0
          }
        },
        "android-chromium": {
          "passed": 8,
          "failed": 0,
          "skipped": 0,
          "flaky": 0,
          "accessibility": 0,
          "privacy": {
            "cases": 1,
            "requests": 1041,
            "remotes": 0,
            "leaks": 0,
            "errors": 0,
            "failedAssets": 0
          }
        },
        "iphone-webkit": {
          "passed": 8,
          "failed": 0,
          "skipped": 0,
          "flaky": 0,
          "accessibility": 0,
          "privacy": {
            "cases": 1,
            "requests": 1038,
            "remotes": 0,
            "leaks": 0,
            "errors": 0,
            "failedAssets": 0
          }
        },
        "ipad-webkit": {
          "passed": 8,
          "failed": 0,
          "skipped": 0,
          "flaky": 0,
          "accessibility": 0,
          "privacy": {
            "cases": 1,
            "requests": 1039,
            "remotes": 0,
            "leaks": 0,
            "errors": 0,
            "failedAssets": 0
          }
        },
        "android-tablet-chromium": {
          "passed": 8,
          "failed": 0,
          "skipped": 0,
          "flaky": 0,
          "accessibility": 0,
          "privacy": {
            "cases": 1,
            "requests": 1041,
            "remotes": 0,
            "leaks": 0,
            "errors": 0,
            "failedAssets": 0
          }
        }
      }
    },
    "hostedScreen": {
      "chromium": 287,
      "firefox": 287,
      "webkit": 287,
      "sourceTestCommit": "252f8bc9e720f514db905257755d3f8f30d22a66"
    },
    "hostedClosure": {
      "chromium": 24,
      "firefox": 8,
      "webkit": 24,
      "total": 56
    },
    "hostedAccessibility": 184
  },
  "live": {
    "origin": "https://kaush-ka-gym.vercel.app",
    "initialMatrix": {
      "passed": 44,
      "failed": 4,
      "evidence": "artifacts/final-closure/live-closure.json"
    },
    "focusedAfterReadiness": {
      "lifecyclePassed": 6,
      "pickerPassed": 1,
      "nativeTypingPassed": 6,
      "evidence": [
        "artifacts/final-closure/live-lifecycle-final.json",
        "artifacts/final-closure/live-picker-final.json"
      ]
    },
    "finalScenarioMatrix": {
      "scenarios": 48,
      "passed": 48,
      "method": "Retained 44 original successes; three WebKit lifecycle failures and one iPhone picker readiness failure were resolved by stronger explicit readiness checks. All six lifecycle configurations plus the iPhone picker passed focused reruns. No errors were filtered and no timeouts increased."
    },
    "lifecyclePrivacy": {
      "cases": 6,
      "requests": 6243,
      "remotes": 0,
      "leaks": 0,
      "errors": 0,
      "failedAssets": 0
    },
    "independentSsr": {
      "routes": 15,
      "requests": 684,
      "markerLeaks": 0,
      "unexpectedRemote": 0,
      "errors": 0,
      "failedAssets": 0,
      "cspViolations": 0,
      "xssDialogs": 0,
      "distinctNonces": true,
      "canonical": "https://kaush-ka-gym.vercel.app/",
      "https": "Verified with normal certificate validation"
    },
    "runtimeHealth": {
      "checkedAt": "2026-10-12T15:34:49.383Z",
      "errorClusters": 0,
      "errorClusterWindow": "1h requested, subject to plan retention",
      "warningErrorFatalLogs": 0,
      "logWindow": "2026-10-12T15:04:49.383Z to 2026-10-12T15:34:49.383Z",
      "limitation": "Bounded production observation; Hobby retention is not an application failure. No universal absence-of-errors claim."
    }
  },
  "performance": {
    "jsAssets": 158,
    "totalJsGzip": 701549,
    "totalJsLimit": 716800,
    "largestJsGzip": 168570,
    "chunkLimit": 204800,
    "jsonAssets": 97,
    "totalJsonGzip": 429517,
    "totalJsonLimit": 524288,
    "largestJsonGzip": 59287,
    "jsonChunkLimit": 65536,
    "budgetsIncreased": false
  },
  "content": {
    "publishedEntities": 520,
    "searchDocuments": 648,
    "frozenUnpublished": 900,
    "muscles": 70,
    "exercises": 32,
    "science": 32,
    "programs": 4,
    "foods": 264,
    "foodProfiles": 273,
    "numericFoodValues": 10011,
    "nutrients": 51,
    "fdaRows": 35,
    "recipes": 24,
    "mealTemplates": 3,
    "recovery": 15,
    "cardio": 13,
    "supplements": 12,
    "expanded": false
  },
  "devices": {
    "android": {
      "preset": "Pixel 7",
      "viewport": "412×839",
      "screen": "412×915",
      "scale": 2.625,
      "engine": "Chromium",
      "touch": true
    },
    "iphone": {
      "preset": "iPhone 13",
      "viewport": "390×664",
      "screen": "390×844",
      "scale": 3,
      "engine": "WebKit",
      "touch": true
    },
    "ipad": {
      "preset": "iPad generation 7",
      "viewport": "810×1080",
      "scale": 2,
      "engine": "WebKit",
      "touch": true
    },
    "androidTablet": {
      "viewport": "800×1280",
      "scale": 2,
      "engine": "Chromium",
      "touch": true
    },
    "desktop": {
      "viewport": "1440×900",
      "engines": ["Chromium", "WebKit", "hosted Firefox"]
    },
    "approximation": "Portrait/landscape, 512px split width and 360px keyboard-height viewport; coarse pointer, both themes and reduced motion. No physical device or actual OS keyboard was operated."
  },
  "keyboard": {
    "localCases": 6,
    "hostedCases": 7,
    "liveCases": 6,
    "routesPerCase": 12,
    "keys": ["Tab", "Shift+Tab", "Enter", "Space", "Escape", "ArrowDown"],
    "checks": "Visible focus including shared input wrapper, dialog containment and return to opener, labels and consent"
  },
  "semantics": {
    "localCases": 6,
    "hostedCases": 7,
    "liveCases": 6,
    "routesPerCase": 12,
    "violations": 0,
    "snapshots": true,
    "liveInvalidRestoreAlert": true,
    "auditoryTesting": false
  },
  "zoom": {
    "routes": 12,
    "themes": ["light", "dark"],
    "scenarios": [
      {
        "effectiveViewport": 640,
        "zoomApproximation": "200% of 1280px"
      },
      {
        "effectiveViewport": 320,
        "zoomApproximation": "400% of 1280px"
      },
      {
        "effectiveViewport": 640,
        "rootFontSize": 32,
        "measuredElementTextScale": 2
      }
    ],
    "combinationsPerConfiguration": 72,
    "clippedControls": 0,
    "physicalZoomPreferenceTested": false
  },
  "print": {
    "routes": [
      "/exercises/push-up",
      "/foods/apple",
      "/recipes/chickpea-cucumber-bowl",
      "/progress/weight"
    ],
    "themes": ["light", "dark"],
    "localConfigurations": 6,
    "liveConfigurations": 6,
    "paper": "A4; 794×1123 CSS viewport; 12mm PDF margins",
    "pdfQa": {
      "files": [
        {
          "file": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\print\\closure-chromium\\_exercises_push-up.pdf",
          "pages": 6,
          "textCharacters": 4398,
          "unitsAndSourcesRetained": true
        },
        {
          "file": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\print\\closure-chromium\\_foods_apple.pdf",
          "pages": 7,
          "textCharacters": 7221,
          "unitsAndSourcesRetained": true
        },
        {
          "file": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\print\\closure-chromium\\_progress_weight.pdf",
          "pages": 2,
          "textCharacters": 989,
          "unitsAndSourcesRetained": true
        },
        {
          "file": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\print\\closure-chromium\\_recipes_chickpea-cucumber-bowl.pdf",
          "pages": 5,
          "textCharacters": 5092,
          "unitsAndSourcesRetained": true
        }
      ],
      "pagesRendered": 20,
      "contactSheet": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\final-pdf-render\\all-pages.png",
      "limitation": "Read-only browser print captures; no authored PDF or owner actual records."
    },
    "visuallyInspectedAllPages": true,
    "navigationHidden": true,
    "unitsSourcesRetained": true
  },
  "storage": {
    "unavailable": "PASS existing browser regressions",
    "queuedWriteAbort": "PASS existing nutrition integrity regression",
    "quotaRollback": "PASS existing restore regression",
    "blockedUpgrade": "PASS existing restore regression",
    "blockedClear": "PASS existing restore regression",
    "interruptedJournalResume": "PASS new direct existing-suite regression",
    "interruptedJournalRollback": "PASS new direct existing-suite regression",
    "realOsEviction": "OWNER_PHYSICAL_REQUIRED",
    "globalAtomicity": "INTENTIONALLY_UNSUPPORTED"
  },
  "filesPhotos": {
    "chooserEvents": true,
    "reselection": true,
    "emptySelectionPreservesStores": true,
    "saveAbortHandlerConfirmed": true,
    "invalidFutureGzipRejected": true,
    "oversizedBackupRejectedBeforeReading": true,
    "csv": "Existing exact/formula-safe unit/module regressions plus actual nonempty download",
    "formats": ["JPEG", "PNG", "WebP"],
    "corruptMimeSizeDimensionsRejected": true,
    "reloadPreservesThreePhotos": true,
    "portableBinaryAssets": 0,
    "fullMediaBinaryAssets": 1,
    "unexpectedUploads": 0,
    "nativeOsDialogPresentationTested": false
  },
  "custody": {
    "integrity": {
      "checkedAt": "2026-10-12T15:34:31.368Z",
      "entries": [
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-synthetic-after-edit.json",
          "originalSha256": "5c05d76d58ade0e0845be6ba468f6ec81616e4e5bee22edd4f2f9f8de3469880",
          "copySha256": "5c05d76d58ade0e0845be6ba468f6ec81616e4e5bee22edd4f2f9f8de3469880",
          "byteIdentical": true,
          "totalRecords": 48,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-synthetic-portable.json",
          "originalSha256": "f4218c1e695447602ff432cdddb048712853e94c48ba4683c89de4ad4d3c830a",
          "copySha256": "f4218c1e695447602ff432cdddb048712853e94c48ba4683c89de4ad4d3c830a",
          "byteIdentical": true,
          "totalRecords": 42,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium-1791815253510\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-1791815253510-synthetic-after-edit.json",
          "originalSha256": "cabe5bdc5933ef9479d3324879084d16f25d29de20554c2eea6909b5e1e52d78",
          "copySha256": "cabe5bdc5933ef9479d3324879084d16f25d29de20554c2eea6909b5e1e52d78",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium-1791815253510\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-1791815253510-synthetic-full-media.json",
          "originalSha256": "8eeec9230a4dbd341cba28ff7c2ae4c59518968fa3eea592889091e48518ec76",
          "copySha256": "8eeec9230a4dbd341cba28ff7c2ae4c59518968fa3eea592889091e48518ec76",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium-1791815253510\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-1791815253510-synthetic-portable.json",
          "originalSha256": "b41b0fa36bc03752c12bbf185f8d886fe8643428e5de37e5529a8373c0ae87e7",
          "copySha256": "b41b0fa36bc03752c12bbf185f8d886fe8643428e5de37e5529a8373c0ae87e7",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium-1791818376821\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-1791818376821-synthetic-after-edit.json",
          "originalSha256": "124be000c640ce307f4817e9d7d0a3afdb7152a202468c61d3d60c9669d2df14",
          "copySha256": "124be000c640ce307f4817e9d7d0a3afdb7152a202468c61d3d60c9669d2df14",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium-1791818376821\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-1791818376821-synthetic-full-media.json",
          "originalSha256": "cd66407fb33d58b3714d31f1f4db4018413197faf2849d698856abd5350b4611",
          "copySha256": "cd66407fb33d58b3714d31f1f4db4018413197faf2849d698856abd5350b4611",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium-1791818376821\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-1791818376821-synthetic-portable.json",
          "originalSha256": "eccaf67562b20d76caef91a1888cc5fe695cf98bcc7d3bef68dfbcb55d4cfa91",
          "copySha256": "eccaf67562b20d76caef91a1888cc5fe695cf98bcc7d3bef68dfbcb55d4cfa91",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium-1791818935610\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-1791818935610-synthetic-after-edit.json",
          "originalSha256": "b80e74df6ab75e839bb57c1d3cc363c47f0da526818807708b9002e545e8f6d9",
          "copySha256": "b80e74df6ab75e839bb57c1d3cc363c47f0da526818807708b9002e545e8f6d9",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium-1791818935610\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-1791818935610-synthetic-full-media.json",
          "originalSha256": "40843d91010c8a4f3233dec0ca2497475eb9983a1bdbb0ab4281e2fd4ca382b1",
          "copySha256": "40843d91010c8a4f3233dec0ca2497475eb9983a1bdbb0ab4281e2fd4ca382b1",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-chromium-1791818935610\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-chromium-1791818935610-synthetic-portable.json",
          "originalSha256": "981c1ee2ee3aeda3189604c98eb37394642096e86024fe73b83801fa0be969eb",
          "copySha256": "981c1ee2ee3aeda3189604c98eb37394642096e86024fe73b83801fa0be969eb",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-synthetic-after-edit.json",
          "originalSha256": "0ee685b519b5d930821c9bcda4503445095058a55eb6e6c70ef35aa700f3cf72",
          "copySha256": "0ee685b519b5d930821c9bcda4503445095058a55eb6e6c70ef35aa700f3cf72",
          "byteIdentical": true,
          "totalRecords": 47,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-synthetic-portable.json",
          "originalSha256": "ce1260105e16d2a8356a7c60683948fc6216ff7a63cec101e0fae87207b9283c",
          "copySha256": "ce1260105e16d2a8356a7c60683948fc6216ff7a63cec101e0fae87207b9283c",
          "byteIdentical": true,
          "totalRecords": 41,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791815298462\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-1791815298462-synthetic-after-edit.json",
          "originalSha256": "6c17a2db55322276f69fa5811142648aafcda5820b01c6c730565aa39485313d",
          "copySha256": "6c17a2db55322276f69fa5811142648aafcda5820b01c6c730565aa39485313d",
          "byteIdentical": true,
          "totalRecords": 49,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791815298462\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-1791815298462-synthetic-full-media.json",
          "originalSha256": "f1d3df2ce2940be6b5c224a1a90a28ec434ff3c289421b71ffc695673851c7ac",
          "copySha256": "f1d3df2ce2940be6b5c224a1a90a28ec434ff3c289421b71ffc695673851c7ac",
          "byteIdentical": true,
          "totalRecords": 43,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791815298462\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-1791815298462-synthetic-portable.json",
          "originalSha256": "a8398eaadf8c2dabb582e45e22e1087762da6a25de468be1c645b78c18652ca5",
          "copySha256": "a8398eaadf8c2dabb582e45e22e1087762da6a25de468be1c645b78c18652ca5",
          "byteIdentical": true,
          "totalRecords": 43,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791818700797\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-1791818700797-synthetic-after-edit.json",
          "originalSha256": "7e38fae6a30380386dd280c48eca9536bf831e108058cc08ea0f054278f779d9",
          "copySha256": "7e38fae6a30380386dd280c48eca9536bf831e108058cc08ea0f054278f779d9",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791818700797\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-1791818700797-synthetic-full-media.json",
          "originalSha256": "0e3fca7a3ba5c9b6330f8175ebea9d36e08dea634509cd31b673c6bd9ff04af2",
          "copySha256": "0e3fca7a3ba5c9b6330f8175ebea9d36e08dea634509cd31b673c6bd9ff04af2",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791818700797\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-1791818700797-synthetic-portable.json",
          "originalSha256": "a51a5219e1ecf9ec5055255402b9d8097f7a88690f4428d3fce1c8c807a490fb",
          "copySha256": "a51a5219e1ecf9ec5055255402b9d8097f7a88690f4428d3fce1c8c807a490fb",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791819012080\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-1791819012080-synthetic-after-edit.json",
          "originalSha256": "e1ab8702a7a617597944a5b642b9c779893aa02bc9d58bbb44f6371e0452ba0c",
          "copySha256": "e1ab8702a7a617597944a5b642b9c779893aa02bc9d58bbb44f6371e0452ba0c",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791819012080\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-1791819012080-synthetic-full-media.json",
          "originalSha256": "47f04bd0a6b2dab5b3b12bc82c2c4f95e0b895eb57f04f29a204181aa7a0bbd2",
          "copySha256": "47f04bd0a6b2dab5b3b12bc82c2c4f95e0b895eb57f04f29a204181aa7a0bbd2",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791819012080\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-android-tablet-chromium-1791819012080-synthetic-portable.json",
          "originalSha256": "51ae657da136848be18f6af8585416d05fa0aafe3141cb00ae65882c4a5356e6",
          "copySha256": "51ae657da136848be18f6af8585416d05fa0aafe3141cb00ae65882c4a5356e6",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-synthetic-after-edit.json",
          "originalSha256": "40c4df40eb25a676cf71d92c260dfdea98c074d070efde4f23b571aaa321c174",
          "copySha256": "40c4df40eb25a676cf71d92c260dfdea98c074d070efde4f23b571aaa321c174",
          "byteIdentical": true,
          "totalRecords": 48,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-synthetic-portable.json",
          "originalSha256": "43f53f5f1cd77d3877584836389cc87fc677d7c0e0a095fd9f87c813f20af1cb",
          "copySha256": "43f53f5f1cd77d3877584836389cc87fc677d7c0e0a095fd9f87c813f20af1cb",
          "byteIdentical": true,
          "totalRecords": 42,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium-1791815243182\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-1791815243182-synthetic-after-edit.json",
          "originalSha256": "9263b23de3daac90d44b7617358cdd3e116b01c3e56cd01812b439dd8069f08e",
          "copySha256": "9263b23de3daac90d44b7617358cdd3e116b01c3e56cd01812b439dd8069f08e",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium-1791815243182\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-1791815243182-synthetic-full-media.json",
          "originalSha256": "e19603a682b081202e47939d990ed4d1bd29570c86c12e68b6c4bb2a4c290fda",
          "copySha256": "e19603a682b081202e47939d990ed4d1bd29570c86c12e68b6c4bb2a4c290fda",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium-1791815243182\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-1791815243182-synthetic-portable.json",
          "originalSha256": "1cbcb287b3834fb1008a1b2865bb046ce38e10979cd08761c2ef3900a11101e2",
          "copySha256": "1cbcb287b3834fb1008a1b2865bb046ce38e10979cd08761c2ef3900a11101e2",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium-1791818265849\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-1791818265849-synthetic-after-edit.json",
          "originalSha256": "f145200fdcc308e493e00eeec0edb41dd0bc534c76f7722fb7ea2c4704e7525f",
          "copySha256": "f145200fdcc308e493e00eeec0edb41dd0bc534c76f7722fb7ea2c4704e7525f",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium-1791818265849\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-1791818265849-synthetic-full-media.json",
          "originalSha256": "d5c83c44292d6eae04e9b6785e8069e4c2ebdb96cdd386333d2a547fef39af0c",
          "copySha256": "d5c83c44292d6eae04e9b6785e8069e4c2ebdb96cdd386333d2a547fef39af0c",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium-1791818265849\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-1791818265849-synthetic-portable.json",
          "originalSha256": "2a6afdad1bdfceeb1ba1bd1d3919094f2b89f4cc4140bfc70b3a9fb67515b3c9",
          "copySha256": "2a6afdad1bdfceeb1ba1bd1d3919094f2b89f4cc4140bfc70b3a9fb67515b3c9",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium-1791818912777\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-1791818912777-synthetic-after-edit.json",
          "originalSha256": "ad761884fb5baa2c5cb4a2144dbac06587d0cb3454271c529d4ecc0ccdfac05f",
          "copySha256": "ad761884fb5baa2c5cb4a2144dbac06587d0cb3454271c529d4ecc0ccdfac05f",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium-1791818912777\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-1791818912777-synthetic-full-media.json",
          "originalSha256": "7d54c8bf443e6e45b69838e7bdca6f45d8092ddfceaef6fcbaa3b60a5c41a5c3",
          "copySha256": "7d54c8bf443e6e45b69838e7bdca6f45d8092ddfceaef6fcbaa3b60a5c41a5c3",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-chromium-1791818912777\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-chromium-1791818912777-synthetic-portable.json",
          "originalSha256": "bd03231c57c8ef704b08f8f213649e8f6a3af99ef29f7ed78da344058d22987c",
          "copySha256": "bd03231c57c8ef704b08f8f213649e8f6a3af99ef29f7ed78da344058d22987c",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-synthetic-after-edit.json",
          "originalSha256": "72065d2f1ed7e7b5334b7c12eb2f421f4a99392d8bb51ef680ae84b07f99f5aa",
          "copySha256": "72065d2f1ed7e7b5334b7c12eb2f421f4a99392d8bb51ef680ae84b07f99f5aa",
          "byteIdentical": true,
          "totalRecords": 47,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-synthetic-portable.json",
          "originalSha256": "1bae294f577ac78f7fd31b56e711e8330a2cd764b4fe1cb65edf934e9c4517ea",
          "copySha256": "1bae294f577ac78f7fd31b56e711e8330a2cd764b4fe1cb65edf934e9c4517ea",
          "byteIdentical": true,
          "totalRecords": 41,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit-1791815253922\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-1791815253922-synthetic-after-edit.json",
          "originalSha256": "b8d3392c218192171b8ea73cf6adf92ce488423a6bc2fc6cbc3593d875372d94",
          "copySha256": "b8d3392c218192171b8ea73cf6adf92ce488423a6bc2fc6cbc3593d875372d94",
          "byteIdentical": true,
          "totalRecords": 48,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit-1791815253922\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-1791815253922-synthetic-full-media.json",
          "originalSha256": "d72aae3df82d3044b523c7cfb4c02fc8965361a21e23ddf5db09790cc6d1fae5",
          "copySha256": "d72aae3df82d3044b523c7cfb4c02fc8965361a21e23ddf5db09790cc6d1fae5",
          "byteIdentical": true,
          "totalRecords": 42,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit-1791815253922\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-1791815253922-synthetic-portable.json",
          "originalSha256": "51048e9ad975e638268187f6d18b75ce71345efeb12c1925241ed9d46e4f7829",
          "copySha256": "51048e9ad975e638268187f6d18b75ce71345efeb12c1925241ed9d46e4f7829",
          "byteIdentical": true,
          "totalRecords": 42,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit-1791818283918\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-1791818283918-synthetic-after-edit.json",
          "originalSha256": "d215f0ea9a54a20979749fa2af06321dabdfd6b8a1fc06291fed2ffb86e2aa71",
          "copySha256": "d215f0ea9a54a20979749fa2af06321dabdfd6b8a1fc06291fed2ffb86e2aa71",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit-1791818283918\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-1791818283918-synthetic-full-media.json",
          "originalSha256": "020744a2f512b1a6e24c4e4964b4778231b2cf9472604b9da335d07d7178e46a",
          "copySha256": "020744a2f512b1a6e24c4e4964b4778231b2cf9472604b9da335d07d7178e46a",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit-1791818283918\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-1791818283918-synthetic-portable.json",
          "originalSha256": "218fe8f92b0ecace28d627aeedfdf43a41883ebb8f74e6a495c843068d008699",
          "copySha256": "218fe8f92b0ecace28d627aeedfdf43a41883ebb8f74e6a495c843068d008699",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit-1791818926241\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-1791818926241-synthetic-after-edit.json",
          "originalSha256": "da255b58c9d4aa8ac6c77c37cc517063d8072a9344537e46dbabdb1411d81026",
          "copySha256": "da255b58c9d4aa8ac6c77c37cc517063d8072a9344537e46dbabdb1411d81026",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit-1791818926241\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-1791818926241-synthetic-full-media.json",
          "originalSha256": "c87c1562d2c3b25f8ac68beb182fab478d475501508f3453698e5757f6a72a6d",
          "copySha256": "c87c1562d2c3b25f8ac68beb182fab478d475501508f3453698e5757f6a72a6d",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\closure-webkit-1791818926241\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-closure-webkit-1791818926241-synthetic-portable.json",
          "originalSha256": "280aea469134035695feb87d0f7420f7bde11b4f4341545906f717cf73f8b093",
          "copySha256": "280aea469134035695feb87d0f7420f7bde11b4f4341545906f717cf73f8b093",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-synthetic-after-edit.json",
          "originalSha256": "9206b575d25442d5cc6bced8cb7d231a90ea2f4de347b6a32815f138f1b6ee2b",
          "copySha256": "9206b575d25442d5cc6bced8cb7d231a90ea2f4de347b6a32815f138f1b6ee2b",
          "byteIdentical": true,
          "totalRecords": 46,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-synthetic-portable.json",
          "originalSha256": "213878861c9d7d6bde2521118400dfb7f802d28af72011716da3d9f25ec3d689",
          "copySha256": "213878861c9d7d6bde2521118400dfb7f802d28af72011716da3d9f25ec3d689",
          "byteIdentical": true,
          "totalRecords": 39,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit-1791815287748\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-1791815287748-synthetic-after-edit.json",
          "originalSha256": "356ed10a0680548ee047e7e85cdb24d32c43fb17084e6a1da01e17deb76fc017",
          "copySha256": "356ed10a0680548ee047e7e85cdb24d32c43fb17084e6a1da01e17deb76fc017",
          "byteIdentical": true,
          "totalRecords": 48,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit-1791815287748\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-1791815287748-synthetic-full-media.json",
          "originalSha256": "cf93a13651c5e877b2956a98c15a85e8dacd20d41c4703da4c979d112f5710b3",
          "copySha256": "cf93a13651c5e877b2956a98c15a85e8dacd20d41c4703da4c979d112f5710b3",
          "byteIdentical": true,
          "totalRecords": 42,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit-1791815287748\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-1791815287748-synthetic-portable.json",
          "originalSha256": "681d8279eb107b497fc05be7b02e70094b4a4fe3f4158c573b1b86caac3c36d8",
          "copySha256": "681d8279eb107b497fc05be7b02e70094b4a4fe3f4158c573b1b86caac3c36d8",
          "byteIdentical": true,
          "totalRecords": 42,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit-1791818534026\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-1791818534026-synthetic-after-edit.json",
          "originalSha256": "65dd33a1feea0f466494def635753025f814740815054e66814d033fcb9f7efa",
          "copySha256": "65dd33a1feea0f466494def635753025f814740815054e66814d033fcb9f7efa",
          "byteIdentical": true,
          "totalRecords": 51,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit-1791818534026\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-1791818534026-synthetic-full-media.json",
          "originalSha256": "abaa7b87ed57ce33a0c2c3e4bc7b877d0a6fec52850f16e1aef7406d5300d19d",
          "copySha256": "abaa7b87ed57ce33a0c2c3e4bc7b877d0a6fec52850f16e1aef7406d5300d19d",
          "byteIdentical": true,
          "totalRecords": 45,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit-1791818534026\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-1791818534026-synthetic-portable.json",
          "originalSha256": "c6b9945d87fe72a0b908ffba39af2d62f68a66340a97966ad607510b375da16b",
          "copySha256": "c6b9945d87fe72a0b908ffba39af2d62f68a66340a97966ad607510b375da16b",
          "byteIdentical": true,
          "totalRecords": 45,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit-1791818976494\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-1791818976494-synthetic-after-edit.json",
          "originalSha256": "46a7c2c36880e99822c04b8fc9c7267a72553afe9d9715f46e01fe7ff1d2d285",
          "copySha256": "46a7c2c36880e99822c04b8fc9c7267a72553afe9d9715f46e01fe7ff1d2d285",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit-1791818976494\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-1791818976494-synthetic-full-media.json",
          "originalSha256": "83c98b51b0a2aa5c2a5fc213129b716131b1e2f5746a8c1cb241d6d492412868",
          "copySha256": "83c98b51b0a2aa5c2a5fc213129b716131b1e2f5746a8c1cb241d6d492412868",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\ipad-webkit-1791818976494\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-ipad-webkit-1791818976494-synthetic-portable.json",
          "originalSha256": "f64670e87f0eeccb5ea6bbe897e68f3795b2a9f93f3ae42881a42821cce8fa2b",
          "copySha256": "f64670e87f0eeccb5ea6bbe897e68f3795b2a9f93f3ae42881a42821cce8fa2b",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-synthetic-after-edit.json",
          "originalSha256": "fdb21dfdf241535797515c044bd39f949c0e9c5f11df78de57c99a6e658b5bc1",
          "copySha256": "fdb21dfdf241535797515c044bd39f949c0e9c5f11df78de57c99a6e658b5bc1",
          "byteIdentical": true,
          "totalRecords": 46,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-synthetic-portable.json",
          "originalSha256": "6123c16bb35285af929a715d750c5c0d8667e77da58e31abd6f8ca058c5f4d34",
          "copySha256": "6123c16bb35285af929a715d750c5c0d8667e77da58e31abd6f8ca058c5f4d34",
          "byteIdentical": true,
          "totalRecords": 39,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit-1791815275298\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-1791815275298-synthetic-after-edit.json",
          "originalSha256": "ffd3344a60233c9ad48c8318b95ea237a996561b320b2cd0eae7426267fd094b",
          "copySha256": "ffd3344a60233c9ad48c8318b95ea237a996561b320b2cd0eae7426267fd094b",
          "byteIdentical": true,
          "totalRecords": 48,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit-1791815275298\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-1791815275298-synthetic-full-media.json",
          "originalSha256": "b4bfe4565bcbcc47ee25a875375d1ceb1129c31bc5e5faf6ee2cadd63bccd72f",
          "copySha256": "b4bfe4565bcbcc47ee25a875375d1ceb1129c31bc5e5faf6ee2cadd63bccd72f",
          "byteIdentical": true,
          "totalRecords": 42,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit-1791815275298\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-1791815275298-synthetic-portable.json",
          "originalSha256": "78c83310b76edd85d4119d3caab91a4186736a25705fc84447a9a542bb9b9051",
          "copySha256": "78c83310b76edd85d4119d3caab91a4186736a25705fc84447a9a542bb9b9051",
          "byteIdentical": true,
          "totalRecords": 42,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit-1791818489161\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-1791818489161-synthetic-after-edit.json",
          "originalSha256": "bff1b7f2d980402e993f3092f733559e19ab0a74a31123d11cf5c2506e4d3ac2",
          "copySha256": "bff1b7f2d980402e993f3092f733559e19ab0a74a31123d11cf5c2506e4d3ac2",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit-1791818489161\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-1791818489161-synthetic-full-media.json",
          "originalSha256": "91da7e427cba1b1e305cbba0b5a653eae53a715b14c4e68d0bad50b8b159f526",
          "copySha256": "91da7e427cba1b1e305cbba0b5a653eae53a715b14c4e68d0bad50b8b159f526",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit-1791818489161\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-1791818489161-synthetic-portable.json",
          "originalSha256": "d17f77de00b56f93b64c8465f8378579acb05e03c203baaa8a7f0dcc9964c0d5",
          "copySha256": "d17f77de00b56f93b64c8465f8378579acb05e03c203baaa8a7f0dcc9964c0d5",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit-1791818971132\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-1791818971132-synthetic-after-edit.json",
          "originalSha256": "167adb396028d777d347130be72543b1d461e8f3ce5f8648594e4a5a18302f54",
          "copySha256": "167adb396028d777d347130be72543b1d461e8f3ce5f8648594e4a5a18302f54",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit-1791818971132\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-1791818971132-synthetic-full-media.json",
          "originalSha256": "647f24d12b9ef8d04e867b4ec57cd11ca3fe263333ff63459b2dc265eda1e59b",
          "copySha256": "647f24d12b9ef8d04e867b4ec57cd11ca3fe263333ff63459b2dc265eda1e59b",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\custody\\iphone-webkit-1791818971132\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\0-iphone-webkit-1791818971132-synthetic-portable.json",
          "originalSha256": "fa7543247de1d76ae5d82af45aaf4e4ee0d2ffe7996cbd17879873e1a5989849",
          "copySha256": "fa7543247de1d76ae5d82af45aaf4e4ee0d2ffe7996cbd17879873e1a5989849",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\android-chromium-1791818422852\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-android-chromium-1791818422852-synthetic-after-edit.json",
          "originalSha256": "f27d7a5456ed8b9042a22ca7b01ac1158202f9b9adf71f19c7ead6c76add4f8c",
          "copySha256": "f27d7a5456ed8b9042a22ca7b01ac1158202f9b9adf71f19c7ead6c76add4f8c",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\android-chromium-1791818422852\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-android-chromium-1791818422852-synthetic-full-media.json",
          "originalSha256": "95979ea2ac682132f4bf2d3bbbec84138ba0af2dd2d9f9402ec7132e5c25f35e",
          "copySha256": "95979ea2ac682132f4bf2d3bbbec84138ba0af2dd2d9f9402ec7132e5c25f35e",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\android-chromium-1791818422852\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-android-chromium-1791818422852-synthetic-portable.json",
          "originalSha256": "ddad59c4c70037721df3081287eed2eaab2f4bdc080bf2cd728c1e5ab806fc06",
          "copySha256": "ddad59c4c70037721df3081287eed2eaab2f4bdc080bf2cd728c1e5ab806fc06",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791818676223\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-android-tablet-chromium-1791818676223-synthetic-after-edit.json",
          "originalSha256": "c5d22c65b969af2ce41556a4c26eadf36d14cbc18607befad734b3840498155a",
          "copySha256": "c5d22c65b969af2ce41556a4c26eadf36d14cbc18607befad734b3840498155a",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791818676223\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-android-tablet-chromium-1791818676223-synthetic-full-media.json",
          "originalSha256": "199f025111778b268a829f61936cf1a677b7fbac38c98ca6aa84a7e40a659005",
          "copySha256": "199f025111778b268a829f61936cf1a677b7fbac38c98ca6aa84a7e40a659005",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791818676223\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-android-tablet-chromium-1791818676223-synthetic-portable.json",
          "originalSha256": "a5d84923d8ddd0b88a248dbc01aa112c9dbe7227bccd8dbebe9ce9302023c714",
          "copySha256": "a5d84923d8ddd0b88a248dbc01aa112c9dbe7227bccd8dbebe9ce9302023c714",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\closure-chromium-1791818351492\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-closure-chromium-1791818351492-synthetic-after-edit.json",
          "originalSha256": "2ed967e5dea7eea1dfa22c67f0887eac3c321447dc8f56b654d8d8202bef8ce7",
          "copySha256": "2ed967e5dea7eea1dfa22c67f0887eac3c321447dc8f56b654d8d8202bef8ce7",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\closure-chromium-1791818351492\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-closure-chromium-1791818351492-synthetic-full-media.json",
          "originalSha256": "e303547f6e8955849e003ab4f24c4aca4145529b50f7c18d40682ebf10a8fd2c",
          "copySha256": "e303547f6e8955849e003ab4f24c4aca4145529b50f7c18d40682ebf10a8fd2c",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\closure-chromium-1791818351492\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-closure-chromium-1791818351492-synthetic-portable.json",
          "originalSha256": "9252b99987909fb95eae9cf12803b80b395a651e3b2ba80d3cbf55aa23c6e189",
          "copySha256": "9252b99987909fb95eae9cf12803b80b395a651e3b2ba80d3cbf55aa23c6e189",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\closure-webkit-1791818374729\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-closure-webkit-1791818374729-synthetic-after-edit.json",
          "originalSha256": "98c88675a94eedb06d116f32c5e480469cba1ebe49d0510c89ecc37a3a05f291",
          "copySha256": "98c88675a94eedb06d116f32c5e480469cba1ebe49d0510c89ecc37a3a05f291",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\closure-webkit-1791818374729\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-closure-webkit-1791818374729-synthetic-full-media.json",
          "originalSha256": "8a00ed4e5bde86cb84193a783aba0b407701d8a457346182a7711ae04be4497c",
          "copySha256": "8a00ed4e5bde86cb84193a783aba0b407701d8a457346182a7711ae04be4497c",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\closure-webkit-1791818374729\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-closure-webkit-1791818374729-synthetic-portable.json",
          "originalSha256": "e812a70dd3d8c2d224b8dd709179dfd37b7c6ef766524c008b3ffab3a001245f",
          "copySha256": "e812a70dd3d8c2d224b8dd709179dfd37b7c6ef766524c008b3ffab3a001245f",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\ipad-webkit-1791818533317\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-ipad-webkit-1791818533317-synthetic-after-edit.json",
          "originalSha256": "29bfc3c05854bd98710adc27e98e79cde6409f75d09e7e0901230dc45281b43e",
          "copySha256": "29bfc3c05854bd98710adc27e98e79cde6409f75d09e7e0901230dc45281b43e",
          "byteIdentical": true,
          "totalRecords": 51,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\ipad-webkit-1791818533317\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-ipad-webkit-1791818533317-synthetic-full-media.json",
          "originalSha256": "a2f612a7b98465588a1f3dcd0c29fe91cc756d4718ae59ba19a4295e0fa99290",
          "copySha256": "a2f612a7b98465588a1f3dcd0c29fe91cc756d4718ae59ba19a4295e0fa99290",
          "byteIdentical": true,
          "totalRecords": 45,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\ipad-webkit-1791818533317\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-ipad-webkit-1791818533317-synthetic-portable.json",
          "originalSha256": "af1b4bd9ffe1fc76132e48636baba5a2ce364be27f1adec5a7337c54b587be78",
          "copySha256": "af1b4bd9ffe1fc76132e48636baba5a2ce364be27f1adec5a7337c54b587be78",
          "byteIdentical": true,
          "totalRecords": 45,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\iphone-webkit-1791818528528\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-iphone-webkit-1791818528528-synthetic-after-edit.json",
          "originalSha256": "a3faaccb0cecfffd7d4636bda5c448350df5ba9d71a148444d7d3b80e3cf5d60",
          "copySha256": "a3faaccb0cecfffd7d4636bda5c448350df5ba9d71a148444d7d3b80e3cf5d60",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\iphone-webkit-1791818528528\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-iphone-webkit-1791818528528-synthetic-full-media.json",
          "originalSha256": "5b4cfbffac76cf230aa5cc15b94380c8187bb4472491032f0a01fd6b6aa6abaa",
          "copySha256": "5b4cfbffac76cf230aa5cc15b94380c8187bb4472491032f0a01fd6b6aa6abaa",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\clone\\artifacts\\final-closure\\custody\\iphone-webkit-1791818528528\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\1-iphone-webkit-1791818528528-synthetic-portable.json",
          "originalSha256": "26db564ae7bd60ed1f555e6d5cb96753a61b8c46fc533606495b8d090f953c72",
          "copySha256": "26db564ae7bd60ed1f555e6d5cb96753a61b8c46fc533606495b8d090f953c72",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\android-chromium-1791817690090\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-android-chromium-1791817690090-synthetic-after-edit.json",
          "originalSha256": "2d3c1a20560ad381cf94b9e4da77976d4df87574f6ac588e1e32673ff6ad2702",
          "copySha256": "2d3c1a20560ad381cf94b9e4da77976d4df87574f6ac588e1e32673ff6ad2702",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\android-chromium-1791817690090\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-android-chromium-1791817690090-synthetic-full-media.json",
          "originalSha256": "a2b9d0b3c28847510820436e01c2f96a34d2374cd721140c080ab4bd6d17f44f",
          "copySha256": "a2b9d0b3c28847510820436e01c2f96a34d2374cd721140c080ab4bd6d17f44f",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\android-chromium-1791817690090\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-android-chromium-1791817690090-synthetic-portable.json",
          "originalSha256": "94f0f3dc020c421e8f6bfae792f1dee91f3939b52c2c5c850d638cdd4e2d7e07",
          "copySha256": "94f0f3dc020c421e8f6bfae792f1dee91f3939b52c2c5c850d638cdd4e2d7e07",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791817997968\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-android-tablet-chromium-1791817997968-synthetic-after-edit.json",
          "originalSha256": "9e2e0bb53f4e08022273081c7e8f0512e86f63043d67db3be1d2ad0dc65ae49b",
          "copySha256": "9e2e0bb53f4e08022273081c7e8f0512e86f63043d67db3be1d2ad0dc65ae49b",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791817997968\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-android-tablet-chromium-1791817997968-synthetic-full-media.json",
          "originalSha256": "55ef1bb907b30768430a594d92a5ac7f4f9fde437424dcf658318220d345a8b1",
          "copySha256": "55ef1bb907b30768430a594d92a5ac7f4f9fde437424dcf658318220d345a8b1",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\android-tablet-chromium-1791817997968\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-android-tablet-chromium-1791817997968-synthetic-portable.json",
          "originalSha256": "55c02ba3178e6c9dc324933d60ad9a555a8d3bb99332f790a5f6795a731b818e",
          "copySha256": "55c02ba3178e6c9dc324933d60ad9a555a8d3bb99332f790a5f6795a731b818e",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\closure-chromium-1791817602225\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-closure-chromium-1791817602225-synthetic-after-edit.json",
          "originalSha256": "1048118f7510301fd7b143f7a8b2ed808af48bb8d05b1e2c7709d652664901a2",
          "copySha256": "1048118f7510301fd7b143f7a8b2ed808af48bb8d05b1e2c7709d652664901a2",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\closure-chromium-1791817602225\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-closure-chromium-1791817602225-synthetic-full-media.json",
          "originalSha256": "600cdc5097cf583b14132a65f306a19cae5fb0dd949fe2ee4eba3051560ac254",
          "copySha256": "600cdc5097cf583b14132a65f306a19cae5fb0dd949fe2ee4eba3051560ac254",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\closure-chromium-1791817602225\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-closure-chromium-1791817602225-synthetic-portable.json",
          "originalSha256": "10823f406f32aadbc6086c2adfe009c7bebf07f5d479c4135c158c510f6cb8ce",
          "copySha256": "10823f406f32aadbc6086c2adfe009c7bebf07f5d479c4135c158c510f6cb8ce",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\closure-webkit-1791817629641\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-closure-webkit-1791817629641-synthetic-after-edit.json",
          "originalSha256": "420f3ce71d12274610c71ba1b7aa676690bd36bdca961a9ca58669fc6f9b91f0",
          "copySha256": "420f3ce71d12274610c71ba1b7aa676690bd36bdca961a9ca58669fc6f9b91f0",
          "byteIdentical": true,
          "totalRecords": 49,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\closure-webkit-1791817629641\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-closure-webkit-1791817629641-synthetic-full-media.json",
          "originalSha256": "b358ba2559bf0ae8643f88cbb96725b63373a25051d7eca2e1c29b5e4535407f",
          "copySha256": "b358ba2559bf0ae8643f88cbb96725b63373a25051d7eca2e1c29b5e4535407f",
          "byteIdentical": true,
          "totalRecords": 43,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\closure-webkit-1791817629641\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-closure-webkit-1791817629641-synthetic-portable.json",
          "originalSha256": "2c406555948f457c9d8d9a854e4fb29537b920af84f084663c35ee9b140607f6",
          "copySha256": "2c406555948f457c9d8d9a854e4fb29537b920af84f084663c35ee9b140607f6",
          "byteIdentical": true,
          "totalRecords": 43,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\ipad-webkit-1791817822473\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-ipad-webkit-1791817822473-synthetic-after-edit.json",
          "originalSha256": "a700c09aa31086a1a3d716709b64df6185d9d36c799d6b17c3a23970d3d41550",
          "copySha256": "a700c09aa31086a1a3d716709b64df6185d9d36c799d6b17c3a23970d3d41550",
          "byteIdentical": true,
          "totalRecords": 51,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\ipad-webkit-1791817822473\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-ipad-webkit-1791817822473-synthetic-full-media.json",
          "originalSha256": "fb45253a64b693fb623fcb68b6a9c1c10d851f7c32365fa66be54bde88504449",
          "copySha256": "fb45253a64b693fb623fcb68b6a9c1c10d851f7c32365fa66be54bde88504449",
          "byteIdentical": true,
          "totalRecords": 45,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\ipad-webkit-1791817822473\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-ipad-webkit-1791817822473-synthetic-portable.json",
          "originalSha256": "f9a60751d28106d330091dfb0076482f6afe408eeab83865cf18ff84318ba815",
          "copySha256": "f9a60751d28106d330091dfb0076482f6afe408eeab83865cf18ff84318ba815",
          "byteIdentical": true,
          "totalRecords": 45,
          "binaryAssets": 0,
          "stores": 87
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\iphone-webkit-1791817805981\\synthetic-after-edit.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-iphone-webkit-1791817805981-synthetic-after-edit.json",
          "originalSha256": "ee344b7a66bb37bd282d8d532f3e15272ec4ba1df9bde4db4e0f29ed32591f51",
          "copySha256": "ee344b7a66bb37bd282d8d532f3e15272ec4ba1df9bde4db4e0f29ed32591f51",
          "byteIdentical": true,
          "totalRecords": 50,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\iphone-webkit-1791817805981\\synthetic-full-media.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-iphone-webkit-1791817805981-synthetic-full-media.json",
          "originalSha256": "228ff765be27e4ed03db09c8b9bc30b805c8f0a108cd743385f9adef629c59a6",
          "copySha256": "228ff765be27e4ed03db09c8b9bc30b805c8f0a108cd743385f9adef629c59a6",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 1,
          "stores": 88
        },
        {
          "original": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\release-clone\\artifacts\\final-closure\\custody\\iphone-webkit-1791817805981\\synthetic-portable.json",
          "copied": "C:\\Users\\YellankiKaushik\\Desktop\\KAUSHIK\\ALL Projects\\GYM application\\artifacts\\final-closure\\independent-copies\\1791819271030\\2-iphone-webkit-1791817805981-synthetic-portable.json",
          "originalSha256": "ef28b29ac615abff2b026b6c2bba7e41284652bad13aa7487f079fcb4ab2bf4c",
          "copySha256": "ef28b29ac615abff2b026b6c2bba7e41284652bad13aa7487f079fcb4ab2bf4c",
          "byteIdentical": true,
          "totalRecords": 44,
          "binaryAssets": 0,
          "stores": 87
        }
      ],
      "limitations": "Synthetic private test-directory copies only; no owner actual records or custody location chosen. Exact canonical restore comparisons are separately recorded by the persistent lifecycle tests."
    },
    "exactCanonicalRestoration": true,
    "compared": "Every canonical store, immutable relationships/snapshots and media; operational audit/receipts/restore journals explicitly excluded",
    "locationChoice": "OWNER_HUMAN_REQUIRED"
  },
  "security": {
    "boundedSecretScan": {
      "schemaVersion": 1,
      "generatedAt": "2026-10-12T14:47:03.272Z",
      "testedCommit": "dadcfdf5f0c97e88b5400bdc78cb236d1df3804c",
      "trackedFiles": 1297,
      "reachableCommits": 65,
      "uniqueHistoryBlobs": 2624,
      "historicalBytes": 228303072,
      "publicBundleFiles": 290,
      "rules": [
        "private-key",
        "github-token",
        "aws-access-key",
        "provider-secret",
        "google-api-key",
        "credential-url",
        "literal-bearer"
      ],
      "findings": [],
      "limitations": "Read-only scan of fetched reachable Git objects and current files; patterns do not establish absence of all credentials. Binary strings scanned; screenshot OCR and inaccessible/unreachable remote history are not covered. No credential values printed."
    },
    "note": "The scan is bound to its recorded frozen candidate and fetched reachable history. Subsequent runtime difference is print token literals; test/document differences contain synthetic fixtures and public identifiers. No secrets or owner actual data are added. This is not universal credential absence or penetration certification."
  },
  "defectHistory": {
    "fixedP2": 4,
    "changes": [
      "Shared search focus indicator",
      "WebKit search dialog focus cycle",
      "Current print shell selectors and layout",
      "Dark print semantic notice contrast"
    ],
    "harnessCorrections": [
      "Search suggestion readiness",
      "Canonical enteredValue/valueKg consistency",
      "Prepare all owning schemas before export",
      "Confirmed fresh-profile replacement preserves original migration state",
      "Measured text scaling baseline",
      "Wait for reloaded favourite and public assets",
      "Wait for backup inventory and confirm cancellation handler",
      "Await app hydration before read-only cardio click",
      "Await search engine readiness and type through native keyboard events"
    ],
    "hostedDiagnostic": {
      "run": 38267749717,
      "job": 114874102384,
      "sourceCommit": "6ac581aa07d0480679cc3762aee05d4d9962fe1b",
      "webkitPassed": 286,
      "webkitFailed": 1,
      "artifact": 11756860766,
      "resolution": "Corrected test readiness; final test-head hosted WebKit must pass all 287 plus 24 closure cases."
    }
  },
  "toolingCorrection": "ESLint ignores generated artifacts, coverage and route-test-results; application, tests and scripts remain checked. Root lint passes.",
  "finalHostedReadinessCorrection": {
    "run": 38271577458,
    "job": 114887006528,
    "artifact": 11758361520,
    "existingWebkitPassed": 287,
    "closurePassed": 23,
    "closureFailed": 1,
    "diagnosis": "Search filled before client readiness; snapshot had empty input. Explicit ready status, native sequential typing and value assertion now pass six live configurations. Final tagged CI must independently pass all jobs."
  },
  "repositoryPolicy": {
    "checkedAt": "2026-10-12T20:23:59.4614551+05:30",
    "mainProtected": false,
    "rulesetCount": 0,
    "mainSha": "e03ab59533f8bbde47807c192adcbf4bfee30b9f"
  }
}
```

## Former owner categories

| ID       | Task                                         | Status                    | Evidence / boundary                                                                                                                                                                                                                                                                   |
| -------- | -------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OWNER-01 | Physical Android                             | COMPLETED_AUTOMATED_PROXY | Pixel 7 touch/orientation/shrunken keyboard viewport; all-module persistent profile and photo/backup round trip PHYSICAL-ANDROID                                                                                                                                                      |
| OWNER-02 | Physical iPhone                              | COMPLETED_AUTOMATED_PROXY | iPhone 13 WebKit touch/orientation/shrunken keyboard viewport; all-module persistent profile and photo/backup round trip PHYSICAL-IPHONE                                                                                                                                              |
| OWNER-03 | Physical iPad/tablet                         | COMPLETED_AUTOMATED_PROXY | iPad generation 7 WebKit and 800×1280 Android tablet touch, rotation and 512px split-view approximation PHYSICAL-TABLET                                                                                                                                                               |
| OWNER-04 | Real desktop workflow                        | COMPLETED_AUTOMATICALLY   | Real persistent browser close/relaunch; all seven databases; two tabs and reload; edits/history; exact independent-profile restore None: the synthetic desktop workflow is completed automatically                                                                                    |
| OWNER-05 | Native file picker and save                  | COMPLETED_AUTOMATED_PROXY | Actual filechooser event/reselection; invalid/future/gzip rejection; empty selection and save AbortError preserve stores; JSON download and nonempty CSV HUMAN-PICKERS                                                                                                                |
| OWNER-06 | Native photo picker                          | COMPLETED_AUTOMATED_PROXY | JPEG/PNG/WebP sanitize/save/reload; MIME/corrupt/size/dimension rejection; portable excludes media; full-media round trip; zero upload HUMAN-PICKERS                                                                                                                                  |
| OWNER-07 | Storage quota/eviction/persistence           | COMPLETED_AUTOMATED_PROXY | Existing owning-storage and restore regressions: unavailable IndexedDB, queued-write abort, quota rollback, rejected blocked upgrade and blocked clear; durable interrupted-journal resume/rollback after reopening; restore recovery and backup before replacement PHYSICAL-EVICTION |
| OWNER-08 | Human keyboard evaluation                    | COMPLETED_AUTOMATED_PROXY | Tab/Shift+Tab/Enter/Space/Escape/Arrow keys; visible wrapper focus; search dialog focus cycle and opener restoration HUMAN-COMFORT                                                                                                                                                    |
| OWNER-09 | Human screen reader                          | COMPLETED_AUTOMATED_PROXY | ARIA snapshots, single main/h1, WCAG axe checks and invalid-restore announced alert with unavailable restore actions HUMAN-AT                                                                                                                                                         |
| OWNER-10 | Human zoom and reflow                        | COMPLETED_AUTOMATED_PROXY | 12 routes × light/dark × 640px effective 200%, 320px effective 400%, and 640px with 32px root text HUMAN-COMFORT                                                                                                                                                                      |
| OWNER-11 | Human print review                           | COMPLETED_AUTOMATED_PROXY | Four print routes across configurations; actual shell hidden; A4 Chromium PDFs all 20 pages visually inspected; sources/units retained HUMAN-COMFORT                                                                                                                                  |
| OWNER-12 | Subjective usability and visual review       | COMPLETED_AUTOMATED_PROXY | Bounded workflow heuristic plus light/dark/reduced motion; four objective focus/print defects fixed; no redesign HUMAN-COMFORT                                                                                                                                                        |
| OWNER-13 | Real personal-data workflow                  | COMPLETED_AUTOMATED_PROXY | Synthetic realistic workout/nutrition/diet/recovery/cardio/progress/photo snapshots and exact edited backup/media restoration HUMAN-PERSONAL                                                                                                                                          |
| OWNER-14 | Backup custody and independent restore drill | COMPLETED_AUTOMATED_PROXY | Portable/full-media export, independent directory copy, checksum/validator checks, confirmed fresh-profile replacement and exact canonical records/media comparison HUMAN-CUSTODY                                                                                                     |

## Defects corrected

Four confirmed P2 defects were fixed minimally: shared search wrapper focus was invisible; WebKit native dialog Tab could leave the dialog; obsolete print shell selectors left navigation/skip-link clutter; dark-theme semantic notices retained pale text on paper backgrounds. Regression details and harness corrections are retained in docs/decisions/final-closure-automated-proxies.md. No aesthetic redesign or new factual content.

## Repository and safety

Restored only the redundant known appended .vercel/.env* suffix to the committed policy. Existing .vercel/, .env, .env.* and !.env.example remain. No unrelated owner changes existed.

No tracked file was deleted, renamed or moved. Historical reports/evidence retained. No force push or history rewrite. No factual content expansion.

No unresolved P0/P1/P2/P3 engineering defects were found in this bounded pass. Owner physical/human boundaries and optional external policy are not declared tested. Global cross-database atomicity, encryption, ZIP and safe cross-module import-as-copy remain explicitly unsupported. The 900 unpublished identities remain frozen.

## Minimal handoff

See final-owner-required-minimal-checklist.md/json for exact steps, pass conditions, reasons and failure severities. Historical reports retain their original commit-bound evidence. Independent synthetic backup files are in ignored test evidence; they are not an owner custody decision. Local/hosted/lifecycle/emulation checks cannot certify OS eviction, auditory experience or real device behavior.
