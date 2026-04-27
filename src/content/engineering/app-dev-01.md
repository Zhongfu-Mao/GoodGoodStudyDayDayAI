---
title: "App Dev 速记：Astro 页面和内容集合"
date: 2026-04-03
category: engineering
description: "用 Astro 的内容集合和动态路由搭建多语言内容站点：schema 验证、slug 生成和页面渲染的最小流程。"
difficulty: intermediate
plainSummary: "Astro 的内容集合让 Markdown 文件拥有类型安全的 frontmatter，动态路由把 slug 自动映射到页面，不需要手写每一条路由。"
tags:
  - "Astro"
  - "Web Dev"
lang: zh
draft: false
---

## 为什么选 Astro 做内容站

Astro 是一个以内容为中心的静态站点生成器。它的核心优势是：

- **默认零 JS**：页面默认不发送 JavaScript 到浏览器，除非你明确需要交互组件。
- **内容集合**：用 schema 定义 frontmatter 结构，构建时自动验证。
- **多框架支持**：可以混用 React、Vue、Svelte 组件，但不强制依赖任何一个。
- **Markdown 原生**：Markdown 和 MDX 是一等公民，不需要额外的 CMS。

## 内容集合的基本结构

```
src/content/
  config.ts          # schema 定义
  academy/           # collection = 目录名
    article-01.md
    article-01.ja.md  # 多语言版本
  radar/
    daily-2026-04-27.md
```

在 `config.ts` 里定义 schema：

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

构建时，任何不符合 schema 的 frontmatter 都会报错。这比运行时发现"某篇文章没有标题"要可靠得多。

## 动态路由

Astro 用文件名里的方括号表示动态路由：

```
src/pages/[category]/[...slug].astro
```

在 `getStaticPaths()` 里返回所有可能的路径：

```ts
export async function getStaticPaths() {
  const entries = await getCollection('academy');
  return entries.map((entry) => ({
    params: { category: 'academy', slug: entry.slug },
    props: { entry },
  }));
}
```

每篇 Markdown 自动生成一个页面，不需要手动注册路由。

## 多语言处理

本站的做法是用文件名后缀区分语言：

- `article.md` → 中文
- `article.ja.md` → 日文

在代码中通过 `lang` 字段过滤：

```ts
const zhEntries = entries.filter(e => e.data.lang === 'zh');
const jaEntries = entries.filter(e => e.data.lang === 'ja');
```

URL 前缀区分：`/academy/...` 是中文，`/ja/academy/...` 是日文。

## 实用建议

1. **先定义 schema，再写内容。** Schema 是内容的合同，修改 schema 比修改 100 篇文章便宜。
2. **用 `astro check` 验证。** 每次修改后跑一次，保证零错误。
3. **善用 `draft: true`。** 写到一半的内容不要发布，用 draft 字段控制。
4. **图片放 `public/`。** 引用路径用 `/images/...`，不要用相对路径。

## 和本站内容怎么接上

如果你想了解本站的完整部署流程，读 [Cloud & Infra：CI/CD 与静态站点部署](../cloud-infra-02/)。

如果你想理解 Markdown 内容如何被 AI 工具处理，读 [AI Coding Tools](../../academy/ai-basics-for-everyone/ai-coding-tools/)。
