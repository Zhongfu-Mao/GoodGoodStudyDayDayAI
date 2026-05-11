---
title: "GPT-image-2 全景实战：能力、成本、API 与工作流"
date: 2026-05-11
category: engineering
description: "从 ChatGPT 内置生图、Image API、Responses API、成本、限制、失败模式和发布检查出发，整理 GPT-image-2 的工程化使用方法。"
difficulty: intermediate
plainSummary: "GPT-image-2 不只是一个生图按钮。可靠使用它需要区分 ChatGPT 内置能力、Image API、Responses API、编辑/参考图工作流、成本估算、透明背景限制和发布前 QA。"
tags:
  - "AI Engineering"
  - "GPT-image-2"
lang: zh
coverImage: "/images/engineering/practice/gpt-image-2-practice-cover.png"
draft: false
---

# GPT-image-2 全景实战：能力、成本、API 与工作流

> 时效边界：本文核验于 2026-05-11。OpenAI 图片模型、价格、输出尺寸、透明背景支持和 Codex 内置生图计费方式变化较快，使用前请复查官方文档。

GPT-image-2 最容易被低估成“画图工具”，也容易被高估成“万能视觉设计师”。更准确的定位是：它是一个可以理解文字和图片输入、生成或编辑视觉资产的模型能力。要把它用于真实项目，关键不是写一条漂亮 prompt，而是建立一条可复盘的图片生产线。

![GPT-image-2 图片生产线](/images/engineering/practice/gpt-image-2-pipeline.svg)

## 先区分三种使用方式

第一种是 ChatGPT 或 Codex 里的内置生图。它适合快速探索封面、插图、占位图、角色草案和 UI 氛围图。优点是低摩擦，缺点是批量控制、成本记录和自动化能力有限。OpenAI Codex 文档说明，Codex 内置图片生成使用 `gpt-image-2`，会计入通用 Codex 使用限制，并且通常比不生成图片的类似 turn 更快消耗限额。

第二种是 Image API。它适合“一个请求生成或编辑一张图”的自动化任务。你可以直接指定 `model: "gpt-image-2"`，并控制尺寸、质量、格式和压缩。

第三种是 Responses API 的 `image_generation` 工具。它适合多轮、可对话、可迭代的图片体验。比如先生成一张封面，再基于上一轮图片继续修改，或者让主模型决定当前应该生成还是编辑。

## 什么时候用哪一种

如果你只是想探索文章封面，内置生图最快。如果你要为站点批量生成几十张固定规格图片，Image API 更适合。如果你要做一个可持续迭代的图片编辑产品，Responses API 更自然。如果你只是需要准确流程图、表格或小字说明，最好不要交给生图模型，而应该用 SVG、HTML、Mermaid 或 Markdown 表格。

这条判断很重要。GPT-image-2 的文字渲染已经进步，但官方文档仍提示它可能在精确文字、结构化排版、位置控制和一致性上出现限制。因此，本文封面使用图片生成，正文里的准确流程图使用 SVG。

## API 最小样例

Image API 生成图片的 Python 形态大致如下：

```python
from openai import OpenAI
import base64

client = OpenAI()

result = client.images.generate(
    model="gpt-image-2",
    prompt="A clean editorial cover image for an AI engineering handbook.",
    size="1536x1024",
    quality="medium",
)

image_base64 = result.data[0].b64_json
with open("cover.png", "wb") as f:
    f.write(base64.b64decode(image_base64))
```

Responses API 则把图片生成作为工具：

```python
from openai import OpenAI
import base64

client = OpenAI()

response = client.responses.create(
    model="gpt-5.5",
    input="Generate an editorial cover for an AI image production workflow.",
    tools=[{"type": "image_generation"}],
)

image_data = [
    output.result
    for output in response.output
    if output.type == "image_generation_call"
]

if image_data:
    with open("workflow-cover.png", "wb") as f:
        f.write(base64.b64decode(image_data[0]))
```

写进生产脚本时，不要只保存最终图片。还应保存 prompt、尺寸、质量、输入图、生成时间、请求 ID、成本估算和人工验收结论。

## 成本怎样估算

截至 2026-05-11，OpenAI 图片生成文档中的成本计算强调三部分：输入文字 token、编辑/参考图时的输入图片 token、图片输出 token。`gpt-image-2` 对编辑和参考图输入会以高保真处理，因此带参考图的请求可能比纯文字生成更贵。

官方文档给出的示例价格显示，`gpt-image-2` 在 `1024x1024` 下大致为：low 约 `$0.006`，medium 约 `$0.053`，high 约 `$0.211`。`1024x1536` 和 `1536x1024` 的示例价格分别约为 low `$0.005`、medium `$0.041`、high `$0.165`。这些数字应按官方页面复核，因为模型价格和计算方式可能调整。

如果每天生成 10 张 `1024x1024` 图片，粗略输出成本是：

| 质量 | 单张示例价 | 10 张/天 | 30 天 |
| --- | ---: | ---: | ---: |
| low | `$0.006` | `$0.06` | `$1.80` |
| medium | `$0.053` | `$0.53` | `$15.90` |
| high | `$0.211` | `$2.11` | `$63.30` |

这还没有计入参考图输入成本、税费、失败重试和多版本筛选。真实预算最好乘以一个重试系数，例如 `1.5x-3x`。

## 透明背景和文字要特别小心

截至本文核验日，OpenAI 文档明确说明 `gpt-image-2` 不支持 `background: "transparent"`。如果你需要透明素材，可以选择支持透明背景的其他模型路径，或先生成纯色背景再用本地后处理抠图。对于头发、玻璃、烟雾、半透明材质，这种后处理会很不稳定。

文字也类似。短标题、标签、UI 小字、表格说明都不适合交给生图模型直接渲染。更可靠的做法是：图片只负责视觉主体，文字由网页、SVG、设计工具或后期排版添加。

## Prompt 模板

一个工程化图片 brief 可以这样写：

```text
用途：工程实践文章封面，16:9。
主题：AI 工具生产线，从 brief、输入、生成、审查到发布。
画面：真实工作台 + 数字流程面板，不包含可读文字。
风格：现代技术编辑感，克制、清晰、适合知识网站。
色彩：graphite、off-white、teal、amber。
禁止：品牌 logo、可读文字、人物、夸张赛博风、纯抽象渐变。
验收：移动端裁切后仍能看出主题；不出现乱码文字；不喧宾夺主。
```

这比“帮我画一张 AI 图片”稳定得多，因为它把用途、构图、禁用项和验收标准都交代清楚。

## 分层模型：从创意到可发布资产

把 GPT-image-2 放进工程实践时，至少要分成五层。

第一层是 brief。它回答图片为什么存在：封面、正文插图、产品素材、社交图、角色设定、风格探索还是用户上传图片的再编辑。不同用途的验收标准完全不同。封面图只要能帮助读者进入主题；产品图需要忠实表达物体；角色设定要考虑一致性；UI 插图则要避免虚构真实功能。

第二层是输入。输入不只是 prompt，还包括参考图、品牌约束、尺寸、质量、禁用项、目标平台、是否需要后期文字、是否会被裁切。OpenAI 文档说明，`gpt-image-2` 的图像输入会以高保真处理，编辑和参考图工作流可能带来更高输入 token 成本。因此，参考图不是“免费增强”，而是成本和版权边界的一部分。

第三层是生成。这里要决定使用 ChatGPT / Codex 内置能力、Image API 还是 Responses API。内置能力适合探索；Image API 适合脚本化生成和编辑；Responses API 适合多轮上下文和可对话产品。不要把“我能生成一张图”误认为“我能维护一条图片生产线”。

第四层是审查。审查包括主题一致性、是否有乱码文字、是否出现不该出现的品牌、人物、真实机构、危险符号、误导性 UI、隐含版权风险、移动端裁切、文件大小、alt text。知识站点尤其要注意：概念插图不能被读者误解为真实架构图。

第五层是发布和回放。发布不是把 PNG 放进 `public/` 就结束。还应保留 prompt、生成日期、模型、尺寸、质量、来源、人工 QA 结论和重新生成条件。以后如果模型行为、价格或审美方向变化，团队可以知道这张图为什么存在、怎样复刻、怎样替换。

## 实战路径：本站专题封面的生产线

以本专题为例，比较稳的路径是：

1. 先冻结文章主题，不在主题还摇摆时生成封面。
2. 为每篇文章写一段独立视觉 brief，包含用途、构图、色彩、禁用项。
3. 封面用 GPT-image-2 生成，正文精确图表用 SVG 手工控制。
4. 生成后把原始图片保存在生成目录，复制一份到站点 `public/images/engineering/practice/`。
5. 用页面截图检查封面是否在桌面和移动端都可读。
6. 构建时确认图片路径进入对应页面。

这个流程的关键取舍是：**封面交给生成模型，精确表达交给可控图表。** 这不是保守，而是职责分离。生成模型擅长气氛、隐喻、材质和视觉吸引力；SVG 擅长流程、标签、顺序、参数和结构。把两者混用，读者既能获得图像带来的阅读节奏，又不会被不准确的文字和图形误导。

如果要批量化，可以把每次生成记录成一个小 manifest：

```json
{
  "slug": "gpt-image-2-practical-guide",
  "model": "gpt-image-2",
  "use": "cover",
  "size": "16:9 editorial cover",
  "quality": "medium",
  "prompt_version": "2026-05-11-a",
  "source_image": null,
  "qa": {
    "desktop": "pass",
    "mobile_crop": "pass",
    "text_artifacts": "none observed",
    "needs_compression": "review before publish"
  }
}
```

manifest 不必暴露给读者，但它能让内容资产进入工程管理，而不是散落在聊天记录里。

## 当前可观察状态与复核路径

截至 2026-05-11，官方文档可观察到的关键点包括：

- Image API 支持使用 `gpt-image-2` 进行生成和编辑。
- Responses API 可以通过 `image_generation` 工具在多轮流程里生成或编辑图片。
- `gpt-image-2` 支持多种尺寸、质量、格式和压缩选项，但尺寸仍有边长、像素量和比例约束。
- `gpt-image-2` 不支持透明背景请求。
- 复杂 prompt 可能带来较长延迟，文档提示复杂请求可能达到分钟级。
- 模型仍可能在精确文字、构图位置和跨多次生成的一致性上失误。
- 成本需要同时考虑输入文本、输入图片和图片输出 token。

复核时不要只看本文。建议按这个顺序查：

1. 打开 OpenAI Image generation guide，确认模型、接口、尺寸、透明背景和限制。
2. 打开 pricing 的 image generation 区域，确认当前 token 价格或示例价格。
3. 如果使用 Responses API，再查 Responses tools 文档，确认 `image_generation` 工具参数。
4. 用一个低成本 prompt 跑最小样例，保存请求 ID、输出和成本估算。
5. 如果要上线批量流程，再用真实尺寸、真实质量、真实参考图做一次预算演练。

变化快的信息只写“截至某日可观察到”，不要写成“永远支持”或“固定价格”。价格、模型、参数和速率限制都是容易过期的层。

## 反例陷阱：看起来省事，最后更贵

第一个陷阱是把所有图都交给生成模型。流程图、价格表、API 差异、参数矩阵、步骤说明，最好不要由生成模型直接画。它们需要精确、可改、可翻译、可审查。用 SVG、Markdown 表格或真实 UI 截图更稳。

第二个陷阱是只算成功图片成本。真实工作流里，通常会生成多个候选、重试失败、改 prompt、换质量、换尺寸，还可能因为移动端裁切不理想而重生。预算只按“最终张数 × 单价”会偏乐观。

第三个陷阱是没有记录 prompt。图片看起来满意时，人很容易忘记记录生成条件。等以后要换风格、补同系列图、做日文版卡片时，无法复刻。

第四个陷阱是把图片当证据。生成图片只能表达概念，不能证明产品能力。比如把“AI 搜索证据链”画成很漂亮的仪表盘，不代表真实系统已经具备这些面板。读者需要从正文、来源和代码里获得证据。

第五个陷阱是忽略组织验证和权限。官方文档提醒，使用 GPT Image 模型可能需要完成 API Organization Verification。团队在做自动化前，应先确认账号、组织、地区、数据策略和内容审核要求，而不是等脚本上线后才发现请求不可用。

## 发布前 QA

图片不是生成出来就能发布。至少检查：

- 主题是否和文章一致？
- 是否出现品牌、人物、可读乱码或不应出现的对象？
- 移动端裁切是否还可读？
- 文件大小是否需要压缩？
- 是否记录了 prompt 和来源？
- 是否需要替代文本？
- 是否可能误导读者，把概念图画成事实架构图？

对于知识文章，图像的职责是帮助阅读，不是证明事实。凡是需要精确表达流程、参数、价格和 API 差异的地方，仍应使用文字、表格或可控图表。

## 查缺补漏清单

- 是否区分内置生图、Image API 和 Responses API？
- 是否为每次生成记录 prompt、尺寸、质量和验收结论？
- 是否把复杂文字和精确流程交给可控图表？
- 是否按最新官方文档复核价格和限制？
- 是否把参考图输入成本纳入预算？
- 是否确认透明背景需求不能直接假设由 `gpt-image-2` 满足？
- 是否为失败重试留出预算？

## 延伸阅读

- [AI 工程实践地图](./ai-engineering-practice-map/)
- [AI 图像生成是什么](../../academy/openai-academy/02-using-chatgpt/tools/image-creation/)
- [Codex、Claude Code、Gemini CLI：不要比谁聪明，要比工作流](./agent-cli-workflow-comparison/)
