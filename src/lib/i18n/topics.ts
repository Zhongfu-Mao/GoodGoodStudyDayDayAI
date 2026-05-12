import type { Topic } from '../topics';

type TopicCopy = {
  label: string;
  description: string;
};

const zh: Record<Topic, TopicCopy> = {
  model: {
    label: '模型',
    description: 'LLM 能力、架构、评测、新版本。模型本身在做什么、能做多远。',
  },
  engineering: {
    label: '工程',
    description: 'Agent harness、context engineering、observability、infra。怎么把 AI 落到生产系统。',
  },
  agents: {
    label: 'Agent',
    description: 'Agent 形态、coding agent、Codex 和 Claude Code 等 agent 产品。让 AI 自己做事的那一层。',
  },
  retrieval: {
    label: '检索与 RAG',
    description: 'RAG、向量检索、知识库、grounding。把企业 / 个人知识喂给模型。',
  },
  workflow: {
    label: '工作流与产品',
    description: 'Prompting、ChatGPT 用法、自动化、AI 产品形态。把 AI 嵌入日常工作。',
  },
  industry: {
    label: '行业与策略',
    description: 'AI economics、安全合规、教育、隐私。AI 在产业里的位置。',
  },
};

const ja: Record<Topic, TopicCopy> = {
  model: {
    label: 'モデル',
    description: 'LLM の能力・アーキテクチャ・評価・新リリース。モデル自体がどこまでできるか。',
  },
  engineering: {
    label: 'エンジニアリング',
    description: 'Agent harness、context engineering、observability、インフラ。AI を本番システムに落とし込む層。',
  },
  agents: {
    label: 'Agent',
    description: 'Agent の形態、coding agent、Codex や Claude Code などの agent プロダクト。AI が自律的に作業を進める層。',
  },
  retrieval: {
    label: '検索と RAG',
    description: 'RAG、ベクトル検索、ナレッジベース、grounding。企業 / 個人の知識をモデルに渡す方法。',
  },
  workflow: {
    label: 'ワークフローとプロダクト',
    description: 'Prompting、ChatGPT の使い方、自動化、AI プロダクトの形。AI を日常業務に組み込む。',
  },
  industry: {
    label: '業界と戦略',
    description: 'AI 経済、安全・コンプライアンス、教育、プライバシー。産業の中で AI がどこに位置づくか。',
  },
};

export const topicCopy = { zh, ja } as const;

export const topicsPage = {
  zh: {
    title: '按主题浏览',
    metaDescription: '从模型、工程、Agent、检索、工作流、行业六个主题切入,横切日报 / 课程 / 实践 / 原理。',
    eyebrow: 'Topics',
    heroTitle: '从主题进入,不是从分区',
    heroDescription:
      '主题是横切的:点"Agent"可以一次看到雷达里的最新 agent 新闻、Academy 里的 agent 课程、Engineering 里的 agent 实践和 Foundations 里的 agent 原理。',
    detailEyebrow: 'Topic',
    detailFromCollection: (label: string) => `来自 ${label}`,
    itemCount: (count: number) => `${count} 篇`,
    showAll: (count: number) => `查看全部 ${count} 篇`,
    collapse: '收起',
    emptyTopic: '这个主题暂时还没有文章。',
    backToIndex: '← 返回主题索引',
  },
  ja: {
    title: 'トピックから読む',
    metaDescription: 'モデル、エンジニアリング、Agent、検索、ワークフロー、業界の 6 つのトピックから、デイリー / コース / 実践 / 基礎を横断して読み解きます。',
    eyebrow: 'Topics',
    heroTitle: 'コレクションではなく、トピックから入る',
    heroDescription:
      'トピックは横断的です。「Agent」を選ぶと、レーダーの最新 agent ニュース、Academy の agent コース、Engineering の agent 実践、Foundations の agent 原理を一度に確認できます。',
    detailEyebrow: 'Topic',
    detailFromCollection: (label: string) => `${label} より`,
    itemCount: (count: number) => `${count} 件`,
    showAll: (count: number) => `すべて表示（${count} 件）`,
    collapse: '折りたたむ',
    emptyTopic: 'このトピックの記事はまだありません。',
    backToIndex: '← トピック一覧へ戻る',
  },
} as const;
