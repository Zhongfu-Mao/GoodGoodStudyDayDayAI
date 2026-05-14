---
title: "OpenAI Academy：RAG を知識ベースから追跡可能な回答へ"
date: 2026-04-25
category: academy
description: "RAG を知識プロダクトとして設計する。コーパス登録基準、chunking、hybrid retrieval、rerank、引用、拒否応答、評価ループを扱う。"
plainSummary: "RAG の目的は文書をモデルに渡すことではない。正しい証拠を安定して見つけ、追跡可能で、拒否でき、評価でき、保守できる回答を作ることだ。"
difficulty: intermediate
coverImage: "/images/academy/openai-academy/07-building-with-ai/rag/rag-grounding-cover.png"
tags:
  - "RAG"
  - "AI Engineering"
lang: ja
academy:
  series: "OpenAI Academy"
  module: "07.4 RAG"
  moduleOrder: 104
  source: "OpenAI Academy"
  sourceUrl: "https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22"
  prerequisites:
    - "先に読むとよい：OpenAI Academy ノート：Research with ChatGPT"
draft: false
---

# OpenAI Academy：RAG を知識ベースから追跡可能な回答へ

![RAG の証拠検索と回答生成フロー](/images/academy/openai-academy/07-building-with-ai/rag/rag-grounding-cover.png)

RAG は「検索してから生成する」と説明されます。入門には便利ですが、この説明だけだと誤解が生まれます。ベクトルデータベースを用意し、文書を切って入れれば、モデルが自動的に信頼できるようになるわけではありません。

実務で重要なのは、検索技術そのものよりも証拠のガバナンスです。

考えるべき問いです。

- どの文書を知識ベースへ入れるか。
- 文書をどう切れば意味を失わないか。
- ユーザー質問をどう検索向けに書き換えるか。
- ベクトル検索、キーワード検索、filter、rerank をどう組み合わせるか。
- 回答はどの証拠を引用すべきか。
- 証拠不足のとき拒否応答できるか。
- 検索失敗と生成失敗を分けて評価できるか。

RAG の目的は「モデルに多くを知ってもらう」ことではありません。検証可能な材料に基づく回答を作ることです。

## RAG システムの四つの境界

| 境界 | 重要な問い | 失敗した場合 |
| --- | --- | --- |
| Corpus boundary | どの資料を入れるか | 古い文書、重複、低品質文書が結果を汚す |
| Retrieval boundary | 候補証拠をどう見つけるか | 正しい材料が見つからない、ノイズが上位に来る |
| Generation boundary | モデルが材料外へ広げてよいか | 出典なし断定や hallucination が出る |
| Evaluation boundary | 改善をどう判断するか | 感覚だけで Prompt を調整する |

多くの RAG は retrieval だけを見ます。しかし運用では corpus と evaluation が安定性を大きく左右します。

## コーパス登録基準：すべての文書を入れない

知識ベースはゴミ箱ではありません。RAG に入れる文書には登録基準が必要です。

記録したい項目です。

- 出典は信頼できるか。
- 対象製品やバージョン。
- 更新日時。
- 権限範囲。
- owner。
- 既存文書と矛盾しないか。
- より権威ある文書に置き換えられていないか。

古い文書一つの害は、欠けた文書十個より大きいことがあります。欠けていれば拒否応答できますが、古い文書は自信を持った誤答を生みます。

## Chunking：切るのは文字数ではなく証拠単位

![Chunking、hybrid retrieval、rerank の流れ](/images/academy/openai-academy/07-building-with-ai/rag/chunking-retrieval-quality.png)

chunk が長すぎると、検索で命中しても証拠が埋もれます。短すぎると、文脈を失います。

token 数だけでなく、次を考えます。

- 見出しと本文が同じ chunk にあるか。
- 表、コードブロック、手順リストが途中で切れていないか。
- 一つの chunk が小さな問いに独立して答えられるか。
- 出典、パス、章、更新日時などの metadata が残っているか。
- parent-child chunk で、小さな命中から大きな文脈へ広げられるか。

実用的な基準です。

**chunk はランダムな文章片ではなく、証拠カードであるべきです。**

## 検索：vector、keyword、filter、rerank を分担させる

ベクトル検索は意味検索に強いですが、エラーコード、フィールド名、バージョン番号の完全一致は苦手です。本番 RAG では複数の検索経路がよく使われます。

| 方法 | 得意 | 苦手 |
| --- | --- | --- |
| Vector search | 意味類似、言い換え | 正確なフィールド、短いエラーコード |
| Keyword search | 文字列、固有名詞 | 表現揺れ、意味的近さ |
| Metadata filter | 権限、バージョン、製品線、時間 | 意味順位付け |
| Rerank | 候補の再順位付け | 完全に漏れた証拠の回復 |

正しい証拠が候補に入らなければ、rerank では救えません。まず recall、その後 ranking を見ます。

## 生成：回答は境界を知るべき

RAG の生成 prompt は「材料に基づいて答えて」だけでは弱いです。次の三つを明示します。

1. 何に答えてよいか。
2. 何には答えてはいけないか。
3. 証拠不足をどう表現するか。

より安定する制約です。

```text
提供された evidence だけを使って回答する。
evidence が結論を支えない場合は、情報不足と明示する。
重要な結論には少なくとも一つの出典を結び付ける。
推測を事実として書かない。
```

拒否応答を怖がるシステムは、証拠不足でも書き続けます。RAG では正しく拒否できることも能力です。

## 引用と帰属：回答を追跡可能にする

![RAG の引用、帰属、unsupported claim チェック](/images/academy/openai-academy/07-building-with-ai/rag/citation-grounding-check.png)

引用は装飾ではありません。三つの役割があります。

- ユーザーが結論の出典を確認できる。
- 開発者が誤った証拠を特定できる。
- eval が回答の grounding を検査できる。

良い citation は URL だけではありません。できれば次を含めます。

- 文書タイトル。
- 章や段落。
- 更新日時。
- 権限または可視範囲。
- 元 chunk ID。

回答が A を引用していても、結論がモデルの推測なら失敗です。引用は結論を支えている必要があります。

## RAG 評価：検索と生成を分ける

RAG 評価は少なくとも二層に分けます。

検索層：

- 正しい文書が top-k に入るか。
- 正しい chunk が十分上位に来るか。
- 古い文書や矛盾文書を検索結果に入れていないか。
- キーワード問題をベクトル検索が漏らしていないか。

生成層：

- 回答は evidence に忠実か。
- 出典なし断定がないか。
- 証拠不足で拒否できるか。
- 引用は本当に結論を支えるか。
- 出力形式はプロダクト要求に合うか。

最終回答だけで RAG を評価しないことです。悪い回答が出たとき、retrieval 失敗か generation 失敗かを分ける必要があります。

## ケース：組織内ポリシー Q&A

目標：社員が経費精算ポリシーを質問し、システムが出典付きで回答する。

リスク：

- 地域ごとにポリシーが違う。
- 古いポリシーが残っている。
- ユーザー質問は国や時点を省略しがち。
- 一部ポリシーは管理職だけが読める。

設計：

1. corpus 登録基準で地域、バージョン、有効期間、権限を記録する。
2. 検索前にユーザー地域と質問時点を確認する。
3. metadata filter で地域と可視範囲を限定する。
4. キーワード検索でポリシー番号と条項名を拾う。
5. 生成時に具体的な条項引用を求める。
6. 地域や時点が不明なら、先に質問する。

これは「全 PDF をベクトル化する」よりずっと信頼できます。

## よくあるアンチパターン

**アンチパターン 1：ベクトル DB を作ってからデータガバナンスを考える。**

データ登録基準、version、permission は先に設計します。後からだと index がすぐ汚れます。

**アンチパターン 2：chunk size だけを調整する。**

chunk size は重要ですが、metadata、見出し保持、parent context、rerank も同じくらい重要です。

**アンチパターン 3：citation を形式要件にする。**

引用は結論を支える必要があります。段落末尾にリンクを置くだけでは不十分です。

**アンチパターン 4：拒否応答がない。**

証拠不足で答え続けると、RAG の信頼性が失われます。

## RAG 設計テンプレート

```md
## RAG System Card

ユーザー場面：
回答境界：
拒否条件：

## Corpus

出典：
登録ルール：
更新日時：
権限ルール：
矛盾処理：

## Retrieval

クエリ書き換え：
ベクトル検索：
キーワード検索：
metadata filter：
rerank：

## Generation

出力形式：
引用形式：
不確実性の表現：

## Evaluation

検索指標：
生成指標：
失敗分類：
回帰サンプル：
```

## チェックリスト

- 知識ベースに登録基準と期限切れルールがあるか？
- chunk は証拠単位であり、ランダムな切片ではないか？
- vector、keyword、metadata、rerank を組み合わせているか？
- 正しい証拠が top-k に入るか？
- 生成は evidence の範囲内に制限されているか？
- 正しい拒否応答を許しているか？
- eval は検索失敗と生成失敗を分けているか？

## さらに読む

- [OpenAI Academy：信頼できる AI Agents を構築する](./agents/)：Agent を証拠に基づいて行動させる。
- [OpenAI Academy：評価 (Evals)](./evals/)：RAG の回帰評価を作る。
- [AI のための数学：ベクトル空間とコサイン類似度](../../../foundations/math-for-ai-01/)：ベクトル検索の基礎を理解する。

## 参考

- [OpenAI Academy: Builder Bootcamp](https://academy.openai.com/home/clubs/builders-etkn1/resources/builder-bootcamp-2026-04-22)
- [OpenAI File Search Guide](https://platform.openai.com/docs/guides/tools-file-search)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
