---
title: "Cloud & Infra 观察：CI/CD 与静态站点部署"
date: 2026-04-10
category: engineering
description: "用 GitHub Actions 实现 Astro 站点的自动构建、检查和部署：从 push 到上线的完整流水线。"
difficulty: intermediate
plainSummary: "CI/CD 不是复杂的企业工具，而是把构建、检查、部署三步自动化。推送代码后自动验证、自动上线，不再手动操作。"
tags:
  - "CI/CD"
  - "GitHub Actions"
  - "Deployment"
lang: zh
draft: false
---

## 静态站点的部署流程

静态站点的部署逻辑很简单：构建 → 上传 → 切换。但手动操作容易出错，特别是多语言站点有上百个文件时。CI/CD 把这个流程自动化。

## GitHub Actions 的基本结构

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: npm ci
      - run: npx astro check
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/
```

每次推送到 main 分支，自动执行：安装依赖 → 检查内容 → 构建 → 部署。

## 三个关键检查点

### 1. 内容验证（`astro check`）

在构建之前运行，确保所有 Markdown 文件的 frontmatter 符合 schema。0 errors 才继续。

### 2. 构建（`npm run build`）

把 Markdown 和 Astro 组件编译成静态 HTML。这一步会发现模板错误、缺失引用等问题。

### 3. 部署

构建产物上传到托管平台（GitHub Pages、Cloudflare Pages、Vercel 等）。静态文件不需要服务器运行时。

## 多环境策略

| 环境 | 触发条件 | 用途 |
| --- | --- | --- |
| Preview | Pull Request | 团队预览和 review |
| Staging | push 到 dev 分支 | 集成测试 |
| Production | push 到 main 分支 | 面向用户 |

对个人项目来说，Preview + Production 两个环境通常就够了。

## 常见问题和解决方案

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| 构建成功但页面 404 | base path 配置错误 | 检查 `astro.config.mjs` 的 `base` 字段 |
| 图片不显示 | 路径使用了相对路径 | 改为 `/images/...` 绝对路径 |
| 部署后内容没更新 | CDN 缓存 | 配置 Cache-Control 或手动清除缓存 |
| 构建时间过长 | 图片未优化 | 使用 `@astrojs/image` 或预处理图片 |

## 实用建议

1. **每次 push 都跑 CI。** 不要等到发现问题才想起来加检查。
2. **把 `astro check` 放在 `build` 之前。** 提前拦截内容错误。
3. **用 Preview 环境检查多语言页面。** 中文页面正常不代表日文页面也正常。
4. **保持构建时间在 2 分钟以内。** 超过就该优化。

## 和本站内容怎么接上

如果你想了解 Astro 的内容集合和路由设计，读 [App Dev：Astro 页面和内容集合](../app-dev-01/)。

如果你想了解 AI 工具如何帮助工程实践，读 [AI Coding Tools](../../academy/ai-basics-for-everyone/ai-coding-tools/)。
