import type { APIContext } from 'astro';
import { buildPodcastFeed } from '../lib/podcast';

export async function GET({ site }: APIContext) {
  return buildPodcastFeed({ site, locale: 'zh' });
}
