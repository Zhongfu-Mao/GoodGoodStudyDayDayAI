# LLM Apps Benchmark Renovation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `llm-apps-notes-01` from a short early note into the first Phase A benchmark article for the site's early-content renovation program.

**Architecture:** Keep the public content in the existing `academy` collection and preserve the current slug. Replace the thin bilingual Markdown with a deeper public-facing article pair, add text-free raster visuals under `public/images/academy/llm-apps-notes-01/`, and validate through the existing Astro content and UI checks.

**Tech Stack:** Astro content collections, Markdown, public image assets, built-in image generation, OpenAI official docs for current API terminology, `npm run check`, Pages-path build, and focused Playwright asset QA.

---

### Task 1: Ground The Benchmark Scope

**Files:**
- Read: `src/content/academy/llm-apps-notes-01.md`
- Read: `src/content/academy/llm-apps-notes-01.ja.md`
- Read: `src/content.config.ts`
- Read: `tests/ui/content-assets.spec.ts`

- [ ] **Step 1: Confirm current article weakness**

  Verify the current Chinese and Japanese articles are short, lack a `coverImage`, and contain no body images.

  Run:
  ```bash
  wc -l src/content/academy/llm-apps-notes-01.md src/content/academy/llm-apps-notes-01.ja.md
  rg -n "coverImage|!\\[" src/content/academy/llm-apps-notes-01.md src/content/academy/llm-apps-notes-01.ja.md
  ```

  Expected: both files are around 100 lines; the `rg` command has no matches.

- [ ] **Step 2: Capture current API terminology sources**

  Use official OpenAI docs search results for these stable points:

  - Tool/function calling means the model can request application-provided or hosted tools and then receive tool output.
  - Structured Outputs should be used for schema-constrained final responses; function calling should be used when connecting the model to application capabilities.
  - The Responses API is the current agentic loop surface for multiple tools, stateful continuation, hosted tools, and custom functions.
  - For new agentic systems, the Agents SDK is the higher-level orchestration layer for tracing, handoffs, sessions, and state management.

### Task 2: Generate Text-Free Visual Assets

**Files:**
- Create: `public/images/academy/llm-apps-notes-01/llm-app-architecture-cover.png`
- Create: `public/images/academy/llm-apps-notes-01/llm-app-runtime-loop.png`
- Create: `public/images/academy/llm-apps-notes-01/structured-output-contract.png`
- Create: `public/images/academy/llm-apps-notes-01/tool-safety-control-plane.png`

- [ ] **Step 1: Generate the cover image**

  Use the built-in image generation tool. The image must be text-free so it can be shared by Chinese and Japanese pages without localized text mistakes.

  Prompt intent:
  ```text
  A premium editorial cover image for an article about building LLM applications, showing an abstract software control room where prompt context, model reasoning, JSON contracts, tool calls, safety approval, and telemetry converge into one application runtime. No text, no letters, no logos, no UI labels. Clean technical composition, realistic depth, modern but restrained palette, suitable for a developer education website.
  ```

- [ ] **Step 2: Generate three body visuals**

  Generate text-free raster visuals for:

  - runtime loop: user request, context assembly, model call, structured result, tool execution, response, logs
  - structured output contract: raw language becoming validated JSON-like blocks and UI state
  - tool safety control plane: read-only tools, risky write tools, approvals, idempotency keys, audit logs

- [ ] **Step 3: Copy generated images into the project**

  Copy the selected generated PNGs from `$CODEX_HOME/generated_images/...` into `public/images/academy/llm-apps-notes-01/` with the exact filenames above.

  Run:
  ```bash
  ls -lh public/images/academy/llm-apps-notes-01
  ```

  Expected: four PNG files exist and are non-empty.

### Task 3: Rewrite The Chinese Article

**Files:**
- Modify: `src/content/academy/llm-apps-notes-01.md`

- [ ] **Step 1: Replace frontmatter**

  Preserve the slug and collection. Add `coverImage`, make the description more public-facing, keep `lang: zh`, and keep `draft: false`.

  Required frontmatter fields:
  ```yaml
  title: "LLM 应用入门：从 Prompt 到 Tool Calling 的工程骨架"
  date: 2026-04-02
  category: academy
  description: "把 LLM 应用看成一个可观测、可验证、可回放的工程系统：从 Prompt 分层、结构化输出、工具调用、安全边界到上线检查清单。"
  difficulty: intermediate
  plainSummary: "LLM 应用不是把聊天框接到模型，而是把上下文、模型、结构化输出、工具、状态、安全和观测性组织成一条可维护的运行时链路。"
  coverImage: "/images/academy/llm-apps-notes-01/llm-app-architecture-cover.png"
  tags:
    - "LLM"
    - "Agent"
    - "AI Engineering"
  lang: zh
  draft: false
  ```

- [ ] **Step 2: Write the benchmark body**

  The body must include:

  - Lead section that reframes the article as an engineering entry point.
  - Four body images with localized alt text.
  - A seven-layer mental model: interface, context, model, output contract, tool boundary, state, observability.
  - Runnable but vendor-light TypeScript or Python pseudocode for the application loop.
  - Comparison of structured output vs tool calling.
  - Safety rules for tools and human approval.
  - Failure-mode table.
  - Launch checklist.
  - A "copy this template" section for future LLM app design.
  - External references section linking to official OpenAI docs and internal site articles.

### Task 4: Rewrite The Japanese Article

**Files:**
- Modify: `src/content/academy/llm-apps-notes-01.ja.md`

- [ ] **Step 1: Mirror frontmatter with Japanese copy**

  Use the same `coverImage`, tags, date, category, and difficulty. Japanese copy should read naturally for Japanese colleagues, not like a literal Chinese translation.

- [ ] **Step 2: Localize the article body**

  Keep the structure parallel to the Chinese version while adapting examples and phrasing. Body image paths should be shared, but all alt text and surrounding explanations must be Japanese.

### Task 5: Add Focused Content Guardrails

**Files:**
- Modify: `tests/ui/content-assets.spec.ts`

- [ ] **Step 1: Extend article-specific QA**

  Add or extend a test that asserts `llm-apps-notes-01` Chinese and Japanese files:

  - include a `coverImage`
  - reference no `.svg` body image
  - contain no internal-workshop wording
  - reference only existing local image assets
  - preserve Chinese/Japanese sibling parity

- [ ] **Step 2: Run the focused test**

  Run:
  ```bash
  GITHUB_REPOSITORY=Zhongfu-Mao/GoodGoodStudyDayDayAI npx playwright test tests/ui/content-assets.spec.ts --workers=1 --reporter=list
  ```

  Expected: content asset QA passes. If the local preview server hits `listen EPERM`, rerun with sandbox escalation because this is the known local port-binding limitation.

### Task 6: Verify, Commit, And Stop Before Push

**Files:**
- Verify all files touched by Tasks 2-5.

- [ ] **Step 1: Run content and build validation**

  Run:
  ```bash
  npm run check
  GITHUB_REPOSITORY=Zhongfu-Mao/GoodGoodStudyDayDayAI npm run build
  ```

  Expected: both pass. If `astro check` shows duplicate content cache warnings, run `./node_modules/.bin/astro sync --force`, then rerun `npm run check`.

- [ ] **Step 2: Review diff scope**

  Run:
  ```bash
  git status --short
  git diff --stat
  git diff -- src/content/academy/llm-apps-notes-01.md src/content/academy/llm-apps-notes-01.ja.md tests/ui/content-assets.spec.ts
  ```

  Expected: only the benchmark article pair, the new image directory, the plan file, and focused tests are changed.

- [ ] **Step 3: Commit locally**

  Run:
  ```bash
  git add docs/superpowers/plans/2026-05-14-llm-apps-benchmark-renovation.md \
    src/content/academy/llm-apps-notes-01.md \
    src/content/academy/llm-apps-notes-01.ja.md \
    public/images/academy/llm-apps-notes-01 \
    tests/ui/content-assets.spec.ts
  git diff --cached --stat
  git commit -m "Renovate LLM app intro benchmark article"
  ```

  Expected: local commit succeeds. Do not push without a new explicit push authorization.

---

## Self-Review

- Spec coverage: The plan covers article scope, current terminology, images, Chinese rewrite, Japanese rewrite, content guardrails, validation, and local commit.
- Placeholder scan: No `TBD`, `TODO`, or open-ended implementation placeholders remain.
- Scope check: This plan intentionally covers only the first Phase A benchmark article. Later Phase A articles should reuse the resulting pattern rather than being bundled into this commit.
