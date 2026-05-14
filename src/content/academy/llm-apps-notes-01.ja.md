---
title: "LLM アプリ入門：Prompt から Tool Calling までの設計骨格"
date: 2026-04-02
category: academy
description: "LLM アプリを、観測でき、検証でき、再現できるエンジニアリングシステムとして捉える。Prompt、構造化出力、Tool Calling、安全境界、運用チェックリストまでを整理します。"
difficulty: intermediate
plainSummary: "LLM アプリはチャット UI とモデル呼び出しだけではなく、コンテキスト、モデル、構造化出力、ツール、状態、安全、観測性を一つの実行時チェーンとして設計するものです。"
coverImage: "/images/academy/llm-apps-notes-01/llm-app-architecture-cover.png"
tags:
  - "LLM"
  - "Agent"
  - "AI Engineering"
lang: ja
draft: false
---

## LLM アプリを「実行時システム」として見る

LLM アプリを初めて作るとき、多くの場合はチャット画面から始まります。ユーザーが入力し、サーバー側で Prompt を組み立て、モデルを呼び出し、返ってきた文章を画面に表示する。

このプロトタイプには十分な価値があります。モデルがタスクを理解できるか、ユーザー体験として成立するか、どのような質問が来るかを早い段階で確認できるからです。

しかし、プロダクションに近づくほど、LLM アプリは「Prompt とモデル呼び出し」だけでは説明できなくなります。実際には、次のような実行時チェーンとして扱う方が安定します。

1. ユーザーのリクエストを受け取る。
2. アプリケーションが指示、コンテキスト、状態、制約を組み立てる。
3. モデルがテキスト、構造化データ、または tool call を返す。
4. アプリケーションが出力を検証し、必要な tool を実行し、過程を記録する。
5. 結果をユーザーへ返し、次のターン、調査、コスト管理、安全監査のための証跡を残す。

![LLM アプリの実行時アーキテクチャ。コンテキスト、モデル、構造化出力、ツール、安全、観測性が一つのアプリケーションコアへ集約される](/images/academy/llm-apps-notes-01/llm-app-architecture-cover.png)

このページの目的は API パラメータを暗記することではありません。伝えたいのは、より長く使える設計の見方です。**LLM アプリの中心は「モデルに話させること」ではなく、モデルを検証可能で、制御可能で、再現可能なシステムの中で働かせることです。**

通常の Web API やバックエンド開発に慣れている人にとって、この考え方はかなり自然です。違いは、従来の決定的な関数呼び出しの中に、確率的なモデル出力が入ってくることです。だからこそ、境界、検証、状態、ログが重要になります。

## 最小構成としての 7 レイヤー

保守しやすい LLM アプリには、少なくとも 7 つのレイヤーがあります。

| レイヤー | 役割 | よくある問題 |
| --- | --- | --- |
| インターフェース | ユーザー入力を受け取り、結果や確認 UI を表示する | 長い処理中に何が起きているか見えない |
| コンテキスト | システム指示、ユーザー入力、検索結果、会話状態を組み立てる | 古い情報や不要な履歴が混ざる |
| モデル | モデル、推論量、出力長、ストリーミングを選ぶ | いつも一番強いモデルを使い、コストと遅延を見落とす |
| 出力契約 | JSON、列挙値、UI 状態、アクション計画として出力を制約する | 自由文を後段のプログラムが安定して扱えない |
| ツール境界 | 検索、DB、業務システム、ファイル、コード実行などを公開する | tool の説明が曖昧で、引数検証や権限制御が弱い |
| 状態 | 会話、タスク、tool 結果、承認状態、リトライを保持する | 履歴を重複して渡し、モデルが同じ操作を繰り返す |
| 観測性 | trace、コスト、遅延、エラー、入出力要約を記録する | 問題が起きても Prompt のどこが悪いか推測するしかない |

この 7 レイヤーを必ず 7 つのサービスに分ける必要はありません。小さなアプリであれば、同じバックエンド内の複数モジュールでも十分です。大切なのは、設計時に「これは Prompt の変更なのか」「出力契約の変更なのか」「tool の追加なのか」「安全境界の変更なのか」を分けて考えられることです。

境界が混ざると、アプリケーションはすぐに Prompt の巨大な塊になります。失敗するたびに system prompt に一文を足し、なぜ挙動が変わったのか誰も説明できなくなる。LLM アプリで避けたい典型的な状態です。

## 実行時ループを描く

LLM アプリのメインループは、次のように考えられます。

![ユーザーリクエスト、コンテキスト構築、モデル呼び出し、構造化結果、tool 実行、観測記録がつながる LLM アプリの実行時ループ](/images/academy/llm-apps-notes-01/llm-app-runtime-loop.png)

擬似コードにすると、骨格は次のようになります。

```ts
type AppRequest = {
  userId: string;
  message: string;
  conversationId?: string;
};

type AppResult = {
  answer: string;
  actions: Array<{ type: string; status: "done" | "pending_approval" | "failed" }>;
  traceId: string;
};

async function runLlmApp(request: AppRequest): Promise<AppResult> {
  const trace = startTrace("llm_app.request", {
    userId: request.userId,
    conversationId: request.conversationId,
  });

  const context = await buildContext({
    userId: request.userId,
    message: request.message,
    conversationId: request.conversationId,
  });

  const modelResult = await callModel({
    instructions: context.instructions,
    input: context.messages,
    tools: context.availableTools,
    outputContract: context.outputContract,
    traceId: trace.id,
  });

  const validated = validateModelResult(modelResult);

  const toolResults = await executeApprovedTools({
    toolCalls: validated.toolCalls,
    policy: context.toolPolicy,
    traceId: trace.id,
  });

  const finalAnswer = await synthesizeFinalAnswer({
    originalRequest: request.message,
    modelResult: validated,
    toolResults,
    traceId: trace.id,
  });

  await trace.finish({
    model: modelResult.model,
    tokenUsage: modelResult.usage,
    toolCallCount: toolResults.length,
  });

  return {
    answer: finalAnswer.text,
    actions: toolResults.map(toActionSummary),
    traceId: trace.id,
  };
}
```

実際の実装はもっと複雑になります。それでも主な流れは大きく変わりません。コンテキストをモデルへ渡し、モデルが構造化出力または tool call を返し、アプリケーションが検証と実行を担当し、最後にその過程を記録します。

ここで重要なのは 2 点です。

一つ目は、モデル呼び出しはアプリ全体ではないということです。モデルは実行時ループの一部であり、コンテキスト、検証、tool 実行、状態保存、観測性も同じくらい重要です。

二つ目は、tool 実行は「モデルが言ったから実行する」ではないということです。モデルは tool call を提案できますが、その tool が存在するか、引数が正しいか、権限があるか、人間の確認が必要か、失敗時にリトライしてよいかを決めるのはアプリケーションです。

## Prompt は一枚の文章ではなく、層として設計する

Prompt は魔法の呪文ではありません。アプリケーションがタスク、制約、コンテキストをモデルへ渡すためのインターフェースです。

保守しやすい Prompt は、だいたい次の 4 層に分けられます。

```text
[役割と境界] このアシスタントが担当すること、担当しないこと
[タスクルール] 完了条件、不確実性の扱い、確認方針
[出力契約] 返すべき構造、必須フィールド、列挙値
[動的コンテキスト] ユーザー入力、検索結果、会話状態、tool 結果
```

すべてを長い文章にする必要はありません。安定したルールはテンプレートとして管理し、動的なコンテキストはデータ構造として渡し、出力契約は構造化出力や function schema に寄せる方が扱いやすくなります。

よくある悪い例は、次のような一枚 Prompt です。

```text
あなたはカスタマーサポート担当です。丁寧に回答してください。
過去の履歴は以下です。注文も検索できます。order_id が必要です。
返金の場合は慎重にしてください。JSON で返してください。
JSON は絶対に間違えないでください。
```

短いこと自体が問題ではありません。問題は、役割、タスク、tool 説明、安全ポリシー、出力形式、履歴が混ざっていることです。動くかもしれませんが、どこを変更したら挙動がどう変わるのかを追いにくくなります。

より扱いやすい形は、境界を分けることです。

```ts
const instructions = [
  rolePolicy,
  uncertaintyPolicy,
  safetyPolicy,
].join("\n\n");

const input = [
  { role: "user", content: userMessage },
  { role: "system", content: renderRetrievedContext(docs) },
  { role: "system", content: renderConversationState(state) },
];

const tools = [lookupOrderTool, createRefundRequestTool];
const outputContract = customerSupportResponseSchema;
```

この形にしておくと、tool 説明だけをテストしたり、安全ポリシーだけを更新したり、検索コンテキストの品質だけを評価したりできます。ログにも「どの層のどのバージョンが使われたか」を残しやすくなります。

## 構造化出力：モデルの回答をアプリの契約にする

自由文は人間が読むには便利ですが、プログラムの境界としては不安定です。UI の切り替え、DB 更新、ワークフロー起動などにモデルの結果を使うなら、早い段階で構造化出力を導入した方がよいです。

![自然言語の流れが検証境界を通り、構造化オブジェクト、UI 状態、保存データへ変換される様子](/images/academy/llm-apps-notes-01/structured-output-contract.png)

構造化出力が解くのは「最終的なモデル回答はどの形で返るべきか」という問題です。

```json
{
  "intent": "schedule_meeting",
  "confidence": 0.86,
  "missing_fields": ["timezone"],
  "reply_to_user": "会議を調整できます。タイムゾーンを教えてください。",
  "next_step": "ask_clarifying_question"
}
```

このような構造があると、アプリケーションは安定して判断できます。

- `intent` に応じて UI を変える。
- `confidence` に応じて人間の確認へ回す。
- `missing_fields` を使って不足情報を尋ねる。
- `next_step` に応じて次のワークフローへ進む。

さらに重要なのは、失敗が見えることです。自由文は一見自然に見えても、必須フィールドがない、列挙値が不正、日付形式が壊れている、といった問題を検出しづらい。構造化出力なら、バリデーションで止められます。

実務では、まずアプリケーション側の型を決め、それをモデル出力の schema に対応させると考えやすいです。

```ts
type MeetingIntent = {
  intent: "schedule_meeting" | "cancel_meeting" | "unknown";
  confidence: number;
  participants: string[];
  timeRange?: {
    start: string;
    end: string;
    timezone: string;
  };
  missingFields: string[];
  replyToUser: string;
};
```

そして、実行時の検証を必ず置きます。

```ts
function validateMeetingIntent(value: unknown): MeetingIntent {
  const parsed = MeetingIntentSchema.parse(value);

  if (parsed.confidence < 0 || parsed.confidence > 1) {
    throw new Error("confidence must be between 0 and 1");
  }

  if (parsed.intent === "schedule_meeting" && parsed.participants.length === 0) {
    throw new Error("schedule_meeting requires participants or a missing field");
  }

  return parsed;
}
```

公式ドキュメントでも、構造化出力と function calling は用途が分けられています。**ユーザーに返すモデル出力を schema に合わせたいなら構造化出力。モデルをアプリケーションの機能につなげたいなら function calling / tool calling。** この区別は、設計の混乱をかなり減らしてくれます。

## Tool Calling：モデルに能力を渡すが、境界は渡さない

Tool Calling が扱うのは別の問題です。モデルが外部の情報や機能を必要とする場合、アプリケーションが用意した tool を呼び出すためのリクエストを返します。

たとえばユーザーが「この注文は返金できますか」と聞いたとします。モデル自体は注文状態を知りません。そこで `lookup_order` tool を提供します。モデルは注文検索が必要だと判断し、tool call を返します。アプリケーションが実際に注文を検索し、その結果をモデルへ戻し、モデルが最終回答を組み立てます。

ここで大切なのは、**モデルが関数を直接実行しているわけではない**ということです。モデルは関数呼び出しの意図と引数を提案します。実行し、責任を持つのは宿主アプリケーションです。

モデルに DB 接続、支払い権限、メール送信権限、クラウドリソースの書き込み権限を直接渡すべきではありません。モデルに見せるのは、あなたが設計した tool schema です。実際の権限確認、副作用制御、監査ログはアプリケーション側で持ちます。

良い tool 定義は、最低限次の問いに答えます。

| 問い | 例 |
| --- | --- |
| 何をする tool か | 注文状態を取得する。注文は変更しない |
| いつ使うか | 注文状態、配送、返金可否を確認するとき |
| 必要な引数は何か | `order_id`。現在のユーザーに属している必要がある |
| 何を返すか | 状態、金額、配送状態、返金可否 |
| 副作用はあるか | ない。読み取り専用 |

書き込みを伴う tool には、さらに境界が必要です。

| 書き込み境界 | 設計要件 |
| --- | --- |
| 人間の確認 | メール送信、返金、削除、公開、権限変更の前に確認を挟む |
| 冪等性 | 書き込み操作には idempotency key を持たせる |
| 監査ログ | 誰が開始し、モデルが何を提案し、誰が承認し、何が実行されたかを残す |
| ロールバック | 取り消せる操作には補償操作を用意し、取り消せない操作はより厳しくする |
| 最小権限 | tool はその作業に必要な権限だけを持つ |

![Tool safety control plane。読み取り専用 tool、書き込み tool、承認、監査、ロールバックが明確な境界で分けられている](/images/academy/llm-apps-notes-01/tool-safety-control-plane.png)

tool は大きく 3 種類に分けて考えると設計しやすくなります。

| 種類 | 例 | デフォルト方針 |
| --- | --- | --- |
| 読み取り専用 tool | 検索、ドキュメント読み取り、注文照会、カレンダー空き時間確認 | 自動実行してよいが、入出力の要約を記録する |
| 取り消し可能な書き込み tool | 下書き作成、ラベル付与、一時ファイル生成、承認待ちチケット作成 | 自動または半自動。ロールバック手段を残す |
| 高リスク書き込み tool | 決済、返金、メール送信、削除、公開、権限変更 | 必ず人間の確認を挟む。必要なら二重承認 |

多くの Agent 事故は、モデルの推論力が足りないからではなく、高リスク tool を曖昧な境界で公開してしまうことから起きます。権限設計があって初めて、モデルの能力は安心して使える生産性になります。

## 構造化出力と Tool Calling の選び方

迷ったら、次の表で考えるとわかりやすいです。

| やりたいこと | 優先する設計 |
| --- | --- |
| UI に固定フィールドを返したい | 構造化出力 |
| 意図分類、抽出、判断を返したい | 構造化出力 |
| DB、検索、コード実行などを使いたい | Tool Calling |
| 副作用のある業務操作をしたい | Tool Calling + 権限ポリシー + 人間の確認 |
| 情報を取得してから構造化された結果を返したい | Tool Calling + 構造化出力 |

たとえば会議調整アシスタントなら、「ユーザーが何をしたいか」は構造化出力で表せます。

```json
{
  "intent": "schedule_meeting",
  "missing_fields": ["timezone"],
  "confidence": 0.82
}
```

一方で「カレンダーの空き時間を調べる」は tool call です。

```json
{
  "tool": "find_calendar_slots",
  "arguments": {
    "participants": ["alice@example.com", "bob@example.com"],
    "duration_minutes": 30,
    "date_range": "next_week"
  }
}
```

そして「候補時間をユーザーへ提示する」は、また構造化出力に戻せます。

```json
{
  "reply_to_user": "3 つの候補時間が見つかりました。",
  "options": [
    { "start": "2026-05-18T10:00:00+09:00", "end": "2026-05-18T10:30:00+09:00" },
    { "start": "2026-05-19T14:00:00+09:00", "end": "2026-05-19T14:30:00+09:00" }
  ]
}
```

実際のアプリでは、この 2 つが交互に出てきます。構造化出力は「モデルの判断をアプリが扱える形にする」ためのもの。Tool Calling は「モデルがアプリの能力を使う」ためのものです。

## 状態管理：全履歴を毎回そのまま渡さない

状態管理は、初期の LLM アプリで最も軽視されやすい部分です。

一番簡単な実装は、会話履歴をすべて毎回モデルへ渡すことです。デモではよく動きます。しかし実際の利用では、すぐに問題が出ます。

- コストが増え続ける。
- レイテンシが長くなる。
- 古い指示と新しい目標が衝突する。
- tool 結果が重複し、モデルが同じ操作をもう一度実行しようとする。
- ある回答がどの履歴に依存したのか追いにくい。

より堅い設計では、状態を種類ごとに分けます。

| 状態の種類 | 保存する内容 | モデルへの渡し方 |
| --- | --- | --- |
| 会話要約 | ユーザー目標、好み、確認済み事実 | 圧縮してコンテキストへ入れる |
| タスク状態 | 現在ステップ、不足項目、承認状態 | 構造化フィールドとして渡す |
| tool 結果 | 直近の検索、ファイル、注文、検索結果 | 必要な要約と参照だけ渡す |
| 監査記録 | 誰が何を承認し、何が実行されたか | ログへ保存。必ずしもモデルへ渡さない |
| デバッグ trace | Prompt バージョン、モデル、token、エラー | 観測システムへ保存。ユーザー文脈には入れない |

OpenAI の Responses API では、前回の response id を使った継続のようなサーバー管理の文脈維持ができます。Agents SDK では、さらに session、state、handoff、tracing などの上位パターンが提供されます。どの仕組みを使う場合でも原則は同じです。**1 つの会話には 1 つの状態戦略を選ぶ。手動で全履歴を再投入しながら、同時にサーバー側状態にも依存すると、文脈が重複しやすくなります。**

状態は多ければよいわけではありません。良い状態は、次の 3 つに答えられます。

1. 現在のユーザー目標は何か。
2. すでに完了し、繰り返してはいけない操作は何か。
3. 次に実行すべき最小のアクションは何か。

この 3 つに答えない情報は、会話コンテキストではなくログとして扱う方がよい場合があります。

## 失敗モードを設計に入れておく

LLM アプリの失敗は、単発のエラーではなく連鎖として現れます。構造化出力の失敗が tool 引数の欠落を生み、tool のリトライが重複書き込みを生み、その状態をもとにモデルがさらに推論してしまう。

少なくとも、次の失敗モードは事前に設計しておくべきです。

| 失敗モード | 典型的な症状 | 工学的な対処 |
| --- | --- | --- |
| コンテキスト不足 | モデルは自信を持って答えるが、事実が足りない | 不足フィールドを明示し、質問または検索へ進める |
| 出力構造エラー | JSON 解析失敗、型不一致、必須項目欠落 | schema 検証、一度だけ修復リトライ、フォールバック |
| tool 引数エラー | 存在しない ID、権限外リソースを指定する | 引数検証、権限チェック、回復可能エラーとして返す |
| tool タイムアウト | ユーザーが長く待たされ、モデルが推測し始める | タイムアウト境界、バックグラウンド化、進捗表示 |
| 重複書き込み | リトライでメールや決済が重複する | idempotency key、実行前確認、承認状態管理 |
| コンテキスト汚染 | 昨日の目標が今日の作業を上書きする | 会話要約、状態圧縮、タスク境界 |
| コスト超過 | 長い文脈と多段 tool call が積み重なる | token budget、モデル分担、キャッシュ戦略 |
| 調査不能 | 最終回答だけあり、過程が残っていない | trace、tool 入出力要約、Prompt バージョン記録 |

実用的な原則は、**モデルの失敗を特別な魔法の失敗として扱わず、普通の分散システムの失敗として扱う**ことです。

モデルは形式を間違えます。tool はタイムアウトします。ネットワークは失敗します。ユーザーは途中で目標を変えます。権限が足りないこともあります。これらを設計に入れておけば、後から Prompt のパッチで無理に直す回数が減ります。

## そのまま使える設計テンプレート

新しい LLM アプリを設計するときは、まずこのテンプレートを埋めると、議論がかなり整理されます。

```md
# LLM App Design Brief

### 1. ユーザータスク
- ユーザーは誰か？
- どの作業を完了したいのか？
- 完了条件は何か？

### 2. モデルの責務
- 理解、生成、判断、計画のうち、モデルに任せる範囲はどこか？
- モデルに自動決定させてはいけないことは何か？

### 3. コンテキストソース
- ユーザー入力：
- 検索結果：
- 会話状態：
- 業務データ：
- モデルへ渡してはいけない機密情報：

### 4. 出力契約
- 最終出力は自然文、JSON、UI 状態、アクション計画のどれか？
- 必須フィールド：
- 列挙値：
- 検証ルール：
- 失敗時のフォールバック：

### 5. Tool 一覧
- 読み取り専用 tool：
- 取り消し可能な書き込み tool：
- 高リスク書き込み tool：
- 各 tool の引数 schema：
- 各 tool の権限境界：

### 6. 状態戦略
- 会話をどう継続するか？
- どの履歴をモデルへ渡すか？
- どの記録はログにだけ残すか？
- 重複実行をどう防ぐか？

### 7. 観測と評価
- trace id をどう貫通させるか？
- どの指標を記録するか？
- どのサンプルを人間レビューへ回すか？
- どの失敗でアラートを出すか？
```

このテンプレートの価値は、形式そのものではありません。「モデルが答えられるか」ではなく、「システムとして安定して仕事を完了できるか」を考えるための道具です。

## リリース前チェックリスト

最初の LLM アプリを公開する前に、次の観点で確認すると安全です。

**Prompt とコンテキスト**

- system 指示、タスクルール、動的コンテキストが分かれているか。
- Prompt テンプレートのバージョンを記録できるか。
- 検索結果には出典、時点、信頼境界があるか。
- 長い会話に要約または圧縮戦略があるか。

**構造化出力**

- schema があるか。
- 実行時バリデーションがあるか。
- 解析失敗時のリトライとフォールバックが定義されているか。
- フィールド形式を Prompt の文章だけに頼っていないか。

**Tool Calling**

- tool 説明に用途、引数、戻り値、エラーモードが含まれているか。
- tool 引数をアプリケーション側で検証しているか。
- 書き込み操作に人間の確認または承認があるか。
- idempotency key と監査ログがあるか。

**状態と観測性**

- trace id があるか。
- モデル、token、遅延、tool call 数を記録しているか。
- 失敗したリクエストを再現できるか。
- コスト予算とタイムアウト境界があるか。

**安全性と体験**

- ユーザーは、検索中、tool 実行中、承認待ちであることを理解できるか。
- 高リスク操作は明示的に確認されるか。
- モデルが不確実なとき、作り話ではなく質問できるか。
- 人間が引き継ぐ経路があるか。

このチェックリストの半分以上に答えられない場合、そのアプリはまだ Demo 段階かもしれません。Demo は能力を見せるには十分ですが、そのまま本番システムとは呼べません。

## 続けて読む

このページは入口です。

モデル呼び出しをより堅牢にしたい場合は、[Reliable LLM Call Skeleton](../../engineering/ai-developer-core/reliable-llm-call-skeleton/) を参照してください。

構造化出力の失敗と復旧については、[Structured Output、Retry と Recovery](../../engineering/ai-developer-core/structured-output-retry-recovery/) が近い内容です。

tool calling が標準化された tool protocol とどうつながるかを知りたい場合は、[Introduction to MCP](../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/) を読むと理解しやすくなります。

Python / FastAPI でバックエンドを作る場合は、このページの実行時ループを [FastAPI 実践トピック](../../engineering/practice/python-fastapi-developer-foundations/) と接続できます。FastAPI は HTTP、依存性注入、検証、観測性を担当し、LLM runtime はコンテキスト、モデル、tool、状態を担当します。

## 参考

- [OpenAI Function Calling guide](https://developers.openai.com/api/docs/guides/function-calling)：tool calling の基本語彙、function schema、tool output の返し方。
- [OpenAI Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs)：構造化出力と function calling の使い分け。
- [OpenAI Migrate to Responses API guide](https://developers.openai.com/api/docs/guides/migrate-to-responses)：Responses API、tool loop、state、hosted tools の現在の方向性。
- [OpenAI Agents guide: Running agents](https://developers.openai.com/api/docs/guides/agents/running-agents)：会話継続、`previousResponseId`、session、conversation 戦略。

## 小結

LLM アプリのエンジニアリングとは、不安定になりうる言語生成を、安定したソフトウェア境界の中に置くことです。

Prompt もモデルも重要です。しかし、システムの品質を決めるのは、出力契約、tool 境界、状態戦略、安全制御、観測性です。これらが整うと、モデルは単に会話する部品ではなく、実際の業務フローに参加できる実行時ノードになります。
