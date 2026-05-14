---
title: "Cloud & Infra：静的サイト CI/CD と公開ゲート"
date: 2026-04-10
category: engineering
description: "GitHub Actions、ビルド検証、コンテンツアセット QA、Pages サブパス確認、ロールバック戦略を使い、コンテンツサイト公開を信頼できるパイプラインにする。"
difficulty: intermediate
plainSummary: "CI/CD は push 後の自動デプロイだけではない。コンテンツサイトでは、型、リンク、画像、多言語、デプロイパス、最終ページを確認する公開ゲートであるべきだ。"
coverImage: "/images/engineering/cloud-infra-02/static-site-cicd-cover.png"
tags:
  - "CI/CD"
  - "GitHub Actions"
  - "Deployment"
lang: ja
draft: false
---

# Cloud & Infra：静的サイトにも公開ゲートが必要

![静的サイト CI/CD 公開パイプラインの概念図](/images/engineering/cloud-infra-02/static-site-cicd-cover.png)

静的サイトのデプロイは簡単に見えます。HTML をビルドし、ホスティングへアップロードし、CDN の反映を待つだけです。簡単に見えるからこそ、公開プロセスのリスクが低く見積もられます。

コンテンツサイトの本当のリスクは、サーバー停止ではなく、より見えにくい問題です。

- Markdown frontmatter が間違い、一覧ページの項目が欠ける。
- 中国語ページは正常だが、日本語ページのリンクが壊れる。
- ローカルプレビューでは画像が見えるが、サブパスへデプロイすると 404 になる。
- 古い SVG、一時画像、中国語文字入り画像が日本語本文に混ざる。
- サイト内リンクがビルド時には見逃され、生成 HTML では存在しないページを指す。
- 大量更新に明確なロールバック点がない。

CI/CD の価値は「自動デプロイ」だけではありません。公開ゲートとして、毎回の公開前に、この変更が最低限の品質基準を満たすことを自動で証明するべきです。

## 静的サイト公開パイプラインの四段階

安定した静的サイトのパイプラインは、次の段階に分けられます。

| 段階 | 目的 | 典型的なコマンドまたは動作 |
| --- | --- | --- |
| Install | 決定的な依存環境を復元する | `npm ci` またはロックファイル install |
| Check | 型、content schema、lint を確認する | `npm run check` |
| Build | 本番 HTML とアセットを生成する | `npm run build` |
| Verify | 生成物、リソース、ページ動作を確認する | Playwright、アセットスキャン、リンクチェック |
| Deploy | 生成物をアップロードし公開版へ切り替える | Pages artifact、Cloudflare Pages、Netlify |

多くのプロジェクトには Build と Deploy だけがあります。最も省かれがちで、最も価値があるのは Verify です。

## GitHub Actions の基本形

GitHub Pages を例にすると、簡略化した workflow は次のようになります。

```yaml
name: Deploy site

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run check
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/
```

これは出発点です。コンテンツサイトでは、コンテンツアセット検証、ページパス検証、必要な UI smoke test を追加したいところです。

## 品質ゲート：コードだけを検証しない

![CI/CD 品質ゲートの概念図](/images/engineering/cloud-infra-02/cicd-quality-gates.png)

コンテンツサイトの品質ゲートは、少なくとも五種類の問題を扱うべきです。

| ゲート | チェック内容 | 重要な理由 |
| --- | --- | --- |
| Schema gate | frontmatter 型、必須項目、列挙値 | メタデータの壊れを防ぐ |
| Asset gate | `coverImage`、本文画像、音声、deck の存在 | 空画像や欠落リソースを防ぐ |
| Locale gate | 中日 sibling、言語パス、言語別カバー | 片方の言語だけの更新を防ぐ |
| Build gate | Astro build、base path、静的 HTML 生成 | テンプレートとパス問題を防ぐ |
| UI gate | 重点ページの表示、画像、ナビゲーション | build 成功だがページが壊れる問題を防ぐ |

コードテストは、コンポーネントのロジックに大きな問題がないことを示します。コンテンツテストは、読者に届く公開物が揃っていることを示します。

## Pages サブパス：見落としやすい差分

![ローカルルートとデプロイサブパスのアセット解決差](/images/engineering/cloud-infra-02/pages-basepath-asset-resolution.png)

GitHub Pages のよくある公開パスは次の形です。

```txt
https://<user>.github.io/<repo>/
```

つまり production はドメインルート `/` ではなく、`/<repo>/` のサブパスにある場合があります。

ローカルプレビューで成功するリソースパス：

```html
<img src="/images/cover.png">
```

これはフレームワーク設定によって、デプロイ後に base path を正しく処理する必要があります。設定がずれると「ローカルでは問題ないが、本番で画像がすべて壊れる」という状態になります。

確認順序です。

1. フレームワーク設定で production base が設定されているか見る。
2. production 環境変数で build を実行する。
3. 生成 HTML の画像、CSS、JS パスを確認する。
4. ローカルでサブパスとしてプレビューするか、UI テストでアクセスする。
5. サイト内リンク、言語切替、静的アセットが解決できることを確認する。

コンテンツサイトでは、この手順は自動化する価値があります。

## 生成物検証：source ではなく dist を見る

多くのエラーは source だけでは分かりません。読者に届くのは `dist/` の HTML、CSS、JS、画像参照です。

build 後に確認できることです。

- `dist/**/*.html` を走査し、`img[src]`、`script[src]`、`link[href]` を抽出する。
- サイト内パスについて、対象ファイルの存在を確認する。
- 言語ページで canonical、alternate、ナビゲーションリンクを確認する。
- 重点トピックで新しいカバーと本文画像が入っているか確認する。
- デプロイサブパスで base が失われないか確認する。

これは「数ページを手で開く」より継続しやすいです。手動プレビューは視覚問題を見つけるのに向き、生成物検証は低レベルのパスエラーを防ぐのに向きます。

## Preview、Staging、Production の選び方

小さなコンテンツサイトに複雑な環境は不要かもしれません。しかし preview と production は分けたいところです。

| 環境 | 触発 | 用途 |
| --- | --- | --- |
| Preview | Pull Request または branch push | ページ確認、視覚 review、内容校正 |
| Staging | 任意、統合 branch | 複数人作業、大改修前の確認 |
| Production | main branch または release | 公開読者向け |

一人運用のプロジェクトでも、Preview + Production から始められます。重要なのは、未検証の大量変更をそのまま公開しないことです。

## ロールバック：静的サイトにも撤回手段が必要

静的サイトは「ロールバック不要」と思われがちです。しかし内容エラーも信頼を損ないます。

最低限のロールバック戦略です。

- 公開可能な変更は git commit にする。
- 大量の内容変更は小さな batch に分ける。
- デプロイプラットフォームは過去 deploy を保持する。
- 公開後の検証記録を残す。
- 問題発見時は production で直接修正せず、対応 commit を revert する。

大量のコンテンツ移行では特に batch が重要です。50 本の記事カバーを一度に変えると、問題が出たとき原因の種類を切り分けにくくなります。

## 可観測性：CI 失敗は行動可能にする

良い CI 失敗は「失敗した」とだけ言いません。次の情報を出します。

- どのファイルが失敗したか。
- どのフィールドまたはアセットが失敗したか。
- 期待値は何か。
- 実際値は何か。
- ローカルでどう再現するか。

例です。

```txt
engineering/app-dev-01.ja.md references missing image /images/engineering/app-dev-01/cover.png
```

次のような情報よりずっと有用です。

```txt
Asset test failed
```

コンテンツサイトの CI 失敗は、作者自身が直すことが多いです。エラーが具体的であるほど、保守コストが下がります。

## ケース：画像パス事故

ある多言語コンテンツサイトが、初期記事の SVG カバーを PNG に置き換えました。開発者はローカルでページを開き、画像が見えたため公開しました。

公開後、日本語ページで二つの問題が見つかりました。

1. いくつかの記事が旧 SVG を参照し続けていた。
2. いくつかの本文画像パスが GitHub Pages サブパスで解決できなかった。

根本原因は画像生成ではなく、公開ゲートの不足でした。

- 重点記事が旧ベクター画像を参照していないかチェックしていない。
- 日本語 sibling の画像パスを確認していない。
- production base で build していない。
- 生成 HTML のリソース参照をスキャンしていない。

修正後のゲートです。

1. コンテンツテストで重点記事の body image に SVG を禁止する。
2. frontmatter のローカルアセット存在を必須にする。
3. build 後に HTML を走査し、ローカルアセット解決を確認する。
4. production の repo 名環境変数で build し、Pages サブパスを模擬する。

これにより、同じ種類の問題は CI で先に見つかります。

## よくあるアンチパターン

**アンチパターン 1：build 成功をページ正常とみなす。**

build 成功は、フレームワークがファイルを生成したことを示すだけです。画像、リンク、言語同期までは保証しません。

**アンチパターン 2：ローカルルートだけでプレビューする。**

サブパスや CDN へ出ると、アセット解決が変わることがあります。production path を模擬します。

**アンチパターン 3：CI 失敗を面倒と考える。**

CI は公開前の低コストな防線です。失敗情報が具体的なら、公開後の修正より安く済みます。

**アンチパターン 4：大量の内容変更を一つの commit にする。**

batch が大きいほど、ロールバックがつらくなります。コンテンツ移行も主題やディレクトリごとに分けます。

**アンチパターン 5：検証コマンドを記録しない。**

チームメンバーが検証を再現できなければ、公開判断を信頼できません。

## テンプレート：静的サイト公開ゲート

```md
## Release Scope

今回の公開に含むもの：

含まないもの：

## Required Checks

- [ ] 依存関係は lockfile で install
- [ ] content schema チェック通過
- [ ] production base path build 通過
- [ ] ローカルアセット参照が存在
- [ ] 多言語 sibling が揃っている
- [ ] 重点ページ UI smoke test 通過
- [ ] 生成 HTML のアセットスキャン通過

## Deployment

プラットフォーム：
触発 branch：
build command：
output directory：
production base：

## Rollback

ロールバック方法：
直近の利用可能 commit：
直近の利用可能 deploy：

## Evidence

チェックコマンド：
チェック結果：
残リスク：
```

## チェックリスト

- CI は check の後に build しているか？
- production base path で build しているか？
- 生成 HTML のリソース参照をスキャンしているか？
- 中日 sibling を確認しているか？
- 重点記事が旧 SVG を参照し続けないようにしているか？
- preview 環境で人間が校正できるか？
- commit または deploy で素早くロールバックできるか？

## さらに読む

- [App Dev：Astro ページと Content Collections](../app-dev-01/)：Content Collections、Schema、ルーティングが公開前制約をどう作るかを理解する。
- [AI Coding Tools](../../start/ai-basics-for-everyone/ai-coding-tools/)：AI ツールで CI 失敗調査と大量コンテンツ保守を支援する。
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)：GitHub Pages のカスタムデプロイ workflow。
