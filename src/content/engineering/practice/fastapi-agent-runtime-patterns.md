---
title: "给 AI 智能体开发者的 FastAPI：中间件、依赖注入与上下文管理"
date: 2026-05-13
category: engineering
description: "把 FastAPI 看作 Agent Runtime 的 HTTP 外壳：用 middleware 做横切治理，用 dependency 组装上下文，用 lifespan 管共享资源。"
difficulty: advanced
plainSummary: "AI Agent 服务不是把 Chain 塞进一个接口，而是把请求上下文、工具权限、模型客户端、trace、审批和状态恢复放进可测试的 FastAPI 边界。"
tags:
  - "FastAPI"
  - "AI Engineering"
  - "Agent"
lang: zh
coverImage: "/images/engineering/practice/fastapi-agent-runtime-cover.png"
draft: false
---

# 给 AI 智能体开发者的 FastAPI：中间件、依赖注入与上下文管理

> 时效边界：本文核验于 2026-05-13。FastAPI、OpenTelemetry、MCP 与各类 Agent 框架仍在快速演进，生产落地前请复查对应官方文档和当前版本的行为。

FastAPI 对 AI Agent 服务的价值，不是“可以很快写一个 `/chat` 接口”。

真正的价值在于：它能成为 Agent Runtime 的 HTTP 边界。

这个边界负责把一次外部请求变成一次可审计、可恢复、可取消、可限权、可观测的 Agent run。

模型推理、工具调用、MCP client、向量检索、人工审批和后台执行都可以在边界后面发生。

但边界本身必须先回答更基础的问题：

- 这次请求是谁发起的；
- 属于哪个租户、工作区或项目；
- 能读取哪些上下文；
- 能使用哪些工具；
- 能花多少预算；
- 是否需要人工审批；
- run 状态如何持久化；
- 失败后能否恢复；
- trace 如何把 HTTP、模型调用和工具调用串起来。

如果这些问题没有在 HTTP 边界被清楚处理，Agent 会变成一个很会“执行”的黑箱。

它可能能完成任务，却很难被团队信任。

![FastAPI Agent 上下文流转可视化](/images/engineering/practice/fastapi-agent-context-visual.png)

![FastAPI Agent Runtime 分层可视化](/images/engineering/practice/fastapi-agent-runtime-layers-visual.png)

## 读者定位

这篇文章面向已经能写 FastAPI 服务、也已经接触过 LLM/Agent 开发的工程师。

你不需要把它当成 FastAPI 入门教程。

更准确地说，它是一份 runtime boundary 设计参考。

它讨论的不是“怎么把模型接到接口里”。

它讨论的是：当 Agent 开始接触真实用户、真实数据、真实工具、真实审批、真实故障时，FastAPI 应该承担哪些边界职责。

## 核心结论

一个可运营的 Agent 后端，通常不应该只有一个同步 `/chat` handler。

更稳妥的形态是：

- FastAPI middleware 处理横切治理；
- dependency chain 解析身份、权限、策略和上下文；
- lifespan 管理共享资源；
- handler 创建 run，并返回 run 边界；
- runner 执行模型和工具；
- event stream 暴露进度；
- persistence 存储 run、step、approval、artifact；
- OpenTelemetry 把 request、run、step 串成一条 trace；
- approval gate 把高风险动作从模型自动执行里拆出来。

这不是把系统做重。

这是把 Agent 从 demo 变成平台时必须补上的工程外壳。

## 三条链：HTTP 链、上下文链、Agent 链

很多 Agent 服务混乱，是因为把三条链混在了一起。

第一条是 HTTP 链。

它从 request 进入服务开始，经过 middleware、routing、dependency、handler，最后变成 response。

它关心的是：

- 请求大小；
- CORS；
- request id；
- trace context；
- auth header；
- rate limit；
- 错误响应格式；
- streaming 协议；
- timeout 和取消。

第二条是上下文链。

它从 HTTP request 中解析出 Agent 执行前必须确定的上下文。

它关心的是：

- user；
- tenant；
- workspace；
- conversation；
- run id；
- model policy；
- tool policy；
- memory scope；
- budget；
- approval policy；
- audit metadata。

第三条是 Agent 执行链。

它才是模型调用、planner、tool call、MCP client、parser、retry、reflection、artifact 生成和最终答案所在的位置。

FastAPI 的职责不是替代 Agent 框架。

FastAPI 的职责是让 Agent 框架运行在清楚的边界里。

## Runtime Model：把请求变成 run

AI Agent 服务与普通 CRUD API 最大的不同，是一次请求可能不是一次短事务。

一次 Agent run 可能包含：

- 多轮模型调用；
- 多次工具调用；
- 外部 API 等待；
- 文件生成；
- 人工审批；
- 用户取消；
- 队列重试；
- 断线后的事件补发；
- 失败后的 resume。

因此，runtime model 不应该只围绕 response body 设计。

更好的基本单位是 `run`。

一个 run 至少有这些字段：

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

`input_snapshot` 保存用户请求。

`context_snapshot` 保存经过清洗、截断、授权后的上下文摘要。

`policy_snapshot` 保存当时生效的模型、工具和审批策略。

这几个 snapshot 很重要。

因为 Agent run 可能在几分钟后恢复，也可能在几天后被审计。

如果恢复时重新读取“当前策略”，结果可能与创建 run 时不同。

如果审计时只看最终答案，也很难知道系统当时为什么允许某个工具。

## 推荐的 API 边界

Agent 服务可以保留 `/chat` 作为简单兼容层。

但核心运行时建议围绕 `/agent/runs` 设计。

```text
POST   /agent/runs
GET    /agent/runs/{run_id}
GET    /agent/runs/{run_id}/events
POST   /agent/runs/{run_id}/cancel
POST   /agent/runs/{run_id}/approvals/{approval_id}
GET    /agent/runs/{run_id}/artifacts
POST   /agent/runs/{run_id}/resume
```

这些 endpoint 对应不同的系统语义。

| endpoint | 语义 |
| --- | --- |
| `POST /agent/runs` | 创建一次运行 |
| `GET /agent/runs/{run_id}` | 查询最终或当前状态 |
| `GET /agent/runs/{run_id}/events` | 订阅 step、token、tool、approval 事件 |
| `POST /cancel` | 用户主动取消 |
| `POST /approvals/{approval_id}` | 人工批准或拒绝高风险动作 |
| `GET /artifacts` | 获取输出文件、报告、补充结果 |
| `POST /resume` | 从可恢复状态继续执行 |

`/chat` 的问题不是名字。

问题是它很容易暗示“请求进来，答案出去”。

真实 Agent runtime 往往是“请求进来，run 创建，事件持续产生，状态可被查询，部分动作需要审批，最终结果可追溯”。

## Middleware：只处理横切治理

FastAPI middleware 适合处理所有请求都需要经过的横切能力。

它不适合承载业务装配。

对 Agent 服务来说，常见 middleware 包括：

| middleware | 应处理的问题 |
| --- | --- |
| Request ID | 为请求生成或读取 `x-request-id` |
| Trace Context | 读取 `traceparent`、`baggage`，向下游传播 |
| Timing | 记录 HTTP 层 latency |
| CORS | 支持浏览器端 Agent UI |
| Security Headers | 收紧浏览器访问面 |
| Body Size Guard | 限制超大 prompt、文件引用或上下文包 |
| Rate Limit Hook | 在进入昂贵依赖前做粗粒度拦截 |
| Error Envelope | 统一未捕获异常的响应形状 |

一个 request id middleware 可以很小：

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

注意这段代码没有解析用户。

也没有创建 Agent。

也没有打开数据库事务。

middleware 是请求外壳，不是 runtime 组装器。

如果把用户、权限、工具 registry、模型客户端都塞进 middleware，系统会很快变得难测。

## Middleware 边界：什么不该放进去

不要在 middleware 里做这些事：

- 调用模型；
- 创建每次 run 的工具列表；
- 读取长记忆；
- 查询大量业务数据；
- 创建数据库 session 并跨过整条请求链；
- 决定是否允许某个具体工具；
- 生成最终用户可见答案。

原因很简单。

middleware 的调用顺序、异常传播、响应包装和 streaming 行为，都更适合横切处理。

业务上下文应该进入 dependency chain。

Agent 执行应该进入 runner。

长期任务应该进入后台 worker 或 durable execution。

边界越清楚，故障越容易定位。

## Dependency Chain：把 AgentContext 注入 handler

FastAPI 的 dependency system 对 Agent 服务非常合适。

它能把“运行前必须解析的资源和权限”表达成显式链条。

例如：

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

一个简化的 `AgentContext` 可以这样定义：

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

`frozen=True` 不是必须。

但它传达了一个重要想法：context 是运行边界，不应该在执行过程中被随意改写。

如果 runner 需要记录状态，应写入 run store 或 event store。

不要把 `AgentContext` 变成一个到处塞临时字段的可变大包。

## Dependency 示例：身份、策略、上下文

下面的示例展示了 dependency chain 的基本形态。

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

handler 就可以保持非常薄：

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

handler 不需要知道 token 怎么验证。

也不需要知道工具权限从哪个表来。

更不应该让模型自己判断这些事情。

## Dependency Chain 与 Agent Chain 的分工

FastAPI dependency chain 和 Agent chain 都叫“链”，但语义完全不同。

| 维度 | FastAPI dependency chain | Agent execution chain |
| --- | --- | --- |
| 核心问题 | 这次请求能被怎样运行 | 这次任务怎样被完成 |
| 触发时间 | handler 运行前 | run 创建后 |
| 典型失败 | 401、403、422、429、503 | 工具失败、模型超时、解析失败、审批拒绝 |
| 输出 | 注入 handler 的资源和上下文 | step、event、artifact、final answer |
| 可测试性 | dependency override、TestClient | runner 单测、集成测试、回放测试 |
| 安全意义 | 系统边界 | 业务执行 |

健康的 Agent 服务会让 dependency chain 先于 Agent chain。

用户是谁、能用什么工具、预算多少、哪些动作要审批，不应由模型推理决定。

这些是系统事实。

模型只在系统事实允许的范围内执行任务。

## Lifespan：管理共享资源

Agent 服务通常需要共享资源。

例如：

- 模型客户端；
- embedding 客户端；
- 数据库连接池；
- Redis 或队列连接；
- vector store client；
- MCP client pool；
- tool registry；
- OpenTelemetry exporter；
- feature flag client；
- secret manager client。

这些资源不应该在每个请求里重复创建。

FastAPI 的 `lifespan` 适合管理启动和关闭。

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

然后用 dependency 读取共享资源：

```python
from typing import Annotated
from fastapi import Depends, Request

def get_model_client(request: Request) -> ModelClient:
    return request.app.state.model_client

ModelClientDep = Annotated[ModelClient, Depends(get_model_client)]
```

这样做的好处是：

- 启动失败会在服务启动阶段暴露；
- 关闭时能释放连接；
- 测试时可以覆盖 dependency；
- handler 不需要关心资源构造细节；
- 多 worker 部署时资源生命周期更清楚。

## Lifespan 的常见陷阱

第一，不要把每个用户的状态放进 `app.state`。

`app.state` 是应用级共享状态。

它适合放 client、pool、registry。

它不适合放用户上下文、conversation memory、当前 run 状态。

第二，不要假设一个进程等于一个全局 runtime。

生产部署可能有多个 Uvicorn/Gunicorn worker。

每个 worker 都有自己的 `app.state`。

因此 run 状态必须进入外部持久化系统，而不是只放内存。

第三，不要在 lifespan 里做长时间阻塞的预热。

必要的健康检查可以做。

但大量索引加载、模型 warmup 或工具发现，应有超时、降级和 readiness 策略。

否则服务会在部署时不可预测地卡住。

## Context Isolation

### 上下文隔离优先于上下文丰富

Agent 服务常见事故不是模型“不够聪明”。

更常见的是上下文隔离失败。

典型事故包括：

- 用户 A 的记忆被用户 B 读到；
- 某个 workspace 的文件出现在另一个 workspace 的检索结果里；
- 内部 system prompt 被拼进用户可见输出；
- 调试日志记录了 access token；
- 高权限工具出现在低权限用户的 tool list；
- 长任务恢复时使用了错误的 policy；
- summary 把不该跨会话保留的信息写入长期记忆。

上下文管理的第一原则不是“给模型更多信息”。

第一原则是“只给本次任务有权使用的信息”。

一个可操作的上下文分层如下：

| 层 | 内容 | 进入 prompt 的策略 |
| --- | --- | --- |
| Identity | user_id、workspace_id、role | 一般不直接进入 prompt |
| Task Input | 用户输入、选中文件、UI 状态 | 清洗、截断后进入 |
| Runtime Policy | model、budget、max_steps | 只给必要摘要 |
| Tool Policy | allowed_tools、approval gates | 可转换为工具说明 |
| Memory Scope | 可读取的 conversation/doc scope | 只读取授权范围 |
| Observability | request_id、trace_id、run_id | 用于日志和 trace，不影响推理 |
| Secrets | API keys、tokens | 永远不进 prompt |

不要把 `Request` 对象、数据库 session、完整用户记录、完整权限对象直接交给 Agent。

Agent 需要的是经过整理的、可审计的、长度受控的上下文。

### 租户、工作区、会话三层隔离

上下文隔离不能只靠一个 `user_id`。

多数真实系统至少有三层范围：

- tenant；
- workspace；
- conversation。

tenant 是组织边界。

workspace 是项目或团队边界。

conversation 是一次任务或对话边界。

长期 memory、文件检索、工具权限、artifact 访问，都要明确属于哪一层。

一个常见设计是：

```text
tenant_id
  -> workspace_id
      -> conversation_id
          -> run_id
              -> step_id
```

任何查询如果只带 `run_id` 而不校验上层范围，都有越权风险。

`run_id` 应该是定位符，不是授权凭证。

### 检索前过滤与检索后过滤

RAG 和工具检索要同时考虑检索前过滤和检索后过滤。

检索前过滤是在 query 时限制范围。

例如只搜索当前 workspace 的文档。

检索后过滤是在结果返回后再次检查每条结果的权限。

两者都需要。

只做检索前过滤的问题是索引或 metadata 错误时会漏防。

只做检索后过滤的问题是可能浪费大量检索预算，也可能让排序受到越权内容影响。

推荐流程：

```text
resolve memory scope
  -> build retrieval filter
  -> execute retrieval
  -> per-result authorization check
  -> redact fields
  -> build prompt context
```

进入 prompt 的内容应该是已经过滤和脱敏后的结果。

不要把原始检索结果交给模型自己筛。

### 长期记忆写入策略

长期记忆的写入比读取更危险。

读取越权会泄漏信息。

写入错误会污染未来所有运行。

长期记忆写入至少要经过这些检查：

- 这条信息是否适合长期保存；
- 是否包含 secret；
- 是否包含个人敏感信息；
- 是否只属于一次临时任务；
- 是否有明确的 tenant/workspace scope；
- 是否需要用户确认；
- 是否有删除和过期策略。

可以把 memory write 分成三类。

| 类型 | 示例 | 策略 |
| --- | --- | --- |
| Ephemeral | 本次任务临时事实 | run 结束后过期 |
| Conversation | 当前对话偏好和摘要 | conversation scope |
| Durable | 明确可复用的用户偏好或项目事实 | 需要更强审计 |

Agent 不应该默认把每次对话摘要写进 durable memory。

默认持久化越多，未来污染越难清理。

### Prompt 构建器

Prompt 构建器应该是 runtime 的一等组件。

它不只是字符串拼接。

它负责把授权后的上下文转成模型可读输入。

一个 prompt builder 可以按这些步骤运行：

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

`prompt package` 可以包含：

- system message；
- developer policy summary；
- user task；
- context snippets；
- tool descriptions；
- output schema；
- redaction report；
- token estimate。

这样做的好处是 prompt 构建可以单独测试。

也可以在事故后复盘“模型当时看到了什么类型的信息”，而不必暴露完整敏感内容。

## Tool Permissions：工具列表就是权限边界

Agent 工具不是普通函数列表。

工具列表本身就是安全边界。

如果模型能看到 `delete_user`、`send_email`、`deploy_production`、`refund_payment`，即使你在 prompt 里写“谨慎使用”，系统风险也已经变高。

工具权限应该在 FastAPI 层和 policy 层先被裁剪。

```python
def build_tool_registry(ctx: AgentContext, catalog: ToolCatalog) -> ToolRegistry:
    registry = ToolRegistry()
    for tool_name in ctx.allowed_tools:
        tool = catalog.get(tool_name)
        registry.register(tool.with_audit_tags(ctx.audit_tags))
    return registry
```

更稳妥的做法是给工具分类：

| 类别 | 示例 | 默认策略 |
| --- | --- | --- |
| Read-only | 搜索文档、查询公开配置 | 可自动执行 |
| Scoped read | 查询客户、读取内部指标 | 按 workspace / role 限制 |
| Draft write | 创建草稿、生成 PR、写临时文件 | 可自动执行但必须审计 |
| External side effect | 发邮件、提交工单、调用支付接口 | 需要审批 |
| Production mutation | 部署、删除、权限变更 | 默认禁止或强审批 |

工具调用时还要做二次检查。

不要只在工具列表构建时检查一次。

因为工具参数本身也可能越权。

例如 `query_docs(scope="all_company")` 对普通用户不应该通过。

## MCP Integration：把 MCP 当外部能力边界

MCP 很适合作为 Agent 与工具服务器之间的协议边界。

但 MCP 不是权限系统本身。

FastAPI 服务接入 MCP 时，需要额外处理这些问题：

- 哪些用户可以使用哪个 MCP server；
- 每个 MCP server 暴露的 tools 是否需要裁剪；
- 工具参数是否需要按租户重写或校验；
- MCP server 的鉴权凭据如何保存；
- stdio server 是否允许在当前部署环境启动；
- HTTP transport 是否需要 origin 校验和认证；
- MCP 调用的 trace 如何接入同一条 run trace；
- MCP 连接失败时 run 如何降级或恢复。

一种实用结构是：

```text
FastAPI request
  -> AgentContext
  -> ToolPolicy
  -> MCPClientFactory
  -> ScopedMCPClient
  -> ToolRegistry
  -> AgentRunner
```

`ScopedMCPClient` 不应该暴露原始全部工具。

它应该只暴露当前用户、当前 workspace、当前 run 允许的工具。

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

对于 HTTP MCP transport，还要特别注意浏览器相关风险。

本地 MCP server 不应随意绑定 `0.0.0.0`。

HTTP 入口需要认证。

Origin 校验不能省。

这些属于 runtime 安全边界，不是 Agent prompt 能补救的问题。

## Streaming and Events：不要只 stream token

Agent streaming 不只是 token streaming。

用户真正需要知道的是 run 发生了什么。

一个成熟的 event stream 应该能表达：

- run 已创建；
- run 已开始；
- 模型开始生成；
- 模型 token 增量；
- 工具调用开始；
- 工具调用结果；
- 需要人工审批；
- 审批已通过或拒绝；
- artifact 已生成；
- run 已取消；
- run 已失败；
- run 已完成。

可以用 Server-Sent Events 暴露事件。

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

SSE 的优势是简单、容易被浏览器消费、适合单向进度流。

WebSocket 更适合双向互动、实时协作或长连接控制。

普通 chunked HTTP streaming 适合只输出 token，但不适合表达复杂事件类型。

## Event Schema：事件要可回放

事件不是日志的替代品。

事件是用户界面、恢复流程和审计流程都可能依赖的运行事实。

建议事件至少包含：

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

`sequence` 用于排序。

`visibility` 用于区分用户可见事件和内部事件。

`payload` 要避免存放密钥、完整 prompt、原始 token 或敏感工具结果。

如果前端断线，应该能通过 `Last-Event-ID` 或 query 参数从某个事件后继续读取。

这要求 event store 是持久化的，而不是只靠内存队列。

## Background Jobs：FastAPI BackgroundTasks 不是任务队列

FastAPI 的 `BackgroundTasks` 适合请求后的小型附带任务。

例如：

- 写一条轻量审计日志；
- 发送非关键通知；
- 做一个很短的清理动作。

它不适合作为可靠 Agent runtime。

不适合的原因包括：

- 进程重启会丢任务；
- 没有天然重试；
- 没有跨 worker 调度；
- 没有 backpressure；
- 不适合长时间运行；
- 不适合等待人工审批；
- 不适合恢复复杂 step 状态。

Agent run 如果可能超过几秒，建议进入真正的后台执行系统。

可以是 Celery、RQ、Dramatiq、Arq、Temporal、Prefect、队列加自研 worker，或者云厂商的 durable workflow。

关键不是选哪一个。

关键是把 HTTP 请求生命周期和 Agent 执行生命周期分开。

## Run Persistence

### 状态表比“聊天记录”更重要

聊天记录只记录用户说了什么、助手回答了什么。

run persistence 记录系统做了什么。

一个最小的数据模型可以包含：

```text
agent_runs
agent_steps
agent_events
agent_approvals
agent_artifacts
agent_checkpoints
```

`agent_runs` 存 run 总状态。

`agent_steps` 存模型调用、工具调用、审批等待、恢复点。

`agent_events` 存用户可见和系统可见事件。

`agent_approvals` 存人工决策。

`agent_artifacts` 存生成文件和引用。

`agent_checkpoints` 存可恢复的 runner 状态。

run 状态建议明确枚举：

```text
queued
running
waiting_for_approval
completed
failed
cancelled
expired
```

不要只用 `done: true/false`。

Agent runtime 的中间态很多。

中间态越清楚，用户体验和恢复逻辑越简单。

### 状态转换表

run 状态应该有明确转换。

| 当前状态 | 事件 | 下一个状态 |
| --- | --- | --- |
| queued | worker picked | running |
| queued | queue timeout | failed |
| running | approval created | waiting_for_approval |
| running | completed | completed |
| running | fatal error | failed |
| running | user cancel | cancelled |
| waiting_for_approval | approved | running |
| waiting_for_approval | rejected | running 或 failed |
| waiting_for_approval | expired | expired |
| failed | resume requested | queued |

状态转换应由 service 层控制。

不要让 runner 在多个地方随手改 status。

状态转换可以记录成 event。

这样审计和 UI 都能复用同一事实源。

### Step 设计

step 是 run 的内部执行单位。

常见 step 类型包括：

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

step 记录建议包含：

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

`input_summary` 和 `output_summary` 不是完整输入输出。

它们是用于审计和排障的摘要。

完整敏感内容应该按安全策略存放或不存放。

### Artifact 设计

Agent runtime 经常生成 artifact。

例如：

- 报告；
- 代码 patch；
- 表格；
- 图片；
- 音频；
- 查询结果；
- 工单草稿；
- 邮件草稿。

artifact 需要自己的生命周期。

不要把大文件直接塞进 run 表。

artifact record 可以包含：

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

`visibility` 很重要。

有些 artifact 是用户可见结果。

有些 artifact 只是内部中间产物。

## Approval Gates：高风险动作先变成提案

审批不是在最终答案里写一句“需要人工确认”。

审批应该是 runtime 状态。

当 Agent 想调用高风险工具时，runner 应该创建 approval request。

然后 run 进入 `waiting_for_approval`。

```text
tool_call_proposed
  -> approval_created
  -> run_waiting_for_approval
  -> approval_approved / approval_rejected
  -> tool_call_executed / tool_call_skipped
```

approval payload 应该包含：

- 工具名；
- 参数摘要；
- 影响范围；
- 风险等级；
- 预计外部副作用；
- rollback 提示；
- 由哪个模型和 step 提出；
- 到期时间。

FastAPI endpoint 负责接收人的决定：

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

审批通过后，worker 再恢复 run。

这比让 handler 同步等待人类操作稳得多。

## OpenTelemetry Trace Model：三层 span

FastAPI 的自动 instrumentation 能覆盖 HTTP 层。

但它不会自动理解你的 Agent runtime。

Agent 服务需要手动补业务 span。

![Agent trace 与故障恢复可视化](/images/engineering/practice/agent-trace-recovery-visual.png)

建议 trace 至少有三层：

```text
HTTP request span
  -> agent.run span
      -> agent.step.model span
      -> agent.step.tool span
      -> agent.step.approval span
      -> agent.step.persist span
```

每层 span 关注不同属性。

| span | 建议属性 |
| --- | --- |
| HTTP request | route、method、status_code、request_id |
| agent.run | run_id、workspace_id、model、max_steps、final_status |
| model step | provider、model、token_count、retry_count、latency |
| tool step | tool_name、tool_category、approval_required、status |
| persistence | table/store、operation、retry_count |

不要把完整 prompt、用户隐私、access token、工具原始返回直接写入 span attribute。

trace 是跨系统可见的运维数据。

它的访问面通常比业务数据库更宽。

## 日志、指标与 Trace 的分工

三者不要混用。

日志适合记录离散事实：

- run created；
- approval rejected；
- tool timeout；
- worker resumed；
- checkpoint loaded。

指标适合聚合趋势：

- run 成功率；
- 平均 step 数；
- 每模型 token 成本；
- 工具超时率；
- approval 等待时长；
- queue delay；
- cancellation rate。

trace 适合定位单次请求的因果链：

- 哪个 dependency 慢；
- 哪个 tool 卡住；
- 哪次模型调用重试；
- run 与 HTTP request 是否断开；
- 后台 worker 是否接续了同一 trace。

把三者连起来的共同键通常是：

```text
request_id
trace_id
run_id
step_id
workspace_id
```

## Security and Privacy：Agent Runtime 的安全清单

Agent 后端的安全面比普通 API 更大。

因为它不仅返回数据，还可能调用工具、生成文件、触发外部副作用。

至少要检查这些点：

- 所有 endpoint 都有认证；
- run 查询按 user/workspace 授权；
- event stream 不能跨 run 泄漏；
- 工具列表按策略裁剪；
- 工具参数做二次授权；
- prompt 和 trace 不记录 secret；
- 上传文件做类型、大小和扫描限制；
- 检索结果按权限过滤；
- 长期 memory 按 tenant 隔离；
- approval decision 写审计日志；
- cancel/resume 需要权限校验；
- rate limit 区分便宜请求和昂贵 run；
- 错误响应不暴露内部 stack；
- MCP HTTP transport 做认证和 Origin 校验；
- 本地 stdio 工具不暴露给远程未授权请求。

隐私上还要考虑数据生命周期。

哪些输入会进入长期记忆？

哪些会进入向量库？

哪些会进入 trace？

哪些会进入模型提供商？

哪些会保存在 artifact？

用户删除数据时，这些副本如何处理？

这些不是文档细节。

它们决定 Agent 服务能否进入真实组织。

## Testing：用 dependency override 测边界

FastAPI 的测试优势之一，是可以覆盖 dependency。

这对 Agent runtime 很有价值。

你可以在测试里替换：

- 当前用户；
- workspace；
- policy；
- model client；
- tool registry；
- run store；
- event store；
- approval service。

例如：

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

边界测试应该覆盖：

- 未登录请求返回 401；
- 无 workspace 权限返回 403；
- 超大输入返回 422 或 413；
- 普通用户看不到高权限工具；
- event stream 不能读取别人的 run；
- approval endpoint 不能越权决定；
- cancel 后 runner 不再执行外部副作用；
- resume 使用创建 run 时的 policy snapshot；
- trace id 与 run id 能被关联。

## Testing：Runner 与 Tool 的测试

Agent runner 不应该只能端到端测试。

它应该能在不启动 HTTP server 的情况下测试。

推荐把 runner 接口设计成这样：

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

这样测试时可以传入 fake model、fake tools、in-memory event sink。

工具测试要覆盖：

- 参数 schema；
- 权限校验；
- timeout；
- retry；
- idempotency；
- audit log；
- error mapping；
- sensitive data redaction。

不要只测试 happy path。

Agent 系统最需要测试的是“模型提出了危险动作时，系统有没有拦住”。

## Failure Recovery：先承认失败是常态

Agent run 比普通 API 更容易失败。

失败来源包括：

- 模型 provider 超时；
- token limit；
- parser 失败；
- 工具 API 429；
- MCP server 断开；
- worker 重启；
- event stream 断线；
- 用户取消；
- approval 过期；
- artifact 上传失败；
- 数据库暂时不可用。

所以 runtime 要把失败分类。

| 类型 | 示例 | 策略 |
| --- | --- | --- |
| Retryable | 429、临时网络错误 | 指数退避重试 |
| Recoverable | worker 重启、stream 断线 | 从 checkpoint 恢复 |
| User-actionable | 需要审批、输入缺失 | 等待用户 |
| Fatal | 权限拒绝、schema 不兼容 | 终止 run |
| Partial | artifact 失败但答案已生成 | 标记降级结果 |

checkpoint 不一定要保存完整模型内部状态。

但至少要保存：

- 已完成 step；
- 已发出的外部副作用；
- 当前待审批项；
- 可重试工具调用；
- 已生成 artifact；
- 下一步应该从哪里继续。

恢复时最重要的是幂等。

如果某个工具已经发送了邮件，resume 时不能再发送一次。

## Production Checklist

上线前可以按这份清单扫一遍。

API 边界：

- `/agent/runs` 创建 run；
- run 查询有授权；
- event stream 有授权；
- cancel 有授权；
- approval 有授权；
- 输入 schema 有长度限制；
- 错误响应不泄漏内部细节。

Runtime：

- run 状态持久化；
- step 状态持久化；
- event 持久化；
- checkpoint 可恢复；
- worker 支持 retry；
- cancel 能停止后续副作用；
- approval 能暂停和恢复 run。

工具：

- tool list 按用户裁剪；
- tool 参数二次校验；
- 高风险工具有 approval gate；
- 工具有 timeout；
- 工具有 audit log；
- 外部副作用具备 idempotency key。

可观测性：

- HTTP span 自动采集；
- agent.run span 手动采集；
- model/tool span 手动采集；
- run_id 写入日志；
- token/cost 指标可聚合；
- approval 等待时长可监控；
- queue delay 可监控。

安全隐私：

- secret 不进入 prompt；
- secret 不进入日志；
- secret 不进入 trace；
- memory 按 tenant 隔离；
- 检索按权限过滤；
- MCP HTTP transport 有认证和 Origin 校验；
- 数据保留策略清楚。

部署：

- lifespan 初始化失败能暴露；
- readiness 与 liveness 分开；
- 多 worker 下状态不依赖内存；
- worker 与 API 可独立扩缩容；
- 长任务有超时和过期策略；
- 依赖服务降级路径明确。

## Anti-patterns：常见坏味道

坏味道一：把 Agent 全写在 handler 里。

```python
@app.post("/chat")
async def chat(body: dict):
    llm = ModelClient(api_key=os.environ["API_KEY"])
    tools = [read_file, write_file, run_shell]
    result = await run_agent(body["message"], tools=tools)
    return {"answer": result}
```

这段代码短，但问题很多：

- 每次请求创建 client；
- 输入没有 schema；
- 工具没有按用户裁剪；
- 写入工具没有审批；
- 没有 run id；
- 没有 event stream；
- 没有恢复；
- 没有 trace；
- 测试只能端到端硬测。

坏味道二：用 prompt 代替权限。

“你只能读取当前用户的数据”不是权限系统。

权限必须在检索、工具列表、工具参数和存储层执行。

坏味道三：把长期记忆当日志。

memory 是给未来推理用的。

日志是给审计和排障用的。

两者的数据保留、访问权限和隐私风险完全不同。

坏味道四：只 stream token。

Token streaming 不能表达工具等待、审批、取消、恢复和 artifact。

Agent UI 需要 event stream。

坏味道五：把 BackgroundTasks 当可靠队列。

它适合轻量附带任务，不适合长时间 Agent run。

坏味道六：trace 里塞完整 prompt。

这会把敏感数据扩散到观测系统。

应记录摘要、长度、哈希、计数和结构化状态。

坏味道七：resume 时重新算权限。

恢复 run 时应该使用创建时的 policy snapshot，并在必要时叠加当前安全禁用规则。

否则同一个 run 的行为会随时间漂移。

## Production Playbook

### 从接口到运行平台

把 FastAPI 用作 Agent runtime 边界时，可以按四个阶段建设。

第一阶段是同步接口。

这一阶段可以只有一个 handler、一个 model client、少量只读工具。

但即使在这个阶段，也建议保留 run id。

因为 run id 是后续可观测性、事件流和恢复能力的根。

第二阶段是可观测运行。

这一阶段要补齐 request id、trace id、run event、model latency、tool latency、token cost。

目标不是把系统做复杂。

目标是当一次回答变慢或失败时，团队能知道慢在哪里。

第三阶段是可控工具执行。

这一阶段要有 tool permission matrix、approval gate、idempotency key、tool audit log。

只要 Agent 能触发外部副作用，就不能只靠 prompt 约束。

第四阶段是可恢复运行。

这一阶段要有后台 worker、run persistence、checkpoint、resume、cancel、incident recovery。

当服务重启、provider 限流、MCP server 断开时，run 不应该只剩一个模糊的 500。

这四个阶段可以渐进落地。

但架构上最好从一开始就承认 run 是核心实体。

### 最小可用边界

最小可用 Agent runtime 不需要一次性拥有所有能力。

但它至少应该有这些边界：

| 边界 | 最小要求 |
| --- | --- |
| Identity | 每次 run 都能定位 user 与 workspace |
| Authorization | 查询、事件、取消、审批都做权限检查 |
| Policy | model、tool、budget、approval 有 snapshot |
| State | run status 持久化 |
| Events | 关键 step 有事件 |
| Tools | tool list 按用户裁剪 |
| Safety | 高风险工具默认禁止或审批 |
| Observability | run_id 与 trace_id 可关联 |
| Recovery | 失败能给出分类和下一步 |

如果只能先做三件事，优先级建议是：

1. run persistence；
2. tool permission；
3. trace/event correlation。

没有 run persistence，系统无法恢复。

没有 tool permission，系统无法安全接入真实工具。

没有 trace/event correlation，系统无法排障。

### 配置分层

Agent runtime 的配置不要散落在 handler、prompt 和环境变量里。

可以分为五层。

| 配置层 | 示例 | 变更频率 |
| --- | --- | --- |
| Deploy config | provider endpoint、region、queue name | 部署时 |
| Runtime config | timeout、worker concurrency、event retention | 运维调整 |
| Tenant policy | 可用模型、预算、数据区域 | 租户级 |
| User policy | role、allowed tools、approval scope | 用户级 |
| Run override | max_steps、stream mode、conversation id | 单次运行 |

FastAPI dependency chain 可以把这些配置解析成一个明确的 `AgentRuntimeConfig`。

runner 不应该直接读取所有环境变量。

工具也不应该自己从 request header 里推断权限。

配置先在边界层收敛，再作为不可变对象传入执行层。

### 超时预算

Agent runtime 要有分层 timeout。

只设置一个 HTTP timeout 不够。

| 层 | timeout 目标 |
| --- | --- |
| HTTP request | 创建 run 或读取状态不被卡死 |
| Queue wait | 避免 run 永远排队 |
| Model call | 控制 provider 卡顿 |
| Tool call | 控制外部 API 卡顿 |
| Approval wait | 控制人工决策窗口 |
| Event stream idle | 控制断线检测 |
| Whole run | 控制总执行时间 |

每个 timeout 都应该映射到清楚的状态。

例如：

```text
model_call_timeout -> step failed, run retryable
approval_expired -> run expired
queue_timeout -> run failed before start
whole_run_timeout -> run cancelled by system
```

不要把所有 timeout 都变成同一个 500。

用户、运维和审计需要知道失败发生在哪一层。

### 成本预算

Agent run 的预算也要分层。

预算不是只看最终 token 数。

还要考虑：

- 输入 token；
- 输出 token；
- embedding；
- rerank；
- tool API 成本；
- vector database 查询；
- artifact 存储；
- 后台 worker 时间；
- 重试成本；
- 人工审批成本。

一个实用的预算对象可以包含：

```text
max_input_tokens
max_output_tokens
max_total_tokens
max_model_calls
max_tool_calls
max_cost_usd
max_wall_clock_seconds
```

runner 每完成一个 step，都更新预算消耗。

当预算接近上限时，Agent 应该收束任务，而不是继续展开。

当预算超过上限时，run 应该进入明确的失败或部分完成状态。

## Tool Permission Matrix

### 更细的矩阵

工具权限最好不要只有 allow/deny。

更实用的是矩阵。

| 工具类别 | 读取范围 | 写入范围 | 是否审批 | 是否幂等 | 是否可回滚 |
| --- | --- | --- | --- | --- | --- |
| `docs.search` | workspace docs | 无 | 否 | 是 | 不需要 |
| `metrics.query` | team metrics | 无 | 视角色 | 是 | 不需要 |
| `ticket.create` | selected project | draft/ticket | 可选 | 是 | 可关闭 |
| `email.send` | selected recipients | external email | 是 | 需要 key | 不完全 |
| `repo.write` | selected repo | branch/PR | 视路径 | 需要 key | 可 revert |
| `deploy.prod` | prod service | production | 强审批 | 需要 key | 视系统 |
| `billing.refund` | customer account | payment system | 强审批 | 需要 key | 受限制 |

每个工具都应该有 metadata。

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

Agent 看到的工具说明，是 metadata 的安全投影。

系统内部使用的 metadata 更完整。

不要把所有策略都写进 prompt。

### 参数级权限

工具级 allow 只是第一层。

参数级权限才是细粒度控制。

例如同一个 `repo.write` 工具：

- 可以写 feature branch；
- 不可以直接写 `main`；
- 可以改文档；
- 不可以改部署配置；
- 可以创建 PR；
- 不可以 merge PR。

参数级策略可以写成规则。

```text
tool = repo.write
allow branch starts_with "agent/"
deny branch equals "main"
allow path matches "docs/**"
deny path matches ".github/workflows/**"
require_approval path matches "infra/**"
```

工具执行前，runtime 用结构化参数做检查。

不要让模型用自然语言解释“这次应该没问题”。

权限判断应该是确定性的。

### 动态权限

有些权限不是静态的。

它们依赖 run 状态。

例如：

- 工具调用次数已经接近上限；
- 成本预算已经用完；
- 用户刚刚取消 run；
- approval 已过期；
- workspace 被管理员锁定；
- incident 模式下禁用写入工具；
- provider 正在限流。

所以工具执行前的最终判断应该看三类信息：

```text
static policy
run state
system safety state
```

当系统进入 incident 模式，可以全局禁用某些工具。

这比逐个修改用户 policy 更快。

## Approval Gate Patterns

### 确认、授权、双人复核

approval gate 不只有一种。

可以分成三类。

第一类是 confirmation。

用户确认 Agent 已经准备好的动作。

例如发送一封邮件、创建一个 ticket、提交一个 PR。

第二类是 authorization。

具备权限的人允许 Agent 执行超出默认范围的动作。

例如读取某个敏感指标或调用某个受限工具。

第三类是 dual control。

高风险动作需要两个人或两个角色批准。

例如生产部署、退款、权限变更。

不同 gate 的数据模型不同。

confirmation 更关注用户意图。

authorization 更关注权限范围。

dual control 更关注职责分离。

### 审批材料

审批材料要让人快速判断风险。

不要只展示“是否允许调用工具”。

建议包含：

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

`model rationale summary` 应该是摘要。

不需要暴露完整 chain-of-thought。

审批者需要知道系统为什么提出动作，不需要看到模型内部推理全文。

### 审批结果如何影响 run

审批结果不只是 approve/reject。

可以有更细的结果。

| 结果 | runtime 行为 |
| --- | --- |
| approve | 按原参数执行 |
| reject | 跳过该工具并让 Agent 改写计划 |
| modify | 使用审批者修改后的参数执行 |
| defer | 保持等待状态 |
| expire | 标记 approval 过期 |
| escalate | 转给更高权限角色 |

`modify` 很有用。

例如 Agent 草拟邮件，审批者改收件人或语气后再发送。

但 `modify` 必须重新记录参数摘要和审批者身份。

否则审计时无法区分模型提案与人类修改。

## MCP/HTTP 边界

### 三种部署形态

MCP 与 FastAPI 组合时，常见有三种形态。

第一种是 FastAPI 作为 MCP client。

FastAPI 接收用户请求，Agent runner 通过 MCP client 调用外部 MCP server。

这是最常见的业务服务形态。

第二种是 FastAPI 包装内部工具，再暴露给 Agent。

内部系统已有 HTTP API，FastAPI 做权限、审计、参数归一化，再作为工具层被调用。

第三种是 FastAPI 自身提供 MCP endpoint。

这适合把服务能力提供给多个 Agent client。

这三种形态边界不同。

不要把它们混成同一个 handler。

### 认证与凭据传递

MCP server 的凭据不应该直接暴露给模型。

常见凭据来源包括：

- service account；
- per-user OAuth token；
- workspace token；
- short-lived delegated token；
- secret manager 动态读取。

凭据传递要回答三个问题：

1. 以谁的身份调用；
2. 凭据能访问什么范围；
3. 凭据在哪里被记录和轮换。

对高风险工具，推荐使用短期委托凭据。

这样即使某次 run 泄漏了调用上下文，长期风险也更低。

### 错误映射

MCP 或 HTTP 工具错误不要原样抛给用户。

需要映射成 runtime 错误。

| 下游错误 | runtime 分类 |
| --- | --- |
| 401 / 403 | permission_denied |
| 404 | resource_not_found |
| 409 | conflict |
| 429 | rate_limited |
| 5xx | downstream_unavailable |
| timeout | downstream_timeout |
| invalid JSON-RPC | protocol_error |
| schema mismatch | tool_contract_error |

错误映射决定 retry、用户提示、告警和恢复策略。

如果全部映射成 `tool failed`，系统就失去了判断能力。

## Streaming Contract

### 前端真正需要的事件

Agent UI 不只需要文本。

它需要可解释的状态。

建议至少支持这些事件：

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

每个事件都应该有稳定 schema。

前端不应该从自然语言日志里解析状态。

例如：

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

### 断线与补发

事件流一定会断。

浏览器刷新、移动网络、反向代理 timeout、部署重启都会造成断线。

所以 event stream 要支持补发。

设计要点：

- event 有递增 sequence；
- event 有稳定 event_id；
- client 记录最后收到的 event_id；
- reconnect 时带上 `Last-Event-ID`；
- server 从 event store 继续发送；
- event retention 要覆盖常见断线窗口。

如果 event 只在内存里，断线后 UI 就只能显示“不知道发生了什么”。

这会显著降低用户对 Agent 的信任。

## Trace Schema

### 命名规则

trace 命名要稳定。

建议使用清楚的 span name。

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

属性命名也要稳定。

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

稳定命名可以让 dashboard、alert 和查询复用。

如果每个模块随意命名，观测数据会很快失去价值。

### 敏感字段处理

trace attribute 不适合存这些内容：

- 完整 prompt；
- 完整用户输入；
- access token；
- API key；
- cookie；
- 原始工具结果；
- 个人身份信息；
- 内部系统错误堆栈全文。

可以存这些低风险摘要：

- 字符长度；
- token 数；
- hash；
- schema version；
- tool name；
- status code；
- retry count；
- redaction applied；
- error code。

如果确实需要关联敏感详情，使用受控存储，并在 trace 中只放引用 id。

## Incident Recovery

### 运行时事故分类

Agent runtime 的事故可以按影响面分类。

| 类型 | 例子 | 优先动作 |
| --- | --- | --- |
| Provider incident | 模型 API 大面积超时 | 降级模型或暂停新 run |
| Tool incident | 某工具持续失败 | 禁用工具并恢复安全状态 |
| Data incident | 检索越权或 memory 污染 | 立即停止相关范围读取 |
| Cost incident | token 成本异常升高 | 降低 budget 和 max_steps |
| Queue incident | worker backlog 激增 | 限流和扩容 |
| Streaming incident | event 大量断线 | 检查代理和 event store |
| Approval incident | 审批无法送达 | 暂停高风险工具 |

事故处理的关键是 runtime 有开关。

如果没有 tool disable、model fallback、budget clamp、queue pause，事故时只能改代码。

这太慢。

### 安全降级模式

安全降级模式可以预先定义。

例如：

```text
read_only_mode
disable_external_side_effects
disable_memory_write
disable_high_cost_models
force_approval_for_all_writes
pause_new_runs
allow_status_reads_only
```

这些模式应该能通过配置或管理 API 启用。

启用后要写 audit log。

run 创建时要记录当时是否处于降级模式。

否则后续复盘会不知道为什么某些工具突然不可用。

### 恢复后的数据修复

事故恢复不只是服务恢复。

还要处理已经产生的数据。

例如：

- 错误 memory 是否要删除；
- 错误 artifact 是否要隐藏；
- 已发出的外部动作是否要补偿；
- 失败 run 是否要批量标记；
- 用户是否需要通知；
- trace 与日志是否足够支持复盘；
- policy 是否需要加新的规则。

Agent runtime 的 incident review 应该至少回答：

```text
which runs were affected
which tools were called
which users could see affected data
which artifacts were produced
which external side effects happened
which controls failed
which controls should be added
```

没有 run、step、event、tool audit，这些问题很难回答。

## 测试矩阵

### HTTP 边界

HTTP 边界测试覆盖入口行为。

| 场景 | 期望 |
| --- | --- |
| 无 token 创建 run | 401 |
| 无 workspace 权限 | 403 |
| 输入为空 | 422 |
| 输入超长 | 422 或 413 |
| 不支持的 stream mode | 422 |
| 查询别人的 run | 403 或 404 |
| 取消别人的 run | 403 |
| 审批别人的 run | 403 |
| 读取别人的 event stream | 403 |
| 下游暂时不可用 | 503 或明确错误码 |

这些测试不需要真实模型。

它们测试的是边界。

边界稳定，内部 runner 才有安全运行空间。

### Policy 与工具

工具测试要覆盖矩阵组合。

| 场景 | 期望 |
| --- | --- |
| 普通用户只看到只读工具 | 通过 |
| 管理者看到受限读工具 | 通过 |
| 普通用户请求写工具 | 拒绝 |
| 写工具缺少 approval | 暂停 |
| 参数越过 workspace | 拒绝 |
| 参数命中敏感路径 | 审批或拒绝 |
| 工具 timeout | step failed with retryable |
| 工具返回敏感字段 | redaction 生效 |
| 工具重复执行 | idempotency 生效 |

工具测试应使用 fake tool。

不要依赖真实外部系统才能验证权限。

### Persistence 与恢复

持久化测试关注状态一致性。

| 场景 | 期望 |
| --- | --- |
| run 创建后进队列失败 | run 标记 failed 或 queued_retry |
| worker 执行中重启 | checkpoint 后可恢复 |
| approval 创建后重启 | approval 仍可查询 |
| event stream 断线 | 可从 last event 补发 |
| tool 成功后 resume | 不重复执行副作用 |
| artifact 写入失败 | run 有 partial 状态或明确错误 |
| cancel 与 tool 完成并发 | 状态转换确定 |
| 两个 worker 抢同一 run | 只有一个获得 lease |

这些测试通常需要真实数据库或接近真实的测试数据库。

in-memory mock 很难暴露并发和事务问题。

### Observability

观测测试不是看 dashboard 漂亮不漂亮。

它要证明关键字段存在。

| 场景 | 期望 |
| --- | --- |
| 创建 run | log 含 request_id、run_id |
| model call | span 含 model、token、latency |
| tool call | span 含 tool name、status |
| approval wait | event 与 span 可关联 |
| error | span status 为 error |
| retry | retry_count 增加 |
| cost | metric 可按 model 聚合 |
| queue delay | metric 可观测 |

可以在测试环境使用 in-memory exporter。

这样不用接真实观测平台，也能验证 instrumentation。

## FAQ

### FastAPI 适合做 Agent runtime 吗？

适合做 HTTP 边界、依赖装配、鉴权、事件接口和管理 API。

它不负责替代 durable workflow、队列、模型编排框架或工具协议。

把 FastAPI 放在边界位置最稳。

### `/chat` 还能不能用？

可以。

但建议让 `/chat` 只是 `POST /agent/runs` 的同步包装或兼容入口。

内部仍然创建 run、记录事件、套用权限和 trace。

### 什么时候需要后台队列？

只要 run 可能超过几秒、需要重试、需要审批、需要恢复，或者会调用外部副作用，就应该考虑后台执行。

同步 handler 更适合短请求。

### SSE 还是 WebSocket？

单向进度流优先 SSE。

双向协作、实时控制、复杂交互再考虑 WebSocket。

如果只是 token 增量，普通 streaming 也可以。

但 Agent runtime 通常需要事件类型，所以 SSE 是不错的默认选择。

### MCP 接入后还需要自己的工具权限吗？

需要。

MCP 提供工具发现和调用协议，不替代你的用户权限、租户隔离、审批策略和审计要求。

### OpenTelemetry 自动 instrumentation 够吗？

不够。

它能覆盖 HTTP 层，但 Agent run、model call、tool call、approval wait、checkpoint restore 都需要业务 instrumentation。

### AgentContext 应该放进 prompt 吗？

只放必要的、清洗过的任务相关信息。

身份、权限、trace、secret、内部 policy 对象不应该原样进入 prompt。

### 如何避免工具重复执行？

为外部副作用工具设计 idempotency key。

在 step store 中记录工具调用状态。

恢复 run 前先检查该 step 是否已经成功执行。

### 审批会不会让用户体验变慢？

会。

但高风险动作本来就不应该伪装成即时自动化。

好的设计是让 Agent 先生成提案、影响说明和参数摘要，让人类快速判断，而不是让人类从零审查。

### 测试重点是什么？

重点不是证明模型每次都答得一样。

重点是证明边界稳定：

- 未授权进不来；
- 越权工具看不到；
- 危险动作会暂停；
- 取消后不继续副作用；
- 失败后能恢复或明确终止；
- trace 能还原关键路径。

## 小结

FastAPI 不是 Agent 框架。

但它可以成为 Agent runtime 最重要的边界层。

它把 HTTP 请求、身份、权限、共享资源、run 状态、事件流、审批、观测和恢复组织起来。

Agent 框架负责“怎么完成任务”。

FastAPI 边界负责“这次任务是否可以运行、在什么范围内运行、如何被观察、失败后如何处理”。

当你把这两件事分开，Agent 后端就不再只是一个会聊天的接口。

它会变成一个能被团队测试、上线、审计和持续演进的执行系统。

## 延伸阅读

- [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [FastAPI Middleware](https://fastapi.tiangolo.com/tutorial/middleware/)
- [FastAPI Lifespan Events](https://fastapi.tiangolo.com/advanced/events/)
- [FastAPI Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [FastAPI StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/)
- [OpenTelemetry Python Instrumentation](https://opentelemetry.io/docs/languages/python/instrumentation/)
- [OpenTelemetry FastAPI Instrumentation](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html)
- [Model Context Protocol Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)
- [Model Context Protocol Authorization](https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization)
