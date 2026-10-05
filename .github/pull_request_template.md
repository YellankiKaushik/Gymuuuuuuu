## Change

<!-- State the user-visible behavior and affected phase/module. -->

## Evidence

- [ ] `npm ci`
- [ ] `npm run check`
- [ ] Relevant unit, migration and storage tests
- [ ] Production-build browser E2E and accessibility checks
- [ ] Privacy, dependency and performance review
- [ ] Vercel Preview checks completed when deployment is configured

## Local data and rollback

- [ ] No local schema change
- [ ] Additive/copy-on-write migration and previous-version compatibility reviewed
- [ ] External owner backup required and completed before destructive data changes
- [ ] Code rollback implications documented separately from browser-data recovery

## Privacy

- [ ] No secrets, personal records, analytics or session replay added
- [ ] New third-party requests are reviewed, documented and user-triggered where required
