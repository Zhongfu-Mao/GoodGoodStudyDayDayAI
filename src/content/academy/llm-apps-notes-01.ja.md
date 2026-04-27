---
title: "LLM Apps 入門ノート：Prompt から Tool Calling まで"
date: 2026-04-02
category: academy
description: "LLM App の基本骨格：Prompt 設計、構造化出力、Tool Calling、エラー処理の最小実装パス。"
difficulty: intermediate
plainSummary: "LLM App はチャット画面だけでなく、Prompt → モデル呼び出し → 構造化出力 → Tool Calling → エラー処理の 5 ステップで構成されるシステムです。"
tags:
  - "LLM"
  - "Agent"
lang: ja
draft: false
---

## LLM App の最小骨格

1. **Prompt 組み立て**：システム指示、ユーザー入力、context を 1 つの prompt にまとめる。
2. **モデル呼び出し**：LLM API へリクエストを送り、生の応答を受け取る。
3. **構造化出力**：自然言語の応答をプログラムで処理できる形式（JSON 等）に変換。
4. **Tool Calling**：モデルがツール呼び出しを決定した場合、実行して結果を返す。
5. **エラー処理**：タイムアウト、フォーマット不正、ツール失敗時のリトライと降格戦略。

## Prompt 設計：積み重ね方式

```text
[システム層] 役割、ルール、出力形式
[Context 層] 検索結果、ユーザー履歴、タスク状態
[ユーザー層] 今回の具体的な依頼
```

システム層はテンプレート化し、Context 層は動的に組み立て、ユーザー層はそのまま渡します。

## 構造化出力

```json
{
  "intent": "schedule_meeting",
  "participants": ["Alice", "Bob"],
  "time": "2026-04-28T10:00",
  "confidence": 0.92
}
```

- prompt で完全な JSON スキーマ例を示す。
- API の `response_format` パラメータを活用する。
- パース失敗時はリトライ → 純テキスト降格。

## Tool Calling

```python
response = llm.chat(messages, tools=tool_definitions)
if response.tool_calls:
    result = execute_tool(response.tool_calls[0])
    messages.append(tool_result(result))
    response = llm.chat(messages)
```

注意点：ツール説明を明確にする、パラメータを必ず検証する、書き込み操作には承認を設ける。

## エラー処理

| 失敗タイプ | 対処 |
| --- | --- |
| API タイムアウト | 指数バックオフで最大 3 回リトライ |
| 出力フォーマット不正 | 再リクエスト、形式を明示 |
| ツール呼び出し失敗 | エラー情報をモデルに返し次ステップを判断させる |
| ハルシネーション | prompt と context を見直し、guardrail を追加 |
| コスト超過 | token 上限と呼び出し回数上限を設定 |

## サイト内で次に読むもの

- [Reliable LLM Call Skeleton](../../engineering/ai-developer-core/reliable-llm-call-skeleton/)
- [Structured Output・Retry と Recovery](../../engineering/ai-developer-core/structured-output-retry-recovery/)
- [Introduction to MCP](../anthropic-academy/05-agentic-mcp/introduction-to-model-context-protocol/)
