import { describe, expect, it } from 'vitest';

import { extractCandidateUrls } from '../../scripts/radar/fill-images.mjs';

describe('radar representative image selection', () => {
  it('does not infer a representative image from ordinary report links', () => {
    const content = `---
title: "AI 雷达日报：2026-06-01"
date: 2026-06-01
category: radar
cadence: daily
lang: zh
draft: false
---

## 1. AI Engineering & 架构

- 链接：https://example.com/first-story
`;

    expect(extractCandidateUrls(content)).toEqual([]);
  });

  it('uses only the explicit frontmatter representative image source', () => {
    const content = `---
title: "AI 雷达日报：2026-06-01"
date: 2026-06-01
category: radar
cadence: daily
lang: zh
representativeImageSource: https://example.com/lead-story
draft: false
---

## 1. AI Engineering & 架构

- 链接：https://example.com/ordinary-story
`;

    expect(extractCandidateUrls(content)).toEqual(['https://example.com/lead-story']);
  });
});
