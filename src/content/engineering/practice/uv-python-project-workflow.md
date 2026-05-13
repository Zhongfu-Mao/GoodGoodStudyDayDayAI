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

过去 Python 工程最让前端和 Node.js 开发者困惑的地方，不是语言本身，而是环境管理。到底用 `pip`、`venv`、`pip-tools`、Poetry、Pipenv、conda，还是系统 Python？依赖写在 `requirements.txt`、`setup.py`、`pyproject.toml` 还是 notebook 里？命令用全局工具、本地虚拟环境，还是 CI 里重新装一遍？

uv 的价值在于：它不只是“更快的 pip”，而是把 Python 版本、项目、依赖、虚拟环境、lockfile、命令执行和一次性工具收束成一个统一入口。

![uv Python 工具链地图](/images/engineering/practice/uv-python-toolchain.svg)

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
      - uses: actions/checkout@v4
      - name: Install uv
        uses: astral-sh/setup-uv@v5
      - name: Install Python
        run: uv python install
      - name: Sync dependencies
        run: uv sync --locked
      - name: Lint
        run: uv run ruff check .
      - name: Test
        run: uv run pytest
```

这个模板的重点是三点。

第一，CI 里不要重新发明安装步骤。

第二，使用 `--locked`，让 lockfile 失配立即暴露。

第三，所有工具都通过 `uv run` 进入项目环境。

如果需要缓存，可以围绕 uv cache 和 lockfile 做优化。

但缓存是性能优化，不应该改变安装语义。

先保证行为稳定，再优化速度。

## Dockerfile 模板

不同项目的 Dockerfile 会有差异，但可以从这个结构开始：

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev

COPY app ./app

ENV PATH="/app/.venv/bin:$PATH"

CMD ["fastapi", "run", "app/main.py"]
```

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


## uv adoption handbook

这一部分把 uv 当作工程制度来写。

它不是命令合集，而是团队把 Python 项目稳定交付的操作手册。

采用 uv 时，最重要的不是立刻替换所有旧工具，而是先把权威入口固定下来。

权威入口包括五件事。

- 项目元数据以 `pyproject.toml` 为准。
- 解析结果以 `uv.lock` 为准。
- 运行命令以 `uv run` 为准。
- 环境同步以 `uv sync` 为准。
- 临时工具以 `uvx` 或 `uv run --with` 为准。

### 采用分层

| 层级 | 目标 | 推荐动作 | 验收信号 |
| --- | --- | --- | --- |
| 个人脚本层 | 把一次性脚本从全局环境里拿出来 | 优先用 `uv run --with` 或 inline metadata | 脚本能独立说明依赖 |
| 项目启动层 | 新项目统一入口 | 从 `uv init` 开始 | 生成 `pyproject.toml` 和可审查的依赖声明 |
| 团队协作层 | 把依赖解析变成可审查资产 | 提交 `uv.lock` | code review 能看到依赖变化 |
| CI 层 | 阻止构建机悄悄重新解析 | 使用 `uv sync --locked` | lockfile 不一致时直接失败 |
| 发布层 | 让容器和运行环境靠近 lockfile | 按 lockfile 安装运行依赖 | 减少本地和生产差异 |
| 平台层 | 统一 Python 版本、包源、缓存、凭证 | 把规则写入模板和文档 | 降低环境排障成本 |

### pyproject 模板：FastAPI 应用

下面是一份偏应用服务的起点模板。

它强调 runtime、dev、lint、test、type、observability 的边界。

```toml
[project]
name = "fastapi-agent-service"
version = "0.1.0"
description = "FastAPI service managed by uv"
requires-python = ">=3.12"
dependencies = [
  "fastapi[standard]>=0.115",
  "pydantic-settings>=2.0",
  "httpx>=0.27",
  "opentelemetry-api>=1.25",
]

[dependency-groups]
dev = [
  { include-group = "lint" },
  { include-group = "test" },
  { include-group = "type" },
]
lint = [
  "ruff>=0.8",
]
test = [
  "pytest>=8",
  "pytest-asyncio>=0.24",
]
type = [
  "mypy>=1.13",
]
observability = [
  "opentelemetry-sdk>=1.25",
  "opentelemetry-instrumentation-fastapi>=0.46b0",
]

[tool.uv]
default-groups = ["dev"]

[tool.ruff]
line-length = 100

[tool.pytest.ini_options]
asyncio_mode = "auto"
```

模板不是固定答案。

它要表达的是：运行依赖、开发依赖和可选能力不应该混在一起。

### pyproject 模板：库包

库包更关注发布元数据和兼容性范围。

```toml
[project]
name = "internal-client"
version = "0.1.0"
description = "Internal API client"
requires-python = ">=3.10"
dependencies = [
  "httpx>=0.27,<1",
  "pydantic>=2,<3",
]

[project.optional-dependencies]
cli = [
  "typer>=0.12",
  "rich>=13",
]

[dependency-groups]
dev = [
  "pytest>=8",
  "ruff>=0.8",
]
```

库包可以提交 lockfile，也可以不把 lockfile 当作安装契约。

关键是把“发布给别人安装的依赖范围”和“维护者本地测试的锁定环境”分开说明。

## dependency groups 策略

uv 使用 `[dependency-groups]` 管理本地开发依赖。

这和 extras 不同。

extras 是发布包的一部分。

dependency groups 更适合项目维护、测试、lint、类型检查、文档、实验和运维工具。

| group | 用途 | 典型依赖 | 边界建议 |
| --- | --- | --- | --- |
| dev | 默认开发入口 | 聚合 lint、test、type | 适合默认同步 |
| lint | 代码风格和静态检查 | ruff、codespell | CI 可单独执行 |
| test | 测试依赖 | pytest、pytest-asyncio、respx | 避免进入 runtime |
| type | 类型检查 | mypy、pyright | 可按项目成熟度启用 |
| docs | 文档构建 | mkdocs、sphinx | 不进入服务镜像 |
| otel | 可观测性实验 | OpenTelemetry SDK 和 exporters | 运行服务可按环境选择 |
| rag | RAG 相关依赖 | 向量库客户端、分词工具 | 避免基础 API 服务被拖重 |
| notebook | 探索环境 | ipykernel、jupyter | 不进入 CI 默认路径 |
| bench | 压测和 benchmark | locust、pytest-benchmark | 按需安装 |
| security | 安全扫描 | pip-audit、bandit | 在专门 job 里运行 |

### group 命名规则

- group 名称要描述用途，而不是描述某个成员。
- `dev` 可以作为聚合组。
- `lint`、`test`、`type` 适合拆开。
- `rag`、`agent`、`notebook` 适合表达能力域。
- 不要把所有工具都塞进 `dev`。
- 不要把 runtime 依赖放进只在 CI 使用的 group。
- 不要把 notebook 依赖放进生产镜像。
- 不要让两个 group 依赖互相冲突。
- 如果冲突是有意的，要把原因写在项目文档里。
- 默认 group 越多，同步环境越重。
- 默认 group 越少，开发者越容易漏装工具。
- 默认策略要服务主路径，而不是覆盖所有边缘路径。

### group 命令速查

| 目标 | 命令或位置 |
| --- | --- |
| 添加 dev 依赖 | `uv add --dev pytest` |
| 添加 lint group | `uv add --group lint ruff` |
| 只同步 dev | `uv sync --only-dev` |
| 排除 dev | `uv sync --no-dev` |
| 同步指定 group | `uv sync --group lint` |
| 只同步指定 group | `uv sync --only-group lint` |
| 同步所有 group | `uv sync --all-groups` |
| 禁用默认 group | `uv sync --no-default-groups` |
| 运行时排除某 group | `uv run --no-group notebook pytest` |
| 配置默认 group | 在 `[tool.uv]` 设置 `default-groups` |

## lockfile 策略

lockfile 是 uv adoption 的分水岭。

如果团队只用 uv 安装包，却不审查 `uv.lock`，那仍然没有得到完整的可复现收益。

- 应用项目应提交 `uv.lock`。
- 服务镜像应从 `uv.lock` 构建。
- CI 应使用 `--locked` 阻止隐式更新。
- 升级依赖应作为可审查变更。
- 安全升级应尽量最小化 diff。
- 大版本升级应单独 PR。
- lockfile 冲突应重新解析，而不是手工拼接。
- 平台相关依赖要用 marker 表达。
- 私有源变化要和 lockfile 变化一起审查。
- 不要把 lockfile 当成机器噪声忽略。

### lockfile 操作矩阵

| 场景 | 命令 | 说明 |
| --- | --- | --- |
| 只检查 lock 是否新鲜 | `uv lock --check` | 适合 CI 早期 job |
| 更新 lock | `uv lock` | 适合依赖声明变更后 |
| 升级全部锁定包 | `uv lock --upgrade` | 适合维护窗口 |
| 只升级一个包 | `uv lock --upgrade-package httpx` | 适合安全修复 |
| 同步但禁止改 lock | `uv sync --locked` | 适合 CI |
| 运行但禁止改 lock | `uv run --locked pytest` | 适合校验脚本 |
| 不检查新鲜度直接使用 | `uv sync --frozen` | 适合特殊构建场景 |
| 导出 requirements | `uv export --format requirements.txt` | 适合旧平台兼容 |
| 导出 SBOM | `uv export --format cyclonedx1.5` | 适合供应链审计 |

## CI 参考流水线

CI 目标不是重新发明本地流程，而是用更严格的方式复现本地流程。

### 基础 job

```yaml
steps:
  - uses: actions/checkout@v4
  - name: Install uv
    uses: astral-sh/setup-uv@v5
  - name: Set up Python
    run: uv python install
  - name: Sync
    run: uv sync --locked
  - name: Lint
    run: uv run ruff check .
  - name: Test
    run: uv run pytest
```

### 分组 job

```yaml
jobs:
  lint:
    steps:
      - run: uv sync --locked --only-group lint
      - run: uv run --no-sync ruff check .
  test:
    steps:
      - run: uv sync --locked --group test
      - run: uv run --no-sync pytest
```

分组 job 的关键是先同步需要的 group，再用 `--no-sync` 避免命令阶段重复同步。

### CI 审查点

- 是否固定 Python 版本。
- 是否使用 `uv sync --locked`。
- 是否缓存 uv 下载目录。
- 是否避免全局 `pip install`。
- 是否避免绕过 `uv run`。
- 是否把 lint、test、type 分成可定位的 job。
- 是否让 lockfile 过期时快速失败。
- 是否在私有源失败时输出足够信息。
- 是否在 Docker 构建前独立验证 lockfile。
- 是否在依赖升级 PR 中单独跑安全扫描。

## Docker 参考模式

生产镜像要追求两件事：可复现和小攻击面。

开发镜像可以包含 dev group。

生产镜像通常不应该包含 notebook、benchmark、测试工具和调试工具。

| 镜像类型 | 依赖策略 | 优点 | 注意点 |
| --- | --- | --- | --- |
| 本地开发镜像 | 包含 dev group | 方便调试 | 体积较大 |
| CI 测试镜像 | 包含 test/lint/type | 结果稳定 | 不用于生产 |
| 生产 API 镜像 | 排除 dev group | 体积更小 | 调试工具少 |
| worker 镜像 | 只包含 worker runtime | 队列任务独立扩缩容 | 需要单独健康检查 |
| GPU 镜像 | 系统层先处理 CUDA | uv 管 Python 层 | 构建复杂度高 |

### Dockerfile 审查清单

- 先复制 `pyproject.toml` 和 `uv.lock`。
- 再执行 `uv sync --locked --no-dev`。
- 最后复制业务代码。
- 不要在镜像里提交 `.venv`。
- 不要在构建中无约束 `pip install`。
- 不要把测试依赖带进生产层。
- 确认启动命令能找到 uv 环境。
- 确认健康检查不依赖 dev 工具。
- 确认私有源凭证不会留在最终镜像层。
- 确认系统库和 Python wheel 匹配。
- 确认镜像构建和运行使用相同 Python 大版本。
- 确认多阶段构建没有漏复制运行时依赖。

## 企业内网与私有源

企业环境里，uv adoption 的难点通常不是命令，而是网络和凭证。

需要提前回答这些问题。

- PyPI 是否能直连。
- 是否必须走内部镜像。
- 是否允许访问 Git dependencies。
- 是否允许构建时联网。
- 是否有离线构建要求。
- 是否需要公司证书。
- 是否需要 HTTP proxy。
- 是否需要 per-index credential。
- 是否有依赖白名单。
- 是否要求 SBOM。
- 是否要求漏洞扫描。
- 是否要求保留构建日志。

### 私有源策略

| 策略 | 做法 | 优点 | 风险 |
| --- | --- | --- | --- |
| 简单镜像 | 所有包走同一内部源 | 配置最简单 | 容易隐藏上游差异 |
| 显式 index | 关键包指定来源 | 供应链边界清楚 | 维护成本更高 |
| 平台分源 | CPU/GPU wheel 分源 | 适合 ML 场景 | marker 必须准确 |
| 离线 wheelhouse | 构建前准备 wheel | 适合隔离网络 | 升级流程更重 |
| 代理缓存 | 首次下载后复用 | 提升速度 | 要处理缓存失效 |

企业内网不应把所有异常都归咎于 uv。

证书、代理、DNS、镜像同步延迟、包白名单和系统库缺失，都可能表现成依赖解析或安装失败。

## 从 pip 迁移

1. 确认当前 `requirements.txt` 是否手写。
2. 确认是否存在 `requirements.in`。
3. 确认是否存在多个环境文件。
4. 确认生产依赖和开发依赖是否混在一起。
5. 用 `uv add -r requirements.txt` 导入依赖。
6. 把测试工具移动到 `dependency-groups.test`。
7. 把 lint 工具移动到 `dependency-groups.lint`。
8. 把 notebook 工具移动到独立 group。
9. 生成 `uv.lock`。
10. 用 `uv sync --locked` 重建环境。
11. 跑测试。
12. 跑 lint。
13. 检查导入路径。
14. 检查部署脚本。
15. 决定是否保留导出的 `requirements.txt`。

### pip 迁移风险

- 旧文件里可能有隐式顺序依赖。
- 旧文件里可能混有 editable 本地包。
- 旧文件里可能包含私有 index 选项。
- 旧文件里可能把开发工具当作运行依赖。
- 旧部署平台可能只识别 `requirements.txt`。
- 旧 CI 可能依赖全局工具。
- 旧 Dockerfile 可能假设包已经装进系统 Python。
- 旧脚本可能直接调用 `python` 而不是 `uv run python`。

## 从 Poetry 迁移

Poetry 用户迁移时，不应该只做命令替换。

要先理解项目当前使用了 Poetry 的哪些能力。

| Poetry 能力 | uv 迁移方向 | 注意点 |
| --- | --- | --- |
| 依赖声明 | 迁到 `[project]` 和 `[dependency-groups]` | 避免保留双重权威 |
| extras | 迁到 `[project.optional-dependencies]` | 保持发布语义 |
| scripts | 迁到 `[project.scripts]` 或项目命令文档 | 不要丢失 CLI 入口 |
| 私有源 | 迁到 uv index/source 配置 | 确认凭证方式 |
| lockfile | 重新生成 `uv.lock` | 不要手工转换 |
| build backend | 确认是否仍需要 Poetry backend | 库包尤其要检查 |
| workspace 需求 | 评估 uv workspace | 不要把多个包硬塞进一个项目 |
| CI 命令 | 从 `poetry install` 改到 `uv sync --locked` | 同时改缓存策略 |

Poetry 稳定运行的项目可以保守迁移。

最适合先迁移的是 CI 慢、依赖漂移明显、工具入口混乱、需要 workspace 的项目。

## monorepo 与 workspaces

uv workspace 适合一个仓库里有多个 Python package 的情况。

典型结构如下。

```text
repo/
  pyproject.toml
  uv.lock
  apps/
    api/
      pyproject.toml
      app/
    worker/
      pyproject.toml
      worker/
  packages/
    common/
      pyproject.toml
      src/common/
    agent_runtime/
      pyproject.toml
      src/agent_runtime/
```

workspace 的核心收益是共享一个 lockfile。

这让 API、worker、内部库在同一组依赖版本上协作。

### workspace 判断标准

- 仓库里是否有多个可独立发布或独立测试的包。
- 这些包是否需要共享依赖版本。
- 是否存在 API 与 worker 共用 domain code。
- 是否存在多个 Agent runtime 共享工具库。
- 是否需要从仓库根运行某个 package 的命令。
- 是否希望一次 lock 覆盖整个仓库。
- 是否能接受 workspace 成员之间的版本约束一起解析。
- 是否有成员依赖互相冲突。
- 是否能清楚定义根项目职责。
- 是否能让 CI 按 package 分 job。

### workspace 命令速查

| 目标 | 命令或配置 |
| --- | --- |
| 在根项目锁定整个 workspace | `uv lock` |
| 在根项目同步默认环境 | `uv sync` |
| 运行特定 package 命令 | `uv run --package api pytest` |
| 同步特定 package | `uv sync --package api` |
| 添加 workspace 依赖 | 在 `[tool.uv.sources]` 使用 `{ workspace = true }` |
| 查看依赖树 | `uv tree` |

## Agent 与 FastAPI 工程

Agent 后端通常有比普通 API 更复杂的依赖边界。

模型 SDK、向量库、浏览器工具、文件解析、OpenTelemetry、队列、数据库和安全扫描工具不应该全部进入一个默认依赖集合。

| 依赖域 | 内容 | 边界 |
| --- | --- | --- |
| default | FastAPI、配置、HTTP client、核心 domain | API 启动所需 |
| agent | 模型 SDK、tool registry、状态机 | Agent runtime 所需 |
| rag | 向量库、embedding client、文档解析 | 检索能力所需 |
| browser | 浏览器自动化相关 client | 只给需要的 worker |
| otel | trace exporter、instrumentation | 按部署环境选择 |
| eval | 评测框架、样本工具 | 不进生产 API |
| notebook | 分析探索工具 | 不进生产 API |
| worker | 队列和后台任务依赖 | worker 镜像使用 |

Agent/FastAPI 项目里，uv 的价值是把这些边界写进项目结构，而不是靠口头约定。

### Agent 服务命令样板

| 目标 | 命令 |
| --- | --- |
| 启动 API | `uv run fastapi dev app/main.py` |
| 运行 worker | `uv run python -m app.worker` |
| 执行 eval | `uv run --group eval pytest tests/evals` |
| 只跑 API 测试 | `uv run pytest tests/api` |
| 只跑工具测试 | `uv run pytest tests/tools` |
| 生成 OpenAPI | `uv run python scripts/export_openapi.py` |
| 冒烟请求 | `uv run --with httpx python scripts/smoke.py` |
| 查看依赖树 | `uv tree` |

## 故障排查手册

### 故障 01：lockfile 过期

- 现象：`uv sync --locked` 失败。
- 检查：检查 `pyproject.toml` 是否改动。
- 修复：执行 `uv lock` 并审查 diff。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 02：依赖无法解析

- 现象：No solution found。
- 检查：检查版本上界、Python 版本、group 冲突。
- 修复：缩小约束或拆分冲突 group。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 03：CI 找不到包

- 现象：ModuleNotFoundError。
- 检查：检查包是否只装在本地全局环境。
- 修复：把依赖写进正确 group。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 04：本地命令和 CI 不一致

- 现象：本地通过 CI 失败。
- 检查：检查是否绕过 `uv run`。
- 修复：统一命令入口。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 05：生产镜像缺包

- 现象：启动时报 import error。
- 检查：检查是否用了 `--no-dev` 排除了 runtime 依赖。
- 修复：移动依赖到 default。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 06：镜像过大

- 现象：生产层包含测试工具。
- 检查：检查 group 边界。
- 修复：生产同步时排除 dev group。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 07：安装慢

- 现象：CI 花时间下载或编译。
- 检查：检查缓存、私有源、native wheel。
- 修复：缓存 uv 目录并补系统库。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 08：私有源认证失败

- 现象：401 或 403。
- 检查：检查凭证注入和 index 配置。
- 修复：把凭证放到 CI secret。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 09：证书失败

- 现象：TLS certificate error。
- 检查：检查企业 CA。
- 修复：配置证书链。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 10：GPU 包装错

- 现象：运行时找不到 CUDA 组件。
- 检查：检查 wheel source 和系统 CUDA。
- 修复：分离系统层和 Python 层。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 11：workspace 包不更新

- 现象：修改成员后运行仍旧。
- 检查：检查是否从 workspace source 引用。
- 修复：确认 editable 行为。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 12：脚本依赖漂移

- 现象：脚本只在一台机器能跑。
- 检查：检查是否靠全局环境。
- 修复：用 `uv run --with` 或 inline metadata。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 13：开发工具版本漂移

- 现象：ruff 结果不同。
- 检查：检查是否用全局 ruff。
- 修复：把 ruff 放入 lint group。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 14：lock 冲突难解

- 现象：合并分支后冲突。
- 检查：不要手工拼内容。
- 修复：重新运行 `uv lock`。
- 复盘：把同类问题写进项目模板或 CI。

### 故障 15：导出 requirements 缺内容

- 现象：旧平台运行失败。
- 检查：检查 extras 和 group 是否导出。
- 修复：明确导出目标。
- 复盘：把同类问题写进项目模板或 CI。

## 命令速查

| 操作 | 命令 |
| --- | --- |
| 创建项目 | `uv init service-name` |
| 添加运行依赖 | `uv add httpx` |
| 添加开发依赖 | `uv add --dev pytest` |
| 添加指定 group | `uv add --group lint ruff` |
| 添加 optional extra | `uv add --optional cli typer` |
| 删除依赖 | `uv remove httpx` |
| 锁定依赖 | `uv lock` |
| 检查 lock | `uv lock --check` |
| 同步环境 | `uv sync` |
| 严格同步 | `uv sync --locked` |
| 排除开发依赖 | `uv sync --no-dev` |
| 只装某 group | `uv sync --only-group lint` |
| 运行命令 | `uv run pytest` |
| 运行 Python | `uv run python` |
| 临时依赖运行 | `uv run --with httpx python script.py` |
| 一次性工具 | `uvx ruff check .` |
| 查看依赖树 | `uv tree` |
| 升级全部 | `uv lock --upgrade` |
| 升级单包 | `uv lock --upgrade-package httpx` |
| 导出 requirements | `uv export --format requirements.txt` |
| 安装 Python | `uv python install 3.12` |
| 固定 Python | `uv python pin 3.12` |
| 查看工具帮助 | `uv help` |
| 查看子命令帮助 | `uv help sync` |

## review checklist

### 依赖声明

- 新增依赖是否在正确位置。
- 是否误把开发工具放进 runtime。
- 是否给高风险包设置合理版本范围。
- 是否需要 optional extra。
- 是否需要 platform marker。
- 是否引入 Git 或 path source。
- 是否解释私有源原因。
- 是否避免重复依赖。

### lockfile

- `uv.lock` 是否随依赖声明更新。
- lockfile diff 是否可解释。
- 是否存在大规模无关升级。
- 安全修复是否最小化。
- 是否需要 `--upgrade-package` 而不是全量升级。
- 合并冲突是否重新解析。
- 是否检查跨平台影响。
- 是否能在 CI locked sync。

### CI

- 是否使用 `uv sync --locked`。
- 是否所有命令通过 `uv run`。
- 是否缓存合理。
- 是否没有全局 pip 安装。
- 是否分离 lint 和 test。
- 是否输出足够失败日志。
- 是否处理私有源凭证。
- 是否避免把 secret 打进日志。

### Docker

- 是否利用 lockfile 缓存层。
- 是否排除 dev group。
- 是否保留必要运行依赖。
- 是否不泄漏凭证。
- 是否固定 Python 版本。
- 是否处理系统库。
- 是否验证启动命令。
- 是否包含健康检查。

### 文档

- README 是否写明入口。
- 是否说明 `.venv` 不提交。
- 是否说明 lockfile 策略。
- 是否说明迁移期旧入口。
- 是否说明私有源配置。
- 是否说明常用命令。
- 是否说明故障处理。
- 是否链接官方文档。

## FAQ

### FAQ 01：uv 是否只是更快的 pip

不是。pip 兼容接口只是其中一部分，项目、lockfile、sync、run、tool 才是团队工作流价值。

### FAQ 02：是否还需要 venv

需要虚拟环境这个概念，但通常不需要手工创建和激活。uv 会管理项目环境。

### FAQ 03：`.venv` 是否提交

不提交。它是本地生成物。

### FAQ 04：`uv.lock` 是否提交

应用项目建议提交。库包要根据测试和发布策略决定。

### FAQ 05：是否可以继续用 requirements.txt

迁移期可以。长期应明确 source of truth，必要时从 lockfile 导出。

### FAQ 06：是否可以继续用 pip

可以，但团队主路径最好统一，否则排障成本会上升。

### FAQ 07：dev group 是否默认安装

uv 默认会包含 dev group；可以用配置或命令改变。

### FAQ 08：extras 和 dependency groups 有什么区别

extras 是发布包可选能力，dependency groups 是本地开发和维护依赖。

### FAQ 09：为什么 CI 用 `--locked`

为了防止 CI 隐式更新 lockfile 或解析出本地没有审查过的依赖组合。

### FAQ 10：为什么有时用 `--frozen`

特殊场景需要直接使用 lockfile 且不做新鲜度检查时使用，但要谨慎。

### FAQ 11：workspace 是否适合所有 monorepo

不适合。只有多个 Python package 需要共享 lockfile 时才值得引入。

### FAQ 12：Agent 项目为什么要拆 group

模型、检索、浏览器、评测、notebook 依赖体积和风险不同，混在一起会拖累部署。

### FAQ 13：FastAPI 项目是否必须用 uv

不是必须，但 uv 能把服务模板、依赖锁定和 CI 命令统一起来。

### FAQ 14：企业内网失败该先看什么

先看 index、proxy、证书、凭证、DNS、包白名单和缓存。

### FAQ 15：依赖升级应该怎么做

优先小步升级，安全修复用单包升级，大版本升级单独审查。

## 反模式

### 反模式 01：把 uv 当成 pip 加速器

只替换安装命令，不提交 lockfile，不统一 run 入口。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 02：双重权威

`requirements.txt` 和 `pyproject.toml` 同时存在，但没有说明谁是源头。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 03：全局工具漂移

本地使用全局 ruff 或 pytest，CI 使用另一个版本。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 04：生产镜像塞满 dev 依赖

为了省事同步所有 group，导致镜像变大且攻击面上升。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 05：lockfile 不进审查

把 `uv.lock` 当机器文件跳过 review。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 06：依赖升级混进功能 PR

业务改动和大规模依赖升级一起出现，回滚困难。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 07：无边界 group

所有依赖都放进 `dev`，实际用途不可见。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 08：workspace 过度设计

只有一个包也强行 workspace 化。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 09：私有源口头配置

每个人手工配置 index 和凭证，没有模板。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 10：脚本靠本机环境

脚本没有声明依赖，只在作者机器能运行。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 11：CI 绕过 uv

本地用 uv，CI 继续 pip install，结果无法对齐。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

### 反模式 12：Docker 绕过 lockfile

镜像构建时重新解析依赖，生产环境不可复现。

更稳的做法是把入口、依赖声明、锁文件和验证命令写成可审查资产。

## 采用路线图

| 阶段 | 目标 | 交付物 |
| --- | --- | --- |
| 第 1 阶段 | 新项目默认 uv | 模板、README、CI 样板先落地 |
| 第 2 阶段 | 把常用脚本迁到 uv run | 减少全局环境依赖 |
| 第 3 阶段 | 选择一个低风险服务迁移 | 验证 Docker 和 CI |
| 第 4 阶段 | 统一 dependency groups | 拆出 lint、test、type、docs |
| 第 5 阶段 | 处理私有源和缓存 | 把企业环境写成配置模板 |
| 第 6 阶段 | 评估 workspace | 只在多包仓库中引入 |
| 第 7 阶段 | 建立依赖升级节奏 | 安全修复、小版本维护、大版本窗口分开 |
| 第 8 阶段 | 把经验回写模板 | 让后续项目少踩同类坑 |

路线图的核心是降低切换成本。

uv adoption 最稳的方式，是让每一步都能独立带来收益，而不是等待一次大迁移完成。


## 操作场景索引

下面的场景卡片适合直接放进项目手册。

每张卡片都包含目标、推荐命令、审查点和常见误区。

### 场景 01：新建 FastAPI 服务

- 目标：创建可复现 API 项目。
- 推荐动作：`uv init api-service` + `uv add "fastapi[standard]"`。
- 审查点：确认 `uv.lock` 已生成。
- 常见误区：不要先手工创建零散 venv。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 02：加入 pytest

- 目标：建立测试入口。
- 推荐动作：`uv add --dev pytest`。
- 审查点：确认 CI 使用 `uv run pytest`。
- 常见误区：不要使用全局 pytest。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 03：加入 ruff

- 目标：统一 lint 结果。
- 推荐动作：`uv add --group lint ruff`。
- 审查点：确认 lint group 可单独同步。
- 常见误区：不要让编辑器使用另一个 ruff。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 04：固定 Python 版本

- 目标：减少版本漂移。
- 推荐动作：`uv python pin 3.12`。
- 审查点：确认 CI 使用同一版本。
- 常见误区：不要假设系统 Python 正好一致。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 05：新增 runtime 依赖

- 目标：让服务代码可运行。
- 推荐动作：`uv add httpx`。
- 审查点：确认依赖进入 `[project.dependencies]`。
- 常见误区：不要把 runtime 依赖放进 dev。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 06：新增测试依赖

- 目标：让测试工具不进入生产。
- 推荐动作：`uv add --group test pytest-asyncio`。
- 审查点：确认生产 sync 排除测试组。
- 常见误区：不要把测试依赖放进 default。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 07：新增 CLI extra

- 目标：给库包暴露可选能力。
- 推荐动作：`uv add --optional cli typer`。
- 审查点：确认 extra 名称稳定。
- 常见误区：不要用 dev group 表示发布能力。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 08：只升级安全包

- 目标：最小化升级风险。
- 推荐动作：`uv lock --upgrade-package package-name`。
- 审查点：确认 lockfile diff 小。
- 常见误区：不要顺手全量升级。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 09：全量维护升级

- 目标：更新依赖基线。
- 推荐动作：`uv lock --upgrade`。
- 审查点：确认测试和回归范围。
- 常见误区：不要混在功能改动里。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 10：CI locked sync

- 目标：禁止隐式解析。
- 推荐动作：`uv sync --locked`。
- 审查点：确认 stale lock 会失败。
- 常见误区：不要在 CI 自动改 lock。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 11：本地重建环境

- 目标：排除环境污染。
- 推荐动作：删除 `.venv` 后 `uv sync --locked`。
- 审查点：确认问题可复现。
- 常见误区：不要用全局安装修补。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 12：导出 requirements

- 目标：兼容旧平台。
- 推荐动作：`uv export --format requirements.txt`。
- 审查点：确认导出范围。
- 常见误区：不要把导出文件当新权威。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 13：Docker 运行依赖

- 目标：构建生产镜像。
- 推荐动作：`uv sync --locked --no-dev`。
- 审查点：确认服务启动成功。
- 常见误区：不要复制本地 `.venv`。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 14：Docker 测试镜像

- 目标：构建验证环境。
- 推荐动作：`uv sync --locked --all-groups`。
- 审查点：确认只用于 CI。
- 常见误区：不要发布为生产镜像。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 15：私有源接入

- 目标：使用内部包源。
- 推荐动作：配置 uv index/source。
- 审查点：确认凭证不进 git。
- 常见误区：不要把 token 写入文件。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 16：离线构建

- 目标：支持隔离网络。
- 推荐动作：预先准备 wheel 或缓存。
- 审查点：确认构建无外网依赖。
- 常见误区：不要临时放开网络当修复。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 17：workspace API 包

- 目标：从根运行子包测试。
- 推荐动作：`uv run --package api pytest`。
- 审查点：确认 workspace 成员声明。
- 常见误区：不要在子包里维护独立 lock。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 18：workspace 共用库

- 目标：引用内部 package。
- 推荐动作：`{ workspace = true }`。
- 审查点：确认依赖名匹配。
- 常见误区：不要用相对路径绕过 workspace。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 19：Agent runtime

- 目标：隔离模型和工具依赖。
- 推荐动作：建立 `agent` group。
- 审查点：确认 API 镜像不被拖重。
- 常见误区：不要所有 SDK 都进 default。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 20：RAG 能力

- 目标：隔离检索依赖。
- 推荐动作：建立 `rag` group。
- 审查点：确认向量库客户端按需安装。
- 常见误区：不要让基础服务依赖大型解析包。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 21：评测任务

- 目标：隔离 eval 工具。
- 推荐动作：建立 `eval` group。
- 审查点：确认生产排除 eval。
- 常见误区：不要让评测框架进入 runtime。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 22：notebook 支持

- 目标：隔离探索依赖。
- 推荐动作：建立 `notebook` group。
- 审查点：确认 CI 默认不安装。
- 常见误区：不要把 notebook 当服务入口。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 23：OpenTelemetry

- 目标：分离观测依赖。
- 推荐动作：建立 `otel` group 或 runtime 依赖。
- 审查点：确认部署环境需要哪些 exporter。
- 常见误区：不要在本地硬编码 exporter。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 24：pre-commit 替代

- 目标：统一检查命令。
- 推荐动作：优先 `uv run ruff check .`。
- 审查点：确认 hook 和 CI 同版本。
- 常见误区：不要让 hook 成为唯一验证。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 25：Makefile 包装

- 目标：保留短命令。
- 推荐动作：make target 内调用 uv。
- 审查点：确认 README 写明底层命令。
- 常见误区：不要让 Makefile 隐藏另一套安装流程。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 26：部署平台限制

- 目标：平台只懂 requirements。
- 推荐动作：从 uv 导出文件。
- 审查点：确认导出由 CI 生成。
- 常见误区：不要手工维护导出文件。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 27：平台 marker

- 目标：限制平台依赖。
- 推荐动作：使用 PEP 508 marker。
- 审查点：确认各平台 lock 结果。
- 常见误区：不要在代码里动态安装。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 28：GPU 依赖

- 目标：区分系统层和 Python 层。
- 推荐动作：系统镜像处理 CUDA，uv 管包。
- 审查点：确认 wheel source。
- 常见误区：不要指望 uv 安装驱动。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 29：包源慢

- 目标：提高下载稳定性。
- 推荐动作：配置缓存和镜像。
- 审查点：确认瓶颈在网络还是编译。
- 常见误区：不要盲目换工具。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 30：锁文件冲突

- 目标：合并依赖变更。
- 推荐动作：重新运行 `uv lock`。
- 审查点：确认 diff 可解释。
- 常见误区：不要手工拼 TOML 片段。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 31：依赖树审查

- 目标：理解传递依赖。
- 推荐动作：`uv tree`。
- 审查点：确认新增链路合理。
- 常见误区：不要只看直接依赖。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 32：漏洞修复

- 目标：最小改动修复 CVE。
- 推荐动作：单包升级并跑测试。
- 审查点：确认 advisory 已覆盖。
- 常见误区：不要做无关升级。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 33：许可证审查

- 目标：供应链合规。
- 推荐动作：导出 SBOM 或依赖清单。
- 审查点：确认许可证策略。
- 常见误区：不要只依赖人工记忆。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 34：脚本烟测

- 目标：轻量验证服务。
- 推荐动作：`uv run --with httpx python scripts/smoke.py`。
- 审查点：确认脚本依赖显式。
- 常见误区：不要要求全局安装 httpx。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 35：本地工具试用

- 目标：临时评估工具。
- 推荐动作：`uvx tool-name`。
- 审查点：确认不污染项目。
- 常见误区：不要把试用工具加入 default。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 36：项目模板升级

- 目标：更新团队基线。
- 推荐动作：修改模板后新建样例验证。
- 审查点：确认旧项目迁移路径。
- 常见误区：不要强制旧项目立即同步。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 37：多服务仓库

- 目标：控制服务边界。
- 推荐动作：用 workspace 或明确子项目。
- 审查点：确认共享 lock 是否有价值。
- 常见误区：不要只因目录多就 workspace。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 38：内部库发布

- 目标：维护兼容范围。
- 推荐动作：使用 `[project]` 依赖范围。
- 审查点：确认 build backend。
- 常见误区：不要用应用 lockfile 替代发布约束。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 39：可编辑安装

- 目标：开发内部包。
- 推荐动作：依赖 workspace member。
- 审查点：确认修改即时可见。
- 常见误区：不要复制包到多个目录。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 40：生产只读环境

- 目标：限制运行时写入。
- 推荐动作：构建阶段完成 sync。
- 审查点：确认容器启动不写依赖目录。
- 常见误区：不要启动时安装依赖。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 41：蓝绿部署

- 目标：保证版本可复现。
- 推荐动作：镜像携带 lock 对应环境。
- 审查点：确认回滚镜像可启动。
- 常见误区：不要部署时重新解析依赖。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 42：多 Python 版本测试

- 目标：验证兼容性。
- 推荐动作：CI matrix + uv python。
- 审查点：确认 requires-python 合理。
- 常见误区：不要只在本机版本测试。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 43：依赖上界调整

- 目标：处理破坏性上游。
- 推荐动作：修改约束并 lock。
- 审查点：确认原因记录。
- 常见误区：不要长期无解释 pin 死。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 44：临时 fork

- 目标：使用 Git source。
- 推荐动作：在 `tool.uv.sources` 表达。
- 审查点：确认回归 PyPI 计划。
- 常见误区：不要永久依赖未知分支。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 45：本地 path source

- 目标：调试跨包修改。
- 推荐动作：使用 path source。
- 审查点：确认不进入发布元数据误区。
- 常见误区：不要让绝对路径进入仓库。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 46：缓存失效

- 目标：排查 CI 变慢。
- 推荐动作：比较 cache hit 和 lock diff。
- 审查点：确认缓存 key。
- 常见误区：不要把慢归咎于 uv。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 47：权限错误

- 目标：安装目录不可写。
- 推荐动作：检查 CI 用户和缓存目录。
- 审查点：确认权限最小化。
- 常见误区：不要用 root 掩盖问题。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 48：证书轮换

- 目标：处理内部 CA 更新。
- 推荐动作：更新证书配置。
- 审查点：确认构建日志。
- 常见误区：不要关闭 TLS 校验。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 49：环境变量

- 目标：统一配置入口。
- 推荐动作：用 settings 管应用配置。
- 审查点：确认不写进 lockfile。
- 常见误区：不要把 secret 放入 pyproject。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

### 场景 50：发布前审计

- 目标：确认可交付。
- 推荐动作：跑 locked sync、lint、test、build。
- 审查点：确认 diff 只含预期文件。
- 常见误区：不要把环境修复和业务改动混杂。
- 交付信号：命令可以在干净环境里重复执行。
- 维护动作：把成功路径写入项目文档或模板。

## 维护节奏

| 节奏 | 动作 |
| --- | --- |
| 每次 PR | 检查 pyproject 与 lockfile 是否一致 |
| 每周 | 查看依赖升级和安全提示 |
| 每两周 | 验证 Docker cache 与 CI cache 是否有效 |
| 每月 | 做一次小版本依赖维护 |
| 每季度 | 评估 Python 版本基线 |
| 每季度 | 复查私有源和证书配置 |
| 每季度 | 检查 workspace 边界是否仍合理 |
| 重大升级前 | 创建单独升级分支 |
| 重大升级后 | 更新模板和 FAQ |
| 事故复盘后 | 把排障步骤转成 checklist |

稳定的 uv 工作流不是一次配置完成的。

它需要随着 Python 版本、依赖生态、部署平台和组织安全要求一起维护。


## 最终落地守则

uv adoption 要能被审查。

uv adoption 要能被重复。

uv adoption 要能被回滚。

uv adoption 要能被解释。

uv adoption 要能服务本地、CI、Docker 和生产环境。

如果一条规则只能在某个人机器上成立，它就还不是工程规则。

如果一条命令不能在干净环境里重跑，它就还不是团队入口。

如果一个依赖变化不能被 code review 解释，它就还不是稳定变更。

如果一次迁移让排障路径变多，它就需要重新拆小。

把 uv 用好，不是追求工具统一的形式，而是把 Python 项目的不确定性压到可审查、可复现、可维护的边界里。

## 延伸阅读

- [uv documentation](https://docs.astral.sh/uv/)
- [uv: Working on projects](https://docs.astral.sh/uv/guides/projects/)
- [uv: Tools](https://docs.astral.sh/uv/guides/tools/)
- [uv: pip interface](https://docs.astral.sh/uv/pip/)
- [PEP 723: Inline script metadata](https://peps.python.org/pep-0723/)
- [给 Node.js 开发者的 FastAPI 迁移地图](./express-to-fastapi-migration-map/)
- [FastAPI 架构决策与可观测性](./fastapi-architecture-observability-for-tls/)
