---
title: "uv 工程实践：把 Python 依赖、环境、项目和命令统一起来"
date: 2026-05-13
category: engineering
description: "从项目初始化、依赖锁定、虚拟环境、脚本运行、一次性工具、CI 和 FastAPI 服务模板出发，理解 uv 为什么正在成为 Python 工程的默认入口。"
difficulty: intermediate
plainSummary: "uv 不只是更快的 pip，而是把 Python 版本、项目依赖、lockfile、虚拟环境、命令执行、工具运行和 CI 同步收束到一个可复现的团队工作流里。"
tags:
  - "Python"
  - "Developer Tools"
  - "FastAPI"
lang: zh
coverImage: "/images/engineering/practice/uv-python-toolchain-cover.png"
draft: false
---

# uv 工程实践：把 Python 依赖、环境、项目和命令统一起来

> 时效边界：本文核验于 2026-05-13。uv 发展很快，命令细节、lockfile 行为和工具安装方式请以官方文档为准。

如果说 FastAPI 解决的是“如何用 Python 写现代 API 服务”，那 uv 解决的是更底层的问题：团队如何把 Python 项目跑起来、锁住、同步、测试、上 CI，并让本地开发者和构建机得到同一套环境。

本文面向三类读者：正在维护 Python / FastAPI 服务的开发者、从 Node.js 工作流迁移过来的团队，以及需要把 Python 项目接入 CI、容器和自动化平台的工程负责人。

过去 Python 工程最让前端和 Node.js 开发者困惑的地方，不是语言本身，而是环境管理。到底用 `pip`、`venv`、`pip-tools`、Poetry、Pipenv、conda，还是系统 Python？依赖写在 `requirements.txt`、`setup.py`、`pyproject.toml` 还是 notebook 里？命令用全局工具、本地虚拟环境，还是 CI 里重新装一遍？

uv 的价值在于：它不只是“更快的 pip”，而是把 Python 版本、项目、依赖、虚拟环境、lockfile、命令执行和一次性工具收束成一个统一入口。

![uv 工作流模块可视化](/images/engineering/practice/uv-workflow-modules-visual.png)

## Python 项目管理为什么长期很痛

Node.js 开发者习惯了一个基本事实：进入项目后看 `package.json` 和 lockfile，大概就知道怎么安装、怎么运行、怎么测试。Python 以前没有这么统一。

常见混乱包括：

- 有人用系统 Python，有人用 pyenv，有人用 conda；
- 依赖有的在 `requirements.txt`，有的在 `pyproject.toml`；
- CI 里重新 `pip install -r requirements.txt`，但本地其实装了更多包；
- 开发工具装在全局，比如 `black`、`ruff`、`pytest`，版本和项目脱节；
- 开发者不知道 `.venv` 要不要提交；
- notebook、脚本、服务各自有一套安装方式。

这些问题单个看都不大，但合在一起会拖慢团队。环境问题会伪装成代码问题，CI 失败会变成“我本地可以”，成员导入成本会消耗很多隐性时间。

uv 不是魔法，但它把这些问题变成一条更清楚的路径：项目定义在 `pyproject.toml`，依赖锁在 `uv.lock`，运行环境在 `.venv`，命令通过 `uv run`，一次性工具通过 `uvx` 或 `uv tool`。

## uv 的六个核心概念

| 概念 | 作用 | 常见命令 |
| --- | --- | --- |
| Python versions | 安装和选择 Python 版本 | `uv python install` |
| Project | 初始化和管理项目 | `uv init` |
| Dependencies | 增删项目依赖 | `uv add` / `uv remove` |
| Lockfile | 固定依赖解析结果 | `uv lock` |
| Sync | 根据 lockfile 同步环境 | `uv sync` |
| Run / Tool | 在环境中运行命令或工具 | `uv run` / `uvx` |

这六件事串起来，才是 uv 的完整价值。只把 uv 当成 `pip install` 的加速器，会错过它最重要的团队协作能力。

## 最小项目流

一个 FastAPI demo 可以这样开始：

```bash
uv init fastapi-demo
cd fastapi-demo
uv add "fastapi[standard]"
uv run fastapi dev
```

加测试和 lint：

```bash
uv add --dev pytest ruff
uv run pytest
uv run ruff check .
```

锁定和同步：

```bash
uv lock
uv sync --locked
```

这套命令的好处是，开发者不需要先理解很多历史工具。项目里有 `pyproject.toml` 和 `uv.lock`，本地执行 `uv sync`，再用 `uv run` 跑命令，就能进入同一个工作流。

![uv 可复现流水线可视化](/images/engineering/practice/uv-reproducible-pipeline-visual.png)

## 团队协作规则

团队采用 uv 后，建议把规则写得非常明确。

| 文件 / 目录 | 是否提交 | 原因 |
| --- | --- | --- |
| `pyproject.toml` | 提交 | 项目元数据和依赖声明 |
| `uv.lock` | 应用项目提交 | 固定依赖解析，保证可复现 |
| `.venv/` | 不提交 | 本地生成环境 |
| `.python-version` | 视团队策略提交 | 固定项目 Python 版本 |
| `requirements.txt` | 迁移期可保留 | 逐步从旧流程过渡 |

应用项目通常应该提交 `uv.lock`。库项目是否提交 lockfile 可以单独讨论，因为库往往需要测试依赖范围，而不是只锁住一个应用环境。

CI 里建议用 locked sync：

```bash
uv sync --locked
uv run pytest
uv run ruff check .
```

这样 CI 不会在没有意识到的情况下重新解析出一套不同依赖。

还要理解一个容易被忽略的细节：`uv run` 会在执行命令前自动 lock 和 sync，保证环境跟项目元数据一致。这对本地开发很方便，但在 CI 或发布镜像里，通常希望锁文件不被隐式更新。

因此可以把几种模式区分开：

| 模式 | 命令 | 适合场景 |
| --- | --- | --- |
| 自动更新环境 | `uv run pytest` | 本地开发，允许 uv 自动同步环境 |
| 锁文件过期时报错 | `uv run --locked pytest` | CI、pre-push、发布检查 |
| 不检查 lockfile 是否过期 | `uv run --frozen pytest` | 已确认 lockfile 的可重复执行环境 |
| 不同步环境 | `uv run --no-sync pytest` | 已提前 sync，且想避免重复环境检查的高级场景 |

团队文档里不要只写“用 uv 跑测试”。更好的写法是说明不同入口的严格程度：开发者可以用默认 `uv run`，CI 和发布检查应该使用 `--locked` 或先执行 `uv sync --locked`。

## FastAPI 服务模板

uv 很适合做 FastAPI 项目底座。一个最小服务结构：

```text
app/
  main.py
tests/
pyproject.toml
uv.lock
```

`app/main.py`：

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health():
    return {"ok": True}
```

常用命令：

```bash
uv add "fastapi[standard]"
uv add --dev pytest ruff
uv run fastapi dev
uv run pytest
uv run ruff check .
```

这给团队一个清楚入口：开发服务、跑测试、跑 lint、CI 都不需要绕开 uv。

## 一次性工具、全局工具和脚本

uv 还有一个很实用的能力：处理工具。

一次性运行工具：

```bash
uvx ruff check .
```

在当前项目运行命令：

```bash
uv run pytest
```

临时带一个依赖运行脚本：

```bash
uv run --with httpx python scripts/smoke_test.py
```

这能减少“为了跑一个工具全局安装一堆东西”的问题。对于团队来说，工具版本越靠近项目，结果越可复现。

## 脚本场景：PEP 723 的价值

Python 还有很多单文件脚本场景。PEP 723 定义了在 Python 脚本里写 inline metadata 的格式，uv 支持这类脚本工作流。它适合小工具、一次性检查、数据修复和 smoke test。

这类脚本的价值是：脚本自己说明需要什么依赖，而不是靠 README 口头提醒。

但团队里要注意边界：长期存在的服务代码仍然应该进入项目依赖；一次性脚本才适合用 inline metadata 或 `uv run --with`。

## Docker 和 CI 思路

Docker 里用 uv 的原则和 Node.js 很像：先复制依赖声明和 lockfile，同步依赖，再复制业务代码，这样可以利用缓存。

伪结构如下：

```dockerfile
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev
COPY app ./app
CMD ["uv", "run", "fastapi", "run", "app/main.py"]
```

真实 Dockerfile 需要根据镜像、用户权限、是否安装 uv、是否需要编译依赖来调整。重点不是背这一段，而是记住：`pyproject.toml` + `uv.lock` 是构建缓存和环境一致性的核心输入。

## 从旧流程迁移到 uv

![uv 迁移与工具链收敛可视化](/images/engineering/practice/uv-migration-consolidation-visual.png)

不要一口气把所有 Python 项目都改成 uv。稳妥迁移可以分三步。

第一步，只在新项目使用 uv。新 FastAPI 服务、新 Agent 工具、新数据脚本从 `uv init` 开始。

第二步，把依赖声明迁到 `pyproject.toml`，生成并提交 `uv.lock`。CI 改成 `uv sync --locked` + `uv run ...`。

第三步，清理旧入口。把 README、Makefile、CI、Dockerfile 里散落的 `pip install`、全局工具调用、手工 venv 步骤逐步收敛。

迁移期可以保留 `requirements.txt`，但要说明哪个是权威来源。最糟糕的是两套依赖文件同时存在，却没有人知道谁说了算。

## 风险与边界

uv 很强，但不要把它写成“替代所有 Python 环境问题”的绝对答案。

| 场景 | 需要注意 |
| --- | --- |
| 企业内网 | package index、proxy、credential、cache 配置 |
| 科学计算 / GPU | conda、系统库、CUDA 依赖可能仍有特殊路径 |
| 多平台团队 | macOS / Linux / Windows 的锁定和 wheel 差异 |
| 库项目 | lockfile 策略要和应用项目区分 |
| 旧项目迁移 | 避免一次性重写 CI、Docker、部署脚本 |
| 工具快速演进 | 命令细节要以官方文档为准 |

更准确的说法是：uv 正在成为 Python 工程的一个强有力默认入口，尤其适合 Web API、AI 应用、Agent 工具、数据脚本和 CI 工作流。但特殊科学计算环境、GPU 环境、企业镜像源仍要结合实际情况设计。

## 把 uv 设为团队默认入口

uv 最适合承担“项目入口”的角色。

入口不是指所有命令都必须直接写 uv。

入口的意思是：当一个开发者、CI job、部署镜像或自动化 Agent 进入仓库时，它们先看同一组文件，执行同一组动作，并得到同一类结果。

这组文件通常是：

- `pyproject.toml`：声明项目元数据、运行依赖、开发依赖和工具配置；
- `uv.lock`：记录一次完整依赖解析的结果；
- `.python-version`：在需要时固定 Python 解释器版本；
- `README.md` 或 `CONTRIBUTING.md`：只保留最少的启动命令；
- `Makefile`、`justfile` 或 `package.json` scripts：如果团队已有命令封装，也应该在内部调用 uv。

这组动作通常是：

```bash
uv sync --locked
uv run pytest
uv run ruff check .
uv run fastapi dev
```

采用 uv 的关键，不是让每个人记住更多命令，而是把团队文档从“请先安装 Python、创建 venv、激活 venv、再安装 requirements”压缩成“安装 uv，然后执行 `uv sync`”。

这件事对 AI 工程也很重要。

Agent、自动化脚本、CI、临时验证环境不会像人一样记住本机历史。

它们最需要的是可复现入口。

一个能被 `uv sync --locked` 还原的项目，比一份写了很多口头说明的项目更适合被自动化系统接手。

## 推荐的 pyproject.toml 结构

下面是一个 FastAPI 服务的实用结构。

它不是唯一答案，但能覆盖大多数 Web API、Agent API 和内部工具服务。

```toml
[project]
name = "example-fastapi-service"
version = "0.1.0"
description = "Example FastAPI service managed by uv"
requires-python = ">=3.12"
dependencies = [
  "fastapi[standard]",
  "pydantic-settings",
  "httpx",
]

[dependency-groups]
dev = [
  "pytest",
  "pytest-asyncio",
  "ruff",
  "mypy",
]

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

这里有几个工程取舍。

`requires-python` 应该写得清楚。

如果团队目标是 Python 3.12，就不要让项目静默跑在 3.10 上。

`dependencies` 只放运行时真正需要的包。

测试、lint、类型检查工具放到 `dev` dependency group。

工具配置尽量进入 `pyproject.toml`。

这样仓库根目录不会散落太多单独配置文件，CI 和本地也更容易读取同一个配置。

## 命令分层：直接 uv、封装命令、自动化入口

大型团队里，不一定要求每个人直接敲 uv 命令。

更稳妥的方式是分三层。

| 层级 | 面向对象 | 例子 | 规则 |
| --- | --- | --- | --- |
| uv 原生命令 | 工程维护者、CI、自动化 | `uv sync --locked` | 作为权威行为 |
| 项目脚本 | 日常开发者 | `make test` / `just test` | 内部调用 uv |
| 文档入口 | 外部读者和新协作者 | `uv sync` + `uv run ...` | 保持最少命令 |

如果团队已经有 Makefile，可以这样写：

```makefile
.PHONY: sync test lint dev

sync:
	uv sync --locked

test:
	uv run pytest

lint:
	uv run ruff check .

dev:
	uv run fastapi dev app/main.py
```

如果团队使用 `just`：

```just
sync:
  uv sync --locked

test:
  uv run pytest

lint:
  uv run ruff check .

dev:
  uv run fastapi dev app/main.py
```

命令封装不是为了隐藏 uv。

它的价值是把日常操作固定成团队语言。

文档里可以写“执行 `make test`”，但 Makefile 里必须清楚地调用 `uv run pytest`。

这样既照顾日常习惯，也不牺牲可追踪性。

## 依赖分组策略

uv 的 dependency groups 很适合表达“服务运行时”和“工程工作流”的边界。

![uv 依赖分组与运行面可视化](/images/engineering/practice/uv-dependency-groups-runtime-visual.png)

建议从这几个组开始：

| 组 | 放什么 | 不放什么 |
| --- | --- | --- |
| default dependencies | 服务启动必须依赖 | 测试框架、lint 工具 |
| `dev` | pytest、ruff、mypy、debug 工具 | 线上运行不需要的重型 SDK |
| `docs` | 文档生成工具 | 服务运行依赖 |
| `notebook` | 数据分析、探索依赖 | API 服务主路径 |
| `loadtest` | 压测工具 | 默认开发依赖 |

不要过早拆出十几个组。

依赖分组的目的不是展示分类能力，而是减少安装面和认知负担。

一个简单原则是：如果某组依赖有独立安装场景，就值得拆组。

例如 API 服务运行只需要 default dependencies。

开发机需要 default + dev。

文档构建 job 需要 default + docs，甚至可能只需要 docs。

Notebook 探索环境可能需要 pandas、polars、matplotlib、duckdb，但这些不应该进入线上 API 容器。

uv 默认会把 `dev` dependency group 包进 `uv run` 和 `uv sync` 的环境里。生产构建如果不需要开发依赖，要显式使用 `--no-dev`、`--no-group dev` 或更精确的 group 选择。

另一个重要约束是：uv 在创建 lockfile 时会一起解析所有 dependency groups，并要求它们彼此兼容。如果某两个运行面天然冲突，不要假装它们能共存；要么拆项目，要么明确声明冲突关系，要么把它们放到独立服务边界。

## lockfile 的工程含义

`uv.lock` 不只是一个自动生成文件。

它是“这一次依赖解析”的可审计记录。

在应用项目中，lockfile 至少承担四个职责。

第一，它让 CI 和本地使用同一套依赖版本。

第二，它让容器构建可以缓存依赖层。

第三，它让依赖升级变成显式 diff。

第四，它让故障回滚更容易。

如果一次发布后出现依赖兼容问题，只要业务代码和 lockfile 都在 Git 里，团队就可以明确比较“到底是什么变了”。

这也是为什么应用项目通常应该提交 `uv.lock`。

库项目则要更谨慎。

库的目标是被不同应用组合使用，所以测试矩阵可能要覆盖更宽的依赖范围。

但即便库项目不把 lockfile 当作发布契约，也可以在开发和 CI 中使用 lockfile 提升可复现性。

关键是把策略写清楚。

## 依赖升级节奏

采用 uv 以后，依赖升级会变得更容易，但也更容易被忽略。

建议把升级分成三类。

| 升级类型 | 频率 | 做法 |
| --- | --- | --- |
| 安全补丁 | 尽快 | 单独 PR，跑完整测试 |
| 小版本升级 | 每周或每两周 | 批量更新，读 release notes |
| 大版本升级 | 独立计划 | 先建兼容分支，逐项迁移 |

一个比较稳妥的升级流程是：

```bash
uv lock --upgrade-package fastapi
uv sync --locked
uv run pytest
uv run ruff check .
```

如果要整体升级：

```bash
uv lock --upgrade
uv sync --locked
uv run pytest
```

整体升级适合依赖面比较小的服务。

大型服务更推荐按关键包分批。

FastAPI、Pydantic、SQLAlchemy、OpenTelemetry SDK、云厂商 SDK、LLM SDK 这类包都可能影响运行时行为，升级时不要只看安装是否成功。

## 与 FastAPI 的组合方式

uv 与 FastAPI 的配合点不止安装依赖。

它会影响整个服务生命周期。

项目创建：

```bash
uv init api-service
uv add "fastapi[standard]" pydantic-settings
uv add --dev pytest pytest-asyncio ruff
```

本地开发：

```bash
uv run fastapi dev app/main.py
```

测试：

```bash
uv run pytest
```

生产启动：

```bash
uv run fastapi run app/main.py
```

在更成熟的生产环境里，团队可能用 `uvicorn`、Gunicorn worker、容器入口脚本或平台托管命令。

无论外层怎么变，核心原则不变：运行命令应该在 uv 同步出的环境里执行。

不要让本地是 uv，生产却绕回系统 Python。

## 与 Agent 工程的组合方式

Agent 项目常常比普通 API 服务更容易出现依赖膨胀。

一个 Agent 后端可能同时依赖：

- Web 框架；
- LLM SDK；
- 向量数据库客户端；
- 文档解析库；
- 浏览器自动化工具；
- 云存储 SDK；
- 观测 SDK；
- 私有工具包；
- notebook 探索依赖。

如果所有依赖都塞进默认环境，项目很快会变重。

uv 的分组可以帮你把路径拆清楚。

例如：

```toml
[project]
dependencies = [
  "fastapi[standard]",
  "pydantic-settings",
  "openai",
  "httpx",
]

[dependency-groups]
dev = ["pytest", "pytest-asyncio", "ruff", "mypy"]
rag = ["qdrant-client", "pypdf", "beautifulsoup4"]
browser = ["playwright"]
notebook = ["ipykernel", "pandas", "polars"]
observability = ["opentelemetry-sdk", "opentelemetry-instrumentation-fastapi"]
```

这样 API 主路径不会被 notebook 依赖拖慢。

RAG worker 可以安装 `rag`。

浏览器自动化 worker 可以安装 `browser`。

实验环境可以安装 `notebook`。

依赖组不是微服务拆分的替代品。

它只是让一个仓库内部的运行面更清楚。

当某个依赖组已经有独立部署、独立扩缩容、独立故障域时，就可以进一步拆成服务或 worker。

## CI 模板

下面是一个 GitHub Actions 的参考结构。

```yaml
name: Python CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Install uv
        uses: astral-sh/setup-uv@v8
        with:
          enable-cache: true
      - name: Install Python
        run: uv python install
      - name: Sync dependencies
        run: uv sync --locked
      - name: Lint
        run: uv run --locked ruff check .
      - name: Test
        run: uv run --locked pytest
```

这个模板的重点是三点。

第一，CI 里不要重新发明安装步骤。

第二，使用 `--locked`，让 lockfile 失配立即暴露。

第三，所有工具都通过 `uv run --locked` 进入项目环境，避免 CI 在执行过程中悄悄改写 lockfile。

如果需要缓存，可以使用 `setup-uv` 的 cache 能力，或围绕 uv cache 和 lockfile 做优化。

但缓存是性能优化，不应该改变安装语义。

GitHub Action 的 major version 会继续演进，示例中的 `actions/checkout` 和 `astral-sh/setup-uv` 版本需要在落地时以官方 README 的当前建议为准。

先保证行为稳定，再优化速度。

## Dockerfile 模板

不同项目的 Dockerfile 会有差异，但可以从这个结构开始：

```dockerfile
FROM python:3.12-slim-trixie

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-install-project

COPY app ./app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-editable

ENV PATH="/app/.venv/bin:$PATH"

CMD ["fastapi", "run", "app/main.py"]
```

第一段 sync 只安装依赖，不安装当前项目本身；这样依赖层能被 Docker cache 复用。复制业务代码后再做第二段 sync，把项目以非 editable 方式装进环境。

这里把 `.venv/bin` 放进 `PATH`，生产命令可以直接运行环境内的可执行文件。

有些团队会选择 `CMD ["uv", "run", "..."]`。

两种方式都可以。

更重要的是避免镜像里同时出现多套环境。

如果容器构建时已经 `uv sync --locked --no-dev`，启动时就不要再临时 `pip install`。

构建阶段解决依赖，运行阶段只启动服务。

这是容器可复现性的基本边界。

## 私有包源和企业网络

企业环境里采用 uv，真正难的往往不是命令，而是网络和凭证。

需要提前确认这些问题：

- 是否使用私有 PyPI mirror；
- 是否需要公司 proxy；
- 是否有内网证书；
- 是否需要访问私有 Git 依赖；
- CI runner 是否能访问同一包源；
- 容器构建环境是否能访问同一包源；
- 凭证是否通过 secret manager 注入；
- lockfile 是否会记录不该公开的信息。

公共文章很难给出一套通用配置，因为企业网络差异很大。

但可以给出一条工程原则：包源、凭证、proxy 属于环境配置，不应该散落在开发者个人机器说明里。

项目应该把“需要什么能力”写清楚，把“具体凭证是什么”交给平台配置。

## 常见故障排查

`uv sync --locked` 失败。

优先检查 `pyproject.toml` 是否改了但 `uv.lock` 没更新。

解决方式通常是本地执行 `uv lock`，确认 diff 后提交 lockfile。

`uv run pytest` 找不到模块。

检查测试是否依赖了未声明的包，或者项目 package layout 没有正确配置。

不要通过在本机全局安装包来“修好”测试。

CI 能过，本地不能过。

检查本地 Python 版本、平台差异、环境变量、私有包源访问、`.venv` 是否陈旧。

可以尝试删除 `.venv` 后重新 `uv sync --locked`。

本地能过，CI 不能过。

检查 lockfile 是否提交，CI 是否使用 `--locked`，是否缺少系统库，是否有未提交文件被本地环境隐式使用。

容器能构建但启动失败。

检查启动命令是否在 uv 环境里执行，`PATH` 是否包含 `.venv/bin`，生产镜像是否安装了运行依赖但没有安装 dev 依赖。

依赖安装很慢。

先判断是否真的是 uv 慢，还是网络、私有源、原生编译或缓存失效。

不要一开始就改工具链。

## 迁移检查清单

迁移一个已有 Python 项目时，可以用下面的清单控制风险。

- 确认当前权威依赖文件；
- 记录当前 Python 版本；
- 记录当前 CI 安装命令；
- 记录当前部署安装命令；
- 迁移依赖声明到 `pyproject.toml`；
- 生成 `uv.lock`；
- 本地执行 `uv sync --locked`；
- 本地执行测试和 lint；
- 修改 CI 为 `uv sync --locked`；
- 修改 Dockerfile 或部署脚本；
- 删除或降级旧入口；
- 在 README 中写清楚新入口；
- 检查 `.venv/` 是否被 `.gitignore` 忽略；
- 检查 lockfile 是否进入 code review；
- 观察第一轮依赖升级是否顺畅。

清单的价值不是形式感。

它能防止“本地迁了，CI 没迁”或者“CI 迁了，部署没迁”的半成品状态。

## 决策建议

如果项目是新的 FastAPI 服务，建议默认使用 uv。

如果项目是新的 Agent 后端，建议默认使用 uv，并从一开始划清 default、dev、rag、notebook 等依赖边界。

如果项目是历史服务，建议先做试点迁移，不要和业务重构绑在一起。

如果项目严重依赖 conda、CUDA、本地系统库或特殊二进制包，建议先评估依赖链，再决定 uv 在其中承担哪一层。

如果团队已经稳定使用 Poetry，也不必为了追潮流立即重写所有项目。

uv 的优势很明显，但工程迁移的目标是降低摩擦，不是制造新的迁移摩擦。

更好的做法是：新项目默认 uv，旧项目按价值和风险分批迁移。

## 延伸阅读

- [uv documentation](https://docs.astral.sh/uv/)
- [uv guides — Projects](https://docs.astral.sh/uv/guides/projects/)
- [uv concepts — Locking and syncing](https://docs.astral.sh/uv/concepts/projects/sync/)
- [uv concepts — Managing dependencies](https://docs.astral.sh/uv/concepts/projects/dependencies/)
- [uv guides — Tools](https://docs.astral.sh/uv/guides/tools/)
- [uv Docker integration](https://docs.astral.sh/uv/guides/integration/docker/)
- [PEP 723 — Inline script metadata](https://peps.python.org/pep-0723/)
- [astral-sh/setup-uv](https://github.com/astral-sh/setup-uv)
