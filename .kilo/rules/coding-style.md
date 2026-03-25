# Coding Style

When editing ZINC Fusion V16:

- Read `AGENTS.md` first. If a task touches planning, also read the migration plan before changing code.
- Keep changes minimal and scoped. Do not widen into unrelated refactors or cleanup.
- Match the existing file's conventions unless the task explicitly changes them.
- Use explicit naming. Keep the canonical terms: 11 specialists, `target_price_{h}d`, and Target Zones.
- Never add mock, placeholder, demo, synthetic, fake, or random data.
- Do not copy code from legacy baseline. Use it only as a visual or behavior reference.
- Keep comments sparse and only where the code would otherwise be hard to parse.
- Validate the changed surface with the smallest relevant check before claiming done.

**Project-specific non-negotiables:**

- No Vercel cron, no Inngest, no local Supabase, no Docker-based Supabase.
- No `service_role` exposure to the browser.
- No hardcoded port 3000.
- Frontend work should preserve the established visual language unless the user explicitly asks for a redesign.
