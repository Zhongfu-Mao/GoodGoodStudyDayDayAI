---
title: "FastAPI の BackgroundTasks、queue、冪等性：BackgroundTasks を task system にしない"
date: 2026-05-14
category: engineering
description: "FastAPI BackgroundTasks、queue worker、retry、idempotency key、dead-letter を分けて、復旧可能な background execution boundary を設計する。"
difficulty: advanced
plainSummary: "FastAPI BackgroundTasks は軽量で同一 process 内の post-response 処理に向きます。永続化、retry、水平 scale、可観測性、冪等性が必要になったら queue と worker の設計に移るべきです。"
tags:
  - "FastAPI"
  - "Python"
  - "Operations"
lang: ja
coverImage: "/images/engineering/practice/fastapi-background-jobs/background-jobs-cover.png"
draft: false
---

# FastAPI の BackgroundTasks、queue、冪等性：BackgroundTasks を task system にしない

> 時点の前提：この記事は 2026-05-14 に確認しています。FastAPI `BackgroundTasks`、Starlette の挙動、queue framework の ecosystem は変わり得ます。本番採用前に公式ドキュメントと利用 version を確認してください。

多くの FastAPI service は、単純に見える要求から始まります。

「API は先に返して、あとで email を送りたい」

FastAPI には `BackgroundTasks` があり、response を返したあとに関数を実行できます。

軽い後処理には便利です。

ただし危険もあります。`BackgroundTasks` は task system として誤用されやすいからです。

task に復旧、retry、可観測性、cancel、scale、別 process 実行が必要なら、すでに `BackgroundTasks` の範囲を超えています。

![FastAPI background tasks and queue system](/images/engineering/practice/fastapi-background-jobs/background-jobs-cover.png)

## まず三種類に分ける

| 種類 | 例 | 推奨境界 |
| --- | --- | --- |
| Post-response cleanup | audit log、非重要通知、軽い cache refresh | `BackgroundTasks` を検討できる |
| Durable job | report generation、遅い外部 API、upload 処理、必達通知 | queue + worker |
| Workflow / orchestration | 多段 approval、長時間 Agent run、人間介入、補償 transaction | workflow engine または専用 orchestration |

大事なのは「非同期にできるか」ではなく、「失敗したあとどうするか」です。

失敗しても許容できるなら、`BackgroundTasks` で足りる場合があります。

失敗が業務状態に影響するなら、永続化、retry、冪等性、audit が必要です。

## BackgroundTasks に向くもの

FastAPI 公式ドキュメントでは、`BackgroundTasks` は response 後に実行する小さな処理、たとえば email notification などに使うものとして説明されています。重い計算や同一 process memory を共有する必要がない仕事では、Celery などの大きな道具も検討できます。

向いている場面です。

- 非重要 audit log を書く。
- 失敗しても補完できる内部通知を送る。
- 後から再構築できる cache を更新する。
- 軽い webhook を触る。
- 同一 process の resource に触る小さな後処理。

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

この code は、task が失われても system として許容できる場合にだけ安全です。

許容できないなら、ここで止めるべきではありません。

## queue が必要な条件

次のどれかが当てはまるなら、queue worker の設計へ進みます。

- task が最終的に必ず実行される必要がある。
- 実行時間が読めない。
- retry が必要。
- process や machine をまたいで scale したい。
- 独立 deploy や rate limit が必要。
- failed task を dead-letter に送る必要がある。
- user に task status を見せたい。
- 冪等性が必要。
- CPU、GPU、network、外部 API quota を大きく使う。

![BackgroundTasks versus queue worker decision visual](/images/engineering/practice/fastapi-background-jobs/backgroundtasks-vs-queue.png)

queue は architecture を派手にするためではありません。HTTP request lifetime と background execution lifetime を分けるためにあります。

HTTP request は受け付け、validate し、job を保存し、job id を返します。

worker は task を取り出し、実行し、retry し、結果を記録します。

## 推奨 architecture

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

API は重い仕事を直接しません。

worker は HTTP request object に依存しません。

database または job store が、二つの間の source of truth です。

## API 側：保存してから enqueue

payload だけを queue に投げるより、先に job record を作るほうが安定します。

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

Service では job 作成と enqueue を分けます。

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

production では、DB write は成功したが enqueue に失敗した場合を考える必要があります。

よくある選択肢は outbox pattern です。同じ transaction で job と outbox event を保存し、別 process が outbox を queue に投げます。

- outbox pattern を使う。
- 同じ transaction で job と outbox event を書く。
- relay process が outbox event を queue に配送する。
- 配送成功後に sent として mark する。

小さな system では、まずは「DB write 後に enqueue、失敗時は alert と手動修復」を選ぶこともあります。ただし、それは明示的な trade-off です。

## Worker 側：job store を信じる

worker は queue message の payload を丸ごと信じるのではなく、job id から database を読み直します。

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

この構造なら、同じ job id が再配信されても、重複 effect を抑えやすくなります。

## 冪等性が本番の分岐点

queue system では、少なくとも「message は重複する可能性がある」と考えます。

そのため task を「一度実行されれば effect も一度だけ」と書いてはいけません。

つまり task は「一度だけ実行される」前提ではなく、「複数回呼ばれても business effect は一度だけ」になるよう設計します。

![Idempotency key retry and dead-letter flow](/images/engineering/practice/fastapi-background-jobs/idempotency-retry-loop.png)

よくある strategy です。

| 場面 | 冪等 strategy |
| --- | --- |
| business object 作成 | idempotency key + unique constraint |
| payment や notification | 外部 system の idempotency key を使う |
| file write | 決定的な object key と checksum |
| status update | state machine で合法遷移だけ許可 |
| report generation | job id を output directory / artifact key にする |

例です。

```sql
create table idempotency_keys (
  key text primary key,
  status text not null,
  response_json jsonb,
  created_at timestamptz not null default now()
);
```

API では `Idempotency-Key` を受け取れます。

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

冪等性は retry を避けるためではなく、安全に retry するための設計です。

## Retry policy

retry は error type で分けます。

| Error | Retry | 例 |
| --- | --- | --- |
| validation error | しない | payload 欠落 |
| permission error | しない | user が resource にアクセスできない |
| rate limit | する | external API 429 |
| timeout | 多くの場合する | network fluctuation |
| bug | 盲目的にしない | `KeyError`、schema mismatch |

記録したい項目です。

- attempt count；
- last error code；
- next retry time；
- first failure time；
- last failure time；
- worker id；
- trace id。

exponential backoff + jitter を使うと、大量 task の同時 retry を避けやすくなります。

## Dead-letter はゴミ箱ではない

Dead-letter queue は、失敗を見えるようにし、診断し、復旧するためのものです。

各 dead-letter には最低限これを残します。

- job id；
- payload summary；
- error code；
- error message；
- attempt count；
- trace id；
- first failed at；
- last failed at；
- replay 可能か。

誰も見ない dead-letter は、別名の silent failure です。

## 可観測性

background task は次に答えられるべきです。

- queued / running / failed / succeeded は何件か。
- P50 / P95 / P99 duration はいくつか。
- retry rate はどれくらいか。
- dead-letter が増えているか。
- どの external API が失敗しているか。
- user は自分の job status を見られるか。
- trace は HTTP request から worker までつながるか。

`job_id`、`tenant_id`、`trace_id` を structured log に入れ、enqueue と worker execution の間で trace context を引き継ぐと調査しやすくなります。

## よくあるアンチパターン

**アンチパターン 1：必達 task を `BackgroundTasks` に置く。**

process restart、worker crash、rolling deploy で失われてもよいかを先に確認します。

**アンチパターン 2：payload だけ queue に入れて保存しない。**

status、replay、audit、idempotency が難しくなります。

**アンチパターン 3：冪等性なしに retry を有効化する。**

一時失敗が、重複課金、重複送信、重複作成に変わります。

**アンチパターン 4：すべての例外を retry する。**

schema error、permission error、business rule error は retry しても noise が増えるだけです。

**アンチパターン 5：background task に user-visible status がない。**

user には「処理中」しか見えず、team には log しか残らず、最後は support ticket になります。

## 落とし込みテンプレート

```text
task 名：
trigger API：
task type：BackgroundTasks / Queue worker / Workflow

reliability requirement：
- 必達か：
- 重複を許容できるか：
- 最大実行時間：
- 最大 retry 回数：
- cancel が必要か：

冪等性：
- idempotency key：
- unique constraint：
- external system support：
- duplicate request response：

status：
- queued：
- running：
- succeeded：
- failed：
- cancelled：
- dead-letter：

可観測性：
- metrics：
- logs：
- trace：
- alert：

recovery：
- manual replay：
- dead-letter owner：
- data repair runbook：
```

> **記入例（PDF/Excel レポート export task）**
>
> task 名：monthly-export-report
> trigger API：POST /reports/exports
> task type：Queue worker
> reliability requirement：必ず実行します；同じ idempotency key の重複 request は許容します；最大 8 分；retry 3 回；queued/running は cancel できます
> 冪等性：idempotency key=workspace_id+report_month；unique constraint=(workspace_id, report_month, format)；external storage は上書きします；duplicate request は existing job_id を返します
> status：queued=パラメータ保存済み；running=worker heartbeat；succeeded=file URL を保存します；failed=retry 可能 error；cancelled=user cancel；dead-letter=retry 超過です
> 可観測性：metrics=export_job_duration/status_total；logs=job_id/workspace_id/format；trace=api→worker→storage；alert=dead-letter > 0 で通知します
> recovery：manual replay=job_id で再 enqueue します；dead-letter owner=platform-oncall；data repair runbook=一時 file を削除して再実行します

## チェックリスト

- task failure は business result に影響するか？
- task は deployment をまたいで生き残る必要があるか？
- job id と status API があるか？
- 保存してから enqueue しているか？
- enqueue failure の補償があるか？
- worker は job store を source of truth にしているか？
- idempotency key または unique constraint があるか？
- retry は retryable / non-retryable error を分けているか？
- dead-letter に owner がいるか？
- logs、metrics、trace に job id が入っているか？

## さらに読む

- [FastAPI のプロジェクト構造と依存境界](./fastapi-project-structure-dependency-boundaries/)：background task boundary を全体構造に戻して考える。
- [FastAPI アーキテクチャと可観測性の意思決定ガイド](./fastapi-architecture-observability-for-tls/)：service split、SLO、OpenTelemetry へ進む。
- [AI Agent 開発者のための FastAPI](./fastapi-agent-runtime-patterns/)：長時間 task、approval、Agent trace を runtime boundary に入れる。

## 参考

- [FastAPI: Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [FastAPI: Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
