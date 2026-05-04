import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { collectionNames } from './lib/site';

export const blogSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  category: z.enum(collectionNames),
  description: z.string().optional(),
  cadence: z.enum(['daily', 'weekly', 'monthly']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  plainSummary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  lang: z.enum(['zh', 'ja']).default('zh'),
  coverImage: z.string().optional(),
  audioUrl: z.string().optional(),
  deckUrl: z.string().optional(),
  includeInRadarArchive: z.boolean().default(true),
  academy: z
    .object({
      series: z.string(),
      module: z.string(),
      moduleOrder: z.number().int().positive().optional(),
      source: z.string().optional(),
      sourceUrl: z.string().url().optional(),
      prerequisites: z.array(z.string()).default([]),
      completionScore: z.string().optional(),
    })
    .optional(),
  draft: z.boolean().default(false),
});

const generateLocalizedMarkdownId = ({ entry, data }: { entry: string; data: { lang?: string } }) => {
  const normalized = entry.replace(/\\/g, '/').replace(/\.md$/, '');

  if (data.lang === 'ja' && !normalized.endsWith('.ja')) {
    return `${normalized}.ja`;
  }

  return normalized;
};

const markdownLoader = (base: string, pattern = '**/*.md') =>
  glob({
    base,
    pattern,
    generateId: generateLocalizedMarkdownId,
  });

const radar = defineCollection({
  loader: markdownLoader('./src/content/radar', '*.md'),
  schema: blogSchema,
});

const start = defineCollection({
  loader: markdownLoader('./src/content/start'),
  schema: blogSchema,
});

const academy = defineCollection({
  loader: markdownLoader('./src/content/academy'),
  schema: blogSchema,
});

const engineering = defineCollection({
  loader: markdownLoader('./src/content/engineering'),
  schema: blogSchema,
});

const foundations = defineCollection({
  loader: markdownLoader('./src/content/foundations'),
  schema: blogSchema,
});

export const collections = {
  radar,
  start,
  academy,
  engineering,
  foundations,
};
