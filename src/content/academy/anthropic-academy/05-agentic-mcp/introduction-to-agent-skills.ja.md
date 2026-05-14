---
title: "Agent Skills 入門：繰り返す workflow を再利用可能な能力にする"
date: 2026-03-31
category: academy
description: "Skills の位置づけ、trigger、directory structure、progressive disclosure、適用場面、品質基準を理解し、チーム経験を Agent が読み込める作業資産にする。"
plainSummary: "Skills は長い prompt ではない。trigger、手順、例、scripts、verification を持つ再利用可能な workflow package であり、反復タスクとチーム規約を沈めるのに向く。"
difficulty: advanced
coverImage: "/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/skill-library-cover.png"
tags:
  - Agent
  - Skills
lang: ja
academy:
  series: "Anthropic Academy"
  module: "Agent と MCP"
  moduleOrder: 5
  source: "Anthropic Academy"
  sourceUrl: "https://anthropic.skilljar.com/introduction-to-agent-skills"
  prerequisites: []
draft: false
---

# Agent Skills 入門：繰り返す workflow を再利用可能な能力にする

![Agent Skills は再利用可能な workflow asset](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/skill-library-cover.png)

コーディング Agent や workflow Agent をよく使うと、同じことを何度も説明していると気づきます。

- PR description をどう書くか。
- code review で最初に見るリスク。
- 特定 framework project でどう test を走らせるか。
- 文書をどの構造で書くか。
- design から code へ落とすときの制約。
- 公開前に必ず走らせる check。

この反復説明を永遠に chat に残す必要はありません。再利用可能な資産にできます。Agent Skills の意味はここにあります。ある種類のタスクの説明、例、template、script、verification をまとめ、Agent が必要な場面で読み込めるようにします。

一言でいうと：

**Skill は Agent が発見し、読み込み、実行できる専門 workflow knowledge package です。**

## Skill は普通の Prompt ではない

Skill と通常 Prompt の違いは lifecycle です。

| 方法 | 特徴 | 向くもの |
| --- | --- | --- |
| 一時 Prompt | 現在の対話だけで有効 | 一回限りのタスク |
| Project note | 毎回読み込まれる | 全体ルール、project background |
| Slash command | 手動 trigger | 明確な command flow |
| Skill | 意味で match し、必要時に読み込む | 繰り返し出る専門タスク |

Skill の価値は prompt を長くすることではありません。「いつ使うか、どう使うか、何を使うか、どう検証するか」を package にすることです。

## Progressive disclosure：必要なときだけ詳細を読む

![Skills の progressive disclosure](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/progressive-disclosure.png)

良い Skill は、Agent に毎回全文を読ませません。まず軽量 metadata を見せ、タスクと match したときだけ詳細を読みます。

よくある構造です。

```txt
my-skill/
  SKILL.md
  examples/
  scripts/
  templates/
  assets/
```

`SKILL.md` の frontmatter は、いつ使うかを説明します。

```yaml
---
name: pr-description
description: Use when writing a pull request description from git diff and project context.
---
```

description は重要です。人間向けのタイトルではなく、Agent が読み込むか判断する trigger です。

## 良い Skill に含めたいもの

| 構成 | 役割 |
| --- | --- |
| Trigger | いつ使うか、いつ使わないか |
| Workflow | タスク手順と順序 |
| Inputs | 必要なファイル、command、context |
| Outputs | 提出形式 |
| Examples | 良い結果と悪い結果 |
| Scripts | 手作業での繰り返しを減らす再利用ツール |
| Verification | 完了後の確認方法 |
| Boundaries | 禁止事項と権限境界 |

Skill は「操作手順書 + 実行資産」に近いほど価値があります。一般論だけでは弱いです。

## Skill に向く場面

向くものです。

- PR description、release note、変更要約。
- code review checklist。
- 特定 framework の debug flow。
- 文書生成 template。
- データ整理や report 生成。
- design system component 実装規則。
- ローカル project 固有の検証 flow。

向かないものです。

- 一回限りの質問。
- まだ探索中で安定 workflow がないタスク。
- 再利用構造がなく、リアルタイム判断ばかりのタスク。
- 高リスク外部 action を含むが承認設計がないタスク。

判断基準は簡単です。Agent に同じ流れを三回説明したなら、Skill 化を検討します。

## Skill 品質：具体的なほど信頼できる

![Skill 品質 review と verification gate](/images/academy/anthropic-academy/05-agentic-mcp/introduction-to-agent-skills/skill-quality-review.png)

低品質 Skill のよくある問題です。

- description が広すぎて誤 trigger する。
- 原則だけで steps がない。
- input / output format がない。
- examples がない。
- verification がない。
- project secret や個人の好みを共有 Skill に混ぜる。
- 一つの Skill で多すぎる場面を網羅しようとする。

高品質 Skill は次のように書きます。

```md
### When to Use

Use this when the user asks for a PR description after code changes exist.
Do not use this for release notes or changelog generation.

### Steps

1. Inspect branch diff.
2. Identify user-visible changes.
3. Identify tests run.
4. Write PR description in the required format.
5. Include risks and rollout notes.

### Verification

- Description mentions tests.
- No unrelated files are summarized as intentional changes.
- Risk section is present when behavior changes.
```

境界は内容と同じくらい重要です。Skill は何をしないかも説明します。

## Project Skill と Personal Skill

Personal Skill は個人の好みや横断的な作業方法に向きます。Project Skill はチーム共有 flow に向きます。

| 種類 | 向く内容 | リスク |
| --- | --- | --- |
| Personal | 自分の文章の好み、review 習慣 | チーム全員の前提にしない |
| Project | project command、architecture rule、提出 template | 保守が必要。古くなる |
| Organization | brand、安全、compliance、共通 process | version governance と approval が必要 |

共有 Skill が repository に入ると、利用者全員に影響します。コードと同じように review します。

## ケース：Incident Review Skill

目標：本番 incident を、振り返り可能で、改善可能で、追跡可能な incident review に整理する。

Skill に含められるものです。

- alert、log、trace、ticket、timeline を読む。
- fact、assumption、decision、open question を分ける。
- impact、root-cause hypothesis、recovery action、follow-up action を生成する。
- 各 action item に owner、due date、validation method を要求する。
- 未確認の推測を結論として書かない。
- 統一された incident review template を出力する。

このタスクは繰り返し発生し、入力 source が比較的安定しており、形式と境界が重要です。Skill に向いています。

## よくあるアンチパターン

**アンチパターン 1：Skill が価値観宣言になる。**

「高品質で構造的に書く」だけでは足りません。steps、inputs、outputs、checks が必要です。

**アンチパターン 2：一つの Skill が広すぎる。**

Skill は小さく専門的なほうがよいです。大きすぎると trigger も実行も弱くなります。

**アンチパターン 3：examples がない。**

Agent は、何を良い結果とするかを見る必要があります。例は説明コストを下げます。

**アンチパターン 4：更新仕組みがない。**

project command、framework version、team format は変わります。Skill も保守が必要です。

## Skill 設計テンプレート

```md
---
name: skill-name
description: Use when...
---

### When to Use

Use this when:

Do not use this when:

### Inputs

- Required files:
- Required commands:
- Required context:

### Workflow

1.
2.
3.

### Output

Format:
Must include:
Must not include:

### Verification

- [ ]
- [ ]

### Examples

Good:

Bad:
```

> **記入例（Incident review skill）**
>
> name：incident-review
> description：Use when a production incident needs a structured timeline, root cause, action items, and verification evidence.
> When to Use：incident notes、logs、alerts、chat transcripts を review doc にします；issue がまだ active burning のときは使いません
> Inputs：Required files=incident log, alert screenshot, deploy diff；Required commands=git show, log query；Required context=service owner and severity
> Workflow：1. timeline を作ります；2. facts と hypotheses を分けます；3. root cause と contributing factors を抽出します；4. owner 付き action items を書きます；5. evidence links を確認します
> Output：Format=Markdown incident review；Must include=timeline, impact, root cause, follow-ups；Must not include=personal blame や検証不能な主張です
> Verification：すべての timestamp に source があることを確認します；各 action item に owner と due date があることを確認します
> Examples：Good=各結論を log/deploy evidence にリンクします；Bad="human error" だけで system fix がありません

## チェックリスト

- description は十分具体的で、誤 trigger を避けられるか？
- 不適用場面を書いているか？
- 入力と出力が明確か？
- 実行 steps があるか？
- examples または templates があるか？
- verification があるか？
- 機密情報を含めていないか？
- owner がいて保守されるか？

## さらに読む

- [Model Context Protocol 入門](./introduction-to-model-context-protocol/)：tool connection をどう標準化するかを理解する。
- [Claude Code in Action](../04-developer-tools/claude-code-in-action/)：Skill を実開発 workflow で使う。
- [Agentic Workflows：状態機械で AI タスクを分解する](../../agentic-workflows-02/)：Skill を大きな実行 flow に組み込む。

## 参考

- [Claude Code Skills documentation](https://docs.anthropic.com/en/docs/claude-code/skills)
- [Anthropic Academy: Introduction to Agent Skills](https://anthropic.skilljar.com/introduction-to-agent-skills)
