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

![FastAPI 请求生命周期可视化](/images/engineering/practice/fastapi-request-lifecycle-visual.png)

![Express 到 FastAPI 的迁移桥接可视化](/images/engineering/practice/express-fastapi-migration-bridge-visual.png)

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

![Promise 与 asyncio 运行时差异可视化](/images/engineering/practice/promise-asyncio-runtime-visual.png)

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

## 延伸阅读

- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [FastAPI Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [Python asyncio docs](https://docs.python.org/3/library/asyncio.html)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [uv — Astral](https://docs.astral.sh/uv/)
