import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const contentDir = path.join(repoRoot, 'src/content/start/ai-basics-for-everyone');
const imageDir = path.join(repoRoot, 'public/images/start/ai-basics-for-everyone/cards');

const palettes = {
  blue: { a: '#2563eb', b: '#1d4ed8', light: '#dbeafe' },
  teal: { a: '#0f766e', b: '#0e7490', light: '#ccfbf1' },
  amber: { a: '#b45309', b: '#d97706', light: '#fef3c7' },
  violet: { a: '#7c3aed', b: '#6d28d9', light: '#f3e8ff' },
  green: { a: '#15803d', b: '#16a34a', light: '#dcfce7' },
  rose: { a: '#be123c', b: '#e11d48', light: '#ffe4e6' },
};

const topics = [
  {
    slug: 'what-is-agent',
    imageBase: 'agent-concept-card',
    theme: 'teal',
    zh: {
      badge: 'Agent',
      title: 'Agent 是什么？',
      subtitle: '不是“更会聊天”，而是“能把任务往前推进”。',
      definition: [
        'Agent = 有目标、能行动、会复核的 AI 工作流。',
        '它不是单次回答问题，而是持续推进一件事直到可验收。',
      ],
      pillars: [
        ['目标', 'Goal', '知道最终要交付什么。'],
        ['状态', 'State', '记住进度、线索和中间产物。'],
        ['工具', 'Tools', '能操作浏览器、文件、代码/API。'],
        ['反馈', 'Feedback', '检查结果，并按偏差修正。'],
      ],
      flowTitle: '判断一件事是不是 Agent',
      steps: ['计划', '行动', '验证', '交付'],
      takeaway: '记住：Agent 的关键不是“像人”，而是能沿着目标持续推进。',
    },
    ja: {
      badge: 'Agent',
      title: 'Agentとは？',
      subtitle: 'うまく話すだけでなく、タスクを前に進める仕組み。',
      definition: [
        'Agentは、目標に向けて行動し、結果を確認しながら進むAIワークフローです。',
        '一度答えて終わるのではなく、完了まで手順を進めます。',
      ],
      pillars: [
        ['目標', 'Goal', '何を達成するかを決める。'],
        ['状態', 'State', '進捗や途中経過を持つ。'],
        ['ツール', 'Tools', 'ブラウザ、ファイル、コード/API を使う。'],
        ['確認', 'Feedback', '結果を見て、必要なら直す。'],
      ],
      flowTitle: 'Agentかどうかを見分ける流れ',
      steps: ['計画', '実行', '確認', '完了'],
      takeaway: '要点：Agentの本質は人間らしさではなく、目標に沿って進める力。',
    },
  },
  {
    slug: 'what-is-prompt',
    imageBase: 'prompt-concept-card',
    theme: 'blue',
    zh: {
      badge: 'Prompt',
      title: 'Prompt 是什么？',
      subtitle: '它不是咒语，而是你交给模型的任务说明书。',
      definition: [
        'Prompt = 给 AI 的上下文、目标、约束和输出要求。',
        '写得越像工作说明，模型越容易给出可用结果。',
      ],
      pillars: [
        ['任务', 'Task', '清楚说明要完成什么。'],
        ['背景', 'Context', '补充必要资料和场景。'],
        ['约束', 'Rules', '限定范围、语气、格式和禁区。'],
        ['样例', 'Examples', '用例子校准输出风格。'],
      ],
      flowTitle: '一个好 Prompt 的顺序',
      steps: ['目标', '背景', '要求', '格式'],
      takeaway: '记住：Prompt 写得越像交接说明，AI 越像靠谱同事。',
    },
    ja: {
      badge: 'Prompt',
      title: 'Promptとは？',
      subtitle: '魔法の言葉ではなく、AIへの作業指示書。',
      definition: [
        'Promptは、目的・背景・条件・出力形式をまとめた指示です。',
        '「仕事の依頼」として書くほど、結果は使いやすくなります。',
      ],
      pillars: [
        ['タスク', 'Task', '何をしてほしいかを書く。'],
        ['文脈', 'Context', '必要な背景情報を渡す。'],
        ['条件', 'Rules', '範囲、文体、禁止事項を決める。'],
        ['例示', 'Examples', '期待する形を例で示す。'],
      ],
      flowTitle: 'よいPromptの並べ方',
      steps: ['目的', '背景', '条件', '形式'],
      takeaway: '要点：Promptは呪文ではなく、AIへの仕事の引き継ぎ。',
    },
  },
  {
    slug: 'what-is-ai-model-llm',
    imageBase: 'ai-model-llm-concept-card',
    theme: 'violet',
    zh: {
      badge: 'Model',
      title: 'AI 模型是什么？',
      subtitle: '模型不是知识库，而是一种从模式中生成结果的系统。',
      definition: [
        '大语言模型会根据上下文预测下一个合理输出。',
        '它擅长语言、推理和归纳，但仍需要事实校验。',
      ],
      pillars: [
        ['训练', 'Training', '从大量样本中学习模式。'],
        ['上下文', 'Context', '根据你提供的信息作答。'],
        ['生成', 'Generation', '按概率组合出回答。'],
        ['校验', 'Check', '重要事实需要外部确认。'],
      ],
      flowTitle: '理解模型的最小路径',
      steps: ['输入', '理解模式', '生成', '复核'],
      takeaway: '记住：模型不是数据库，它是在上下文里生成最可能的答案。',
    },
    ja: {
      badge: 'Model',
      title: 'AIモデルとは？',
      subtitle: '知識そのものではなく、文脈から答えを作る仕組み。',
      definition: [
        '大規模言語モデルは、文脈を手がかりに自然な出力を生成します。',
        '言語や推論に強い一方で、重要な事実は確認が必要です。',
      ],
      pillars: [
        ['学習', 'Training', '大量の例からパターンを学ぶ。'],
        ['文脈', 'Context', '入力された情報を手がかりにする。'],
        ['生成', 'Generation', '確率的に回答を組み立てる。'],
        ['確認', 'Check', '重要な事実は外部で確認する。'],
      ],
      flowTitle: 'モデルを理解する最短ルート',
      steps: ['入力', 'パターン', '生成', '確認'],
      takeaway: '要点：モデルはデータベースではなく、文脈から答えを生成する仕組み。',
    },
  },
  {
    slug: 'what-is-mcp',
    imageBase: 'mcp-concept-card',
    theme: 'teal',
    zh: {
      badge: 'MCP',
      title: 'MCP 是什么？',
      subtitle: '让 AI 连接外部工具和数据的一套标准接口。',
      definition: [
        'MCP = Model Context Protocol，给模型接工具的协议。',
        '它把工具能力、权限和数据来源变成更统一的连接方式。',
      ],
      pillars: [
        ['工具', 'Tools', '暴露可调用的能力。'],
        ['资源', 'Resources', '提供文件、数据和上下文。'],
        ['权限', 'Access', '控制能看什么、能做什么。'],
        ['协议', 'Protocol', '用统一方式接入不同系统。'],
      ],
      flowTitle: 'MCP 解决的连接问题',
      steps: ['模型', '协议', '工具', '数据'],
      takeaway: '记住：MCP 不是工具本身，而是让工具更标准地接给 AI。',
    },
    ja: {
      badge: 'MCP',
      title: 'MCPとは？',
      subtitle: 'AIと外部ツール・データをつなぐ共通ルール。',
      definition: [
        'MCPは、モデルにツールやデータを接続するためのプロトコルです。',
        '接続方法をそろえることで、外部システムを扱いやすくします。',
      ],
      pillars: [
        ['ツール', 'Tools', 'AIから呼び出せる機能。'],
        ['資料', 'Resources', 'ファイルやデータを渡す。'],
        ['権限', 'Access', '見える範囲、できる操作を制御。'],
        ['規格', 'Protocol', '違うシステムを同じ作法で接続。'],
      ],
      flowTitle: 'MCPがそろえる接続の流れ',
      steps: ['モデル', '規格', 'ツール', 'データ'],
      takeaway: '要点：MCPはツールそのものではなく、AIとツールをつなぐ共通ルール。',
    },
  },
  {
    slug: 'what-is-rag',
    imageBase: 'rag-concept-card',
    theme: 'green',
    zh: {
      badge: 'RAG',
      title: 'RAG 是什么？',
      subtitle: '先查资料，再让模型基于资料回答。',
      definition: [
        'RAG = Retrieval-Augmented Generation，检索增强生成。',
        '它用外部资料补充模型上下文，减少凭空回答。',
      ],
      pillars: [
        ['检索', 'Retrieve', '先找到相关资料。'],
        ['筛选', 'Select', '挑出最有用的片段。'],
        ['生成', 'Generate', '基于资料组织回答。'],
        ['引用', 'Cite', '让答案能追溯来源。'],
      ],
      flowTitle: 'RAG 的基本流程',
      steps: ['提问', '检索', '生成', '引用'],
      takeaway: '记住：RAG 不是让模型更聪明，而是让它先看资料再回答。',
    },
    ja: {
      badge: 'RAG',
      title: 'RAGとは？',
      subtitle: '資料を探してから、その根拠をもとに答える方法。',
      definition: [
        'RAGは、検索で見つけた外部資料を使って回答を補強する方法です。',
        'モデルだけに頼らず、根拠のある情報を文脈に入れます。',
      ],
      pillars: [
        ['検索', 'Retrieve', '関連する資料を探す。'],
        ['選別', 'Select', '使うべき情報を選ぶ。'],
        ['生成', 'Generate', '資料をもとに回答する。'],
        ['引用', 'Cite', '根拠を追える形にする。'],
      ],
      flowTitle: 'RAGの基本フロー',
      steps: ['質問', '検索', '生成', '引用'],
      takeaway: '要点：RAGはモデルを賢くするより、資料を見て答えさせる仕組み。',
    },
  },
  {
    slug: 'what-is-context-engineering',
    imageBase: 'context-engineering-concept-card',
    theme: 'amber',
    zh: {
      badge: 'Context',
      title: 'Context Engineering 是什么？',
      subtitle: '把模型能看到的信息，当成产品资源来设计。',
      definition: [
        'Context Engineering = 设计 AI 每次工作时能看到什么。',
        '它关注信息选择、顺序、压缩、更新和边界。',
      ],
      pillars: [
        ['选择', 'Select', '只放真正相关的信息。'],
        ['组织', 'Order', '按任务逻辑排列上下文。'],
        ['压缩', 'Compress', '把长材料变成可用摘要。'],
        ['更新', 'Refresh', '让上下文跟着任务变化。'],
      ],
      flowTitle: '上下文设计的顺序',
      steps: ['目标', '资料', '结构', '边界'],
      takeaway: '记住：AI 的表现，很大程度取决于你让它看见什么。',
    },
    ja: {
      badge: 'Context',
      title: 'Context Engineeringとは？',
      subtitle: 'AIに何を見せるかを、設計として考えること。',
      definition: [
        'Context Engineeringは、AIが作業中に参照する情報を設計する考え方です。',
        '情報の選び方、並べ方、圧縮、更新、境界を整えます。',
      ],
      pillars: [
        ['選ぶ', 'Select', '本当に関係する情報だけ入れる。'],
        ['並べる', 'Order', 'タスクに合う順番にする。'],
        ['圧縮', 'Compress', '長い資料を使える形に短くする。'],
        ['更新', 'Refresh', '進行に合わせて情報を入れ替える。'],
      ],
      flowTitle: '文脈設計の順序',
      steps: ['目的', '資料', '構造', '境界'],
      takeaway: '要点：AIの品質は、何を見せるかに大きく左右される。',
    },
  },
  {
    slug: 'what-is-structured-output',
    imageBase: 'structured-output-concept-card',
    theme: 'blue',
    zh: {
      badge: 'Schema',
      title: '结构化输出是什么？',
      subtitle: '让 AI 的回答变成机器也能稳定读取的格式。',
      definition: [
        '结构化输出 = 按固定字段、类型和规则返回结果。',
        '它把“看起来不错”的回答变成可校验、可接入的产物。',
      ],
      pillars: [
        ['字段', 'Fields', '明确需要哪些信息。'],
        ['类型', 'Types', '规定文本、数字、列表等。'],
        ['校验', 'Validate', '检查格式和缺失值。'],
        ['接入', 'Integrate', '方便进入表格、代码或系统。'],
      ],
      flowTitle: '从回答到可用数据',
      steps: ['字段', '格式', '校验', '接入'],
      takeaway: '记住：结构化输出让 AI 不只是会说，还能稳定交付数据。',
    },
    ja: {
      badge: 'Schema',
      title: 'Structured Outputとは？',
      subtitle: 'AIの回答を、機械が読みやすい形で返す方法。',
      definition: [
        'Structured Outputは、決めた項目・型・ルールに沿って返す出力です。',
        '文章を、検証しやすくシステム連携しやすいデータに変えます。',
      ],
      pillars: [
        ['項目', 'Fields', '必要な情報を明確にする。'],
        ['型', 'Types', '文字列、数値、リストを決める。'],
        ['検証', 'Validate', '形式や欠損を確認する。'],
        ['連携', 'Integrate', '表、コード、システムへ渡す。'],
      ],
      flowTitle: '回答をデータに変える流れ',
      steps: ['項目', '形式', '検証', '連携'],
      takeaway: '要点：構造化出力は、AIの回答を安定したデータにする。',
    },
  },
  {
    slug: 'what-is-eval',
    imageBase: 'eval-concept-card',
    theme: 'rose',
    zh: {
      badge: 'Eval',
      title: 'Eval 是什么？',
      subtitle: '不要只问“感觉好不好”，要定义怎么判断好不好。',
      definition: [
        'Eval = 用样例、标准和记录来评估 AI 输出质量。',
        '它帮助你区分偶然好用和稳定可靠。',
      ],
      pillars: [
        ['样例', 'Cases', '准备真实任务样本。'],
        ['标准', 'Criteria', '定义什么叫好结果。'],
        ['打分', 'Score', '记录通过、失败和原因。'],
        ['迭代', 'Improve', '根据结果改提示或系统。'],
      ],
      flowTitle: 'Eval 的基本闭环',
      steps: ['样例', '标准', '运行', '改进'],
      takeaway: '记住：没有 Eval，就很难知道 AI 是真的变好，还是刚好答对。',
    },
    ja: {
      badge: 'Eval',
      title: 'Evalとは？',
      subtitle: '「良さそう」ではなく、何をもって良いかを測る仕組み。',
      definition: [
        'Evalは、例題・評価基準・記録を使ってAI出力の品質を見ることです。',
        'たまたま良い結果と、安定して良い結果を切り分けます。',
      ],
      pillars: [
        ['例題', 'Cases', '実際のタスク例を用意する。'],
        ['基準', 'Criteria', '良い結果の条件を決める。'],
        ['採点', 'Score', '成功、失敗、理由を記録する。'],
        ['改善', 'Improve', '結果からPromptや設計を直す。'],
      ],
      flowTitle: 'Evalの基本ループ',
      steps: ['例', '基準', '実行', '改善'],
      takeaway: '要点：Evalがないと、AIが本当に良くなったか判断しにくい。',
    },
  },
  {
    slug: 'what-is-hallucination-grounding',
    imageBase: 'grounding-concept-card',
    theme: 'amber',
    zh: {
      badge: 'Grounding',
      title: '幻觉与 Grounding',
      subtitle: 'AI 会说得很像真的，所以更需要证据链。',
      definition: [
        '幻觉 = AI 生成了看似合理但不可靠的信息。',
        'Grounding = 把回答绑定到资料、引用或可验证事实。',
      ],
      pillars: [
        ['来源', 'Sources', '让答案有可追溯出处。'],
        ['引用', 'Citations', '标明使用了哪段材料。'],
        ['边界', 'Limits', '承认不知道和不确定。'],
        ['复核', 'Review', '关键事实交给人或工具检查。'],
      ],
      flowTitle: '降低幻觉的路径',
      steps: ['给资料', '要求引用', '标不确定', '复核'],
      takeaway: '记住：AI 越自信，不代表越正确；证据才是安全感。',
    },
    ja: {
      badge: 'Grounding',
      title: 'HallucinationとGrounding',
      subtitle: 'AIはもっともらしく言えるからこそ、根拠が必要です。',
      definition: [
        'Hallucinationは、もっともらしいけれど信頼できない情報が出ることです。',
        'Groundingは、回答を資料・引用・確認できる事実に結びつけることです。',
      ],
      pillars: [
        ['出典', 'Sources', '追跡できる根拠を持たせる。'],
        ['引用', 'Citations', 'どの資料を使ったか示す。'],
        ['限界', 'Limits', '不明な点や不確実性を示す。'],
        ['確認', 'Review', '重要事実を人やツールで確認。'],
      ],
      flowTitle: '幻覚を減らす流れ',
      steps: ['資料', '引用', '不明点', '確認'],
      takeaway: '要点：自信のある口調より、追える根拠が大事。',
    },
  },
  {
    slug: 'what-is-token-cost-model-choice',
    imageBase: 'token-cost-model-concept-card',
    theme: 'green',
    zh: {
      badge: 'Cost',
      title: 'Token、成本与模型选择',
      subtitle: 'AI 成本不是按“次数”想，而是按输入输出规模想。',
      definition: [
        'Token 是模型处理文本的基本单位，也影响价格和速度。',
        '模型选择要同时看能力、成本、延迟和任务风险。',
      ],
      pillars: [
        ['输入', 'Input', '资料越长，消耗越多。'],
        ['输出', 'Output', '生成越长，成本越高。'],
        ['模型', 'Model', '强模型适合高风险任务。'],
        ['预算', 'Budget', '按场景分层使用模型。'],
      ],
      flowTitle: '选择模型的顺序',
      steps: ['任务', '风险', '成本', '模型'],
      takeaway: '记住：简单任务用便宜模型，关键任务才值得上强模型。',
    },
    ja: {
      badge: 'Cost',
      title: 'Token・コスト・モデル選び',
      subtitle: 'AIのコストは回数ではなく、入力と出力の量で考える。',
      definition: [
        'Tokenは、モデルが処理するテキスト量の単位です。',
        'モデル選びは能力、費用、遅延、リスクを一緒に見ます。',
      ],
      pillars: [
        ['入力', 'Input', '資料が長いほど消費が増える。'],
        ['出力', 'Output', '生成が長いほど費用が増える。'],
        ['モデル', 'Model', '難しい作業には強いモデル。'],
        ['予算', 'Budget', '用途別にモデルを使い分ける。'],
      ],
      flowTitle: 'モデルを選ぶ順序',
      steps: ['タスク', 'リスク', '費用', 'モデル'],
      takeaway: '要点：軽い作業は軽いモデル、重要な作業は強いモデル。',
    },
  },
  {
    slug: 'context-window-memory-projects',
    imageBase: 'context-memory-projects-concept-card',
    theme: 'violet',
    zh: {
      badge: 'Memory',
      title: '上下文窗口、记忆与项目',
      subtitle: '这三个词都和“AI 能看到什么”有关，但层级不同。',
      definition: [
        '上下文窗口是本次对话能装下的信息量。',
        '记忆和项目则帮助 AI 在更长时间里保留偏好、资料和工作环境。',
      ],
      pillars: [
        ['窗口', 'Window', '当前对话能放多少内容。'],
        ['记忆', 'Memory', '跨对话保留稳定偏好。'],
        ['项目', 'Projects', '集中资料、指令和任务边界。'],
        ['整理', 'Hygiene', '定期清理过时上下文。'],
      ],
      flowTitle: '三者怎么配合',
      steps: ['窗口', '记忆', '项目', '复用'],
      takeaway: '记住：窗口管当下，记忆管偏好，项目管一组长期任务。',
    },
    ja: {
      badge: 'Memory',
      title: 'Context Window・Memory・Projects',
      subtitle: 'どれも「AIが見られるもの」に関係しますが、役割は違います。',
      definition: [
        'Context Windowは、今の会話に入れられる情報量です。',
        'MemoryとProjectsは、好み・資料・作業環境を長く支えます。',
      ],
      pillars: [
        ['窓', 'Window', '今の会話に入る情報量。'],
        ['記憶', 'Memory', '会話をまたいで好みを保つ。'],
        ['プロジェクト', 'Projects', '資料や指示をまとめる場所。'],
        ['整理', 'Hygiene', '古い情報を定期的に見直す。'],
      ],
      flowTitle: '三つの使い分け',
      steps: ['Window', 'Memory', 'Project', '再利用'],
      takeaway: '要点：Windowは今、Memoryは好み、Projectsは長期作業。',
    },
  },
  {
    slug: 'ai-coding-tools',
    imageBase: 'ai-coding-tools-concept-card',
    theme: 'blue',
    zh: {
      badge: 'Coding',
      title: 'AI 编程工具怎么用？',
      subtitle: '把 AI 当成结对工程师，而不是自动许愿机。',
      definition: [
        'AI 编程工具适合解释代码、生成草稿、改错和补测试。',
        '真正可靠的用法，是让它在明确边界内迭代。',
      ],
      pillars: [
        ['范围', 'Scope', '先说明要改哪里。'],
        ['上下文', 'Context', '给文件、错误和目标。'],
        ['验证', 'Verify', '要求运行测试或检查。'],
        ['审查', 'Review', '人负责最终判断和合并。'],
      ],
      flowTitle: '一次靠谱的 AI 编程协作',
      steps: ['描述', '修改', '测试', '审查'],
      takeaway: '记住：AI 能加速实现，但边界和验收标准要由人给清楚。',
    },
    ja: {
      badge: 'Coding',
      title: 'AIコーディングツールの使い方',
      subtitle: 'AIを願い事マシンではなく、ペア開発者として使う。',
      definition: [
        'AIコーディングツールは、説明・草案・修正・テスト補助に向いています。',
        '信頼して使うには、範囲と合格条件を先に決めることが大切です。',
      ],
      pillars: [
        ['範囲', 'Scope', 'どこを変えるか先に決める。'],
        ['文脈', 'Context', 'ファイル、エラー、目的を渡す。'],
        ['検証', 'Verify', 'テストや確認を実行する。'],
        ['レビュー', 'Review', '最後の判断は人が行う。'],
      ],
      flowTitle: 'AIと安全に開発する流れ',
      steps: ['説明', '修正', 'テスト', '確認'],
      takeaway: '要点：AIは実装を速くするが、境界と合格条件は人が決める。',
    },
  },
];

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function textLine(value, x, y, className, size, weight = '') {
  const weightAttr = weight ? ` font-weight="${weight}"` : '';
  return `<text x="${x}" y="${y}" class="sans ${className}" font-size="${size}"${weightAttr}>${escapeXml(value)}</text>`;
}

function textBlock(lines, x, y, className, size, gap, weight = '') {
  return lines
    .map((line, index) => textLine(line, x, y + index * gap, className, size, weight))
    .join('\n');
}

function pillarSvg([title, label, body], index) {
  const positions = [
    [112, 788],
    [616, 788],
    [112, 966],
    [616, 966],
  ];
  const colors = [palettes.blue, palettes.amber, palettes.green, palettes.violet];
  const [x, y] = positions[index];
  const color = colors[index];

  return `<g transform="translate(${x} ${y})">
    <rect width="472" height="150" rx="30" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <circle cx="66" cy="66" r="37" fill="${color.light}"/>
    <text x="50" y="78" class="sans" font-size="42" font-weight="900" fill="${color.a}">${index + 1}</text>
    <text x="126" y="58" class="sans ink" font-size="32" font-weight="850">${escapeXml(title)}</text>
    <text x="126" y="92" class="mono soft" font-size="20">${escapeXml(label)}</text>
    <text x="126" y="126" class="sans muted" font-size="24">${escapeXml(body)}</text>
  </g>`;
}

function flowSvg(steps, palette) {
  const stepWidths = [172, 172, 172, 128];
  let x = 0;
  const parts = [];

  steps.forEach((step, index) => {
    const width = stepWidths[index] ?? 150;
    const fill = [palette.a, '#155e75', '#2563eb', '#7c3aed'][index] ?? palette.b;
    parts.push(`<rect x="${x}" y="0" width="${width}" height="48" rx="18" fill="${fill}"/>`);
    parts.push(
      `<text x="${x + width / 2}" y="32" text-anchor="middle" class="sans white" font-size="23" font-weight="820">${escapeXml(step)}</text>`,
    );
    x += width;

    if (index < steps.length - 1) {
      parts.push(
        `<path d="M${x + 22} 24h48" stroke="#1e3a5f" stroke-width="4" stroke-linecap="round"/>`,
      );
      parts.push(
        `<path d="M${x + 60} 11l18 13-18 13" fill="none" stroke="#1e3a5f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
      x += 98;
    }
  });

  return parts.join('\n');
}

function renderCard(topic, locale) {
  const data = topic[locale];
  const palette = palettes[topic.theme];
  const langLabel = locale === 'ja' ? '入門カード' : '智能体概念卡';
  const cardLabel = locale === 'ja' ? 'AI 入門カード' : langLabel;
  const titleSize =
    locale === 'ja'
      ? data.title.length > 13
        ? 52
        : 70
      : data.title.length > 22
        ? 52
        : data.title.length > 16
          ? 62
          : 78;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1500" viewBox="0 0 1200 1500" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(data.title)}</title>
  <desc id="desc">${escapeXml(data.definition.join(' '))}</desc>
  <defs>
    <linearGradient id="pageBg" x1="120" y1="0" x2="1080" y2="1500" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0f3442"/>
      <stop offset="0.52" stop-color="#071827"/>
      <stop offset="1" stop-color="#152033"/>
    </linearGradient>
    <linearGradient id="paper" x1="100" y1="70" x2="1100" y2="1420" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fbfdff"/>
      <stop offset="1" stop-color="#edf8fa"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#5eead4"/>
      <stop offset="1" stop-color="#38bdf8"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="28" stdDeviation="34" flood-color="#020617" flood-opacity="0.32"/>
    </filter>
    <style>
      .sans { font-family: "PingFang SC", "Noto Sans SC", "Microsoft YaHei", "Hiragino Sans", "Hiragino Sans GB", sans-serif; }
      .mono { font-family: "SFMono-Regular", "Cascadia Code", "Menlo", monospace; }
      .ink { fill: #0f172a; }
      .muted { fill: #475569; }
      .soft { fill: #64748b; }
      .white { fill: #f8fafc; }
      .cyan { fill: #67e8f9; }
    </style>
  </defs>

  <rect width="1200" height="1500" rx="64" fill="url(#pageBg)"/>
  <path d="M92 0v1500M252 0v1500M412 0v1500M572 0v1500M732 0v1500M892 0v1500M1052 0v1500M0 128h1200M0 288h1200M0 448h1200M0 608h1200M0 768h1200M0 928h1200M0 1088h1200M0 1248h1200M0 1408h1200" stroke="#7dd3fc" stroke-opacity="0.05"/>
  <circle cx="1028" cy="180" r="280" fill="${palette.a}" fill-opacity="0.14"/>
  <circle cx="176" cy="1328" r="280" fill="#34d399" fill-opacity="0.10"/>

  <g filter="url(#shadow)">
    <rect x="72" y="64" width="1056" height="1372" rx="56" fill="url(#paper)" stroke="#b7dce6" stroke-width="3"/>
  </g>

  <rect x="112" y="104" width="976" height="118" rx="34" fill="#071525"/>
  ${textLine('AI BASICS FOR EVERYONE', 154, 154, 'cyan', 25, '800').replace('<text ', '<text letter-spacing="5" ')}
  ${textLine(cardLabel, 154, 196, 'white', 28, '650')}
  <rect x="870" y="132" width="172" height="58" rx="22" fill="#123f5c" stroke="#38bdf8" stroke-opacity="0.45"/>
  <text x="956" y="170" text-anchor="middle" class="mono cyan" font-size="24" font-weight="800">${escapeXml(data.badge)}</text>

  ${textLine(data.title, 112, 334, 'ink', titleSize, '860')}
  ${textLine(data.subtitle, 118, 394, 'muted', locale === 'ja' ? 28 : 32)}

  <rect x="112" y="460" width="976" height="170" rx="36" fill="#e6f8f8" stroke="#9bd8df" stroke-width="2"/>
  <rect x="148" y="494" width="${locale === 'ja' ? 148 : 128}" height="48" rx="18" fill="${palette.a}"/>
  ${textLine(locale === 'ja' ? 'ひとことで' : '一句话', 180, 527, 'white', 24, '850')}
  ${textBlock(data.definition, 148, 582, 'ink', locale === 'ja' ? 27 : 30, 38, '820')}

  ${textLine(locale === 'ja' ? '4つの基本要素' : '四个核心要素', 112, 710, 'ink', 40, '860')}
  ${textLine(locale === 'ja' ? 'ここを押さえると、概念の使いどころが見えます。' : '少了其中任何一个，都很容易退化成普通聊天。', 112, 750, 'muted', 25)}

  ${data.pillars.map((pillar, index) => pillarSvg(pillar, index)).join('\n\n')}

  <rect x="112" y="1176" width="976" height="146" rx="34" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
  ${textLine(data.flowTitle, 148, 1224, 'ink', 34, '860')}
  <g transform="translate(148 1252)">
    ${flowSvg(data.steps, palette)}
  </g>

  <g transform="translate(112 1360)">
    <rect width="976" height="58" rx="24" fill="url(#accent)" opacity="0.92"/>
    ${textLine(data.takeaway, 34, 38, 'ink', locale === 'ja' ? 20 : 22, '850')}
  </g>
</svg>
`;
}

async function updateCoverImage(markdownPath, imagePath) {
  const source = await readFile(markdownPath, 'utf8');
  const coverImagePattern = /^coverImage: .+$/m;

  if (!coverImagePattern.test(source)) {
    throw new Error(`coverImage not found in ${markdownPath}`);
  }

  const next = source.replace(coverImagePattern, `coverImage: "${imagePath}"`);
  await writeFile(markdownPath, next);
}

await mkdir(imageDir, { recursive: true });

for (const topic of topics) {
  for (const locale of ['zh', 'ja']) {
    const suffix = locale === 'ja' ? '.ja' : '';
    const fileName = `${topic.imageBase}.${locale}.svg`;
    const imagePath = `/images/start/ai-basics-for-everyone/cards/${fileName}`;
    const markdownPath = path.join(contentDir, `${topic.slug}${suffix}.md`);

    await writeFile(path.join(imageDir, fileName), renderCard(topic, locale));
    await updateCoverImage(markdownPath, imagePath);
  }
}

console.log(`Generated ${topics.length * 2} knowledge cards.`);
