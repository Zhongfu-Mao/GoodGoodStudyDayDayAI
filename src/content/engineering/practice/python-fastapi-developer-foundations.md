---
title: "FastAPI 开发者基础：读懂 REST、HTTP、JSON 与 Python API 代码"
date: 2026-05-13
category: engineering
description: "面向需要阅读和维护 FastAPI 服务的开发者，系统梳理 REST、HTTP、JSON、Pydantic、装饰器、类型提示、async/await、测试与调试基础。"
difficulty: beginner
plainSummary: "FastAPI 的核心心智是把 HTTP 请求映射到 Python 函数，再用类型提示、Pydantic model 和 OpenAPI schema 描述输入、校验与响应。"
tags:
  - "FastAPI"
  - "Python"
lang: zh
coverImage: "/images/engineering/practice/python-fastapi-foundations-cover.png"
draft: false
---

# FastAPI 开发者基础：读懂 REST、HTTP、JSON 与 Python API 代码

> 时效边界：本文核验于 2026-05-13。FastAPI、Pydantic、HTTPX 等工具会持续演进，具体版本行为以项目锁定的依赖和官方文档为准。

FastAPI 代码看起来很短。

一条路由可能只有十几行。

但这十几行背后同时包含了 Web API 约定、HTTP 协议、JSON 数据结构、Python 函数、类型提示、Pydantic 校验、异步 I/O、自动文档和测试方式。

如果只按 Python 语法逐行看，很容易把重点看散。

更稳的读法是先抓住一条请求的生命周期：

客户端发出 HTTP 请求。

请求带着 method、path、query、headers 和 body。

FastAPI 根据路由装饰器找到一个 Python 函数。

FastAPI 把 path、query、headers、cookies、body 等输入解析成函数参数。

Pydantic 和类型提示参与数据转换与校验。

函数执行业务逻辑。

函数返回 Python 对象、Pydantic model 或 Response。

FastAPI 把返回值序列化成 HTTP 响应，通常是 JSON。

OpenAPI schema 同步描述这些输入和输出，让文档、客户端和测试都能对齐。

你可以先记住这一句：

**FastAPI 服务就是把 HTTP 请求映射到 Python 函数，并用类型提示、Pydantic model 和 OpenAPI schema 把 API 合同写清楚。**

![REST、HTTP、JSON 与 FastAPI 函数的关系](/images/engineering/practice/rest-http-json-loop.svg)

![HTTP 请求到 FastAPI 函数的流程可视化](/images/engineering/practice/fastapi-foundations-flow-visual.png)

这篇文章不追求覆盖 FastAPI 的全部能力。

它聚焦一个实际目标：

让开发者能读懂一个现有 FastAPI endpoint。

读懂它从哪里取输入。

读懂它如何校验输入。

读懂它返回什么响应。

读懂它为什么会报 400、401、404、422 或 500。

读懂它的测试应该断言什么。

读懂它在项目目录里通常放在哪里。

## 一张总图：从请求到响应

先看一个最小但完整的路由。

```python
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()

class CreateTaskRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5, default=3)

class TaskResponse(BaseModel):
    id: int
    title: str
    priority: int
    owner_id: str

@app.post("/users/{user_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: str,
    body: CreateTaskRequest,
    x_request_id: str | None = Header(default=None),
):
    if user_id == "blocked":
        raise HTTPException(status_code=403, detail="User is blocked")

    return TaskResponse(
        id=1,
        title=body.title,
        priority=body.priority,
        owner_id=user_id,
    )
```

这段代码可以拆成几层。

`@app.post("/users/{user_id}/tasks", ...)` 声明 HTTP method 和 URL path。

`user_id: str` 来自 path 中的 `{user_id}`。

`body: CreateTaskRequest` 来自 JSON request body。

`x_request_id: str | None = Header(default=None)` 来自 HTTP header。

`CreateTaskRequest` 定义请求 body 的 JSON 形状。

`TaskResponse` 定义成功响应的 JSON 形状。

`status_code=201` 表示成功创建资源时返回 `201 Created`。

`HTTPException(status_code=403, ...)` 表示业务拒绝时返回错误响应。

`async def` 表示这个 handler 可以使用异步 I/O。

`return TaskResponse(...)` 会被 FastAPI 转成 JSON。

这就是阅读 FastAPI endpoint 的基本路线。

先看装饰器。

再看函数签名。

再看 request model。

再看业务分支。

再看 response model。

最后看测试和 OpenAPI 文档是否与代码一致。

## REST API 的基础心智

REST API 可以先理解成一种资源导向的 HTTP 接口风格。

调用方通过 URL 找到资源。

调用方通过 HTTP method 表达动作。

调用方通过 headers 传递元信息。

调用方通过 query 参数表达筛选、分页、排序等读取选项。

调用方通过 body 传递要创建或修改的结构化数据。

服务端通过 status code 表达请求结果。

服务端通过 response body 返回资源、错误或操作结果。

一个用户任务系统可能有这些接口：

| 目标 | Method | Path | 常见响应 |
| --- | --- | --- | --- |
| 列出任务 | `GET` | `/tasks` | `200 OK` + 数组 |
| 查看任务 | `GET` | `/tasks/{task_id}` | `200 OK` + 对象 |
| 创建任务 | `POST` | `/tasks` | `201 Created` + 新对象 |
| 整体替换任务 | `PUT` | `/tasks/{task_id}` | `200 OK` 或 `204 No Content` |
| 局部更新任务 | `PATCH` | `/tasks/{task_id}` | `200 OK` + 更新后对象 |
| 删除任务 | `DELETE` | `/tasks/{task_id}` | `204 No Content` |

REST 的价值不是让所有 URL 看起来完美。

它的价值是让 API 行为可预测。

看到 `GET /tasks/42`，通常可以推断它是读取任务 42。

看到 `POST /tasks`，通常可以推断它是创建任务。

看到 `PATCH /tasks/42`，通常可以推断它是修改任务的一部分字段。

看到 `DELETE /tasks/42`，通常可以推断它是删除任务。

因此阅读 FastAPI 代码时，不要只看函数名。

函数名是 Python 内部命名。

真正对外暴露的是 method、path、status code、request schema 和 response schema。

## HTTP 解剖：请求行、headers 与 body

一个 HTTP 请求不是只有 URL。

它通常包含三层：

请求行。

Headers。

Body。

例如：

```http
POST /users/u_123/tasks?notify=true HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJ...
Content-Type: application/json
Accept: application/json
X-Request-Id: req_abc

{
  "title": "Write API tests",
  "priority": 2
}
```

第一行里有 method。

第一行里有 path。

第一行里有 query string。

Headers 里有认证、内容类型、追踪 ID、缓存策略、客户端偏好等元信息。

Body 里有 JSON 数据。

对应到 FastAPI：

```python
from fastapi import Header
from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    priority: int = 3

@app.post("/users/{user_id}/tasks")
async def create_task(
    user_id: str,
    notify: bool = False,
    body: TaskCreate = ...,
    authorization: str | None = Header(default=None),
    x_request_id: str | None = Header(default=None),
):
    ...
```

`POST` 对应 `@app.post`。

`/users/{user_id}/tasks` 对应 path template。

`user_id` 来自 path。

`notify` 来自 query。

`body` 来自 JSON body。

`authorization` 和 `x_request_id` 来自 headers。

FastAPI 默认会把 header 参数里的下划线转换为连字符。

因此 `x_request_id` 通常对应 HTTP header `X-Request-Id`。

如果项目关闭了这种转换，要看 `Header(convert_underscores=False)` 或项目封装。

## HTTP method：读写语义要先分清

常见 method 可以这样读：

| Method | 典型用途 | 是否通常有 body | 是否应被视为安全读取 |
| --- | --- | --- | --- |
| `GET` | 读取资源 | 通常没有 | 是 |
| `POST` | 创建资源、提交动作、复杂查询 | 通常有 | 否 |
| `PUT` | 整体替换资源 | 通常有 | 否 |
| `PATCH` | 局部更新资源 | 通常有 | 否 |
| `DELETE` | 删除资源 | 通常没有或很少 | 否 |
| `HEAD` | 只取响应头 | 没有 | 是 |
| `OPTIONS` | 查询支持能力 | 通常没有 | 是 |

读代码时可以问四个问题：

这个 endpoint 是否改变服务器状态？

它是否应该是幂等的？

它是否应该能被缓存？

它的 method 是否和业务含义一致？

`GET` 不应该用来创建订单。

`DELETE` 不应该静默变成“取消订阅但保留资源”的复杂业务动作，除非 API 文档清楚说明。

`POST` 很灵活，但也最容易被滥用。

在 FastAPI 中，method 由装饰器决定：

```python
@app.get("/reports")
async def list_reports():
    ...

@app.post("/reports")
async def create_report():
    ...

@app.patch("/reports/{report_id}")
async def update_report(report_id: str):
    ...
```

函数名可以叫 `list_reports`、`create_report`、`update_report`。

但外部客户端只关心 method 和 path。

## Status code：响应结果的第一层语义

HTTP status code 是三位数字。

第一位代表大类。

`1xx` 表示临时信息。

`2xx` 表示成功。

`3xx` 表示重定向或缓存相关结果。

`4xx` 表示客户端请求有问题，或请求者没有权限完成该操作。

`5xx` 表示服务端处理一个看似有效的请求时失败。

API 开发中最常见的是：

| Code | 名称 | 常见含义 |
| --- | --- | --- |
| `200` | OK | 请求成功，返回结果 |
| `201` | Created | 资源创建成功 |
| `202` | Accepted | 请求已接受，异步处理尚未完成 |
| `204` | No Content | 成功但没有响应 body |
| `304` | Not Modified | 缓存仍可用 |
| `400` | Bad Request | 请求语义或格式不符合业务要求 |
| `401` | Unauthorized | 未认证或认证无效 |
| `403` | Forbidden | 已识别请求者，但无权操作 |
| `404` | Not Found | 资源不存在，或不向请求者暴露 |
| `409` | Conflict | 当前状态冲突，例如重复创建 |
| `422` | Unprocessable Content | 结构可解析，但校验不通过 |
| `429` | Too Many Requests | 触发限流 |
| `500` | Internal Server Error | 未处理的服务端错误 |
| `502` | Bad Gateway | 上游服务返回异常 |
| `503` | Service Unavailable | 服务暂不可用 |
| `504` | Gateway Timeout | 上游超时 |

FastAPI 默认成功返回 `200`。

可以在装饰器里声明成功状态码：

```python
@app.post("/tasks", status_code=201)
async def create_task(body: TaskCreate):
    ...
```

也可以通过 `HTTPException` 抛出错误：

```python
from fastapi import HTTPException

@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    task = await repo.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

阅读代码时要特别区分：

输入类型或字段校验失败，FastAPI 常返回 `422`。

业务规则拒绝，代码可能显式返回 `400`、`403` 或 `409`。

资源查不到，通常是 `404`。

认证缺失，通常是 `401`。

权限不足，通常是 `403`。

依赖服务坏了，可能是 `502` 或 `503`。

未捕获异常，通常会变成 `500`。

## Headers：元信息、认证与追踪

Headers 是 HTTP 的元数据层。

它们通常不表达主要资源内容。

它们表达如何解释请求、谁在请求、希望得到什么格式、如何追踪请求、是否可以缓存。

常见 request headers：

| Header | 用途 |
| --- | --- |
| `Authorization` | Bearer token、Basic auth 等认证信息 |
| `Content-Type` | request body 的媒体类型，例如 `application/json` |
| `Accept` | 客户端希望接收的响应类型 |
| `X-Request-Id` | 请求追踪 ID |
| `Idempotency-Key` | 幂等提交键，常见于支付或订单 |
| `If-None-Match` | 缓存验证 |
| `User-Agent` | 客户端标识 |

FastAPI 读取 header 的基础写法：

```python
from fastapi import Header

@app.get("/me")
async def read_me(authorization: str | None = Header(default=None)):
    return {"has_auth": authorization is not None}
```

实际项目通常不会在每个 endpoint 里手写认证解析。

更常见的是 dependency：

```python
from fastapi import Depends, Header, HTTPException

async def require_user(
    authorization: str | None = Header(default=None),
) -> str:
    if authorization is None:
        raise HTTPException(status_code=401, detail="Missing token")
    return "u_123"

@app.get("/me")
async def read_me(user_id: str = Depends(require_user)):
    return {"id": user_id}
```

读代码时看到 `Depends(...)`，要意识到输入和错误分支可能藏在 dependency 里。

一个 endpoint 的真实行为不只在函数体里。

装饰器、函数参数、dependency、middleware、exception handler 都会影响结果。

## Path、query 与 body：三类输入不要混

FastAPI 最常见的输入来源是 path、query 和 body。

Path 参数来自 URL 模板。

Query 参数来自 `?` 后面的键值对。

Body 来自请求体，通常是 JSON。

例如：

```http
PATCH /projects/p_123/tasks/t_456?notify=true
Content-Type: application/json

{
  "title": "Ship the API guide",
  "done": true
}
```

对应：

```python
class TaskPatch(BaseModel):
    title: str | None = None
    done: bool | None = None

@app.patch("/projects/{project_id}/tasks/{task_id}")
async def update_task(
    project_id: str,
    task_id: str,
    notify: bool = False,
    body: TaskPatch = ...,
):
    ...
```

`project_id` 是 path。

`task_id` 是 path。

`notify` 是 query。

`body` 是 JSON body。

命名规则通常是：

资源身份放 path。

筛选、分页、排序、开关放 query。

创建或修改的数据放 body。

认证、追踪、内容协商放 headers。

例如：

```python
@app.get("/tasks")
async def list_tasks(
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    ...
```

这里 `status`、`limit`、`offset` 都是 query。

访问方式可能是：

```text
/tasks?status=open&limit=20&offset=40
```

如果 query 参数需要更严格的限制，可以使用 `Query`：

```python
from typing import Annotated
from fastapi import Query

@app.get("/tasks")
async def list_tasks(
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    ...
```

如果 path 参数需要限制，可以使用 `Path`：

```python
from typing import Annotated
from fastapi import Path

@app.get("/tasks/{task_id}")
async def get_task(
    task_id: Annotated[int, Path(ge=1)],
):
    ...
```

如果请求体需要额外说明，可以使用 Pydantic model 和 `Field`。

## JSON：API 的通用数据语言

JSON 是 Web API 最常见的数据格式。

它支持对象。

它支持数组。

它支持字符串。

它支持数字。

它支持布尔值。

它支持 `null`。

例如：

```json
{
  "id": "t_123",
  "title": "Write docs",
  "priority": 2,
  "done": false,
  "labels": ["api", "fastapi"],
  "assignee": null
}
```

Python 中对应的结构大致是：

```python
{
    "id": "t_123",
    "title": "Write docs",
    "priority": 2,
    "done": False,
    "labels": ["api", "fastapi"],
    "assignee": None,
}
```

注意几个差异：

JSON 使用 `true`、`false`、`null`。

Python 使用 `True`、`False`、`None`。

JSON object 的 key 必须是字符串。

Python dict 的 key 可以是多种 hashable 类型，但 API JSON 最好保持字符串 key。

JSON 没有 tuple。

JSON 没有 date、datetime 的原生类型，通常用字符串表示。

JSON 没有 decimal 的原生类型，金额和精度数据要在 API 合同里明确策略。

FastAPI 会把 request JSON 解析为 Python 数据。

Pydantic 会把 Python 数据校验为 model。

FastAPI 会把 response model 或 dict 序列化回 JSON。

读 API 代码时要分清三件事：

客户端发送的 JSON 长什么样。

Python 代码里拿到的数据类型是什么。

最终响应 JSON 长什么样。

这三者相似，但不是同一个层面。

## JSON Schema：把 JSON 的形状写成合同

JSON 本身只是一种数据格式。

它不会告诉你字段是否必填。

它不会告诉你字符串长度。

它不会告诉你数字范围。

它不会告诉你数组元素类型。

JSON Schema 用来描述这些规则。

OpenAPI 又用 JSON Schema 描述 API 的 request body、response body 和参数结构。

FastAPI 会基于 Pydantic model 和类型提示生成 OpenAPI schema。

例如：

```python
from pydantic import BaseModel, Field

class CreateTaskRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5, default=3)
    labels: list[str] = Field(default_factory=list)
```

这段代码会表达：

`title` 是字符串。

`title` 有最小长度。

`title` 有最大长度。

`priority` 是整数。

`priority` 有最小值和最大值。

`priority` 有默认值。

`labels` 是字符串数组。

`labels` 默认是空列表。

为什么不要随手写 `labels: list[str] = []`？

因为 Python 的可变默认值容易制造共享状态问题。

在 Pydantic model 中也更推荐用 `default_factory=list` 表达“每次创建一个新的空列表”。

读 schema 时可以问：

哪些字段是必填？

哪些字段可为空？

哪些字段有默认值？

哪些字段有长度、范围或格式限制？

哪些字段只是服务端输出，客户端不该提交？

哪些字段在输入和输出中形状不同？

## Pydantic model：请求与响应的结构边界

Pydantic model 是 FastAPI 项目里的 API 数据结构核心。

它不是数据库表。

它也不一定是业务领域对象。

它通常是 request 和 response 的边界模型。

一个常见写法是拆分输入、内部与输出：

```python
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5, default=3)

class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    priority: int | None = Field(default=None, ge=1, le=5)
    done: bool | None = None

class TaskOut(BaseModel):
    id: int
    title: str
    priority: int
    done: bool
```

为什么要拆？

创建时 `title` 必填。

更新时 `title` 可能不传。

输出时有 `id` 和 `done`。

输入时不应该允许客户端随便提交 `id`。

这就是 API 合同的边界。

如果 request 和 response 都用同一个宽泛 model，短期省事，长期容易泄漏字段或放松校验。

FastAPI 的 `response_model` 可以控制输出：

```python
@app.get("/tasks/{task_id}", response_model=TaskOut)
async def get_task(task_id: int):
    task = await repo.get(task_id)
    return task
```

即使 `task` 内部对象有更多字段，`response_model` 也能帮助限制公开输出。

这对隐藏密码 hash、内部备注、权限字段、成本字段很重要。

读项目时看到 `response_model`，要把它当作公开响应合同。

如果没有 `response_model`，就要看返回值本身、默认序列化规则以及项目是否有全局响应封装。

## Decorators：路由注册不是普通注释

Python 装饰器以 `@` 开头。

FastAPI 使用装饰器注册 path operation。

```python
@app.get("/health")
async def health_check():
    return {"ok": True}
```

`@app.get("/health")` 不是注释。

它会在应用启动时把下面的函数注册为 `GET /health` 的处理函数。

FastAPI 文档常把这种组合称为 path operation。

Path 是 `/health`。

Operation 是 `GET`。

Function 是 `health_check`。

常见装饰器：

```python
@app.get("/items")
@app.post("/items")
@app.put("/items/{item_id}")
@app.patch("/items/{item_id}")
@app.delete("/items/{item_id}")
```

项目变大后更常见的是 `APIRouter`：

```python
from fastapi import APIRouter

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/{task_id}")
async def get_task(task_id: int):
    ...
```

然后在应用入口注册：

```python
app.include_router(router)
```

`APIRouter` 的心智和 `FastAPI` 实例上的装饰器一样。

它只是把一组路由先组织到模块里。

读大型项目时，要从 `main.py` 或应用工厂找到 `include_router`。

再进入对应 router 模块。

再看每个装饰器。

装饰器里还可能有很多公开合同信息：

```python
@router.post(
    "",
    response_model=TaskOut,
    status_code=201,
    summary="Create a task",
    responses={409: {"description": "Task already exists"}},
)
async def create_task(body: TaskCreate):
    ...
```

这些不是装饰性配置。

它们会影响响应、文档和客户端理解。

![装饰器、类型提示与 async 函数速查](/images/engineering/practice/decorator-type-async-cheatsheet.svg)

## Type hints：FastAPI 读得懂的 Python 语法

FastAPI 大量利用 Python 类型提示。

类型提示既帮助人读代码，也帮助框架做参数解析、校验和文档生成。

常见写法：

```python
name: str
limit: int = 20
active: bool = True
tags: list[str] = []
age: int | None = None
metadata: dict[str, str] = {}
```

读法：

| 写法 | 含义 |
| --- | --- |
| `name: str` | `name` 应该是字符串 |
| `limit: int = 20` | `limit` 是整数，默认值是 20 |
| `active: bool = True` | `active` 是布尔值，默认 true |
| `age: int | None = None` | `age` 可以是整数，也可以为空 |
| `list[str]` | 字符串列表 |
| `dict[str, str]` | key 和 value 都是字符串的字典 |

在函数参数里，有默认值通常意味着 query 参数可选。

没有默认值的 path 参数来自 path 模板。

Pydantic model 类型通常意味着 request body。

例如：

```python
class SearchRequest(BaseModel):
    query: str
    filters: dict[str, str] = Field(default_factory=dict)

@app.post("/search")
async def search(
    body: SearchRequest,
    limit: int = 20,
):
    ...
```

`body` 是 request body。

`limit` 是 query。

类型提示也会影响错误。

如果 `limit: int = 20`，客户端传 `?limit=abc`，FastAPI 会返回校验错误。

如果 `body.query` 缺失，FastAPI 也会返回校验错误。

这些错误通常在函数体执行前发生。

因此调试时不要只在函数第一行打断点。

如果断点没进来，可能是路由没匹配、dependency 失败，或参数校验已经拦截。

## Annotated、Query、Path、Body 与 Field

现代 FastAPI 项目经常使用 `typing.Annotated` 给参数增加校验元数据。

```python
from typing import Annotated
from fastapi import Query

@app.get("/tasks")
async def list_tasks(
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    ...
```

这表示：

`limit` 是整数。

`limit` 来自 query。

`limit` 最小是 1。

`limit` 最大是 100。

`limit` 默认是 50。

Path 参数也类似：

```python
from typing import Annotated
from fastapi import Path

@app.get("/tasks/{task_id}")
async def get_task(
    task_id: Annotated[int, Path(ge=1)],
):
    ...
```

Pydantic model 字段通常使用 `Field`：

```python
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(default=3, ge=1, le=5)
```

可以粗略记住：

`Query` 用于 query 参数。

`Path` 用于 path 参数。

`Header` 用于 headers。

`Cookie` 用于 cookies。

`Body` 用于 body 参数。

`Field` 用于 Pydantic model 字段。

这套写法的共同目标是把 API 约束写在边界上。

业务函数不应该到处手写 `if not isinstance(...)`。

边界校验越清楚，业务逻辑越干净。

## async/await：FastAPI 里的异步心智

FastAPI endpoint 可以写成 `async def`。

也可以写成普通 `def`。

`async def` 允许函数内部使用 `await`。

`await` 用来等待异步操作完成。

典型异步操作包括：

数据库异步查询。

异步 HTTP 请求。

异步缓存访问。

异步队列操作。

文件或网络 I/O 的异步封装。

示例：

```python
@app.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await user_repo.get(user_id)
    return user
```

这里 `await user_repo.get(user_id)` 表示当前请求在等待数据库或外部资源。

等待期间，事件循环可以去处理其他任务。

这不等于 CPU 计算变快。

它主要改善 I/O 等待期间的并发效率。

需要特别小心的是，在 `async def` 中调用阻塞代码：

```python
import time

@app.get("/slow")
async def slow():
    time.sleep(5)
    return {"ok": True}
```

`time.sleep(5)` 会阻塞事件循环。

更合适的示例写法是：

```python
import asyncio

@app.get("/slow")
async def slow():
    await asyncio.sleep(5)
    return {"ok": True}
```

真实项目里，问题更常见于同步数据库客户端、同步 HTTP 客户端、CPU 密集计算、大文件处理。

如果一个库只提供同步 API，不能因为 endpoint 是 `async def` 就自动变成非阻塞。

## sync vs async：什么时候用哪种

`def` endpoint 和 `async def` endpoint 都可以在 FastAPI 中工作。

选择要看依赖的 I/O 模型。

如果函数内部主要调用异步库，用 `async def`。

如果函数内部主要调用同步库，可以用 `def`。

如果整个项目的数据库、缓存、HTTP client 都是异步的，endpoint 通常也保持 `async def`。

如果项目使用传统同步 ORM 和同步 SDK，盲目改成 `async def` 可能没有收益。

一个简单判断表：

| 场景 | 建议 |
| --- | --- |
| 使用 async database driver | `async def` + `await` |
| 使用 `httpx.AsyncClient` | `async def` + `await` |
| 使用同步 ORM | 通常保持 `def`，或通过项目约定处理 |
| 需要 `time.sleep` | 不要在 `async def` 里直接用 |
| CPU 密集任务 | 考虑后台任务、队列、进程池或专门 worker |
| 只是返回常量健康检查 | `def` 或 `async def` 都可以，按项目风格 |

读代码时不要把 `async` 理解为“更高级”。

它只是并发模型的一部分。

真正重要的是 endpoint 内部是否遵守同一套 I/O 约定。

如果你看到：

```python
@app.get("/external")
async def call_external():
    response = requests.get("https://example.com")
    return response.json()
```

这值得警惕。

`requests.get` 是同步阻塞调用。

异步项目里通常应使用 `httpx.AsyncClient` 或项目已有的异步 HTTP 封装。

## Validation errors：为什么经常看到 422

FastAPI 在进入业务函数前会解析和校验输入。

如果校验失败，通常会返回 `422`。

这类失败可能来自 path。

也可能来自 query。

也可能来自 headers。

也可能来自 body。

示例：

```python
@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    return {"task_id": task_id}
```

请求：

```text
GET /tasks/abc
```

`abc` 无法转换为 `int`。

FastAPI 会返回校验错误。

函数体不会执行。

再看 body：

```python
class TaskCreate(BaseModel):
    title: str = Field(min_length=1)
    priority: int = Field(ge=1, le=5)

@app.post("/tasks")
async def create_task(body: TaskCreate):
    return body
```

请求：

```json
{
  "title": "",
  "priority": 9
}
```

错误点有两个。

`title` 太短。

`priority` 超出范围。

FastAPI 的校验错误通常包含 `detail` 数组。

每个元素会描述错误位置、错误类型、错误消息和输入值。

调试 422 时按这个顺序看：

看 `detail[].loc`，确认错误发生在 path、query、header 还是 body。

看 `detail[].type`，确认是缺字段、类型转换失败、长度不对还是范围不对。

看请求实际发送的 JSON，不要只看前端对象。

看 `Content-Type` 是否是 `application/json`。

看 Pydantic model 是否把字段设成必填。

看字段名是否因为 alias 或大小写不一致而对不上。

看测试是否使用了 `json=...` 而不是错误地使用 `data=...`。

## OpenAPI docs：自动文档也是 API 合同

FastAPI 会自动生成 OpenAPI schema。

默认情况下，本地服务启动后可以访问：

```text
/docs
/redoc
/openapi.json
```

`/docs` 通常是 Swagger UI。

`/redoc` 通常是 ReDoc。

`/openapi.json` 是机器可读的 API schema。

这些文档不是额外产物。

它们来自代码里的装饰器、类型提示、Pydantic model、status code、response model 和 metadata。

如果文档错了，通常意味着代码边界也不够清楚。

读 OpenAPI 时重点看：

Path 是否符合预期。

Method 是否符合预期。

Parameters 是否来自正确位置。

Request body schema 是否准确。

Response schema 是否准确。

错误响应是否有描述。

认证方案是否出现。

Endpoint 是否被正确分组到 tags。

如果一个 endpoint 在 `/docs` 里看不到，可能是：

router 没有被 `include_router`。

模块没有被导入。

endpoint 设置了 `include_in_schema=False`。

应用启动加载的是另一个 app 实例。

测试或本地命令指向了错误入口。

## Testing：用 TestClient 和 httpx 验证合同

FastAPI 官方文档展示了基于 `TestClient` 的测试方式。

`TestClient` 适合写同步风格的 endpoint 测试。

典型测试：

```python
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_create_task():
    response = client.post(
        "/tasks",
        json={"title": "Write tests", "priority": 2},
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Write tests"
```

注意使用 `json=...`。

`json=...` 会自动序列化 JSON 并设置合适的 content type。

如果使用 `data=...`，你可能发送的是 form data 或原始 body。

这会导致看似奇怪的 422。

测试不要只断言状态码。

还应断言关键响应字段。

还应断言错误分支。

还应断言边界条件。

例如：

```python
def test_create_task_rejects_empty_title():
    response = client.post(
        "/tasks",
        json={"title": "", "priority": 2},
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == "title"
```

异步测试可以使用 HTTPX 的 `AsyncClient` 和 ASGI transport。

不同项目会有不同测试夹具。

读现有项目时优先模仿本仓库已有测试风格。

一个 endpoint 的基础测试清单：

成功请求返回正确 status code。

成功请求返回正确 JSON shape。

缺必填字段返回校验错误。

类型错误返回校验错误。

无权限返回 401 或 403。

资源不存在返回 404。

业务冲突返回 409 或项目约定错误。

分页、筛选、排序参数按约定生效。

不会返回内部字段。

OpenAPI schema 能描述关键 request 和 response。

## Project layout：FastAPI 项目常见目录

小项目可能只有一个 `main.py`。

真实项目通常会拆目录。

一个常见布局：

```text
app/
  main.py
  api/
    __init__.py
    routes/
      tasks.py
      users.py
  core/
    config.py
    security.py
  models/
    task.py
    user.py
  schemas/
    task.py
    user.py
  services/
    task_service.py
  repositories/
    task_repository.py
  tests/
    test_tasks.py
```

不同团队命名不同。

但职责通常相似。

`main.py` 创建 app，注册 router，配置 middleware。

`api/routes` 放 HTTP endpoint。

`schemas` 放 Pydantic request/response model。

`models` 可能放 ORM model 或领域模型。

`services` 放业务流程。

`repositories` 或 `dao` 放数据库访问。

`core` 放配置、安全、日志等基础能力。

`tests` 放测试。

读现有 endpoint 时可以沿着这条线：

从 `main.py` 找 `include_router`。

从 router 找具体 path operation。

从函数签名找 request schema。

从 `response_model` 找 response schema。

从 dependency 找认证和上下文。

从 service 找业务逻辑。

从 repository 找数据来源。

从 tests 找预期行为。

不要一上来就从数据库表开始。

HTTP 边界才是 API 读码的入口。

## Reading an existing endpoint：一套可重复读法

拿到一个 endpoint，按下面顺序读。

第一步，看装饰器。

Method 是什么？

Path 是什么？

Status code 是什么？

Response model 是什么？

Tags、summary、responses 是否提供额外合同？

第二步，看函数签名。

哪些参数来自 path？

哪些参数来自 query？

哪些参数来自 header？

哪些参数来自 dependency？

哪个参数是 body？

哪些参数可选？

哪些参数有默认值？

第三步，看 request model。

字段是否必填？

字段能否为 `None`？

字段是否有默认值？

字段是否有长度或范围限制？

字段是否有 alias？

字段是否允许额外字段？

第四步，看 response model。

响应是否隐藏内部字段？

响应是否和数据库 model 混用？

列表响应是否有分页信息？

错误响应是否有统一格式？

第五步，看 dependency。

认证在哪里发生？

权限在哪里检查？

数据库 session 如何注入？

请求上下文如何传递？

feature flag 或 tenant 信息在哪里读取？

第六步，看业务逻辑。

哪些分支会抛出 `HTTPException`？

哪些分支会调用外部服务？

哪些分支会写数据库？

事务边界在哪里？

重试、超时、幂等是否清楚？

第七步，看测试。

测试是否覆盖成功路径？

测试是否覆盖校验失败？

测试是否覆盖权限失败？

测试是否覆盖资源不存在？

测试是否覆盖业务冲突？

测试是否断言响应字段，而不是只断言状态码？

## Debugging：从现象反推边界

调试 FastAPI endpoint 时，先把问题分类。

是路由没命中？

是校验失败？

是认证失败？

是权限失败？

是业务分支失败？

是数据库失败？

是外部服务失败？

是响应序列化失败？

常见现象与排查方向：

| 现象 | 可能原因 |
| --- | --- |
| `404` | path 不匹配、router 未注册、base path 错误、资源不存在 |
| `405` | path 匹配但 method 不支持 |
| `422` | path/query/header/body 校验失败 |
| `401` | token 缺失、格式不对、认证 dependency 拒绝 |
| `403` | 认证通过但权限不足 |
| `409` | 业务状态冲突 |
| `500` | 未捕获异常、响应序列化失败、依赖服务异常 |
| 请求卡住 | 阻塞 I/O、外部服务无超时、数据库锁、连接池耗尽 |
| 文档没有接口 | router 未注册、导入路径错误、`include_in_schema=False` |

调试 422 的第一条规则：

先看响应 body 的 `detail`。

不要先改业务代码。

调试 500 的第一条规则：

先看服务端 traceback。

不要只看客户端拿到的 `"Internal Server Error"`。

调试异步卡顿的第一条规则：

检查 `async def` 里是否调用了同步阻塞库。

调试文档不一致的第一条规则：

确认运行的是当前代码，而不是另一个入口或旧进程。

## 一个完整示例：任务 API

下面是一段更接近真实项目边界的示例。

```python
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Path, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/tasks", tags=["tasks"])

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(default=3, ge=1, le=5)
    labels: list[str] = Field(default_factory=list)

class TaskPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    priority: int | None = Field(default=None, ge=1, le=5)
    done: bool | None = None

class TaskOut(BaseModel):
    id: int
    title: str
    priority: int
    labels: list[str]
    done: bool
    owner_id: str

async def current_user_id(
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    if authorization is None:
        raise HTTPException(status_code=401, detail="Missing token")
    return "u_123"

@router.post("", response_model=TaskOut, status_code=201)
async def create_task(
    body: TaskCreate,
    user_id: str = Depends(current_user_id),
):
    return TaskOut(
        id=1,
        title=body.title,
        priority=body.priority,
        labels=body.labels,
        done=False,
        owner_id=user_id,
    )

@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: Annotated[int, Path(ge=1)],
    include_done: Annotated[bool, Query()] = True,
    user_id: str = Depends(current_user_id),
):
    if task_id == 404:
        raise HTTPException(status_code=404, detail="Task not found")

    return TaskOut(
        id=task_id,
        title="Read FastAPI code",
        priority=3,
        labels=["api"],
        done=include_done,
        owner_id=user_id,
    )

@router.patch("/{task_id}", response_model=TaskOut)
async def patch_task(
    task_id: Annotated[int, Path(ge=1)],
    body: TaskPatch,
    user_id: str = Depends(current_user_id),
):
    if body.title is None and body.priority is None and body.done is None:
        raise HTTPException(status_code=400, detail="No changes provided")

    return TaskOut(
        id=task_id,
        title=body.title or "Read FastAPI code",
        priority=body.priority or 3,
        labels=["api"],
        done=body.done if body.done is not None else False,
        owner_id=user_id,
    )
```

读这段代码时，公开合同是：

`POST /tasks` 创建任务。

`GET /tasks/{task_id}` 读取任务。

`PATCH /tasks/{task_id}` 局部更新任务。

认证由 `current_user_id` dependency 处理。

`TaskCreate` 是创建请求体。

`TaskPatch` 是更新请求体。

`TaskOut` 是公开响应。

`task_id` 必须是大于等于 1 的整数。

缺少 `Authorization` header 会返回 401。

找不到任务会返回 404。

空 patch 会返回 400。

输入类型或字段不合法会在函数体之前返回 422。

## 测试这个示例

对应测试可以这样写：

```python
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.routes.tasks import router

app = FastAPI()
app.include_router(router)

client = TestClient(app)

def test_create_task():
    response = client.post(
        "/tasks",
        headers={"Authorization": "Bearer token"},
        json={"title": "Read docs", "priority": 2},
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Read docs"
    assert response.json()["owner_id"] == "u_123"

def test_create_task_requires_auth():
    response = client.post(
        "/tasks",
        json={"title": "Read docs", "priority": 2},
    )

    assert response.status_code == 401

def test_create_task_validates_body():
    response = client.post(
        "/tasks",
        headers={"Authorization": "Bearer token"},
        json={"title": "", "priority": 9},
    )

    assert response.status_code == 422

def test_get_task_validates_path():
    response = client.get(
        "/tasks/abc",
        headers={"Authorization": "Bearer token"},
    )

    assert response.status_code == 422
```

这些测试分别覆盖：

成功创建。

认证失败。

body 校验失败。

path 校验失败。

如果测试只覆盖第一个场景，API 合同仍然很脆。

## Glossary：读 FastAPI 代码常见词

API：应用程序之间通信的接口。

REST：一种常见的资源导向 API 风格。

HTTP：Web 通信协议，定义 method、headers、status code 等语义。

Method：请求动作，例如 `GET`、`POST`、`PATCH`。

Path：URL 中标识资源位置的部分，例如 `/tasks/1`。

Query：URL 中 `?` 后面的参数，例如 `?limit=20`。

Header：请求或响应的元信息，例如 `Authorization`。

Body：请求或响应的主体内容，API 中常见为 JSON。

JSON：轻量数据格式，常用于 API request 和 response。

Schema：数据结构描述，不是实际数据。

JSON Schema：描述 JSON 形状和约束的标准。

OpenAPI：描述 HTTP API 的标准格式。

Swagger UI：基于 OpenAPI 的交互式文档界面。

ReDoc：另一种基于 OpenAPI 的文档界面。

Pydantic：Python 数据校验和序列化库。

Model：Pydantic 中描述数据形状的类。

Field：Pydantic 字段配置，用于默认值、长度、范围等规则。

Decorator：Python 装饰器，FastAPI 用它注册路由。

Path operation：FastAPI 中 method + path + function 的组合。

Router：一组路由的集合，常用 `APIRouter`。

Dependency：通过 `Depends` 注入的依赖逻辑。

Middleware：请求进入 endpoint 前后执行的全局处理层。

Exception handler：把异常转换成响应的处理器。

Status code：HTTP 响应状态码。

Validation error：输入不符合声明规则时产生的校验错误。

Serialization：把 Python 对象转换成可传输格式，例如 JSON。

Deserialization：把 JSON 等输入转换成 Python 对象。

Async：异步并发模型。

Await：等待异步操作完成，并把执行权交回事件循环。

Event loop：调度异步任务的循环。

Blocking I/O：会占住当前执行线程的 I/O 操作。

TestClient：FastAPI/Starlette 测试客户端。

HTTPX：Python HTTP 客户端库，常用于同步或异步 API 测试和调用。

ASGI：Python 异步 Web 服务接口规范，FastAPI 基于 ASGI 生态。

Uvicorn：常见 ASGI server。

## FAQ

### FastAPI 是不是只适合小项目？

不是。

FastAPI 可以从单文件开始，也可以组织成多模块项目。

关键在于项目如何拆 router、schema、service、repository、配置和测试。

### 一定要先精通 Python 才能读 FastAPI 吗？

不需要。

但要先掌握函数、类、类型提示、装饰器、异常、模块导入、async/await 的基础读法。

FastAPI endpoint 的很多信息都写在函数签名和装饰器里。

### 为什么我的函数没有执行就返回 422？

因为 FastAPI 在进入函数体前完成了参数解析和校验。

path、query、headers 或 body 不符合声明时，函数体不会执行。

先看响应里的 `detail`。

### `response_model` 和返回类型注解有什么区别？

两者都能帮助描述响应。

`response_model` 是 FastAPI 装饰器参数，明确控制输出 schema。

返回类型注解也能被 FastAPI 使用，但项目风格不同。

读现有项目时优先遵循本项目约定。

### `dict` 能不能作为 request body？

可以。

但生产 API 中通常不推荐长期使用裸 `dict`。

裸 `dict` 缺少字段级约束、文档说明和编辑器提示。

Pydantic model 更适合公开 API 合同。

### `async def` 是否总比 `def` 好？

不是。

如果内部调用同步阻塞库，`async def` 反而可能让问题更隐蔽。

要根据项目依赖的数据库、HTTP 客户端和 SDK 模型选择。

### 什么时候用 400，什么时候用 422？

类型转换、字段缺失、长度范围等边界校验失败通常是 422。

请求结构合法但违反业务规则，可以用 400 或更具体的 409、403 等。

团队最好统一错误语义。

### 401 和 403 有什么区别？

401 通常表示未认证或认证无效。

403 通常表示已经识别请求者，但没有权限执行该操作。

### 为什么 `/docs` 里没有我的 endpoint？

可能 router 没注册。

可能模块没有被导入。

可能运行了错误的 app。

可能设置了 `include_in_schema=False`。

也可能本地服务没有重启或热重载没生效。

### 测试里为什么应该用 `json=...`？

`json=...` 会把 Python 对象序列化为 JSON，并设置 JSON content type。

这更接近真实 API 调用。

使用 `data=...` 可能发送表单或原始 body，导致服务端解析路径不同。

### Pydantic model 是不是数据库 model？

通常不是。

Pydantic model 主要表达 API 或配置边界。

数据库 model 表达持久化结构。

两者可以相似，但职责不同。

### 为什么默认值要小心可变对象？

Python 的可变默认值可能在多次调用之间共享。

在 Pydantic 字段里，列表和字典默认值更推荐用 `default_factory`。

这能表达每个 model 实例都有自己的新对象。

## Checklist：读一个 FastAPI endpoint 前后要确认什么

### 路由与参数

- Method、path、router prefix 与 `include_router` 是否连成同一条路由。
- Path 参数名称和函数参数名称保持一致。
- Query 参数有默认值和范围限制。
- Header 参数使用 `Header`，认证 dependency 与权限检查位置清楚。

### Pydantic 校验

- Request body 使用明确的 Pydantic model。
- 必填、可空、默认值和 alias 是否符合合同。
- 字段长度与数值范围由模型表达。
- List 和 dict 一律使用合适的默认方式。

### 响应与 status code

- Response model 存在，返回值不会泄漏内部字段。
- 成功与错误 status code 是否各自明确。
- 401 与 403 是否区分认证缺失与权限不足。
- 404、409、422 分别对应资源不存在或隐藏权限细节、冲突、自动校验。

### 异常处理

- 异常被统一 handler 包装，而非裸 throw。
- 数据库事务边界明确。
- 日志里带 request id。

### 外部调用与异步

- 外部服务调用一律设置 timeout。
- 重试策略与幂等策略成对检查。
- `async def` 中没有同步库阻塞请求。
- CPU 密集逻辑不占用请求路径。

### 测试

- 成功路径、校验错误、认证失败与权限失败都有覆盖。
- 资源不存在和业务冲突有独立测试。
- 测试断言 response body，而非只看 status code。
- `/docs`、`/openapi.json` 与客户端示例保持同一份 method、path、headers、JSON body 合同。

## 最后再压缩成一句话

读 FastAPI，不要从“这段 Python 怎么运行”开始。

先从“这个 HTTP API 合同是什么”开始。

Method 决定动作。

Path 决定资源。

Query 决定读取选项。

Headers 决定元信息和认证。

Body 决定提交数据。

Pydantic 决定 JSON 形状。

类型提示决定参数解析和文档。

装饰器决定路由注册。

`async/await` 决定 I/O 等待模型。

Status code 决定结果语义。

测试决定这些合同是否被守住。

掌握这条线之后，大多数 FastAPI endpoint 都能被稳定拆开。

## 参考资料

- [FastAPI First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)
- [FastAPI Request Body](https://fastapi.tiangolo.com/tutorial/body/)
- [FastAPI Response Model](https://fastapi.tiangolo.com/tutorial/response-model/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [FastAPI Concurrency and async/await](https://fastapi.tiangolo.com/async/)
- [Pydantic Fields](https://docs.pydantic.dev/latest/concepts/fields/)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
