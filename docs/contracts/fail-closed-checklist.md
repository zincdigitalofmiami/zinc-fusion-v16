# Fail-Closed Checklist

- [ ] Requirements mapped to authority docs (`AGENTS.md`, `CLAUDE.md`, migration plan, mistakes doc).
- [ ] Write-set declared before changes.
- [ ] `git status --short` reviewed before and after changes.
- [ ] Typecheck passed: `npx tsc --noEmit`.
- [ ] Build passed: `npm run build`.
- [ ] Targeted route checks executed for touched APIs.
- [ ] If schema touched: migration SQL reviewed and DB validation run.
- [ ] Unknowns explicitly marked and either resolved or blocked.
- [ ] Rollback path documented (git revert + compensating migration).
