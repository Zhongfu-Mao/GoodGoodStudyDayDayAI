---
title: "ADR / RFC 模板:采用 FastAPI 构建 AI / 数据 API 服务"
date: 2026-05-13
category: engineering
description: "FastAPI 架构决策记录的模板,用作 ADR / RFC 起草参考。"
tags:
  - "FastAPI"
lang: ja
draft: true
---

```markdown
# ADR-000: FastAPI を AI / data API service の標準候補にする

### Status

Proposed / Accepted / Superseded

### Context

business goal、team constraint、既存 system の問題、本番要件を書く。

### Decision

Python、uv、FastAPI、Pydantic、OpenAPI、OpenTelemetry を service template の標準として採用する。

### Scope

向く service type と、向かない scenario を明記する。

### Alternatives

Django、Flask、NestJS、Go、serverless functions、現行 stack 継続を比較する。

### Architecture boundary

api、domain、infrastructure、worker、model gateway、data store の責務を書く。

### API contract

versioning、error format、pagination、auth、SDK、contract test を説明する。

### Observability

trace、metrics、logs、SLO、dashboard、alert、runbook を説明する。

### Security

authentication、authorization、tenant isolation、secret、audit、supply chain 要件を書く。

### Migration plan

strangler path、dual write、replay、rollback、completion criteria を書く。

### Risks and mitigations

major risk、owner、monitoring signal、mitigation を列挙する。
```
