---
title: "AI レーダー日報：2026-05-26"
date: 2026-05-26
category: radar
cadence: daily
plainSummary: "今日の主線は、agent engineering が単発 demo から auditable、isolated、operable な production system へ進んでいることです。用語面では harness、scaffold、policy、memory の整理が進み、long context 処理は code execution と sub-model recursion へ向かい、SaaS、BI、healthcare、browser automation では multi-tenancy、compliance、observability、human supervision が architecture の中心になっています。"
difficulty: intermediate
tags:
  - AI Engineering
  - Agent
  - Infrastructure
  - Evaluation
lang: ja
coverImage: /images/radar/daily-ai-radar-2026-05-26.ja-infographic.webp
audioUrl: /audio/radar/daily-ai-radar-2026-05-26.ja.mp3
audioDuration: 1167
audioSize: 9332800
draft: false
---

## 対象範囲

- 対象期間：2026-05-25 〜 2026-05-26。あわせて 2026-05-21 の未採用だが signal value が高い AgentCore と enterprise agent cases を補足します。

---
![Agent harness, scaffold and model diagram](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/agent-glossary/agent-diagram.png)

*代表画像は [Hugging Face Agent Glossary](https://huggingface.co/blog/agent-glossary) から。本日の中心 signal である、agent の差が model 外側の harness、scaffold、tools、memory、runtime、verification loop から生まれるという構図を表しています。*

## 1. Agent terminology、deep research、formal proof

### Hugging Face は Agent Glossary で model、scaffold、harness、policy、reward の境界を整理した

- 出典：Hugging Face
- 日付：2026-05-25
- リンク：https://huggingface.co/blog/agent-glossary
- 要約：Hugging Face は、agent 分野の vocabulary が急速に増え、harness、scaffold、context engineering、policy、skills、sub-agents、rollout、reward が混同されていると指摘しました。Article は実用的な切り分けを示します。model は 1 回の input/output を行う LLM、scaffold は system prompt、tool descriptions、parsing format、context management、harness は execution loop、tool calls、stop condition を扱う層、agent は model とこれらの external execution structures を合わせたものです。Training 側の environment、trainer、rollout、reward と、deployment 側の tools、memory、sub-agents も同じ conceptual map に置かれています。Engineering teams にとって、この語彙整理は architecture review、evaluation design、role communication に直結します。

### Onyx の Deep Research architecture は search access のない orchestrator を research quality control として使う

- 出典：Daily Dose of Data Science / Onyx
- 日付：2026-05-25
- リンク：https://github.com/onyx-dot-app/onyx
- 要約：Daily Dose of DS は Onyx deep research の counterintuitive design を紹介しました。Research strategy を作る orchestrator agent は web search や URL open の権限を持たず、self-contained な research tasks を分解して research agents に渡すだけです。Onyx の public repository は、RAG、web search、code execution、deep research、50+ connectors、MCP を持つ open-source LLM application layer であることを示しています。この設計の価値は、coordinator が自分で早すぎる検索を始め、最初に見つけた資料から shallow report を作るのを防ぐ点です。Enterprise deep research で重要なのは「検索できること」だけでなく、strategy、retrieval、reading、citation consolidation、permission control を verifiable stages に分けることです。

### AlphaProof Nexus は Lean formal proof search で 9 件の Erdős open problems と 44 件の OEIS conjectures を解いた

- 出典：arXiv
- 日付：2026-05-21
- リンク：https://arxiv.org/abs/2605.22763
- 要約：Google DeepMind、MIT CSAIL などの著者による論文は、AI-driven formal proof search が real mathematical open problems に進み始めたことを示しました。最も強い agent は formalized Erdős problems 353 件中 9 件を自律的に解き、OEIS conjectures 492 件中 44 件を証明しました。Paper は per-problem inference cost が数百ドル規模だったと述べています。System は LLM に Lean proof を生成させ、formal verifier が各 step を検査する構成です。Basic agent も Erdős successes を再現しましたが、hardest problems では cost が高くなりました。この結果の意味は mathematicians を置き換えることではなく、reasoning を compilable、checkable、scalable search process に変えることです。

## 2. Long context、tenant isolation、MCP runtime

### AWS は Recursive Language Models で超長文書を context window ではなく programmable environment として扱う

- 出典：AWS
- 日付：2026-05-21
- リンク：https://aws.amazon.com/blogs/machine-learning/break-the-context-window-barrier-with-amazon-bedrock-agentcore/
- 要約：AWS は Bedrock AgentCore Code Interpreter と Strands Agents SDK で Recursive Language Models を実装する方法を示しました。Root model は full document を受け取らず、sandbox 内で Python code を書き、document を search、slice、analyze します。Semantic judgment が必要な箇所では sandbox 内から sub-LLM を呼び、その result を Python variables として working memory に残します。Evaluation では RLM が LongBench v2 financial multi-document QA と code repository understanding tasks で 100% success rate を達成し、複数 model の accuracy を大きく改善しました。これは重要な architecture direction です。Million-character input に対して、agent は longer context だけに頼るのではなく、context を queryable、executable、stateful environment として扱うべきです。

### AWS は multi-tenant agent architecture を runtime、model、workflow、RAG、identity、memory、policy、observability など 10 control surfaces に分解した

- 出典：AWS
- 日付：2026-05-21
- リンク：https://aws.amazon.com/blogs/machine-learning/building-multi-tenant-agents-with-amazon-bedrock-agentcore/
- 要約：AWS は SaaS 向け multi-tenant agents について、model performance だけでなく tenant isolation、identity、data isolation、cost attribution、noisy neighbor mitigation、memory namespace、tool access control、guardrails を扱いました。Design pattern は silo、pool、bridge に整理されています。High-compliance customers には dedicated runtime、gateway、memory、data layer を使い、中小 tenants には shared resources を JWT、namespaces、ABAC で partition します。Hybrid pattern は tenant tier に応じて isolation level を選びます。この framework は、production agent の risk が「誤答」だけでなく、cross-tenant access、unattributed cost、memory leakage、tool permission failure へ広がっていることを示しています。

### AWS API MCP Server と Amazon Quick の統合は cloud operations query を IAM / Cognito controlled natural-language interface にする

- 出典：AWS
- 日付：2026-05-21
- リンク：https://aws.amazon.com/blogs/machine-learning/integrating-aws-api-mcp-server-with-amazon-quick-suite-using-amazon-bedrock-agentcore-runtime/
- 要約：AWS は Bedrock AgentCore Runtime の MCP support を使い、Amazon Quick を AWS API MCP Server に接続する方法を示しました。User は Quick で “Show running EC2 instances in us-east-1” と聞けます。Custom agent は Cognito から JWT を取得し、AgentCore Runtime が token を検証し、containerized MCP server を呼び出し、IAM execution role に基づいて AWS CLI/API operation を実行します。Article は CloudWatch audit trail、least privilege、production で裸の no-auth MCP server を使わないこと、origin/host allowlist を絞ることも強調しています。この pattern は MCP を local developer protocol から enterprise operations interface へ押し上げます。Natural language は入口であり、重要なのは authentication、authorization、audit、permission boundary です。

## 3. Enterprise and industry agents：BI、dashboards、healthcare、recruiting

### AWS の dashboard automation agent は Quick dashboard changes を ticket flow から natural-language multi-agent orchestration に圧縮する

- 出典：AWS
- 日付：2026-05-21
- リンク：https://aws.amazon.com/blogs/machine-learning/build-ai-powered-dashboard-automation-agents-with-nlp-on-amazon-bedrock-agentcore/
- 要約：AWS は Quick dashboard self-service solution を構築しました。Find Dashboard Agent、Modify Dashboard Agent、Orchestrator Agent で構成されています。User が自然言語で column の追加や削除を依頼すると、system はまず dashboard と dataset schema を検索し、field が存在するか、すでに visual に入っているかを検証し、最後に original dashboard を上書きせず new dashboard version を作成します。Architecture は Bedrock AgentCore、Strands、Amazon Nova、AgentCore Memory、Observability を使います。この signal は BI automation だけではありません。Business users が production objects を self-service で変更するには、validation-first、rollback、auditability、agent-as-tool separation が必要です。

### OPLOG は 3 つの AgentCore BI agents で sales cycle、CRM completeness、sales research time を改善した

- 出典：AWS
- 日付：2026-05-21
- リンク：https://aws.amazon.com/blogs/machine-learning/build-ai-agents-for-business-intelligence-with-amazon-bedrock-agentcore/
- 要約：AWS は OPLOG の production BI agent system を紹介しました。Deal Analyzer Agent は HubSpot deals が sales methodology に沿っているかを scheduled basis で確認します。Sales Coach Agent は deal stage changes のタイミングで fields を検証し tasks を作ります。Lead Insight Agent は new lead 追加後、social / web signals を並列に調査し ICP fit と outreach recommendations を生成します。System は Strands、AgentCore、Bedrock Knowledge Bases、Claude Sonnet、Lambda、EventBridge、Teams webhook を使います。Article は sales cycle 35% reduction、CRM data completeness 91% improvement、manual research time 98% reduction を報告しています。Enterprise agent の高価値 entry point は chat ではなく、daily repeated but context-dependent checks を event streams に組み込むことです。

### AWS の radiology worklist agent は case assignment を rules queue から multi-agent clinical orchestration に変える

- 出典：AWS
- 日付：2026-05-21
- リンク：https://aws.amazon.com/blogs/machine-learning/intelligent-radiology-workflow-optimization-with-ai-agents-2/
- 要約：AWS は intelligent radiology worklist optimization solution を示しました。Orchestrator agent が exam metadata、patient history、radiologist assignment、availability、dynamic rules、exam prioritization などの sub-agents を coordinating します。System は radiologist specialization、current workload、fatigue、case complexity、SLA、urgency を考慮し、AgentCore Memory で short-term sessions と long-term experiences を保持します。Guardrails は input/output の両側で PII と out-of-scope topics を制限し、MCP Gateway は clinical data、scheduling、PACS/Imaging APIs に接続します。この case の意味は、healthcare agent reliability が model ability だけでなく、division of labor、memory、compliance、priority handling、human-readable rationale に依存することです。

### Amazon Nova Act が HIPAA eligible になり、browser automation agents が regulated healthcare workflows に入り始めた

- 出典：AWS
- 日付：2026-05-21
- リンク：https://aws.amazon.com/blogs/machine-learning/amazon-nova-act-is-now-hipaa-eligible/
- 要約：AWS は Amazon Nova Act が HIPAA eligible service になったと発表しました。AWS BAA を締結した account では ePHI を含む agentic workflow に使えます。Nova Act は production UI workflows in browser のための service で、websites navigation、form filling、information extraction、multi-step tasks を実行し、必要に応じて human supervisor に escalate します。API、remote MCP、Strands Agents とも統合できます。Healthcare use cases として appointment scheduling、insurance verification、prior authorization、claims status、appeals、referrals、compliance reporting が挙げられています。Browser agents が real enterprise workflows に入るとき、compliance eligibility、IAM、KMS、CloudTrail、human supervision は model capability と同じくらい重要になります。

### AWS の recruitment assistant reference architecture は resume screening を evidence citation、PII anonymization、prompt attack protection 付きの high-risk AI flow にする

- 出典：AWS
- 日付：2026-05-21
- リンク：https://aws.amazon.com/blogs/machine-learning/build-an-ai-powered-recruitment-assistant-using-amazon-bedrock/
- 要約：AWS は Bedrock-based recruiting assistant reference architecture を公開しました。Resume parsing、candidate matching、skill assessment、personalized interview question generation を扱います。System は Amplify、Cognito、API Gateway、Lambda、DynamoDB、S3、Bedrock Converse API、Nova Pro、Bedrock Guardrails を使います。Prompt はすべての判断に resume evidence を引用し、name、contact details、demographics、personal characteristics に基づく assumptions を避けるよう求めます。Guardrails は PII anonymization、resume 内の prompt injection detection、bias-related content filtering を担います。Article はこれを high-risk AI application と明示し、final hiring decision は human が担うべきだとしています。人事、金融、医療に近づくほど、AI output は evidence chain、audit、mandatory human checkpoints を必要とします。

## 4. Content ecosystem、deployment basics、model portability

### OpenAI と Grupo Folha / Grupo UOL の Brazil content partnership は、ChatGPT の news access が local trusted sources へ向かう流れを示す

- 出典：OpenAI
- 日付：2026-05-25
- リンク：https://openai.com/index/grupo-folha-grupo-uol-partnership
- 要約：OpenAI は Grupo Folha と Grupo UOL との strategic content partnership を発表しました。OpenAI にとって Brazil 初の media partnership です。OpenAI は、900 million weekly active ChatGPT users が Folha de S.Paulo と UOL reporting に基づく summaries にアクセスし、attribution、transparency、original source links を通じて news source に戻れるようになると述べています。OpenAI は Brazil が ChatGPT の largest markets の一つで、monthly active users は 50 million 超、daily messages は約 140 million とも明かしました。AI product ecosystem では、この種の partnership が、generation capability だけでなく licensed content、source attribution、local-language markets、news organization distribution を扱う必要性を示しています。

### Daily Dose of DS の ONNX chapter は、model deployment bottleneck が format、runtime、hardware backend にあることを思い出させる

- 出典：Daily Dose of Data Science
- 日付：2026-05-25
- リンク：https://www.dailydoseofds.com/mlops-crash-course-part-10/
- 要約：Daily Dose of DS は MLOps course で model compression と portability を続け、knowledge distillation、low-rank factorization、quantization、そして training framework と production runtime をつなぐ ONNX / ONNX Runtime を扱いました。Article は、PyTorch や TensorFlow で train した model が、最終的には C++ service、mobile device、GPU-optimized runtime、CPU-only environment で動く可能性を強調します。Common format がなければ、framework-to-runtime transition は毎回 custom engineering になります。ONNX は computation graph、standard operators、tensor shapes、metadata、weights を intermediate representation にし、ONNX Runtime は graph optimization と hardware backend dispatch を担います。Agent products にとってもこれは infrastructure issue です。Models が edge、real-time、high-throughput paths に入るほど、portable runtime は重要になります。

## 📬 Newsletter 精選

- Daily Dose of Data Science：本期は 2 items を採用し、Onyx deep research の orchestrator constraint design と ONNX / ONNX Runtime の model portability を扱いました。
- AI Valley と The Rundown AI：AlphaProof Nexus の mathematics progress を同時に提示しました。本期は arXiv paper を primary link として確認し採用しました。
- その他の items は主に OpenAI、Hugging Face、AWS official releases から採用しています。
