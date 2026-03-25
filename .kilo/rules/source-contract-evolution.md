# Source Contract Evolution

When the database must be built while data sources, fields, or vendor choices are still evolving:

- Keep business-domain tables vendor-agnostic whenever possible. Do not hardcode source names into canonical table names unless the source itself is the business entity.
- Separate source inventory from serving truth. Use source metadata, registry patterns, and provenance fields to absorb source churn without rewriting the entire schema.
- Mark what is locked versus provisional in the plan or decision docs before creating migrations.
- Do not freeze weak assumptions into canonical schemas just to move faster.
- Every proposed table still needs a clear writer, reader, grain, and freshness expectation even if some source details are provisional.
- Prefer additive migration slices that can absorb source clarification later without requiring destructive rewrites.
- If a source contract is too uncertain, stop at the checkpoint, document the ambiguity, and avoid fake precision in the schema.

**Robustness rules:**

- Keep source-specific raw or audit metadata out of dashboard-serving tables unless it is truly part of the serving contract.
- Use `ops` for operational/source tracking, not as a dumping ground for unresolved product schema decisions.
- Do not let provisional source fields leak into browser contracts until their meaning is stable.
