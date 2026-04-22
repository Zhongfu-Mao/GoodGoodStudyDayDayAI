import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogSchema } from './content/config';

const sharedLoader = (base: string) =>
  glob({
    base,
    pattern: '**/*.md',
  });

const radar = defineCollection({
  loader: glob({
    base: './src/content/radar',
    pattern: '*-ai-radar-*.md',
  }),
  schema: blogSchema,
});

const academy = defineCollection({
  loader: sharedLoader('./src/content/academy'),
  schema: blogSchema,
});

const engineering = defineCollection({
  loader: sharedLoader('./src/content/engineering'),
  schema: blogSchema,
});

const foundations = defineCollection({
  loader: sharedLoader('./src/content/foundations'),
  schema: blogSchema,
});

export const collections = {
  radar,
  academy,
  engineering,
  foundations,
};
