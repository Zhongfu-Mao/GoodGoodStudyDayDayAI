---
title: "Cloud & Infra 観察: CI/CD と静的サイト配信"
date: 2026-04-10
category: engineering
tags:
  - "Agent"
lang: ja
draft: true
---

# デプロイの考え方

エンジニアリング領域の 2 本目のサンプルです。

```yaml
name: deploy
on:
  push:
    branches: [main]
```

