---
title: "Cloud & Infra メモ：CI/CD と静的サイトの自動デプロイ"
date: 2026-04-10
category: engineering
description: "GitHub Actions を活用して Astro サイトの自動ビルド、コード検査、自動デプロイを実現する手法を解説します。Push から公開までの完全なパイプラインを構築しましょう。"
difficulty: intermediate
plainSummary: "CI/CD は複雑なエンタープライズツールではなく、ビルド・検査・デプロイを自動化するシンプルな仕組みです。Push するだけで検証と公開が完了し、手動操作の不安から解放されます。"
tags:
  - "CI/CD"
  - "GitHub Actions"
  - "Deployment"
lang: ja
draft: false
---

## 静的サイトのデプロイフロー

静的サイトのデプロイは、本質的に「ビルド → アップロード → 向き先の切り替え」というシンプルな工程です。しかし、手動操作はミスを招きやすく、特に多言語サイトのようにファイル数やパス構成が複雑な場合、CI/CD による自動化が不可欠となります。

## GitHub Actions の基本構成

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

`main` 分支へ Push するたびに、依存関係のインストール → コンテンツの整合性チェック → ビルド → デプロイという一連のパイプライン（Pipeline）が自動で実行されます。

## 3 つの重要なチェックポイント

### 1. コンテンツのバリデーション（`astro check`）

ビルドの前に実行し、すべての Markdown ファイルの Frontmatter が定義した Schema に適合しているかを確認します。エラーが 0 件であることをデプロイの絶対条件とします。

### 2. ビルドプロセス（`npm run build`）

Markdown と Astro コンポーネントを静的な HTML へコンパイルします。テンプレートのエラーや、内部リンク・アセットの参照切れをこの段階で検出できます。

### 3. 自動デプロイ

ビルド成果物（Artifact）をホスティングプラットフォーム（GitHub Pages、Cloudflare Pages、Vercel 等）へアップロードします。静的ファイルのためサーバーのランタイムは不要で、高いパフォーマンスとセキュリティを維持できます。

## マルチ環境の運用戦略

| 環境 | トリガー | 主な用途 |
| --- | --- | --- |
| **Preview** | Pull Request 提出 | チーム内でのプレビューとビジュアルレビュー |
| **Staging** | `dev` ブランチへの Push | 多言語コンテンツの同期確認と統合テスト |
| **Production** | `main` ブランチへの Push | エンドユーザーへの正式公開 |

個人開発や小規模プロジェクトであれば、Preview と Production の 2 つの環境があれば十分安定した運用が可能です。

## よくある問題と解決策

| 事象 | 主な原因 | 対策 |
| --- | --- | --- |
| ビルドは成功するが 404 になる | Base Path の設定ミス | `astro.config.mjs` の `base` フィールドを再確認 |
| 画像が表示されない | 相対パスの使用 | `/images/...` のような絶対パス指定に統一 |
| デプロイ直後に更新が反映されない | CDN キャッシュの影響 | キャッシュのパージ（消去）または Cache-Control の調整 |
| ビルド時間が長すぎる | 未最適化の重いアセット | 画像最適化プラグインの使用や事前圧縮を検討 |

## 実践的なアドバイス

1. **「Push すれば検査が走る」状態を作る**：問題が起きてから手動でチェックするのではなく、仕組みで担保します。
2. **`astro check` をビルドの前に置く**：コンテンツのエラーは最も早い段階で遮断（Fail Fast）すべきです。
3. **Preview 環境で多言語対応を確認する**：日本語ページが正常でも、他言語のページでレイアウトが崩れている可能性があるため、必ず実機で確認します。
4. **ビルド時間は 2 分以内を目標に**：開発のスピード感を損なわないよう、パイプラインの効率化を常に意識しましょう。

## 次に読むべきコンテンツ

- Astro のコンテンツ管理の詳細：[App Dev：Astro ページとコンテンツコレクション](../app-dev-01/)
- AI を活用したエンジニアリングの実践：[AI Coding Tools](../../start/ai-basics-for-everyone/ai-coding-tools/)
