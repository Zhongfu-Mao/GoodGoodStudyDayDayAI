---
title: "開発者のための FastAPI 基礎：REST、HTTP、JSON、Python API コードを読む"
date: 2026-05-13
category: engineering
description: "FastAPI サービスを読み、保守する開発者に向けて、REST、HTTP、JSON、Pydantic、デコレータ、型ヒント、async/await、テスト、デバッグを体系的に整理する。"
difficulty: beginner
plainSummary: "FastAPI の基本は、HTTP リクエストを Python 関数へ対応させ、型ヒント、Pydantic model、OpenAPI schema で入力、検証、レスポンスの契約を明確にすることです。"
tags:
  - "FastAPI"
  - "Python"
lang: ja
coverImage: "/images/engineering/practice/python-fastapi-foundations-cover.png"
draft: false
---

# 開発者のための FastAPI 基礎：REST、HTTP、JSON、Python API コードを読む

> 鮮度メモ：この記事は 2026-05-13 時点で確認しています。FastAPI、Pydantic、HTTPX などは継続的に更新されるため、細かな挙動はプロジェクトで固定している依存バージョンと公式ドキュメントを優先してください。

FastAPI のコードは短く見えます。

一つの route が十数行で書かれていることもあります。

しかしその十数行には、Web API の約束、HTTP、JSON、Python 関数、型ヒント、Pydantic による検証、非同期 I/O、自動ドキュメント、テストの考え方が同時に入っています。

Python の文法だけを一行ずつ追うと、重要な手がかりが分散して見えます。

まずは一つのリクエストの流れとして読むほうが安定します。

クライアントが HTTP リクエストを送る。

リクエストには method、path、query、headers、body が含まれる。

FastAPI は route decorator を使って Python 関数を見つける。

FastAPI は path、query、headers、cookies、body などを関数引数へ変換する。

Pydantic と型ヒントがデータ変換と検証に関わる。

関数が業務ロジックを実行する。

関数は Python object、Pydantic model、Response などを返す。

FastAPI は戻り値を HTTP response に変換し、多くの場合 JSON として返す。

OpenAPI schema は入力と出力を同時に記述し、ドキュメント、クライアント、テストの基準になります。

まず覚えるべき一文はこれです。

**FastAPI は HTTP リクエストを Python 関数に対応させ、型ヒント、Pydantic model、OpenAPI schema で API 契約を明確にするフレームワークです。**

![HTTP request が FastAPI function に届く流れの図](/images/engineering/practice/fastapi-foundations-flow-visual.png)

![HTTP request、JSON、validation の関係を示す図](/images/engineering/practice/fastapi-http-validation-visual.png)

この記事は FastAPI の全機能を扱うものではありません。

目的は実務上の読み方です。

既存の FastAPI endpoint が読める。

入力がどこから来るか分かる。

入力がどこで検証されるか分かる。

どの JSON が返るか分かる。

400、401、404、422、500 がなぜ返るか見当がつく。

テストで何を確認すべきか分かる。

プロジェクトのどのファイルを追えばよいか分かる。

## 全体像：リクエストからレスポンスまで

まずは小さいながら一通りそろった route を見ます。

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

このコードは何層にも分けて読めます。

`@app.post("/users/{user_id}/tasks", ...)` は HTTP method と URL path を宣言しています。

`user_id: str` は path の `{user_id}` から来ます。

`body: CreateTaskRequest` は JSON request body から来ます。

`x_request_id: str | None = Header(default=None)` は HTTP header から来ます。

`CreateTaskRequest` は request body の JSON 形状です。

`TaskResponse` は成功 response の JSON 形状です。

`status_code=201` は作成成功時に `201 Created` を返すという意味です。

`HTTPException(status_code=403, ...)` は業務上拒否する error response です。

`async def` は handler が非同期 I/O を扱えることを示します。

`return TaskResponse(...)` は FastAPI により JSON へ変換されます。

これが FastAPI endpoint を読む基本順序です。

まず decorator を見る。

次に関数シグネチャを見る。

次に request model を見る。

次に業務分岐を見る。

次に response model を見る。

最後にテストと OpenAPI ドキュメントがコードと合っているかを見る。

## REST API の基本感覚

REST API は、リソース指向の HTTP interface と考えると読みやすくなります。

呼び出し側は URL でリソースを指定します。

呼び出し側は HTTP method で操作を表します。

呼び出し側は headers でメタ情報を渡します。

呼び出し側は query parameters で検索、ページング、並び替えなどの読み取り条件を渡します。

呼び出し側は body で作成または変更する構造化データを渡します。

サーバーは status code で結果を表します。

サーバーは response body でリソース、エラー、処理結果を返します。

タスク管理 API なら、次のような形になります。

| 目的 | Method | Path | よくある response |
| --- | --- | --- | --- |
| タスク一覧を読む | `GET` | `/tasks` | `200 OK` + 配列 |
| タスク詳細を読む | `GET` | `/tasks/{task_id}` | `200 OK` + object |
| タスクを作成する | `POST` | `/tasks` | `201 Created` + 新しい object |
| タスク全体を置き換える | `PUT` | `/tasks/{task_id}` | `200 OK` または `204 No Content` |
| タスクの一部を更新する | `PATCH` | `/tasks/{task_id}` | `200 OK` + 更新後 object |
| タスクを削除する | `DELETE` | `/tasks/{task_id}` | `204 No Content` |

REST の価値は、完璧な URL 命名だけではありません。

API の振る舞いを予測しやすくすることにあります。

`GET /tasks/42` を見れば、タスク 42 を読む操作だと推測できます。

`POST /tasks` を見れば、タスクを作成する操作だと推測できます。

`PATCH /tasks/42` を見れば、タスク 42 の一部を変える操作だと推測できます。

`DELETE /tasks/42` を見れば、タスク 42 を削除する操作だと推測できます。

FastAPI コードを読むとき、関数名だけを見てはいけません。

関数名は Python 内部の名前です。

外部に公開される契約は method、path、status code、request schema、response schema です。

## HTTP の解剖：request line、headers、body

HTTP request は URL だけではありません。

大きく三つの層に分かれます。

Request line。

Headers。

Body。

例を見ます。

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

最初の行には method があります。

最初の行には path があります。

最初の行には query string があります。

Headers には認証、content type、trace id、cache、クライアントの希望などが入ります。

Body には JSON data が入ります。

FastAPI では次のように対応します。

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

`POST` は `@app.post` に対応します。

`/users/{user_id}/tasks` は path template に対応します。

`user_id` は path から来ます。

`notify` は query から来ます。

`body` は JSON body から来ます。

`authorization` と `x_request_id` は headers から来ます。

FastAPI は header parameter の underscore を hyphen に変換します。

そのため `x_request_id` は通常 `X-Request-Id` header に対応します。

プロジェクトで `Header(convert_underscores=False)` を使っている場合は、その設定を確認します。

## HTTP method：読み書きの意味を分ける

よく使う method は次のように読めます。

| Method | 典型的な用途 | body の有無 | 安全な読み取りとして扱うか |
| --- | --- | --- | --- |
| `GET` | リソースを読む | 通常なし | はい |
| `POST` | 作成、送信、複雑な操作 | 通常あり | いいえ |
| `PUT` | リソース全体を置き換える | 通常あり | いいえ |
| `PATCH` | リソースの一部を更新する | 通常あり | いいえ |
| `DELETE` | リソースを削除する | なし、または少ない | いいえ |
| `HEAD` | headers だけ取得する | なし | はい |
| `OPTIONS` | 利用可能な操作を確認する | 通常なし | はい |

コードを読むときは四つの質問を置きます。

この endpoint はサーバー状態を変えるのか。

この操作は冪等であるべきか。

この結果は cache 可能なのか。

method と業務の意味は合っているのか。

`GET` で注文作成をしてはいけません。

`DELETE` が実際には複雑な取り消し処理なら、API 文書や命名で明確にする必要があります。

`POST` は柔軟ですが、何でも入れる箱にすると契約が読みにくくなります。

FastAPI では method は decorator で決まります。

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

外部の client が見るのは function name ではありません。

外部の client が見るのは method と path です。

## Status code：結果を最初に伝える数字

HTTP status code は三桁の数字です。

最初の桁が大分類を表します。

`1xx` は暫定情報です。

`2xx` は成功です。

`3xx` は redirect や cache 関連の結果です。

`4xx` は client request に問題がある、または request 側に許可がない状態です。

`5xx` は server が有効に見える request を処理できなかった状態です。

API でよく見るものは次の通りです。

| Code | 名前 | よくある意味 |
| --- | --- | --- |
| `200` | OK | 成功し、結果を返す |
| `201` | Created | リソース作成成功 |
| `202` | Accepted | request を受け付けたが処理は未完了 |
| `204` | No Content | 成功したが body はない |
| `304` | Not Modified | cache を使える |
| `400` | Bad Request | request の意味や形式が業務ルールに合わない |
| `401` | Unauthorized | 未認証、または認証が無効 |
| `403` | Forbidden | 認証済みでも操作権限がない |
| `404` | Not Found | リソースがない、または見せない |
| `409` | Conflict | 現在の状態と衝突している |
| `422` | Unprocessable Content | 構造は読めるが検証に通らない |
| `429` | Too Many Requests | rate limit に当たった |
| `500` | Internal Server Error | 未処理の server error |
| `502` | Bad Gateway | upstream service が異常 |
| `503` | Service Unavailable | service が一時的に利用できない |
| `504` | Gateway Timeout | upstream timeout |

FastAPI は成功時に default で `200` を返します。

成功 status code は decorator で指定できます。

```python
@app.post("/tasks", status_code=201)
async def create_task(body: TaskCreate):
    ...
```

Error response は `HTTPException` で表すことが多いです。

```python
from fastapi import HTTPException

@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    task = await repo.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

読むときは次を分けます。

型変換やフィールド検証に失敗したら、多くの場合 `422` です。

業務ルールで拒否するなら、コードが `400`、`403`、`409` などを明示することがあります。

リソースがなければ通常 `404` です。

認証がなければ通常 `401` です。

権限が足りなければ通常 `403` です。

依存 service の異常なら `502` または `503` のことがあります。

未捕捉例外は通常 `500` になります。

## Headers：メタ情報、認証、追跡

Headers は HTTP の metadata 層です。

通常、主要な resource content は body にあります。

Headers は request の解釈、認証、追跡、cache、content negotiation などを担います。

よく見る request headers は次の通りです。

| Header | 用途 |
| --- | --- |
| `Authorization` | Bearer token、Basic auth など |
| `Content-Type` | request body の media type |
| `Accept` | client が受け取りたい response type |
| `X-Request-Id` | request trace id |
| `Idempotency-Key` | 冪等送信 key |
| `If-None-Match` | cache validation |
| `User-Agent` | client 識別 |

FastAPI で header を読む基本形です。

```python
from fastapi import Header

@app.get("/me")
async def read_me(authorization: str | None = Header(default=None)):
    return {"has_auth": authorization is not None}
```

実際の project では、認証 parsing を各 endpoint に直接書くことは少ないです。

dependency にまとめることが多いです。

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

`Depends(...)` を見たら、入力や error branch が dependency の中にあると考えます。

Endpoint の本当の振る舞いは関数本体だけでは決まりません。

Decorator、関数引数、dependency、middleware、exception handler が全体の結果に関わります。

## Path、query、body：三つの入力を混ぜない

FastAPI で最もよく見る入力源は path、query、body です。

Path parameter は URL template から来ます。

Query parameter は `?` の後ろから来ます。

Body は request body から来て、多くの場合 JSON です。

例を見ます。

```http
PATCH /projects/p_123/tasks/t_456?notify=true
Content-Type: application/json

{
  "title": "Ship the API guide",
  "done": true
}
```

対応する FastAPI code です。

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

`project_id` は path です。

`task_id` は path です。

`notify` は query です。

`body` は JSON body です。

基本的な置き場所は次の通りです。

Resource identity は path に置く。

Filter、pagination、sort、switch は query に置く。

作成または変更する data は body に置く。

Authentication、trace、content negotiation は headers に置く。

例えば一覧 API です。

```python
@app.get("/tasks")
async def list_tasks(
    status: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    ...
```

`status`、`limit`、`offset` は query です。

呼び出しは次のようになります。

```text
/tasks?status=open&limit=20&offset=40
```

Query parameter をより厳密に制限するなら `Query` を使います。

```python
from typing import Annotated
from fastapi import Query

@app.get("/tasks")
async def list_tasks(
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    ...
```

Path parameter には `Path` を使えます。

```python
from typing import Annotated
from fastapi import Path

@app.get("/tasks/{task_id}")
async def get_task(
    task_id: Annotated[int, Path(ge=1)],
):
    ...
```

Body の詳細な制約は Pydantic model と `Field` で表します。

## JSON：API の共通データ形式

JSON は Web API で最もよく使われる data format です。

Object を表せます。

Array を表せます。

String を表せます。

Number を表せます。

Boolean を表せます。

`null` を表せます。

例です。

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

Python では近い構造が次のようになります。

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

違いに注意します。

JSON は `true`、`false`、`null` を使います。

Python は `True`、`False`、`None` を使います。

JSON object の key は string です。

Python dict の key はさまざまな hashable type を取れますが、API JSON では string key が基本です。

JSON には tuple がありません。

JSON には date、datetime の native type がありません。

JSON には decimal の native type がありません。

日時、金額、精度が重要な値は API 契約で表現方針を明確にします。

FastAPI は request JSON を Python data に parse します。

Pydantic は Python data を model として検証します。

FastAPI は response model や dict を JSON へ serialize します。

API code を読むときは三つを分けます。

Client が送る JSON。

Python code が受け取る type。

Server が返す JSON。

似ていますが同じ層ではありません。

## JSON Schema：JSON の形を契約にする

JSON は data format です。

それだけでは必須フィールドが分かりません。

それだけでは string length が分かりません。

それだけでは number range が分かりません。

それだけでは array item type が分かりません。

JSON Schema はそのような規則を記述するための仕組みです。

OpenAPI は request body、response body、parameters を JSON Schema として記述します。

FastAPI は Pydantic model と型ヒントから OpenAPI schema を生成します。

例です。

```python
from pydantic import BaseModel, Field

class CreateTaskRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(ge=1, le=5, default=3)
    labels: list[str] = Field(default_factory=list)
```

この code は次の契約を表します。

`title` は string です。

`title` には最小長があります。

`title` には最大長があります。

`priority` は integer です。

`priority` には最小値と最大値があります。

`priority` には default value があります。

`labels` は string array です。

`labels` の default は空 array です。

なぜ `labels: list[str] = []` と書かないほうがよいのでしょうか。

Python の mutable default value は共有状態の bug につながりやすいからです。

Pydantic model でも `default_factory=list` のほうが意図を明確にできます。

Schema を読むときの問いは次の通りです。

どのフィールドが required か。

どのフィールドが nullable か。

どのフィールドに default があるか。

どのフィールドに length、range、format 制約があるか。

どのフィールドが server output 専用か。

どのフィールドが input と output で形が違うか。

## Pydantic model：request と response の境界

Pydantic model は FastAPI project の API data boundary です。

Database table そのものではありません。

Domain object そのものとも限りません。

多くの場合、request と response の境界 model です。

よくある分け方です。

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

なぜ分けるのでしょうか。

作成時は `title` が required です。

更新時は `title` を送らないことがあります。

出力時には `id` と `done` が含まれます。

入力時に client が勝手に `id` を送れるべきではありません。

これが API 契約の境界です。

Request と response に同じ広い model を使うと、短期的には楽です。

しかし長期的にはフィールド漏れや検証の緩みにつながります。

FastAPI の `response_model` は出力を制御します。

```python
@app.get("/tasks/{task_id}", response_model=TaskOut)
async def get_task(task_id: int):
    task = await repo.get(task_id)
    return task
```

内部 object にさらに多くのフィールドがあっても、`response_model` は公開 output を制限できます。

Password hash、内部 memo、permission flag、cost fields などを隠すときに重要です。

`response_model` を見たら、公開 response contract として読みます。

`response_model` がない場合は、戻り値、default serialization、project の共通 response wrapper を確認します。

## Decorators：route 登録はコメントではない

Python decorator は `@` で始まります。

FastAPI は decorator を使って path operation を登録します。

```python
@app.get("/health")
async def health_check():
    return {"ok": True}
```

`@app.get("/health")` はコメントではありません。

Application startup 時に、下の関数を `GET /health` の handler として登録します。

FastAPI documentation では、この組み合わせを path operation と呼びます。

Path は `/health` です。

Operation は `GET` です。

Function は `health_check` です。

よく見る decorator です。

```python
@app.get("/items")
@app.post("/items")
@app.put("/items/{item_id}")
@app.patch("/items/{item_id}")
@app.delete("/items/{item_id}")
```

Project が大きくなると `APIRouter` が出てきます。

```python
from fastapi import APIRouter

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/{task_id}")
async def get_task(task_id: int):
    ...
```

Application entrypoint で登録します。

```python
app.include_router(router)
```

`APIRouter` の考え方は `FastAPI` instance の decorator と同じです。

違いは route group を module に分けているだけです。

大きな project では `main.py` または app factory から `include_router` を探します。

そこから router module に入ります。

そして各 decorator を読みます。

Decorator には公開 contract の情報が入ることもあります。

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

これは飾りではありません。

Response、documentation、client の理解に影響します。

## Type hints：FastAPI が読む Python syntax

FastAPI は Python type hints を多用します。

Type hints は人間にとって読みやすくするだけではありません。

Framework が parameter parsing、validation、documentation generation に利用します。

よくある書き方です。

```python
name: str
limit: int = 20
active: bool = True
tags: list[str] = []
age: int | None = None
metadata: dict[str, str] = {}
```

読み方です。

| 書き方 | 意味 |
| --- | --- |
| `name: str` | `name` は string |
| `limit: int = 20` | `limit` は integer、default は 20 |
| `active: bool = True` | `active` は boolean、default は true |
| `age: int | None = None` | `age` は integer または null |
| `list[str]` | string の list |
| `dict[str, str]` | key も value も string の dict |

関数 parameter に default value がある場合、多くは optional query parameter です。

Default がない path parameter は path template から来ます。

Pydantic model type は通常 request body です。

例です。

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

`body` は request body です。

`limit` は query です。

Type hints は error にも影響します。

`limit: int = 20` に対して client が `?limit=abc` を送ると、FastAPI は validation error を返します。

`body.query` が欠けていても validation error です。

これらの error は多くの場合、関数本体の実行前に起きます。

Debug するとき、関数の一行目に breakpoint を置くだけでは足りません。

Breakpoint に入らないなら、route matching、dependency、parameter validation のどこかで止まっている可能性があります。

## Annotated、Query、Path、Body、Field

最近の FastAPI project では `typing.Annotated` で parameter metadata を付けることがよくあります。

```python
from typing import Annotated
from fastapi import Query

@app.get("/tasks")
async def list_tasks(
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    ...
```

これは次の意味です。

`limit` は integer です。

`limit` は query から来ます。

`limit` の最小値は 1 です。

`limit` の最大値は 100 です。

`limit` の default は 50 です。

Path parameter も同じように書けます。

```python
from typing import Annotated
from fastapi import Path

@app.get("/tasks/{task_id}")
async def get_task(
    task_id: Annotated[int, Path(ge=1)],
):
    ...
```

Pydantic model fields には `Field` を使います。

```python
from pydantic import BaseModel, Field

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    priority: int = Field(default=3, ge=1, le=5)
```

大まかな対応です。

`Query` は query parameter。

`Path` は path parameter。

`Header` は headers。

`Cookie` は cookies。

`Body` は body parameter。

`Field` は Pydantic model field。

共通する目的は、API boundary に制約を書くことです。

業務関数の中に `if not isinstance(...)` を大量に置くより、boundary validation を明確にします。

Boundary が明確になるほど、business logic は読みやすくなります。

## async/await：FastAPI の非同期感覚

![FastAPI async と event loop の関係を示す図](/images/engineering/practice/fastapi-async-event-loop-visual.png)

FastAPI endpoint は `async def` で書けます。

普通の `def` でも書けます。

`async def` では関数内で `await` を使えます。

`await` は非同期操作の完了を待つための構文です。

典型的な非同期操作です。

Async database query。

Async HTTP request。

Async cache access。

Async queue operation。

File または network I/O の async wrapper。

例です。

```python
@app.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await user_repo.get(user_id)
    return user
```

`await user_repo.get(user_id)` は database や外部 resource の結果を待つことを表します。

待っている間、event loop は別の task を処理できます。

これは CPU 計算が速くなるという意味ではありません。

主に I/O wait 中の concurrency を改善する仕組みです。

注意すべきなのは、`async def` の中で blocking code を呼ぶことです。

```python
import time

@app.get("/slow")
async def slow():
    time.sleep(5)
    return {"ok": True}
```

`time.sleep(5)` は event loop を block します。

Demo なら次のように書きます。

```python
import asyncio

@app.get("/slow")
async def slow():
    await asyncio.sleep(5)
    return {"ok": True}
```

実務では、同期 database client、同期 HTTP client、CPU heavy logic、大きな file processing で問題が出やすいです。

Library が同期 API しか持たない場合、endpoint を `async def` にしても自動的には non-blocking になりません。

## sync vs async：どちらを使うか

FastAPI では `def` endpoint と `async def` endpoint の両方が使えます。

選択は依存先の I/O model に合わせます。

関数内で async library を主に呼ぶなら `async def` を使います。

関数内で sync library を主に呼ぶなら `def` のほうが自然なことがあります。

Database、cache、HTTP client が async で統一されている project では、endpoint も `async def` が多くなります。

伝統的な sync ORM や sync SDK を使う project では、安易に `async def` へ変えても得をしないことがあります。

簡単な判断表です。

| 場面 | 目安 |
| --- | --- |
| async database driver を使う | `async def` + `await` |
| `httpx.AsyncClient` を使う | `async def` + `await` |
| sync ORM を使う | 多くの場合 `def`、または project convention に従う |
| `time.sleep` が必要 | `async def` 内で直接使わない |
| CPU heavy task | background task、queue、process pool、worker を検討 |
| 定数を返す health check | `def` でも `async def` でもよい |

`async` を「より上級」と読まないことが大切です。

これは concurrency model の一部です。

重要なのは endpoint 内部が同じ I/O convention を守っているかです。

次の code は注意が必要です。

```python
@app.get("/external")
async def call_external():
    response = requests.get("https://example.com")
    return response.json()
```

`requests.get` は同期 blocking call です。

Async project では `httpx.AsyncClient` や project 既存の async HTTP wrapper を使うほうが自然です。

## Validation errors：なぜ 422 がよく出るのか

FastAPI は業務関数に入る前に input parsing と validation を行います。

検証に失敗すると、多くの場合 `422` が返ります。

原因は path のことがあります。

原因は query のことがあります。

原因は headers のことがあります。

原因は body のことがあります。

例です。

```python
@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    return {"task_id": task_id}
```

Request です。

```text
GET /tasks/abc
```

`abc` は `int` に変換できません。

FastAPI は validation error を返します。

関数本体は実行されません。

Body の例です。

```python
class TaskCreate(BaseModel):
    title: str = Field(min_length=1)
    priority: int = Field(ge=1, le=5)

@app.post("/tasks")
async def create_task(body: TaskCreate):
    return body
```

Request です。

```json
{
  "title": "",
  "priority": 9
}
```

Error point は二つです。

`title` が短すぎます。

`priority` が範囲外です。

FastAPI の validation error には通常 `detail` array があります。

各 element には error location、error type、message、input value が含まれます。

422 を debug するときの順序です。

`detail[].loc` を見て、path、query、header、body のどこで起きたか確認する。

`detail[].type` を見て、missing field、type conversion、length、range のどれか確認する。

実際に送られた JSON を見る。

`Content-Type` が `application/json` か確認する。

Pydantic model が field を required にしていないか確認する。

Alias や大文字小文字の違いで field name がずれていないか確認する。

Test が `json=...` を使っているか確認する。

## OpenAPI docs：自動ドキュメントも契約である

FastAPI は OpenAPI schema を自動生成します。

Default では local server 起動後に次へアクセスできます。

```text
/docs
/redoc
/openapi.json
```

`/docs` は通常 Swagger UI です。

`/redoc` は通常 ReDoc です。

`/openapi.json` は machine-readable API schema です。

これらは別途手で書いた資料ではありません。

Decorator、type hints、Pydantic model、status code、response model、metadata から生成されます。

ドキュメントが間違っているなら、code boundary も曖昧な可能性があります。

OpenAPI を読むときの確認点です。

Path が期待通りか。

Method が期待通りか。

Parameters の位置が正しいか。

Request body schema が正しいか。

Response schema が正しいか。

Error response の説明があるか。

Authentication scheme が出ているか。

Endpoint が適切な tags に入っているか。

Endpoint が `/docs` に見えない場合の原因です。

Router が `include_router` されていない。

Module が import されていない。

Endpoint に `include_in_schema=False` がある。

起動している app instance が別物。

Test や local command が別の entrypoint を見ている。

## Testing：TestClient と httpx で契約を確認する

FastAPI の公式ドキュメントでは `TestClient` を使った testing が紹介されています。

`TestClient` は同期 style の endpoint test に向いています。

典型例です。

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

`json=...` を使う点が重要です。

`json=...` は Python object を JSON に serialize し、適切な content type を設定します。

`data=...` を使うと form data または raw body になることがあります。

その結果、分かりにくい 422 が出ることがあります。

Test は status code だけを確認して終わらせないほうがよいです。

重要な response fields も確認します。

Error branch も確認します。

Boundary condition も確認します。

例です。

```python
def test_create_task_rejects_empty_title():
    response = client.post(
        "/tasks",
        json={"title": "", "priority": 2},
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"][-1] == "title"
```

Async test では HTTPX の `AsyncClient` と ASGI transport を使うことがあります。

Project ごとに fixture の作り方は違います。

既存 project では、まずその repository の testing style を真似します。

Endpoint の基本 test checklist です。

成功 request が正しい status code を返す。

成功 request が正しい JSON shape を返す。

Required field が欠けたとき validation error になる。

Type error が validation error になる。

認証なしで 401 または 403 になる。

Resource not found が 404 になる。

Business conflict が 409 または project convention の error になる。

Pagination、filter、sort が約束通り効く。

Internal fields を返さない。

OpenAPI schema が request と response を説明できる。

## Project layout：FastAPI project のよくある構成

小さい project なら `main.py` 一つで始まります。

実務 project では directory を分けることが多いです。

よくある layout です。

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

Team によって命名は違います。

しかし responsibility は似ています。

`main.py` は app を作り、router を登録し、middleware を設定します。

`api/routes` は HTTP endpoint を置きます。

`schemas` は Pydantic request/response model を置きます。

`models` は ORM model または domain model を置くことがあります。

`services` は業務 flow を置きます。

`repositories` または `dao` は database access を置きます。

`core` は configuration、security、logging などを置きます。

`tests` は test を置きます。

既存 endpoint を読むときの追跡順序です。

`main.py` から `include_router` を探す。

Router から具体的な path operation を探す。

関数シグネチャから request schema を探す。

`response_model` から response schema を探す。

Dependency から authentication と context を探す。

Service から business logic を探す。

Repository から data source を探す。

Tests から expected behavior を探す。

最初から database table へ行くより、HTTP boundary から読むほうが安定します。

## Reading an existing endpoint：再現できる読み方

Endpoint を読むときは、次の順序を使います。

第一に decorator を見る。

Method は何か。

Path は何か。

Status code は何か。

Response model は何か。

Tags、summary、responses に追加 contract があるか。

第二に関数シグネチャを見る。

どの parameter が path か。

どの parameter が query か。

どの parameter が header か。

どの parameter が dependency か。

どの parameter が body か。

どの parameter が optional か。

どの parameter に default value があるか。

第三に request model を見る。

Required fields は何か。

`None` を許す fields は何か。

Default value はあるか。

Length や range limit はあるか。

Alias はあるか。

Extra fields を許すか。

第四に response model を見る。

Internal fields を隠しているか。

Database model と混同していないか。

List response に pagination info があるか。

Error response format は統一されているか。

第五に dependency を見る。

Authentication はどこで行われるか。

Authorization はどこで確認されるか。

Database session はどう注入されるか。

Request context はどう渡されるか。

Feature flag や tenant 情報はどこで読むか。

第六に business logic を見る。

どの branch が `HTTPException` を投げるか。

どの branch が external service を呼ぶか。

どの branch が database を書くか。

Transaction boundary はどこか。

Retry、timeout、idempotency は明確か。

第七に test を見る。

Happy path を覆っているか。

Validation failure を覆っているか。

Authentication failure を覆っているか。

Authorization failure を覆っているか。

Resource not found を覆っているか。

Business conflict を覆っているか。

Status code だけでなく response fields を確認しているか。

## Debugging：現象から境界へ戻る

FastAPI endpoint を debug するときは、まず問題を分類します。

Route が match していないのか。

Validation が失敗しているのか。

Authentication が失敗しているのか。

Authorization が失敗しているのか。

Business branch が失敗しているのか。

Database が失敗しているのか。

External service が失敗しているのか。

Response serialization が失敗しているのか。

よくある現象と確認方向です。

| 現象 | 可能性 |
| --- | --- |
| `404` | path mismatch、router 未登録、base path 間違い、resource not found |
| `405` | path は合うが method が違う |
| `422` | path/query/header/body validation failure |
| `401` | token missing、format error、authentication dependency rejection |
| `403` | authenticated だが permission 不足 |
| `409` | business state conflict |
| `500` | uncaught exception、serialization failure、dependency service error |
| request が止まる | blocking I/O、timeout なし、database lock、connection pool exhaustion |
| docs に出ない | router 未登録、import path error、`include_in_schema=False` |

422 を debug する最初の rule です。

Response body の `detail` を先に見る。

Business code を先に変えない。

500 を debug する最初の rule です。

Server-side traceback を見る。

Client が受け取った `"Internal Server Error"` だけで判断しない。

Async の遅さを debug する最初の rule です。

`async def` の中で synchronous blocking library を呼んでいないか確認する。

Documentation mismatch を debug する最初の rule です。

実行中の app が現在の code なのか確認する。

## 一通りそろった例：タスク API

実務の境界に近い example です。

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

この code の公開 contract は次の通りです。

`POST /tasks` は task を作成します。

`GET /tasks/{task_id}` は task を読みます。

`PATCH /tasks/{task_id}` は task を部分更新します。

Authentication は `current_user_id` dependency が扱います。

`TaskCreate` は create request body です。

`TaskPatch` は update request body です。

`TaskOut` は公開 response です。

`task_id` は 1 以上の integer でなければなりません。

`Authorization` header がないと 401 です。

Task が見つからなければ 404 です。

空の patch は 400 です。

入力の型やフィールドが不正なら、関数本体に入る前に 422 です。

## この例をテストする

対応する test は次のように書けます。

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

これらの tests は次を覆っています。

Successful create。

Authentication failure。

Body validation failure。

Path validation failure。

最初の scenario だけでは API contract として弱いままです。

## Glossary：FastAPI code でよく見る言葉

API：application 同士が通信する interface。

REST：resource-oriented な API style。

HTTP：method、headers、status code などを定義する Web protocol。

Method：request action。例は `GET`、`POST`、`PATCH`。

Path：URL の resource location。例は `/tasks/1`。

Query：URL の `?` 以降の parameters。例は `?limit=20`。

Header：request または response の metadata。例は `Authorization`。

Body：request または response の main content。API では JSON が多い。

JSON：API request と response でよく使う軽量 data format。

Schema：data structure の説明。実データではない。

JSON Schema：JSON の形と制約を記述する標準。

OpenAPI：HTTP API を記述する標準形式。

Swagger UI：OpenAPI に基づく interactive documentation UI。

ReDoc：OpenAPI に基づく documentation UI。

Pydantic：Python の data validation と serialization library。

Model：Pydantic で data shape を表す class。

Field：Pydantic field configuration。default、length、range などを指定する。

Decorator：Python decorator。FastAPI は route registration に使う。

Path operation：FastAPI における method + path + function の組み合わせ。

Router：route group。よく `APIRouter` を使う。

Dependency：`Depends` で注入する dependent logic。

Middleware：request が endpoint に入る前後で実行される global layer。

Exception handler：exception を response に変換する handler。

Status code：HTTP response status。

Validation error：input が宣言された rule に合わないときの error。

Serialization：Python object を JSON などの transport format に変換すること。

Deserialization：JSON などの input を Python object に変換すること。

Async：非同期 concurrency model。

Await：async operation の完了を待ち、event loop に制御を戻す構文。

Event loop：async tasks を調度する loop。

Blocking I/O：現在の実行 thread を止める I/O。

TestClient：FastAPI/Starlette の testing client。

HTTPX：Python HTTP client library。sync と async の API call/testing に使われる。

ASGI：Python async web server interface specification。FastAPI は ASGI ecosystem 上にある。

Uvicorn：よく使われる ASGI server。

## FAQ

### FastAPI は小さい project 向けだけですか？

いいえ。

FastAPI は single file から始められます。

同時に、router、schema、service、repository、configuration、test を分けた大きな project にもできます。

### Python を完全に理解してから FastAPI を読むべきですか？

完全である必要はありません。

しかし function、class、type hints、decorator、exception、module import、async/await の読み方は必要です。

FastAPI endpoint の多くの情報は関数シグネチャと decorator に書かれています。

### なぜ関数が実行される前に 422 が返るのですか？

FastAPI が関数本体に入る前に parameter parsing と validation を行うからです。

Path、query、headers、body が宣言に合わなければ、関数本体は実行されません。

まず response の `detail` を見ます。

### `response_model` と戻り値の type annotation は何が違いますか？

どちらも response の説明に使えます。

`response_model` は FastAPI decorator parameter で、公開 output schema を明示的に制御します。

Return type annotation も FastAPI に利用されますが、project style に差があります。

既存 project では、その repository の convention に従います。

### Request body に `dict` を使ってもよいですか？

使えます。

ただし公開 API で長期的に裸の `dict` を使うのは避けたいことが多いです。

裸の `dict` には field-level validation、documentation、editor support が少ないからです。

Pydantic model のほうが API contract に向いています。

### `async def` は常に `def` より良いですか？

いいえ。

内部で synchronous blocking library を呼ぶなら、`async def` は問題を見えにくくすることがあります。

Database、HTTP client、SDK の I/O model に合わせます。

### 400 と 422 はどう使い分けますか？

Type conversion、required field、length、range など boundary validation の失敗は多くの場合 422 です。

Request structure は正しいが business rule に反する場合は、400 または 409、403 などの具体的な code を使うことがあります。

Team で error semantics を揃えるのが大切です。

### 401 と 403 の違いは何ですか？

401 は多くの場合、未認証または認証が無効であることを示します。

403 は認証済みだが操作権限がないことを示します。

### なぜ `/docs` に endpoint が出ませんか？

Router が登録されていない可能性があります。

Module が import されていない可能性があります。

別の app を起動している可能性があります。

`include_in_schema=False` が設定されている可能性があります。

Local server の restart や hot reload が反映されていない可能性もあります。

### Test で `json=...` を使うべき理由は何ですか？

`json=...` は Python object を JSON に serialize し、JSON content type を設定します。

実際の API call に近い形になります。

`data=...` は form data または raw body として送られ、server 側の parsing path が変わることがあります。

### Pydantic model は database model ですか？

通常は違います。

Pydantic model は API boundary や configuration boundary を表します。

Database model は persistence structure を表します。

似ていることはありますが、責務は別です。

### Mutable default value はなぜ注意が必要ですか？

Python の mutable default value は複数回の呼び出しで共有される bug につながることがあります。

Pydantic field では list や dict の default に `default_factory` を使うほうが意図が明確です。

各 model instance が新しい object を持つことを表せます。

## Checklist：FastAPI endpoint を読むときの確認項目

### Routing and parameters

- Method、path、router prefix、`include_router` が同じ route につながっているか。
- Path parameter name と function parameter name は一致している。
- Query parameter には default value と range limit がある。
- Header parameter は `Header` を使い、authentication dependency と authorization check の位置が明確である。

### Pydantic validation

- Request body は明確な Pydantic model を使う。
- Required、nullable、default value、alias が contract と合っているか。
- Field length と numeric range は model で表現する。
- List と dict は必ず適切な default 方式を使う。

### Response and status code

- Response model があり、return value が internal fields を漏らさない。
- Success と error の status code はそれぞれ明確である。
- 401 と 403 は authentication missing と permission denied を分けているか。
- 404、409、422 はそれぞれ resource missing または visibility hiding、conflict、automatic validation に対応する。

### Exception handling

- Exception は common handler で wrapping され、裸の throw になっていない。
- Database transaction boundary が明確である。
- Log に request id が含まれる。

### External calls and async

- External service call には必ず timeout を設定する。
- Retry policy と idempotency policy はセットで見る。
- `async def` 内に synchronous library による request blocking がない。
- CPU heavy logic は request path を占有しない。

### Tests

- Success path、validation error、authentication failure、authorization failure を覆う。
- Resource not found と business conflict は別々に test する。
- Test は status code だけでなく response body を assert する。
- `/docs`、`/openapi.json`、client example は同じ method、path、headers、JSON body contract を表す。

## 最後に一文でまとめる

FastAPI を読むときは、「この Python はどう動くか」から始めないほうが安定します。

まず「この HTTP API contract は何か」から始めます。

Method は操作を決めます。

Path は resource を決めます。

Query は読み取り option を決めます。

Headers は metadata と authentication を決めます。

Body は送信 data を決めます。

Pydantic は JSON shape を決めます。

Type hints は parameter parsing と documentation を支えます。

Decorator は route registration を決めます。

`async/await` は I/O wait model を決めます。

Status code は結果の意味を決めます。

Tests は contract が守られていることを確認します。

この線をつかめば、多くの FastAPI endpoint は落ち着いて分解できます。

## 参考資料

- [FastAPI First Steps](https://fastapi.tiangolo.com/tutorial/first-steps/)
- [FastAPI Request Body](https://fastapi.tiangolo.com/tutorial/body/)
- [FastAPI Response Model](https://fastapi.tiangolo.com/tutorial/response-model/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [FastAPI Concurrency and async/await](https://fastapi.tiangolo.com/async/)
- [Pydantic Fields](https://docs.pydantic.dev/latest/concepts/fields/)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
