# ABC Content Renovation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the A → B → C renovation program for early site content, using the finished LLM application article as the benchmark pattern.

**Architecture:** Work in auditable batches. Phase A upgrades the five remaining early short articles using shared quality rules; Phase B selects and renovates high-visibility OpenAI Academy / Anthropic Academy articles; Phase C expands engineering-practice articles with the same image-rich, public-facing standard. Each batch gets validation, a local commit, and a clear handoff state.

**Tech Stack:** Astro content collections, Markdown bilingual siblings, public raster image assets, built-in image generation, official vendor docs for current product/API facts, `npm run check`, Pages-path build, and Playwright UI/content QA.

---

### Task 1: Finish Phase A Early Short Articles

**Files:**
- Modify: `src/content/foundations/math-for-ai-01.md`
- Modify: `src/content/foundations/math-for-ai-01.ja.md`
- Modify: `src/content/academy/agentic-workflows-02.md`
- Modify: `src/content/academy/agentic-workflows-02.ja.md`
- Modify: `src/content/engineering/app-dev-01.md`
- Modify: `src/content/engineering/app-dev-01.ja.md`
- Modify: `src/content/engineering/cloud-infra-02.md`
- Modify: `src/content/engineering/cloud-infra-02.ja.md`
- Modify: `src/content/foundations/data-science-02.md`
- Modify: `src/content/foundations/data-science-02.ja.md`
- Create: `public/images/foundations/math-for-ai-01/*.png`
- Create: `public/images/academy/agentic-workflows-02/*.png`
- Create: `public/images/engineering/app-dev-01/*.png`
- Create: `public/images/engineering/cloud-infra-02/*.png`
- Create: `public/images/foundations/data-science-02/*.png`

Quality rules for each article:
- Add `coverImage` if missing, or replace early SVG cover references with new PNG covers.
- Include at least three local raster images per article: one cover and at least two body visuals.
- Keep images text-free so Chinese and Japanese pages can share the same asset safely.
- Expand each article into a public reference piece with cases, anti-patterns, failure modes, checklists, and a reusable template.
- Preserve slug, date, category, language, and draft status.

### Task 2: Add Phase A Guardrails

**Files:**
- Modify: `tests/ui/content-assets.spec.ts`

Guardrail requirements:
- Phase A benchmark articles must have Chinese and Japanese siblings.
- Each sibling must include `coverImage`.
- Body images must not reference `.svg`.
- All local image references must exist under `public/`.
- Articles must not contain internal workshop or speaker-note wording.

### Task 3: Validate And Commit Phase A

Run:
```bash
npm run check
GITHUB_REPOSITORY=Zhongfu-Mao/GoodGoodStudyDayDayAI npm run build
GITHUB_REPOSITORY=Zhongfu-Mao/GoodGoodStudyDayDayAI npx playwright test tests/ui/content-assets.spec.ts --workers=1 --reporter=list
npm run test:ui
```

Expected:
- `astro check` has 0 errors, 0 warnings, 0 hints.
- Pages-path build succeeds.
- Content asset QA passes.
- Full UI suite passes or only skips existing mobile-only skipped cases.

Commit:
```bash
git add docs/superpowers/plans/2026-05-14-abc-content-renovation.md \
  src/content/foundations/math-for-ai-01.md \
  src/content/foundations/math-for-ai-01.ja.md \
  src/content/academy/agentic-workflows-02.md \
  src/content/academy/agentic-workflows-02.ja.md \
  src/content/engineering/app-dev-01.md \
  src/content/engineering/app-dev-01.ja.md \
  src/content/engineering/cloud-infra-02.md \
  src/content/engineering/cloud-infra-02.ja.md \
  src/content/foundations/data-science-02.md \
  src/content/foundations/data-science-02.ja.md \
  public/images/foundations/math-for-ai-01 \
  public/images/academy/agentic-workflows-02 \
  public/images/engineering/app-dev-01 \
  public/images/engineering/cloud-infra-02 \
  public/images/foundations/data-science-02 \
  tests/ui/content-assets.spec.ts
git commit -m "Renovate early Phase A benchmark articles"
```

### Task 4: Plan Phase B High-Visibility Academy Renovation

Select a small first Phase B batch after Phase A is stable. Candidate priority:
- OpenAI Academy core entry articles that are short and high-traffic.
- Anthropic Academy articles tied to Claude, MCP, Skills, or Subagents.
- Articles with SVG-only covers or thin migration-note bodies.

Do not start Phase B until Phase A has a clean commit.

### Task 5: Plan Phase C Engineering Practice Expansion

Return to engineering-practice after Phase B. Expand FastAPI/AI-engineering related content using the same standard:
- image-rich public articles
- official-current source checks
- bilingual parity
- content guardrails
- Pages-path validation

Do not mark the overall goal complete until Phase A, Phase B, and Phase C are all verified and delivered.

---

## Self-Review

- Scope is intentionally broad because the user clarified that the goal is all A → B → C, not only the first benchmark article.
- Execution remains batch-based so each phase is reviewable and recoverable.
- Phase A implementation details are concrete; Phase B/C intentionally require a selection step after Phase A to avoid guessing high-exposure priorities too early.
