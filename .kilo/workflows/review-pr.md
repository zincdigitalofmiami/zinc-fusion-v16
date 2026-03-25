# Review PR

## Purpose

Produce a consistent pull request review focused on correctness, regression risk, security, and missing verification.

## Steps

1. Read `AGENTS.md` and any relevant files in `.kilo/rules/` before reviewing.
2. Inspect the diff and limit the review to the changed surface plus direct dependencies.
3. Identify findings in severity order: blockers first, then material risks, then verification gaps.
4. Verify whether tests, lint, build checks, or runtime evidence cover the changed behavior.
5. Call out missing evidence explicitly when a claim is not proven by the diff or validation results.
6. Keep the output concise and actionable.

## Output Format

1. Findings
   List each issue with the file path, the risk, and the concrete failure mode.
2. Open Questions
   List any unresolved assumptions that affect correctness or rollout safety.
3. Residual Risk
   State what remains unverified if no findings block approval.
