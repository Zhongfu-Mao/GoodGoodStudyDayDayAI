import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { collectionNames } from './lib/site';

export const blogSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  category: z.enum(collectionNames),
  cadence: z.enum(['daily', 'weekly', 'monthly']).optional(),
  tags: z.array(z.string()).min(1),
  lang: z.enum(['zh', 'ja']).default('zh'),
  coverImage: z.string().optional(),
  audioUrl: z.string().optional(),
  draft: z.boolean().default(false),
});

const markdownLoader = (base: string) =>
  glob({
    base,
    pattern: '**/*.md',
  });

const radar = defineCollection({
  loader: markdownLoader('./src/content/radar'),
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
  academy,
  engineering,
  foundations,
};
