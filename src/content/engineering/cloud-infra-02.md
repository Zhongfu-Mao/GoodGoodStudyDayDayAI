---
title: "Cloud & Infra：静态站点 CI/CD 与发布门禁"
date: 2026-04-10
category: engineering
description: "用 GitHub Actions、构建验证、内容资产 QA、Pages 子路径检查和回滚策略，把内容站发布变成可靠流水线。"
difficulty: intermediate
plainSummary: "CI/CD 不只是 push 后自动部署。对内容站来说，它应该同时验证类型、链接、图片、多语言、部署路径和最终页面，避免把隐蔽错误发布给读者。"
coverImage: "/images/engineering/cloud-infra-02/static-site-cicd-cover.png"
tags:
  - "CI/CD"
  - "GitHub Actions"
  - "Deployment"
lang: zh
draft: false
---

# Cloud & Infra：静态站点也需要发布门禁

![静态站点 CI/CD 发布流水线概念图](/images/engineering/cloud-infra-02/static-site-cicd-cover.png)

静态站点部署看起来很简单：构建 HTML，上传到托管平台，等 CDN 生效。正因为它简单，很多团队会低估发布流程的风险。

内容站的真实风险不是服务器挂掉，而是这些更隐蔽的问题：

- Markdown frontmatter 写错，列表页缺字段。
- 中文页面正常，日文页面断链。
- 本地预览能显示图片，部署到子路径后 404。
- 旧 SVG、临时图片、中文文字图混进日文正文。
- 站内链接在构建时没有报错，但生成 HTML 后指向不存在页面。
- 一次内容批量更新没有可回滚点。

CI/CD 的价值不只是“自动部署”。它应该成为发布门禁：每次上线前，系统自动证明这批内容和代码满足最低质量标准。

## 静态站点发布流水线的四个阶段

一个稳妥的静态站点流水线可以拆成四段。

| 阶段 | 目标 | 典型命令或动作 |
| --- | --- | --- |
| Install | 还原确定的依赖环境 | `npm ci` 或锁文件安装 |
| Check | 验证类型、内容 schema、lint | `npm run check` |
| Build | 生成生产 HTML 和资产 | `npm run build` |
| Verify | 检查构建产物、资源、页面行为 | Playwright、资产扫描、链接检查 |
| Deploy | 上传产物并切换发布版本 | Pages artifact、Cloudflare Pages、Netlify |

很多项目只有 Build 和 Deploy。真正容易省掉的，是最有价值的 Verify。

## GitHub Actions 的基础形态

以 GitHub Pages 为例，一个简化 workflow 可能是：

```yaml
name: Deploy site

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run check
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/
```

这只是起点。对内容站来说，还应该加入内容资产验证、页面路径验证和必要的 UI smoke test。

## 质量门禁：不要只验证代码

![CI/CD 质量门禁示意图](/images/engineering/cloud-infra-02/cicd-quality-gates.png)

内容站的质量门禁至少应该覆盖五类问题。

| 门禁 | 检查内容 | 为什么重要 |
| --- | --- | --- |
| Schema gate | frontmatter 类型、必填字段、枚举值 | 防止内容元数据污染页面 |
| Asset gate | `coverImage`、正文图片、音频、deck 是否存在 | 防止发布空图和断资源 |
| Locale gate | 中日文 sibling、语言路径、语言特定封面 | 防止只更新一种语言 |
| Build gate | Astro 构建、base path、静态 HTML 生成 | 防止模板和路径问题 |
| UI gate | 重点页面可访问、图片可见、导航可用 | 防止构建成功但页面坏掉 |

代码测试只能说明组件逻辑没有明显问题。内容测试才能说明发布物对读者是完整的。

## Pages 子路径：最容易漏的部署差异

![本地根路径与部署子路径的资源解析差异](/images/engineering/cloud-infra-02/pages-basepath-asset-resolution.png)

GitHub Pages 常见部署路径是：

```txt
https://<user>.github.io/<repo>/
```

这意味着生产站点可能不是部署在域名根路径 `/`，而是部署在 `/<repo>/` 子路径下。

本地预览成功的资源路径：

```html
<img src="/images/cover.png">
```

在不同框架配置下，部署后可能需要正确处理 base path。如果配置不一致，就会出现“本地没问题，线上图片全挂”的情况。

排查顺序：

1. 查看框架配置是否设置了生产 base。
2. 用生产环境变量执行 build。
3. 检查生成 HTML 中的图片、CSS、JS 路径。
4. 在本地以子路径方式预览或用 UI 测试访问。
5. 确认站内链接、语言切换、静态资源都能解析。

对内容站来说，这一步非常值得自动化。

## 构建产物验证：看 dist，而不是只看源码

很多错误在源码里看不出来。最终读者拿到的是 `dist/` 里的 HTML、CSS、JS、图片引用。

构建后可以做这些检查：

- 遍历 `dist/**/*.html`，提取 `img[src]`、`script[src]`、`link[href]`。
- 对站内路径，确认目标文件存在。
- 对语言页面，确认 canonical、alternate 或导航链接符合预期。
- 对重点专题，确认页面包含新封面和正文图。
- 对部署子路径，确认路径不会丢失 base。

这个思路比“手动点几个页面”更可持续。手动预览适合发现视觉问题，构建产物验证适合防止低级路径错误。

## Preview、Staging、Production 怎么选

小型内容站不一定需要复杂环境，但至少应该区分 preview 和 production。

| 环境 | 触发 | 用途 |
| --- | --- | --- |
| Preview | Pull Request 或分支推送 | 查看页面、视觉 review、内容校对 |
| Staging | 可选，集成分支 | 多人协作或大型改版前验证 |
| Production | main 分支或 release | 面向公开读者 |

如果项目只有一个维护者，也可以先只做 Preview + Production。关键是：不要把未验证的大批内容直接推到公开站。

## 回滚策略：静态站也要能撤回

静态站点常常让人误以为“不需要回滚”。但内容错误同样会影响信任。

最低限度的回滚策略：

- 每次可发布变更都形成 git commit。
- 大批内容改动分批提交。
- 部署平台保留历史 deploy。
- 发布后保留验证记录。
- 如果发现问题，优先 revert 对应 commit，而不是在生产上临时修补。

内容批量迁移尤其需要分批。比如一次性改 50 篇文章封面，如果没有批次边界，出问题时很难判断是哪一类变更引入的。

## 可观测性：CI 失败信息要能行动

一个好的 CI 失败，不应该只告诉你“失败了”。它应该告诉你：

- 哪个文件失败。
- 哪个字段或资源失败。
- 期望值是什么。
- 实际值是什么。
- 如何本地复现。

例如：

```txt
engineering/app-dev-01.ja.md references missing image /images/engineering/app-dev-01/cover.png
```

比下面这种信息有用得多：

```txt
Asset test failed
```

内容站的 CI 失败常常由作者自己修，所以错误信息越具体，维护成本越低。

## 案例：一次图片路径事故

一个多语言内容站把几篇早期文章的 SVG 封面替换成 PNG。开发者本地打开页面，图片显示正常，于是提交发布。

上线后发现日文页面有两类问题：

1. 有几篇仍引用旧 SVG。
2. 有些正文图路径在 GitHub Pages 子路径下解析错误。

问题根因不是图片生成，而是发布门禁缺失：

- 没有检查重点文章是否还引用旧矢量图。
- 没有检查日文 sibling 的图片路径。
- 没有用生产 base 运行构建。
- 没有扫描构建后的 HTML 资源引用。

修复后的门禁：

1. 内容测试禁止重点文章 body image 引用 SVG。
2. frontmatter 本地资源必须存在。
3. 构建后遍历 HTML，确认本地资产都能解析。
4. 用生产仓库名环境变量运行 build，模拟 Pages 子路径。

之后同类问题会在 CI 里提前暴露。

## 常见反模式

**反模式一：构建成功就等于页面正确。**

构建成功只能说明框架生成了文件。它不保证图片存在、链接正确、语言同步。

**反模式二：只在本地根路径预览。**

部署到子路径或 CDN 后，资源解析可能不同。必须模拟生产路径。

**反模式三：把 CI 失败当成麻烦。**

CI 是发布前最后一道低成本防线。失败信息具体，就能减少公开错误。

**反模式四：大批量内容改动一次提交。**

批次越大，回滚越痛苦。内容迁移也应该按主题或目录分批。

**反模式五：没有记录验证命令。**

团队成员无法复现你的验证，就无法信任你的发布判断。

## 落地模板：静态站发布门禁

```md
## Release Scope

本次发布包含：

不包含：

## Required Checks

- [ ] 依赖安装使用锁文件
- [ ] 内容 schema 检查通过
- [ ] 生产 base path 构建通过
- [ ] 本地资源引用存在
- [ ] 多语言 sibling 完整
- [ ] 重点页面 UI smoke test 通过
- [ ] 构建产物 HTML 资源扫描通过

## Deployment

平台：
触发分支：
构建命令：
输出目录：
生产 base：

## Rollback

回滚方式：
最近可用 commit：
最近可用 deploy：

## Evidence

检查命令：
检查结果：
剩余风险：
```

## 检查清单

- CI 是否先 check 后 build？
- 是否用生产 base path 构建？
- 是否扫描构建后的 HTML 资源引用？
- 是否检查中日文 sibling？
- 是否禁止重点文章继续引用旧 SVG？
- 是否有 preview 环境供人工校对？
- 是否能通过 commit 或 deploy 快速回滚？

## 继续阅读

- [App Dev：Astro 页面与内容集合](../app-dev-01/)：理解内容集合、Schema 和路由如何提供发布前约束。
- [AI Coding Tools](../../start/ai-basics-for-everyone/ai-coding-tools/)：用 AI 工具辅助 CI 失败定位和批量内容维护。
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)：GitHub Pages 自定义部署工作流。
