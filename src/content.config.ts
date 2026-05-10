import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { collectionNames } from './lib/site';

const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
const academyMetaSchema = z.object({
  series: z.string(),
  module: z.string(),
  moduleOrder: z.number().int().positive().optional(),
  source: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  prerequisites: z.array(z.string()).default([]),
  completionScore: z.string().optional(),
});

const baseBlogSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  category: z.enum(collectionNames),
  description: z.string().optional(),
  difficulty: difficultySchema.optional(),
  plainSummary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  lang: z.enum(['zh', 'ja']).default('zh'),
  coverImage: z.string().optional(),
  draft: z.boolean().default(false),
});

const forbiddenRadarFields = {
  cadence: z.never().optional(),
  audioUrl: z.never().optional(),
  audioDuration: z.never().optional(),
  audioExplicit: z.never().optional(),
  audioSize: z.never().optional(),
  deckUrl: z.never().optional(),
  includeInRadarArchive: z.never().optional(),
} as const;

const forbiddenCourseFields = {
  academy: z.never().optional(),
} as const;

export const radarSchema = baseBlogSchema.extend({
  category: z.literal('radar'),
  cadence: z.enum(['daily', 'weekly', 'monthly']).optional(),
  audioUrl: z.string().optional(),
  audioDuration: z.number().int().positive().optional(),
  audioExplicit: z.boolean().default(false),
  audioSize: z.number().int().positive().optional(),
  deckUrl: z.string().optional(),
  includeInRadarArchive: z.boolean().default(true),
  ...forbiddenCourseFields,
});

export const startSchema = baseBlogSchema.extend({
  category: z.literal('start'),
  academy: academyMetaSchema.optional(),
  ...forbiddenRadarFields,
});

export const academySchema = baseBlogSchema.extend({
  category: z.literal('academy'),
  academy: academyMetaSchema.optional(),
  ...forbiddenRadarFields,
});

export const engineeringSchema = baseBlogSchema.extend({
  category: z.literal('engineering'),
  ...forbiddenRadarFields,
  ...forbiddenCourseFields,
});

export const foundationsSchema = baseBlogSchema.extend({
  category: z.literal('foundations'),
  ...forbiddenRadarFields,
  ...forbiddenCourseFields,
});

const generateLocalizedMarkdownId = ({
  entry,
  data,
}: {
  entry: string;
  data: { lang?: string };
}) => {
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
  schema: radarSchema,
});

const start = defineCollection({
  loader: markdownLoader('./src/content/start'),
  schema: startSchema,
});

const academy = defineCollection({
  loader: markdownLoader('./src/content/academy'),
  schema: academySchema,
});

const engineering = defineCollection({
  loader: markdownLoader('./src/content/engineering'),
  schema: engineeringSchema,
});

const foundations = defineCollection({
  loader: markdownLoader('./src/content/foundations'),
  schema: foundationsSchema,
});

export const collections = {
  radar,
  start,
  academy,
  engineering,
  foundations,
};
