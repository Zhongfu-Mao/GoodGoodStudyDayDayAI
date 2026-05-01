---
title: "LLM アプリ入門ノート：プロンプトから Tool Calling まで"
date: 2026-04-02
category: academy
description: "LLM アプリケーションの基本構成：プロンプト設計、構造化出力、Tool Calling、エラーハンドリングの最小実装パス。"
difficulty: intermediate
plainSummary: "LLM アプリは単なるチャット画面ではなく、プロンプト編組 → モデル呼び出し → 構造化解析 → ツール呼び出し → エラー処理の 5 ステップで構成されるシステムです。"
tags:
  - "LLM"
  - "Agent"
lang: ja
draft: false
---

## LLM アプリケーションの最小構成

LLM アプリケーションのコアフローは、主に以下の 5 ステップに集約されます。

1. **プロンプトの構成**：システム指示、ユーザー入力、コンテキストを統合し、最適なプロンプトを作成。
2. **モデル呼び出し**：LLM API へリクエストを送信し、生のレスポンスを取得。
3. **構造化解析**：自然言語による回答を、プログラムで処理可能な形式（JSON 等）に変換。
4. **Tool Calling**：モデルが外部ツールの使用を決定した場合、ツールを実行し結果をモデルにフィードバック。
5. **エラーハンドリング**：タイムアウト、フォーマット不正、ツール実行失敗時のリトライやフォールバック戦略。

## プロンプト設計：単純な蓄積ではなく「階層化」を

メンテナンス性の高いプロンプトは、通常 3 つのレイヤーで構成されます。

```text
[システム層] ロール定義、行動ルール、出力形式の指定
[コンテキスト層] 検索結果、ユーザー履歴、現在のタスク状態
[ユーザー層] 今回の具体的なリクエスト内容
```

システム層をテンプレート化し、コンテキスト層を動的に組み立て、ユーザー層をそのまま渡す設計にすることで、デバッグや改善が容易になります。

## 構造化出力：テキストからプログラム可能なデータへ

LLM に直接 JSON を返させる手法は、最も一般的かつ実用的なプラクティスです。

```json
{
  "intent": "schedule_meeting",
  "participants": ["Alice", "Bob"],
  "time": "2026-04-28T10:00",
  "confidence": 0.92
}
```

**実践的なアドバイス**:

- プロンプト内で完全な JSON スキーマの例を示す。
- API の構造化出力（Structured Outputs）パラメータ（OpenAI の `response_format` 等）を活用する。
- パース失敗時は、一度リトライを行い、解決しない場合は純粋なテキスト処理にフォールバックする。

## Tool Calling：モデルに実世界を操作させる

Tool Calling の基本的な連携パターン：

1. モデルがタスクを分析し、ツール呼び出し（関数名と引数）を要求。
2. アプリケーション側でツールを実行し、結果を取得。
3. 結果をモデルに返し、それに基づいた後続の推論を行わせる。

```python
# 連携ロジックの例
response = llm.chat(messages, tools=tool_definitions)
if response.tool_calls:
    result = execute_tool(response.tool_calls[0])
    messages.append(tool_result(result))
    response = llm.chat(messages)
```

**重要なポイント**:

- ツールの説明（用途、引数、戻り値）を明確かつ詳細に記述する。
- モデルから渡されたパラメータは必ず検証する。
- 書き込み操作（メール送信、データ更新等）には、必ず人間による承認フローを設ける。

## エラーハンドリング

LLM アプリケーションにおける主な失敗パターンと対処法：

| 失敗パターン | 対処方針 |
| --- | --- |
| API タイムアウト | 指数バックオフによるリトライ（最大 3 回程度） |
| 出力フォーマット不正 | 再リクエストを行い、フォーマット指示を強調 |
| ツール実行失敗 | エラー情報をモデルに返し、次のアクションを判断させる |
| ハルシネーション | プロンプトとコンテキストを見直し、ガードレールを導入 |
| コスト超過 | トークン上限や呼び出し回数の制限を設定 |

## 関連リソース

より堅牢な LLM 呼び出しパターンについては、[Reliable LLM Call Skeleton](../../engineering/ai-developer-core/reliable-llm-call-skeleton/) を参照してください。

構造化出力のエンジニアリング的側面については、[Structured Output、Retry と Recovery](../../engineering/ai-developer-core/structured-output-retry-recovery/) が参考になります。

Tool Calling と MCP の関係については、[Introduction to MCP](../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/) を確認してください。
