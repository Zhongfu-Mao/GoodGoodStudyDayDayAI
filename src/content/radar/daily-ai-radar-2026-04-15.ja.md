---
title: "AI レーダー日報：2026-04-15"
date: 2026-04-15
category: radar
cadence: daily
plainSummary: "AI レーダー日報：2026-04-15では、主要ニュースをモデル、Agent、開発ツール、AIインフラの観点で短時間に追えるよう整理します。"
difficulty: intermediate
tags:
  - Agent
  - OpenClaw
  - Opus
  - Claude
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-04-15.ja-infographic.png
draft: false
---
## 対象範囲

- 対象期間: 2026-04-12〜2026-04-15（過去 72 時間）


---
![Figma 设计到代码流程图](https://substackcdn.com/image/fetch/$s_!Us9U!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff53dd546-d966-4485-bfe9-5d410d319a3c_1712x2048.png)

*代表画像は [Figma: Design to Code, Code to Design](https://blog.bytebytego.com/p/figma-design-to-code-code-to-design) から引用。この日は design-to-code、記憶システム、製品ワークフローを同時に見ていたので、「設計と実行のループ」を最もよく表す図を置いた。*

## 1. 🛠️ AI Engineering & アーキテクチャ

### Build Agents That Never Forget
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/build-agents-that-never-forget-98a

永続記憶を備えた Agent を第一原理から設計し直す記事で、短期記憶、長期記憶、外部ストレージの実装パターンが、オープンソースのコード例と一緒に整理されている。特に重要なのは、記憶を単なる UX 的な「会話履歴の延長」ではなく、**本番 Agent の能力基盤** として扱っている点で、すぐ使える memory module も提示されている。

### Notion's Token Town: 5 Rebuilds, 100+ Tools, MCP vs CLIs and the Software Factory Future
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/notion

Notion の共同創業者 Simon Last と AI 責任者 Sarah Sachs が、Notion AI の 5 回にわたる再構築を詳しく振り返っている。MCP と CLI ツールチェーンの使い分け、100 を超えるツール群をどう束ねるか、そして「Software Factory」的な未来に向けて、agent の作業空間をどう再設計したかがかなり生々しく語られている。大規模プロダクトが agent 工学をどう内製しているかを知るうえで、いま最も濃い一次記録の一つだ。

### Figma Design to Code, Code to Design: Clearly Explained
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/figma-design-to-code-code-to-design

Figma のデザインをコードに落とし、さらにコード側の変更をデザインへ戻すまでのワークフローを整理した解説。従来方式がどこで破綻していたのか、MCP がツール間の文脈受け渡しをどう改善するのか、そして残された工程上の難所は何かまで押さえている。AI 支援のフロントエンド開発に関心があるなら必読。

### How LinkedIn Feed Uses LLMs to Serve 1.3 Billion Users
**出典：** ByteByteGo  
**リンク：** https://blog.bytebytego.com/p/how-linkedin-feed-uses-llms-to-serve

LinkedIn の feed 再構築を、13 億ユーザー規模で LLM を使う前提で分解した記事。ランキングへの組み込み方、遅延制御、A/B テスト、モデル改善ループまでが出てきており、LLM を大規模本番システムへ入れるときに何が難しくなるかが分かる。

### [AINews] Humanity's Last Gasp
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/ainews-humanitys-last-gasp

比較的静かなニュース日だったぶん、この号は「AI 時代に人間の仕事とは何か」を前面に押し出している。置き換えと強化の両パターンを並べながら、AI 工程のなかで人間が担う役割がどう縮み、どこへ移っていくのかを考えさせる内容だ。

## 2. 🧠 モデル動向 & アルゴリズム

### The Anatomy of Diffusion LLMs
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/the-anatomy-of-diffusion-llms

Diffusion LLM をゼロから説明する deep dive。自己回帰モデルとの本質的な違い、離散 token 空間へ拡散をどう適用するか、MDLM のような既存モデルがどう実装されているかまで踏み込んでいる。中国語圏ではまだ体系的な整理が少ない領域で、いま保存しておく価値の高い入門兼技術資料になっている。

### [AINews] Top Local Models List — April 2026
**出典：** Latent Space  
**リンク：** https://www.latent.space/p/ainews-top-local-models-list-april

2026 年 4 月時点のローカル実行モデル横断比較。推論、コード、多模態といった用途別に、いま実用的な開重みモデルが何かを整理し、必要なハードウェア要件も添えている。自前インフラやオンプレ基盤を組むチームには直接役立つ。

### Meta Superintelligence Labs Ships Its First Model
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/meta-superintelligence-labs-ships-its-first-model

Meta の Superintelligence Labs が最初のモデルを正式に出したという報道。MSL は高額報酬で急速に組成された先端研究チームであり、その最初の出力が出たこと自体が、Meta の AGI 路線が単なる看板ではなく実稼働に入ったことを意味する。性能詳細やベンチマークは継続観察が必要。

### Anthropic's New AI Is Too Powerful for the World
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/anthropic-new-ai-is-too-powerful-for-the-world

Claude Mythos とみられる次世代 Anthropic モデルについての報道。前世代を大きく超える能力を持ちながら、安全上の理由で段階的公開や利用制限が議論されている。老范の Mythos 解説とあわせて読むと、能力競争と公開哲学のズレがよりはっきり見える。

## 3. 💻 実装コード & ツール

### 10 Must-use Slash Commands in Claude Code
**出典：** Daily Dose of Data Science  
**リンク：** https://blog.dailydoseofds.com/p/10-must-use-slash-commands-in-claude

Claude Code における 10 個の高頻度 Slash Command を、実際の使用シーンと prompt パターン込みで整理した記事。coding agent の効率はモデル性能だけでなく、**どんな command surface を持っているか** に左右されることがよく分かる。

### Hermes Agent は OpenClaw の代替になれるのか
**出典：** 老范讲故事  
**リンク：** https://lukefan.com/2026/04/12/hermes-agent-vs-openclaw-lightweight-self-evolving-ai-comparison/

軽量な自己進化型 agent framework として、Hermes Agent と OpenClaw を実測比較した記事。タスク成功率、文脈管理、ツール呼び出し安定性などの観点で、それぞれの強みと弱みを主観評価している。agent framework を選定中の人には実地感のある材料になる。

## 4. 📰 業界 & ビジネス

### 中国 AI 悲観論と対米追走の実像
**出典：** 老范讲故事  
**リンク：** https://lukefan.com/2026/04/13/china-ai-doomism-us-gap-chip-talent-catchup/

「中国の AI は米国に永遠に追いつけない」という極端な論調を、チップ供給網、人材、オープンソース生態の三本柱で分解した長文。結論は市場感情よりずっと冷静で、ギャップはあるが、追い上げ余地もかなり残っているというものだ。

### XChat は本当に「アメリカ版 WeChat」になれるのか
**出典：** 老范讲故事  
**リンク：** https://lukefan.com/2026/04/14/xchat-american-wechat-dm-to-im-social-network-effects/

XChat を「米国版 WeChat」にできるかを、DM から IM への進化、ネットワーク効果、決済やミニアプリまで含めて検討した分析。Musk が描くスーパーアプリ戦略の障害がかなり具体的に整理されている。

### What Happens When AI Runs a Retail Store
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/what-happens-when-ai-runs-a-retail-store

AI が小売店舗を丸ごと運営した実験を扱う記事。仕入れ、価格設定、接客を AI に任せたとき、何が予想以上にうまくいき、何が破綻したのかを見ている。従来産業に対する AI の実効的な影響時期を読むうえで面白い。

### Perplexity's Agent Pivot Is on the Money
**出典：** The Rundown AI  
**リンク：** https://www.therundown.ai/p/perplexity-agent-pivot-is-on-the-money

Perplexity が検索から Agent プラットフォームへ重心を移していることを、収益化観点から支持する内容。検索だけでは頭打ちになりやすいが、実行レイヤーに入ると monetization の幅が広がるという見立てだ。

### Quark クラウドの海外ドラマ共有リンクが一斉失効
**出典：** 老范讲故事  
**リンク：** https://lukefan.com/2026/04/15/quark-cloud-drive-overseas-tv-link-crackdown-2026/

中国国内で、夸克などのクラウドドライブ経由で共有されていた海外ドラマのリンクが一斉に失効した件の背景解説。著作権取締りとプラットフォーム側の合規圧力が交差している。

### GPT-5.4-Cyber: OpenAI が防御型サイバーセキュリティモデルをより開放的に提供
**出典：** AI Valley  
**リンク：** https://openai.com/index/scaling-trusted-access-for-cyber-defense/

AI Valley は GPT-5.4-Cyber を、Anthropic Mythos / Glasswing 路線への OpenAI 側からの対抗シグナルとして読んでいる。同じく高リスクなサイバー能力を扱いながら、Anthropic が極小範囲の門管理路線を取るのに対し、OpenAI は本人確認と管理付きでアクセス範囲を広げる方向を見せている。頭部研究所のあいだで、公開哲学の違いがはっきり出始めた。

### Google Desktop Agent: Gemini がチャットから実行レイヤーへ移る
**出典：** AI Valley  
**リンク：** https://www.testingcatalog.com/google-develops-its-own-desktop-agent-to-compete-with-cowork/

Gemini に Agent タブ、タスク受信箱、human review スイッチを備えた desktop agent workspace を Google が準備しているという報道。Newsletter、Drive、Calendar、Web をまたぐ複数ステップ実行を単一目標で進める設計で、単なる chat UI から「仕事を実行する層」へ寄っていることが分かる。

### Anthropic は Claude を「設計とプロダクト生成」のワークフローへ拡張中
**出典：** AI Valley  
**リンク：** https://www.theinformation.com/briefings/exclusive-anthropic-preps-opus-4-7-model-ai-design-tool

Anthropic は Opus 4.7 だけでなく、Web サイト、プレゼンテーション、製品プロトタイプを生成する AI デザインツールも準備しているという。Claude の射程が「対話 + コーディング」から「設計と納品」まで広がっているサインとして重要だ。
