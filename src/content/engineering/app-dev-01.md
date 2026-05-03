---
title: "App Dev 笔记：Astro 页面与内容集合（Content Collections）"
date: 2026-04-03
category: engineering
description: "利用 Astro 的内容集合与动态路由搭建多语言内容站点：涵盖 Schema 验证、Slug 生成及页面渲染的核心流程。"
difficulty: intermediate
plainSummary: "Astro 的内容集合功能为 Markdown 文件提供了类型安全的 Frontmatter，动态路由则能将 Slug 自动映射至页面，无需手动配置每条路由。"
tags:
  - "Astro"
  - "Web Dev"
lang: zh
draft: false
---

## 为什么选择 Astro 构建内容站点

Astro 是一款以内容为中心的静态站点生成器（SSG）。其核心优势包括：

- **默认零 JS**：页面默认不向浏览器发送 JavaScript，除非你明确使用了需要交互的“孤岛”组件。
- **内容集合**：通过 Schema 定义 Frontmatter 结构，构建时自动执行严苛的验证。
- **多框架支持**：允许在同一个项目中混用 React、Vue、Svelte 组件，且不强制依赖任何特定框架。
- **Markdown 原生支持**：将 Markdown 和 MDX 视为一等公民，无需引入额外的 CMS（内容管理系统）。

## 内容集合的基本结构

```
src/content/
  config.ts           # Schema 定义
  academy/            # Collection = 目录名
    article-01.md
    article-01.ja.md  # 多语言版本
  radar/
    daily-2026-04-27.md
```

在 `config.ts` 中定义 Schema：

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    category: z.enum(['academy', 'engineering', 'foundations', 'radar']),
    tags: z.array(z.string()),
    lang: z.enum(['zh', 'ja']),
    draft: z.boolean().default(false),
    description: z.string().optional(),
    coverImage: z.string().optional(),
  }),
});

export const collections = { academy: blog, radar: blog };
```

在构建阶段，任何不符合 Schema 定义的 Frontmatter 都会触发报错。这种静态检查机制远比在运行时才发现“某篇文章缺失标题”要可靠得多。

## 动态路由（Dynamic Routing）

Astro 使用文件名中的方括号来表示动态路由参数：

```
src/pages/[category]/[...slug].astro
```

通过 `getStaticPaths()` 函数返回所有可能的路径映射：

```ts
export async function getStaticPaths() {
  const entries = await getCollection('academy');
  return entries.map((entry) => ({
    params: { category: 'academy', slug: entry.slug },
    props: { entry },
  }));
}
```

每新增一篇 Markdown 文档，系统会自动生成对应的页面，无需开发者手动注册新路由。

## 多语言处理策略

本站采用文件名后缀来区分语言版本：

- `article.md` → 中文版
- `article.ja.md` → 日文版

在逻辑代码中通过 `lang` 字段进行过滤和分发：

```ts
const zhEntries = entries.filter(e => e.data.lang === 'zh');
const jaEntries = entries.filter(e => e.data.lang === 'ja');
```

URL 前缀约定：`/academy/...` 映射为中文内容，`/ja/academy/...` 映射为日文内容。

## 最佳实践建议

1. **先定义 Schema，再撰写内容**：Schema 是内容的“合同”，在大规模内容产出前固定 Schema 的成本最低。
2. **利用 `astro check` 进行验证**：每次修改内容或代码后执行验证，确保类型安全。
3. **善用 `draft: true` 标记**：正在撰写中的草稿不应被发布，通过 `draft` 字段进行全生命周期控制。
4. **规范资源引用**：图片建议存放在 `public/images/` 目录下，并使用以 `/` 开头的绝对路径进行引用，避免相对路径带来的路径偏移问题。

## 延伸阅读

- 如果你想了解本站的完整部署流程，请阅读 [Cloud & Infra：CI/CD 与静态站点部署](../cloud-infra-02/)。
- 如果你想理解 Markdown 内容如何被 AI 工具高效处理，请阅读 [AI Coding Tools](../../start/ai-basics-for-everyone/ai-coding-tools/)。
