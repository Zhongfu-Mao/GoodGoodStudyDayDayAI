---
title: "GPT-image-2 実践ガイド：能力、費用、API、ワークフロー"
date: 2026-05-11
category: engineering
description: "ChatGPT/Codex 内蔵画像生成、Image API、Responses API、費用、制限、失敗パターン、公開前 QA をまとめる GPT-image-2 実践ガイド。"
difficulty: intermediate
plainSummary: "GPT-image-2 は単なる画像生成ボタンではない。実務で使うには、内蔵生成、Image API、Responses API、編集、参照画像、費用、透明背景制限、公開前 QA を分けて考える必要がある。"
tags:
  - "AI Engineering"
  - "GPT-image-2"
lang: ja
coverImage: "/images/engineering/practice/gpt-image-2-practice-cover.png"
draft: false
---

# GPT-image-2 実践ガイド：能力、費用、API、ワークフロー

> 時点メモ：この記事は 2026-05-11 に確認しました。OpenAI の画像モデル、料金、出力サイズ、透明背景対応、Codex 内蔵生成の扱いは変化しやすいため、利用前に公式情報を再確認してください。

GPT-image-2 は「絵を描くボタン」として使うこともできますが、実務ではそれだけでは足りません。記事カバー、教材画像、UI 素材、編集ワークフローに使うなら、prompt だけでなく、費用、サイズ、品質、参照画像、QA、保存ルールまで含めた生産ラインとして扱う必要があります。

![GPT-image-2 画像生産ライン](/images/engineering/practice/gpt-image-2-pipeline.svg)

## 三つの使い方を分ける

一つ目は ChatGPT や Codex の内蔵画像生成です。探索、カバー案、挿絵、仮素材に向いています。摩擦は小さいですが、バッチ制御や費用記録には向きません。OpenAI Codex 文書では、内蔵画像生成は `gpt-image-2` を使い、通常の Codex 利用制限を消費すると説明されています。

二つ目は Image API です。一つの prompt から画像を生成、または既存画像を編集する自動化に向いています。`model: "gpt-image-2"` を指定し、サイズ、品質、形式、圧縮を調整できます。

三つ目は Responses API の `image_generation` ツールです。対話的に画像を更新したり、前回の画像を文脈として引き継いだりする体験に向いています。

## 使い分け

記事カバーの探索なら内蔵生成。決まった仕様で多数作るなら Image API。対話的な画像編集体験を作るなら Responses API。正確なフロー図や細かい文字が必要なら、画像生成ではなく SVG、HTML、Mermaid、Markdown 表を使います。

公式ドキュメントでも、文字配置、構成制御、一貫性には制限が残ると説明されています。だから、このシリーズではカバーは画像生成、正確な図は SVG で作っています。

## API 最小例

Image API の Python 例：

```python
from openai import OpenAI
import base64

client = OpenAI()

result = client.images.generate(
    model="gpt-image-2",
    prompt="A clean editorial cover image for an AI engineering handbook.",
    size="1536x1024",
    quality="medium",
)

image_base64 = result.data[0].b64_json
with open("cover.png", "wb") as f:
    f.write(base64.b64decode(image_base64))
```

Responses API では画像生成を tool として使います。

```python
from openai import OpenAI
import base64

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="Generate an editorial cover for an AI image production workflow.",
    tools=[{"type": "image_generation"}],
)

image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    with open("workflow-cover.png", "wb") as f:
        f.write(base64.b64decode(image_data[0]))
```

本番では、画像だけでなく prompt、サイズ、品質、入力画像、生成日時、費用見積もり、QA 結果を残します。

## 費用の考え方

2026-05-11 時点の OpenAI ドキュメントでは、画像生成費用は入力テキスト token、編集時の入力画像 token、画像出力 token の合計として考えます。`gpt-image-2` は画像入力を高 fidelity で扱うため、参照画像つき編集は高くなりやすいです。

公式例では、`1024x1024` の `gpt-image-2` は low 約 `$0.006`、medium 約 `$0.053`、high 約 `$0.211` と示されています。`1024x1536` / `1536x1024` は low 約 `$0.005`、medium 約 `$0.041`、high 約 `$0.165` です。これは出力部分の目安で、最新値は必ず公式ページで確認します。

毎日 10 枚の `1024x1024` を作る場合の出力費用目安：

| 品質 | 1枚 | 10枚/日 | 30日 |
| --- | ---: | ---: | ---: |
| low | `$0.006` | `$0.06` | `$1.80` |
| medium | `$0.053` | `$0.53` | `$15.90` |
| high | `$0.211` | `$2.11` | `$63.30` |

実際には、参照画像、失敗、再生成、税、候補比較があるため、`1.5x-3x` の余裕を見ます。

## 透明背景と文字

2026-05-11 時点では、OpenAI ドキュメントは `gpt-image-2` が `background: "transparent"` をサポートしないと説明しています。透明素材が必要なら、対応モデルや後処理を検討します。ただし髪、ガラス、煙、半透明素材は後処理が不安定です。

文字も注意が必要です。短いラベル、UI 小字、表の説明は画像生成に任せず、Web 側や SVG、デザインツールで重ねる方が安全です。

## Prompt テンプレート

```text
用途：エンジニアリング記事のカバー、16:9。
テーマ：AI ツールの生産ライン。brief、入力、生成、レビュー、公開。
画面：実物の作業机と抽象的な工程パネル。読める文字は入れない。
スタイル：落ち着いた技術編集風。知識サイト向け。
色：graphite、off-white、teal、amber。
禁止：logo、読める文字、人物、過度なサイバー表現、抽象グラデーション。
検収：スマホで切り抜いてもテーマが分かる。文字化けがない。本文より目立ちすぎない。
```

用途、構図、禁止事項、検収を先に書くことで、結果が安定します。

## レイヤーで考える：アイデアから公開資産まで

GPT-image-2 を実務に入れる時は、少なくとも五つのレイヤーに分けます。

一つ目は brief です。画像は何のために存在するのか。記事カバー、本文図、製品素材、SNS 用画像、キャラクター設定、スタイル探索、ユーザー画像の再編集では、検収基準がまったく違います。カバーは読者をテーマに導けばよいですが、製品素材は実物との整合性が重要です。

二つ目は入力です。入力は prompt だけではありません。参照画像、ブランド制約、サイズ、品質、禁止事項、表示先、後から文字を重ねるか、モバイルで切り抜かれるかも入力設計に含まれます。OpenAI 文書では、`gpt-image-2` は画像入力を高 fidelity で扱うため、参照画像を使う編集は入力 token の費用も見ます。参照画像は無料の強化ではなく、費用と権利の境界です。

三つ目は生成です。ChatGPT / Codex 内蔵生成、Image API、Responses API のどれを使うかを決めます。内蔵生成は探索に向き、Image API はスクリプト化に向き、Responses API は多輪の編集体験に向きます。

四つ目はレビューです。テーマとの整合性、文字化け、不要な logo、人や実在組織、危険記号、誤解を招く UI、著作権リスク、モバイル裁切、ファイルサイズ、alt text を確認します。

五つ目は公開と再現です。PNG を置くだけでは終わりません。prompt、生成日、モデル、サイズ、品質、ソース、QA 結果、再生成条件を残します。モデル挙動や価格が変わった時、なぜその画像があるのか、どう差し替えるのかが分かるようにします。

## 実践パス：このサイトでの画像生産ライン

このシリーズでは、まず記事テーマを固定し、その後で各記事の visual brief を作ります。カバーは GPT-image-2 で生成し、本文の正確な図は SVG で制御します。生成画像は元の生成ディレクトリに残し、公開用コピーを `public/images/engineering/practice/` に置きます。最後にページのスクリーンショットで、デスクトップとモバイルの見え方を確認します。

重要なのは、**カバーは生成モデル、正確な説明は制御可能な図** という分担です。生成モデルは雰囲気、比喩、素材感に強い一方、SVG は順序、ラベル、パラメータ、構造を正確に扱えます。両方を使い分けることで、読みやすさと正確さを両立できます。

運用するなら、生成ごとに小さな manifest を残します。

```json
{
  "slug": "gpt-image-2-practical-guide",
  "model": "gpt-image-2",
  "use": "cover",
  "size": "16:9 editorial cover",
  "quality": "medium",
  "prompt_version": "2026-05-11-a",
  "qa": {
    "desktop": "pass",
    "mobile_crop": "pass",
    "text_artifacts": "none observed"
  }
}
```

読者に見せる必要はありませんが、画像を工程資産として扱う助けになります。

## 現在観測できる状態と確認方法

2026-05-11 時点で公式文書から確認できる要点は、Image API が `gpt-image-2` の生成と編集を扱えること、Responses API が `image_generation` tool を通じて多輪生成や編集を扱えること、`gpt-image-2` が複数のサイズ、品質、形式、圧縮を扱う一方で、透明背景をサポートしないことです。また、複雑な prompt は分単位の遅延になる可能性があり、正確な文字、配置、複数回生成での一貫性には限界があります。

確認する時は、まず OpenAI Image generation guide でモデル、API、サイズ、透明背景、制限を見ます。次に pricing の image generation 領域を確認します。Responses API を使うなら、tools の `image_generation` パラメータも確認します。最後に低コストの最小 prompt で実行し、request id、出力、費用見積もりを残します。

価格、モデル、制限は変わりやすいため、「常にこうである」とは書かず、「この日付時点で観測できる状態」として扱います。

## 反例：楽に見えて高くつく

すべての図を画像生成に任せるのは危険です。フローチャート、価格表、API 差分、手順説明は、SVG や Markdown 表の方が正確で編集しやすく、翻訳もしやすいです。

成功画像だけで費用を見積もるのも危険です。実際には候補生成、失敗、prompt 修正、品質変更、モバイル裁切による再生成があります。最終枚数だけで予算を出すと、ほぼ必ず低く見積もります。

prompt を記録しないのもよくある失敗です。気に入った画像ほど、後から同じ雰囲気で追加生成したくなります。記録がなければ、シリーズ感を保つのが難しくなります。

最後に、画像を証拠として扱わないこと。生成画像は概念を伝えるもので、製品能力や実システムの存在を証明しません。証拠は公式文書、コード、実験、スクリーンショット、検証結果に置きます。

## 公開前 QA

- 記事テーマと合っているか。
- logo、人物、読めない文字が混ざっていないか。
- モバイル裁切で意味が残るか。
- ファイルサイズを圧縮すべきか。
- prompt と生成条件を記録したか。
- alt text を用意したか。
- 概念図を事実の構成図のように見せていないか。

知識記事では、画像は理解を助けるものです。API、価格、制限、正確なフローは、文章や表、制御可能な図で示します。

## チェックリスト

- 内蔵生成、Image API、Responses API を分けているか。
- prompt、サイズ、品質、QA 結果を記録しているか。
- 正確な文字とフローを画像生成に任せていないか。
- 最新の公式ドキュメントで料金と制限を確認したか。
- 参照画像入力の費用を考慮したか。
- 透明背景を `gpt-image-2` で当然できると仮定していないか。
- 失敗と再生成の予算を見ているか。

## 関連記事

- [AIエンジニアリング実践マップ](./ai-engineering-practice-map/)
- [ChatGPT での画像生成](../../academy/openai-academy/02-using-chatgpt/tools/image-creation/)
- [Codex、Claude Code、Gemini CLI：賢さではなくワークフローで比べる](./agent-cli-workflow-comparison/)
