---
title: "FastAPI 后台任务、队列与幂等：不要把 BackgroundTasks 当成任务系统"
date: 2026-05-14
category: engineering
description: "区分 FastAPI BackgroundTasks、队列 worker、重试、幂等键和 dead-letter 处理，设计真正可恢复的后台执行边界。"
difficulty: advanced
plainSummary: "FastAPI BackgroundTasks 适合轻量、同进程、可丢失风险较低的收尾动作；一旦任务需要持久化、重试、横向扩展、可观测和幂等，就应该进入队列与 worker 设计。"
tags:
  - "FastAPI"
  - "Python"
  - "Operations"
lang: zh
coverImage: "/images/engineering/practice/fastapi-background-jobs/background-jobs-cover.png"
draft: false
---

# FastAPI 后台任务、队列与幂等：不要把 BackgroundTasks 当成任务系统

> 时效边界：本文核验于 2026-05-14。FastAPI `BackgroundTasks` 的定位、Starlette 行为和队列框架生态都可能演进；生产选型前请复查官方文档和当前版本。

很多 FastAPI 服务会从一个看似简单的需求开始：

“接口先返回，后面再发邮件。”

FastAPI 提供了 `BackgroundTasks`，可以在 response 返回后执行函数。

这对轻量收尾动作很方便。

但危险也在这里：`BackgroundTasks` 很容易被误用成任务系统。

一旦你需要任务可恢复、可重试、可观测、可取消、可扩容、可跨进程执行，就已经离开了 `BackgroundTasks` 的舒适区。

![FastAPI 后台任务与队列系统](/images/engineering/practice/fastapi-background-jobs/background-jobs-cover.png)

## 先区分三类后台工作

| 类型 | 示例 | 推荐边界 |
| --- | --- | --- |
| Post-response cleanup | 写审计日志、发送非关键通知、轻量缓存刷新 | `BackgroundTasks` 可以考虑 |
| Durable job | 生成报告、调用慢外部 API、处理上传文件、发送必须送达的通知 | 队列 + worker |
| Workflow / orchestration | 多步骤审批、长时间 Agent run、人工介入、补偿事务 | workflow engine 或专门 orchestration |

核心问题不是“能不能异步执行”，而是“失败以后怎么办”。

如果任务失败无所谓，`BackgroundTasks` 可能足够。

如果失败会影响业务状态，就需要持久化、重试、幂等和审计。

## BackgroundTasks 适合什么

FastAPI 官方文档给出的定位很清楚：它适合在响应返回后执行后台函数，例如发送邮件通知这类小任务；如果是重计算或不需要共享同进程内存的重工作，官方也提示可以考虑 Celery 等更大的工具。

典型适用场景：

- 写一条非关键审计日志；
- 发送可丢弃的内部通知；
- 更新一个可以之后再补的 cache；
- 触发轻量 webhook，失败有外部补偿；
- 做同进程资源可访问的小收尾。

```python
from fastapi import BackgroundTasks, FastAPI

app = FastAPI()


def write_audit_log(user_id: str, action: str) -> None:
    with open("audit.log", "a") as file:
        file.write(f"{user_id}:{action}\n")


@app.post("/runs/{run_id}/cancel")
async def cancel_run(run_id: str, background_tasks: BackgroundTasks):
    background_tasks.add_task(write_audit_log, "user_123", f"cancel:{run_id}")
    return {"status": "accepted"}
```

这类代码要满足一个前提：任务丢了，系统仍然可以接受。

如果不能接受，就不要停在这里。

## 什么时候必须上队列

下面任何一条成立，都应该进入队列 worker 设计：

- 任务必须最终执行；
- 任务执行时间不可控；
- 任务需要重试；
- 任务需要跨进程或跨机器扩容；
- 任务需要独立部署或限流；
- 任务失败需要 dead-letter；
- 任务状态要对用户可见；
- 任务需要幂等；
- 任务要消费大量 CPU、GPU、网络或外部 API quota。

![BackgroundTasks 与队列 worker 的决策图](/images/engineering/practice/fastapi-background-jobs/backgroundtasks-vs-queue.png)

队列不是为了“显得架构高级”，而是为了把 HTTP 请求生命周期和后台执行生命周期分开。

HTTP 请求应该快速接收、校验、落库、返回任务 id。

worker 应该独立拉取任务、执行、重试、记录结果。

## 推荐架构

```text
Client
  |
  | POST /reports
  v
FastAPI API
  - validate request
  - create job row
  - enqueue job id
  - return 202 Accepted
  |
  v
Queue / Broker
  |
  v
Worker
  - load job
  - check idempotency
  - execute effect
  - update status
  - emit metrics / traces
```

API 不直接做重工作。

worker 不依赖 HTTP request 对象。

数据库或 job store 是两者之间的事实来源。

## API 端：先落库，再入队

不要只把 payload 塞进队列。更稳妥的做法是先创建 job record。

```python
from fastapi import APIRouter, Depends, status

from app.api.deps import get_current_user, get_job_service
from app.domain.jobs import JobCreate, JobRead
from app.services.job_service import JobService

router = APIRouter()


@router.post(
    "/reports",
    response_model=JobRead,
    status_code=status.HTTP_202_ACCEPTED,
)
async def create_report_job(
    payload: JobCreate,
    user=Depends(get_current_user),
    service: JobService = Depends(get_job_service),
) -> JobRead:
    return await service.create_report_job(payload=payload, user_id=user.id)
```

Service 里做两步：

```python
class JobService:
    def __init__(self, repository: JobRepository, queue: JobQueue) -> None:
        self.repository = repository
        self.queue = queue

    async def create_report_job(self, payload: JobCreate, user_id: str) -> JobRead:
        job = await self.repository.create(
            type="report.generate",
            payload=payload.model_dump(),
            user_id=user_id,
            status="queued",
        )
        await self.queue.enqueue(job_id=job.id)
        return JobRead.model_validate(job)
```

这里有一个生产细节：如果数据库写入成功但 enqueue 失败怎么办？

常见做法：

- 使用 outbox pattern；
- 在同一事务里写 job 和 outbox event；
- 由 relay 进程把 outbox event 投递到队列；
- 投递成功后标记 sent。

小系统可以先接受“写库后 enqueue，失败报警人工修复”，但要明确这是取舍，不是假装没有风险。

## Worker 端：只相信 job store

worker 收到 job id 后，应该重新从数据库读取 job，而不是完全相信队列消息里的 payload。

```python
class ReportWorker:
    def __init__(self, repository: JobRepository, reports: ReportService) -> None:
        self.repository = repository
        self.reports = reports

    async def handle(self, job_id: str) -> None:
        job = await self.repository.get_for_update(job_id)
        if job.status in {"succeeded", "cancelled"}:
            return

        await self.repository.mark_running(job_id)

        try:
            result = await self.reports.generate(job.payload)
        except RetryableError as exc:
            await self.repository.mark_retryable_failure(job_id, reason=str(exc))
            raise
        except Exception as exc:
            await self.repository.mark_failed(job_id, reason=str(exc))
            raise

        await self.repository.mark_succeeded(job_id, result=result)
```

这个结构让 worker 可以重复执行同一个 job id，而不会因为重复消息直接造成重复副作用。

## 幂等：真正的生产分水岭

队列系统通常至少要假设“可能重复投递”。

所以你不能把任务写成“执行一次就一定只有一次效果”。

你要设计成“重复执行也只产生一次业务效果”。

![幂等键、重试与 dead-letter 流程](/images/engineering/practice/fastapi-background-jobs/idempotency-retry-loop.png)

常见策略：

| 场景 | 幂等策略 |
| --- | --- |
| 创建业务对象 | 使用 idempotency key + unique constraint |
| 调用外部支付或发送通知 | 使用外部系统支持的 idempotency key |
| 写文件 | 使用确定性 object key，成功后记录 checksum |
| 更新状态 | 状态机校验，只允许合法迁移 |
| 生成报告 | 以 job id 作为输出目录或 artifact key |

示例表：

```sql
create table idempotency_keys (
  key text primary key,
  status text not null,
  response_json jsonb,
  created_at timestamptz not null default now()
);
```

API 可以接收 `Idempotency-Key`：

```python
from typing import Annotated
from fastapi import Header


async def create_report_job(
    payload: JobCreate,
    idempotency_key: Annotated[str | None, Header()] = None,
    service: JobService = Depends(get_job_service),
) -> JobRead:
    return await service.create_report_job(
        payload=payload,
        idempotency_key=idempotency_key,
    )
```

幂等不是“不要重试”，而是“允许安全重试”。

## 重试策略

重试要分清错误类型。

| 错误 | 是否重试 | 例子 |
| --- | --- | --- |
| validation error | 不重试 | payload 缺字段 |
| permission error | 不重试 | 用户无权访问资源 |
| rate limit | 重试 | 外部 API 429 |
| timeout | 通常重试 | 网络抖动 |
| bug | 不盲目重试 | `KeyError`、schema 不兼容 |

建议记录：

- attempt count；
- last error code；
- next retry time；
- first failure time；
- last failure time；
- worker id；
- trace id。

退避策略建议使用 exponential backoff + jitter，避免大量任务同时重试。

## Dead-letter 不是垃圾桶

Dead-letter queue 的意义不是“失败了就扔进去”，而是让失败可见、可诊断、可恢复。

每条 dead-letter 至少应该有：

- job id；
- payload 摘要；
- error code；
- error message；
- attempt count；
- trace id；
- first failed at；
- last failed at；
- 是否可人工重放。

如果 dead-letter 没有人看，它只是另一个静默失败目录。

## 可观测性

后台任务必须能回答这些问题：

- 现在有多少 queued / running / failed / succeeded？
- P50 / P95 / P99 执行耗时是多少？
- 重试率是多少？
- dead-letter 数量是否增加？
- 哪个外部 API 最常失败？
- 用户能否查询自己的 job 状态？
- trace 能否从 HTTP request 连到 worker？

建议把 `job_id`、`tenant_id`、`trace_id` 放入结构化日志，并在 enqueue 和 worker 执行时延续 trace context。

## 反模式

**反模式一：用 `BackgroundTasks` 做必须执行的任务。**

如果进程重启、worker 崩溃或部署滚动导致任务丢失，你是否能接受？不能就上队列。

**反模式二：只把 payload 放进队列，不落库。**

这样很难查状态、重放、审计和幂等。

**反模式三：没有幂等就开启重试。**

这会把偶发失败变成重复扣款、重复发送、重复创建。

**反模式四：所有异常都重试。**

schema 错、权限错、业务规则错，重试只会制造噪音。

**反模式五：后台任务没有用户可见状态。**

用户只看到“处理中”，团队只看到日志，最后所有问题都变成客服工单。

## 落地模板

```text
任务名称：
触发 API：
任务类型：BackgroundTasks / Queue worker / Workflow

可靠性要求：
- 是否必须执行：
- 是否允许重复：
- 最大执行时间：
- 最大重试次数：
- 是否需要取消：

幂等：
- idempotency key：
- unique constraint：
- 外部系统幂等支持：
- 重复请求返回策略：

状态：
- queued：
- running：
- succeeded：
- failed：
- cancelled：
- dead-letter：

可观测性：
- metrics：
- logs：
- trace：
- alert：

恢复：
- 手动重放方式：
- dead-letter 处理 owner：
- 数据修复 runbook：
```

## 检查清单

- 任务失败是否会影响业务结果？
- 任务是否需要跨部署存活？
- 是否有 job id 和状态查询 API？
- 是否先落库再入队？
- enqueue 失败是否有补偿方案？
- worker 是否只相信 job store？
- 是否设计了幂等键或唯一约束？
- 重试是否区分可重试和不可重试错误？
- dead-letter 是否有人负责处理？
- logs、metrics、trace 是否包含 job id？

## 继续阅读

- [FastAPI 项目结构与依赖边界](./fastapi-project-structure-dependency-boundaries/)：把后台任务边界放回整体项目结构中。
- [FastAPI 架构与可观测性决策指南](./fastapi-architecture-observability-for-tls/)：进一步设计服务拆分、SLO 和 OpenTelemetry。
- [给 AI 智能体开发者的 FastAPI](./fastapi-agent-runtime-patterns/)：把长任务、审批和 Agent trace 放入运行时边界。

## 参考

- [FastAPI: Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [FastAPI: Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
