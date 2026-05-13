---
title: "给 Node.js 开发者的 FastAPI 迁移地图：Express 概念如何落到 Python"
date: 2026-05-13
category: engineering
description: "把 Express 的路由、中间件、错误处理、异步模型和 npm 工作流，对照到 FastAPI、asyncio 与 uv 的工程实践。"
difficulty: intermediate
plainSummary: "Node.js 开发者学习 FastAPI 时，不应只找语法替代品，而要理解请求模型、依赖注入、类型提示、asyncio 和 uv 共同形成的新工程边界。"
tags:
  - "FastAPI"
  - "Python"
  - "AI Engineering"
lang: zh
coverImage: "/images/engineering/practice/fastapi-express-migration-cover.png"
draft: false
---

# 给 Node.js 开发者的 FastAPI 迁移地图：Express 概念如何落到 Python

> 时效边界：本文核验于 2026-05-13。FastAPI、Pydantic、uv、Python asyncio、ASGI 服务器和相关部署工具仍会继续演进；落地前请复查官方文档、团队运行时版本和生产平台约束。

如果你已经熟悉 Express，迁移到 FastAPI 时最容易犯的错误，不是 Python 语法写错，而是把 FastAPI 当成“Python 版 Express”来用。两者都能写 HTTP API，都有 router、middleware、request、response、error handler，也都能接数据库、认证、日志、测试和部署。但它们的默认工程心智并不一样。

Express 的中心通常是请求对象和中间件链：请求进入应用，依次穿过 middleware、router 和 handler，handler 从 `req` 取数据，用 `res` 写响应，异常通过 `next(err)` 或统一错误中间件收口。FastAPI 的中心则是函数签名、类型提示、Pydantic 模型、依赖注入和 OpenAPI 契约：路径参数、查询参数、请求体、Header、Cookie、认证上下文、数据库会话和响应模型，都可以在函数签名附近被明确声明。

这意味着迁移不是简单替换 API：

- `req.params.id` 不是机械改成 `request.path_params["id"]`，而是改成 `user_id: str`。
- `req.body` 不是机械改成 `await request.json()`，而是改成 Pydantic 输入模型。
- `res.json(user)` 不是机械改成 `JSONResponse(user)`，而是多数时候直接 `return user`，并用 `response_model` 控制输出边界。
- `next(err)` 不是机械改成某个回调，而是用 `raise HTTPException(...)` 和异常处理器表达失败语义。
- middleware 不是所有前置逻辑的唯一归宿；FastAPI 的 dependency 往往才是业务上下文、认证、权限和资源生命周期的核心。

本文的目标，是给 Node.js / Express 开发者一张可以真正拿来迁移服务、评审代码和排查生产问题的地图。它不会只停在语法对照，而会覆盖迁移心智、路由、请求与响应、dependency 与 middleware、错误处理、验证、异步陷阱、测试、项目结构、安全、部署、迁移清单、代码评审清单、反模式和 FAQ。

![Express 到 FastAPI 的迁移地图](/images/engineering/practice/express-to-fastapi-concept-map.svg)

![FastAPI 请求生命周期可视化](/images/engineering/practice/fastapi-request-lifecycle-visual.png)

## 先用一张表建立坐标系

| Express / Node.js | FastAPI / Python | 迁移时真正要改的心智 |
| --- | --- | --- |
| `app.get("/users/:id", handler)` | `@router.get("/users/{user_id}")` | 路由装饰器同时承担注册、类型契约和 OpenAPI 元数据 |
| `express.Router()` | `APIRouter()` | 按业务模块拆 router，再在应用入口集中挂载 |
| `req.params.id` | `user_id: str` | 路径参数进入函数签名，由类型系统参与校验 |
| `req.query.page` | `page: int = Query(1, ge=1)` | 查询参数可以声明默认值、范围、描述和示例 |
| `req.body` | `payload: UserCreate` | 请求体验证应前移到 Pydantic 模型 |
| `req.headers.authorization` | `authorization: str \| None = Header(None)` | Header 可声明为参数，但认证上下文更适合 dependency |
| `res.status(201).json(data)` | `@router.post(..., status_code=201)` + `return data` | 状态码、响应模型和返回值分开声明 |
| `res.locals` | dependency 返回值 / `request.state` | 请求级业务上下文优先用 dependency，底层横切状态再用 `request.state` |
| `next(err)` | `raise HTTPException(...)` | HTTP 失败走异常语义，而不是回调链 |
| error middleware | exception handler | 统一错误格式由异常处理器收口 |
| middleware | middleware + dependency | 横切协议层逻辑用 middleware，业务资源和权限用 dependency |
| `Promise.all` | `asyncio.gather` / `TaskGroup` | Python coroutine 不会因为被创建就自动并行执行 |
| `setTimeout` / job queue | background task / worker / scheduler | 请求内 background task 不是可靠任务队列 |
| `package.json` | `pyproject.toml` | 项目元数据、依赖、工具配置集中在标准 Python 项目文件 |
| `package-lock.json` | `uv.lock` | 锁文件应提交，CI 应按锁文件同步 |
| `npm run dev` | `uv run fastapi dev` / `uv run uvicorn ...` | 命令通过项目环境执行，而不是依赖全局 Python |
| Jest / Vitest + supertest | pytest + TestClient / httpx | 测试应覆盖 schema、依赖覆盖、错误格式和异步边界 |
| `helmet`, `cors`, rate limit middleware | CORS middleware + security dependencies + gateway policy | 安全能力通常分布在应用、反向代理和平台层 |
| PM2 / node process | Uvicorn / Gunicorn / platform runtime | 生产部署要理解 ASGI worker、lifespan、代理头和健康检查 |

这张表的核心结论很简单：FastAPI 的入口不是 `req`，而是函数签名；FastAPI 的可维护性不是来自“少写几行代码”，而是来自“把输入、输出、依赖和失败边界声明清楚”。

## 迁移心智模型：从链式处理改成契约驱动

Express 的典型请求心智是链式的：

```text
request
  -> global middleware
  -> router middleware
  -> handler
  -> res.status(...).json(...)
  -> error middleware when next(err)
```

FastAPI 的典型请求心智更像契约解析：

```text
request
  -> ASGI middleware
  -> route match
  -> dependency graph resolution
  -> parameter parsing and validation
  -> path operation function
  -> response model filtering
  -> exception handlers or response serialization
```

这两种模型差异很大。Express 里，很多行为藏在运行时对象上：`req.user` 是哪个 middleware 塞进去的，`res.locals.tenant` 是谁写的，`next` 被调用几次，错误对象有没有 `statusCode`，都要靠约定和阅读链路。FastAPI 则鼓励把这些约定拉到函数边界：这个 endpoint 需要 `CurrentUser`，需要 `Session`，需要 `TenantContext`，需要 `limit` 在 `1..100` 之间，都会出现在声明里。

迁移时可以采用三个原则。

第一，把“从 request 里取东西”改成“让框架把东西注入给函数”。路径参数、查询参数、请求体、Header、Cookie、认证用户、数据库会话，都不要默认从底层 `Request` 手动挖。

第二，把“handler 内手动检查”改成“边界模型自动校验”。如果字段必填、格式、枚举、长度、数字范围、嵌套结构、默认值可以通过 Pydantic 表达，就不要散落在 handler 里。

第三，把“业务对象直接返回”改成“响应模型过滤输出”。Express 项目里常见 `res.json(user)`，但迁移到 FastAPI 后，应该认真声明 `UserOut`，只暴露 API 契约允许暴露的字段。

## 一次请求在 FastAPI 中发生了什么

理解请求生命周期，能避免很多“为什么 middleware 拿不到这个值”“为什么 dependency 先执行”“为什么异常格式不一致”的问题。

一个常见请求大致会经过这些阶段：

1. ASGI server 接收连接和 HTTP 事件。
2. 应用级 middleware 先处理原始 request。
3. FastAPI / Starlette 匹配路由。
4. 解析 path operation 的函数签名。
5. 解析并执行 dependency graph。
6. 读取并验证 path、query、header、cookie、body。
7. 调用 endpoint 函数。
8. 根据返回值、`response_model`、状态码和响应类序列化。
9. 如果过程中抛出异常，由匹配的 exception handler 生成响应。
10. response 再经过 middleware 返回给 server。

这解释了一个重要边界：middleware 在 dependency 之前运行。middleware 适合处理还没有进入业务语义的横切逻辑，例如 trace id、CORS、代理头、安全 header、请求耗时。dependency 则适合处理已经知道 endpoint 需要什么之后的业务资源，例如当前用户、权限、数据库事务和租户上下文。

## 路由迁移：从 Express handler 到 FastAPI path operation

Express handler 经常把解析、调用服务、错误处理和响应写回放在一起：

```js
app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user)
  } catch (err) {
    next(err)
  }
})
```

FastAPI 版本应该把边界拆得更清楚：

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/users", tags=["users"])

class UserOut(BaseModel):
    id: str
    name: str
    email: str

@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str):
    user = await user_service.find_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

这里至少有四个迁移点。

第一，Express 用 `:id`，FastAPI 用 `{user_id}`。如果函数参数名和路径变量名不一致，FastAPI 不会猜你的意思。

第二，路径参数 `user_id: str` 是 API 契约的一部分，不只是编辑器提示。你可以改成 `UUID`、`int`、`Annotated[str, Path(...)]`，让校验和文档自然出现。

第三，`response_model=UserOut` 会过滤输出字段。服务层返回 ORM 对象或 dict 时，最终公开给调用方的是 `UserOut` 的形状。

第四，404 是业务上可预期的 HTTP 失败，所以直接抛 `HTTPException`。未知异常则交给统一异常处理器和监控系统。

## Router 组织：不要把 main.py 写成 app.js 的翻版

Express 项目常见结构是：

```text
src/
  app.js
  routes/
    users.js
    orders.js
  middleware/
  services/
```

FastAPI 可以保持类似分层，但不要把所有装饰器都堆进 `main.py`：

```text
app/
  __init__.py
  main.py
  api/
    __init__.py
    routes/
      __init__.py
      users.py
      orders.py
      health.py
  core/
    config.py
    logging.py
    security.py
  dependencies/
    __init__.py
    auth.py
    database.py
  models/
    user.py
  schemas/
    user.py
  services/
    user_service.py
  repositories/
    user_repository.py
tests/
pyproject.toml
uv.lock
```

`main.py` 应该主要做组合：

```python
from fastapi import FastAPI
from app.api.routes import health, users
from app.core.config import settings

def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.include_router(health.router)
    app.include_router(users.router, prefix="/api/v1")
    return app

app = create_app()
```

这种结构的好处是：HTTP 层、业务层、数据访问层、配置、依赖和安全边界分开，测试也更容易替换 dependency。

## 路径参数、查询参数和 Header

Express 里常见写法：

```js
app.get("/search", (req, res) => {
  const page = Number(req.query.page ?? 1)
  const limit = Math.min(Number(req.query.limit ?? 20), 100)
  const requestId = req.headers["x-request-id"]
  res.json(search(req.query.q, { page, limit, requestId }))
})
```

FastAPI 应把这些约束声明在参数上：

```python
from typing import Annotated
from fastapi import APIRouter, Header, Query

router = APIRouter()

@router.get("/search")
async def search_items(
    q: Annotated[str, Query(min_length=1, max_length=100)],
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    x_request_id: Annotated[str | None, Header()] = None,
):
    return await search_service.search(
        query=q,
        page=page,
        limit=limit,
        request_id=x_request_id,
    )
```

这里的收益不只是少写 `Number(...)`。FastAPI 会把这些约束用于请求验证、错误响应和 OpenAPI 文档。调用方传 `limit=1000`，不需要你在 handler 里写分支，框架会返回结构化的 422。

## 请求体：从松散 JSON 改成输入模型

Express 项目经常从 `req.body` 里拿字段：

```js
app.post("/users", async (req, res) => {
  const { email, name, role } = req.body
  const user = await userService.create({ email, name, role })
  res.status(201).json(user)
})
```

FastAPI 中应该让请求体模型成为 API 边界：

```python
from typing import Literal
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=80)
    role: Literal["member", "admin"] = "member"

class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str

@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate):
    return await user_service.create(payload)
```

输入模型和输出模型应该分开。`UserCreate` 描述客户端能提交什么，`UserOut` 描述客户端能看到什么，数据库模型描述内部如何存储。三者长期混用，迟早会导致内部字段泄漏、兼容性困难或迁移痛苦。

## 响应：多数时候直接 return，不要过度包装

Express 的响应写法很显式：

```js
res.status(200).json({ items, total })
```

FastAPI 默认更声明式：

```python
class PageOut(BaseModel):
    items: list[UserOut]
    total: int

@router.get("/users", response_model=PageOut)
async def list_users():
    items, total = await user_service.list_users()
    return {"items": items, "total": total}
```

只有在你需要自定义 cookie、header、流式响应、文件下载、重定向、非 JSON 响应或绕过默认序列化时，才需要显式使用 `Response`、`JSONResponse`、`StreamingResponse` 等类。

一个健康的默认策略是：

- 普通 JSON：返回 dict、list、Pydantic model 或服务层 DTO。
- 状态码：在 decorator 上声明 `status_code`。
- 输出字段：用 `response_model`。
- Header / cookie：必要时注入 `Response` 对象。
- 文件和流：使用专门 response class。
- 错误：抛异常，不要返回“错误 dict + 200”。

## Dependency vs Middleware：迁移成败的关键

Express 开发者最容易低估 FastAPI dependency。dependency 不是“另一种 middleware”，而是一套请求内依赖图解析机制。它可以返回值，可以依赖其他 dependency，可以缓存同一请求内的结果，可以通过 `yield` 管理资源生命周期，也可以在 router 或 app 层统一挂载。

下面是一个当前用户 dependency：

```python
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    user = await auth_service.verify_token(credentials.credentials)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]

@router.get("/me", response_model=UserOut)
async def read_me(current_user: CurrentUser):
    return current_user
```

Express 里可能会写成：

```js
app.use(authMiddleware)

app.get("/me", (req, res) => {
  res.json(req.user)
})
```

FastAPI 的版本更明确：`read_me` 需要 `current_user`，这个值来自 `get_current_user`，失败时返回 401。阅读一个函数签名，就能知道它依赖哪些业务上下文。

## 什么时候用 middleware

middleware 仍然很重要，但它应该处理“与具体 endpoint 返回值无关”的横切问题。

适合 middleware：

- request id / correlation id。
- 访问日志。
- 请求耗时。
- CORS。
- 压缩。
- 安全响应头。
- 代理头修正。
- 全局超时或 body size 控制。
- APM / tracing 的底层接入。

不适合 middleware：

- 把当前用户塞到每个请求里，即使许多路由不需要认证。
- 为每个请求都打开数据库 session，即使静态健康检查不需要数据库。
- 在 middleware 里做复杂权限分支。
- 在 middleware 里读取 body 后又让 endpoint 再读一次。
- 把业务错误吞掉并返回模糊 500。

一个典型耗时 middleware：

```python
import time
from fastapi import FastAPI, Request

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{time.perf_counter() - start:.6f}"
    return response
```

注意：middleware 越底层，越应该简单、可预测、低开销。复杂业务条件应回到 dependency 或服务层。

## `yield` dependency：资源生命周期的 Python 写法

Express 项目常用 middleware 打开资源，再挂到 `req` 上：

```js
app.use(async (req, res, next) => {
  req.db = createSession()
  try {
    await next()
  } finally {
    await req.db.close()
  }
})
```

FastAPI 更自然的写法是 `yield` dependency：

```python
from collections.abc import AsyncIterator
from typing import Annotated
from fastapi import Depends

async def get_session() -> AsyncIterator[AsyncSession]:
    async with async_session_factory() as session:
        yield session

DbSession = Annotated[AsyncSession, Depends(get_session)]

@router.post("/users", response_model=UserOut)
async def create_user(payload: UserCreate, session: DbSession):
    return await user_service.create_user(session, payload)
```

这类 dependency 的优势是资源只在需要它的路由上创建，并且生命周期跟请求绑定。测试时也可以覆盖 `get_session`，替换成测试数据库或 fake repository。

## 错误处理：从 `next(err)` 到异常语义

Express 统一错误处理常见写法：

```js
app.use((err, req, res, next) => {
  const status = err.statusCode || 500
  res.status(status).json({
    error: err.message,
    requestId: req.id,
  })
})
```

FastAPI 中，你通常会组合三层。

第一层：业务上可预期的 HTTP 失败，直接抛 `HTTPException`。

```python
from fastapi import HTTPException, status

if user is None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found",
    )
```

第二层：定义领域异常，在边界统一映射成 HTTP 响应。

```python
class QuotaExceededError(Exception):
    def __init__(self, limit: int) -> None:
        self.limit = limit

@app.exception_handler(QuotaExceededError)
async def quota_exceeded_handler(request: Request, exc: QuotaExceededError):
    return JSONResponse(
        status_code=429,
        content={
            "code": "quota_exceeded",
            "message": "Quota exceeded",
            "limit": exc.limit,
        },
    )
```

第三层：未知异常交给全局日志和平台监控，生产环境不要把 stack trace 返回给客户端。

一个建议是统一错误响应结构：

```json
{
  "code": "user_not_found",
  "message": "User not found",
  "details": {},
  "request_id": "req_123"
}
```

FastAPI 默认的 422 验证错误格式很详细。如果你的 API 网关或前端需要固定错误结构，可以覆盖 validation exception handler，但不要把字段级错误信息全部丢掉。对调用方来说，知道 `body.email` 格式错误比只看到 `invalid_request` 有用得多。

## 验证：Pydantic 不是 TypeScript 类型的复制品

TypeScript 的类型主要在编译时帮助你，运行时需要 Zod、Yup、Joi、class-validator 或手写逻辑。FastAPI 的 Pydantic 模型参与运行时验证。这个差异非常重要。

下面的模型既是运行时验证，也是 API 文档的一部分：

```python
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, HttpUrl

class AgentRunCreate(BaseModel):
    prompt: str = Field(min_length=1, max_length=8000)
    model: Literal["gpt-5.1", "gpt-5.1-mini"]
    callback_url: HttpUrl | None = None
    metadata: dict[str, str] = Field(default_factory=dict)

class AgentRunOut(BaseModel):
    id: str
    status: Literal["queued", "running", "succeeded", "failed"]
    created_at: datetime
```

迁移时要避免两个极端。

一个极端是完全不用模型，把所有输入都声明成 `dict`。这样 FastAPI 的核心价值会消失，OpenAPI 也会变得贫弱。

另一个极端是把 ORM 模型、输入模型、输出模型、内部业务对象全用同一个类。短期看省事，长期看会制造安全和兼容性问题。

更稳妥的拆法：

- `UserCreate`：客户端创建时能提交的字段。
- `UserUpdate`：客户端更新时能提交的字段，通常都是可选字段。
- `UserOut`：客户端能看到的字段。
- `UserInDB` 或 ORM model：内部存储字段，可能包含 password hash、权限位、审计字段。
- `UserDomain`：复杂业务中可选的领域对象，不一定暴露给 FastAPI。

## 响应模型和字段泄漏

Express 中常见安全事故是把数据库对象直接 `res.json()` 出去。FastAPI 也可能犯同样错误，只是它给了更好的防线。

不要这样：

```python
@router.get("/users/{user_id}")
async def get_user(user_id: str):
    return await user_repository.get_user(user_id)
```

更建议这样：

```python
class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr

@router.get("/users/{user_id}", response_model=UserPublic)
async def get_user(user_id: str):
    return await user_repository.get_user(user_id)
```

当服务层返回对象包含 `password_hash`、`internal_note`、`billing_customer_id` 等字段时，`response_model` 能帮你把公开响应限制在契约内。它不是唯一安全措施，但应成为公开 API 的默认习惯。

## 异步模型：Promise 和 coroutine 的差异

Node.js 开发者熟悉 Promise：

```js
const userPromise = fetchUser(id)
const profilePromise = fetchProfile(id)
const [user, profile] = await Promise.all([userPromise, profilePromise])
```

Python 的 `async def` 调用后返回 coroutine object。coroutine 不会因为被创建就自动执行到 I/O 点。你必须 `await` 它，或者把它调度成 task。

![Promise 与 asyncio 的执行差异](/images/engineering/practice/promise-asyncio-flow.svg)

```python
import asyncio

async def get_user_bundle(user_id: str):
    user_task = asyncio.create_task(fetch_user(user_id))
    profile_task = asyncio.create_task(fetch_profile(user_id))
    user, profile = await asyncio.gather(user_task, profile_task)
    return {"user": user, "profile": profile}
```

几个迁移要点：

- `fetch_user(user_id)` 只是创建 coroutine。
- `await fetch_user(user_id)` 会等待它完成。
- `asyncio.create_task(fetch_user(user_id))` 会把它调度到 event loop。
- `asyncio.gather(...)` 会等待多个 awaitable。
- Python 3.11+ 的 `asyncio.TaskGroup` 更适合结构化并发。
- 任何同步阻塞 I/O 都会卡住 event loop。

## 什么时候用 `async def`，什么时候用 `def`

FastAPI 支持 `async def` 和普通 `def` endpoint。不要看到 FastAPI 就把所有函数都写成 `async def`。

适合 `async def`：

- 使用异步数据库驱动。
- 使用异步 HTTP client，例如 `httpx.AsyncClient`。
- 调用的 SDK 本身提供 awaitable API。
- 请求内需要并发等待多个 I/O。

适合普通 `def`：

- 依赖同步数据库驱动。
- 依赖阻塞型 SDK。
- 主要是 CPU 轻量处理。
- 旧代码迁移阶段暂时无法异步化。

危险写法：

```python
import time

@router.get("/slow")
async def slow_endpoint():
    time.sleep(5)
    return {"ok": True}
```

更好的写法：

```python
import asyncio

@router.get("/slow")
async def slow_endpoint():
    await asyncio.sleep(5)
    return {"ok": True}
```

如果你必须调用阻塞函数，应明确把它放到线程池或迁移到同步 endpoint，而不是悄悄阻塞 event loop。

## 异步陷阱清单

迁移 Express 服务时，下面这些问题很常见。

- 在 `async def` 里调用 `requests.get()`。
- 在 `async def` 里调用同步数据库 driver。
- 用 `time.sleep()` 代替 `await asyncio.sleep()`。
- 创建 coroutine 后忘记 `await`。
- 用 `asyncio.create_task()` 启动关键任务，但不保存、不等待、不处理异常。
- 把 request-scoped 对象传给后台 task，request 结束后资源已关闭。
- 以为 Uvicorn 单 worker 能自动利用所有 CPU。
- 在全局变量里保存可变业务状态，多个 worker 之间状态不一致。
- 在 dependency 里做昂贵远程调用，却没有超时、缓存或降级。
- 让 endpoint 等待长时间 AI 推理，导致 HTTP timeout 和用户体验都变差。

对 AI / Agent API 尤其要小心：模型调用、向量检索、网页抓取、代码执行、文件解析都可能很慢。HTTP endpoint 应该明确区分同步短请求、异步任务提交、流式响应和后台队列。

## 测试：从 supertest 心智迁到 pytest / httpx

Express 项目里常见 supertest：

```js
await request(app)
  .post("/users")
  .send({ email: "a@example.com", name: "Ada" })
  .expect(201)
```

FastAPI 可以用 `TestClient` 测同步风格测试：

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_user():
    response = client.post(
        "/users",
        json={"email": "a@example.com", "name": "Ada"},
    )
    assert response.status_code == 201
    assert response.json()["email"] == "a@example.com"
```

如果你的测试本身需要 async，可以用 `httpx.AsyncClient` 和 ASGI transport。

重点不是工具名，而是测试层次：

- schema 测试：非法输入是否返回 422。
- 成功路径：状态码、响应字段、输出过滤是否正确。
- 认证测试：缺 token、错 token、权限不足。
- dependency 覆盖：数据库、当前用户、外部服务可替换。
- 错误格式：领域异常和未知异常是否被正确映射。
- 并发测试：异步资源、锁、幂等和 race condition。
- OpenAPI 快照：关键 API 契约是否意外变化。

## 覆盖 dependency：FastAPI 测试的核心技巧

Express 测试常通过 mock service、mock middleware 或注入 app context。FastAPI 的关键能力是 `app.dependency_overrides`。

```python
from app.dependencies.auth import get_current_user

def fake_current_user() -> User:
    return User(id="user_1", email="test@example.com")

def test_read_me():
    app.dependency_overrides[get_current_user] = fake_current_user
    try:
        response = client.get("/me")
        assert response.status_code == 200
        assert response.json()["id"] == "user_1"
    finally:
        app.dependency_overrides.clear()
```

这比在测试里构造假 token 更直接，也能让你分别测试“认证 dependency 本身”和“依赖当前用户的业务 endpoint”。

## 项目布局：小服务和中型服务可以不同

一个很小的服务可以从简单结构开始：

```text
app/
  main.py
  schemas.py
  dependencies.py
  services.py
tests/
```

当 API 增长后，再拆成：

```text
app/
  main.py
  api/
    routes/
  core/
  dependencies/
  schemas/
  services/
  repositories/
  workers/
  observability/
tests/
  api/
  services/
  integration/
```

不要一开始就套过重的 enterprise 模板。好的项目结构应该让以下问题容易回答：

- HTTP endpoint 在哪里？
- 输入输出 schema 在哪里？
- 认证和权限在哪里？
- 数据库 session 从哪里来？
- 业务逻辑在哪里？
- 外部服务 client 在哪里？
- 后台任务在哪里？
- 配置从哪里读取？
- 测试如何替换外部依赖？

如果这些问题需要全仓搜索才能回答，结构就该收敛了。

## 包管理和开发工作流：uv 对 Node 开发者意味着什么

Node 项目通常围绕 `package.json`：

```json
{
  "scripts": {
    "dev": "vite dev",
    "test": "vitest"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

现代 Python 项目围绕 `pyproject.toml`：

```toml
[project]
name = "fastapi-service"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "fastapi[standard]",
  "pydantic-settings",
]

[dependency-groups]
dev = [
  "pytest",
  "ruff",
  "mypy",
]
```

常用 uv 命令：

```bash
uv init fastapi-service
uv add "fastapi[standard]"
uv add --dev pytest ruff mypy
uv sync
uv run fastapi dev app/main.py
uv run pytest
uv run ruff check
uv lock --check
```

迁移团队要明确几条约定：

- 提交 `pyproject.toml` 和 `uv.lock`。
- 不提交 `.venv/`。
- CI 使用锁文件同步依赖。
- 本地命令通过 `uv run` 执行。
- 工具配置尽量集中进 `pyproject.toml`。
- Docker build 中利用 lockfile 做缓存。

## 配置：不要把环境变量散落在 endpoint

Express 项目常用 `process.env.X`。FastAPI / Python 中也可以直接 `os.environ`，但中型服务更适合集中配置。

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "FastAPI Service"
    database_url: str
    jwt_issuer: str
    jwt_audience: str
    request_timeout_seconds: float = 10.0

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
```

endpoint 不应该到处读取环境变量。它应该依赖配置对象或服务对象。这样测试、部署和本地运行都更稳定。

## 安全：从应用层到平台层一起考虑

Express 项目常用 helmet、cors、cookie-session、passport、rate-limit 等。FastAPI 生态也有对应能力，但不要把安全只理解成库清单。

迁移时至少检查这些方面：

- CORS 是否只允许必要 origin。
- 是否正确处理代理后的 scheme、host 和 client IP。
- 认证 token 是否校验 issuer、audience、过期时间和签名算法。
- 权限是否在 dependency 或服务层显式表达。
- 响应模型是否避免敏感字段泄漏。
- 错误响应是否避免泄露 stack trace、SQL、内部 URL。
- 日志是否避免记录 token、cookie、个人敏感信息和完整 prompt。
- 文件上传是否限制大小、类型和扫描策略。
- API 是否有速率限制、配额或网关保护。
- 管理端点和调试文档是否在生产环境受控。
- 依赖是否定期升级并扫描漏洞。

一个认证 dependency 可以解决“谁在调用”；但“能不能做这件事”通常还需要权限 dependency 或服务层策略：

```python
def require_admin(user: CurrentUser) -> User:
    if "admin" not in user.roles:
        raise HTTPException(status_code=403, detail="Admin role required")
    return user

AdminUser = Annotated[User, Depends(require_admin)]
```

## 部署：理解 ASGI，而不是只会本地启动

FastAPI 运行在 ASGI 生态中，常见组合是 Uvicorn、Gunicorn + Uvicorn worker、容器平台、反向代理或 serverless 平台。

本地开发：

```bash
uv run fastapi dev app/main.py
```

生产示例：

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

容器里要关注：

- 使用锁文件安装依赖。
- 不把 `.env` 打进镜像。
- 暴露健康检查 endpoint。
- 正确处理 SIGTERM，给请求和 lifespan 清理留时间。
- 配置 worker 数量，而不是盲目单进程。
- 正确设置代理头和 trusted hosts。
- 日志输出到 stdout / stderr。
- readiness 和 liveness 分开。

一个简单健康检查：

```python
@router.get("/healthz", include_in_schema=False)
async def healthz():
    return {"status": "ok"}
```

更严格的 readiness 可以检查数据库、缓存或关键外部依赖，但要设置短超时，避免健康检查本身拖垮服务。

## Lifespan：替代散乱的启动脚本

FastAPI 支持 lifespan，用来管理应用启动和关闭时的资源。

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = build_http_client()
    try:
        yield
    finally:
        await app.state.http_client.aclose()

app = FastAPI(lifespan=lifespan)
```

适合放在 lifespan：

- 创建共享 HTTP client。
- 初始化连接池。
- 加载只读模型或规则。
- 启动 telemetry。
- 关闭时释放资源。

不适合放在 lifespan：

- 每次请求都不同的用户上下文。
- 长时间阻塞的批处理。
- 会让启动不稳定的非关键远程调用。
- 应由迁移工具负责的数据库 schema migration。

## AI / Agent API 的特殊边界

这篇文章放在 AI 工程语境里，FastAPI 经常被用来包装模型调用、RAG、Agent、工具执行和数据管道。迁移 Express 服务时要额外考虑：

- 模型调用可能超过普通 HTTP timeout。
- 流式响应需要和前端、网关、代理一起验证。
- prompt、文件、工具结果可能包含敏感信息。
- Agent run 通常需要任务状态，而不是单次请求内全部完成。
- 外部工具调用需要超时、重试、隔离和审计。
- 向量检索和 rerank 需要观察延迟分布。
- 大文件解析应走对象存储和后台 worker。

短任务可以同步返回：

```python
@router.post("/classify", response_model=ClassificationOut)
async def classify(payload: ClassificationIn, user: CurrentUser):
    return await classify_service.run(payload, user=user)
```

长任务更适合提交任务：

```python
@router.post("/agent-runs", response_model=AgentRunOut, status_code=202)
async def create_agent_run(payload: AgentRunCreate, user: CurrentUser):
    run = await agent_run_service.enqueue(payload, user=user)
    return run
```

再提供状态查询、取消、日志和结果下载接口。不要把所有 Agent 执行都塞进一个等待数分钟的 HTTP handler。

## 迁移步骤：从低风险边界开始

一个稳妥迁移通常按下面顺序推进。

1. 盘点 Express 服务的路由、middleware、错误格式、认证、数据库连接、后台任务和部署方式。
2. 选一个边界清晰、依赖少、调用量可控的 API 作为第一批迁移对象。
3. 建立 FastAPI 项目骨架、uv 工作流、lint、test、CI。
4. 先迁移 schema 和响应契约，不急着迁移所有业务逻辑。
5. 把认证和数据库 session 写成 dependency。
6. 实现 router，保持 URL、状态码和错误格式兼容，除非明确设计新版本。
7. 用集成测试对照 Express 旧行为。
8. 在网关或路由层做灰度，把少量流量切到 FastAPI。
9. 比较延迟、错误率、日志字段和业务指标。
10. 扩大迁移范围，并逐步淘汰旧 Express endpoint。

不要从“最大、最复杂、最核心”的 endpoint 开始。第一批迁移的价值是验证工程模式，而不是展示勇气。

## 迁移与评审清单

### 路由与契约对齐

- [ ] Endpoint 有明确 status code，请求体使用 Pydantic 输入模型。
- [ ] 响应有 `response_model` 或明确的 response class，不泄漏内部字段。
- [ ] 分页、排序、过滤参数有范围限制，不再从 `Request` 手动解析本可声明的参数。
- [ ] 错误响应结构与调用方约定一致，字段级错误可定位。
- [ ] OpenAPI 表达真实契约，且没有暴露 internal-only endpoint。
- [ ] 旧 API 兼容性差异已记录。

### 中间件与依赖迁移

- [ ] 当前用户通过 dependency 注入，权限检查不只依赖前端。
- [ ] Dependency 承担业务上下文，可在测试中覆盖。
- [ ] 数据库 session 通过 `yield` dependency 管理。
- [ ] Middleware 不过重，不读取 body 或吞异常。
- [ ] Request-scoped 资源不会泄漏到后台任务。
- [ ] 全局共享资源只放真正可共享且线程/进程安全的对象。

### 异步与异常

- [ ] `async def` 中没有同步阻塞 I/O 或阻塞库。
- [ ] 慢外部调用有 timeout，外部服务 client 有超时配置。
- [ ] 并发调用使用 `gather` 或 `TaskGroup`，并处理异常。
- [ ] `create_task()` 任务有生命周期、错误处理和取消策略。
- [ ] CPU 重任务不在 event loop 中执行。
- [ ] 认证失败、权限不足、资源不存在和验证失败返回正确状态码。

### 上线前评审

- [ ] CORS 配置最小化，token 校验完整。
- [ ] 日志不记录敏感字段，生产错误不暴露 stack trace。
- [ ] Health / readiness endpoint 清晰，部署命令适合生产。
- [ ] Docker / 平台配置使用锁文件，配置集中且没有散落的环境变量读取。
- [ ] 依赖升级和漏洞扫描有流程。
- [ ] 流式响应经过代理和浏览器验证，worker 数量和连接池大小经过压测或估算。
- [ ] 测试覆盖 422、401、403、404、成功路径和依赖覆盖。

## 常见反模式

### 反模式一：把 FastAPI 写成 Express 风格

```python
@router.post("/users")
async def create_user(request: Request):
    body = await request.json()
    user = await user_service.create(body)
    return JSONResponse(user)
```

更好的写法：

```python
@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate):
    return await user_service.create(payload)
```

### 反模式二：所有逻辑都进 middleware

如果 middleware 里出现大量业务分支、数据库查询、权限判断和异常转换，就要警惕。多数业务上下文应搬到 dependency。

### 反模式三：只写 `dict`，不写模型

`dict[str, Any]` 很方便，但会让 API 契约退化。除非 endpoint 真的是任意 JSON 代理，否则应尽量建模。

### 反模式四：关键后台任务用 `create_task()` 随手丢出去

请求结束后，进程可能重启，task 可能异常，资源可能关闭。关键任务要进入可靠队列、数据库状态机或平台任务系统。

### 反模式五：把 ORM model 直接暴露为响应

ORM model 是存储结构，不是公开 API。公开 API 要有单独响应模型。

### 反模式六：本地能跑就算部署完成

FastAPI 本地启动很容易，生产运行要验证 worker、代理、超时、日志、健康检查、资源关闭和锁文件同步。

## FAQ

### FastAPI 比 Express 更适合所有后端吗？

不是。Express 生态成熟、灵活、对 Node 全栈团队非常自然。FastAPI 的优势在于类型契约、运行时验证、自动 OpenAPI、Python 数据和 AI 生态协作。当服务要深度连接 Python 模型、数据处理、Agent 工具链或科学计算生态时，FastAPI 的收益会更明显。

### 我可以在 FastAPI 里继续用 middleware 做认证吗？

可以，但不一定最合适。如果只是解析 token 并给所有请求打上身份，middleware 能做。但如果某些 endpoint 需要当前用户对象、某些 endpoint 可匿名、某些 endpoint 需要不同权限，dependency 会更清晰，也更容易测试和生成文档。

### FastAPI 的 422 会不会让前端不习惯？

可能。Express 项目经常把验证错误做成 400。FastAPI 默认用 422 表示请求语义可读但验证失败。如果团队已有 API 规范，可以自定义 validation exception handler；但建议保留字段级错误细节。

### Pydantic 模型是不是等价于 TypeScript interface？

不等价。TypeScript interface 主要是编译期结构；Pydantic model 是运行时验证、解析和序列化模型。它更接近 TypeScript + Zod 的组合。

### `async def` 一定更快吗？

不一定。`async def` 对 I/O 并发有帮助，但同步阻塞库放进去会卡 event loop。性能来自正确的 I/O 模型、连接池、超时、worker 配置和业务设计，而不是关键字本身。

### uv 是必须的吗？

不是必须，但它能把虚拟环境、依赖解析、锁文件和命令执行统一起来。对从 npm 迁移来的团队来说，uv 的心智更接近现代包管理器，比“手动 venv + pip freeze”更容易形成团队规范。

### 要不要一次性把 Express 服务全部重写？

通常不要。更稳的方式是按 API 边界逐步迁移，用网关或路由层灰度，保持可回滚。一次性重写很容易把语言迁移、框架迁移、数据模型迁移和部署迁移混在一起，风险会被放大。

### FastAPI 能和现有 Node 服务共存吗？

可以。常见做法是 Node 继续负责前端 BFF、实时网关或已有业务 API，FastAPI 负责 AI、数据、模型、内部工具或新模块。两者通过 HTTP、队列、事件总线或共享认证体系集成。

### 如何判断一个 endpoint 是否适合第一批迁移？

优先选择依赖少、状态少、调用方明确、测试容易补齐、失败影响可控的 endpoint。不要选择最复杂的支付、权限、批处理或核心链路作为第一批。

## Express -> FastAPI 迁移 playbook

前面的章节解释了概念映射。真正迁移时，还需要一套可执行的 playbook。这个 playbook 的目标不是让团队一次性完成重写，而是把风险拆开：先把契约稳定住，再把模块迁过去，再把流量切过去，最后再清理旧代码。

一个可靠迁移通常分成八个阶段：

1. 盘点现有 Express 行为。
2. 定义兼容性目标。
3. 建立 FastAPI 基础设施。
4. 迁移公共 schema 与错误模型。
5. 迁移低风险模块。
6. 建立测试对照矩阵。
7. 灰度流量和观察指标。
8. 删除旧路径和沉淀规范。

每个阶段都应有明确产物。没有产物的阶段很容易变成“大家都觉得差不多了”，但生产系统不会因为感觉而稳定。

### 阶段一：盘点现有 Express 行为

不要从代码搜索 `app.get` 开始就直接翻译。先把现有服务的行为做成清单。

需要盘点：

- 公开 endpoint 列表。
- 内部 endpoint 列表。
- HTTP method。
- path pattern。
- query parameter。
- request body schema。
- response schema。
- success status code。
- error status code。
- error body format。
- 认证方式。
- 权限规则。
- middleware 顺序。
- route-level middleware。
- request id 生成方式。
- 日志字段。
- 数据库事务边界。
- 外部服务调用。
- background job 触发点。
- cache 读写点。
- 文件上传下载行为。
- streaming 行为。
- timeout 行为。
- retry 行为。
- rate limit 行为。
- 调用方列表。
- 监控 dashboard。
- 已知生产事故。

推荐把盘点结果做成表格：

| 字段 | 示例 |
| --- | --- |
| endpoint | `GET /api/v1/users/:id` |
| Express handler | `routes/users.js#getUser` |
| auth | required, bearer token |
| success | `200 UserJson` |
| not found | `404 { code, message }` |
| validation | `400 { errors }` |
| dependencies | `userService`, `redis`, `billingClient` |
| migration risk | medium |
| first FastAPI target | yes |

这个表格会成为迁移验收的基础。没有它，团队很容易遗漏“不常见但调用方依赖”的行为。

### 阶段二：定义兼容性目标

迁移不一定要百分百兼容旧 Express API，但必须明确哪些地方保持一致，哪些地方可以改变。

需要明确：

- URL 是否保持不变。
- HTTP method 是否保持不变。
- 成功状态码是否保持不变。
- 错误状态码是否保持不变。
- 错误 body 是否保持不变。
- 字段命名是否保持 camelCase。
- 时间格式是否保持不变。
- 空数组、空对象、null 的语义是否保持不变。
- 分页参数是否保持不变。
- 排序语义是否保持不变。
- 默认 limit 是否保持不变。
- 认证 header 是否保持不变。
- idempotency key 是否保持不变。
- cache header 是否保持不变。
- streaming protocol 是否保持不变。
- OpenAPI 是否作为新契约发布。

如果决定改变契约，应显式 versioning。不要在“迁移框架”的 PR 中悄悄改变业务 API。

### 阶段三：建立 FastAPI 基础设施

在迁移第一个模块前，先把基础设施立住。

最低要求：

- `pyproject.toml`。
- `uv.lock`。
- app factory。
- router 注册约定。
- settings 管理。
- logging 初始化。
- request id middleware。
- CORS 配置。
- exception handler。
- health endpoint。
- pytest 基础配置。
- ruff 或同类 lint。
- CI check。
- Dockerfile 或平台启动命令。
- 本地运行命令。
- typed dependency 模式。

不要把这些基础设施埋在第一个业务 PR 里。业务迁移和基础设施搭建混在一起，会让代码评审失焦。

### 阶段四：迁移公共 schema 与错误模型

优先迁移 API 边界，而不是立刻迁移所有业务逻辑。

建议先定义：

- `ErrorOut`。
- `ValidationErrorOut`。
- `PageOut[T]` 或分页响应模型。
- `HealthOut`。
- 通用 ID 类型。
- 时间戳序列化约定。
- snake_case 与 camelCase 策略。
- 领域错误基类。
- HTTP exception mapping。

一个简单错误模型：

```python
from pydantic import BaseModel, Field

class ErrorOut(BaseModel):
    code: str
    message: str
    request_id: str | None = None
    details: dict[str, object] = Field(default_factory=dict)
```

如果旧 Express API 使用 camelCase，而 Python 内部使用 snake_case，可以用 Pydantic alias 策略或明确字段别名。关键是不要让命名策略在每个 handler 里临时处理。

### 阶段五：迁移低风险模块

第一批模块最好满足这些条件：

- 请求体简单。
- 数据库写入少。
- 无复杂权限。
- 无支付或账务影响。
- 无长时间任务。
- 调用方少。
- 有现成测试或容易补测试。
- 有清晰监控指标。
- 可灰度。
- 可快速回滚。

适合第一批：

- health。
- metadata。
- read-only catalog。
- 用户偏好读取。
- 简单搜索。
- 内部状态查询。
- 只读配置查询。

不适合第一批：

- 支付。
- 删除。
- 权限变更。
- 数据迁移。
- 大文件上传。
- 长任务调度。
- 核心交易。
- 多服务事务。

### 阶段六：建立测试对照矩阵

迁移不是只看 FastAPI 测试通过，还要证明新旧行为差异可控。

建议建立矩阵：

| 场景 | Express 预期 | FastAPI 预期 | 是否必须一致 |
| --- | --- | --- | --- |
| 正常创建 | 201 + body | 201 + body | 是 |
| 缺必填字段 | 400 或 422 | 目标格式 | 视规范 |
| token 缺失 | 401 | 401 | 是 |
| 权限不足 | 403 | 403 | 是 |
| 资源不存在 | 404 | 404 | 是 |
| 重复创建 | 409 | 409 | 是 |
| 外部服务超时 | 504 或 503 | 目标格式 | 是 |
| 非法 query | 400 或 422 | 目标格式 | 视规范 |
| 大 payload | 413 | 413 | 是 |
| 未知异常 | 500 | 500 | 是 |

矩阵的价值在于把“框架默认行为”变成“团队接受的行为”。例如 FastAPI 默认 validation error 是 422；如果旧 API 是 400，团队要明确是保留 400，还是发布版本差异。

### 阶段七：灰度和指标观察

迁移完成不等于可以全量切换。至少观察这些指标：

- 请求量。
- 成功率。
- 4xx 分布。
- 5xx 分布。
- p50 latency。
- p95 latency。
- p99 latency。
- 上游 timeout。
- 下游 timeout。
- 数据库连接池使用率。
- event loop blocking 指标。
- worker restart 次数。
- memory usage。
- CPU usage。
- response body size。
- error code 分布。
- 业务转化指标。
- 用户投诉或调用方告警。

灰度策略可以是：

- 按 header 切流量。
- 按用户 id hash 切流量。
- 按租户切流量。
- 按 endpoint 切流量。
- 按内部调用方切流量。
- 先 shadow read，再真实响应。

不要只看 HTTP 200。迁移后的 API 可能成功返回，但字段少了、排序变了、默认分页变了、错误码变了，调用方仍然会出问题。

### 阶段八：清理旧路径并沉淀规范

当 FastAPI 路径稳定后，要清理旧 Express 代码，否则团队会长期维护两套事实来源。

清理内容：

- 旧 route。
- 旧 middleware。
- 旧 schema。
- 旧测试。
- 旧文档。
- 旧 dashboard。
- 旧告警。
- 旧 feature flag。
- 旧网关规则。
- 旧环境变量。
- 旧 runbook。

沉淀内容：

- 新 endpoint 模板。
- dependency 模板。
- 错误码规范。
- 测试模板。
- 部署模板。
- 性能排查流程。
- 代码评审清单。

## 模块化迁移顺序

从 Express 到 FastAPI 的迁移，最怕“按文件顺序翻译”。更稳的方式是按模块风险和依赖方向迁移。

推荐顺序：

1. 运行框架。
2. 观察性基础。
3. 错误模型。
4. 配置模型。
5. 无状态只读 API。
6. 认证 dependency。
7. 权限 dependency。
8. 数据库 session dependency。
9. 简单写 API。
10. 幂等写 API。
11. 文件 API。
12. streaming API。
13. background job API。
14. 高风险核心 API。

### 运行框架

运行框架包括 app factory、router 注册、settings、logging、health check 和本地命令。这个阶段不应该引入复杂业务。

验收标准：

- 本地能启动。
- 测试能跑。
- health endpoint 可访问。
- OpenAPI 可生成。
- 日志包含 request id。
- 未知异常不会泄露 stack trace。

### 观察性基础

观察性应早于业务迁移，否则迁移后不知道问题出在哪里。

至少要有：

- 结构化日志。
- request id。
- trace id。
- endpoint 名称。
- status code。
- latency。
- error code。
- user id 或 tenant id 的安全摘要。
- downstream service 名称。
- downstream latency。

注意不要记录：

- token。
- cookie。
- password。
- 完整 prompt。
- 上传文件内容。
- 个人敏感字段。
- 内部密钥。

### 错误模型

错误模型应在所有业务模块之前确定。否则每个 router 都会发明自己的错误格式。

建议统一：

- `code`：机器可读。
- `message`：人可读。
- `details`：字段或上下文。
- `request_id`：排查关联。

常见错误码：

- `invalid_request`。
- `unauthorized`。
- `forbidden`。
- `not_found`。
- `conflict`。
- `rate_limited`。
- `quota_exceeded`。
- `upstream_timeout`。
- `upstream_unavailable`。
- `internal_error`。

### 配置模型

配置迁移要早做，因为 Express 项目经常存在散落的 `process.env`。

要整理：

- 服务名。
- 环境名。
- 数据库 URL。
- Redis URL。
- JWT issuer。
- JWT audience。
- CORS origin。
- 外部服务 base URL。
- 超时时间。
- 重试次数。
- feature flag。
- 日志级别。
- worker 配置。

FastAPI 项目应通过 settings 对象读取，而不是在 endpoint 里直接读环境变量。

### 无状态只读 API

这类 API 最适合验证 router、schema、response model 和错误格式。

例子：

- `GET /healthz`。
- `GET /version`。
- `GET /catalog/items`。
- `GET /settings/public`。
- `GET /users/{id}` 但不含复杂权限。

验收重点：

- path parameter 校验。
- query parameter 默认值。
- response model 过滤。
- 404 行为。
- OpenAPI 文档。

### 认证 dependency

认证应尽量独立迁移和测试。不要把认证逻辑散落到每个 endpoint。

需要覆盖：

- token 缺失。
- token 格式错误。
- token 过期。
- issuer 不匹配。
- audience 不匹配。
- 签名错误。
- 用户不存在。
- 用户停用。
- 匿名访问允许。
- 可选认证。

### 权限 dependency

认证回答“是谁”，权限回答“能不能做”。

权限 dependency 可以按三种粒度设计：

- role-based。
- permission-based。
- resource-based。

resource-based 权限最容易和数据库查询纠缠。要避免每个 handler 手写权限分支，最好把权限策略封装成 dependency 或服务层 policy。

### 数据库 session dependency

数据库 session 是迁移的关键边界。Express 项目可能通过全局连接池、request middleware 或 service 内部创建连接。FastAPI 项目应明确 session 生命周期。

需要决定：

- 每个请求一个 session 还是每个操作一个 session。
- 读写是否分离。
- transaction 在 endpoint、service 还是 repository 层控制。
- commit 由谁负责。
- rollback 由谁负责。
- session 是否可以传给 background task。
- 测试如何替换 session。

### 简单写 API

简单写 API 可以验证 request body、事务、冲突错误和响应模型。

优先选择：

- 创建用户偏好。
- 更新 profile 文本字段。
- 创建内部 note。
- 提交轻量配置。

验收重点：

- 201 / 200 / 204 是否符合契约。
- duplicate 是否返回 409。
- validation 是否稳定。
- transaction 是否正确回滚。
- response 是否过滤内部字段。

### 幂等写 API

幂等写 API 比简单写 API 更接近生产复杂度。

要处理：

- idempotency key。
- 重复请求。
- 部分成功。
- client timeout 后重试。
- 下游服务重复调用。
- 数据库唯一约束。
- 返回同一结果还是冲突错误。

FastAPI 不会自动解决幂等。框架只提供 HTTP 边界，幂等语义仍然要在业务层设计。

### 文件 API

文件上传下载需要单独迁移，不能和普通 JSON API 混在一起。

要检查：

- 文件大小限制。
- content type。
- 文件名安全。
- 病毒扫描或内容扫描。
- 临时文件清理。
- 对象存储权限。
- 下载鉴权。
- range request。
- CDN header。
- 超时。
- backpressure。

### Streaming API

如果 Express 服务有 SSE、chunked response 或 AI token streaming，迁移时必须端到端验证。

检查点：

- 客户端是否能逐段收到。
- 反向代理是否 buffer。
- 网关 timeout 是否足够。
- 心跳是否存在。
- 客户端断开时服务端是否取消任务。
- 错误如何传递。
- 日志如何记录 stream 结束状态。

### Background job API

FastAPI 的 `BackgroundTasks` 适合轻量收尾，不适合可靠任务队列。

适合：

- 请求完成后写审计日志。
- 发送非关键通知。
- 触发轻量异步清理。

不适合：

- 支付。
- 长时间 AI 推理。
- 大文件解析。
- 必须重试的邮件发送。
- 关键数据同步。
- 跨服务事务。

关键任务应使用队列、调度器、worker 或平台任务系统。

## 测试迁移矩阵

测试迁移应覆盖从 Express 到 FastAPI 的行为差异，而不只是覆盖代码行。

### HTTP 契约测试

| 测试项 | Express 风险 | FastAPI 风险 | 建议 |
| --- | --- | --- | --- |
| path parameter | 字符串默认值 | 类型校验更严格 | 明确兼容策略 |
| query parameter | 手动转换松散 | 自动 422 | 固定错误格式 |
| request body | body-parser 后是 plain object | Pydantic 自动验证 | 输入模型覆盖边界 |
| response body | 可能返回多余字段 | response_model 可过滤 | 加字段泄漏测试 |
| status code | handler 手写 | decorator 声明 | 测试每个状态 |
| headers | middleware 写入 | response / middleware 写入 | 验证关键 header |
| cookies | res.cookie | Response set_cookie | 验证属性 |

### 认证与权限测试

| 场景 | 必测原因 |
| --- | --- |
| 无 token | 防止默认匿名放行 |
| 空 token | 防止解析异常变 500 |
| 过期 token | 验证 401 |
| 错 issuer | 防止跨环境 token 可用 |
| 错 audience | 防止跨服务 token 可用 |
| 无权限 role | 验证 403 |
| 资源 owner 不匹配 | 验证 resource policy |
| 可选认证 endpoint | 验证匿名和登录两种路径 |

### Validation 测试

要为每个输入模型建立边界测试：

- 缺字段。
- 字段为 null。
- 字段类型错误。
- 字符串为空。
- 字符串超长。
- 数字低于最小值。
- 数字高于最大值。
- enum 非法。
- email 非法。
- URL 非法。
- 嵌套对象缺字段。
- 数组为空。
- 数组过长。
- 未知字段。

如果旧 Express API 接受未知字段，而新 FastAPI 模型拒绝未知字段，要把差异写入版本说明。

### 错误处理测试

错误处理不应只测一个 404。

建议覆盖：

- 400 或 422 validation。
- 401 unauthorized。
- 403 forbidden。
- 404 not found。
- 409 conflict。
- 413 payload too large。
- 415 unsupported media type。
- 429 rate limited。
- 500 internal error。
- 502 upstream bad response。
- 503 upstream unavailable。
- 504 upstream timeout。

每个错误都应验证：

- status code。
- `code`。
- `message`。
- `details`。
- `request_id`。
- 日志是否记录。
- 是否没有敏感信息。

### Dependency override 测试

FastAPI 测试要充分使用 dependency override。

适合 override：

- current user。
- DB session。
- settings。
- external HTTP client。
- clock。
- id generator。
- feature flag。
- queue producer。
- object storage client。

不要在每个测试里真实调用外部服务。迁移阶段最需要的是稳定、快速、可定位的反馈。

### 并发测试

Express 与 FastAPI 的并发模型不同，迁移后要补并发测试。

关注：

- 同一资源并发更新。
- idempotency key 并发提交。
- 数据库唯一约束冲突。
- connection pool 耗尽。
- 下游 timeout。
- 请求取消。
- streaming 客户端断开。
- background task 异常。

并发 bug 往往不会在单请求测试里出现。

## 错误处理深水区

错误处理看起来只是 `raise HTTPException`，但生产系统里有许多边界。

### 不要把所有异常都转成 500

不同错误应有不同语义：

- 输入错误：400 或 422。
- 未认证：401。
- 已认证但无权限：403。
- 资源不存在：404。
- 状态冲突：409。
- 请求过大：413。
- 格式不支持：415。
- 速率限制：429。
- 下游错误：502。
- 服务不可用：503。
- 下游超时：504。
- 未知错误：500。

如果所有错误都是 500，调用方无法做正确处理，监控也无法定位主要风险。

### 领域异常不要直接依赖 FastAPI

服务层可以抛领域异常，但不一定应该 import FastAPI。

更清晰：

```python
class UserNotFoundError(Exception):
    pass

class DuplicateEmailError(Exception):
    pass
```

HTTP 层负责映射：

```python
try:
    return await service.create_user(payload)
except DuplicateEmailError:
    raise HTTPException(status_code=409, detail="Email already exists")
```

这样服务层可以被 CLI、worker、测试和其它接口复用。

### 错误码要稳定

`message` 可以为了可读性调整，但 `code` 应尽量稳定。

稳定错误码的好处：

- 前端可以做本地化。
- 调用方可以分支处理。
- 日志可以聚合。
- 告警可以按 code 统计。
- 文档可以长期引用。

不要把 `code` 写成自然语言句子。

### Validation error 的兼容策略

FastAPI 默认 validation error 很详细，但格式可能和旧 Express API 不同。

可选策略：

- 接受 FastAPI 默认格式，作为新版本契约。
- 包装成团队统一错误格式，保留字段路径。
- 对旧 endpoint 保持旧格式，对新 endpoint 使用新格式。
- 在网关层转换错误格式。

关键是明确策略，不要让每个 router 自己决定。

## 依赖注入边界：该注入什么，不该注入什么

dependency 的力量很大，也容易滥用。一个好的 dependency 应该让 endpoint 更清晰，而不是隐藏复杂业务。

### 适合作为 dependency 的对象

- 当前用户。
- 当前租户。
- 权限策略。
- 数据库 session。
- request-scoped transaction。
- settings。
- clock。
- request id。
- external client。
- feature flag reader。
- pagination 参数。
- locale。

### 不适合作为 dependency 的对象

- 大段业务流程。
- 会改变核心状态的命令。
- 长时间运行的任务。
- 难以测试的全局 mutable state。
- endpoint 特有的复杂分支。
- 需要明确事务脚本的操作。

如果 dependency 名字像 `process_order_and_send_email`，它很可能不是 dependency，而是业务服务。

### Dependency 命名建议

好的命名：

- `get_current_user`。
- `require_admin`。
- `get_session`。
- `get_settings`。
- `get_billing_client`。
- `pagination_params`。

可疑命名：

- `do_auth_stuff`。
- `handle_user`。
- `run_before_request`。
- `common_logic`。
- `prepare_everything`。

命名应该说明它提供什么资源或保证什么前置条件。

### Dependency 粒度

太细会让函数签名碎片化，太粗会隐藏依赖。

可以把常用组合封装为 typed alias：

```python
CurrentUser = Annotated[User, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_session)]
AdminUser = Annotated[User, Depends(require_admin)]
```

这样 endpoint 既清楚，又不至于被 `Depends(...)` 噪声淹没。

## 性能排查 playbook

FastAPI 性能问题通常不在框架本身，而在 I/O、序列化、连接池、worker、下游依赖和错误的 async 使用。

### 先判断慢在哪里

不要一上来调整 worker 数。先拆 latency：

- 入口排队时间。
- middleware 时间。
- dependency 时间。
- request body 解析时间。
- validation 时间。
- service 时间。
- database 时间。
- external HTTP 时间。
- model inference 时间。
- response serialization 时间。
- response body 传输时间。

每个阶段都可以通过日志、trace 或手动计时定位。

### 常见慢因

- 在 `async def` 中调用同步 I/O。
- 数据库 query 缺索引。
- N+1 query。
- response_model 过大。
- 返回巨大 JSON。
- Pydantic model 嵌套过深。
- 连接池太小。
- worker 太少。
- 下游服务慢。
- DNS 或 TLS 握手重复发生。
- 每个请求创建 HTTP client。
- 日志同步写入阻塞。
- 大文件读入内存。
- streaming 被代理 buffer。

### 排查顺序

推荐顺序：

1. 确认慢 endpoint 和 percentile。
2. 看 4xx / 5xx 是否同时上升。
3. 看 worker CPU 和 memory。
4. 看 event loop 是否被阻塞。
5. 看数据库连接池。
6. 看慢 query。
7. 看下游服务 latency。
8. 看 response size。
9. 看是否每请求重复创建 client。
10. 用 trace 还原单请求路径。

### 修复策略

不同慢因对应不同修复：

- 同步 I/O：换 async client，或移到线程池，或用 sync endpoint。
- DB 慢：加索引、改 query、减少 N+1、分页。
- 下游慢：timeout、retry、circuit breaker、cache。
- JSON 太大：分页、字段裁剪、压缩、streaming。
- CPU 重：worker、任务队列、批处理、缓存。
- client 重复创建：lifespan 里创建共享 client。
- validation 重：简化 schema，减少深层嵌套，避免返回过大对象。

## 部署 runbook

部署 FastAPI 服务时，需要把应用、ASGI server、容器、反向代理和平台一起看。

### 本地命令和生产命令分开

开发命令：

```bash
uv run fastapi dev app/main.py
```

生产命令：

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

不要把开发 reload 命令带到生产。

### Worker 配置

worker 数不是越多越好。

考虑因素：

- CPU 核数。
- I/O 等待比例。
- DB 连接池限制。
- 下游服务限制。
- memory per worker。
- cold start 时间。
- 平台 autoscaling 行为。

如果每个 worker 都有数据库连接池，worker 数增加会放大数据库连接压力。

### Proxy header

生产环境常在反向代理后面运行。要确认：

- scheme 是否正确。
- host 是否正确。
- client IP 是否可信。
- redirect URL 是否正确。
- HTTPS 判断是否正确。
- trusted host 是否配置。

错误的 proxy header 会导致生成错误 URL、错误安全判断和日志污染。

### Health 和 readiness

health 不等于 readiness。

- health：进程还活着。
- readiness：服务可以接流量。

readiness 可以检查数据库和关键依赖，但必须短超时。健康检查本身不能成为高成本请求。

### Release checklist

- [ ] 镜像使用锁文件构建。
- [ ] 不包含 `.env`。
- [ ] 启动命令是生产命令。
- [ ] health endpoint 可访问。
- [ ] readiness endpoint 可访问。
- [ ] 日志包含 request id。
- [ ] 错误不会泄露 stack trace。
- [ ] CORS 与生产域名一致。
- [ ] worker 数已配置。
- [ ] 连接池大小已配置。
- [ ] timeout 已配置。
- [ ] 反向代理不 buffer streaming。
- [ ] rollback 路径明确。

## API 兼容性细节

从 Express 到 FastAPI，许多兼容问题不是大功能，而是小语义。

### 字段命名

Node API 常用 camelCase，Python 常用 snake_case。迁移时要决定公开 API 是否继续 camelCase。

选择一：公开 API 保持 camelCase，Python 内部使用 snake_case。

选择二：新版本 API 改为 snake_case。

选择三：只在内部 API 使用 snake_case，对外 API 保持 camelCase。

不要让同一个 endpoint 同时返回两种风格。

### null 与缺字段

JavaScript 中 `undefined` 和 `null` 的语义不同，JSON 中没有 `undefined`。Python 中 `None` 会序列化为 `null`。

需要明确：

- 字段不存在是否允许。
- 字段为 null 是否允许。
- 更新接口中 null 表示清空还是忽略。
- response 中空值是否返回。

### 日期时间

时间字段要明确：

- 是否使用 ISO 8601。
- 是否包含 timezone。
- 是否统一 UTC。
- 是否保留毫秒。
- 旧 API 是否返回 Unix timestamp。

时间格式一旦公开，就很难随意改。

### 数字精度

JavaScript number 是双精度浮点。Python 有 int、float、Decimal。涉及金额、积分、配额、token 计费时，要避免浮点误差。

建议：

- 金额用整数最小单位或 Decimal。
- 公开 API 明确单位。
- 不要用 float 表示钱。

### 空数组和分页

分页兼容要检查：

- 空结果返回 `[]` 还是 `null`。
- total 是否包含过滤条件。
- page 从 0 还是 1 开始。
- limit 默认值。
- 最大 limit。
- 排序稳定性。
- cursor 是否可重复使用。

## 数据库迁移边界

框架迁移不一定要同时迁移数据库 schema。把两件事混在一起会显著增加风险。

### 保持数据库不变

第一阶段可以让 FastAPI 复用现有数据库 schema。这样能把风险限制在 HTTP 和服务层。

优点：

- 回滚简单。
- 数据一致性风险低。
- 可和 Express 并行运行。
- 便于对照行为。

缺点：

- Python 模型可能需要适配旧命名。
- 旧 schema 的问题会继续存在。
- 某些约束无法立即改善。

### 双写要谨慎

如果迁移涉及新旧系统双写，要重点设计：

- 写入顺序。
- 幂等 key。
- 失败补偿。
- 对账任务。
- 数据差异报警。
- 回滚策略。
- 重放策略。

双写不是普通重构，它是分布式系统问题。

### Repository 边界

不要让 endpoint 直接写复杂 SQL。推荐边界：

```text
api route -> service -> repository -> database
```

简单项目可以少一层，但数据库访问仍应有清晰位置，便于测试和后续迁移。

## 文档和契约治理

FastAPI 自动生成 OpenAPI，但自动生成不等于自动治理。

需要治理：

- operation id。
- tag。
- summary。
- description。
- deprecated 标记。
- response examples。
- error examples。
- auth scheme。
- versioning。
- internal endpoint 隐藏。

公开 API 的文档应该能回答：

- 这个 endpoint 做什么。
- 谁可以调用。
- 请求字段有哪些。
- 响应字段有哪些。
- 可能的错误有哪些。
- 是否幂等。
- 是否分页。
- 是否有速率限制。
- 是否有兼容性说明。

## 更细的代码评审问题库

下面的问题可以直接用于迁移 PR review。

### Router 层

- path 是否符合既有 API 命名。
- method 是否正确。
- status code 是否在 decorator 上声明。
- tags 是否合理。
- operation id 是否稳定。
- summary 是否描述业务动作。
- endpoint 是否太长。
- endpoint 是否包含数据库细节。
- endpoint 是否包含外部服务重试细节。
- endpoint 是否返回内部对象。

### Schema 层

- input 和 output 是否分开。
- optional 字段是否真的 optional。
- default value 是否符合旧行为。
- enum 是否覆盖旧值。
- 字符串长度是否有限制。
- 数组长度是否有限制。
- Decimal / money 是否处理正确。
- 时间字段是否包含 timezone。
- unknown field 策略是否明确。
- alias 是否符合公开 API。

### Dependency 层

- dependency 是否只提供资源或前置条件。
- dependency 是否隐藏业务流程。
- dependency 是否有 timeout。
- dependency 是否可以测试覆盖。
- dependency 是否会在无关 endpoint 上执行。
- `yield` dependency 是否正确关闭资源。
- dependency 异常是否映射成正确状态码。
- dependency 命名是否清楚。

### Service 层

- service 是否不依赖 FastAPI。
- service 是否可被 worker 复用。
- transaction 边界是否明确。
- 领域异常是否清楚。
- 外部调用是否有 timeout。
- retry 是否有上限。
- 幂等是否有测试。
- 日志是否包含足够上下文。

### Test 层

- 是否覆盖旧行为。
- 是否覆盖 validation。
- 是否覆盖 auth。
- 是否覆盖 permission。
- 是否覆盖 not found。
- 是否覆盖 conflict。
- 是否覆盖 upstream timeout。
- 是否验证 response field 不泄漏。
- 是否使用 dependency override。
- 是否避免真实外部服务。

## 一个参考迁移模板

下面是一个相对完整的 FastAPI 路由模板，展示路由、schema、dependency、错误和服务层边界如何组合。

```python
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=80)

class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str

async def get_user_service() -> UserService:
    return UserService()

UserServiceDep = Annotated[UserService, Depends(get_user_service)]

@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, service: UserServiceDep):
    try:
        return await service.create_user(payload)
    except DuplicateEmailError:
        raise HTTPException(status_code=409, detail="Email already exists")

@router.get("", response_model=list[UserOut])
async def list_users(
    service: UserServiceDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    return await service.list_users(limit=limit, offset=offset)
```

这个模板不是唯一答案，但它体现了迁移后的目标形态：HTTP 契约清楚，输入输出清楚，依赖清楚，错误语义清楚。

## 结语：迁移的目标是更清晰的边界

从 Express 到 FastAPI，不是从“轻量框架”换到“另一个轻量框架”。真正的迁移，是从对象驱动的请求处理，转向契约驱动的 API 边界；从运行时约定，转向类型、模型和依赖图；从“handler 里什么都能做”，转向“HTTP 层、业务层、资源层和部署层各自清楚”。

如果你保留 Express 的工程经验，同时接受 FastAPI 的声明式边界，迁移会很顺。你不需要忘掉 middleware、router、service、test、deploy 这些经验；你需要重新决定它们在 Python / ASGI / Pydantic / dependency 体系里的位置。

## 延伸阅读

- [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [FastAPI Middleware](https://fastapi.tiangolo.com/tutorial/middleware/)
- [FastAPI Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [FastAPI Handling Errors](https://fastapi.tiangolo.com/tutorial/handling-errors/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Python asyncio](https://docs.python.org/3/library/asyncio.html)
- [uv: Working on projects](https://docs.astral.sh/uv/guides/projects/)
- [uv 工程实践：把 Python 依赖、环境、项目和命令统一起来](./uv-python-project-workflow/)
