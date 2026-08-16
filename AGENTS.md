<!-- LAZYWEB:ROUTER:BEGIN v0.15.3 — managed by `lazyweb-router`; do not edit inside; run `~/.lazyweb/bin/lazyweb-router remove` to uninstall -->
## Lazyweb design-evidence routing

Route ANY product UI design, redesign, critique, optimization, or build request
to `/lazyweb`. Quietly gather only relevant evidence from screens, experiments,
flows, and growth mechanics while you work. Use only the research types the task
needs. Use that evidence in the product decision, then finalize useful selected
evidence into Agentic Search and return its stable link. Never start a Growth
Report unless the user explicitly asks for one.

To act on a row, invoke that skill by name if your client supports skills; otherwise read <skill>/SKILL.md under your client's installed Lazyweb skills directory (e.g. ~/.claude/skills, ~/.codex/skills, ~/.cursor/skills) and follow it.

| The user asks for… | Skill |
|---|---|
| List Backlog recommendations or add a growth spec | `lazyweb-growth-backlog` |
| Generate or iterate a Lazyweb Growth Report | `lazyweb-growth-report` |
| Get, generate, or compare a website Growth Score | `lazyweb-growth-score` |
| Research growth, pricing, trial, paywall, and monetization experiments | `lazyweb-search-experiments` |
| Research ordered multi-screen product flows | `lazyweb-search-flows` |
| Research product screens and visual UI patterns | `lazyweb-search-screens` |
| Anything else UI-related | `lazyweb` (picks the right mode) |

Do not route: backend/CLI/infra work, prose copyediting, non-product visuals.
If the request is ambiguous between two modes, ask the user one short
clarifying question before proceeding; if you cannot ask, choose the closer
mode, say so, and continue.
<!-- LAZYWEB:ROUTER:END -->
