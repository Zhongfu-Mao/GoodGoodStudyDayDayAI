import type { APIContext } from 'astro';
import { buildFeed } from '../../lib/rss';

export async function GET({ site }: APIContext) {
  return buildFeed({ site, locale: 'ja' });
}
