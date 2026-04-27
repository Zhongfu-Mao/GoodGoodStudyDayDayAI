---
title: "Math for AI ノート：ベクトル空間とコサイン類似度"
date: 2026-04-04
category: foundations
description: "ベクトル空間、内積、コサイン類似度の直感的理解：AI がなぜすべてをベクトルで表現するのか。"
difficulty: intermediate
plainSummary: "AI はテキスト、画像、ユーザー行動をすべてベクトルに変換します。コサイン類似度は 2 つのベクトルの方向が揃っているかを測る最も一般的な指標です。"
tags:
  - "Math"
  - "Embeddings"
lang: ja
draft: false
---

## なぜ AI にベクトルが必要か

AI モデルはテキストや画像を直接理解できません。すべてを数値の配列（ベクトル）に変換して処理します。重要なのは、**意味が近いものはベクトル空間で近くに配置される**ことです。

## コサイン類似度

$$
\cos(\theta) = \frac{a \cdot b}{\|a\| \|b\|}
$$

| 値 | 意味 |
| --- | --- |
| 1 | 方向が完全に一致（最も類似） |
| 0 | 直交（無関係） |
| -1 | 方向が完全に逆 |

コサイン類似度は長さを無視し、方向だけを見ます。

## なぜコサインか

高次元空間ではユークリッド距離の識別力が低下します（次元の呪い）。コサイン類似度は長さを正規化するため、高次元でも安定します。

## 実用例

- **セマンティック検索**：クエリとドキュメントをベクトル化し、コサイン類似度で最も関連するものを返す（RAG の検索段階）。
- **レコメンド**：ユーザーとアイテムのベクトル類似度で推薦。
- **重複検出**：2 つの記事のベクトル類似度が閾値を超えたら重複候補。

## Python 例

```python
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

v1 = np.array([1, 2, 3])
v2 = np.array([2, 4, 6])  # 同じ方向
v3 = np.array([3, -1, 0]) # 異なる方向

print(cosine_similarity(v1, v2))  # 1.0
print(cosine_similarity(v1, v3))  # ≈ 0.08
```

## サイト内で次に読むもの

- [Embeddings・ベクトルと RAG](../ai-developer-core/embeddings-vector-rag/)
- [Data Science：データクリーニングと特徴量エンジニアリング](../data-science-02/)
