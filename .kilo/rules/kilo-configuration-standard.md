# KILO CONFIGURATION STANDARD (v2026.03)

## PURPOSE

Establish a consistent, forward-compatible structure for Kilo configuration across all projects.

---

## CANONICAL STRUCTURE (NEW REPOS)

Use `.kilo/` as the only write target for all configuration.

```text
{workspace}/
├── AGENTS.md
└── .kilo/
    ├── rules/
    ├── skills/
    │   └── {skill-name}/
    │       └── SKILL.md
    └── workflows/
```

Global (optional):

```text
~/.kilo/
├── rules/
├── skills/
└── workflows/
```

---

## BACKWARD COMPATIBILITY

Kilo still reads `.kilocode/`, but:

- `.kilo/` takes precedence
- New files MUST NOT be created in `.kilocode/`
- `.kilocode/` is read-only for migration purposes

Legacy layout (DO NOT USE FOR NEW FILES):

```text
.kilocode/
├── rules/
├── skills/
└── workflows/
```

---

## FILES THAT MUST NOT BE RENAMED

These remain unchanged:

```text
.kilocodeignore
.kilocodemodes
.kilocoderules
kilocode.kilo-code
```

---

## AGENTS.md (REQUIRED)

Path:

```text
{workspace}/AGENTS.md
```

Rules:

- Single source of truth for project behavior
- Keep concise and enforceable
- Avoid duplication with `rules/`

Minimum structure:

- Project Overview
- Stack
- Non-Negotiables
- Coding Standards
- Workflow
- Repo Conventions

---

## RULES

Path:

```text
.kilo/rules/
```

Format:

- Markdown or plain text (Markdown preferred)

Guidelines:

- One concern per file
- No large monolithic rule files
- Focus on constraints, not explanations

Example:

```text
.kilo/rules/coding-style.md
.kilo/rules/testing.md
.kilo/rules/architecture.md
```

---

## SKILLS

Path:

```text
.kilo/skills/{skill-name}/SKILL.md
```

Required format:

```text
name: skill-name
description: when this skill should be used
When to use
Instructions
Output format
```

Rules:

- Folder name = skill name
- Keep narrowly scoped and reusable
- Must define clear invocation conditions

---

## WORKFLOWS

Path:

```text
.kilo/workflows/
```

Format:

- Markdown files
- Executed as structured procedures

Example:

```text
.kilo/workflows/review-pr.md
.kilo/workflows/release-checklist.md
```

Rules:

- Step-by-step instructions only
- No vague language
- Must produce consistent outputs

---

## COMMANDS (CURRENT STATE)

- Custom commands exist but filesystem path is not yet fully standardized in public docs
- DO NOT rely on command file paths for core workflows

Policy:

- Use `AGENTS.md` + rules + skills + workflows as the primary system
- Revisit commands once the path standard stabilizes

---

## TEAM OPERATING RULES

1. `.kilo/` is the only source of truth
2. `.kilocode/` is migration-only
3. No duplicate structures across both directories
4. Prefer small, composable files over large configs
5. Every rule, skill, and workflow must be actionable and testable

---

## BOOTSTRAP CHECKLIST

For every new repo:

- [ ] Create `AGENTS.md`
- [ ] Create `.kilo/rules/` with at least:
  - `coding-style.md`
  - `architecture.md`
- [ ] Create `.kilo/skills/` with at least one core skill
- [ ] Create `.kilo/workflows/` with:
  - `review-pr.md`
- [ ] Confirm NO `.kilocode/` writes

---

## VERSION

v2026.03 — aligned to Kilo `.kilo` migration state
