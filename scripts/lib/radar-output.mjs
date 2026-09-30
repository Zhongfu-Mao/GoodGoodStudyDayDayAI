export function compactFetch(result, { maxChars = 1200, maxItems = 15 } = {}) {
  const { requestedUrl, finalUrl, status, ok, mode, error } = result;
  /** @type {Record<string, any>} */
  const output = { requestedUrl, finalUrl, status, ok, mode, error };
  if (result.article) {
    const { title, publishedTime, byline, textContent = '', content = '' } = result.article;
    output.article = {
      title,
      publishedTime,
      byline,
      text: textContent.slice(0, maxChars),
      textChars: textContent.length,
      truncated: textContent.length > maxChars,
      links: [
        ...new Set(
          [...content.matchAll(/href="(https?:[^"\s]+)"/g)].map((match) =>
            match[1].replaceAll('&amp;', '&'),
          ),
        ),
      ].slice(0, maxItems),
    };
  }
  if (result.feed) {
    output.feed = {
      title: result.feed.feedTitle,
      count: result.feed.items.length,
      truncated: result.feed.items.length > maxItems,
      items: result.feed.items
        .slice(0, maxItems)
        .map(({ title, link, published, summary = '' }) => ({
          title,
          link,
          published,
          summary: summary.slice(0, 160),
        })),
    };
  }
  if (result.body) output.rawBodyChars = result.body.length;
  return output;
}
