---
title: "Node.js 開発者のための FastAPI 移行マップ：Express の考え方を FastAPI に移す"
date: 2026-05-13
category: engineering
description: "Express のルーティング、ミドルウェア、エラーハンドリング、非同期モデル、npm ワークフローを FastAPI、asyncio、uv に対応づける実践ガイド。"
difficulty: intermediate
plainSummary: "Node.js 開発者が FastAPI を学ぶときは、単なる構文置き換えではなく、関数シグネチャ、型ヒント、依存性注入、asyncio、uv が作る新しい開発境界を理解することが重要です。"
tags:
  - "FastAPI"
  - "Python"
  - "AI Engineering"
lang: ja
coverImage: "/images/engineering/practice/fastapi-express-migration-cover.png"
draft: false
---

# Node.js 開発者のための FastAPI 移行マップ：Express の考え方を FastAPI に移す

> 鮮度メモ：この記事は 2026-05-13 時点で確認しています。FastAPI、Pydantic、uv、Python asyncio、ASGI サーバー、周辺のデプロイ手法は今後も変わるため、本番導入前には公式ドキュメント、利用しているランタイムのバージョン、運用基盤の制約を確認してください。

Express に慣れている開発者が FastAPI に移るとき、いちばん危ないのは Python の構文ミスではありません。FastAPI を「Python 版 Express」として扱ってしまうことです。どちらも HTTP API を作れますし、router、middleware、request、response、error handler、認証、DB、テスト、デプロイを扱えます。しかし、設計の重心はかなり違います。

Express の中心には、request object と middleware chain があります。リクエストが middleware、router、handler を通り、handler が `req` から値を取り、`res` でレスポンスを書き、エラーは `next(err)` や error middleware に集約されます。FastAPI の中心にあるのは、関数シグネチャ、型ヒント、Pydantic model、依存性注入、OpenAPI contract です。path parameter、query parameter、request body、header、cookie、認証済みユーザー、DB session、response model を、関数の境界で宣言できます。

つまり、移行は API 名の置き換えではありません。

- `req.params.id` を `request.path_params["id"]` に置き換えるのではなく、`user_id: str` として宣言します。
- `req.body` を `await request.json()` に置き換えるのではなく、Pydantic の入力 model にします。
- `res.json(user)` を毎回 `JSONResponse(user)` にするのではなく、多くの場合はそのまま `return user` し、`response_model` で公開境界を決めます。
- `next(err)` の代わりに callback を探すのではなく、`raise HTTPException(...)` と exception handler で失敗の意味を表現します。
- middleware はすべての前処理の置き場ではありません。FastAPI では dependency が業務コンテキスト、認証、権限、resource lifecycle の中心になることが多いです。

この記事では、Node.js / Express 経験者が実際にサービスを移行し、コードレビューし、本番で問題を調べられるように、移行の考え方、routing、request / response、dependency と middleware、error handling、validation、async の落とし穴、testing、project layout、security、deployment、migration checklist、code review checklist、anti-pattern、FAQ までをまとめます。

![Express から FastAPI への移行マップ](/images/engineering/practice/express-to-fastapi-concept-map.svg)

![FastAPI request lifecycle visual](/images/engineering/practice/fastapi-request-lifecycle-visual.png)

## まず対応表で座標を作る

| Express / Node.js | FastAPI / Python | 移行で変えるべき考え方 |
| --- | --- | --- |
| `app.get("/users/:id", handler)` | `@router.get("/users/{user_id}")` | decorator は route 登録、型契約、OpenAPI metadata を兼ねる |
| `express.Router()` | `APIRouter()` | 機能単位で router を分け、app の入口でまとめて mount する |
| `req.params.id` | `user_id: str` | path parameter は関数シグネチャに入り、validation の対象になる |
| `req.query.page` | `page: int = Query(1, ge=1)` | query parameter には default、範囲、説明、例を持たせられる |
| `req.body` | `payload: UserCreate` | request body の validation は Pydantic model に寄せる |
| `req.headers.authorization` | `authorization: str \| None = Header(None)` | header は引数で受けられるが、認証 context は dependency が向く |
| `res.status(201).json(data)` | `@router.post(..., status_code=201)` + `return data` | status code、response model、return value を分けて考える |
| `res.locals` | dependency の戻り値 / `request.state` | 業務 context は dependency、低レベルの横断 state は `request.state` |
| `next(err)` | `raise HTTPException(...)` | HTTP 上の失敗は exception として表現する |
| error middleware | exception handler | 統一エラー形式は exception handler で集約する |
| middleware | middleware + dependency | protocol 横断処理は middleware、業務 resource と権限は dependency |
| `Promise.all` | `asyncio.gather` / `TaskGroup` | Python の coroutine は作成しただけでは並行実行されない |
| job queue / worker | background task / worker / scheduler | request 内 background task は信頼できる queue ではない |
| `package.json` | `pyproject.toml` | metadata、dependency、tool config は標準 Python project file に寄せる |
| `package-lock.json` | `uv.lock` | lockfile は commit し、CI は lockfile に従って同期する |
| `npm run dev` | `uv run fastapi dev` / `uv run uvicorn ...` | command は project environment 上で実行する |
| Jest / Vitest + supertest | pytest + TestClient / httpx | schema、dependency override、error format、async boundary をテストする |
| helmet / cors / rate limit | CORS middleware + security dependencies + gateway policy | security は app、reverse proxy、platform にまたがる |
| PM2 / node process | Uvicorn / Gunicorn / platform runtime | ASGI worker、lifespan、proxy header、health check を理解する |

この表の結論は単純です。FastAPI の入口は `req` ではなく、関数シグネチャです。FastAPI の保守性は「短く書ける」ことだけではなく、入力、出力、依存関係、失敗の境界を明示できることから生まれます。

## 移行のメンタルモデル：chain から contract へ

Express の request flow は chain として考えやすいです。

```text
request
  -> global middleware
  -> router middleware
  -> handler
  -> res.status(...).json(...)
  -> error middleware when next(err)
```

FastAPI の request flow は contract resolution に近いです。

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

Express では、`req.user` がどの middleware で追加されたのか、`res.locals.tenant` を誰が書いたのか、`next` が複数回呼ばれていないか、error object に `statusCode` があるのか、といったことを運用上の約束で管理しがちです。FastAPI では、その約束を関数の境界に寄せます。この endpoint は `CurrentUser` が必要、この endpoint は `Session` が必要、この parameter は `1..100` の範囲、という情報が宣言として見えるようになります。

移行では三つの方針を持つと安定します。

第一に、「request から取り出す」より「framework に注入してもらう」と考えます。path、query、body、header、cookie、current user、DB session を、できるだけ明示的な引数や dependency にします。

第二に、「handler 内で手作業 validation」より「境界 model で validation」と考えます。必須項目、format、enum、長さ、数値範囲、nested object、default value は Pydantic で表現します。

第三に、「業務 object をそのまま返す」より「response model で公開範囲を切る」と考えます。Express の `res.json(user)` の感覚をそのまま持ち込むと、内部 field の漏えいが起きやすくなります。

## FastAPI の一リクエストで起きること

request lifecycle を理解すると、「なぜ middleware ではこの値が見えないのか」「なぜ dependency が先に実行されるのか」「なぜ validation error の形式が違うのか」が整理できます。

一般的な流れは次のようになります。

1. ASGI server が connection と HTTP event を受ける。
2. application middleware が raw request を処理する。
3. FastAPI / Starlette が route を match する。
4. path operation の関数シグネチャを読む。
5. dependency graph を解決して実行する。
6. path、query、header、cookie、body を parse / validate する。
7. endpoint function を呼び出す。
8. return value、`response_model`、status code、response class に従って serialize する。
9. 途中で exception が起きた場合は exception handler が response を作る。
10. response が middleware を通って ASGI server に戻る。

ここで重要なのは、middleware は dependency より前に動くことです。middleware は trace id、CORS、proxy header、security header、request duration のような、まだ業務意味に入る前の横断処理に向きます。dependency は、endpoint が何を必要としているかが分かった後の current user、permission、database transaction、tenant context に向きます。

## Routing：Express handler から FastAPI path operation へ

Express handler では、parse、service call、error handling、response writing が一か所に集まりがちです。

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

FastAPI では、境界をもう少し宣言的にします。

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

移行上のポイントは四つあります。

第一に、Express は `:id`、FastAPI は `{user_id}` です。path variable と function parameter の名前がずれていると、FastAPI は意図を推測しません。

第二に、`user_id: str` は単なる IDE hint ではなく API contract です。`UUID`、`int`、`Annotated[str, Path(...)]` にすれば validation と documentation に反映されます。

第三に、`response_model=UserOut` は output field を filter します。service layer が ORM object や dict を返しても、公開 response は `UserOut` の形に制限できます。

第四に、404 は業務上予測できる HTTP failure なので `HTTPException` として表現します。予期しない例外は unified handler と monitoring に任せます。

## Router organization：main.py を app.js のコピーにしない

Express project ではよく次のような構成になります。

```text
src/
  app.js
  routes/
    users.js
    orders.js
  middleware/
  services/
```

FastAPI でも似た分割はできますが、すべてを `main.py` に集めるのは避けます。

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

`main.py` は組み立てに集中させます。

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

HTTP layer、business layer、data access layer、configuration、dependency、security boundary が分かれていると、テストで dependency を差し替えるのも簡単になります。

## Path parameter、query parameter、header

Express では次のように書きがちです。

```js
app.get("/search", (req, res) => {
  const page = Number(req.query.page ?? 1)
  const limit = Math.min(Number(req.query.limit ?? 20), 100)
  const requestId = req.headers["x-request-id"]
  res.json(search(req.query.q, { page, limit, requestId }))
})
```

FastAPI では制約を parameter に置きます。

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

これは単に `Number(...)` を減らすためではありません。FastAPI はこれらの制約を request validation、error response、OpenAPI document に使います。呼び出し側が `limit=1000` を送ってきた場合、handler に分岐を書かなくても structured 422 response を返せます。

## Request body：loose JSON から input model へ

Express では `req.body` から field を取り出すことが多いです。

```js
app.post("/users", async (req, res) => {
  const { email, name, role } = req.body
  const user = await userService.create({ email, name, role })
  res.status(201).json(user)
})
```

FastAPI では request body model を API boundary にします。

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

input model と output model は分けます。`UserCreate` は client が送れるもの、`UserOut` は client が見られるもの、database model は内部 storage の形です。これらを長期的に混ぜると、内部 field の漏えい、互換性問題、migration の難しさが出ます。

## Response：多くの場合はそのまま return する

Express の response は明示的です。

```js
res.status(200).json({ items, total })
```

FastAPI では declarative に寄せます。

```python
class PageOut(BaseModel):
    items: list[UserOut]
    total: int

@router.get("/users", response_model=PageOut)
async def list_users():
    items, total = await user_service.list_users()
    return {"items": items, "total": total}
```

`Response`、`JSONResponse`、`StreamingResponse` などを直接使うのは、cookie、header、streaming、file download、redirect、non-JSON response、default serialization の回避が必要なときです。

基本方針は次のとおりです。

- 普通の JSON は dict、list、Pydantic model、service DTO を return する。
- status code は decorator で宣言する。
- output field は `response_model` で制御する。
- header / cookie が必要なときだけ `Response` を注入する。
- file / streaming は専用 response class を使う。
- error は exception として表現し、成功 response と混ぜない。

## Dependency vs Middleware：移行の成否を分けるところ

Express 経験者が FastAPI で軽く見がちなのが dependency です。dependency は「別種の middleware」ではありません。request 内の dependency graph を解決する仕組みです。値を返せます。他の dependency に依存できます。同一 request 内で結果を cache できます。`yield` で resource lifecycle を管理できます。router level や app level にも付けられます。

current user の dependency は次のように書けます。

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

Express なら次のように書くかもしれません。

```js
app.use(authMiddleware)

app.get("/me", (req, res) => {
  res.json(req.user)
})
```

FastAPI の書き方では、`read_me` が `current_user` を必要としていること、その値が `get_current_user` 由来であること、失敗時に 401 になることが読み取れます。関数シグネチャが API の依存関係を説明してくれます。

## Middleware を使うべき場面

middleware はもちろん重要です。ただし、具体的な endpoint の return value と関係が薄い横断処理に向けます。

middleware に向くもの：

- request id / correlation id。
- access log。
- request duration。
- CORS。
- compression。
- security response header。
- proxy header の補正。
- global timeout や body size control。
- APM / tracing の低レベル integration。

middleware に向きにくいもの：

- 多くの route が不要なのに、全 request で current user を読み込む。
- health check まで含めて全 request で DB session を開く。
- 複雑な permission 分岐を middleware に入れる。
- middleware で body を読み、endpoint でも再度 body を読む。
- business error を握りつぶして曖昧な 500 にする。

典型的な duration middleware は次のようになります。

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

middleware は低レベルであるほど、単純で、予測しやすく、低コストに保つべきです。複雑な業務条件は dependency か service layer に戻します。

## `yield` dependency：resource lifecycle の書き方

Express では middleware で resource を開いて `req` に付けることがあります。

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

FastAPI では `yield` dependency が自然です。

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

resource は必要な route でだけ作られ、request の lifecycle に紐づきます。テストでは `get_session` を override し、test database や fake repository に差し替えられます。

## Error handling：`next(err)` から exception semantics へ

Express の統一 error handler は次のような形になりがちです。

```js
app.use((err, req, res, next) => {
  const status = err.statusCode || 500
  res.status(status).json({
    error: err.message,
    requestId: req.id,
  })
})
```

FastAPI では三層で考えると整理しやすいです。

第一層は、業務上予測できる HTTP failure です。これは `HTTPException` で表現します。

```python
from fastapi import HTTPException, status

if user is None:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found",
    )
```

第二層は、domain exception を API boundary で HTTP response に map することです。

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

第三層は、unknown exception です。これは log と monitoring に渡し、本番 response では stack trace を返さないようにします。

統一 error response は例えば次のようにできます。

```json
{
  "code": "user_not_found",
  "message": "User not found",
  "details": {},
  "request_id": "req_123"
}
```

FastAPI の default 422 validation error は詳細です。API gateway や frontend の都合で固定形式が必要な場合は validation exception handler を上書きできますが、field-level error を消してしまうのは避けます。`body.email` が不正だと分かることは、client にとってとても重要です。

## Validation：Pydantic は TypeScript type のコピーではない

TypeScript の型は主に compile time の支援です。runtime validation には Zod、Yup、Joi、class-validator、手書き logic などが必要です。FastAPI の Pydantic model は runtime validation に参加します。この違いは大きいです。

次の model は runtime validation であり、API document の一部でもあります。

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

移行では二つの極端を避けます。

一つは model をほとんど使わず、すべてを `dict` にすることです。これでは FastAPI の value が消え、OpenAPI も弱くなります。

もう一つは ORM model、input model、output model、internal business object を一つの class に押し込むことです。短期的には楽ですが、security と compatibility の問題を作ります。

より安定する分け方は次のとおりです。

- `UserCreate`：client が作成時に送れる field。
- `UserUpdate`：client が更新時に送れる field。多くは optional。
- `UserOut`：client が見られる field。
- `UserInDB` または ORM model：password hash、permission、audit field を含む内部 storage。
- `UserDomain`：必要に応じた domain object。FastAPI に直接公開しないことも多い。

## Response model と field leakage

Express では database object をそのまま `res.json()` してしまう事故があります。FastAPI でも同じ事故は起きますが、より良い防御線を持てます。

避けたい書き方：

```python
@router.get("/users/{user_id}")
async def get_user(user_id: str):
    return await user_repository.get_user(user_id)
```

推奨する書き方：

```python
class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr

@router.get("/users/{user_id}", response_model=UserPublic)
async def get_user(user_id: str):
    return await user_repository.get_user(user_id)
```

service layer が `password_hash`、`internal_note`、`billing_customer_id` などを含む object を返しても、`response_model` は公開 response を contract 内に制限します。唯一の security 対策ではありませんが、公開 API では default の習慣にするべきです。

## Async model：Promise と coroutine は同じではない

Node.js では Promise の感覚が身についています。

```js
const userPromise = fetchUser(id)
const profilePromise = fetchProfile(id)
const [user, profile] = await Promise.all([userPromise, profilePromise])
```

Python の `async def` を呼ぶと coroutine object が返ります。coroutine は、作っただけでは I/O まで進みません。`await` するか、task として schedule する必要があります。

![Promise と asyncio の流れ](/images/engineering/practice/promise-asyncio-flow.svg)

```python
import asyncio

async def get_user_bundle(user_id: str):
    user_task = asyncio.create_task(fetch_user(user_id))
    profile_task = asyncio.create_task(fetch_profile(user_id))
    user, profile = await asyncio.gather(user_task, profile_task)
    return {"user": user, "profile": profile}
```

移行時の要点は次のとおりです。

- `fetch_user(user_id)` は coroutine を作るだけです。
- `await fetch_user(user_id)` は完了まで待ちます。
- `asyncio.create_task(fetch_user(user_id))` は event loop に schedule します。
- `asyncio.gather(...)` は複数の awaitable を待ちます。
- Python 3.11+ の `asyncio.TaskGroup` は structured concurrency に向きます。
- 同期 blocking I/O は event loop を止めます。

## `async def` と `def` の使い分け

FastAPI は `async def` endpoint と普通の `def` endpoint の両方を扱えます。FastAPI だからといって、すべてを `async def` にする必要はありません。

`async def` に向くもの：

- async database driver を使う。
- `httpx.AsyncClient` のような async HTTP client を使う。
- SDK 自体が awaitable API を提供している。
- request 内で複数の I/O を並行して待つ。

普通の `def` に向くもの：

- sync database driver に依存している。
- blocking SDK に依存している。
- 軽い CPU 処理が中心。
- 既存 code の migration 中で、まだ async 化できない。

危険な書き方：

```python
import time

@router.get("/slow")
async def slow_endpoint():
    time.sleep(5)
    return {"ok": True}
```

より良い書き方：

```python
import asyncio

@router.get("/slow")
async def slow_endpoint():
    await asyncio.sleep(5)
    return {"ok": True}
```

blocking function を呼ぶ必要があるなら、明示的に thread pool に逃がすか、sync endpoint として扱います。event loop をこっそり止めないことが大切です。

## Async pitfalls checklist

Express から移ると、次の問題がよく起きます。

- `async def` の中で `requests.get()` を呼ぶ。
- `async def` の中で sync database driver を呼ぶ。
- `time.sleep()` を `await asyncio.sleep()` の代わりに使う。
- coroutine を作ったのに `await` し忘れる。
- `asyncio.create_task()` で重要 task を起動し、保存も待機も error handling もしない。
- request-scoped object を background task に渡し、request 終了後に resource が閉じている。
- Uvicorn の single worker で CPU を全部使えると思い込む。
- mutable business state を global variable に保存し、複数 worker 間で state がずれる。
- dependency の中で高コストな remote call をし、timeout、cache、fallback がない。
- AI inference を endpoint 内で長時間待ち、HTTP timeout と user experience の両方を悪化させる。

AI / Agent API では特に注意が必要です。model call、vector search、web scraping、code execution、file parsing は遅くなりがちです。HTTP endpoint では、短い同期 request、job submission、streaming response、background queue を意識的に分けます。

## Testing：supertest から pytest / httpx へ

Express project では supertest がよく使われます。

```js
await request(app)
  .post("/users")
  .send({ email: "a@example.com", name: "Ada" })
  .expect(201)
```

FastAPI では `TestClient` で同期 style の test を書けます。

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

test 自体を async にしたい場合は、`httpx.AsyncClient` と ASGI transport を使います。

重要なのは tool name ではなく test layer です。

- schema test：invalid input が 422 になるか。
- success path：status code、response field、output filtering が正しいか。
- authentication test：token なし、token 不正、permission 不足。
- dependency override：DB、current user、external service を差し替えられるか。
- error format：domain exception と unknown exception が正しく map されるか。
- concurrency test：async resource、lock、idempotency、race condition。
- OpenAPI snapshot：重要な API contract が意図せず変わっていないか。

## Dependency override：FastAPI testing の基本技

Express の test では mock service、mock middleware、app context 注入を使うことがあります。FastAPI では `app.dependency_overrides` が重要です。

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

fake token を毎回作るよりも、endpoint が current user に依存していることを直接 test できます。認証 dependency 自体の test と、認証済み user を使う endpoint の test を分けられるのも利点です。

## Project layout：小さく始めて、境界が見えたら分ける

小さな service なら、最初は次の構成で十分です。

```text
app/
  main.py
  schemas.py
  dependencies.py
  services.py
tests/
```

API が増えたら分けます。

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

最初から重い enterprise template を持ち込む必要はありません。良い project layout は、次の質問にすぐ答えられます。

- HTTP endpoint はどこにあるか。
- input / output schema はどこにあるか。
- authentication と authorization はどこにあるか。
- DB session はどこから来るか。
- business logic はどこにあるか。
- external service client はどこにあるか。
- background task はどこにあるか。
- configuration はどこから読むか。
- test で external dependency をどう差し替えるか。

これらに答えるために毎回 repository 全体を検索するなら、構造を見直す時期です。

## Package management：uv は Node 開発者にどう見えるか

Node project は `package.json` を中心に回ります。

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

現代的な Python project は `pyproject.toml` を中心に回ります。

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

よく使う uv command は次のとおりです。

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

team migration では次の約束を決めておくと安定します。

- `pyproject.toml` と `uv.lock` を commit する。
- `.venv/` は commit しない。
- CI は lockfile に従って dependency を同期する。
- local command は `uv run` 経由で実行する。
- tool config はできるだけ `pyproject.toml` に集める。
- Docker build は lockfile を使って cache しやすくする。

## Configuration：endpoint に環境変数を散らさない

Express では `process.env.X` を直接読むことがあります。Python でも `os.environ` は使えますが、中規模以上の service では configuration を集約します。

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

endpoint があちこちで environment variable を読む設計は避けます。endpoint は configuration object や service object に依存するほうが、test、deploy、local run が安定します。

## Security：application layer だけで完結しない

Express では helmet、cors、cookie-session、passport、rate-limit などを組み合わせることが多いです。FastAPI ecosystem にも対応する仕組みはありますが、security を library list としてだけ捉えないほうがよいです。

移行時には少なくとも次を確認します。

- CORS は必要な origin だけを許可しているか。
- proxy 後の scheme、host、client IP を正しく扱っているか。
- token の issuer、audience、expiry、signature algorithm を検証しているか。
- authorization が dependency または service layer で明示されているか。
- response model が sensitive field leakage を防いでいるか。
- error response が stack trace、SQL、internal URL を漏らしていないか。
- log に token、cookie、personal data、full prompt を記録していないか。
- file upload に size、type、scan policy があるか。
- API に rate limit、quota、gateway protection があるか。
- admin endpoint と debug document が production で管理されているか。
- dependency upgrade と vulnerability scan の流れがあるか。

authentication dependency は「誰が呼んでいるか」を解決します。しかし「その user がその操作をしてよいか」は、permission dependency や service policy が必要です。

```python
def require_admin(user: CurrentUser) -> User:
    if "admin" not in user.roles:
        raise HTTPException(status_code=403, detail="Admin role required")
    return user

AdminUser = Annotated[User, Depends(require_admin)]
```

## Deployment：local startup だけで満足しない

FastAPI は ASGI ecosystem の上で動きます。一般的な組み合わせは Uvicorn、Gunicorn + Uvicorn worker、container platform、reverse proxy、serverless platform です。

local development：

```bash
uv run fastapi dev app/main.py
```

production example：

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

container では次を確認します。

- lockfile に基づいて dependency を install する。
- `.env` を image に焼き込まない。
- health check endpoint を用意する。
- SIGTERM を処理し、request と lifespan cleanup の時間を確保する。
- worker 数を設定し、single process 前提にしない。
- proxy header と trusted hosts を正しく設定する。
- log は stdout / stderr に出す。
- readiness と liveness を分ける。

簡単な health check は次のようにできます。

```python
@router.get("/healthz", include_in_schema=False)
async def healthz():
    return {"status": "ok"}
```

readiness では database、cache、重要な external dependency を確認してもよいですが、必ず短い timeout を設定します。health check 自体が service を重くしてはいけません。

## Lifespan：散らばった startup script を置き換える

FastAPI の lifespan は、application startup / shutdown の resource 管理に使えます。

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

lifespan に向くもの：

- shared HTTP client の作成。
- connection pool の初期化。
- read-only model や rule の load。
- telemetry の開始。
- shutdown 時の resource release。

lifespan に向かないもの：

- request ごとに異なる user context。
- 長時間 blocking する batch process。
- startup を不安定にする non-critical remote call。
- migration tool が担当すべき database schema migration。

## AI / Agent API での追加注意点

FastAPI は model call、RAG、Agent、tool execution、data pipeline を包む API としてよく使われます。Express から移す場合、通常の CRUD API 以上に境界を意識します。

- model call は通常の HTTP timeout を超えることがある。
- streaming response は frontend、gateway、proxy と一緒に検証する必要がある。
- prompt、file、tool result は sensitive data を含みうる。
- Agent run は一つの request で完了させるより、job state として扱うほうがよいことが多い。
- external tool call には timeout、retry、isolation、audit が必要。
- vector search と rerank は latency distribution を観測する。
- large file parsing は object storage と background worker に逃がす。

短い task は同期的に返せます。

```python
@router.post("/classify", response_model=ClassificationOut)
async def classify(payload: ClassificationIn, user: CurrentUser):
    return await classify_service.run(payload, user=user)
```

長い task は job submission にします。

```python
@router.post("/agent-runs", response_model=AgentRunOut, status_code=202)
async def create_agent_run(payload: AgentRunCreate, user: CurrentUser):
    run = await agent_run_service.enqueue(payload, user=user)
    return run
```

そのうえで status query、cancel、log、result download を提供します。すべての Agent execution を数分待つ HTTP handler に詰め込むのは避けます。

## Migration steps：低リスクな境界から始める

安定した migration は、だいたい次の順序で進みます。

1. Express service の route、middleware、error format、authentication、DB connection、background task、deployment を棚卸しする。
2. dependency が少なく、境界が明確で、traffic を制御しやすい API を最初の移行対象にする。
3. FastAPI project skeleton、uv workflow、lint、test、CI を作る。
4. すぐ全 business logic を移すのではなく、先に schema と response contract を移す。
5. authentication と DB session を dependency として設計する。
6. router を実装し、URL、status code、error format は意図的に維持または versioning する。
7. integration test で Express の旧 behavior と照合する。
8. gateway または routing layer で少量 traffic を FastAPI に流す。
9. latency、error rate、log field、business metric を比較する。
10. migration scope を広げ、古い Express endpoint を段階的に retire する。

最初から最大で複雑な endpoint を選ばないほうがよいです。最初の migration の価値は、勇気を見せることではなく、チームの engineering pattern を検証することです。

## Migration and review checklist

### Routing and contract alignment

- [ ] Endpoint には明確な status code があり、request body は Pydantic input model を使う。
- [ ] Response には `response_model` または明確な response class があり、internal fields を漏らさない。
- [ ] Pagination、sort、filter parameter には範囲制限があり、本来宣言できる parameter を `Request` から手作業で読まない。
- [ ] Error response structure は client と合意され、field-level error を定位できる。
- [ ] OpenAPI は実際の contract を表し、internal-only endpoint を露出していない。
- [ ] 旧 API との差分は記録されている。

### Middleware and dependency migration

- [ ] Current user は dependency で注入し、authorization は frontend だけに依存しない。
- [ ] Dependency は business context を担い、test で override できる。
- [ ] DB session は `yield` dependency で管理する。
- [ ] Middleware は重すぎず、body を読んだり exception を握りつぶしたりしない。
- [ ] Request-scoped resource は background task に漏れない。
- [ ] Global shared resource は、本当に共有可能で thread / process safe なものだけにする。

### Async and exceptions

- [ ] `async def` 内に同期 blocking I/O や blocking library がない。
- [ ] 遅い external call には timeout があり、external service client に timeout configuration がある。
- [ ] Concurrent call は `gather` または `TaskGroup` を使い、exception handling がある。
- [ ] `create_task()` の task には lifecycle、error handling、cancellation policy がある。
- [ ] CPU heavy task は event loop 内で実行しない。
- [ ] Authentication failure、permission denied、not found、validation failure は正しい status code を返す。

### Pre-release review

- [ ] CORS configuration は最小化され、token validation は complete である。
- [ ] Log に sensitive field を残さず、production error response は stack trace を返さない。
- [ ] Health / readiness endpoint は明確で、deployment command は production 向けである。
- [ ] Docker / platform configuration は lockfile を使い、configuration は集約され environment variable 読み取りが散らばっていない。
- [ ] Dependency update と vulnerability scan の運用がある。
- [ ] Streaming response は proxy と browser で検証し、worker 数と connection pool size は負荷試験または見積もり済みである。
- [ ] Tests は 422、401、403、404、success path、dependency override をカバーしている。

## Common anti-patterns

### Anti-pattern 1：FastAPI を Express style で書く

```python
@router.post("/users")
async def create_user(request: Request):
    body = await request.json()
    user = await user_service.create(body)
    return JSONResponse(user)
```

より良い形：

```python
@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(payload: UserCreate):
    return await user_service.create(payload)
```

### Anti-pattern 2：すべてを middleware に入れる

middleware に大量の business branch、database query、permission check、exception conversion がある場合は要注意です。多くの business context は dependency に移すべきです。

### Anti-pattern 3：`dict` だけで model を書かない

`dict[str, Any]` は便利ですが、API contract を弱くします。任意 JSON proxy のような endpoint でない限り、できるだけ model 化します。

### Anti-pattern 4：重要な background task を `create_task()` で投げっぱなしにする

request 終了後に process が restart するかもしれません。task が exception を出すかもしれません。resource が閉じているかもしれません。重要 task は reliable queue、database state machine、platform job system に載せます。

### Anti-pattern 5：ORM model をそのまま response にする

ORM model は storage structure であって public API ではありません。public API には専用 response model を用意します。

### Anti-pattern 6：local で起動したら deployment 完了とみなす

FastAPI は local startup が簡単です。しかし production では worker、proxy、timeout、log、health check、resource cleanup、lockfile sync を検証する必要があります。

## FAQ

### FastAPI は Express より常に優れていますか？

いいえ。Express は成熟していて柔軟で、Node full-stack team には自然です。FastAPI の強みは型契約、runtime validation、自動 OpenAPI、Python の data / AI ecosystem との近さです。Python model、data processing、Agent toolchain、scientific computing と深くつながる service では、FastAPI の利点が大きくなります。

### FastAPI でも middleware で認証してよいですか？

できます。ただし常に最適とは限りません。全 request に共通で token を解釈するだけなら middleware でも可能です。しかし、匿名 route と認証 route が混在し、endpoint ごとに current user や permission が変わるなら dependency のほうが明確で、test もしやすいです。

### FastAPI の 422 は frontend にとって扱いづらくありませんか？

可能性はあります。Express project では validation error を 400 にしていることが多いです。FastAPI は、request は解釈できるが validation に失敗した場合に 422 を返します。既存 API standard があるなら validation exception handler を custom できます。ただし field-level error detail は残すのがおすすめです。

### Pydantic model は TypeScript interface と同じですか？

同じではありません。TypeScript interface は主に compile-time structure です。Pydantic model は runtime validation、parsing、serialization に参加します。TypeScript + Zod に近い役割だと考えると分かりやすいです。

### `async def` は必ず速いですか？

必ず速いわけではありません。`async def` は I/O concurrency に効きますが、sync blocking library を中に入れると event loop を止めます。performance は正しい I/O model、connection pool、timeout、worker configuration、business design から生まれます。

### uv は必須ですか？

必須ではありません。ただし uv は virtual environment、dependency resolution、lockfile、command execution を一つにまとめます。npm に慣れた team には、「手動 venv + pip freeze」よりも team convention を作りやすいです。

### Express service を一気に全部書き換えるべきですか？

通常は避けます。API boundary ごとに段階移行し、gateway や routing layer で canary / rollback できる形にするほうが安全です。一括 rewrite は language migration、framework migration、data model migration、deployment migration を同時に抱え込み、risk が大きくなります。

### FastAPI は既存 Node service と共存できますか？

できます。Node は frontend BFF、realtime gateway、既存 business API を担当し、FastAPI は AI、data、model、internal tool、新規 module を担当する構成はよくあります。HTTP、queue、event bus、shared authentication で統合できます。

### 最初に移行する endpoint はどう選びますか？

dependency が少なく、state が少なく、client が明確で、test を補いやすく、失敗時の影響が限定的な endpoint を選びます。payment、permission、batch processing、core transaction のような複雑な箇所を最初に選ばないほうがよいです。

## Express -> FastAPI migration playbook

ここまでの章では、概念の対応関係を整理しました。実際の移行では、さらに実行可能な playbook が必要です。この playbook の目的は、一気に全面 rewrite することではありません。contract を安定させ、module を移し、traffic を切り替え、最後に古い code を整理するための risk 分解です。

安定した移行は、だいたい八つの段階に分けられます。

1. 既存 Express behavior を棚卸しする。
2. compatibility target を決める。
3. FastAPI foundation を作る。
4. common schema と error model を移す。
5. 低リスク module を移す。
6. test comparison matrix を作る。
7. canary traffic と metrics を見る。
8. 旧 path を削除し、team convention を残す。

各段階には明確な artifact が必要です。artifact がない段階は、「だいたいできた」という雰囲気で終わりがちです。しかし production system は雰囲気では安定しません。

### Phase 1：既存 Express behavior の棚卸し

いきなり `app.get` を検索して翻訳し始めないほうがよいです。まず既存 service の behavior を一覧化します。

棚卸しするもの：

- public endpoint list。
- internal endpoint list。
- HTTP method。
- path pattern。
- query parameter。
- request body schema。
- response schema。
- success status code。
- error status code。
- error body format。
- authentication method。
- authorization rule。
- middleware order。
- route-level middleware。
- request id generation。
- log field。
- database transaction boundary。
- external service call。
- background job trigger。
- cache read / write。
- file upload / download behavior。
- streaming behavior。
- timeout behavior。
- retry behavior。
- rate limit behavior。
- caller list。
- monitoring dashboard。
- known production incident。

棚卸し結果は表にすると扱いやすくなります。

| Field | Example |
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

この表は migration acceptance の土台になります。これがないと、呼び出し側が依存している細かい behavior を見落としやすくなります。

### Phase 2：compatibility target を決める

FastAPI 移行は、旧 Express API と完全互換である必要があるとは限りません。ただし、何を維持し、何を変えてよいかは明確であるべきです。

決めること：

- URL を維持するか。
- HTTP method を維持するか。
- success status code を維持するか。
- error status code を維持するか。
- error body を維持するか。
- field naming を camelCase のままにするか。
- time format を維持するか。
- empty array、empty object、null の意味を維持するか。
- pagination parameter を維持するか。
- sort semantics を維持するか。
- default limit を維持するか。
- auth header を維持するか。
- idempotency key を維持するか。
- cache header を維持するか。
- streaming protocol を維持するか。
- OpenAPI を新しい contract として公開するか。

contract を変えるなら、versioning を明示します。「framework migration」の PR の中で、business API をこっそり変えないことが重要です。

### Phase 3：FastAPI foundation を作る

最初の business module を移す前に、foundation を用意します。

最低限必要なもの：

- `pyproject.toml`。
- `uv.lock`。
- app factory。
- router registration convention。
- settings management。
- logging initialization。
- request id middleware。
- CORS configuration。
- exception handler。
- health endpoint。
- pytest base configuration。
- ruff などの lint。
- CI check。
- Dockerfile または platform start command。
- local run command。
- typed dependency pattern。

これらを最初の business PR に埋め込まないほうがよいです。business migration と foundation setup が混ざると、code review の焦点がぼやけます。

### Phase 4：common schema と error model を移す

まず移すべきなのは、すべての business logic ではなく API boundary です。

先に定義したいもの：

- `ErrorOut`。
- `ValidationErrorOut`。
- `PageOut[T]` または pagination response model。
- `HealthOut`。
- common ID type。
- timestamp serialization convention。
- snake_case と camelCase の方針。
- domain error base class。
- HTTP exception mapping。

simple error model：

```python
from pydantic import BaseModel, Field

class ErrorOut(BaseModel):
    code: str
    message: str
    request_id: str | None = None
    details: dict[str, object] = Field(default_factory=dict)
```

旧 Express API が camelCase、Python 内部が snake_case なら、Pydantic alias strategy や明示的な field alias を使います。大事なのは、naming strategy を各 handler に散らさないことです。

### Phase 5：低リスク module を移す

最初の module は、次の条件を満たすものが向きます。

- request body が単純。
- database write が少ない。
- permission が複雑でない。
- payment や billing への影響がない。
- long-running task がない。
- caller が少ない。
- test がある、または補いやすい。
- monitoring metric が明確。
- canary できる。
- rollback しやすい。

最初に向くもの：

- health。
- metadata。
- read-only catalog。
- user preference read。
- simple search。
- internal status query。
- public configuration query。

最初に避けたいもの：

- payment。
- deletion。
- permission change。
- data migration。
- large file upload。
- long task scheduling。
- core transaction。
- multi-service transaction。

### Phase 6：test comparison matrix を作る

FastAPI 側の test が通るだけでは十分ではありません。新旧 behavior の差分が管理されていることを示す必要があります。

matrix の例：

| Scenario | Express expected | FastAPI expected | Must match |
| --- | --- | --- | --- |
| normal create | 201 + body | 201 + body | yes |
| missing required field | 400 or 422 | target format | by standard |
| missing token | 401 | 401 | yes |
| insufficient permission | 403 | 403 | yes |
| not found | 404 | 404 | yes |
| duplicate create | 409 | 409 | yes |
| upstream timeout | 504 or 503 | target format | yes |
| invalid query | 400 or 422 | target format | by standard |
| large payload | 413 | 413 | yes |
| unknown exception | 500 | 500 | yes |

matrix の価値は、framework default behavior を team が受け入れる behavior に変えることです。例えば FastAPI の default validation error は 422 です。旧 API が 400 なら、400 を維持するのか、新 version の差分として受け入れるのかを決めます。

### Phase 7：canary と metrics

移行が終わっただけで、全 traffic に切り替えてよいわけではありません。少なくとも次の metrics を見ます。

- request count。
- success rate。
- 4xx distribution。
- 5xx distribution。
- p50 latency。
- p95 latency。
- p99 latency。
- upstream timeout。
- downstream timeout。
- database connection pool usage。
- event loop blocking signal。
- worker restart count。
- memory usage。
- CPU usage。
- response body size。
- error code distribution。
- business conversion metric。
- caller alert。

canary strategy：

- header で切り替える。
- user id hash で切り替える。
- tenant ごとに切り替える。
- endpoint ごとに切り替える。
- internal caller ごとに切り替える。
- shadow read から始める。

HTTP 200 だけを見ないことが重要です。API は成功していても、field が減った、sort が変わった、pagination default が変わった、error code が変わった、という理由で caller は壊れます。

### Phase 8：旧 path を整理し convention を残す

FastAPI path が安定したら、古い Express code を整理します。そうしないと、team は二つの source of truth を長期保守することになります。

整理するもの：

- old route。
- old middleware。
- old schema。
- old test。
- old documentation。
- old dashboard。
- old alert。
- old feature flag。
- old gateway rule。
- old environment variable。
- old runbook。

残すもの：

- new endpoint template。
- dependency template。
- error code standard。
- test template。
- deployment template。
- performance triage flow。
- code review checklist。

## Modular migration order

Express から FastAPI への移行で危ないのは、file order で翻訳することです。より安全なのは、module risk と dependency direction に沿って移すことです。

推奨順序：

1. runtime foundation。
2. observability foundation。
3. error model。
4. configuration model。
5. stateless read-only API。
6. authentication dependency。
7. authorization dependency。
8. database session dependency。
9. simple write API。
10. idempotent write API。
11. file API。
12. streaming API。
13. background job API。
14. high-risk core API。

### Runtime foundation

runtime foundation には app factory、router registration、settings、logging、health check、local command が含まれます。この段階では複雑な business logic を入れません。

acceptance criteria：

- local startup ができる。
- test が実行できる。
- health endpoint にアクセスできる。
- OpenAPI が生成できる。
- log に request id が入る。
- unknown exception が stack trace を返さない。

### Observability foundation

observability は business migration より先に必要です。これがないと、移行後の問題を切り分けられません。

最低限ほしいもの：

- structured log。
- request id。
- trace id。
- endpoint name。
- status code。
- latency。
- error code。
- user id または tenant id の safe summary。
- downstream service name。
- downstream latency。

記録しないもの：

- token。
- cookie。
- password。
- full prompt。
- uploaded file content。
- personal sensitive field。
- internal secret。

### Error model

error model は business module より先に決めます。そうしないと、router ごとに独自 error format が生まれます。

統一したい field：

- `code`：machine-readable。
- `message`：human-readable。
- `details`：field または context。
- `request_id`：調査用 correlation。

common error code：

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

### Configuration model

configuration migration は早めに行います。Express project では `process.env` が散らばりがちです。

整理するもの：

- service name。
- environment name。
- database URL。
- Redis URL。
- JWT issuer。
- JWT audience。
- CORS origin。
- external service base URL。
- timeout。
- retry count。
- feature flag。
- log level。
- worker configuration。

FastAPI project では settings object 経由で読み、endpoint で直接 environment variable を読む形を避けます。

### Stateless read-only API

この種の API は router、schema、response model、error format の検証に向きます。

例：

- `GET /healthz`。
- `GET /version`。
- `GET /catalog/items`。
- `GET /settings/public`。
- 複雑な permission を含まない `GET /users/{id}`。

acceptance focus：

- path parameter validation。
- query parameter default。
- response model filtering。
- 404 behavior。
- OpenAPI document。

### Authentication dependency

authentication は独立して移行し、独立して test します。各 endpoint に認証 logic を散らさないようにします。

cover するもの：

- token missing。
- malformed token。
- expired token。
- issuer mismatch。
- audience mismatch。
- invalid signature。
- user not found。
- user disabled。
- anonymous access allowed。
- optional authentication。

### Authorization dependency

authentication は「誰か」を答え、authorization は「できるか」を答えます。

authorization dependency は三つの粒度で設計できます。

- role-based。
- permission-based。
- resource-based。

resource-based permission は database query と絡みやすいです。各 handler に permission branch を手書きするのではなく、dependency または service policy に寄せます。

### Database session dependency

database session は migration の重要な境界です。Express project では global pool、request middleware、service 内部生成などが混ざっていることがあります。FastAPI project では session lifecycle を明確にします。

決めること：

- request ごとに session を作るか。
- operation ごとに session を作るか。
- read / write split をするか。
- transaction boundary は endpoint、service、repository のどこか。
- commit は誰が行うか。
- rollback は誰が行うか。
- session を background task に渡してよいか。
- test で session をどう差し替えるか。

### Simple write API

simple write API は request body、transaction、conflict error、response model の検証に向きます。

候補：

- user preference 作成。
- profile の text field 更新。
- internal note 作成。
- lightweight configuration submit。

acceptance focus：

- 201 / 200 / 204 が contract と一致するか。
- duplicate が 409 になるか。
- validation が安定しているか。
- transaction が rollback されるか。
- response が internal field を filter するか。

### Idempotent write API

idempotent write API は simple write API より production complexity に近いです。

扱うもの：

- idempotency key。
- duplicate request。
- partial success。
- client timeout 後の retry。
- downstream duplicate call。
- database unique constraint。
- same result を返すか conflict を返すか。

FastAPI は idempotency を自動では解決しません。framework は HTTP boundary を提供するだけで、idempotency semantics は business layer で設計します。

### File API

file upload / download は、普通の JSON API と分けて移行します。

check points：

- file size limit。
- content type。
- filename safety。
- virus scan または content scan。
- temporary file cleanup。
- object storage permission。
- download authorization。
- range request。
- CDN header。
- timeout。
- backpressure。

### Streaming API

Express service に SSE、chunked response、AI token streaming があるなら、end-to-end で検証します。

check points：

- client が chunk を逐次受け取れるか。
- reverse proxy が buffer していないか。
- gateway timeout が足りるか。
- heartbeat があるか。
- client disconnect 時に server task が cancel されるか。
- error をどう伝えるか。
- stream end state を log できるか。

### Background job API

FastAPI の `BackgroundTasks` は軽い後処理向けであり、reliable queue ではありません。

向いているもの：

- request 完了後の audit log。
- non-critical notification。
- lightweight async cleanup。

向かないもの：

- payment。
- long-running AI inference。
- large file parsing。
- retry 必須の email sending。
- critical data synchronization。
- cross-service transaction。

重要 task は queue、scheduler、worker、platform job system に載せます。

## Test migration matrix

test migration は、Express から FastAPI への behavior difference を見ます。code coverage だけでは足りません。

### HTTP contract tests

| Test item | Express risk | FastAPI risk | Recommendation |
| --- | --- | --- | --- |
| path parameter | string default | stricter type validation | decide compatibility |
| query parameter | loose manual conversion | automatic 422 | fix error format |
| request body | plain object after parser | Pydantic validation | cover model boundary |
| response body | extra fields may leak | response_model can filter | add leakage test |
| status code | handwritten in handler | declared in decorator | test each status |
| headers | written by middleware | response / middleware | verify key headers |
| cookies | res.cookie | Response set_cookie | verify attributes |

### Authentication and authorization tests

| Scenario | Why it matters |
| --- | --- |
| no token | prevent accidental anonymous access |
| empty token | avoid parse error becoming 500 |
| expired token | verify 401 |
| wrong issuer | prevent cross-environment token use |
| wrong audience | prevent cross-service token use |
| missing role | verify 403 |
| resource owner mismatch | verify resource policy |
| optional auth endpoint | verify anonymous and signed-in paths |

### Validation tests

各 input model に boundary test を用意します。

- missing field。
- field is null。
- wrong field type。
- empty string。
- too long string。
- number below minimum。
- number above maximum。
- invalid enum。
- invalid email。
- invalid URL。
- nested object missing field。
- empty array。
- too long array。
- unknown field。

旧 Express API が unknown field を受け入れ、新 FastAPI model が拒否する場合は、version note に差分を書きます。

### Error handling tests

error handling は 404 だけを見ればよいわけではありません。

cover したいもの：

- 400 or 422 validation。
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

各 error で確認するもの：

- status code。
- `code`。
- `message`。
- `details`。
- `request_id`。
- log record。
- sensitive information がないこと。

### Dependency override tests

FastAPI test では dependency override を積極的に使います。

override に向くもの：

- current user。
- DB session。
- settings。
- external HTTP client。
- clock。
- id generator。
- feature flag。
- queue producer。
- object storage client。

各 test で real external service を呼ばないようにします。migration で必要なのは、stable、fast、diagnosable な feedback です。

### Concurrency tests

Express と FastAPI では concurrency model が違うため、移行後に concurrency test を補います。

見るもの：

- same resource concurrent update。
- idempotency key concurrent submit。
- database unique constraint conflict。
- connection pool exhaustion。
- downstream timeout。
- request cancellation。
- streaming client disconnect。
- background task exception。

concurrency bug は single request test ではほとんど見つかりません。

## Error handling deep dive

error handling は `raise HTTPException` だけでは終わりません。production system には多くの境界があります。

### すべてを 500 にしない

error にはそれぞれ意味があります。

- input error：400 or 422。
- unauthenticated：401。
- authenticated but not allowed：403。
- resource missing：404。
- state conflict：409。
- payload too large：413。
- unsupported format：415。
- rate limited：429。
- upstream bad response：502。
- service unavailable：503。
- upstream timeout：504。
- unknown error：500。

すべてが 500 だと、caller は正しく分岐できず、monitoring も主原因を特定しにくくなります。

### Domain exception は FastAPI に直接依存させない

service layer は domain exception を投げてよいですが、FastAPI を import しないほうが再利用しやすいです。

明確な形：

```python
class UserNotFoundError(Exception):
    pass

class DuplicateEmailError(Exception):
    pass
```

HTTP layer で map します。

```python
try:
    return await service.create_user(payload)
except DuplicateEmailError:
    raise HTTPException(status_code=409, detail="Email already exists")
```

こうすると service layer は CLI、worker、test、別 interface からも使えます。

### Error code は安定させる

`message` は読みやすさのために調整してもよいですが、`code` はできるだけ安定させます。

stable error code の利点：

- frontend が localization できる。
- caller が branch handling できる。
- log aggregation がしやすい。
- alert を code ごとに作れる。
- documentation で長期参照できる。

`code` を自然文の sentence にしないほうがよいです。

### Validation error compatibility

FastAPI default validation error は詳細ですが、旧 Express API と format が違うことがあります。

選択肢：

- FastAPI default format を新 contract として受け入れる。
- team error format に wrap しつつ field path を残す。
- old endpoint は old format、新 endpoint は new format にする。
- gateway layer で error format を変換する。

大事なのは方針を明確にすることです。router ごとに決めないようにします。

## Dependency injection boundaries

dependency は強力ですが、濫用もしやすいです。良い dependency は endpoint を読みやすくします。複雑な business logic を隠すものではありません。

### Dependency に向くもの

- current user。
- current tenant。
- permission policy。
- database session。
- request-scoped transaction。
- settings。
- clock。
- request id。
- external client。
- feature flag reader。
- pagination parameter。
- locale。

### Dependency に向かないもの

- large business workflow。
- core state を変更する command。
- long-running task。
- test しづらい global mutable state。
- endpoint-specific complex branch。
- transaction script として明示したい operation。

dependency 名が `process_order_and_send_email` のように見えるなら、それは dependency ではなく business service である可能性が高いです。

### Dependency naming

良い naming：

- `get_current_user`。
- `require_admin`。
- `get_session`。
- `get_settings`。
- `get_billing_client`。
- `pagination_params`。

怪しい naming：

- `do_auth_stuff`。
- `handle_user`。
- `run_before_request`。
- `common_logic`。
- `prepare_everything`。

名前は、その dependency が何を提供するのか、どの前提を保証するのかを表すべきです。

### Dependency granularity

細かすぎると signature が散らかり、粗すぎると dependency が隠れます。

よく使う組み合わせは typed alias にできます。

```python
CurrentUser = Annotated[User, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_session)]
AdminUser = Annotated[User, Depends(require_admin)]
```

これにより endpoint は読みやすく、`Depends(...)` の noise も減ります。

## Performance triage playbook

FastAPI の performance issue は、framework 本体よりも I/O、serialization、connection pool、worker、downstream dependency、誤った async usage にあります。

### まず遅い場所を分ける

いきなり worker 数を変えないほうがよいです。latency を分解します。

- ingress queue time。
- middleware time。
- dependency time。
- request body parse time。
- validation time。
- service time。
- database time。
- external HTTP time。
- model inference time。
- response serialization time。
- response body transfer time。

各段階は log、trace、manual timing で切り分けられます。

### Common slow causes

- `async def` 内の sync I/O。
- database query に index がない。
- N+1 query。
- response_model が大きすぎる。
- huge JSON response。
- Pydantic model が深すぎる。
- connection pool が小さい。
- worker が少ない。
- downstream service が遅い。
- DNS または TLS handshake が毎 request 起きる。
- HTTP client を毎 request 作っている。
- synchronous log writing。
- large file を memory に読み込む。
- streaming が proxy に buffer される。

### Triage order

推奨順序：

1. slow endpoint と percentile を確認する。
2. 4xx / 5xx が同時に上がっていないか見る。
3. worker CPU と memory を見る。
4. event loop blocking を見る。
5. database connection pool を見る。
6. slow query を見る。
7. downstream service latency を見る。
8. response size を見る。
9. client を毎 request 作っていないか見る。
10. trace で single request path を復元する。

### Fix strategies

原因ごとの修正：

- sync I/O：async client に変える、thread pool に逃がす、または sync endpoint にする。
- DB slow：index、query rewrite、N+1 削減、pagination。
- downstream slow：timeout、retry、circuit breaker、cache。
- huge JSON：pagination、field trimming、compression、streaming。
- CPU heavy：worker、task queue、batching、cache。
- client recreation：lifespan で shared client を作る。
- heavy validation：schema を単純化し、深い nesting と巨大 object を避ける。

## Deployment runbook

FastAPI deployment では、application、ASGI server、container、reverse proxy、platform を一体で見ます。

### Local command と production command を分ける

development command：

```bash
uv run fastapi dev app/main.py
```

production command：

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

development reload command を production に持ち込まないようにします。

### Worker configuration

worker 数は多ければよいわけではありません。

考慮するもの：

- CPU core count。
- I/O wait ratio。
- DB connection pool limit。
- downstream service limit。
- memory per worker。
- cold start time。
- platform autoscaling behavior。

各 worker が database connection pool を持つ場合、worker 数を増やすと database connection pressure も増えます。

### Proxy header

production では reverse proxy の後ろで動くことが多いです。確認すること：

- scheme が正しいか。
- host が正しいか。
- client IP が trusted か。
- redirect URL が正しいか。
- HTTPS 判定が正しいか。
- trusted host が設定されているか。

proxy header が間違っていると、URL 生成、security 判断、log が壊れます。

### Health and readiness

health と readiness は別物です。

- health：process が生きている。
- readiness：traffic を受けられる。

readiness では database や key dependency を見ることがありますが、短い timeout が必須です。health check 自体を重い request にしないようにします。

### Release checklist

- [ ] image は lockfile から build している。
- [ ] `.env` を image に含めていない。
- [ ] start command は production command。
- [ ] health endpoint にアクセスできる。
- [ ] readiness endpoint にアクセスできる。
- [ ] log に request id がある。
- [ ] error が stack trace を返さない。
- [ ] CORS が production domain と一致する。
- [ ] worker 数が設定されている。
- [ ] connection pool size が設定されている。
- [ ] timeout が設定されている。
- [ ] reverse proxy が streaming を buffer しない。
- [ ] rollback path が明確。

## API compatibility details

Express から FastAPI への互換性問題は、大きな機能より小さな意味の差に出ます。

### Field naming

Node API は camelCase、Python は snake_case が多いです。公開 API を camelCase のままにするかを決めます。

Option 1：public API は camelCase、Python 内部は snake_case。

Option 2：new version API は snake_case。

Option 3：internal API だけ snake_case、external API は camelCase。

同じ endpoint で二つの naming style を混ぜないようにします。

### null と missing field

JavaScript には `undefined` と `null` の違いがありますが、JSON には `undefined` がありません。Python の `None` は `null` になります。

決めること：

- field missing を許すか。
- field null を許すか。
- update API で null は clear なのか ignore なのか。
- response で empty value を返すか。

### Date and time

time field では次を決めます。

- ISO 8601 を使うか。
- timezone を含めるか。
- UTC に統一するか。
- milliseconds を保持するか。
- old API が Unix timestamp を返しているか。

time format は公開すると簡単には変えられません。

### Numeric precision

JavaScript number は double precision float です。Python には int、float、Decimal があります。money、credit、quota、token billing では float error を避けます。

推奨：

- money は smallest unit の integer または Decimal。
- public API で unit を明示する。
- money を float で表さない。

### Empty array and pagination

pagination compatibility で見ること：

- empty result は `[]` か `null` か。
- total は filter 後の件数か。
- page は 0 始まりか 1 始まりか。
- default limit。
- max limit。
- sort stability。
- cursor は再利用できるか。

## Database migration boundaries

framework migration と database schema migration を同時に行う必要はありません。混ぜると risk が大きくなります。

### Database を維持する

第一段階では FastAPI が既存 database schema を使う形にできます。これにより risk を HTTP layer と service layer に限定できます。

利点：

- rollback が簡単。
- data consistency risk が低い。
- Express と並行稼働しやすい。
- behavior comparison がしやすい。

欠点：

- Python model が旧 naming に合わせる必要がある。
- old schema の問題は残る。
- 一部の constraint はすぐ改善できない。

### Dual write は慎重に扱う

migration が new / old system の dual write を含むなら、次を設計します。

- write order。
- idempotency key。
- failure compensation。
- reconciliation job。
- data difference alert。
- rollback strategy。
- replay strategy。

dual write は普通の refactor ではなく、distributed systems problem です。

### Repository boundary

endpoint が複雑な SQL を直接書く形は避けます。推奨 boundary：

```text
api route -> service -> repository -> database
```

小さな project では layer を減らしてもよいですが、database access の場所は明確にします。test と後続 migration が楽になります。

## Documentation and contract governance

FastAPI は OpenAPI を自動生成します。しかし自動生成と governance は別物です。

governance するもの：

- operation id。
- tag。
- summary。
- description。
- deprecated marker。
- response examples。
- error examples。
- auth scheme。
- versioning。
- internal endpoint hidden flag。

public API document は次に答えられるべきです。

- この endpoint は何をするか。
- 誰が呼べるか。
- request field は何か。
- response field は何か。
- どんな error がありうるか。
- idempotent か。
- pagination はあるか。
- rate limit はあるか。
- compatibility note はあるか。

## Extended code review question bank

次の質問は migration PR review にそのまま使えます。

### Router layer

- path は既存 API naming と合っているか。
- method は正しいか。
- status code は decorator で宣言されているか。
- tags は妥当か。
- operation id は安定しているか。
- summary は business action を説明しているか。
- endpoint が長すぎないか。
- endpoint が database detail を含んでいないか。
- endpoint が external service retry detail を含んでいないか。
- endpoint が internal object を返していないか。

### Schema layer

- input と output は分かれているか。
- optional field は本当に optional か。
- default value は旧 behavior と一致するか。
- enum は旧 value を cover しているか。
- string length limit はあるか。
- array length limit はあるか。
- Decimal / money は正しく扱われているか。
- time field は timezone を持つか。
- unknown field policy は明確か。
- alias は public API と一致するか。

### Dependency layer

- dependency は resource または precondition だけを提供しているか。
- dependency が business workflow を隠していないか。
- dependency に timeout があるか。
- dependency は test override できるか。
- dependency が無関係な endpoint で実行されないか。
- `yield` dependency は resource を閉じているか。
- dependency exception は正しい status code に map されるか。
- dependency naming は明確か。

### Service layer

- service は FastAPI に依存していないか。
- service は worker からも再利用できるか。
- transaction boundary は明確か。
- domain exception は明確か。
- external call に timeout があるか。
- retry に上限があるか。
- idempotency は test されているか。
- log に十分な context があるか。

### Test layer

- old behavior を cover しているか。
- validation を cover しているか。
- auth を cover しているか。
- permission を cover しているか。
- not found を cover しているか。
- conflict を cover しているか。
- upstream timeout を cover しているか。
- response field leakage を検証しているか。
- dependency override を使っているか。
- real external service を避けているか。

## Reference migration template

次の template は、router、schema、dependency、error、service boundary をまとめた例です。

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

唯一の正解ではありませんが、目指す形は見えます。HTTP contract が明確で、input / output が明確で、dependency が明確で、error semantics が明確です。

## Closing：移行の目的は境界を明確にすること

Express から FastAPI への移行は、「軽量 framework から別の軽量 framework へ」の移動ではありません。object-driven な request handling から contract-driven な API boundary へ、runtime convention から type、model、dependency graph へ、「handler に何でも書く」から HTTP layer、business layer、resource layer、deployment layer の境界を明確にする方向への移行です。

Express で培った middleware、router、service、test、deploy の経験は捨てなくてよいです。ただし、それぞれを Python / ASGI / Pydantic / dependency の世界でどこに置くかを再設計する必要があります。そこを丁寧にやると、FastAPI は AI、data、Agent、cloud operation に強い、読みやすく運用しやすい API 基盤になります。

## 参考リンク

- [FastAPI Dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [FastAPI Middleware](https://fastapi.tiangolo.com/tutorial/middleware/)
- [FastAPI Bigger Applications](https://fastapi.tiangolo.com/tutorial/bigger-applications/)
- [FastAPI Handling Errors](https://fastapi.tiangolo.com/tutorial/handling-errors/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Python asyncio](https://docs.python.org/3/library/asyncio.html)
- [uv: Working on projects](https://docs.astral.sh/uv/guides/projects/)
- [uv 実践ガイド](./uv-python-project-workflow/)
