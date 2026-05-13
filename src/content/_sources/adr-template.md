---
title: "ADR / RFC 模板:采用 FastAPI 构建 AI / 数据 API 服务"
date: 2026-05-13
category: engineering
description: "FastAPI 架构决策记录的模板,用作 ADR / RFC 起草参考。"
tags:
  - "FastAPI"
lang: zh
draft: true
---

```markdown
# ADR-000: 采用 FastAPI 构建 AI / 数据 API 服务

### 状态

Proposed / Accepted / Superseded

### 背景

描述业务目标、团队约束、现有系统问题和必须满足的生产要求。

### 决策

采用 Python、uv、FastAPI、Pydantic、OpenAPI 和 OpenTelemetry 作为服务模板的默认技术栈。

### 适用范围

列出适合的服务类型，也列出不适合的场景。

### 替代方案

比较 Django、Flask、NestJS、Go、serverless functions 和继续使用现有栈。

### 架构边界

说明 api、domain、infrastructure、worker、model gateway、data store 的责任。

### API 契约

说明版本策略、错误格式、分页、认证、SDK、contract test。

### 可观测性

说明 trace、metrics、logs、SLO、dashboard、alert 和 runbook。

### 安全

说明认证、授权、租户隔离、secret、审计和供应链要求。

### 迁移计划

说明 strangler path、双写、回放、回滚和完成标准。

### 风险与缓解

列出主要风险、owner、监控指标和缓解方案。
```
