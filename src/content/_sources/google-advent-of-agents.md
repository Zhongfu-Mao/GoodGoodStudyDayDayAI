# Google Advent of Agents source inventory

This local source inventory supports the public AI Academy series "Google Advent of Agents". It is not a public article and should not be copied into public Markdown verbatim.

## Editorial boundary

- Public pages should be original study notes, diagrams, checklists, and practical interpretation.
- Do not translate or reproduce the Advent of Agents daily copy as-is.
- Gmail newsletter messages can be used for metadata, emphasis, links, and topic prioritization. Do not expose Gmail links, message IDs, internal labels, or private mailbox state in public content.
- Prefer official links first: Advent of Agents, ADK docs, Google Cloud Agent Engine / Agent Builder docs, Google Cloud blog posts, Google GitHub repositories, Kaggle whitepapers or learning guides, and protocol docs such as A2A / MCP when linked from official materials.

## Primary official sources

- Advent of Agents: https://adventofagents.com/
- Season 1 archive: https://adventofagents.com/2025/12/
- Season 2 archive: https://adventofagents.com/2026/03/
- Google ADK docs: https://google.github.io/adk-docs/
- Agent Starter Pack: https://github.com/GoogleCloudPlatform/agent-starter-pack
- Vertex AI Agent Engine overview: https://docs.cloud.google.com/agent-builder/agent-engine/overview
- Agent Designer: https://docs.cloud.google.com/agent-builder/agent-designer
- Kaggle Introduction to Agents whitepaper: https://www.kaggle.com/whitepaper-introduction-to-agents
- Kaggle AI Agents intensive guide: https://www.kaggle.com/learn-guide/5-day-agents

## Gmail newsletter coverage currently found

Gmail search found Google Groups messages from the Advent of Agents newsletter for Season 2 Day 1 and Day 22-31. These emails are useful because they summarize each drop's emphasis in three bullets and confirm the official Advent page URL for each day.

Covered newsletter topics:

- Day 1: Season 2 kick off, 31 tutorials, ADK, Vertex AI Agent Engine, Agent Starter Pack.
- Day 22: ADK Evaluation, trajectory tests, rubric-based scoring, CI integration.
- Day 23: Model Armor, prompt injection, jailbreaks, PII redaction, model-agnostic safety.
- Day 24: Batch Processing, Agent as Orchestrator pattern, Gemini Batch API, large-scale asynchronous workloads.
- Day 25: Agent Deployment, Vertex AI Agent Engine and Cloud Run deployment workflows.
- Day 26: Authentication, end-user identity propagation, OAuth consent, authenticated tools.
- Day 27: Scion, isolated multi-agent orchestration using worktrees, containers, and multiple coding agents.
- Day 28: A2A Protocol, decoupling reasoning from execution across Python and Go services.
- Day 29: ApiRegistry, dynamically fetching admin-approved BigQuery tools.
- Day 30: Observability, OpenTelemetry, Arize Phoenix, hierarchical tracing, span replay.
- Day 31: A2UI and A2A, interactive micro-apps inside Gemini Enterprise.

## Season 1 topic map from official site bundle

Season 1 is the December 2025 track. The site describes it as "25 days. Zero to Production-Ready AI Agents on Google Cloud."

| Day | Title | Editorial role |
| ---: | --- | --- |
| 1 | Launch Initiative | Orientation and prerequisites. |
| 2 | Hello World with YAML | Lowest-friction first agent. |
| 3 | Gemini 3 + ADK | Code-first ADK agent with Gemini and tools. |
| 4 | Source-Based Deployment | First bridge from local agent to Agent Engine. |
| 5 | Production Observability | Treat traces, logs, and BigQuery as part of the agent surface. |
| 6 | ADK ready in Antigravity, Gemini CLI, Cursor, Firebase Studio and more | Developer environment and LLM-readable docs. |
| 7 | LLMs Can Execute Code | Agents as problem solvers with code execution. |
| 8 | Effective Context Management with ADK Layers | Context as a compiled view over state. |
| 9 | Undo buttons for your Agents | Resume and rewind as product features. |
| 10 | Big Context does not equal Better Memory | Caching and compaction as reliability tools. |
| 11 | Google Managed MCP | Managed tool access to Google services. |
| 12 | Multimodal Agents with Gemini Live API | Real-time multimodal agent experience. |
| 13 | Interactions API | Stateful autonomous workflow interface. |
| 14 | Connecting Agents with A2A | Agent-to-agent interoperability. |
| 15 | Introducing A2UI | Agent-generated UI payloads. |
| 16 | LangGraph + A2A | Interoperability beyond ADK. |
| 17 | Gemini 3 Flash is here | Model choice for agent speed and cost. |
| 18 | Cloud API Registry + ADK | Enterprise tool registry pattern. |
| 19 | Register to Gemini Enterprise | Discoverability in enterprise agent catalogs. |
| 20 | A2A Extensions | Custom protocol sidecars. |
| 21 | Kaggle Capstone Winners Highlight | Case-study layer and project inspiration. |
| 22 | Security & Guardrails | Approval, identity, callbacks, plugins, Model Armor. |
| 23 | Durable, Resilient Agents with Google ADK + Restate | Durable execution and crash recovery. |
| 24 | A2A-ify Anything | Retrofitting existing samples with A2A. |
| 25 | Grand Finale: Mission Accomplished | Agent Designer, final recap, next steps. |

## Season 2 topic map from official site bundle and Gmail newsletter

Season 2 is the March 2026 spring track. The site describes it as "31 days. Zero to Production-Ready AI Agents on Google Cloud."

| Day | Title | Editorial role |
| ---: | --- | --- |
| 1 | Season 2 Kick Off | Orientation, scope, and how Season 2 extends Season 1. |
| 2 | Build ADK Agents with Gemini 3.1 Pro | Language-flexible ADK scaffolding. |
| 3 | Build AI Agents with Gemini 3.1 Flash-Lite | Cost-efficient model choice and memory-agent example. |
| 4 | MCP Servers | External tool integration through MCP. |
| 5 | Long Term Recall: Memory Plugins | Persistent semantic memory. |
| 6 | ADK Skills | Progressive disclosure for instruction loading. |
| 7 | ADK Agent Skill Design Patterns | How to structure SKILL.md content. |
| 8 | Multi-Agent Patterns: Sequential Agents | Deterministic chained workflows. |
| 9 | Multi-Agent Patterns: Coordinator/Dispatcher Agents | Routing and specialized agents. |
| 10 | Multi-Agent Patterns: Parallel Fanout and State Interpolation | Concurrent grounded work and synthesis. |
| 11 | Multi-Agent Patterns: Hierarchical Decomposition | Manager agent planning and delegation. |
| 12 | Multi-Agent Patterns: Generator-Critic Agent Loop | Writer/critic refinement loop. |
| 13 | Multi-Agent Patterns: Iterative Refinement | Skills + MCP + code execution in a meta-agent. |
| 14 | Multi-Agent Patterns: Human in the Loop | Approval breakpoints for sensitive APIs. |
| 15 | Grounding with ADK: Agentic RAG with Vector Search 2.0 | Retrieval as an agent capability. |
| 16 | ADK Dev Skills: Accelerated Multiagent Triage | Developer workflow for multi-agent systems. |
| 17 | Workspace & Gemini Enterprise: no-code agents | Enterprise agent building without code. |
| 18 | Workspace & Gemini Enterprise: ADK agents | ADK agents connected to Workspace and Gemini Enterprise. |
| 19 | Live Shopping Agent | Multimodal commerce use case. |
| 20 | ADK Agent Harness | Generate-validate-refine pipeline. |
| 21 | Developer's Guide to AI Agent Protocols | MCP, A2A, UCP, AP2, A2UI, AG-UI comparison. |
| 22 | ADK Evaluation | Trajectory tests and rubric-based scoring. |
| 23 | Model Armor | Security firewall for agents. |
| 24 | Batch Processing | Agent as orchestrator for 10k-scale workloads. |
| 25 | Agent Deployment | Agent Engine and Cloud Run. |
| 26 | Authentication | End-user identity propagation. |
| 27 | Scion | Open testbed for orchestration. |
| 28 | A2A Protocol | Decoupling reasoning from execution. |
| 29 | ApiRegistry | Dynamic BigQuery tool fetching. |
| 30 | Observability | Hierarchical tracing. |
| 31 | A2UI & A2A | Interactive agent micro-apps. |

## Proposed public article clusters

- Overview and learning map.
- ADK first agent and project anatomy.
- Context, memory, skills, and state.
- MCP, A2A, A2UI, and protocol boundaries.
- Deployment on Agent Engine and Cloud Run.
- Observability, evals, and regression control.
- Security, identity, guardrails, and Model Armor.
- Batch, durable execution, and production scale.

