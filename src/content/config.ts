import { z } from 'astro/zod';

export const collectionNames = ['radar', 'academy', 'engineering', 'foundations'] as const;

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
