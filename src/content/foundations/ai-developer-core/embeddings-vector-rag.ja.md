---
title: "AI Developer Core：Embedding、ベクトル類似度、RAG"
date: 2026-04-26
category: foundations
description: "Embedding がテキストを検索可能な空間へ写像し、RAG がどのように外部知識を文脈へ運ぶのかを整理する。"
difficulty: beginner
plainSummary: "Embedding はテキストをベクトル空間へ写像し、類似度検索で関連資料を探せるようにします。RAG の本質は文書を詰め込むことではなく、正しい根拠を文脈へ入れることです。"
tags:
  - AI Developer Core
  - Embedding
  - RAG
  - Vector Search
lang: ja
draft: false
---

# Embedding とは

Embedding は、テキストや画像などをベクトルへ変換する関数である。ベクトル空間で近いものは、意味的にも近いとみなせる。表面の単語が違っていても、同じ意味を持つ文は近い場所に置かれることがある。

この仕組みにより、LLM アプリは外部記憶を扱える。質問をベクトル化し、文書群から近い断片を探し、それをコンテキストに入れて回答させる。これが RAG の基本形である。

## RAG は万能ではない

RAG は、外部知識、社内文書、最新情報を使わせるために有効だ。ただし、正しさを自動的に保証するわけではない。失敗は主に四つの場所で起こる。

1. 文書分割が悪く、重要情報が切り離される。
2. 検索で正しい資料が取れない。
3. 並び替えが悪く、ノイズが上位に来る。
4. 生成時の制約が弱く、根拠に忠実でない回答になる。

つまり RAG は、ベクトル DB をつなぐだけではない。データ整理、chunk、embedding、index、retrieval、rerank、文脈組み立て、引用、拒答、eval まで含む一つのパイプラインである。

## ベクトル類似度の限界

意味的に近いことと、タスクに必要なことは同じではない。ユーザーが「企業アカウントにも返金規約は適用されるか」と聞いたとき、検索は返金規約の文書を多く拾うかもしれないが、企業アカウントの例外を落とすかもしれない。

短いクエリ、否定、数字、日付、権限、法律条文は、純粋なベクトル検索だけでは扱いにくい。実務では keyword search、metadata filter、reranker、ルールを組み合わせることが多い。

## 実務上の意味

RAG の第一原則は、回答を追跡可能にすることだ。出典のない回答はデバッグできない。eval のない RAG は改善できない。chunk size、embedding、top-k、reranker、prompt を変えるたびに、同じ質問セットで比較できるようにする。

良い RAG は、何でも知っているように見せるものではない。知っているときは根拠を出し、知らないときは知らないと言えるものだ。

## 試すこと

サイト内の Radar や Academy から 20 本を選び、小さな RAG を作る。20 問を用意し、10 問は文書内で答えられるもの、5 問は複数文書の統合が必要なもの、5 問は意図的に答えがないものにする。top-3、top-8、keyword + vector を比較し、根拠性を見る。

## 参考

- [Full Stack LLM Bootcamp](https://fullstackdeeplearning.com/llm-bootcamp/)
- [Eugene Yan: LLM Patterns](https://eugeneyan.com/writing/llm-patterns/)
- [DeepLearning.AI: Building Agentic RAG with LlamaIndex](https://www.deeplearning.ai/short-courses/building-agentic-rag-with-llamaindex)
- [OpenAI Agent Evals](https://platform.openai.com/docs/guides/agent-evals)

