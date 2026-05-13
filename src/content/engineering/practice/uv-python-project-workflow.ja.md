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

## 参考リンク

- [uv documentation](https://docs.astral.sh/uv/)
- [uv guides — Projects](https://docs.astral.sh/uv/guides/projects/)
- [uv guides — Tools](https://docs.astral.sh/uv/guides/tools/)
- [PEP 723 — Inline script metadata](https://peps.python.org/pep-0723/)
- [astral-sh/setup-uv](https://github.com/astral-sh/setup-uv)
