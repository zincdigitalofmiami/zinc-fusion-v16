# Handover: Consolidate Agent Instruction Files

**Status:** Archived on 2026-03-25

This handover note is retained only as historical context.

## Current Standard

- `AGENTS.md` is the required project behavior file.
- `.kilo/` is the only write target for Kilo configuration in this repo.
- Canonical Kilo rules live in `.kilo/rules/`.
- Canonical Kilo skills live in `.kilo/skills/`.
- Canonical Kilo workflows live in `.kilo/workflows/`.
- `.kilocode/` is migration-only and must not receive new files.

## Source Of Truth

Read `.kilo/rules/kilo-configuration-standard.md` for the active repo policy.

## Notes

- Older references to `.kilocode/` or shared duplicate skill trees from the original migration work are obsolete.
- Command file paths remain secondary to `AGENTS.md`, rules, skills, and workflows until Kilo publishes a stable command-path standard.
