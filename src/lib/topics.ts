// Cross-collection Topic layer. A Topic is the **subject** axis (orthogonal
// to the collection / content-format axis). Tags drive Topic membership via
// the `tagToTopic` lookup below.
//
// Topics are intentionally a small, slow-moving set. Add a new one only when
// (a) ≥ ~20 articles can flow into it and (b) it does not already fit an
// existing bucket. Otherwise prefer adding a tag and routing it through one
// of the six.

export const topics = ['model', 'engineering', 'agents', 'retrieval', 'workflow', 'industry'] as const;
export type Topic = (typeof topics)[number];

// Tags that intentionally do NOT map to any Topic. These are audience
// markers (read by whom?) rather than subject markers, and keeping them out
// of the Topic system avoids dead "no real subject" bins.
export const nonTopicTags = new Set([
  '开发者',
  '開発者',
  '教育',
  '产品',
  'プロダクト',
]);

export const tagToTopic: Record<string, Topic> = {
  // model — LLM capability, architecture, evaluation, releases
  'Open Models': 'model',
  Claude: 'model',
  Opus: 'model',
  LLM: 'model',
  Evaluation: 'model',
  Quality: 'model',
  Benchmark: 'model',
  'Model Release': 'model',
  'Reinforcement Learning': 'model',
  Multimodal: 'model',
  Embeddings: 'model',
  Hallucination: 'model',
  Token: 'model',
  Math: 'model',
  'Data Science': 'model',

  // engineering — building systems, infra, observability, context plumbing
  'AI Engineering': 'engineering',
  'Harness Engineering': 'engineering',
  'AI Developer Core': 'engineering',
  'AI Infrastructure': 'engineering',
  'Context Engineering': 'engineering',
  'Context Window': 'engineering',
  MCP: 'engineering',
  'CI/CD': 'engineering',
  Operations: 'engineering',
  Observability: 'engineering',
  'LLM App': 'engineering',
  'Structured Output': 'engineering',
  Reliability: 'engineering',
  Astro: 'engineering',
  'Web Dev': 'engineering',
  'GitHub Actions': 'engineering',
  Deployment: 'engineering',
  'GPT-image-2': 'engineering',
  Infrastructure: 'engineering',

  // agents — agent design, coding agents, agent-shaped products
  Agent: 'agents',
  'Coding Agents': 'agents',
  Codex: 'agents',
  'Codex for Work': 'agents',
  'Agent Memory': 'agents',
  'Claude Code': 'agents',

  // retrieval — RAG, search, grounding
  RAG: 'retrieval',
  Retrieval: 'retrieval',
  Search: 'retrieval',
  Grounding: 'retrieval',

  // workflow — using AI: prompting, ChatGPT usage, automation, products
  'AI/Workflow': 'workflow',
  ChatGPT: 'workflow',
  Prompting: 'workflow',
  'AI Fluency': 'workflow',
  'Building with AI': 'workflow',
  'ChatGPT for Work': 'workflow',
  Automation: 'workflow',
  Research: 'workflow',
  Personalization: 'workflow',
  'Learning Route': 'workflow',
  'Non-Engineering Route': 'workflow',
  OpenClaw: 'workflow',

  // industry — economics, safety, education, governance
  Education: 'industry',
  'AI Economics': 'industry',
  Safety: 'industry',
  Privacy: 'industry',
  Administration: 'industry',
  Leadership: 'industry',
  'IT Leadership': 'industry',
  'AI Academy': 'industry',
};

export function resolveTopic(tag: string): Topic | undefined {
  return tagToTopic[tag];
}

export function resolveTopicsForTags(tags: readonly string[]): Topic[] {
  const seen = new Set<Topic>();
  for (const tag of tags) {
    const topic = tagToTopic[tag];
    if (topic) seen.add(topic);
  }
  // Preserve canonical topic order rather than insertion order so UI is stable.
  return topics.filter((t) => seen.has(t));
}
