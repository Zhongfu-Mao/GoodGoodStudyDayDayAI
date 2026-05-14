---
title: "FastAPI のプロジェクト構造と依存境界：demo から保守できるサービスへ"
date: 2026-05-14
category: engineering
description: "APIRouter、依存性注入、settings、service/repository 分離、テスト置き換えを使い、FastAPI プロジェクトを単一ファイル demo から進化できる本番構造へ移す。"
difficulty: intermediate
plainSummary: "FastAPI プロジェクトが大きくなったときに大事なのはフォルダ名ではなく、HTTP 入口、業務ルール、外部システム、settings、DB session、テスト用の差し替え点の依存方向が明確かどうかです。"
tags:
  - "FastAPI"
  - "Python"
  - "Architecture"
lang: ja
coverImage: "/images/engineering/practice/fastapi-project-structure/project-structure-cover.png"
draft: false
---

# FastAPI のプロジェクト構造と依存境界：demo から保守できるサービスへ

> 時点の前提：この記事は 2026-05-14 に確認しています。FastAPI の `APIRouter`、依存性注入、テスト用 dependency override、lifespan の挙動は、利用時点の公式ドキュメントで確認してください。

FastAPI は、とても速く動く demo を作れます。

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

これは大きな利点です。

ただし、本番サービスの複雑さはここで止まりません。すぐに次の問題が出ます。

- route が増え、`main.py` が巨大になる。
- handler に認証、validation、業務ルール、DB、外部 API が混ざる。
- settings があちこちで環境変数を読む。
- database session の lifetime が曖昧になる。
- service 同士が import し合い、循環依存が起きる。
- サービス分割を考えるとき、境界が見えない。

プロジェクト構造の目的は、特定のテンプレートに似せることではありません。依存方向、変更境界、テストでの差し替え点を明確にすることです。

![FastAPI project structure blueprint](/images/engineering/practice/fastapi-project-structure/project-structure-cover.png)

## 原則

保守しやすい FastAPI プロジェクトでは、HTTP 層を薄くし、業務ルールをテスト可能にし、外部システムを差し替え可能にし、settings と resource lifetime を集中管理します。

境界は四つに分けて考えると扱いやすくなります。

| 境界 | 責務 | 責務ではないもの |
| --- | --- | --- |
| Router | HTTP path、method、request/response schema、status code | 複雑な業務ルール、外部システム詳細 |
| Dependency | request に必要な context と resource の組み立て | 業務 workflow |
| Service | use case、業務判断、transaction boundary | HTTP parsing、環境変数読み取り |
| Adapter / Repository | DB、外部 API、queue、object storage | 製品ルールの決定 |

FastAPI 公式の bigger applications は `APIRouter` による複数ファイル構成を説明し、dependency system は path operation の前に必要な object を注入します。この二つを組み合わせることが、FastAPI の実務構造の中心です。

## 推奨ディレクトリ構造

これは唯一の正解ではありません。ただ、小さな team から本番サービスへ進むには十分に安定しています。

```text
app/
  main.py
  api/
    routes/
      health.py
      users.py
      runs.py
    deps.py
  core/
    config.py
    logging.py
    security.py
  domain/
    users.py
    runs.py
  services/
    user_service.py
    run_service.py
  repositories/
    user_repository.py
    run_repository.py
  integrations/
    llm_client.py
    vector_store.py
    billing_client.py
  db/
    session.py
    migrations/
  tests/
    conftest.py
    test_users_api.py
```

重要なのは名前より依存方向です。

```text
api/routes -> api/deps -> services -> repositories/integrations
core      -> 他の層から読まれる
domain    -> services/repositories が共有する
```

`repositories` が `api.routes` を import してはいけません。`domain` が FastAPI に依存しないほうがよいです。`services` が直接 `Request` を読むなら、その service は web 専用であることを明示します。

![FastAPI dependency boundary flow](/images/engineering/practice/fastapi-project-structure/dependency-boundary-flow.png)

## `main.py` は薄くする

`main.py` の責務は app 作成、router 登録、middleware 登録、lifespan 登録です。

```python
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI

from app.api.routes import health, runs, users
from app.core.config import Settings
from app.core.config import get_settings
from app.integrations.llm_client import LLMClient


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    app.state.settings = settings
    app.state.llm_client = LLMClient(api_key=settings.openai_api_key)
    yield
    await app.state.llm_client.aclose()


def create_app() -> FastAPI:
    app = FastAPI(title="AI Backend", lifespan=lifespan)
    app.include_router(health.router)
    app.include_router(users.router, prefix="/users", tags=["users"])
    app.include_router(runs.router, prefix="/runs", tags=["runs"])
    return app


app = create_app()
```

このファイルに大量の endpoint、SQL、prompt assembly、外部 API retry policy を置かないようにします。

## Router は HTTP 意味論を扱う

Router の仕事は三つです。

- path、method、status code を宣言する。
- request schema と response schema を受け渡す。
- service を呼び出す。

```python
from fastapi import APIRouter, Depends, status

from app.api.deps import RequestContext, get_request_context, get_run_service
from app.domain.runs import RunCreate, RunRead
from app.services.run_service import RunService

router = APIRouter()


@router.post("/", response_model=RunRead, status_code=status.HTTP_201_CREATED)
async def create_run(
    payload: RunCreate,
    context: RequestContext = Depends(get_request_context),
    service: RunService = Depends(get_run_service),
) -> RunRead:
    return await service.create_run(payload=payload, context=context)
```

handler が薄いと、`RequestContext` に tenant、user、trace id、permission を集約でき、`RunService` はテストで差し替えやすくなります。

- handler が薄い。
- `RequestContext` に tenant、user、trace id、permission を集約できる。
- `RunService` をテストで差し替えられる。
- OpenAPI schema は明確なまま保てる。

## Dependency は composition root

FastAPI dependency は便利な helper ではなく、request-level composition root として扱うと安定します。

多くの team は FastAPI dependency を「呼び出しに便利な関数」として書きがちです。これは簡単に制御不能になります。

より安定するのは、dependency を request-level composition root として扱うことです。

```python
from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, Header, Request

from app.core.config import Settings
from app.db.session import AsyncSession, get_session
from app.repositories.run_repository import RunRepository
from app.services.run_service import RunService


@dataclass(frozen=True)
class RequestContext:
    tenant_id: str
    user_id: str
    trace_id: str


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


async def get_request_context(
    x_tenant_id: Annotated[str, Header()],
    x_user_id: Annotated[str, Header()],
    x_trace_id: Annotated[str | None, Header()] = None,
) -> RequestContext:
    return RequestContext(
        tenant_id=x_tenant_id,
        user_id=x_user_id,
        trace_id=x_trace_id or "missing-trace-id",
    )


async def get_run_service(
    session: AsyncSession = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> RunService:
    repository = RunRepository(session=session)
    return RunService(repository=repository, max_steps=settings.max_agent_steps)
```

dependency は object を組み立てます。業務分岐を書き始めたら、多くの場合 service に移すべきです。

## Settings を散らさない

本番サービスでは、settings の扱いが後から効いてきます。

- import 時に環境変数を読む。
- テストで置き換えられない。
- 複数 module がそれぞれ `.env` を読む。
- secret が通常ログに混ざる。

おすすめは、settings を app 起動時または明示的な dependency で作り、業務層には constructor argument として渡すことです。

- settings は app 起動時、または明示的な dependency の中だけで作る。
- 業務層は constructor argument で設定を受け取る。
- テストでは dependency override または app factory で test settings を渡す。
- secret を通常 log に入れない。

```python
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    openai_api_key: str
    max_agent_steps: int = 8
    request_timeout_seconds: float = 30.0


@lru_cache
def load_settings() -> Settings:
    return Settings()
```

`@lru_cache` を使う場合、テストでは cache clear か app factory での明示注入が必要です。

## Service は use case を持つ

Service は HTTP header や response code を知りすぎないようにします。

```python
from app.domain.runs import RunCreate, RunRead
from app.repositories.run_repository import RunRepository


class RunService:
    def __init__(self, repository: RunRepository, max_steps: int) -> None:
        self.repository = repository
        self.max_steps = max_steps

    async def create_run(self, payload: RunCreate, context: RequestContext) -> RunRead:
        if payload.max_steps > self.max_steps:
            raise RunLimitExceeded(limit=self.max_steps)

        run = await self.repository.create(
            tenant_id=context.tenant_id,
            user_id=context.user_id,
            task=payload.task,
            max_steps=payload.max_steps,
        )
        return RunRead.model_validate(run)
```

この形なら、ASGI app を起動しなくても中核の業務 rule を test できます。

```python
async def test_create_run_rejects_too_many_steps(fake_repository):
    service = RunService(repository=fake_repository, max_steps=3)

    with pytest.raises(RunLimitExceeded):
        await service.create_run(
            payload=RunCreate(task="summarize", max_steps=10),
            context=RequestContext("tenant-1", "user-1", "trace-1"),
        )
```

## Repository と integration

Repository は永続化を扱い、integration は外部 service を扱います。

外部 system の詳細は隠しますが、業務意味まで隠しすぎないことが大事です。

```python
class RunRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(
        self,
        *,
        tenant_id: str,
        user_id: str,
        task: str,
        max_steps: int,
    ) -> RunRecord:
        record = RunRecord(
            tenant_id=tenant_id,
            user_id=user_id,
            task=task,
            max_steps=max_steps,
        )
        self.session.add(record)
        await self.session.flush()
        return record
```

Repository の中で「この user は run を作れるか」を決めると、業務 rule が見えなくなります。

## Error boundary

error も層で分けます。

| 層 | 投げるもの | 変換場所 |
| --- | --- | --- |
| Service | `RunLimitExceeded` などの業務例外 | exception handler |
| Repository | DB 例外または永続化例外 | service または handler |
| Integration | timeout、rate limit、upstream error | service が判断 |
| Router | request schema error | FastAPI / Pydantic |

app に exception handler を登録できます。

```python
from fastapi import Request
from fastapi.responses import JSONResponse


async def run_limit_handler(request: Request, exc: RunLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "code": "run_limit_exceeded",
            "message": f"max_steps must be <= {exc.limit}",
        },
    )
```

HTTP response への変換は app boundary に寄せると、service は業務語彙を保てます。

## テストで差し替える

FastAPI の `app.dependency_overrides` は、テストで dependency を差し替えるための強力な仕組みです。

これは次の差し替えに向いています。

- current user。
- settings。
- database session。
- service。
- external API client。

```python
from fastapi.testclient import TestClient

from app.main import create_app
from app.api.deps import get_run_service


class FakeRunService:
    async def create_run(self, payload, context):
        return {"id": "run_test", "task": payload.task, "status": "created"}


def test_create_run_api():
    app = create_app()
    app.dependency_overrides[get_run_service] = lambda: FakeRunService()

    client = TestClient(app)
    response = client.post(
        "/runs/",
        json={"task": "summarize", "max_steps": 3},
        headers={"x-tenant-id": "tenant-1", "x-user-id": "user-1"},
    )

    assert response.status_code == 201
    assert response.json()["status"] == "created"

    app.dependency_overrides.clear()
```

最後の `clear()` は地味ですが重要です。テスト汚染は、大きな FastAPI project で見つけにくい失敗になります。

## 構造 review の観点

service が大きくなるたびに、この図で構造 review をすると判断しやすくなります。

![FastAPI project structure quality gates](/images/engineering/practice/fastapi-project-structure/project-structure-review-gates.png)

見るべきことは、フォルダがあるかどうかではありません。

- route は薄いか。
- dependency は object と context の組み立てに集中しているか。
- service は HTTP なしで test できるか。
- repository は永続化に集中しているか。
- integration は外部 system error を変換しているか。
- settings は一つの入口を持つか。
- key dependency を test で差し替えられるか。
- log と trace は request 全体を追えるか。

## よくあるアンチパターン

**アンチパターン 1：すべてを `main.py` に置く。**

demo は速いですが、協働、テスト、refactor が重くなります。

**アンチパターン 2：技術別に分けたつもりで業務境界が消える。**

`models/`、`schemas/`、`crud/`、`utils/` だけだと、最後はすべて `utils` に流れがちです。service は use case または domain で命名すると見通しがよくなります。

**アンチパターン 3：dependency に業務 workflow を書く。**

Dependency は context を組み立てます。業務判断は service に寄せます。

**アンチパターン 4：global client をどこからでも import する。**

便利ですが、test、connection close、config reload、trace injection が難しくなります。

**アンチパターン 5：未来の microservice を想像して分割しすぎる。**

まず module boundary を明確にします。team、data、release frequency、reliability requirement が分かれたときに service 分割を考えます。

## 落とし込みテンプレート

```text
サービス名：
主要 use case：

HTTP 層：
- router file：
- request schema：
- response schema：

Dependency 層：
- request context：
- settings：
- database session：
- external clients：

業務層：
- service：
- 重要な業務 rule：
- 業務例外：

外部 system：
- repository：
- integrations：
- timeout / retry：

テスト：
- service unit tests：
- API tests：
- dependency overrides：
- contract / integration tests：

可観測性：
- request id / trace id：
- structured logs：
- metrics：
- error mapping：
```

> **記入例（AI Agent run service）**
>
> サービス名：agent-run-service
> 主要 use case：ユーザー request を受け、Agent run を作成し、run_id と event stream を返します
> HTTP 層：router file=api/routes/runs.py；request schema=RunCreateRequest；response schema=RunCreatedResponse
> Dependency 層：request context=CurrentUser+Workspace；settings=AgentRuntimeSettings；database session=AsyncSession；external clients=ModelClient/MCPClient
> 業務層：service=RunService；重要な業務 rule=run を保存してから runner を呼びます；業務例外=RunLimitExceeded、ToolNotAllowed
> 外部 system：repository=RunRepository；integrations=ModelGateway、VectorStore；timeout / retry=model 60s、tool 20s、retry 2
> テスト：service unit tests=権限と状態遷移；API tests=201/403/429；dependency overrides=fake user/session；contract / integration tests=MCP tool schema
> 可観測性：request id / trace id=各 run に引き継ぎます；structured logs=run_id/tool/status；metrics=run_started_total/run_failed_total；error mapping=domain error → HTTP status

## チェックリスト

- `main.py` は app composition に集中しているか？
- 各 router に prefix、tag、schema があるか？
- handler に複雑な業務 workflow が入っていないか？
- dependency は object と request context を組み立てているだけか？
- service は HTTP service を起動せずに test できるか？
- settings は集中管理され、test で置き換えられるか？
- database session の lifetime は明確か？
- external API client に timeout、error mapping、close logic があるか？
- test は `dependency_overrides` を clear しているか？
- error response は安定した `code` を持つか？

## さらに読む

- [AI Agent 開発者のための FastAPI](./fastapi-agent-runtime-patterns/)：dependency boundary を Agent Runtime に応用する。
- [FastAPI アーキテクチャと可観測性の意思決定ガイド](./fastapi-architecture-observability-for-tls/)：service split と OpenTelemetry へ進む。
- [uv 実践ガイド](./uv-python-project-workflow/)：local、CI、service command を uv でそろえる。

## 参考

- [FastAPI: Bigger Applications - Multiple Files](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [FastAPI: Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [FastAPI: Testing Dependencies with Overrides](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
