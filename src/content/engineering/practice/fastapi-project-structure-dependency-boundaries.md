---
title: "FastAPI 项目结构与依赖边界：从 demo 走向可维护服务"
date: 2026-05-14
category: engineering
description: "用 APIRouter、依赖注入、settings、service/repository 分层和测试覆盖，把 FastAPI 项目从单文件 demo 推到可演进的生产结构。"
difficulty: intermediate
plainSummary: "FastAPI 项目变大以后，真正的问题不是文件夹怎么命名，而是请求入口、业务规则、外部系统、settings、数据库会话和测试替身之间的依赖方向是否清楚。"
tags:
  - "FastAPI"
  - "Python"
  - "Architecture"
lang: zh
coverImage: "/images/engineering/practice/fastapi-project-structure/project-structure-cover.png"
draft: false
---

# FastAPI 项目结构与依赖边界：从 demo 走向可维护服务

> 时效边界：本文核验于 2026-05-14。FastAPI 的 `APIRouter`、依赖注入、测试依赖覆盖和 lifespan 行为请以当前官方文档为准。

FastAPI 最容易让人产生错觉的地方，是它可以非常快地写出一个能跑的 demo。

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
```

这很好。

但生产服务的复杂度不会停在这里。很快你会遇到：

- 路由越来越多，`main.py` 变成巨大文件；
- handler 里混着鉴权、校验、业务规则、数据库查询和外部 API；
- settings 到处直接读环境变量，测试很难替换；
- 数据库 session 生命周期不清楚；
- service 互相 import，循环依赖开始出现；
- 想拆服务时，不知道边界在哪里。

项目结构的目标不是“看起来像某个模板”，而是让依赖方向、变更边界和测试替换点清楚。

![FastAPI 项目结构蓝图](/images/engineering/practice/fastapi-project-structure/project-structure-cover.png)

## 一句话原则

一个可维护的 FastAPI 项目，应该让 HTTP 层变薄，让业务规则可测试，让外部系统可替换，让 settings 和资源生命周期集中管理。

可以把它理解成四条边界：

| 边界 | 负责什么 | 不应该负责什么 |
| --- | --- | --- |
| Router | HTTP path、method、request/response schema、status code | 复杂业务规则、外部系统细节 |
| Dependency | 组装当前请求需要的上下文和资源 | 写业务流程 |
| Service | 业务动作、用例编排、事务边界 | 解析 HTTP、读取环境变量 |
| Adapter / Repository | 数据库、外部 API、队列、对象存储 | 决定产品规则 |

FastAPI 官方的 bigger applications 文档推荐用 `APIRouter` 拆分多文件应用；依赖系统则负责在 path operation 执行前注入所需对象。这两个能力组合起来，才是工程结构的核心。

## 推荐目录结构

下面不是唯一答案，但它足够稳妥，适合从小团队走向生产服务。

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

关键不是文件夹名字，而是依赖方向：

```text
api/routes -> api/deps -> services -> repositories/integrations
core      -> 被其他层读取
domain    -> 被 services/repositories 共享
```

不要让 `repositories` import `api.routes`。不要让 `domain` 依赖 FastAPI。不要让 `services` 直接读 `Request`，除非你明确把它当成 web-only service。

![FastAPI 依赖边界流转图](/images/engineering/practice/fastapi-project-structure/dependency-boundary-flow.png)

## `main.py` 应该很薄

`main.py` 的职责是创建 app、注册路由、注册 middleware、注册 lifespan。

```python
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI

from app.api.routes import health, runs, users
from app.core.config import Settings, get_settings
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

这个文件不应该包含几十个 endpoint，也不应该出现复杂 SQL、prompt 拼接或外部 API 重试策略。

## Router 只处理 HTTP 语义

Router 可以做三件事：

- 声明 path、method、status code；
- 接收 request schema，返回 response schema；
- 调用 service。

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

这段代码的好处是：

- handler 很薄；
- `RequestContext` 可以集中包含 tenant、user、trace id、权限；
- `RunService` 可以在测试里替换；
- OpenAPI schema 仍然清楚。

## Dependency 是 composition root

很多团队会把 FastAPI dependency 写成“方便调用的函数”。这很容易失控。

更稳妥的做法是：把 dependency 当成 request-level composition root。

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

这里的 dependency 不写业务流程。它只组装对象。

如果你发现 dependency 里开始出现“如果订单是企业版就走另一个流程”，那通常应该下沉到 service。

## Settings 不要散落在全局

生产服务里，settings 最常见的坑是：

- import 时就读取环境变量；
- 测试时不好替换；
- 多个模块各自读一遍 `.env`；
- settings 和 secret 混在一起，不知道哪里会被日志打印。

建议：

- settings 只在 app 启动或明确 dependency 中创建；
- 业务层通过构造参数接收配置；
- 测试使用 dependency override 或 app factory 传入测试 settings；
- secret 不要进入普通日志。

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

如果你使用 `@lru_cache`，测试里要记得清理缓存，或者在 app factory 中显式注入 settings，避免测试之间互相污染。

## Service 层承载用例

Service 不应该知道 HTTP header，也不应该直接拼 response code。

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

这样做的价值是：你可以不启动 ASGI app，也能测试核心业务。

```python
async def test_create_run_rejects_too_many_steps(fake_repository):
    service = RunService(repository=fake_repository, max_steps=3)

    with pytest.raises(RunLimitExceeded):
        await service.create_run(
            payload=RunCreate(task="summarize", max_steps=10),
            context=RequestContext("tenant-1", "user-1", "trace-1"),
        )
```

## Repository 和 integration 负责外部世界

Repository 负责数据库持久化。Integration 负责外部服务。

它们应该隐藏外部系统的细节，但不应该隐藏业务含义。

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

不要在 repository 里判断“这个用户是否能创建 run”。那是业务规则。

## 错误边界

错误也应该分层。

| 层 | 抛出什么 | 转换在哪里发生 |
| --- | --- | --- |
| Service | 业务异常，如 `RunLimitExceeded` | exception handler |
| Repository | 数据库异常或封装后的持久化异常 | service 或 handler |
| Integration | timeout、rate limit、upstream error | service 统一决策 |
| Router | 请求 schema 错误 | FastAPI / Pydantic |

可以在 app 注册 exception handler：

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

这样 service 保持业务语言，HTTP 转换集中在应用边界。

## 测试替换点

FastAPI 官方提供 `app.dependency_overrides`，可以在测试中替换 dependency。

这非常适合替换：

- 当前用户；
- settings；
- 数据库 session；
- service；
- 外部 API client。

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

注意最后的 `clear()`。测试污染是大型 FastAPI 项目里非常隐蔽的失败来源。

## 项目结构审查图

每次服务变大时，可以用下面这张图做一次结构审查。

![FastAPI 项目结构质量门](/images/engineering/practice/fastapi-project-structure/project-structure-review-gates.png)

审查重点不是“有没有这些文件夹”，而是：

- 路由是否足够薄；
- dependency 是否只组装对象；
- service 是否可以离开 HTTP 单独测试；
- repository 是否只处理持久化；
- integration 是否封装外部系统错误；
- settings 是否有单一入口；
- 测试是否能替换关键依赖；
- 日志和 trace 是否能贯穿请求。

## 反模式

**反模式一：所有东西都放在 `main.py`。**

这会让 demo 很快，但会让协作、测试和重构很慢。

**反模式二：按技术类型分层，但业务边界消失。**

只有 `models/`、`schemas/`、`crud/`、`utils/`，最后所有业务都挤进 `utils`。建议至少让 service 以用例或领域命名。

**反模式三：dependency 里写业务流程。**

Dependency 应该组装上下文，不应该决定业务分支。

**反模式四：全局 client 到处 import。**

全局 client 很方便，但测试、关闭连接、重载配置和 trace 注入都会变难。

**反模式五：为了未来微服务过度拆分。**

先把模块边界做清楚。只有当团队、数据、发布频率或可靠性要求真的分离时，再拆服务。

## 落地模板

```text
服务名称：
主要用例：

HTTP 层：
- router 文件：
- request schema：
- response schema：

依赖层：
- request context：
- settings：
- database session：
- external clients：

业务层：
- service：
- 关键业务规则：
- 业务异常：

外部系统：
- repository：
- integrations：
- timeout / retry：

测试：
- service unit tests：
- API tests：
- dependency overrides：
- contract / integration tests：

可观测性：
- request id / trace id：
- structured logs：
- metrics：
- error mapping：
```

> **示例填法（AI Agent run service）**
>
> 服务名称：agent-run-service
> 主要用例：接收用户请求，创建 Agent run，返回 run_id 并暴露事件流
> HTTP 层：router 文件=api/routes/runs.py；request schema=RunCreateRequest；response schema=RunCreatedResponse
> 依赖层：request context=CurrentUser+Workspace；settings=AgentRuntimeSettings；database session=AsyncSession；external clients=ModelClient/MCPClient
> 业务层：service=RunService；关键业务规则=先持久化 run 再调 runner；业务异常=RunLimitExceeded、ToolNotAllowed
> 外部系统：repository=RunRepository；integrations=ModelGateway、VectorStore；timeout / retry=模型 60s、工具 20s、retry 2
> 测试：service unit tests=权限和状态转换；API tests=201/403/429；dependency overrides=fake user/session；contract / integration tests=MCP tool schema
> 可观测性：request id / trace id=每个 run 继承；structured logs=run_id/tool/status；metrics=run_started_total/run_failed_total；error mapping=domain error → HTTP status

## 检查清单

- `main.py` 是否只负责 app composition？
- 每个 router 是否有清楚的 prefix、tag、schema？
- handler 是否避免直接写复杂业务流程？
- dependency 是否只负责组装对象和请求上下文？
- service 是否能不启动 HTTP 服务单独测试？
- settings 是否集中管理，并能在测试中替换？
- 数据库 session 生命周期是否明确？
- 外部 API client 是否有 timeout、错误映射和关闭逻辑？
- 测试是否清理 `dependency_overrides`？
- 错误响应是否有稳定 `code`，而不是只返回字符串？

## 继续阅读

- [给 AI 智能体开发者的 FastAPI](./fastapi-agent-runtime-patterns/)：把这里的 dependency 边界进一步用于 Agent Runtime。
- [FastAPI 架构与可观测性决策指南](./fastapi-architecture-observability-for-tls/)：从项目结构继续走向服务拆分和 OpenTelemetry。
- [uv 工程实践](./uv-python-project-workflow/)：用 uv 把本地、CI 和服务命令统一起来。

## 参考

- [FastAPI: Bigger Applications - Multiple Files](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [FastAPI: Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [FastAPI: Testing Dependencies with Overrides](https://fastapi.tiangolo.com/advanced/testing-dependencies/)
