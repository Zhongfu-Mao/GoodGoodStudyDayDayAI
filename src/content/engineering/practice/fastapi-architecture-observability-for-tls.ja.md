---
title: "FastAPI アーキテクチャと可観測性の意思決定ガイド：テックリードとアーキテクトのための本番参考"
date: 2026-05-13
category: engineering
description: "FastAPI を本番サービスとして採用するための判断基準、modular monolith、サービス分割、非同期境界、データ層、キュー、API ガバナンス、セキュリティ、OpenTelemetry、SLO、コスト、移行計画を整理する。"
difficulty: advanced
plainSummary: "FastAPI の価値は速度だけではなく、Python エコシステム、型、OpenAPI、依存性注入、非同期 I/O、uv、OpenTelemetry を、届けられて運用できるサービス境界にまとめることにあります。"
tags:
  - "FastAPI"
  - "Python"
  - "Observability"
lang: ja
coverImage: "/images/engineering/practice/fastapi-cloud-architecture-cover.png"
draft: false
---

# FastAPI アーキテクチャと可観測性の意思決定ガイド：テックリードとアーキテクトのための本番参考

> 鮮度メモ：この記事は 2026-05-13 時点で確認しています。FastAPI、Pydantic、uv、OpenTelemetry SDK、クラウドの実行環境、モデルサービスのエコシステムは変わるため、本番導入前には公式ドキュメントと利用中の SDK version を確認してください。

FastAPI は高速な Python Web framework として語られがちですが、テックリードやアーキテクトにとって重要なのは、速度そのものよりもガバナンスです。
Python に散らばっている model SDK、data tool、vector database client、background job、automation script を、型、契約、観測、デプロイ境界を持つ HTTP service にまとめられるかが本質です。
単なる `@app.get` の書き方として見ると過小評価になりますし、あらゆる問題に効く万能薬として扱うと判断を誤ります。

![FastAPI の observability architecture 図](/images/engineering/practice/fastapi-observability-architecture-visual.png)

![FastAPI service boundary と分割シグナルを示す図](/images/engineering/practice/fastapi-service-boundaries-visual.png)

## 0. この記事の位置づけ

この記事は、テックリード、アーキテクト、platform engineer 向けの公開リファレンスです。

FastAPI の文法入門ではなく、実運用に入る service としてどう判断し、どう設計し、どう育てるかを扱います。

技術選定レビュー、service template、platform standard、移行計画のたたき台として使えます。

一回限りの script を作るだけなら、ここまでの統制は必要ありません。

## 1. 結論

FastAPI の価値は、単体の性能ではなく、Python ecosystem、type contract、OpenAPI、async I/O、dependency injection、observability を一つの届けられる service boundary にまとめる点にあります。

AI backend、data API、internal platform、Agent runtime、model tool service では、現実的な標準候補になります。

ただし万能ではありません。

CPU bound な処理、極端な low latency system、強い domain object modeling、重い admin workflow では、別の framework や専用 runtime が向くことがあります。

採用するなら、まず modular monolith を作り、観測データに基づいて service を分割します。

network boundary は code boundary より遅く切るべきです。

OpenTelemetry は初日から入れますが、automatic HTTP span だけで満足しないことが重要です。

## 2. 判断基準

framework の比較ではなく、組織と product の制約に対して判断します。

RFC や ADR では、次のような観点を明示すると議論が安定します。

### 2.1 評価表

| 基準 | 問い |
| --- | --- |
| デリバリー速度 | 一、二週間で test 可能な API を届け、frontend、SDK、automation consumer に契約を渡せるか。 |
| 契約の明確さ | request、response、error、pagination、auth、versioning を OpenAPI と type model で安定して表現できるか。 |
| エコシステム適合 | model SDK、vector DB、evaluation tool、data library、既存 Python asset を再利用できるか。 |
| 実行時の性質 | service が I/O orchestration 中心なのか、CPU / GPU 計算中心なのか。 |
| チームスキル | Python type、async boundary、dependency management、container build を継続運用できるか。 |
| 統制コスト | error format、audit log、trace id、SLO、tenant isolation、template 化が必要か。 |
| 進化余地 | 単体を module 化し、将来 worker、model gateway、ingestion service に分けられるか。 |
| サプライチェーン | lockfile、image scan、SBOM、vulnerability fix、runtime upgrade の owner がいるか。 |

### 2.2 早見判断

- I/O orchestration、AI call、data API、internal platform が中心なら、FastAPI は候補に入ります。
- CPU bound な計算が中心なら、FastAPI は control plane として使い、計算は worker、GPU service、batch system に逃がします。
- admin、form、permission、ORM workflow が中心なら Django が楽な場合があります。
- 組織の主力が TypeScript で、AI / data 連携が薄いなら NestJS や Express のほうが低コストなこともあります。

## 3. 代替案マトリクス

| 選択肢 | 向く場面 | 強み | 主な代償 |
| --- | --- | --- | --- |
| FastAPI | AI API、data API、tool service、internal platform、Agent control plane | Python ecosystem と近く、OpenAPI に強く、開発が速い | async、dependency、model cost、Python runtime の統制が必要 |
| Django | admin、権限、ORM、管理画面が中心の product | 成熟しており内蔵機能が多い | 軽量 API や async orchestration では重い場合がある |
| Flask | 小さな service、legacy Python API、薄い control plane | 単純で柔軟 | contract、type、async、governance は自前になりやすい |
| Express | Node.js team、BFF、frontend 寄り組織 | ecosystem が大きく deploy しやすい | type と OpenAPI governance は追加設計が必要 |
| NestJS | 大きな TypeScript backend、enterprise module | 構造と DI が強い | AI / data の Python ecosystem とは橋渡しが必要 |
| Go | 高並行 infrastructure、低 resource service | 性能と deploy が安定 | AI / data ecosystem との距離がある |
| Rust | 安全重要、極限性能、low latency | memory safety と性能が強い | 学習曲線と delivery cost が高い |
| Serverless functions | event-driven、短い task、低運用 API | 必要な時だけ scale する | cold start、長時間 task、local parity、observability に注意 |

## 4. 推奨スタート：modular monolith

本番 service は、最初から十数個の service に分ける必要はありません。

まず code boundary を明確にし、deployment boundary は単純に保つ modular monolith が安全です。

これにより、契約、data model、observability、release、cost を検証してから、本当に必要な runtime boundary を切れます。

## 5. ディレクトリ構成例

構成の目的は見た目ではなく、ownership、test boundary、将来の分割点を見えるようにすることです。

```text
app/
  main.py
  api/
    v1/
      agents.py
      documents.py
      users.py
  domains/
    agents/
      service.py
      models.py
      policies.py
      events.py
    documents/
      ingestion.py
      retrieval.py
      models.py
  infrastructure/
    db.py
    cache.py
    object_store.py
    telemetry.py
    queues.py
    model_clients.py
  platform/
    config.py
    errors.py
    auth.py
    pagination.py
    idempotency.py
  tests/
    unit/
    contract/
    integration/
```

## 6. code boundary と service boundary

code boundary は早めに切ってよいですが、network boundary は遅く切るほうが安全です。

早い module 化は理解を助けますが、早すぎる service 分割は deploy、auth、retry、timeout、versioning、data consistency、local development の負担を増やします。

## 7. service 分割のシグナル

folder 数ではなく、runtime pressure、data ownership、security boundary、team ownership で判断します。

| シグナル | 現象 | 推奨 |
| --- | --- | --- |
| latency curve が違う | API p95 は安定しているが、embedding、file parsing、model call が container 全体を遅くする。 | 重い task を worker または独立 service へ出す。 |
| scaling curve が違う | HTTP API は常時 scale、background task は batch window だけ spike する。 | API と worker を別 deploy / autoscale にする。 |
| failure isolation が違う | model provider の障害で core read/write API を落としたくない。 | model gateway、circuit breaker、degradation、queue buffer を入れる。 |
| security boundary が違う | admin、tenant、public API の権限と audit 要件が大きく異なる。 | admin service、tenant control、policy service を検討する。 |
| data ownership が違う | domain が独自 data model、migration cadence、team responsibility を持つ。 | interface を先に定義してから service 分割する。 |
| release frequency が違う | experimental Agent は毎日変わり、account service は月一回しか変えない。 | 高変更 domain を安定 core から外す。 |
| compliance が違う | 一部 data に独立暗号化、audit、retention、region 制約がある。 | 専用 service と data store を作る。 |
| cost attribution が違う | 特定 request が大量の token、GPU、third-party API cost を消費する。 | 独立計測、rate limit、budget control を入れる。 |

## 8. 分割理由として弱いもの

- file が増えた。
- router が多い。
- microservice のほうが modern に見える。
- 将来大きくなりそう。
- ある module が読みにくい。
- test が遅いが、原因分析はまだしていない。

## 9. 非同期境界

FastAPI は async を扱えますが、すべてを async にすべきという意味ではありません。

async の価値は I/O wait を解放することです。event loop 上で CPU bound な処理を走らせると、むしろ throughput は落ちます。

| 種類 | 推奨 | 理由 |
| --- | --- | --- |
| database | 成熟した async driver、または明示的な thread pool boundary | event loop blocking を避ける |
| HTTP client | timeout、retry、circuit breaker を統一 | external API が latency の主因になりやすい |
| file processing | 小さい file は同期でもよいが、大きい file は worker | API latency を守る |
| model call | 短い call は同期応答、長い call は task 化 | request hang を避ける |
| CPU 計算 | event loop から出す | throughput collapse を避ける |

## 10. CPU 境界

大きな file parsing、image processing、feature extraction、compression、encryption batch、complex sorting、local model inference は CPU bound になりやすい処理です。

FastAPI は request 受付、permission check、task 作成、status query、result 返却を担当します。

## 11. データ層

Data layer は FastAPI project で最も崩れやすい場所です。

endpoint に HTTP、permission、transaction、SQL、external API、response assembly を全部持たせないようにします。

| 層 | 責務 |
| --- | --- |
| api | HTTP 解析、dependency 呼び出し、response model 返却 |
| domain | business rule、permission decision、transaction use case |
| repository | query と persistence。HTTP semantic は持たない |
| infrastructure | connection pool、client、migration、observability wrapper |

## 12. transaction と整合性

transaction は local database state を中心に考えます。

model、object storage、mail、payment、third-party API を呼ぶ時に、制御できない network をまたいだ長い transaction を作らないことが重要です。

## 13. queue と worker

長時間 task、retry 可能な task、batch task、高コストな external call があるなら、queue は最適化ではなく architecture boundary になります。

| task type | 処理方法 |
| --- | --- |
| 短い read request | 同期 HTTP |
| retry 可能な外部書き込み | queue + idempotency key |
| embedding generation | worker + state table |
| large file parsing | object storage + worker |
| bulk import | task table + progress query |
| scheduled job | scheduler + worker |

## 14. API governance

FastAPI は OpenAPI を生成できますが、API governance は自動化だけでは完結しません。

命名、version、error format、pagination、auth、rate limit、deprecation、SDK generation、compatibility test を管理します。

推奨ルール：

- すべての endpoint が response model を宣言する。
- error response は統一 envelope を使う。
- API version は path または header に置き、deprecation window を明記する。
- OpenAPI diff を PR で確認する。
- public API には contract test を置く。
- pagination、sorting、filtering、idempotency key、rate limit header の命名を統一する。

## 15. 認証と認可

authentication は誰かを確認し、authorization は何ができるかを判断します。

FastAPI dependency は user、tenant、scope、policy の解決に向きますが、複雑な business flow を dependency に隠さないようにします。

## 16. OpenTelemetry の導入戦略

![FastAPI と OpenTelemetry signals の関係を示す図](/images/engineering/practice/fastapi-otel-signals-visual.png)

OpenTelemetry は初日から入れることを推奨します。

automatic instrumentation は HTTP、database、client call の基礎を作ります。manual span は business meaning を与えます。

```python
from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

app = FastAPI(title="Agent API")
tracer = trace.get_tracer(__name__)

FastAPIInstrumentor.instrument_app(app)

@app.post("/agent/runs")
async def create_run(request: AgentRunRequest):
    with tracer.start_as_current_span("agent.create_run") as span:
        span.set_attribute("agent.mode", request.mode)
        span.set_attribute("tenant.id", request.tenant_id)
        return await agent_service.create_run(request)
```

この snippet は、FastAPI の automatic instrumentation と business span の境界を示すための最小例です。production では tracer provider、exporter、sampler、resource 属性、sampling policy、sensitive field filtering も設計します。

## 17. traces

trace は、一つの request が何を通ったかを答えるためのものです。

Agent や AI orchestration service では、planning、tool call、model call、retrieval、persistence、callback を読みやすい span にします。

## 18. metrics

metrics は system 全体が健康かを答えます。

最低限 RED metrics、つまり rate、errors、duration を持ちます。resource component には USE metrics、つまり utilization、saturation、errors を足します。

## 19. logs

log は文字列の置き場ではなく、event record です。

structured log は trace、request、tenant、user、route、task、deployment version と結びつく必要があります。

## 20. SLO と error budget

SLO は technical decision と user experience をつなげます。

FastAPI service では availability、p95 latency、task completion time、error rate、data correctness が代表的です。

## 21. cost と capacity

AI backend の cost は CPU と memory だけではありません。token、vector search、object storage、third-party API、queue retry、log ingestion が効きます。

## 22. team adoption

stack の成功は framework だけでは決まりません。

template、example、review standard、API review、ADR、runbook、dashboard、migration support が必要です。

## 23. migration path

Flask、Django、Node.js、script service から FastAPI に移すなら、strangler pattern を推奨します。

低 risk、read-heavy、edge API から始め、価値の高い path へ進みます。

## 24. anti-patterns

次の anti-pattern は FastAPI project でよく見られます。template と code review で早めに防ぎます。

- router の数だけで microservice 分割を決める。
- dependency に hidden global business flow を入れる。
- async endpoint で CPU bound loop を直接回す。
- model call を同期 HTTP request に数分ぶら下げる。
- すべての error を 500 または自由文で返す。
- OpenAPI を生成しただけで review しない。
- log に request_id、tenant_id、user_id、trace_id がない。
- production secret を sample env や log に出す。
- timeout、retry、circuit breaker、idempotency がない。
- 一つの Pydantic model を request、response、database、domain に兼用する。
- worker が audit なしで core data を直接変更する。
- average latency だけを見て p95 / p99 を見ない。
- observability を platform default dashboard に丸投げする。
- AI cost を月末の請求で初めて見る。
- 移行で全 API を一括 rewrite する。

## 25. ADR / RFC テンプレート

軽量な ADR / RFC でも、最低限次の項目を持たせます。

- 背景：なぜ今この decision が必要なのか。
- 目標：改善したい user experience、engineering constraint、operational metric。
- 選択肢：FastAPI、Django、Node.js、serverless、worker などの候補。
- 決定：何を選び、何を選ばないのか。
- 結果：performance、cost、team skill、migration、observability、security への影響。
- 検証：release 前にどの test、dashboard、SLO、rollback condition で確認するか。

## 26. production readiness checklist

- [ ] **Architecture**：service owner、boundary、SLO、upgrade responsibility が明確。
- [ ] **Architecture**：domain、api、infrastructure の層が明確。
- [ ] **Architecture**：service 分割 signal が ADR に書かれている。
- [ ] **Architecture**：entry、health、readiness、admin endpoint と business endpoint の境界が明確。
- [ ] **API contract**：OpenAPI schema を CI で生成または検証し、security scheme、error response、pagination、example を含める。
- [ ] **API contract**：すべての response model が明示されている。
- [ ] **API contract**：error format に code、message、request_id、details があり、client が free-text error に依存しない。
- [ ] **API contract**：pagination、sort、filter parameter の命名が一貫している。
- [ ] **API contract**：breaking change に version strategy、deprecation window、migration notice、monitoring がある。
- [ ] **API contract**：SDK generation で field name、nullable、enum、time format が崩れない。
- [ ] **Data**：migration script は再実行可能で、blue-green または rolling release で安全に実行でき、rollback strategy がある。
- [ ] **Data**：connection pool size、worker count、Uvicorn worker、external quota を一緒に load test する。
- [ ] **Data**：transaction boundary が制御不能な external API をまたがない。
- [ ] **Data**：backup restore は設定済みだけでなく演習済みである。
- [ ] **Data**：read replica、cache、search index の consistency model が説明されている。
- [ ] **Data**：cache key に tenant、locale、permission、version など必要な dimension が入り、invalidation、stampede、avalanche、large key への保護がある。
- [ ] **Security**：authentication と authorization が分離されている。
- [ ] **Security**：tenant isolation が query、list、detail、search、export、background task、object storage path で検証されている。
- [ ] **Security**：secret が image、log、exception、OpenAPI example に出ない。
- [ ] **Security**：admin API には追加の audit と access control がある。
- [ ] **Security**：service-to-service call が mTLS、signed token、controlled network boundary を使う。
- [ ] **Security**：permission denied が resource existence を漏らさない stable error になる。
- [ ] **Security**：dependency upgrade、base image、SBOM、image scan、lockfile に supply-chain baseline がある。
- [ ] **Observability**：HTTP automatic instrumentation が入っている。
- [ ] **Observability**：model、tool、retrieval、queue task に business span がある。
- [ ] **Observability**：structured log に trace_id、request_id、tenant_id、route、status があり、sensitive raw text を記録しない。
- [ ] **Observability**：metrics が RED または USE metrics を覆う。
- [ ] **Observability**：dashboard は user journey から作られ、on-call が trace と log に移動できる。
- [ ] **Observability**：alert に owner、severity、silence condition、runbook link があり、trace sampling が error、slow request、high-cost request を残す。
- [ ] **Queue and task**：長時間 task が HTTP worker を塞がない。
- [ ] **Queue and task**：task state が queued、running、succeeded、failed、cancelled、expired を区別する。
- [ ] **Queue and task**：retry に max attempts、backoff、dead letter handling、timeout がある。
- [ ] **Queue and task**：task は user cancellation 可能で、cancel 後に external cost が増え続けない。
- [ ] **Queue and task**：task result に retention、permission check、deletion policy があり、worker log が original request trace と関連づく。
- [ ] **Deploy and capacity**：CI が lint、type check、unit test、contract check を実行する。
- [ ] **Deploy and capacity**：container image が再現可能で vulnerability scan される。
- [ ] **Deploy and capacity**：schema migration、app release、worker release の順序制約が明記される。
- [ ] **Deploy and capacity**：canary release を tenant、route、feature flag、traffic ratio で制御できる。
- [ ] **Deploy and capacity**：rollback が新しい data format を壊さない。
- [ ] **Deploy and capacity**：peak traffic、batch window、model rate limit、queue backlog が capacity model に入る。
- [ ] **Deploy and capacity**：token、third-party API、storage growth、high-cost path を帰属でき、budget、rate limit、alert がある。
- [ ] **Team and migration**：新 service は template から作り、template に example endpoint、test、telemetry、Dockerfile、CI が含まれる。
- [ ] **Team and migration**：ADR/RFC、API review、SLO review の rhythm がある。
- [ ] **Team and migration**：code review が API contract、permission、observability、cost も見る。
- [ ] **Team and migration**：team member が定められた時間内に service、test、local dependency を起動できる。
- [ ] **Team and migration**：migration 前に baseline metric、traffic shape、error distribution がある。
- [ ] **Team and migration**：migration plan に strangler path、dual write、comparison job、diff alert、rollback strategy がある。
- [ ] **Team and migration**：completion criteria が old path shutdown、documentation update、alert migration を含む。

## 27. FAQ

### FastAPI は public product と internal platform のどちらに向く？

どちらにも使えます。public product では versioning、rate limit、auth、error contract、abuse protection が重要です。internal platform では template、audit、tenant isolation、自助 documentation が重要になります。

### FastAPI を使うなら全部 async にするべき？

いいえ。I/O bound path は async ecosystem を使い、blocking library は thread pool または worker に逃がし、CPU bound task は request path から外します。

### Django を選ぶべき場面は？

admin、permission、ORM workflow、管理画面が中心なら Django が省力です。FastAPI は API-first、orchestration、AI / data service に向きます。

### OpenAPI が自動生成されるなら API review は不要？

必要です。自動生成は code の現状を示すだけで、命名、error semantic、version strategy、caller experience を保証しません。

### Pydantic model を domain model にしてよい？

小さな service では可能ですが、中大規模では request、response、domain、persistence model を分けるほうが安全です。

### queue は最初から必要？

必ずではありません。SLO 内で安定して返せるなら同期で始められます。ただし file processing、long model call、batch、retry、cross-system write は早く queue が必要になります。

### API Gateway は必要？

public API、多 client、多 tenant、統一 auth、rate limit、audit があるなら推奨です。初期 internal service は load balancer と app-level governance から始めても構いません。

### model gateway はいつ必要？

provider が複数、cost が高い、policy が複雑、rate limit が強い、cache が必要、複数 service が共有する場合に価値があります。

### FastAPI は大きな traffic に耐えられる？

多くの I/O bound scenario に耐えられますが、database、connection pool、cache、external API、deployment topology、capacity governance に依存します。

### Python service が script 集合になるのを防ぐには？

service template、directory boundary、type check、test convention、ADR、API review、observability baseline、code ownership を作ります。

## 28. 参考リンク

- [FastAPI Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [FastAPI Lifespan Events](https://fastapi.tiangolo.com/advanced/events/)
- [uv: Working on projects](https://docs.astral.sh/uv/guides/projects/)
- [uv: Locking and syncing](https://docs.astral.sh/uv/concepts/projects/sync/)
- [OpenTelemetry Python Instrumentation](https://opentelemetry.io/docs/languages/python/instrumentation/)
- [OpenTelemetry FastAPI Instrumentation](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html)
- [uv 実践ガイド](./uv-python-project-workflow/)
