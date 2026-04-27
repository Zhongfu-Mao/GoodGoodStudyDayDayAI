---
title: "Cloud & Infra 観察：CI/CD と静的サイトデプロイ"
date: 2026-04-10
category: engineering
description: "GitHub Actions で Astro サイトの自動ビルド、検査、デプロイを行う：push からオンラインまでの完全パイプライン。"
difficulty: intermediate
plainSummary: "CI/CD はビルド・検査・デプロイを自動化する仕組みです。push するだけで検証とデプロイが完了し、手動操作が不要になります。"
tags:
  - "CI/CD"
  - "GitHub Actions"
  - "Deployment"
lang: ja
draft: false
---

## 静的サイトのデプロイフロー

静的サイトのデプロイは「ビルド → アップロード → 切り替え」です。CI/CD でこのフローを自動化します。

手動デプロイでも一度は公開できますが、記事や画像が増えると抜け漏れが出ます。特に多言語サイトでは、中国語ページが通っても日本語ページで frontmatter が欠ける、画像パスが違う、base path が合わない、といった差分が起きやすい。CI/CD は、公開作業そのものよりも「公開前に同じ検査を必ず通す」ためにあります。

## GitHub Actions の基本構造

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx astro check
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/
```

個人サイトでも、`npm ci`、`astro check`、`npm run build` の三つは分けておくと調査が楽です。依存関係で落ちたのか、content schema で落ちたのか、実際の build で落ちたのかがすぐ分かります。

## 3 つのチェックポイント

1. **コンテンツ検証**（`astro check`）：frontmatter がスキーマに適合するか確認。0 errors で次へ。
2. **ビルド**（`npm run build`）：Markdown と Astro コンポーネントを静的 HTML にコンパイル。
3. **デプロイ**：成果物をホスティング（GitHub Pages、Cloudflare Pages 等）にアップロード。

## マルチ環境戦略

| 環境 | トリガー | 用途 |
| --- | --- | --- |
| Preview | Pull Request | チームレビュー |
| Staging | dev branch | 統合確認 |
| Production | push to main | 公開 |

小さなサイトなら Preview と Production だけでも十分です。大きなリリースや content migration が増えたら、Staging を足すと安心です。

## よくある問題

| 問題 | 原因 | 対処 |
| --- | --- | --- |
| ビルド成功だが 404 | base path 設定ミス | `astro.config.mjs` の `base` を確認 |
| 画像が表示されない | 相対パスを使用 | `/images/...` の絶対パスに変更 |
| デプロイ後に更新されない | CDN キャッシュ | キャッシュクリアまたは Cache-Control 設定 |
| CI は通るが本番で崩れる | base path や外部 asset の差分 | preview URL と production URL を両方確認 |
| build が遅い | 大きな画像や音声をそのまま処理 | 事前圧縮、外部配信、artifact reuse |

## 実用アドバイス

1. `astro check` を `build` より前に置く。content error は早く落とす。
2. Preview URL で多言語ページと画像を確認する。片方の locale だけ壊れることがある。
3. 大きな asset は workflow の責務を分ける。HTML build と大容量配信を混ぜすぎない。
4. GitHub Actions の cache は便利だが、壊れた cache の切り分け手順も残す。
5. deploy job には最小権限だけを渡す。content site でも token 権限は広げすぎない。

## サイト内で次に読むもの

- [App Dev：Astro ページとコンテンツコレクション](../app-dev-01/)
- [AI Coding Tools](../../academy/ai-basics-for-everyone/ai-coding-tools/)
