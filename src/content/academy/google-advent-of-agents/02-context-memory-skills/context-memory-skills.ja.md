---
title: "Google Advent of Agents：コンテキスト、メモリ、Skills の分層"
date: 2026-05-06
category: academy
description: "Advent of Agents の ADK Layers、Context Caching、Context Compaction、Memory Plugins、ADK Skills を、実践できる Agent コンテキスト分層として再構成します。"
plainSummary: "この図解ノートでは、「大きなコンテキスト」と「良い記憶」は別物であること、そして prompt context、session state、long-term memory、skills を分けて設計する方法を整理します。"
difficulty: advanced
coverImage: "/images/academy/google-advent-of-agents/covers/02-context-memory-skills.svg"
tags:
  - "AI/Agents"
  - "AI/Engineering"
lang: ja
academy:
  series: "Google Advent of Agents"
  module: "02 Context・Memory・Skills"
  moduleOrder: 122
  source: "Google Cloud Advent of Agents"
  sourceUrl: "https://adventofagents.com/2025/12/08"
  prerequisites:
    - "事前学習の推奨：Google Advent of Agents：ADK Agent プロジェクトの骨格"
draft: false
---

![コンテキスト、メモリ、Skills カバー](/images/academy/google-advent-of-agents/covers/02-context-memory-skills.svg)

**注記：** 本ページは Advent of Agents における ADK Context Layers、Big Context、Memory Plugins、ADK Skills、Skill Design Patterns の公開テーマを再構成したものです。日別の内容を繰り返すのではなく、Agent が何を本ラウンドのコンテキストに入れ、何を状態として保持し、何を長期記憶にし、何を必要時に読み込む Skill とするべきかを扱います。

## このページが扱う問題

Agent が複雑になると、最もよく起きる問題は「何でも prompt に入れる」ことです。

最初は有効に見えます。ルール、背景、ユーザー設定、tool 説明、API ドキュメント、過去の会話、チーム規約をすべて入れれば、モデルは多くを知っているように振る舞います。しかし、すぐに副作用が出ます。

- prompt が長くなり、レイテンシとコストが上がる。
- モデルが大量の情報の中で重要点を見失う。
- 一時的なタスク文脈と長期記憶が混ざり、古い情報を掃除できない。
- 使わない skill 説明まで毎回読み込まれる。
- 失敗したとき、規則衝突、記憶汚染、tool 説明不足のどれが原因かわかりにくい。

Advent of Agents の Context、Memory、Skills 関連テーマは、同じ判断に向かっています。**信頼できる Agent は、より長いコンテキストではなく、より明確なコンテキスト分層で作られる。**

## 分層図

![Context Memory Skills 分層図](/images/academy/google-advent-of-agents/diagrams/context-memory-skills-layers.svg)

Agent の文脈システムは、まず四層に分けると理解しやすくなります。

| 層 | 入れるべきもの | 入れるべきでないもの |
| --- | --- | --- |
| Prompt context | 本ラウンドの回答に必要なタスク、制約、tool 結果、少量の背景。 | 全履歴、全文書、長期設定、汎用 skill マニュアル。 |
| Session state | 現在のタスク進捗、選択ファイル、一時 artifact、短期判断。 | 永続的な事実、横断的な好み、撤回不能なユーザー像。 |
| Long-term memory | 安定した好み、ユーザーが確認した長期事実、再利用可能な知識。 | 未検証の推論、一回限りの詳細、機密データ原文。 |
| Skills | 必要時に読み込む手順知識、テンプレート、参考資料。 | すべてのラウンドに無条件で入る巨大な説明書。 |

この分類は抽象論ではありません。設計、テスト、監査のための制御面です。

## Prompt context：このラウンドで本当に必要なもの

Prompt context は、最も高価で、膨らみやすく、出力に直接影響する層です。原則は一つです。

> このラウンドの回答に必要な情報だけを入れる。

ある情報を prompt に入れるべきか迷ったら、次の三つを確認します。

1. それがないと、モデルは明らかに間違えるか。
2. その情報は今も有効か。それとも後続の指示で上書きされたか。
3. tool、memory、skill から必要時に取得できないか。

答えが「あると便利」程度なら、prompt に入れる資格は弱いです。Agent 工学では、「あると便利」はしばしばノイズになります。

## Session state：現在のタスク作業台

Session state は、Agent が処理している作業現場です。必ずしもすべてをモデルに見せる必要はありませんが、システムは次を追跡する必要があります。

- 現在どのステップまで進んだか。
- ユーザーが選んだファイル、ページ、対象は何か。
- どの tool call が起きたか。
- どの一時 artifact が生成されたか。
- どの仮説が確認待ちか。

この層は「作業中のもの」を置く場所です。寿命は long-term memory より短く、単一 prompt より長くなります。

良い session state は、一時停止、再開、リプレイ、部分的な取り消しを可能にします。Advent of Agents の resume、rewind、durable execution の話題は、この層の理解に支えられています。

## Long-term memory：安定し、撤回可能なものだけ

長期記憶は、会話履歴を丸ごと保存する場所ではありません。選別された好みと事実のライブラリに近いものです。

保存に向くもの：

- ユーザーが明示的に確認した好み。出力言語、技術スタック、納品形式など。
- 長く有効なプロジェクト背景。公開リポジトリ構造、チーム手順、安定した用語集など。
- 検証済みの経験。特定タスクの失敗パターンなど。

保存に向かないもの：

- 一回の会話からモデルが推測したユーザー像。
- すぐ変わる価格、モデル制限、ポリシー状況。
- メール本文、認証情報、私的データの原文。
- ユーザーが一時的に話しただけで、長期利用を望んでいない情報。

記憶設計には「撤回できる感覚」が必要です。ユーザーは何が保存されたか理解でき、削除や不使用を求められるべきです。

## Skills：必要時に読み込む手順知識

Skills が解くのは、事実ではなく手順の問題です。

たとえば：

- Academy 学習記事をどう書くか。
- Gmail triage をどう進めるか。
- 図解つきコンテンツをどう構成するか。
- Astro content schema をどう確認するか。
- チームの公開フローをどう実行するか。

これらを毎回 prompt に入れると、コンテキストを消費し、現在のタスクを邪魔します。よりよい方法は、モデルがまず skill 名と短い説明だけを見て、必要なときに完全な手順を読み込むことです。

Progressive disclosure は、情報を隠すためではありません。正しいタイミングで、正しい材料だけを見せるための設計です。

## 小さな設計例

公式資料をもとに AI Academy の学習記事を作る「記事アシスタント」を考えます。すべてを巨大な system prompt に入れるのではなく、次のように分けます。

| 内容 | 置く場所 | 理由 |
| --- | --- | --- |
| 今回書くテーマと読者 | Prompt context | 本ラウンドで必ず使う。 |
| 現在の草稿、未作成図、未確認リンク | Session state | 現在の作業現場に属する。 |
| 本サイトの長期スタイル、原文搬運禁止の境界 | Long-term memory または repo ガイド | 複数タスクで安定して有効。 |
| Academy 記事の固定構成、frontmatter、検証コマンド | Skill | 記事を書くときだけ読み込む。 |
| Gmail メール本文 | 公開内容に入れない。メタデータとテーマ信号だけ使う | 私的情報の露出を避ける。 |

この分け方は、Agent を安定させるだけでなく、人間のレビューも楽にします。

## よくある失敗パターン

| 失敗パターン | 表面症状 | より安定した設計 |
| --- | --- | --- |
| 巨大 system prompt | 毎回遅く、重要ルールも漏れる。 | 汎用手順は skill、安定設定は memory に移す。 |
| 会話履歴を記憶扱い | Agent が古い情報や誤解を引用する。 | ユーザー確認済み、説明可能、撤回可能な情報だけ保存する。 |
| tool 結果を丸ごと戻す | prompt が JSON や長文で埋まる。 | tool は構造化サマリを返し、必要ならページングする。 |
| skill を常時ロード | 使わない手順まで毎回読み込む。 | 短い skill 説明だけ見せ、必要時に展開する。 |
| 一時タスクが長期状態を汚す | 次のタスクで前回の仮説を引きずる。 | session state と long-term memory を分離する。 |

## コード上の学習骨格

次は概念骨格です。完全な実装ではありませんが、四層を分けて考える助けになります。

```python
request_context = {
    "task": "write an ADK learning note",
    "audience": "engineers learning agent systems",
    "constraints": ["do not copy source text", "include a diagram plan"],
}

session_state = {
    "draft_slug": "adk-agent-project-anatomy",
    "checked_sources": ["adventofagents", "adk-docs"],
    "open_questions": ["which diagram should be created first?"],
}

long_term_memory = {
    "site_style": "original study notes with practical checklists",
    "privacy_rule": "never expose Gmail message IDs or private links",
}

available_skills = [
    {
        "name": "academy_article_writer",
        "summary": "Structure an Academy article with source boundary, diagram, workflow, and checklist.",
    }
]
```

実際のシステムがこの形になるとは限りません。しかし設計上の問いは同じです。どの情報を今すぐモデルに見せるのか、どの情報を runtime が保持するのか、どの情報は長期保存にユーザー承認が必要なのか、どの情報を skill として必要時に展開するのか。

## ADK プロジェクト骨格との関係

前ページでは、最小 Agent プロジェクトの骨格を扱いました。本ページでは、そのプロジェクトが動いた後に、どうやってコンテキストに押し潰されないようにするかを扱います。

| 前ページの焦点 | 本ページの補足 |
| --- | --- |
| `root_agent` をどう定義するか | instruction にすべての知識を詰め込まない。 |
| tools をどう接続するか | tool 結果は構造化し、必要ならページングや要約を使う。 |
| runtime をどう観察するか | 回答だけでなく、context 利用と state 変化を見る。 |
| checks をどう作るか | eval は回答だけでなく、記憶、tool、skill の使い方も見る。 |

ここから Agent は、単に tool を呼ぶチャット UI ではなく、コンテキストを統治するシステムになります。

## 最小実践タスク

前ページの読み取り専用 tool Agent を、コンテキスト分層の練習に使います。

1. 現在の prompt を、本ラウンドのタスク、長期ルール、操作手順、一時状態に分ける。
2. 「あると便利だが本ラウンドに不要」な背景を削る。
3. 安定ルールを短い長期プロジェクト規約にする。
4. 操作手順を skill 説明に変える。
5. tool は長文ではなく構造化サマリを返す。
6. 同じ質問を二回実行し、回答が短く、安定し、レビューしやすくなったか比べる。

実践記録表：

| 情報片 | 元の場所 | 新しい場所 | 理由 |
| --- | --- | --- | --- |
| 文体ルール | Prompt | Skill / 長期規約 | 安定し、再利用でき、毎回完全展開する必要がない。 |
| 今回の記事目標 | Prompt | Prompt | 本ラウンドで必要。 |
| 確認済みリンク | Prompt | Session state | 作業中に更新される情報。 |
| 私的メール本文 | Prompt | 公開フローに入れない | プライバシー境界。 |

## チェックリスト

- prompt context、session state、long-term memory、skills を区別できる。
- 長い会話履歴をそのまま長期記憶にしない。
- Skills は手順知識に向いており、すべての事実を入れる場所ではないと理解している。
- progressive disclosure がノイズを減らす理由を説明できる。
- 長期保存にはユーザー確認が必要な情報を見分けられる。
- 巨大 prompt を四層に分解し、それぞれの寿命を説明できる。
- context / memory / skill の使い方を検証する最小 eval を設計できる。

## 参考资源

- [Advent of Agents](https://adventofagents.com/)
- [ADK Context](https://google.github.io/adk-docs/context/)
- [ADK Sessions](https://google.github.io/adk-docs/sessions/)
- [ADK Skills](https://google.github.io/adk-docs/skills/)
- [ADK Runtime](https://google.github.io/adk-docs/runtime/)
- [Agent Starter Pack](https://github.com/GoogleCloudPlatform/agent-starter-pack)
