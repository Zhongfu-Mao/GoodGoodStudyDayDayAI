---
title: "AIレーダー日報：2026-08-26"
date: 2026-08-26
category: radar
cadence: daily
plainSummary: "今日の主線：AI systemはmodel capability競争から検証可能なend-to-end engineeringへ移り、deployment environment、permission、evaluation、recoverable recordが実価値を共同で決め始めた。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agents
  - Evaluation
  - GitHub
  - AI Infrastructure
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-08-26.ja-infographic.webp
representativeImageSource: https://blog.dailydoseofds.com/p/build-a-multi-agent-gtm-intelligence
audioUrl: /audio/radar/daily-ai-radar-2026-08-26.ja.mp3
audioDuration: 1244
audioSize: 9955349
draft: false
---

対象期間：2026-08-20〜2026-08-26（JST）。今日のsignalは同じ転換点へ集まる。modelがcode生成、tool利用、multi-step taskをこなせるようになると、system valueは一つのanswerではなく、data completeness、reasoning state isolation、on-device viability、permission control、execution recoveryによって決まる。

---

---
![Build a Multi-Agent GTM Intelligence System](https://substackcdn.com/image/fetch/$s_!RdwG!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fae2c6681-e73e-4d58-8e0a-7f7ba4260938_1456x933.png)

*代表画像は [Build a Multi-Agent GTM Intelligence System](https://blog.dailydoseofds.com/p/build-a-multi-agent-gtm-intelligence) から。本文で明示的に指定した代表シグナルとして掲載しています。*
## 1. AI Engineering & アーキテクチャ

### 3-agent GTM pipelineは「news search」をcomplete record間のjoinへ変える

- 出典：Daily Dose of Data Science
- 日付：2026-08-26
- リンク：https://blog.dailydoseofds.com/p/build-a-multi-agent-gtm-intelligence
- 要約：tutorialはCrewAI、OpenRouter、Seltz MCPでSignal Hunter、People Enricher、Outreach Strategistを順番に実行する。企業の採用、funding、product triggerを探し、関連人物のcareer recordを補完し、contact rankingとpersonalized openingへmergeする。重要なのはagent数ではなく、retrievalがcomplete structured recordを一度に返し、第3段がsearch snippetから関係を推測せずtraceable joinを行える点だ。最上位executiveや未知企業のdiscoveryはopen web、known target後のdepthはvertical indexという境界も残す。

### encrypted reasoning blockのcross-account/model replayがhidden traceとsession secretを露出させる

- 出典：ByteByteGo
- 日付：2026-08-26
- リンク：https://blog.bytebytego.com/p/how-to-steal-an-ai-models-private
- 要約：MATS Research、ELLIS Tübingen、Max PlanckのteamはAnthropic、OpenAI、Googleがclientへ返すencrypted reasoning blockを調べ、一部を同じmodel familyの安価なmodelへreplayするとhidden reasoningをplaintextで出力できると報告した。traceにはtool raw output、user data、repository credentialが含まれ得る。研究者のbehavioral inferenceではauthenticated fieldがblockをaccountやconversationへbindingしておらず、cross-session、cross-user、cross-model compatibilityがattack surfaceになる。ciphertextをtenant、conversation、purposeへbindingし、公開session logをsensitive assetとして扱う必要がある。

## 2. モデル最前線 & アルゴリズム探索

### Jalapeñoは同一inference architectureでthroughput、power、interactive latencyを同時に改善する

- 出典：OpenAI
- 日付：2026-08-25
- リンク：https://openai.com/index/jalapeno-first-results
- 要約：OpenAIは初のcustom inference chip Jalapeñoについて、GPT-OSS 120B、DeepSeek R1 670B、Kimi K2.5 1Tでpeak throughput時のwork per wattが1.5〜1.9倍、end-to-end latencyが1.7〜3.6倍低下し、highly interactive workloadではperformanceが2.1〜4.1倍になったと報告した。compute、memory、network、KV cache placementを共同設計し、prefillのcompute bottleneckとdecodeのbandwidth bottleneckへ資源を割り当てる。自社測定なので独立再検証は必要だが、agent inferenceの単位がchip peakからuser latency constraint下のsystem-level useful workへ移ることを示す。

### GLM-5.3はscalingの主軸をparameter countからlong-horizon environmentとverifierへ移す

- 出典：Latent.Space / AINews
- 日付：2026-08-20
- リンク：https://www.latent.space/p/ainews-death-of-params-zai-ceo-jie
- 要約：Z.ai CEOのJie Tangはparameter countをdata、inference compute、runtime condition、sparsityと合わせて見るべきだと論じる。GLM-5.3はGLM-5.2のcore base model/architectureを維持し、主に約1か月の追加RLで向上した。training taskは数日分のengineering/researchを表すexecutable environmentを扱い、research agentがlong dependencyとhidden stateを合成し、judge agentがsolvabilityを確認する。verifierはoracle、no-op、unsolved-state testを通って初めてbinary rewardを返す。post-training scalingのbottleneckはmodel sizeからenvironment realism、shortcut-resistant reward、20 step超のcausal chain verificationへ移る。

## 3. 実践コード & ツールライブラリ

### Pipetteはon-device model比較をmodel nameからcomplete deployment configurationへ移す

- 出典：The Rundown AI発見 · Liquid AI
- 日付：2026-08-24
- リンク：https://www.liquid.ai/blog/pipette-on-device-ai-benchmarking-by-liquid-ai
- 要約：Liquid AIとArtificial Analysisのopen-source Pipetteは、30超のmodelと1,000超のmodel × quantization × runtime × device × context構成を扱い、macOS、iOS、Windows、Android clientでthroughput、latency、memory、context scalingを測る。同じ350M modelでもGalaxy S26 Ultraで256から4,096 tokensへ伸ばすとdecode throughput保持率が78.4%と33.8%に分かれ、speed、quality、memoryもPareto trade-offになる。edge selectionはserver上のfull-precision benchmarkではなく、実機configurationで再現すべきだ。

### Admin pluginはworkspace analysisとpermission-aware actionを一つのconversationに置く

- 出典：OpenAI
- 日付：2026-08-25
- リンク：https://openai.com/index/introducing-admin-plugin
- 要約：ChatGPT WorkとCodexのAdmin pluginはadoption、credit usage、member、group、effective permissionを読み、member change、access adjustment、limit approval、recurring checkをsupported actionとして実行する。caller permissionを広げず、natural-language requestを既存Admin Consoleのread/write actionへmappingし、structured resultとchange confirmationを返す。OpenAIは社内Slack workflowが約45%のIT ticket volumeを処理したと報告する。scale valueはquestion、evidence、authorized action、verified resultのloopにあり、high-impact actionのapproval、least privilege、auditable receiptがcontrol pointになる。

## 4. 業界 & ビジネス速報

### Las VegasはRobotaxi licenseを一度に7,000件承認したが、quotaは実車fleetではない

- 出典：老范讲故事
- 日付：2026-08-26
- リンク：https://lukefan.com/2026/08/26/las-vegas-robotaxi-7000-licenses/
- 要約：Nevadaのtransportation authorityはTesla、Waymo、Uber系operatorへ合計7,000件のRobotaxi licenseを承認した。現地のtraditional taxi license 3,530件の約2倍だ。Teslaは5,000件を得たが、hearingでは1年以内に約2,500台をdeployできれば十分との見通しを示した。3 routeは自社vehicleとservice、multi-sensor autonomous fleet、Uberがorder gatewayだけを持ちMotionalとZooxを接続する形に分かれる。license ceilingとoperational supplyの間にはmaintenance、charging、insurance、inspection、incident response、driver conflictがある。

### Thomson Reutersは4,000万ドルを投じ、proprietary corpusのcompound valueへ賭ける

- 出典：The Rundown AI発見 · Thomson Reuters
- 日付：2026-08-25
- リンク：https://www.thomsonreuters.com/en-us/posts/innovation/how-we-built-thomson/
- 要約：Thomson ReutersはQwen open weightsと数十年分のlegal、tax、news contentから初の自社modelをtrainingし、2年間で約4,000万ドル、直近training runで約45万ドルを投じた。利用したdataはcontent libraryの10%未満で、researcher向けopen-weight versionも計画する。internal benchmarkでは一部taskでClaude Opus 4.8、Gemini 3.1 Pro、GPT-5.5を上回るとするが、external replicationはまだない。deep proprietary corpusを持つorganizationのbuild-vs-buy判断はAPI priceからknowledge reuse、controlled update、eval ownership、long-term bargaining powerへ広がる。

## 5. GitHub 人気 repo & トレンド追跡

### Marinはfoundation modelの成功と失敗をすべてopen development recordへ残す

- 出典：GitHub Trending · Marin Community
- 日付：2026-08-26
- リンク：https://github.com/marin-community/marin
- 要約：Marinはdata curation、filtering、tokenization、pretraining、post-training、evaluationを扱い、raw dataからfinal modelまでのprocess、decision、failed experimentを公開する。現在は500B+ total parameters、約5e24 model-FLOPsのMoEをfrom scratchでtrainingし、Delphi scaling suiteでは3e18〜1e23 FLOPsのsmall runからlarger modelを予測する。checkpoint、deterministic data-mixture pipeline、recipe code、plot-ready dataも提供し、当日約231 stars増。open model infrastructureはweightsだけでなくtraining recipe、experiment lineage、negative resultをreproduce/audit可能にする必要がある。

### Claude community marketplaceはplugin distributionをsecurity scanとapproval pipelineへ接続する

- 出典：GitHub Trending · Anthropic
- 日付：2026-08-26
- リンク：https://github.com/anthropics/claude-plugins-community
- 要約：このrepositoryはClaude CoworkとClaude Code向けcommunity plugin marketplaceのread-only mirrorで、`marketplace.json`をAnthropicのinternal review pipelineからnightly syncする。pluginはsubmission portal、automated security scan、distribution approvalを通り、direct PRは自動closeされる。当日約351 stars増。plugin governanceの単位を「install可能なGit repo」からscan、review、traceable syncを備えたdirectoryへ変えるが、scan passはzero riskではなく、tool permission、external service、data transmission、update trust chainの確認は利用者側に残る。

## 📬 Newsletter 精選

### 企業はpublic benchmarkをproduction answerにせず、real jobからevalを作る必要がある

- 出典：Every
- 日付：2026-08-25
- リンク：https://every.to/context-window/benchmarks-don-t-know-your-job
- 要約：Everyは、企業がmodel spendとpublic benchmark scoreを把握していても、employee timeを本当に節約したか、outputを再確認せず信頼できるかは分からないと指摘する。real workからtask、quality bar、許容するhuman review、failure costを抽出してorganization-specific evalを作るべきだ。記事はeditor-in-chief cloneの内部実験と、家庭のsolar powerを判断する6-agent crewを例に、「leaderboard win」はjob-level success rate、trust cost、time recoveryの代わりにならないと示す。評価対象はmodel、tool、data、human processを含むsystem全体になる。

### World modelはvideo gameのaction feedbackをrobotと3D environmentへ移す

- 出典：AI Valley
- 日付：2026-08-26
- リンク：https://www.theaivalley.com/p/nvidia-is-sending-ai-chips-to-space
- 要約：AI Valleyはphysical AIのtechnologyとfunding signalを整理した。General Intuitionは数百万時間のgameplayとactionからworld modelをtrainingし、robot dog、droneなどへfine-tuneする。Google DeepMindのSIMA 2ではGeminiがreasoningとgoal、SIMAが3D worldでのexecutionを担う。World Labs、AMI Labs、Physical Intelligence、Wayveなどのrecent fundingは合計数十億ドル規模だ。難題はrobotにcupを認識させることではなく、action後のstate changeを予測し、real environmentでhallucination、latency、failure recoveryを制約することにある。
