---
title: "AI Developer Core：最小 RAG システムを作る"
date: 2026-04-26
category: engineering
description: "文書 QA の最小ループとして、分割、索引、検索、文脈組み立て、引用、評価を実装する。"
difficulty: intermediate
plainSummary: "最小 RAG はベクトル DB だけではありません。データ、検索、文脈組み立て、引用制約、eval がつながった閉ループです。"
tags:
  - AI Developer Core
  - RAG
  - Retrieval
  - LLM App
lang: ja
draft: false
---

# 最小 RAG に必要なもの

RAG demo はすぐ作れる。文書を読み、chunk に分け、embedding を作り、ベクトル検索し、結果を prompt に入れる。しかし保守できる最小 RAG には、引用、拒答、eval、観測性が必要だ。

毎回の回答に対して、根拠はどこか、なぜこの断片が検索されたのか、間違いは文書不足か、検索失敗か、ranking 失敗か、生成 hallucination かを追えるようにする。

## データ準備

まず小さく始める。たとえばサイト内の 20 本の記事を選び、title、path、date、tags、body を保持する。分割時には固定文字数だけで切らず、見出しと出典 path を保つ。chunk には最低限次を持たせる。

- `doc_id`
- `title`
- `path`
- `heading`
- `text`
- `date`
- `tags`

Metadata は検索、filter、引用、debug のすべてで効いてくる。

## 検索と文脈組み立て

第一版は vector top-k でよい。ただし、モデルに渡す前に、各断片を番号、title、source、text 付きで組み立てる。Prompt では、与えられた断片だけに基づいて答え、確認できない場合は確認できないと言わせる。

文脈の組み立ては重要だ。8 個の chunk を無秩序に並べるのと、テーマ、時間、出典で整理するのとでは結果が変わる。モデルは DB ではない。証拠の配置が必要である。

## 最小 Eval Set

質問を三種類用意する。

1. **直接命中**：単一断片に答えがある。
2. **統合判断**：複数記事を組み合わせる必要がある。
3. **無回答**：材料に答えがない。

各 10 問から始める。検索が正しい断片を拾ったか、回答が正しく引用したか、無回答時に拒答できたかを見る。これで retrieval と generation の問題を分けられる。

## 失敗出力

RAG の失敗も標準化する。

```json
{
  "status": "insufficient_evidence",
  "answer": "",
  "citations": [],
  "missing": "材料内では確認できません"
}
```

これは単なる謝罪文より、プロダクトロジックへ渡しやすい。

## 実験目標

この実験の目標は、評価できる小さな RAG を作ることだ。文書と話せる demo ではなく、どこで失敗したかが分かる仕組みにする。完成物は次の五つ。

- `documents.jsonl`：正規化済み文書。
- `chunks.jsonl`：metadata 付き chunk。
- `retrieval_trace.jsonl`：検索と回答の記録。
- `eval_questions.jsonl`：固定評価セット。
- 失敗分析表。

小さく始めるほうがよい。20 本の記事でも、chunk、検索、引用、拒答の問題は十分に出る。データが大きすぎると、失敗箇所がかえって見えにくい。

## プロジェクト骨格

ディレクトリは次のように分ける。

```text
rag-lab/
  data/documents.jsonl
  data/chunks.jsonl
  eval/eval_questions.jsonl
  traces/retrieval_trace.jsonl
  src/prepare.ts
  src/retrieve.ts
  src/answer.ts
  src/evaluate.ts
```

`prepare` は Markdown を文書 object にする。`retrieve` は候補 chunk を返す。`answer` は候補 chunk だけを使って回答する。`evaluate` は結果を比較する。最初から一つの大きな script にしない。分けておくと、失敗時に直す場所が分かる。

## 検索実験

第一版は vector top-k だけでよい。第二版で keyword や metadata filter を足す。第三版で reranker を検討する。各版を同じ評価セットで比べる。

- 正しい chunk が top-3 に入るか。
- 正しい chunk が top-8 に入るか。
- 回答が正しい出典を引用するか。
- 無回答問題で拒答するか。
- 材料外の情報を混ぜていないか。

これらは「見た目が良い回答」より役に立つ。RAG 品質は retrieval と generation に分けて見る。

## 失敗点

よくある失敗は五つある。

1. Chunk が短すぎて答えが分断される。
2. Chunk が長すぎてノイズが増える。
3. Query が短すぎて重要条件を拾えない。
4. top-k が大きすぎて低品質断片に引っ張られる。
5. Prompt が引用を要求せず、追跡不能な回答になる。

失敗は必ず分類する。分類できれば、chunk、retrieval、rerank、answer prompt のどれを直すべきかが見える。

## 受け入れ基準

第一版は完璧でなくてよい。直接命中問題の top-3 recall が 80% 以上、無回答問題の拒答率が 80% 以上、非拒答回答には最低一つの引用がある、くらいから始める。その後、文書数と質問数を増やす。

## 試すこと

サイト内容を使ってローカル RAG を作る。複雑な framework は不要。重要なのは `retrieval_trace.jsonl` を出すことだ。質問、top-k、最終文脈長、回答、引用、人間ラベルを記録する。chunk や prompt を変えるたびに比較できる。

最後に、失敗例を `eval_questions.jsonl` へ戻す。RAG の評価セットは、実際の失敗から育てるものだ。一度作って終わりではない。

## 関連基礎

- [RAG とは何か](../../../academy/ai-basics-for-everyone/what-is-rag/)：非エンジニアにも説明できる概念入口。
- [Embedding、ベクトル類似度、RAG](../../../foundations/ai-developer-core/embeddings-vector-rag/)：retrieval、ranking、grounding の基礎。
- [Hallucination と Grounding](../../../academy/ai-basics-for-everyone/what-is-hallucination-grounding/)：引用、拒否、証拠境界を product requirement にする。

## 参考

- [Full Stack LLM Bootcamp](https://fullstackdeeplearning.com/llm-bootcamp/)
- [DeepLearning.AI: Building Agentic RAG with LlamaIndex](https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex)
- [Eugene Yan: LLM Patterns](https://eugeneyan.com/writing/llm-patterns/)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)
