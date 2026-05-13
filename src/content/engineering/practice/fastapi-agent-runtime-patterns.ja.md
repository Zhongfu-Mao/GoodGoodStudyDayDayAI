---
title: "AI Agent 開発者のための FastAPI：ミドルウェア、依存性注入、コンテキスト管理"
date: 2026-05-13
category: engineering
description: "FastAPI を Agent 実行基盤の HTTP 層として捉え、ミドルウェア、依存性注入、lifespan、OpenTelemetry をどう組み合わせるかを整理する。"
difficulty: advanced
plainSummary: "Agent サービスは Chain を HTTP ハンドラーに入れるだけでは足りません。ユーザー、権限、ツールポリシー、モデルクライアント、トレース、承認、状態復元を FastAPI の境界として設計する必要があります。"
tags:
  - "FastAPI"
  - "AI Engineering"
  - "Agent"
lang: ja
coverImage: "/images/engineering/practice/fastapi-agent-runtime-cover.png"
draft: false
---

# AI Agent 開発者のための FastAPI：ミドルウェア、依存性注入、コンテキスト管理

> 鮮度メモ：この記事は 2026-05-13 時点で確認しています。FastAPI、OpenTelemetry、MCP、各種 Agent フレームワークの API や推奨パターンは変わり続けるため、本番導入前には利用中のバージョンの公式ドキュメントを確認してください。

AI Agent サービスにおける FastAPI の価値は、単に `/chat` エンドポイントを素早く作れることではありません。

本当に重要なのは、FastAPI を Agent Runtime の HTTP 境界として使えることです。

この境界は、外部から届いた request を、監査可能で、復元可能で、キャンセル可能で、権限制御され、観測できる Agent run に変換します。

モデル推論、tool call、MCP client、vector search、human approval、background worker は、その境界の内側で動きます。

しかし境界そのものは、先に次の問いに答えなければなりません。

- この request は誰が送ったのか。
- どの tenant、workspace、project に属するのか。
- どの context を読んでよいのか。
- どの tool を使ってよいのか。
- どこまで token や費用を使ってよいのか。
- どの操作に human approval が必要なのか。
- run の状態をどこに保存するのか。
- 失敗した場合にどこから再開できるのか。
- HTTP、model call、tool call をどう trace でつなぐのか。

この境界が曖昧なまま Agent を作ると、よく動くけれど運用できないブラックボックスになります。

![FastAPI Agent の context flow 図](/images/engineering/practice/fastapi-agent-context-visual.png)

![FastAPI Agent Runtime のレイヤー構造図](/images/engineering/practice/fastapi-agent-runtime-layers-visual.png)

## この記事の前提

この記事は、FastAPI の基本的な path operation や Pydantic model をすでに使ったことがあるエンジニアを想定しています。

また、LLM や Agent の実装にもある程度触れている前提です。

ここで扱うのは FastAPI 入門ではありません。

Agent Runtime の境界設計です。

つまり「モデルを API につなぐ方法」ではなく、「Agent が実ユーザー、実データ、実ツール、実承認、実障害に触れるとき、FastAPI 側で何を受け止めるべきか」を整理します。

## まず結論

運用する Agent backend は、同期的な `/chat` handler だけで終わらせないほうがよいです。

より堅い構成は次のようになります。

- FastAPI middleware で横断的な制御を行う。
- dependency chain で identity、permission、policy、context を解決する。
- lifespan で共有 resource を管理する。
- handler は run を作成し、runtime 境界を返す。
- runner が model と tool を実行する。
- event stream で進捗を公開する。
- persistence が run、step、approval、artifact を保存する。
- OpenTelemetry が request、run、step を一本の trace としてつなぐ。
- approval gate が高リスク操作を自動実行から切り離す。

これは過剰設計ではありません。

Agent を demo から platform に移すときに必要になる外枠です。

## 三つの chain を分ける

Agent サービスが複雑になる大きな理由は、三つの chain を混ぜてしまうことです。

一つ目は HTTP chain です。

request が service に入り、middleware、routing、dependency、handler を通って response になります。

ここで扱うのは次のようなことです。

- request size;
- CORS;
- request id;
- trace context;
- auth header;
- rate limit;
- error response;
- streaming protocol;
- timeout と cancel。

二つ目は context chain です。

HTTP request から、Agent 実行前に確定すべき context を解決します。

ここで扱うのは次のようなことです。

- user;
- tenant;
- workspace;
- conversation;
- run id;
- model policy;
- tool policy;
- memory scope;
- budget;
- approval policy;
- audit metadata。

三つ目は Agent execution chain です。

model call、planner、tool call、MCP client、parser、retry、reflection、artifact generation、final answer はここに属します。

FastAPI は Agent framework の代替ではありません。

FastAPI の役割は、Agent framework を明確な境界の内側で動かすことです。

## Runtime Model：request ではなく run を中心にする

AI Agent サービスが通常の CRUD API と違うのは、一つの request が短い transaction で終わらないことです。

一つの Agent run には、次のような処理が含まれることがあります。

- 複数回の model call;
- 複数回の tool call;
- 外部 API の待ち時間;
- file や report の生成;
- human approval;
- user cancel;
- queue retry;
- 切断後の event replay;
- failure 後の resume。

そのため runtime model は response body だけを中心に設計しないほうがよいです。

基本単位は `run` です。

最低限、run には次のような情報を持たせます。

```text
run_id
user_id
workspace_id
conversation_id
status
input_snapshot
context_snapshot
model_policy_snapshot
tool_policy_snapshot
approval_policy_snapshot
created_at
started_at
completed_at
last_event_id
trace_id
error_code
```

`input_snapshot` は user request を保存します。

`context_snapshot` は、権限確認、整形、切り詰めを終えた context の要約を保存します。

`policy_snapshot` は、その run 作成時点で有効だった model、tool、approval policy を保存します。

この snapshot は非常に重要です。

run は数分後に再開されるかもしれません。

数日後に監査されるかもしれません。

resume 時に「現在の policy」を読み直すだけだと、作成時と違う挙動になることがあります。

監査時に final answer だけ残っていても、なぜその tool が許可されたのか説明できません。

## 推奨する API 境界

`/chat` を残しても構いません。

ただし runtime の中心は `/agent/runs` に寄せるほうが設計しやすくなります。

```text
POST   /agent/runs
GET    /agent/runs/{run_id}
GET    /agent/runs/{run_id}/events
POST   /agent/runs/{run_id}/cancel
POST   /agent/runs/{run_id}/approvals/{approval_id}
GET    /agent/runs/{run_id}/artifacts
POST   /agent/runs/{run_id}/resume
```

それぞれの endpoint は違う意味を持ちます。

| endpoint | 意味 |
| --- | --- |
| `POST /agent/runs` | run を作成する |
| `GET /agent/runs/{run_id}` | 現在または最終状態を取得する |
| `GET /agent/runs/{run_id}/events` | step、token、tool、approval event を読む |
| `POST /cancel` | user が run を取り消す |
| `POST /approvals/{approval_id}` | 人間が高リスク操作を承認または拒否する |
| `GET /artifacts` | 生成された file や report を取得する |
| `POST /resume` | 復元可能な状態から再開する |

`/chat` という名前が悪いわけではありません。

問題は、名前が「request が入り、answer が返る」だけの mental model を誘導しやすいことです。

実際の Agent runtime は、request が入り、run が作られ、event が継続的に発生し、状態を照会でき、一部の操作は承認待ちになり、最終結果が追跡可能になる仕組みです。

## Middleware：横断的な制御に限定する

FastAPI middleware は、すべての request が通る横断的な処理に向いています。

業務 resource の組み立てには向いていません。

Agent サービスでよく使う middleware は次のようなものです。

| middleware | 扱うこと |
| --- | --- |
| Request ID | `x-request-id` を読み取る、または生成する |
| Trace Context | `traceparent` と `baggage` を読み取り、伝播する |
| Timing | HTTP layer の latency を記録する |
| CORS | browser 上の Agent UI を支える |
| Security Headers | browser からの攻撃面を狭める |
| Body Size Guard | 巨大な prompt、file reference、context package を防ぐ |
| Rate Limit Hook | 高コスト dependency に入る前に粗い制限をかける |
| Error Envelope | 未捕捉例外を統一形式で返す |

request id middleware は小さく書けます。

```python
from uuid import uuid4
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response
```

この middleware は user を解決しません。

Agent も作りません。

database transaction も開きません。

middleware は request の外枠です。

runtime の組み立て場所ではありません。

user、permission、tool registry、model client まで middleware に入れると、テストが難しくなり、失敗箇所も追いづらくなります。

## Middleware に置かないもの

次の処理は middleware に置かないほうがよいです。

- model call;
- run ごとの tool list 作成;
- 長期 memory の読み込み;
- 大量の業務 data query;
- request 全体をまたぐ database session;
- 具体的な tool call の許可判断;
- user 向け final answer の生成。

middleware の実行順序、例外伝播、response wrapping、streaming の扱いは、横断処理に向いています。

業務 context は dependency chain に寄せます。

Agent execution は runner に寄せます。

長時間 task は background worker や durable execution に寄せます。

境界が明確なほど、障害の位置が見つけやすくなります。

## Dependency Chain：AgentContext を handler に注入する

FastAPI の dependency system は Agent サービスと相性がよいです。

run 前に解決すべき resource と permission を、明示的な chain として表現できます。

たとえば次のような流れです。

```text
Authorization header
  -> current user
  -> workspace
  -> model policy
  -> tool policy
  -> memory scope
  -> approval policy
  -> AgentContext
```

簡略化した `AgentContext` は次のようになります。

```python
from dataclasses import dataclass
from typing import Mapping

@dataclass(frozen=True)
class AgentContext:
    request_id: str
    user_id: str
    workspace_id: str
    conversation_id: str | None
    allowed_tools: tuple[str, ...]
    model: str
    max_steps: int
    max_cost_usd: float
    approval_required_tools: tuple[str, ...]
    trace_id: str | None
    audit_tags: Mapping[str, str]
```

`frozen=True` は必須ではありません。

ただし重要な考え方を表しています。

context は runtime boundary であり、実行中にあちこちで書き換える一時領域ではありません。

runner が状態を記録したいなら、run store や event store に書きます。

`AgentContext` を可変の巨大な bag にしないことが大切です。

## Dependency の例：identity、policy、context

dependency chain の基本形は次のようになります。

```python
from typing import Annotated
from fastapi import Depends, Header, HTTPException, Request

async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    if authorization is None:
        raise HTTPException(status_code=401, detail="Missing authorization")
    return await auth_service.verify_bearer_token(authorization)

async def get_workspace(
    request: Request,
    user: Annotated[User, Depends(get_current_user)],
) -> Workspace:
    workspace_id = request.headers.get("x-workspace-id")
    workspace = await workspace_service.resolve(user.id, workspace_id)
    if workspace is None:
        raise HTTPException(status_code=403, detail="Workspace not allowed")
    return workspace

async def get_agent_policy(
    user: Annotated[User, Depends(get_current_user)],
    workspace: Annotated[Workspace, Depends(get_workspace)],
) -> AgentPolicy:
    return await policy_service.resolve_agent_policy(
        user_id=user.id,
        workspace_id=workspace.id,
    )

async def get_agent_context(
    request: Request,
    user: Annotated[User, Depends(get_current_user)],
    workspace: Annotated[Workspace, Depends(get_workspace)],
    policy: Annotated[AgentPolicy, Depends(get_agent_policy)],
) -> AgentContext:
    return AgentContext(
        request_id=request.state.request_id,
        user_id=user.id,
        workspace_id=workspace.id,
        conversation_id=request.headers.get("x-conversation-id"),
        allowed_tools=tuple(policy.allowed_tools),
        model=policy.model,
        max_steps=policy.max_steps,
        max_cost_usd=policy.max_cost_usd,
        approval_required_tools=tuple(policy.approval_required_tools),
        trace_id=get_current_trace_id(),
        audit_tags={"plan": policy.plan_name},
    )
```

handler は薄く保てます。

```python
from typing import Annotated
from fastapi import Depends
from pydantic import BaseModel, Field

class CreateRunRequest(BaseModel):
    input: str = Field(min_length=1, max_length=20000)
    conversation_id: str | None = None
    stream: bool = False

@app.post("/agent/runs")
async def create_run(
    body: CreateRunRequest,
    ctx: Annotated[AgentContext, Depends(get_agent_context)],
):
    run = await run_service.create_run(body=body, context=ctx)
    return {"run_id": run.id, "status": run.status}
```

handler は token 検証の詳細を知る必要がありません。

tool permission がどの table から来るのかも知る必要がありません。

そして、その判断を model に任せるべきでもありません。

## Dependency Chain と Agent Chain の役割分担

FastAPI dependency chain と Agent chain は、どちらも chain と呼べます。

しかし意味はまったく違います。

| 観点 | FastAPI dependency chain | Agent execution chain |
| --- | --- | --- |
| 問うこと | この request はどの範囲で実行できるか | この task をどう完了するか |
| 実行時点 | handler の前 | run 作成後 |
| 典型的な失敗 | 401、403、422、429、503 | tool failure、model timeout、parse failure、approval rejection |
| 出力 | handler に注入される resource と context | step、event、artifact、final answer |
| テスト | dependency override、TestClient | runner unit test、integration test、replay test |
| セキュリティ上の意味 | system boundary | business execution |

健全な Agent サービスでは、dependency chain が Agent chain より前にあります。

user、tool、budget、approval は model が推論するものではありません。

それらは system fact です。

model は、その system fact が許す範囲の中で task を実行します。

## Lifespan：共有 resource を管理する

Agent サービスには共有 resource が多くあります。

たとえば次のようなものです。

- model client;
- embedding client;
- database connection pool;
- Redis や queue connection;
- vector store client;
- MCP client pool;
- tool registry;
- OpenTelemetry exporter;
- feature flag client;
- secret manager client。

これらを request ごとに作成するべきではありません。

FastAPI の `lifespan` は、起動と終了の処理をまとめるのに向いています。

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model_client = ModelClient.from_env()
    app.state.embedding_client = EmbeddingClient.from_env()
    app.state.db = await DatabasePool.connect()
    app.state.queue = await QueueClient.connect()
    app.state.tool_catalog = await ToolCatalog.load()
    try:
        yield
    finally:
        await app.state.queue.close()
        await app.state.db.close()
        await app.state.embedding_client.close()
        await app.state.model_client.close()

app = FastAPI(lifespan=lifespan)
```

dependency から取り出すと、handler は resource の作り方を知る必要がありません。

```python
from typing import Annotated
from fastapi import Depends, Request

def get_model_client(request: Request) -> ModelClient:
    return request.app.state.model_client

ModelClientDep = Annotated[ModelClient, Depends(get_model_client)]
```

この構成にはいくつかの利点があります。

- startup failure が起動時に見える。
- shutdown 時に connection を閉じられる。
- test で dependency を override しやすい。
- handler が resource 構築から解放される。
- multi-worker deployment で lifecycle が見えやすい。

## Lifespan の落とし穴

一つ目は、user ごとの状態を `app.state` に置くことです。

`app.state` は application-level shared state です。

client、pool、registry には向いています。

user context、conversation memory、現在の run 状態には向いていません。

二つ目は、一つの process を唯一の global runtime だと思い込むことです。

production では複数の Uvicorn/Gunicorn worker が動くことがあります。

worker ごとに `app.state` は別です。

run 状態は外部の durable store に置くべきです。

三つ目は、lifespan で長時間の blocking warmup を行うことです。

必要な health check は構いません。

しかし大量の index loading、model warmup、tool discovery には timeout、degrade、readiness strategy が必要です。

そうしないと deploy 時の挙動が読めなくなります。

## Context Isolation

### 豊富さより隔離を優先する

Agent の事故は、model が賢くないことよりも context isolation の失敗から起きることが多いです。

典型例は次のようなものです。

- user A の memory を user B が読めてしまう。
- 別 workspace の file が検索結果に混ざる。
- internal system prompt が user-visible output に入る。
- debug log に access token が残る。
- low-privilege user の tool list に high-privilege tool が出る。
- resume 時に別の policy が適用される。
- summary が長期 memory に残してはいけない情報を保存する。

context management の第一原則は「model にできるだけ多く渡す」ではありません。

第一原則は「今回の task で使う権利がある情報だけ渡す」です。

実務上は次のように分けると考えやすいです。

| 層 | 内容 | prompt への入れ方 |
| --- | --- | --- |
| Identity | user_id、workspace_id、role | 基本的にそのまま入れない |
| Task Input | user input、selected files、UI state | sanitize と truncate 後に入れる |
| Runtime Policy | model、budget、max_steps | 必要な要約だけ入れる |
| Tool Policy | allowed_tools、approval gates | tool description に変換する |
| Memory Scope | 読んでよい conversation/doc scope | 許可された範囲だけ検索する |
| Observability | request_id、trace_id、run_id | log と trace 用。推論には使わない |
| Secrets | API keys、tokens | 絶対に prompt に入れない |

`Request` object、database session、完全な user record、内部 permission object をそのまま Agent に渡さないでください。

Agent に渡す context は、整理され、監査でき、長さが管理されたものにします。

### tenant、workspace、conversation の三層

context isolation は `user_id` だけでは不十分です。

多くの実システムには、少なくとも三つの scope があります。

- tenant;
- workspace;
- conversation。

tenant は organization boundary です。

workspace は project または team boundary です。

conversation は一つの task または dialog boundary です。

long-term memory、file retrieval、tool permission、artifact access は、どの scope に属するか明確にします。

よく使う階層は次の通りです。

```text
tenant_id
  -> workspace_id
      -> conversation_id
          -> run_id
              -> step_id
```

どの query でも、`run_id` だけで access を許可しないほうがよいです。

`run_id` は locator であり、authorization token ではありません。

### retrieval 前 filter と retrieval 後 filter

RAG と tool retrieval では、pre-filter と post-filter の両方を考えます。

pre-filter は query 時点で scope を絞ります。

たとえば current workspace の document だけを検索します。

post-filter は結果が返った後に、一件ずつ authorization を確認します。

両方必要です。

pre-filter だけだと、index や metadata の不整合に弱くなります。

post-filter だけだと、retrieval budget を浪費し、ranking が許可外 content の影響を受ける可能性があります。

推奨 flow は次の通りです。

```text
resolve memory scope
  -> build retrieval filter
  -> execute retrieval
  -> per-result authorization check
  -> redact fields
  -> build prompt context
```

prompt に入れる content は、filter と redaction 後のものにします。

raw retrieval result を model に渡して選ばせないほうがよいです。

### long-term memory write policy

long-term memory は読むより書くほうが危険です。

read の越権は information leak です。

write の誤りは将来の run 全体を汚染します。

memory write では最低限、次の点を確認します。

- この information は長期保存に向いているか。
- secret を含まないか。
- personal sensitive information を含まないか。
- 一回限りの temporary task にすぎないか。
- tenant/workspace scope が明確か。
- user confirmation が必要か。
- deletion と expiration の policy があるか。

memory write は三種類に分けると扱いやすくなります。

| type | 例 | policy |
| --- | --- | --- |
| Ephemeral | run 内だけの temporary fact | run 終了後に expire |
| Conversation | dialog の preference や summary | conversation scope |
| Durable | 明確に再利用できる user preference や project fact | 強めの audit |

すべての会話 summary を durable memory に入れる default は避けます。

長く残すほど、後からの cleanup は難しくなります。

### Prompt Builder

Prompt builder は runtime の first-class component として扱います。

単なる string concatenation ではありません。

権限確認済みの context を、model input に変換する責務を持ちます。

prompt builder は次の順序で動かせます。

```text
load system policy summary
load task input
load authorized memory
load authorized retrieval snippets
load tool usage instructions
apply redaction
apply token budget
emit prompt package
```

`prompt package` は次のような要素を持てます。

- system message;
- developer policy summary;
- user task;
- context snippets;
- tool descriptions;
- output schema;
- redaction report;
- token estimate。

この形にすると prompt construction を単独で test できます。

incident review でも、完全な sensitive content を出さずに、model がどの種類の information を見ていたか確認できます。

## Tool Permissions：tool list は権限境界である

Agent tool は単なる function list ではありません。

tool list そのものが security boundary です。

model に `delete_user`、`send_email`、`deploy_production`、`refund_payment` が見えている時点で、prompt に「慎重に使って」と書いてもリスクは高くなっています。

tool permission は FastAPI 層と policy 層で先に絞り込みます。

```python
def build_tool_registry(ctx: AgentContext, catalog: ToolCatalog) -> ToolRegistry:
    registry = ToolRegistry()
    for tool_name in ctx.allowed_tools:
        tool = catalog.get(tool_name)
        registry.register(tool.with_audit_tags(ctx.audit_tags))
    return registry
```

tool はカテゴリ分けすると運用しやすくなります。

| 種類 | 例 | default policy |
| --- | --- | --- |
| Read-only | doc search、public config query | 自動実行してよい |
| Scoped read | customer query、internal metrics | workspace / role で制限する |
| Draft write | draft 作成、PR 作成、temporary file write | 自動実行可。ただし audit 必須 |
| External side effect | email 送信、ticket 作成、payment API | approval 必須 |
| Production mutation | deploy、delete、permission change | default deny または強い approval |

tool call 時にも二回目の check が必要です。

tool list 作成時の check だけでは足りません。

なぜなら tool arguments でも越権が起きるからです。

たとえば普通の user が `query_docs(scope="all_company")` を呼べてはいけません。

## MCP Integration：MCP を外部能力の境界として扱う

MCP は Agent と tool server の間の protocol boundary として便利です。

ただし MCP 自体があなたの permission system になるわけではありません。

FastAPI service から MCP を使う場合、少なくとも次の点を設計します。

- どの user がどの MCP server を使えるか。
- MCP server が公開する tools をどう絞るか。
- tool arguments を tenant ごとに検証、または書き換えるか。
- MCP server の credentials をどこに保存するか。
- stdio server を現在の runtime で起動してよいか。
- HTTP transport に authentication と Origin check があるか。
- MCP call の trace を run trace にどう接続するか。
- MCP connection が失敗したとき、run をどう degrade または recover するか。

実装上は次のような流れが扱いやすいです。

```text
FastAPI request
  -> AgentContext
  -> ToolPolicy
  -> MCPClientFactory
  -> ScopedMCPClient
  -> ToolRegistry
  -> AgentRunner
```

`ScopedMCPClient` は raw tool list をそのまま返さないほうがよいです。

現在の user、workspace、run で許可された tool だけを公開します。

```python
class ScopedMCPClient:
    def __init__(self, client: MCPClient, policy: ToolPolicy):
        self._client = client
        self._policy = policy

    async def list_tools(self) -> list[ToolSpec]:
        tools = await self._client.list_tools()
        return [tool for tool in tools if self._policy.allows_tool(tool.name)]

    async def call_tool(self, name: str, arguments: dict) -> ToolResult:
        self._policy.assert_tool_call_allowed(name, arguments)
        return await self._client.call_tool(name, arguments)
```

HTTP MCP transport では browser 由来のリスクにも注意が必要です。

local MCP server を不用意に `0.0.0.0` に bind しない。

HTTP endpoint には authentication を置く。

Origin check を省略しない。

これらは runtime security boundary であり、Agent prompt で後から補えるものではありません。

## Streaming and Events：token だけを流さない

Agent streaming は token streaming だけではありません。

user が本当に知りたいのは、run の中で何が起きているかです。

成熟した event stream では次のような event を表現します。

- run created;
- run started;
- model generation started;
- model token delta;
- tool call started;
- tool call result;
- approval required;
- approval approved or rejected;
- artifact created;
- run cancelled;
- run failed;
- run completed。

Server-Sent Events で event を公開できます。

```python
from fastapi.responses import StreamingResponse

@app.get("/agent/runs/{run_id}/events")
async def stream_run_events(
    run_id: str,
    ctx: AgentContextDep,
):
    await run_service.assert_can_read(run_id, ctx)

    async def event_generator():
        async for event in event_store.subscribe(run_id):
            yield f"id: {event.id}\n"
            yield f"event: {event.type}\n"
            yield f"data: {event.to_json()}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )
```

SSE は単純で、browser から扱いやすく、一方向の進捗 stream に向いています。

WebSocket は双方向 interaction、realtime collaboration、複雑な control に向いています。

通常の chunked HTTP streaming は token だけなら十分ですが、複数種類の event を扱うには弱くなりがちです。

## Event Schema：event は replay できる形にする

event は log の代用品ではありません。

event は UI、recovery、audit が依存する runtime fact です。

最低限、次の field を持たせると扱いやすくなります。

```text
event_id
run_id
step_id
type
created_at
sequence
payload
visibility
trace_span_id
```

`sequence` は順序付けに使います。

`visibility` は user-visible event と internal event を分けるために使います。

`payload` には secret、完全な prompt、raw token、機密 tool result を入れないようにします。

frontend が切断した場合、`Last-Event-ID` や query parameter で途中から読み直せると実用的です。

そのためには event store が durable である必要があります。

memory queue だけでは足りません。

## Background Jobs：BackgroundTasks は queue ではない

FastAPI の `BackgroundTasks` は、request 後に行う小さな付随処理に向いています。

たとえば次のような処理です。

- 軽い audit log を書く。
- non-critical notification を送る。
- 短い cleanup を行う。

しかし reliable Agent runtime として使うには弱いです。

理由は明確です。

- process restart で task が失われる。
- retry が標準で強くない。
- worker 間の scheduling がない。
- backpressure がない。
- long-running task に向かない。
- human approval 待ちに向かない。
- 複雑な step state の recovery に向かない。

Agent run が数秒を超える可能性があるなら、きちんとした background execution に渡します。

選択肢としては Celery、RQ、Dramatiq、Arq、Temporal、Prefect、queue と独自 worker、cloud provider の durable workflow などがあります。

重要なのは特定の製品名ではありません。

HTTP request lifecycle と Agent execution lifecycle を分けることです。

## Run Persistence

### chat history より状態表が重要

chat history は user と assistant の会話を記録します。

run persistence は system が何をしたかを記録します。

最小構成でも次のような table または collection が欲しくなります。

```text
agent_runs
agent_steps
agent_events
agent_approvals
agent_artifacts
agent_checkpoints
```

`agent_runs` は run 全体の状態を持ちます。

`agent_steps` は model call、tool call、approval wait、restore point を持ちます。

`agent_events` は user-visible event と internal event を持ちます。

`agent_approvals` は human decision を持ちます。

`agent_artifacts` は生成 file や参照を持ちます。

`agent_checkpoints` は resume 可能な runner state を持ちます。

run status は明示的に enum にします。

```text
queued
running
waiting_for_approval
completed
failed
cancelled
expired
```

`done: true/false` だけでは足りません。

Agent runtime には中間状態が多いからです。

中間状態が明確なほど、UI、recovery、operation が楽になります。

### state transition table

run state には明確な transition が必要です。

| current state | event | next state |
| --- | --- | --- |
| queued | worker picked | running |
| queued | queue timeout | failed |
| running | approval created | waiting_for_approval |
| running | completed | completed |
| running | fatal error | failed |
| running | user cancel | cancelled |
| waiting_for_approval | approved | running |
| waiting_for_approval | rejected | running または failed |
| waiting_for_approval | expired | expired |
| failed | resume requested | queued |

state transition は service layer が制御します。

runner が複数箇所で自由に status を書き換える構成は避けます。

state transition は event として記録できます。

そうすると audit と UI が同じ source of truth を使えます。

### Step design

step は run の内部 execution unit です。

よくある step type は次の通りです。

```text
model_call
tool_call
approval_wait
retrieval
memory_read
memory_write
artifact_write
checkpoint
```

step record には次の field を持たせます。

```text
step_id
run_id
parent_step_id
type
status
started_at
completed_at
input_summary
output_summary
error_code
retry_count
idempotency_key
trace_span_id
```

`input_summary` と `output_summary` は完全な input/output ではありません。

audit と troubleshooting のための summary です。

完全な sensitive content は、security policy に従って別 store に置くか、保存しません。

### Artifact design

Agent runtime は artifact をよく生成します。

例です。

- report;
- code patch;
- table;
- image;
- audio;
- query result;
- ticket draft;
- email draft。

artifact には独自の lifecycle が必要です。

大きな file を run table に直接入れないほうがよいです。

artifact record は次のようにできます。

```text
artifact_id
run_id
type
storage_uri
content_hash
mime_type
size_bytes
visibility
created_by_step_id
retention_policy
```

`visibility` は重要です。

user-visible result もあれば、internal intermediate artifact もあります。

## Approval Gates：高リスク操作はまず proposal にする

approval は final answer に「人間の確認が必要です」と書くことではありません。

approval は runtime state です。

Agent が高リスク tool を呼びたいとき、runner は approval request を作ります。

そして run は `waiting_for_approval` になります。

```text
tool_call_proposed
  -> approval_created
  -> run_waiting_for_approval
  -> approval_approved / approval_rejected
  -> tool_call_executed / tool_call_skipped
```

approval payload には次の情報を含めます。

- tool name;
- argument summary;
- impact scope;
- risk level;
- expected external side effect;
- rollback hint;
- proposing model and step;
- expiration。

FastAPI endpoint は人間の判断を受け取ります。

```python
class ApprovalDecision(BaseModel):
    decision: Literal["approve", "reject"]
    reason: str | None = None

@app.post("/agent/runs/{run_id}/approvals/{approval_id}")
async def decide_approval(
    run_id: str,
    approval_id: str,
    body: ApprovalDecision,
    ctx: AgentContextDep,
):
    return await approval_service.decide(
        run_id=run_id,
        approval_id=approval_id,
        decision=body.decision,
        reason=body.reason,
        decided_by=ctx.user_id,
    )
```

承認後、worker が run を再開します。

handler が同期的に人間の操作を待つ設計より、はるかに安定します。

## OpenTelemetry Trace Model：三層の span

FastAPI の auto instrumentation は HTTP layer を観測できます。

しかし Agent runtime の意味までは理解しません。

Agent service では business span を手動で追加します。

![Agent trace と recovery の流れを示す図](/images/engineering/practice/agent-trace-recovery-visual.png)

最低限、trace は三層で考えるとよいです。

```text
HTTP request span
  -> agent.run span
      -> agent.step.model span
      -> agent.step.tool span
      -> agent.step.approval span
      -> agent.step.persist span
```

それぞれの span で見る属性は違います。

| span | 推奨属性 |
| --- | --- |
| HTTP request | route、method、status_code、request_id |
| agent.run | run_id、workspace_id、model、max_steps、final_status |
| model step | provider、model、token_count、retry_count、latency |
| tool step | tool_name、tool_category、approval_required、status |
| persistence | table/store、operation、retry_count |

完全な prompt、個人情報、access token、raw tool result を span attribute に入れないでください。

trace は運用系の data です。

business database より広い範囲の人や system から見えることがあります。

## Log、Metric、Trace の分担

三つを混同しないほうがよいです。

log は個別の事実に向いています。

- run created;
- approval rejected;
- tool timeout;
- worker resumed;
- checkpoint loaded。

metric は傾向を見るのに向いています。

- run success rate;
- average step count;
- token cost by model;
- tool timeout rate;
- approval wait duration;
- queue delay;
- cancellation rate。

trace は一つの request/run の因果関係を見るのに向いています。

- どの dependency が遅かったか。
- どの tool が詰まったか。
- どの model call が retry されたか。
- run と HTTP request がどうつながったか。
- background worker が同じ trace を引き継いだか。

三者をつなぐ共通 key は、だいたい次のようになります。

```text
request_id
trace_id
run_id
step_id
workspace_id
```

## Security and Privacy：Agent Runtime の確認事項

Agent backend の security surface は普通の API より広くなります。

data を返すだけでなく、tool を呼び、file を生成し、外部 side effect を起こす可能性があるからです。

最低限、次の点を確認します。

- すべての endpoint に authentication がある。
- run query は user/workspace で authorization される。
- event stream が別 run を漏らさない。
- tool list は policy で絞られる。
- tool arguments は二回目の authorization を通る。
- prompt と trace に secret を記録しない。
- upload file に type、size、scan の制限がある。
- retrieval result は permission で filter される。
- long-term memory は tenant ごとに隔離される。
- approval decision は audit log に残る。
- cancel/resume も permission check を通る。
- rate limit は安い request と高価な run を区別する。
- error response が internal stack を出さない。
- MCP HTTP transport に authentication と Origin check がある。
- local stdio tool が remote unauthenticated request から使えない。

privacy では data lifecycle も重要です。

どの input が long-term memory に入るのか。

どの data が vector store に入るのか。

どの data が trace に入るのか。

どの data が model provider に送られるのか。

どの data が artifact として保存されるのか。

user が deletion を要求したとき、それらの copy はどう扱われるのか。

これは運用文書の細部ではありません。

Agent service が実組織で使えるかどうかを決める要件です。

## Testing：dependency override で境界を試す

FastAPI の強みの一つは、test で dependency を override できることです。

Agent runtime では特に有効です。

test では次のものを差し替えられます。

- current user;
- workspace;
- policy;
- model client;
- tool registry;
- run store;
- event store;
- approval service。

例です。

```python
from fastapi.testclient import TestClient

def test_create_run_uses_scoped_policy(app):
    app.dependency_overrides[get_current_user] = lambda: User(id="u1")
    app.dependency_overrides[get_workspace] = lambda: Workspace(id="w1")
    app.dependency_overrides[get_agent_policy] = lambda: AgentPolicy(
        model="gpt-test",
        allowed_tools=["search_docs"],
        approval_required_tools=[],
        max_steps=3,
        max_cost_usd=0.1,
        plan_name="test",
    )

    client = TestClient(app)
    response = client.post("/agent/runs", json={"input": "summarize the docs"})

    assert response.status_code == 200
    assert response.json()["status"] in {"queued", "running"}
```

boundary test では次のケースを見ます。

- unauthenticated request が 401 になる。
- workspace 権限がなければ 403 になる。
- 大きすぎる input が 422 または 413 になる。
- normal user に high-privilege tool が見えない。
- event stream が他人の run を読めない。
- approval endpoint で越権決定できない。
- cancel 後に外部 side effect が続かない。
- resume が run 作成時の policy snapshot を使う。
- trace id と run id を関連付けられる。

## Testing：Runner と Tool を単独で試す

Agent runner は end-to-end test でしか試せない設計にしないほうがよいです。

HTTP server を起動しなくても test できる interface にします。

たとえば次のような形です。

```python
class AgentRunner:
    async def run(
        self,
        run: AgentRun,
        context: AgentContext,
        tools: ToolRegistry,
        events: EventSink,
    ) -> AgentRunResult:
        ...
```

test では fake model、fake tools、in-memory event sink を渡せます。

tool test では次の点を見ます。

- argument schema;
- permission check;
- timeout;
- retry;
- idempotency;
- audit log;
- error mapping;
- sensitive data redaction。

happy path だけでは足りません。

Agent system で最も大事なのは、model が危険な action を提案したとき、system が止められることです。

## Failure Recovery：失敗は普通に起きるものとして設計する

Agent run は普通の API より失敗しやすいです。

原因は多岐にわたります。

- model provider timeout;
- token limit;
- parser failure;
- tool API 429;
- MCP server disconnect;
- worker restart;
- event stream disconnect;
- user cancel;
- approval expiration;
- artifact upload failure;
- temporary database outage。

runtime は失敗を分類します。

| 種類 | 例 | 方針 |
| --- | --- | --- |
| Retryable | 429、一時的な network error | exponential backoff |
| Recoverable | worker restart、stream disconnect | checkpoint から resume |
| User-actionable | approval required、input missing | user を待つ |
| Fatal | permission denied、schema incompatible | run を終了する |
| Partial | artifact failure but answer generated | degraded result として記録 |

checkpoint は model の内部状態を完全に保存する必要はありません。

ただし最低限、次の情報は保存したいです。

- 完了済み step;
- すでに発生した external side effect;
- 現在の approval request;
- retry 可能な tool call;
- 生成済み artifact;
- 次に再開すべき場所。

resume で最も重要なのは idempotency です。

すでに email を送った tool step を、resume 時にもう一度実行してはいけません。

## Production Checklist

本番前にはこの checklist を通すと抜け漏れを見つけやすくなります。

API boundary:

- `/agent/runs` で run を作成する。
- run query に authorization がある。
- event stream に authorization がある。
- cancel に authorization がある。
- approval に authorization がある。
- input schema に length limit がある。
- error response が internal detail を漏らさない。

Runtime:

- run state が durable store に保存される。
- step state が保存される。
- event が保存される。
- checkpoint から resume できる。
- worker が retry を扱える。
- cancel が後続 side effect を止められる。
- approval が run を pause/resume できる。

Tools:

- tool list が user ごとに絞られる。
- tool arguments が二回目の check を通る。
- high-risk tool に approval gate がある。
- tool に timeout がある。
- tool に audit log がある。
- external side effect に idempotency key がある。

Observability:

- HTTP span が自動で取れる。
- agent.run span を手動で取る。
- model/tool span を手動で取る。
- run_id が log に入る。
- token/cost metric を集計できる。
- approval wait duration を監視できる。
- queue delay を監視できる。

Security and privacy:

- secret が prompt に入らない。
- secret が log に入らない。
- secret が trace に入らない。
- memory が tenant ごとに隔離される。
- retrieval が permission で filter される。
- MCP HTTP transport に authentication と Origin check がある。
- data retention policy が明確である。

Deployment:

- lifespan initialization failure が見える。
- readiness と liveness が分かれている。
- multi-worker で状態が memory に依存しない。
- worker と API を別々に scale できる。
- long-running task に timeout と expiration がある。
- dependency service の degrade path が決まっている。

## Anti-patterns：よくある悪い匂い

一つ目は、Agent を handler に全部書くことです。

```python
@app.post("/chat")
async def chat(body: dict):
    llm = ModelClient(api_key=os.environ["API_KEY"])
    tools = [read_file, write_file, run_shell]
    result = await run_agent(body["message"], tools=tools)
    return {"answer": result}
```

短いですが、問題が多くあります。

- request ごとに client を作る。
- input schema がない。
- tool が user ごとに絞られていない。
- write tool に approval がない。
- run id がない。
- event stream がない。
- recovery がない。
- trace がない。
- test が end-to-end に寄りすぎる。

二つ目は、prompt で permission を代用することです。

「現在の user の data だけ読んでください」は permission system ではありません。

permission は retrieval、tool list、tool arguments、storage layer で実行します。

三つ目は、long-term memory を log として使うことです。

memory は将来の推論のための data です。

log は audit と troubleshooting のための data です。

retention、access control、privacy risk が違います。

四つ目は、token だけを stream することです。

token streaming では tool wait、approval、cancel、recovery、artifact を表現できません。

Agent UI には event stream が必要です。

五つ目は、BackgroundTasks を reliable queue として扱うことです。

軽い付随処理には便利ですが、long-running Agent run には向きません。

六つ目は、trace に完全な prompt を入れることです。

これは sensitive data を observability system に広げてしまいます。

summary、length、hash、count、structured status を記録するほうが安全です。

七つ目は、resume 時に permission を最初から計算し直すことです。

resume では作成時の policy snapshot を使い、必要な場合だけ現在の安全停止ルールを上乗せします。

そうしないと、同じ run の挙動が時間とともに変わってしまいます。

## Production Playbook

### API から実行基盤へ

FastAPI を Agent runtime boundary として使う場合、四つの段階で育てると考えやすいです。

第一段階は synchronous API です。

この段階では handler、model client、少数の read-only tool だけでも構いません。

ただし、この時点でも run id は持たせるべきです。

run id は、その後の observability、event stream、recovery の起点になるからです。

第二段階は observable runtime です。

request id、trace id、run event、model latency、tool latency、token cost を記録します。

目的は system を複雑にすることではありません。

一つの回答が遅い、または失敗したときに、どこで起きたのか分かるようにすることです。

第三段階は controlled tool execution です。

tool permission matrix、approval gate、idempotency key、tool audit log を入れます。

Agent が external side effect を起こせるなら、prompt だけで制御してはいけません。

第四段階は recoverable execution です。

background worker、run persistence、checkpoint、resume、cancel、incident recovery を整えます。

service restart、provider rate limit、MCP server disconnect が起きても、run が曖昧な 500 だけで終わらないようにします。

この四段階は段階的に進められます。

ただし設計上は、最初から run を中心 entity として扱うほうが安全です。

### 最小限の runtime boundary

最小構成の Agent runtime に、すべての機能は必要ありません。

しかし、少なくとも次の boundary は必要です。

| boundary | 最小要件 |
| --- | --- |
| Identity | 各 run が user と workspace に紐づく |
| Authorization | query、event、cancel、approval で権限確認する |
| Policy | model、tool、budget、approval の snapshot を持つ |
| State | run status を durable store に保存する |
| Events | 重要 step の event を残す |
| Tools | tool list を user ごとに絞る |
| Safety | high-risk tool は default deny または approval |
| Observability | run_id と trace_id を関連付ける |
| Recovery | failure class と次の action を示せる |

最初に三つだけ入れるなら、優先順位は次の通りです。

1. run persistence；
2. tool permission；
3. trace/event correlation。

run persistence がなければ recovery できません。

tool permission がなければ real tool を安全に接続できません。

trace/event correlation がなければ troubleshooting できません。

### configuration layering

Agent runtime の config を handler、prompt、environment variable に散らさないほうがよいです。

五つの layer に分けると整理しやすくなります。

| config layer | 例 | 変更頻度 |
| --- | --- | --- |
| Deploy config | provider endpoint、region、queue name | deploy 時 |
| Runtime config | timeout、worker concurrency、event retention | operation 時 |
| Tenant policy | available models、budget、data region | tenant 単位 |
| User policy | role、allowed tools、approval scope | user 単位 |
| Run override | max_steps、stream mode、conversation id | run 単位 |

FastAPI dependency chain は、これらを `AgentRuntimeConfig` にまとめます。

runner がすべての environment variable を直接読む構成は避けます。

tool が request header から自分で permission を推測する構成も避けます。

config は boundary layer で収束させ、immutable object として execution layer に渡します。

### timeout budget

Agent runtime には layered timeout が必要です。

HTTP timeout 一つだけでは足りません。

| layer | timeout の目的 |
| --- | --- |
| HTTP request | run 作成や status read が固まらない |
| Queue wait | run が永遠に queued にならない |
| Model call | provider の停滞を止める |
| Tool call | external API の停滞を止める |
| Approval wait | human decision の待ち時間を制御する |
| Event stream idle | disconnect を検出する |
| Whole run | 総実行時間を制御する |

各 timeout は明確な status に対応させます。

例です。

```text
model_call_timeout -> step failed, run retryable
approval_expired -> run expired
queue_timeout -> run failed before start
whole_run_timeout -> run cancelled by system
```

すべての timeout を同じ 500 にしないでください。

user、operator、auditor は、どの layer で失敗したのかを知る必要があります。

### cost budget

Agent run の budget は final token だけで見ないほうがよいです。

考慮する対象は複数あります。

- input token;
- output token;
- embedding;
- rerank;
- tool API cost;
- vector database query;
- artifact storage;
- background worker time;
- retry cost;
- approval operation cost。

実用的な budget object は次のようになります。

```text
max_input_tokens
max_output_tokens
max_total_tokens
max_model_calls
max_tool_calls
max_cost_usd
max_wall_clock_seconds
```

runner は各 step の後で消費量を更新します。

budget に近づいたら、Agent は task を収束させます。

budget を超えたら、run は明確な failed または partial state に入ります。

## Tool Permission Matrix

### より細かい matrix

tool permission は allow/deny だけでは粗すぎます。

matrix として持つほうが実用的です。

| tool category | read scope | write scope | approval | idempotent | rollback |
| --- | --- | --- | --- | --- | --- |
| `docs.search` | workspace docs | なし | 不要 | yes | 不要 |
| `metrics.query` | team metrics | なし | role 次第 | yes | 不要 |
| `ticket.create` | selected project | draft/ticket | optional | yes | close 可能 |
| `email.send` | selected recipients | external email | required | key 必須 | 完全ではない |
| `repo.write` | selected repo | branch/PR | path 次第 | key 必須 | revert 可能 |
| `deploy.prod` | prod service | production | strong approval | key 必須 | system 次第 |
| `billing.refund` | customer account | payment system | strong approval | key 必須 | 制限あり |

各 tool には metadata を持たせます。

```text
name
category
risk_level
read_scopes
write_scopes
requires_approval
idempotency_required
audit_required
timeout_seconds
retry_policy
redaction_policy
```

Agent に見せる tool description は、この metadata の safe projection です。

内部 metadata はより詳細です。

すべての policy を prompt に埋め込まないほうがよいです。

### argument-level permission

tool-level allow は第一段階にすぎません。

細かい control は argument-level permission で行います。

たとえば同じ `repo.write` tool でも、次のような差があります。

- feature branch には書ける。
- `main` には直接書けない。
- document は変更できる。
- deployment config は変更できない。
- PR は作れる。
- PR merge はできない。

argument-level policy は rule として表現できます。

```text
tool = repo.write
allow branch starts_with "agent/"
deny branch equals "main"
allow path matches "docs/**"
deny path matches ".github/workflows/**"
require_approval path matches "infra/**"
```

tool 実行前に、runtime が structured arguments を検査します。

model の自然言語説明で「問題なさそう」と判断してはいけません。

permission decision は deterministic であるべきです。

### dynamic permission

permission には dynamic なものもあります。

run state に依存するからです。

例です。

- tool call count が上限に近い。
- cost budget が尽きている。
- user が run を cancel した。
- approval が expired している。
- workspace が admin により lock された。
- incident mode で write tool が disabled になった。
- provider が rate limit 中である。

tool 実行前の最終判断は、三種類の情報を見るべきです。

```text
static policy
run state
system safety state
```

system が incident mode に入ったら、一部 tool を global に disable できます。

これは user policy を一件ずつ変えるより速く、安全です。

## Approval Gate Patterns

### confirmation、authorization、dual control

approval gate には複数の型があります。

一つ目は confirmation です。

Agent が準備した action を user が確認します。

email 送信、ticket 作成、PR 作成などです。

二つ目は authorization です。

権限を持つ人が、default scope を超える action を許可します。

sensitive metrics の read や restricted tool の利用が該当します。

三つ目は dual control です。

high-risk action に二人、または二つの role の approval を要求します。

production deploy、refund、permission change などです。

gate type によって data model は変わります。

confirmation は user intent を重視します。

authorization は permission scope を重視します。

dual control は separation of duties を重視します。

### approval packet

approval packet は、人が短時間で risk を判断できる形にします。

単に「tool call を許可しますか」と出すだけでは足りません。

含めたい情報は次の通りです。

```text
action summary
tool name
normalized arguments
affected resources
external side effects
estimated cost
risk level
rollback plan
model rationale summary
policy rule that triggered approval
expiration
```

`model rationale summary` は summary で十分です。

complete chain-of-thought を見せる必要はありません。

approver は system がなぜ action を提案したか知る必要があります。

model 内部の推論全文を見る必要はありません。

### approval result

approval result は approve/reject だけにしなくてもよいです。

より細かい result を持てます。

| result | runtime behavior |
| --- | --- |
| approve | original arguments で実行 |
| reject | tool を skip し、Agent に plan 修正を促す |
| modify | approver が修正した arguments で実行 |
| defer | waiting state を維持 |
| expire | approval を expired にする |
| escalate | higher role に回す |

`modify` は実務で便利です。

Agent が email draft を作り、approver が recipient や wording を修正して送る、という流れがあります。

ただし `modify` では、修正後 arguments と approver identity を必ず記録します。

そうしないと audit 時に model proposal と human modification を区別できません。

## MCP/HTTP Boundary

### 三つの deployment pattern

MCP と FastAPI を組み合わせる形は、大きく三つあります。

一つ目は FastAPI が MCP client になる形です。

FastAPI が user request を受け、Agent runner が MCP client 経由で external MCP server を呼びます。

これは business service として最も一般的です。

二つ目は FastAPI が internal tool を包む形です。

既存の internal HTTP API に対して、FastAPI が permission、audit、argument normalization を加え、tool layer として提供します。

三つ目は FastAPI 自体が MCP endpoint を提供する形です。

service capability を複数の Agent client に提供したい場合に向いています。

三つの形は boundary が違います。

同じ handler に混ぜないほうがよいです。

### authentication と credential delegation

MCP server の credential を model に直接見せないでください。

credential の source は複数あります。

- service account;
- per-user OAuth token;
- workspace token;
- short-lived delegated token;
- secret manager からの dynamic read。

credential delegation では三つの問いに答えます。

1. 誰の identity で呼ぶのか。
2. その credential はどの scope を読める、または書けるのか。
3. credential はどこで記録され、どう rotate されるのか。

high-risk tool では short-lived delegated token が向いています。

一つの run の context が漏れても、長期 credential より被害を抑えやすいからです。

### error mapping

MCP や HTTP tool の error を、そのまま user に投げないほうがよいです。

runtime error に map します。

| downstream error | runtime class |
| --- | --- |
| 401 / 403 | permission_denied |
| 404 | resource_not_found |
| 409 | conflict |
| 429 | rate_limited |
| 5xx | downstream_unavailable |
| timeout | downstream_timeout |
| invalid JSON-RPC | protocol_error |
| schema mismatch | tool_contract_error |

error mapping は retry、user message、alert、recovery strategy を決めます。

全部を `tool failed` にすると、system は判断能力を失います。

## Streaming Contract

### frontend が本当に必要とする event

Agent UI が必要とするのは text だけではありません。

説明できる state が必要です。

最低限、次の event type を持つと扱いやすいです。

```text
run.created
run.queued
run.started
step.started
model.delta
model.completed
tool.proposed
tool.started
tool.completed
approval.required
approval.resolved
artifact.created
run.completed
run.failed
run.cancelled
```

各 event は stable schema を持ちます。

frontend が natural language log を parse して state を推測する設計は避けます。

例です。

```json
{
  "type": "tool.completed",
  "run_id": "run_123",
  "step_id": "step_456",
  "sequence": 42,
  "payload": {
    "tool_name": "docs.search",
    "status": "ok",
    "duration_ms": 380
  }
}
```

### disconnect と replay

event stream は必ず切れます。

browser refresh、mobile network、reverse proxy timeout、deploy restart などが原因になります。

そのため event stream は replay を前提にします。

設計の要点です。

- event に increasing sequence がある。
- event に stable event_id がある。
- client が最後に受け取った event_id を保存する。
- reconnect 時に `Last-Event-ID` を送る。
- server が event store から続きを送る。
- event retention が一般的な disconnect window を覆う。

event が memory queue にしかない場合、disconnect 後の UI は何が起きたか分からなくなります。

これは Agent への trust を大きく下げます。

## Trace Schema

### naming convention

trace naming は安定している必要があります。

span name は明確にします。

```text
http POST /agent/runs
agent.run
agent.context.resolve
agent.prompt.build
agent.model.call
agent.tool.call
agent.approval.wait
agent.event.persist
agent.checkpoint.save
agent.artifact.write
```

attribute name も安定させます。

```text
agent.run_id
agent.step_id
agent.workspace_id
agent.model
agent.tool.name
agent.tool.category
agent.approval.required
agent.retry_count
agent.token.input
agent.token.output
agent.cost.usd
```

stable naming があると dashboard、alert、query を再利用できます。

module ごとに自由な名前を付けると、observability data の価値がすぐ下がります。

### sensitive field handling

trace attribute に入れないほうがよいものがあります。

- complete prompt;
- complete user input;
- access token;
- API key;
- cookie;
- raw tool result;
- personal identity information;
- internal stack trace full text。

代わりに低リスクな summary を入れます。

- character length;
- token count;
- hash;
- schema version;
- tool name;
- status code;
- retry count;
- redaction applied;
- error code。

sensitive detail との関連が必要な場合は、controlled storage に置き、trace には reference id だけを入れます。

## Incident Recovery

### runtime incident categories

Agent runtime の incident は impact で分類します。

| type | example | first action |
| --- | --- | --- |
| Provider incident | model API timeout が多発 | fallback model または new run pause |
| Tool incident | 特定 tool が連続失敗 | tool disable と safety state |
| Data incident | retrieval 越権または memory pollution | 関連 scope の read を停止 |
| Cost incident | token cost が急増 | budget と max_steps を下げる |
| Queue incident | worker backlog が増える | rate limit と scale out |
| Streaming incident | event disconnect が多発 | proxy と event store を確認 |
| Approval incident | approval delivery failure | high-risk tool を pause |

incident response で重要なのは runtime switch です。

tool disable、model fallback、budget clamp、queue pause がなければ、incident 時に code change が必要になります。

それでは遅すぎます。

### safe degradation modes

safe degradation mode は事前に定義しておきます。

例です。

```text
read_only_mode
disable_external_side_effects
disable_memory_write
disable_high_cost_models
force_approval_for_all_writes
pause_new_runs
allow_status_reads_only
```

これらの mode は config または management API から有効にできると実用的です。

有効化したら audit log に記録します。

run 作成時にも、その時点の degradation mode を記録します。

そうしないと、後でなぜ tool が突然使えなかったのか分からなくなります。

### 復旧後の data repair

incident recovery は service を戻すだけでは終わりません。

すでに生成された data も扱います。

確認事項です。

- 誤った memory を削除する必要があるか。
- 誤った artifact を hidden にする必要があるか。
- すでに起きた external action に compensation が必要か。
- failed run を batch update する必要があるか。
- user notification が必要か。
- trace と log は review に十分か。
- policy に新しい rule を追加する必要があるか。

Agent runtime の incident review では、少なくとも次の問いに答えます。

```text
which runs were affected
which tools were called
which users could see affected data
which artifacts were produced
which external side effects happened
which controls failed
which controls should be added
```

run、step、event、tool audit がなければ、これらの問いに答えるのは困難です。

## Test Matrix

### HTTP boundary

HTTP boundary test は入口の behavior を確認します。

| scenario | expected |
| --- | --- |
| no token creates run | 401 |
| no workspace permission | 403 |
| empty input | 422 |
| too large input | 422 または 413 |
| unsupported stream mode | 422 |
| read another user's run | 403 または 404 |
| cancel another user's run | 403 |
| approve another user's run | 403 |
| read another run's event stream | 403 |
| downstream unavailable | 503 または明確な error code |

これらの test に real model は不要です。

boundary を test しています。

boundary が安定しているから、internal runner が安全に動けます。

### Policy and tools

tool test では matrix combination を確認します。

| scenario | expected |
| --- | --- |
| normal user sees read-only tools only | pass |
| manager sees restricted read tools | pass |
| normal user requests write tool | reject |
| write tool lacks approval | pause |
| argument crosses workspace | reject |
| argument matches sensitive path | approve or reject |
| tool timeout | step failed with retryable |
| tool returns sensitive fields | redaction applied |
| tool repeated execution | idempotency works |

tool test では fake tool を使います。

real external system に依存しないと permission を検証できない設計は避けます。

### Persistence and recovery

persistence test は state consistency を確認します。

| scenario | expected |
| --- | --- |
| enqueue fails after run creation | run marked failed or queued_retry |
| worker restarts during execution | resume after checkpoint |
| restart after approval creation | approval remains readable |
| event stream disconnects | replay from last event |
| resume after tool success | no duplicate side effect |
| artifact write fails | partial state or explicit error |
| cancel races with tool completion | deterministic transition |
| two workers claim same run | only one obtains lease |

これらの test は real database、またはそれに近い test database が必要です。

in-memory mock だけでは concurrency と transaction の問題を見つけにくいです。

### Observability

observability test は dashboard の見た目を見るものではありません。

critical fields が存在することを確認します。

| scenario | expected |
| --- | --- |
| create run | log has request_id and run_id |
| model call | span has model、token、latency |
| tool call | span has tool name and status |
| approval wait | event and span can be correlated |
| error | span status is error |
| retry | retry_count increases |
| cost | metric can group by model |
| queue delay | metric is observable |

test environment では in-memory exporter を使えます。

real observability platform に接続しなくても instrumentation を検証できます。

## FAQ

### FastAPI は Agent runtime に向いていますか？

HTTP boundary、dependency wiring、authentication、event API、management API には向いています。

durable workflow、queue、model orchestration framework、tool protocol の代替ではありません。

FastAPI は境界に置くと強いです。

### `/chat` は使ってはいけませんか？

使って構いません。

ただし `/chat` は `POST /agent/runs` の同期 wrapper または compatibility endpoint にするのが安全です。

内部では run を作り、event を記録し、permission と trace を適用します。

### いつ background queue が必要ですか？

run が数秒を超える可能性がある場合。

retry、approval、resume、external side effect がある場合。

その場合は synchronous handler だけで抱え込まないほうがよいです。

### SSE と WebSocket はどちらがよいですか？

一方向の progress stream なら SSE を default にしやすいです。

双方向 collaboration、realtime control、複雑な interaction が必要なら WebSocket を検討します。

token delta だけなら通常の streaming でも足ります。

ただし Agent runtime では event type が必要になるため、SSE はよい出発点です。

### MCP を使えば tool permission は不要ですか？

不要にはなりません。

MCP は tool discovery と tool invocation の protocol です。

user permission、tenant isolation、approval policy、audit requirement は application 側で設計します。

### OpenTelemetry の auto instrumentation だけで足りますか？

足りません。

HTTP layer は見えますが、Agent run、model call、tool call、approval wait、checkpoint restore は business instrumentation が必要です。

### AgentContext を prompt に入れるべきですか？

必要な、整形済みの、task に関係する情報だけを入れます。

identity、permission、trace、secret、内部 policy object をそのまま prompt に入れないでください。

### tool の二重実行を避けるには？

external side effect tool に idempotency key を持たせます。

step store に tool call status を記録します。

resume 前に、その step がすでに成功していないか確認します。

### approval は UX を悪くしませんか？

遅くはなります。

しかし高リスク操作は、そもそも即時自動化に見せかけるべきではありません。

よい設計では、Agent が proposal、impact、arguments summary を作り、人間が素早く判断できます。

### test の重点は何ですか？

model が毎回同じ文章を返すことを証明することではありません。

重要なのは boundary が安定していることです。

- unauthorized request が入れない。
- high-privilege tool が見えない。
- dangerous action が pause される。
- cancel 後に side effect が続かない。
- failure 後に resume または明確な termination ができる。
- trace で critical path を追える。

## まとめ

FastAPI は Agent framework ではありません。

しかし Agent runtime の最重要 boundary layer になれます。

HTTP request、identity、permission、shared resource、run state、event stream、approval、observability、recovery を整理する役割を持てます。

Agent framework は「task をどう完了するか」を担当します。

FastAPI boundary は「その task は実行してよいのか、どの範囲で実行するのか、どう観測するのか、失敗したらどう扱うのか」を担当します。

この二つを分けると、Agent backend は単なる chat API ではなくなります。

team が test でき、deploy でき、audit でき、継続的に改善できる execution system になります。

## 参考リンク

- [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [FastAPI Middleware](https://fastapi.tiangolo.com/tutorial/middleware/)
- [FastAPI Lifespan Events](https://fastapi.tiangolo.com/advanced/events/)
- [FastAPI Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [FastAPI StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/)
- [OpenTelemetry Python Instrumentation](https://opentelemetry.io/docs/languages/python/instrumentation/)
- [OpenTelemetry FastAPI Instrumentation](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html)
- [Model Context Protocol Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [Model Context Protocol Authorization](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization)
