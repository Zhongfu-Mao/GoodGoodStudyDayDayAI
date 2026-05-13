---
title: "uv 実践ガイド：Python の依存関係、環境、プロジェクト、コマンドを一つにまとめる"
date: 2026-05-13
category: engineering
description: "uv を Python プロジェクト管理の入口として捉え、依存関係、lockfile、仮想環境、script、tool、CI、FastAPI テンプレートを整理する。"
difficulty: intermediate
plainSummary: "uv は単に速い pip ではありません。Python version、project、dependency、lockfile、virtual environment、command、tool、CI を再現可能なチームワークフローにまとめるための実用的な入口です。"
tags:
  - "Python"
  - "Developer Tools"
  - "FastAPI"
lang: ja
coverImage: "/images/engineering/practice/uv-python-toolchain-cover.png"
draft: false
---

# uv 実践ガイド：Python の依存関係、環境、プロジェクト、コマンドを一つにまとめる

> 鮮度メモ：この記事は 2026-05-13 時点で確認しています。uv は開発が速いツールなので、コマンドや lockfile の挙動は公式ドキュメントで確認してください。

FastAPI が「Python で現代的な API サービスを書く」ための道具だとすると、uv はその一段下の土台です。チームで Python プロジェクトをどう作り、依存関係をどう固定し、どう実行し、どう CI で再現するかを扱います。

Python で困りやすいのは、言語そのものより環境管理です。`pip`、`venv`、`pip-tools`、Poetry、Pipenv、conda、system Python が混ざり、どれが正しい入口なのか分からなくなります。依存関係が `requirements.txt` にあるのか、`pyproject.toml` にあるのか、CI とローカルで同じなのかも曖昧になりがちです。

uv の価値は、単に `pip install` を速くすることではありません。Python version、project、dependency、virtual environment、lockfile、command execution、one-shot tool を一つの入口にまとめるところにあります。

![uv Python toolchain map](/images/engineering/practice/uv-python-toolchain.svg)

![uv workflow modules visual](/images/engineering/practice/uv-workflow-modules-visual.png)

## Python プロジェクト管理はなぜつらかったのか

Node.js では、プロジェクトに入ると `package.json` と lockfile を見れば、依存関係、script、実行方法がだいたい分かります。Python では長い間、そこが統一されていませんでした。

よくある混乱です。

- ある人は system Python、ある人は pyenv、ある人は conda を使っている。
- 依存関係が `requirements.txt` と `pyproject.toml` に分かれている。
- CI は `pip install -r requirements.txt` だが、ローカルには追加パッケージが入っている。
- `black`、`ruff`、`pytest` などの開発ツールがグローバルに入っていて、バージョンがプロジェクトとずれる。
- 開発者が `.venv` を commit すべきか迷う。
- notebook、script、service が別々の環境手順を持っている。

一つ一つは小さく見えますが、チームでは大きな摩擦になります。環境差分がコードの問題に見えたり、CI failure が「ローカルでは動く」に変わったりします。

uv はこの問題を、より単純な流れに寄せます。project は `pyproject.toml`、lock は `uv.lock`、runtime は `.venv`、実行は `uv run`、一時的な tool は `uvx` または `uv tool` です。

## uv の六つの概念

| 概念 | 役割 | 代表的なコマンド |
| --- | --- | --- |
| Python versions | Python version の install / pin | `uv python install` |
| Project | project の初期化と管理 | `uv init` |
| Dependencies | 依存関係の追加・削除 | `uv add` / `uv remove` |
| Lockfile | 解決結果を固定する | `uv lock` |
| Sync | lockfile に基づいて環境を同期する | `uv sync` |
| Run / Tool | 環境内で command や tool を実行する | `uv run` / `uvx` |

この六つをまとめて理解して初めて、uv の価値が見えます。速い pip としてだけ使うと、チーム開発上のメリットを取りこぼします。

## 最小のプロジェクトフロー

FastAPI demo は次のように始められます。

```bash
uv init fastapi-demo
cd fastapi-demo
uv add "fastapi[standard]"
uv run fastapi dev
```

テストと lint を追加します。

```bash
uv add --dev pytest ruff
uv run pytest
uv run ruff check .
```

lock と sync です。

```bash
uv lock
uv sync --locked
```

重要なのは、入口が一つになることです。`pyproject.toml` と `uv.lock` があり、`uv sync` で環境を作り、`uv run` で command を実行する。この形なら、ローカルと CI を揃えやすくなります。

## チーム運用ルール

uv を採用するなら、最初にルールを書いておくと安全です。

| ファイル / ディレクトリ | commit するか | 理由 |
| --- | --- | --- |
| `pyproject.toml` | commit する | project metadata と依存関係の宣言 |
| `uv.lock` | application project では commit する | 再現可能な環境のため |
| `.venv/` | commit しない | ローカル生成物 |
| `.python-version` | チーム方針による | Python version を固定したい場合 |
| `requirements.txt` | 移行期は残してよい | 旧フローとの互換 |

application project では `uv.lock` を commit するのが基本です。library project では lockfile を commit するかどうか、依存関係の互換性テスト方針に合わせて判断します。

CI では lockfile に基づいて同期します。

```bash
uv sync --locked
uv run pytest
uv run ruff check .
```

これにより、CI が意図せず別の dependency set を解決することを防ぎます。

## FastAPI サービステンプレート

uv は FastAPI サービスの土台に向いています。

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

よく使う command：

```bash
uv add "fastapi[standard]"
uv add --dev pytest ruff
uv run fastapi dev
uv run pytest
uv run ruff check .
```

サービス開発、テスト、lint、CI が同じ入口で説明できるため、チーム内で共有しやすくなります。

## 一時的な tool、グローバル tool、script

uv は tool 実行にも便利です。

一時的に tool を実行します。

```bash
uvx ruff check .
```

project 内で command を実行します。

```bash
uv run pytest
```

一時的な依存関係を付けて script を実行します。

```bash
uv run --with httpx python scripts/smoke_test.py
```

グローバルに何でも install するより、プロジェクトや script の近くに tool version を置けるほうが再現性は高くなります。

## script と PEP 723

Python には単一ファイル script の文化もあります。PEP 723 は、Python script の中に inline metadata を書くための形式を定義しています。uv はこのワークフローにも対応しています。

小さな調査 script、smoke test、データ修復、社内運用ツールでは、script 自体が必要な依存関係を説明できることに価値があります。

ただし、長期的に運用する service code は project dependency に入れるべきです。一時的な script と本体 application の境界は分けます。

## Docker と CI の考え方

Docker では Node.js と同じように、先に dependency metadata と lockfile を copy し、依存関係を sync してから application code を copy すると cache を使いやすいです。

```dockerfile
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev
COPY app ./app
CMD ["uv", "run", "fastapi", "run", "app/main.py"]
```

実際の Dockerfile は base image、user permission、uv の install 方法、native dependency の有無で変わります。重要なのは、`pyproject.toml` と `uv.lock` が build cache と再現性の中心になるという考え方です。

## 旧フローからの移行

全 Python project を一気に uv 化する必要はありません。安全な移行は三段階です。

第一段階では、新規 project だけ uv を使います。新しい FastAPI service、Agent tool、data script は `uv init` から始めます。

第二段階で、依存関係を `pyproject.toml` に寄せ、`uv.lock` を生成して commit します。CI は `uv sync --locked` と `uv run ...` に寄せます。

第三段階で、README、Makefile、CI、Dockerfile に散らばった `pip install`、global tool、手動 venv 手順を整理します。

移行期に `requirements.txt` を残すのは構いません。ただし、どれが source of truth なのかは必ず明記します。

## リスクと境界

uv は強力ですが、すべての Python 環境問題を自動で解決するわけではありません。

| 場面 | 注意点 |
| --- | --- |
| 社内ネットワーク | package index、proxy、credential、cache の設定 |
| 科学計算 / GPU | conda、system library、CUDA 依存が必要な場合 |
| 複数 OS のチーム | macOS / Linux / Windows の wheel 差異 |
| library project | lockfile 方針を application と分ける |
| 旧 project 移行 | CI、Docker、deploy script を一気に変えない |
| tool の進化 | command の詳細は公式 docs で確認する |

現時点では、uv は Python 工程の有力な標準解になりつつあります。特に Web API、AI application、Agent tool、data script、CI workflow では、最初に検討する価値が高いです。一方で、GPU や社内 mirror など特殊条件は現場に合わせて設計します。

## uv をチームの標準入口にする

uv は「project entrypoint」として使うと価値が出ます。

これは、すべての人が uv の細かい command を暗記するという意味ではありません。

開発者、CI job、container build、automation Agent が repository に入ったとき、同じ file を見て、同じ手順を実行し、同じ種類の environment を得られるようにする、という意味です。

標準入口を作るために見る file は、だいたい次の通りです。

- `pyproject.toml`：project metadata、runtime dependency、development dependency、tool config。
- `uv.lock`：依存関係解決の固定結果。
- `.python-version`：必要に応じて Python version を pin する。
- `README.md` または `CONTRIBUTING.md`：最小限の起動手順。
- `Makefile`、`justfile`、`package.json` scripts：既存の command wrapper があるなら内部で uv を呼ぶ。

標準入口の command は、次の形に寄せます。

```bash
uv sync --locked
uv run pytest
uv run ruff check .
uv run fastapi dev
```

大事なのは、ドキュメントを「Python を install して、venv を作り、activate して、requirements を install する」から、「uv を install して `uv sync` を実行する」に圧縮することです。

この圧縮は AI engineering でも効きます。

Agent、automation script、CI、temporary verification environment は、人間の local machine の履歴を覚えていません。

必要なのは再現可能な入口です。

`uv sync --locked` で復元できる project は、口頭手順の多い project より automation に渡しやすくなります。

## 推奨 pyproject.toml 構成

FastAPI service なら、まず次のような構成から始められます。

唯一の正解ではありませんが、Web API、Agent API、internal tool service の多くに合います。

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

`requires-python` は明示します。

チームが Python 3.12 を前提にするなら、project が静かに Python 3.10 で動いてしまう状態は避けます。

`dependencies` には runtime に必要な package だけを置きます。

test、lint、type check は `dev` dependency group に分けます。

tool config はできるだけ `pyproject.toml` に寄せると、root directory に config file が散らばりにくくなります。

## command を三層に分ける

大きいチームでは、全員に uv command を直接打たせる必要はありません。

実用的には三層に分けると安定します。

| 層 | 対象 | 例 | ルール |
| --- | --- | --- | --- |
| uv native command | maintainer、CI、automation | `uv sync --locked` | 権威ある動作 |
| project script | daily developer | `make test` / `just test` | 内部で uv を呼ぶ |
| document entrypoint | external contributor | `uv sync` + `uv run ...` | command を少なくする |

Makefile を使うなら、内部で uv を呼びます。

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

`just` を使う場合も同じです。

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

wrapper command は uv を隠すためではありません。

日常操作をチームの言葉に固定するためのものです。

ドキュメントに `make test` と書いても、Makefile の中で `uv run pytest` が呼ばれていれば、再現性は保てます。

## dependency group の設計

uv の dependency groups は、runtime と engineering workflow の境界を表現するのに向いています。

最初は次の程度で十分です。

| group | 入れるもの | 入れないもの |
| --- | --- | --- |
| default dependencies | service 起動に必要な package | test framework、lint tool |
| `dev` | pytest、ruff、mypy、debug tool | production で不要な heavy SDK |
| `docs` | documentation build tool | service runtime dependency |
| `notebook` | data analysis、exploration dependency | API service main path |
| `loadtest` | load testing tool | default development dependency |

最初から group を増やしすぎないほうがよいです。

dependency group の目的は分類そのものではなく、install surface と認知負荷を減らすことです。

独立して install したい場面があるなら、その group は分ける価値があります。

API service runtime は default dependencies だけでよい。

local development は default + dev が必要。

docs build job は docs が必要。

notebook environment は pandas、polars、matplotlib、duckdb などを持つかもしれませんが、それらを production API container に入れる必要はありません。

## lockfile の意味

`uv.lock` は単なる生成 file ではありません。

依存関係解決の監査可能な記録です。

application project では、lockfile は少なくとも四つの役割を持ちます。

一つ目は、CI と local の dependency version を揃えることです。

二つ目は、container build で dependency layer を cache しやすくすることです。

三つ目は、dependency upgrade を明示的な diff にすることです。

四つ目は、障害時の rollback を簡単にすることです。

release 後に compatibility issue が起きた場合、code と lockfile が Git にあれば、何が変わったのかを比較できます。

だから application project では `uv.lock` を commit するのが基本です。

library project では判断が必要です。

library は複数の application から組み合わされるので、dependency range の互換性テストが重要です。

ただし library project でも、development と CI の再現性のために lockfile を使う価値はあります。

重要なのは方針を明記することです。

## dependency upgrade のリズム

uv を使うと dependency upgrade は楽になります。

ただし、楽になるほど放置もしやすくなります。

upgrade は三種類に分けると扱いやすいです。

| 種類 | 頻度 | やり方 |
| --- | --- | --- |
| security patch | できるだけ早く | 単独 PR、full test |
| minor upgrade | 週次または隔週 | まとめて更新、release notes を読む |
| major upgrade | 独立計画 | compatibility branch で段階移行 |

特定 package だけ上げるなら、次のようにします。

```bash
uv lock --upgrade-package fastapi
uv sync --locked
uv run pytest
uv run ruff check .
```

全体を上げる場合です。

```bash
uv lock --upgrade
uv sync --locked
uv run pytest
```

小さい service ならまとめて上げても扱えます。

大きい service では、重要 package ごとに分けたほうが安全です。

FastAPI、Pydantic、SQLAlchemy、OpenTelemetry SDK、cloud vendor SDK、LLM SDK は runtime behavior に影響しやすいので、install 成功だけで判断しません。

## FastAPI との組み合わせ

uv と FastAPI の接点は dependency install だけではありません。

service lifecycle 全体に関わります。

project 作成：

```bash
uv init api-service
uv add "fastapi[standard]" pydantic-settings
uv add --dev pytest pytest-asyncio ruff
```

local development：

```bash
uv run fastapi dev app/main.py
```

test：

```bash
uv run pytest
```

production start：

```bash
uv run fastapi run app/main.py
```

より成熟した production environment では、`uvicorn`、Gunicorn worker、container entrypoint、platform-specific command を使うこともあります。

外側が変わっても、command は uv が同期した environment の中で実行する、という原則は変えません。

local は uv、production は system Python、という分裂は避けます。

## Agent engineering との組み合わせ

Agent project は通常の API service より dependency が膨らみやすいです。

一つの Agent backend が同時に次のものを使うことがあります。

- Web framework。
- LLM SDK。
- vector database client。
- document parser。
- browser automation tool。
- cloud storage SDK。
- observability SDK。
- private internal package。
- notebook exploration dependency。

全部を default environment に入れると、project はすぐ重くなります。

dependency group で execution path を分けます。

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

API main path は notebook dependency に引っ張られません。

RAG worker は `rag` を使います。

browser automation worker は `browser` を使います。

exploration environment は `notebook` を使います。

dependency group は microservice decomposition の代わりではありません。

repository 内の runtime surface を見やすくするためのものです。

ある group が独立 deploy、独立 scaling、独立 failure domain を持つようになったら、service や worker への分割を検討できます。

## CI template

GitHub Actions では、次の構造から始められます。

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

ポイントは三つです。

CI で install step を作り直さないこと。

`--locked` を使い、lockfile mismatch を早く検出すること。

すべての tool を `uv run` 経由で project environment の中で実行すること。

cache は uv cache と lockfile を軸に後から最適化します。

cache は performance optimization であり、install semantics を変えるものではありません。

## Dockerfile template

Dockerfile は project によって違いますが、基本形は次のように考えられます。

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

`.venv/bin` を `PATH` に入れると、production command は environment 内の executable を直接使えます。

`CMD ["uv", "run", "..."]` を選ぶ team もあります。

どちらでも構いません。

重要なのは、image の中に複数の environment を混在させないことです。

build stage で `uv sync --locked --no-dev` したなら、runtime stage で一時的に `pip install` しません。

dependency は build time に解決し、runtime は service を起動するだけにします。

## private package index と enterprise network

enterprise environment で uv を採用するとき、本当に難しいのは command ではなく network と credential です。

先に確認すべきことがあります。

- private PyPI mirror を使うか。
- company proxy が必要か。
- internal certificate が必要か。
- private Git dependency があるか。
- CI runner が同じ package index に到達できるか。
- container build environment が同じ package index に到達できるか。
- credential は secret manager から注入されるか。
- lockfile に公開してはいけない情報が入らないか。

public article では一つの万能設定を提示できません。

network policy は会社ごとに違うからです。

ただし原則は明確です。

package index、credential、proxy は environment configuration であり、開発者個人の手順書に散らばらせるべきではありません。

project は必要な capability を明記し、実際の credential は platform configuration に任せます。

## troubleshooting

`uv sync --locked` が失敗する。

まず `pyproject.toml` が変わったのに `uv.lock` が更新されていない可能性を確認します。

通常は local で `uv lock` を実行し、diff を確認して lockfile を commit します。

`uv run pytest` で module が見つからない。

test が未宣言 package に依存していないか、project package layout が正しいかを確認します。

local global install で直すのは避けます。

CI は通るが local が落ちる。

Python version、platform difference、environment variable、private index access、古い `.venv` を確認します。

必要なら `.venv` を削除して `uv sync --locked` をやり直します。

local は通るが CI が落ちる。

lockfile が commit されているか、CI が `--locked` を使っているか、system library が足りないか、uncommitted file に依存していないかを確認します。

container build は通るが起動で落ちる。

startup command が uv environment 内で実行されているか、`PATH` が `.venv/bin` を含むか、production image に runtime dependency が入っているかを確認します。

dependency install が遅い。

uv 自体が遅いのか、network、private index、native compilation、cache miss が原因なのかを分けて見ます。

最初から toolchain を変えるのではなく、遅さの場所を特定します。

## migration checklist

既存 Python project を uv に移すときは、次の checklist が役に立ちます。

- 現在の source of truth である dependency file を確認する。
- 現在の Python version を記録する。
- 現在の CI install command を記録する。
- 現在の deploy install command を記録する。
- dependency declaration を `pyproject.toml` に寄せる。
- `uv.lock` を生成する。
- local で `uv sync --locked` を実行する。
- test と lint を実行する。
- CI を `uv sync --locked` に変更する。
- Dockerfile または deploy script を変更する。
- old entrypoint を削除または明確に補助扱いにする。
- README に新しい入口を書く。
- `.venv/` が `.gitignore` されていることを確認する。
- lockfile が code review の対象になっていることを確認する。
- 最初の dependency upgrade が問題なく進むか観察する。

checklist は形式ではありません。

local だけ移した、CI だけ移した、deploy が古いまま残った、という半端な状態を避けるためのものです。

## decision guide

新しい FastAPI service なら、uv を default にする価値が高いです。

新しい Agent backend なら、uv を default にし、default、dev、rag、notebook などの dependency boundary を最初から分けます。

既存 service なら、business refactor と同時にやらず、pilot migration として進めます。

conda、CUDA、system library、特殊な binary package に強く依存する project では、まず dependency chain を確認し、uv がどの layer を担当するかを決めます。

Poetry を安定運用している team が、流行だけで全 project を書き換える必要はありません。

uv の利点は大きいですが、migration の目的は摩擦を下げることです。

新規 project は uv、既存 project は価値とリスクを見て段階移行、という方針が現実的です。


## uv adoption handbook

この章では uv を engineering practice として扱います。

単なる command collection ではなく、Python project を再現可能に運用するための handbook です。

uv adoption で最初に決めるべきことは、すべての旧 tool を一度に置き換えることではありません。

まず source of truth を固定します。

- project metadata は `pyproject.toml` を正とする。
- dependency resolution は `uv.lock` を正とする。
- command execution は `uv run` を正とする。
- environment sync は `uv sync` を正とする。
- temporary tool は `uvx` または `uv run --with` を使う。

### adoption layers

| layer | goal | action | acceptance signal |
| --- | --- | --- | --- |
| personal script layer | one-shot script を global environment から切り離す | `uv run --with` または inline metadata | script が依存関係を説明できる |
| project bootstrap layer | 新規 project の入口を統一する | `uv init` から始める | `pyproject.toml` が生成される |
| team collaboration layer | 依存関係の解決を review 対象にする | `uv.lock` を commit する | dependency diff を確認できる |
| CI layer | build machine の暗黙の再解決を止める | `uv sync --locked` を使う | lockfile mismatch で失敗する |
| release layer | container と runtime を lockfile に寄せる | lockfile から runtime dependency を install | local と production の差分が減る |
| platform layer | Python version、index、cache、credential を統一する | template と docs に落とす | 環境調査の負担が減る |

### pyproject template: FastAPI application

次は application service 向けの starting template です。

runtime、dev、lint、test、type、observability の境界を明示します。

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

template は固定解ではありません。

重要なのは、runtime dependency、development dependency、optional capability を混ぜないことです。

### pyproject template: library package

library package では publish metadata と compatibility range がより重要です。

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

library package では lockfile を commit する場合も、install contract として扱わない場合もあります。

published dependency range と maintainer test environment は分けて説明します。

## dependency groups strategy

uv は `[dependency-groups]` で local development dependency を管理します。

これは extras とは別の概念です。

extras は published package の optional capability です。

dependency groups は maintenance、test、lint、type check、docs、experiment、operation tool に向いています。

| group | purpose | typical dependencies | boundary |
| --- | --- | --- | --- |
| dev | default development entry | lint、test、type をまとめる | default sync に向く |
| lint | style と static check | ruff、codespell | CI で独立実行しやすい |
| test | test dependency | pytest、pytest-asyncio、respx | runtime に入れない |
| type | type check | mypy、pyright | 成熟度に応じて有効化 |
| docs | documentation build | mkdocs、sphinx | service image に入れない |
| otel | observability experiment | OpenTelemetry SDK と exporters | runtime では環境ごとに選択 |
| rag | RAG dependency | vector DB client、parser | base API service を重くしない |
| notebook | exploration environment | ipykernel、jupyter | CI default path に入れない |
| bench | benchmark | locust、pytest-benchmark | 必要なときだけ install |
| security | security scan | pip-audit、bandit | dedicated job で実行 |

### group naming rules

- group name は用途を表す。
- `dev` は aggregate group として使える。
- `lint`、`test`、`type` は分けやすい。
- `rag`、`agent`、`notebook` は capability domain を表す。
- すべてを `dev` に入れない。
- runtime dependency を CI-only group に入れない。
- notebook dependency を production image に入れない。
- group 間の conflict を放置しない。
- 意図的な conflict は理由を書く。
- default group が多すぎると環境が重くなる。
- default group が少なすぎると tool が不足しやすい。
- default policy は main workflow に合わせる。

### group command reference

| goal | command or location |
| --- | --- |
| add dev dependency | `uv add --dev pytest` |
| add lint group | `uv add --group lint ruff` |
| sync only dev | `uv sync --only-dev` |
| exclude dev | `uv sync --no-dev` |
| sync a group | `uv sync --group lint` |
| sync only a group | `uv sync --only-group lint` |
| sync all groups | `uv sync --all-groups` |
| disable default groups | `uv sync --no-default-groups` |
| run while excluding group | `uv run --no-group notebook pytest` |
| configure default groups | set `default-groups` in `[tool.uv]` |

## lockfile strategy

lockfile は uv adoption の中心です。

uv を install accelerator として使うだけでは、reproducibility の利点を十分に得られません。

- application project では `uv.lock` を commit する。
- service image は `uv.lock` から build する。
- CI では `--locked` を使う。
- dependency upgrade は review 対象にする。
- security upgrade は diff を小さくする。
- major upgrade は独立した PR にする。
- lockfile conflict は手でつなげず再解決する。
- platform-specific dependency は marker で表現する。
- private source change は lockfile change と一緒に review する。
- lockfile を noise として扱わない。

### lockfile operation matrix

| case | command | note |
| --- | --- | --- |
| check lock freshness | `uv lock --check` | early CI job に向く |
| update lock | `uv lock` | dependency declaration 変更後に使う |
| upgrade all locked packages | `uv lock --upgrade` | maintenance window に向く |
| upgrade one package | `uv lock --upgrade-package httpx` | security fix に向く |
| sync without lock update | `uv sync --locked` | CI に向く |
| run without lock update | `uv run --locked pytest` | validation script に向く |
| use lock without freshness check | `uv sync --frozen` | special build case に向く |
| export requirements | `uv export --format requirements.txt` | legacy platform support |
| export SBOM | `uv export --format cyclonedx1.5` | supply chain audit |

## CI reference pipeline

CI は local workflow を別物にする場所ではありません。

より厳密な形で local workflow を再現します。

### base job

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

### grouped jobs

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

grouped job では、必要な group を先に sync し、command phase では `--no-sync` を使うと分かりやすくなります。

### CI review points

- Python version が固定されているか。
- `uv sync --locked` を使っているか。
- uv cache を使っているか。
- global `pip install` を避けているか。
- `uv run` を bypass していないか。
- lint、test、type を独立して確認できるか。
- lockfile stale を早く検出できるか。
- private index failure の情報が足りているか。
- Docker build 前に lockfile を検証しているか。
- dependency upgrade PR で security scan を実行しているか。

## Docker reference patterns

production image では reproducibility と small attack surface を重視します。

development image は dev group を含めても構いません。

production image には notebook、benchmark、test tool、debug tool を入れすぎないようにします。

| image type | dependency policy | benefit | caution |
| --- | --- | --- | --- |
| local development image | include dev group | debug しやすい | size が大きい |
| CI test image | include test/lint/type | result が安定 | production には使わない |
| production API image | exclude dev group | 小さくしやすい | debug tool は少ない |
| worker image | worker runtime のみ | queue task を独立 scaling | health check が必要 |
| GPU image | system layer で CUDA を扱う | uv は Python layer を担当 | build complexity が高い |

### Dockerfile checklist

- 先に `pyproject.toml` と `uv.lock` を copy する。
- 次に `uv sync --locked --no-dev` を実行する。
- 最後に application code を copy する。
- `.venv` を image source として commit しない。
- build 中の unconstrained `pip install` を避ける。
- test dependency を production layer に入れない。
- startup command が uv environment を見つけられるか確認する。
- health check が dev tool に依存しないか確認する。
- private credential が final image layer に残らないようにする。
- system library と Python wheel が合うか確認する。
- image build と runtime の Python major version を合わせる。
- multi-stage build で runtime dependency を落とさない。

## enterprise network and private indexes

enterprise environment で難しいのは command ではなく network と credential です。

先に次の点を確認します。

- PyPI に直接接続できるか。
- internal mirror が必須か。
- Git dependencies が許可されているか。
- build time network access が許可されているか。
- offline build が必要か。
- company CA が必要か。
- HTTP proxy が必要か。
- per-index credential が必要か。
- dependency allowlist があるか。
- SBOM が必要か。
- vulnerability scan が必要か。
- build log retention が必要か。

### private source strategies

| strategy | approach | benefit | risk |
| --- | --- | --- | --- |
| simple mirror | all packages through one internal index | simple configuration | upstream difference が見えにくい |
| explicit index | important packages specify source | supply chain boundary が明確 | maintenance cost が高い |
| platform-specific index | CPU/GPU wheel source を分ける | ML case に向く | marker が重要 |
| offline wheelhouse | prepare wheels before build | isolated network に向く | upgrade flow が重い |
| proxy cache | reuse after first download | speed benefit | cache invalidation が必要 |

enterprise network の error をすべて uv の問題と見なさないことが重要です。

certificate、proxy、DNS、mirror delay、allowlist、system library が dependency error として見えることがあります。

## migration from pip

1. 現在の `requirements.txt` が手書きか確認する。
2. `requirements.in` があるか確認する。
3. 複数の environment file があるか確認する。
4. production dependency と development dependency が混ざっていないか確認する。
5. `uv add -r requirements.txt` で dependency を import する。
6. test tool を `dependency-groups.test` に移す。
7. lint tool を `dependency-groups.lint` に移す。
8. notebook tool を独立 group に移す。
9. `uv.lock` を生成する。
10. `uv sync --locked` で環境を作り直す。
11. test を実行する。
12. lint を実行する。
13. import path を確認する。
14. deploy script を確認する。
15. exported `requirements.txt` を残すか決める。

### pip migration risks

- old file に implicit order dependency がある。
- old file に editable local package がある。
- old file に private index option がある。
- development tool が runtime dependency として混ざっている。
- legacy platform が `requirements.txt` しか読めない。
- old CI が global tool に依存している。
- old Dockerfile が system Python に package がある前提で動く。
- old script が `uv run python` ではなく直接 `python` を呼ぶ。

## migration from Poetry

Poetry migration は command replacement だけではありません。

現在 Poetry のどの機能を使っているかを先に確認します。

| Poetry capability | uv migration direction | note |
| --- | --- | --- |
| dependency declaration | move to `[project]` and `[dependency-groups]` | avoid dual source of truth |
| extras | move to `[project.optional-dependencies]` | keep publish semantics |
| scripts | move to `[project.scripts]` or command docs | do not lose CLI entry |
| private source | move to uv index/source config | check credential flow |
| lockfile | generate `uv.lock` again | do not manually convert |
| build backend | check whether Poetry backend is still needed | especially for libraries |
| workspace need | evaluate uv workspace | do not force multiple packages into one project |
| CI command | replace `poetry install` with `uv sync --locked` | update cache strategy too |

Poetry が安定している project は段階的に移せます。

CI が遅い、dependency drift がある、tool entry が散らばっている、workspace が必要、という project から始めると効果が見えやすいです。

## monorepo and workspaces

uv workspace は、一つの repository に複数の Python package がある場合に向いています。

typical structure は次の通りです。

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

workspace の中心的な価値は shared lockfile です。

API、worker、internal library が同じ dependency set で協調できます。

### workspace decision criteria

- repository に複数の package があるか。
- package が独立して test または release されるか。
- API と worker が domain code を共有するか。
- 複数の Agent runtime が tool library を共有するか。
- root から特定 package の command を実行したいか。
- 一つの lockfile で repository 全体を管理したいか。
- workspace member の constraints を一緒に解決できるか。
- member 間に conflict がないか。
- root project の役割が明確か。
- CI を package ごとに分けられるか。

### workspace command reference

| goal | command or config |
| --- | --- |
| lock whole workspace at root | `uv lock` |
| sync default environment at root | `uv sync` |
| run command in package | `uv run --package api pytest` |
| sync package | `uv sync --package api` |
| add workspace dependency | use `{ workspace = true }` in `[tool.uv.sources]` |
| inspect dependency tree | `uv tree` |

## Agent and FastAPI engineering

Agent backend は通常の API より dependency boundary が複雑です。

model SDK、vector DB、browser tool、file parser、OpenTelemetry、queue、database、security scanner を一つの default set に入れないようにします。

| dependency domain | contents | boundary |
| --- | --- | --- |
| default | FastAPI、config、HTTP client、core domain | required to start API |
| agent | model SDK、tool registry、state machine | required by Agent runtime |
| rag | vector DB、embedding client、document parser | required by retrieval |
| browser | browser automation client | only for selected worker |
| otel | trace exporter、instrumentation | choose by deployment environment |
| eval | evaluation framework、sample tool | not for production API |
| notebook | analysis and exploration tool | not for production API |
| worker | queue and background task dependency | used by worker image |

Agent/FastAPI project における uv の価値は、これらの boundary を project structure に書き込めることです。

### Agent service command samples

| goal | command |
| --- | --- |
| start API | `uv run fastapi dev app/main.py` |
| run worker | `uv run python -m app.worker` |
| run eval | `uv run --group eval pytest tests/evals` |
| run API tests | `uv run pytest tests/api` |
| run tool tests | `uv run pytest tests/tools` |
| export OpenAPI | `uv run python scripts/export_openapi.py` |
| smoke request | `uv run --with httpx python scripts/smoke.py` |
| inspect tree | `uv tree` |

## troubleshooting handbook

### issue 01: stale lockfile

- signal: `uv sync --locked` fails.
- check: check whether `pyproject.toml` changed.
- fix: run `uv lock` and review diff.
- follow-up: encode the lesson in template or CI.

### issue 02: unsatisfiable dependency

- signal: No solution found.
- check: check upper bounds, Python version, group conflicts.
- fix: narrow constraints or split conflict groups.
- follow-up: encode the lesson in template or CI.

### issue 03: package missing in CI

- signal: ModuleNotFoundError.
- check: check global local dependency.
- fix: declare dependency in correct group.
- follow-up: encode the lesson in template or CI.

### issue 04: local and CI differ

- signal: local passes but CI fails.
- check: check bypass of `uv run`.
- fix: unify command entry.
- follow-up: encode the lesson in template or CI.

### issue 05: production image missing package

- signal: import error at startup.
- check: check `--no-dev` excluded runtime dependency.
- fix: move dependency to default.
- follow-up: encode the lesson in template or CI.

### issue 06: image too large

- signal: test tools in production layer.
- check: check group boundary.
- fix: exclude dev group in production sync.
- follow-up: encode the lesson in template or CI.

### issue 07: slow install

- signal: CI downloads or compiles too much.
- check: check cache, private index, native wheel.
- fix: cache uv and install system libs.
- follow-up: encode the lesson in template or CI.

### issue 08: private index auth failure

- signal: 401 or 403.
- check: check credential injection and index config.
- fix: use CI secrets.
- follow-up: encode the lesson in template or CI.

### issue 09: certificate failure

- signal: TLS certificate error.
- check: check enterprise CA.
- fix: configure certificate chain.
- follow-up: encode the lesson in template or CI.

### issue 10: GPU package mismatch

- signal: CUDA component missing at runtime.
- check: check wheel source and system CUDA.
- fix: separate system layer and Python layer.
- follow-up: encode the lesson in template or CI.

### issue 11: workspace member not reflected

- signal: member change not visible.
- check: check workspace source reference.
- fix: confirm editable behavior.
- follow-up: encode the lesson in template or CI.

### issue 12: script dependency drift

- signal: script works on one machine only.
- check: check global environment use.
- fix: use `uv run --with` or inline metadata.
- follow-up: encode the lesson in template or CI.

### issue 13: tool version drift

- signal: ruff result differs.
- check: check global ruff.
- fix: put ruff in lint group.
- follow-up: encode the lesson in template or CI.

### issue 14: lock conflict

- signal: merge conflict in lockfile.
- check: do not hand merge content.
- fix: run `uv lock` again.
- follow-up: encode the lesson in template or CI.

### issue 15: requirements export incomplete

- signal: legacy platform fails.
- check: check extras and groups.
- fix: define export target.
- follow-up: encode the lesson in template or CI.

## command reference

| operation | command |
| --- | --- |
| create project | `uv init service-name` |
| add runtime dependency | `uv add httpx` |
| add dev dependency | `uv add --dev pytest` |
| add group dependency | `uv add --group lint ruff` |
| add optional extra | `uv add --optional cli typer` |
| remove dependency | `uv remove httpx` |
| lock dependencies | `uv lock` |
| check lock | `uv lock --check` |
| sync environment | `uv sync` |
| strict sync | `uv sync --locked` |
| exclude dev | `uv sync --no-dev` |
| only one group | `uv sync --only-group lint` |
| run command | `uv run pytest` |
| run Python | `uv run python` |
| run with temporary dependency | `uv run --with httpx python script.py` |
| one-shot tool | `uvx ruff check .` |
| inspect dependency tree | `uv tree` |
| upgrade all | `uv lock --upgrade` |
| upgrade one package | `uv lock --upgrade-package httpx` |
| export requirements | `uv export --format requirements.txt` |
| install Python | `uv python install 3.12` |
| pin Python | `uv python pin 3.12` |
| show help | `uv help` |
| show subcommand help | `uv help sync` |

## review checklist

### dependency declaration

- new dependency is in the right place.
- development tool is not in runtime dependency.
- high-risk package has reasonable version range.
- optional extra is used when appropriate.
- platform marker is correct.
- Git or path source is justified.
- private source reason is clear.
- duplicate dependency is avoided.

### lockfile

- `uv.lock` changed with dependency declaration.
- lockfile diff is explainable.
- no unrelated mass upgrade.
- security fix is minimal.
- single package upgrade is used when appropriate.
- merge conflict was resolved by re-locking.
- cross-platform impact was checked.
- CI can run locked sync.

### CI

- `uv sync --locked` is used.
- commands use `uv run`.
- cache is reasonable.
- global pip install is avoided.
- lint and test are separated.
- failure log is useful.
- private index credential is handled.
- secret is not printed.

### Docker

- lockfile cache layer is used.
- dev group is excluded.
- runtime dependency remains.
- credential is not leaked.
- Python version is fixed.
- system library is handled.
- startup command is verified.
- health check exists.

### documentation

- README states entry commands.
- `.venv` is not committed.
- lockfile policy is clear.
- legacy entry is explained.
- private index setup is documented.
- common commands are listed.
- troubleshooting path is documented.
- official docs are linked.

## FAQ

### FAQ 01: Is uv only a faster pip?

No. The pip-compatible interface is useful, but project, lockfile, sync, run, and tool workflows are the larger value.

### FAQ 02: Do projects still need virtual environments?

Yes, but uv usually manages the project environment without manual activation.

### FAQ 03: Should `.venv` be committed?

No. It is generated locally.

### FAQ 04: Should `uv.lock` be committed?

For application projects, yes. For libraries, decide based on testing and release policy.

### FAQ 05: Can requirements.txt remain?

During migration, yes. Long term, define the source of truth and export only when needed.

### FAQ 06: Can pip still be used?

It can, but a mixed main workflow increases troubleshooting cost.

### FAQ 07: Is dev group installed by default?

uv includes the dev group by default unless configuration or command flags change it.

### FAQ 08: What is the difference between extras and dependency groups?

Extras are published optional capabilities. Dependency groups are local maintenance dependencies.

### FAQ 09: Why use `--locked` in CI?

It prevents CI from silently updating the lockfile or resolving an unreviewed dependency set.

### FAQ 10: When is `--frozen` useful?

It can be useful in special builds that use the lockfile without freshness checks, but it should be used carefully.

### FAQ 11: Are workspaces for every monorepo?

No. Use them when multiple Python packages should share a lockfile.

### FAQ 12: Why split Agent dependency groups?

Model, retrieval, browser, eval, and notebook dependencies have different size and risk profiles.

### FAQ 13: Must FastAPI projects use uv?

No, but uv gives FastAPI services a clean template, lockfile, and CI command path.

### FAQ 14: What should be checked first in enterprise network errors?

Index, proxy, certificate, credential, DNS, allowlist, and cache.

### FAQ 15: How should dependency upgrades be handled?

Prefer small upgrades, single-package security fixes, and separate major upgrade reviews.

## anti-patterns

### anti-pattern 01: Treating uv as a pip accelerator

Only install commands change, while lockfile and run entry remain unmanaged.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 02: Dual source of truth

`requirements.txt` and `pyproject.toml` coexist without authority.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 03: Global tool drift

local ruff or pytest is global while CI uses another version.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 04: Dev dependencies in production image

all groups are synced into production for convenience.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 05: Lockfile skipped in review

`uv.lock` is treated as noise.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 06: Dependency upgrade hidden in feature PR

business changes and mass dependency upgrades are mixed.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 07: Unbounded groups

everything goes into `dev` and purpose becomes invisible.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 08: Workspace over-design

workspace is added when there is only one package.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 09: Private index by oral tradition

every developer configures index and credentials manually.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 10: Script depends on local machine

script has no dependency declaration.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 11: CI bypasses uv

local uses uv but CI still runs pip install.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

### anti-pattern 12: Docker bypasses lockfile

image build resolves dependencies again.

A better pattern is to make entrypoint, dependency declaration, lockfile, and validation commands reviewable assets.

## adoption roadmap

| phase | goal | deliverable |
| --- | --- | --- |
| phase 1 | default uv for new projects | templates, README, CI sample |
| phase 2 | move common scripts to uv run | reduce global environment dependency |
| phase 3 | migrate one low-risk service | validate Docker and CI |
| phase 4 | standardize dependency groups | split lint, test, type, docs |
| phase 5 | handle private index and cache | write enterprise configuration template |
| phase 6 | evaluate workspace | use only for multi-package repositories |
| phase 7 | create dependency upgrade cadence | separate security, minor, and major upgrades |
| phase 8 | feed lessons back into templates | reduce repeated troubleshooting |

The goal of the roadmap is to reduce switching cost.

The most stable uv adoption path is one where each step delivers value independently.


## operation scenario index

以下の scenario cards は project handbook にそのまま入れられる形です。

各 card は goal、recommended action、review point、common pitfall を持ちます。

### scenario 01: new FastAPI service

- goal: create reproducible API project.
- recommended action: `uv init api-service` + `uv add "fastapi[standard]"`.
- review point: confirm `uv.lock` exists.
- common pitfall: do not create random venv first.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 02: add pytest

- goal: create test entry.
- recommended action: `uv add --dev pytest`.
- review point: CI uses `uv run pytest`.
- common pitfall: do not use global pytest.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 03: add ruff

- goal: align lint result.
- recommended action: `uv add --group lint ruff`.
- review point: lint group can sync alone.
- common pitfall: do not let editor use another ruff.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 04: pin Python version

- goal: reduce version drift.
- recommended action: `uv python pin 3.12`.
- review point: CI uses same version.
- common pitfall: do not assume system Python matches.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 05: add runtime dependency

- goal: make service code runnable.
- recommended action: `uv add httpx`.
- review point: dependency enters `[project.dependencies]`.
- common pitfall: do not put runtime dependency in dev.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 06: add test dependency

- goal: keep test tools out of production.
- recommended action: `uv add --group test pytest-asyncio`.
- review point: production sync excludes test group.
- common pitfall: do not put test dependency in default.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 07: add CLI extra

- goal: expose optional library capability.
- recommended action: `uv add --optional cli typer`.
- review point: extra name is stable.
- common pitfall: do not use dev group for publish capability.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 08: upgrade security package

- goal: minimize upgrade risk.
- recommended action: `uv lock --upgrade-package package-name`.
- review point: lockfile diff is small.
- common pitfall: do not upgrade everything casually.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 09: full maintenance upgrade

- goal: refresh dependency baseline.
- recommended action: `uv lock --upgrade`.
- review point: test and regression scope are clear.
- common pitfall: do not mix with feature changes.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 10: CI locked sync

- goal: block implicit resolution.
- recommended action: `uv sync --locked`.
- review point: stale lock fails.
- common pitfall: do not let CI modify lock.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 11: rebuild local environment

- goal: remove environment pollution.
- recommended action: delete `.venv` then `uv sync --locked`.
- review point: issue is reproducible.
- common pitfall: do not patch with global install.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 12: export requirements

- goal: support legacy platform.
- recommended action: `uv export --format requirements.txt`.
- review point: export scope is clear.
- common pitfall: do not make exported file the new authority.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 13: Docker runtime dependencies

- goal: build production image.
- recommended action: `uv sync --locked --no-dev`.
- review point: service starts.
- common pitfall: do not copy local `.venv`.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 14: Docker test image

- goal: build validation environment.
- recommended action: `uv sync --locked --all-groups`.
- review point: used only for CI.
- common pitfall: do not publish as production image.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 15: private index

- goal: use internal package source.
- recommended action: configure uv index/source.
- review point: credential is not in git.
- common pitfall: do not write token into file.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 16: offline build

- goal: support isolated network.
- recommended action: prepare wheels or cache.
- review point: build does not require internet.
- common pitfall: do not open network as the fix.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 17: workspace API package

- goal: run subpackage tests from root.
- recommended action: `uv run --package api pytest`.
- review point: workspace member is declared.
- common pitfall: do not maintain separate lock in subpackage.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 18: workspace shared library

- goal: reference internal package.
- recommended action: `{ workspace = true }`.
- review point: dependency name matches.
- common pitfall: do not bypass workspace with relative path.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 19: Agent runtime

- goal: separate model and tool dependencies.
- recommended action: create `agent` group.
- review point: API image remains lean.
- common pitfall: do not put all SDKs in default.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 20: RAG capability

- goal: separate retrieval dependencies.
- recommended action: create `rag` group.
- review point: vector client installs only when needed.
- common pitfall: do not force parser packages into base service.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 21: evaluation task

- goal: separate eval tools.
- recommended action: create `eval` group.
- review point: production excludes eval.
- common pitfall: do not put eval framework in runtime.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 22: notebook support

- goal: separate exploration dependencies.
- recommended action: create `notebook` group.
- review point: CI default does not install it.
- common pitfall: do not make notebook the service entry.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 23: OpenTelemetry

- goal: separate observability dependency.
- recommended action: create `otel` group or runtime dependency.
- review point: deployment exporter is clear.
- common pitfall: do not hard-code exporter locally.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 24: pre-commit alternative

- goal: unify check command.
- recommended action: prefer `uv run ruff check .`.
- review point: hook and CI share version.
- common pitfall: do not make hook the only validation.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 25: Makefile wrapper

- goal: keep short commands.
- recommended action: make target calls uv.
- review point: README states underlying command.
- common pitfall: do not hide another install flow.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 26: platform limitation

- goal: platform only reads requirements.
- recommended action: export from uv.
- review point: export is generated by CI.
- common pitfall: do not hand-maintain export.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 27: platform marker

- goal: limit platform dependency.
- recommended action: use PEP 508 marker.
- review point: lock result works on each platform.
- common pitfall: do not install dynamically in code.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 28: GPU dependency

- goal: separate system and Python layers.
- recommended action: system image handles CUDA, uv handles packages.
- review point: wheel source is confirmed.
- common pitfall: do not expect uv to install drivers.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 29: slow package source

- goal: improve download stability.
- recommended action: configure cache and mirror.
- review point: bottleneck is network or compile.
- common pitfall: do not blindly switch tools.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 30: lock conflict

- goal: merge dependency changes.
- recommended action: run `uv lock` again.
- review point: diff is explainable.
- common pitfall: do not hand merge TOML fragments.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 31: dependency tree review

- goal: understand transitive dependency.
- recommended action: `uv tree`.
- review point: new chain is reasonable.
- common pitfall: do not inspect direct dependencies only.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 32: vulnerability fix

- goal: minimal CVE remediation.
- recommended action: single-package upgrade and tests.
- review point: advisory is covered.
- common pitfall: do not make unrelated upgrades.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 33: license review

- goal: supply-chain compliance.
- recommended action: export SBOM or dependency list.
- review point: license policy is clear.
- common pitfall: do not rely on memory.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 34: script smoke test

- goal: lightweight service validation.
- recommended action: `uv run --with httpx python scripts/smoke.py`.
- review point: script dependency is explicit.
- common pitfall: do not require global httpx.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 35: temporary tool trial

- goal: evaluate a tool.
- recommended action: `uvx tool-name`.
- review point: project is not polluted.
- common pitfall: do not add trial tool to default.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 36: project template upgrade

- goal: update baseline.
- recommended action: create sample after template change.
- review point: migration path is clear.
- common pitfall: do not force old projects immediately.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 37: multi-service repository

- goal: control service boundary.
- recommended action: use workspace or explicit subprojects.
- review point: shared lock has value.
- common pitfall: do not use workspace only because directories increased.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 38: internal library release

- goal: maintain compatibility range.
- recommended action: use `[project]` dependency range.
- review point: build backend is confirmed.
- common pitfall: do not replace publish constraint with app lockfile.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 39: editable install

- goal: develop internal package.
- recommended action: depend on workspace member.
- review point: change is visible.
- common pitfall: do not copy package into multiple places.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 40: read-only production

- goal: avoid runtime writes.
- recommended action: sync during build.
- review point: container start does not install dependencies.
- common pitfall: do not install dependencies at startup.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 41: blue-green deploy

- goal: ensure reproducible version.
- recommended action: image contains lock-matching environment.
- review point: rollback image starts.
- common pitfall: do not resolve dependencies during deploy.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 42: multi Python testing

- goal: validate compatibility.
- recommended action: CI matrix + uv python.
- review point: requires-python is correct.
- common pitfall: do not test only local version.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 43: upper bound adjustment

- goal: handle breaking upstream.
- recommended action: change constraint and lock.
- review point: reason is recorded.
- common pitfall: do not pin forever without explanation.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 44: temporary fork

- goal: use Git source.
- recommended action: express in `tool.uv.sources`.
- review point: return-to-PyPI plan exists.
- common pitfall: do not depend on unknown branch forever.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 45: local path source

- goal: debug cross-package change.
- recommended action: use path source.
- review point: publish metadata remains correct.
- common pitfall: do not commit absolute paths.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 46: cache miss

- goal: investigate slow CI.
- recommended action: compare cache hit and lock diff.
- review point: cache key is correct.
- common pitfall: do not blame uv first.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 47: permission error

- goal: install directory not writable.
- recommended action: check CI user and cache directory.
- review point: least privilege is preserved.
- common pitfall: do not hide issue with root.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 48: certificate rotation

- goal: update internal CA.
- recommended action: update certificate config.
- review point: build log is checked.
- common pitfall: do not disable TLS verification.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 49: environment variables

- goal: unify config entry.
- recommended action: use settings for app config.
- review point: secret is not in lockfile.
- common pitfall: do not put secret in pyproject.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

### scenario 50: pre-release audit

- goal: confirm deliverability.
- recommended action: run locked sync, lint, test, build.
- review point: diff contains expected files only.
- common pitfall: do not mix environment fix and business change.
- delivery signal: the command can run again in a clean environment.
- maintenance action: write the successful path into docs or templates.

## maintenance cadence

| cadence | action |
| --- | --- |
| every PR | check pyproject and lockfile consistency |
| weekly | review dependency updates and security notices |
| biweekly | verify Docker cache and CI cache behavior |
| monthly | perform minor dependency maintenance |
| quarterly | review Python version baseline |
| quarterly | review private index and certificate setup |
| quarterly | review workspace boundaries |
| before major upgrade | create dedicated upgrade branch |
| after major upgrade | update templates and FAQ |
| after incident review | turn troubleshooting steps into checklist |

A stable uv workflow is not finished by one configuration change.

It must evolve with Python versions, dependency ecosystem, deployment platforms, and security requirements.


## final operating rules

uv adoption must be reviewable.

uv adoption must be repeatable.

uv adoption must be reversible.

uv adoption must be explainable.

uv adoption must serve local, CI, Docker, and production environments.

If a rule works only on one machine, it is not an engineering rule yet.

If a command cannot run again in a clean environment, it is not a team entrypoint yet.

If a dependency change cannot be explained in code review, it is not a stable change yet.

If a migration creates more troubleshooting paths, it should be split smaller.

Using uv well is not about tool uniformity as a formality. It is about moving Python project uncertainty into reviewable, reproducible, maintainable boundaries.

## 参考リンク

- [uv documentation](https://docs.astral.sh/uv/)
- [uv: Working on projects](https://docs.astral.sh/uv/guides/projects/)
- [uv: Tools](https://docs.astral.sh/uv/guides/tools/)
- [uv: pip interface](https://docs.astral.sh/uv/pip/)
- [PEP 723: Inline script metadata](https://peps.python.org/pep-0723/)
- [Node.js 開発者のための FastAPI 移行マップ](./express-to-fastapi-migration-map/)
- [FastAPI architecture and observability](./fastapi-architecture-observability-for-tls/)
