# 雷达候选资产与分层验收

生成完成不等于验收通过。`radar:infographic` 与 `radar:audio` 现在默认只创建私有候选，不直接改 `public/`、正文媒体引用或 draft。既有已验收资产无需导入或重新生成；已有封面的跳过逻辑不变。周／月独立资产编排脚本不因本改动自动改变后端或重生。

## 1. 明确审的是哪个版本

每次生成的候选有唯一 attempt ID，保存于忽略的 `.cache/radar-review/candidates/`。`candidate.json` 绑定日期、语言、类型、后端、正文指纹、原件与发布副本的 SHA256、私有 notebook/source/artifact ID。原件不参与覆盖式压缩；图像保留真实格式原件，音频保留原始 m4a。NotebookLM 成功清理策略不变，不靠长期堆积笔记本保留证据。

图片候选另附完整图、`region-*.png`、`regions.json` 和 `expected.json`。分区由版式网格近似切分，不是自动识别结果；边界切到文字或版式不符合预期时，看完整图并补局部放大，不能把分区数当覆盖证明。分区不缩小原始字形；压缩副本也须复看。

内置 imagegen 的结果可离线导入同一流程：

```sh
npm run radar:review -- prepare --file REPORT.md --asset IMAGE.png --backend imagegen
```

这不会生成新图，也不会赋予 imagegen 返工授权。原图、内部 ID、绝对路径、转写及审阅记录不进入公开配图清单或 Git。

## 2. 分层审查，不用输入校验替代输出验收

打开候选的 `review.json`，填写 reviewer 和实际看到／核验到的证据，不能用脚本批量填 pass：

1. **覆盖**：逐条核对编号、实际标题与栏目位置。六个面板不等于十二条完整；每条填写 `visibleText`，缺项用 fail，拿不准用 uncertain。
2. **文字**：先读实际像素，不用预期文案补字；完整图与每个原尺寸分区都看过后，按源顺序填写 `viewedSections`。`legibility` 写 pass/fail/uncertain 及区域证据。疑似18／10先局部复核，不直接宣布数字错误。无伤大意的小字形瑕疵不要求完美重生。
3. **事实**：`facts` 单独核对已展示的主体—数字—单位—比较条件，以及否定、开放范围、箭头方向。不要求把完整事实层每个数字都印到图上。严重乱码、确实漏项和实质反转不放宽。

`expected.json` 仅供覆盖／事实对照。OCR／模型抽取即使可用也只是证据线索，不自动裁决；本流程不新增 OCR 或多模型投票。

```sh
npm run radar:review -- check --candidate CANDIDATE/candidate.json
```

未完成返回 `needs_review`，有明确失败返回 `rejected`（两者 exit2），全部通过才返回 `accepted`。这些状态都**不会自动发起重生**。每项结论绑定 candidate ID、语言、正文指纹及确切发布文件哈希；文件变了不能复用旧结论。

## 3. 音频：只升级实质疑点

音频内容标准 v2（2026-10-22 用户明确批准）：完整性必检，只拦会改变意思的实质问题。主审按风险做最小必要检查，不要求每期全文 ASR、逐字比对或无差别原音听辨；缓存没有转写也不等于必须新跑转写。优先核对对应来源与疑点前后文，注意主持人是否已澄清、是否只是条件性例子或风险比喻。发布权限、外发许可和生成重试权限不因本标准改变。

保留双主持人/default 和原始音频。候选自动检查完整解码、结尾解码、原件与转码时长差≤1秒及单声道44100Hz MP3；同字节的解码结果可缓存，但每次仍检查当前原件的时长差。

`review.json` 的 `semantic` 是主审按比例做的内容审查，须写实际依据，不冒称人工听辨。`issues` 分类如下：

- `transcription_uncertain`：ASR 专名、断句、计数格式等疑点，单独记录，不自动阻塞／重生。
- `rhetorical_exaggeration`：非实质误导的比喻、措辞过满不重生。
- `factual_error`：疑似实质错误先保留待复核。确认为 `confirmed_error` 需要 `proposition`、`timeRange: [开始秒,结束秒]`、`sourceEvidence`，以及 `basis: native_audio_model` 或 `human_listening`；`asr_only` 不构成确认。模型复核不等于人工听辨或绝对证明。确认后拒绝该候选，但仍须遵守已有重试授权。
- 已澄清或用户接受的事实问题，用 `resolution: resolved`／`user_accepted` 并填写 `resolutionEvidence`，不悄悄抹去问题。
- 复审原疑点后，若来源与前后文表明其不改变实际含义，可保留原问题记录，设 `resolution: not_material`，写清具体上下文和非实质理由。此决定不声称听过原音，也不等于用户接受了一个已证实错误。未能排除关键数值、主体归属、机制或否定反转的疑点仍准确待核；不能因“未证实错误”就一律放行，也不能把转写疑点一律叫作音频事实错误。

审查写入 `audioRulesVersion: 2`；只更新语义验收缓存版本，原件、技术检查缓存和已有转写继续复用。旧语义结论须按新尺度重新审视已有文件，不触发重生。先查看音频缓存；已有可用转写时不再跑全文 ASR：

```sh
npm run radar:review -- audio-cache --candidate CANDIDATE/candidate.json --engine 'ASR模型/版本/语言/配置'
# transcriptAvailable 只说明缓存情况，不是转写任务或发布门槛。
# 仅当本次最小必要检查确需转写且缓存不可用时，才用现有工具并导入非空文本。
npm run radar:review -- audio-cache --candidate CANDIDATE/candidate.json --engine 'ASR模型/版本/语言/配置' --transcript TRANSCRIPT.txt
# 主审已经通过的语义审查可缓存，复用时还需相同正文与规则版本。
npm run radar:review -- audio-cache --candidate CANDIDATE/candidate.json --save-review
npm run radar:review -- reuse-audio-review --candidate CANDIDATE/candidate.json
```

转写按音频哈希／语言及声明的引擎配置校验；语义结论还绑定正文指纹和审查规则版本。新文件即使同名也不复用。修改审查规则时应提升缓存规则版本；缓存失效意味着重新审查已有文件，不等于重新生成。

## 4. 验收后才提升到发布路径

```sh
npm run radar:review -- promote --candidate CANDIDATE/candidate.json --file REPORT.md
# 替换现有引用或不同字节的图片，必须在用户已授权替换的范围内显式加 --replace。
```

提升时重新核对原件／发布副本哈希、正文、语言与验收证据。图片复制到对应 public 路径；音频通过现有 R2 preserve-existing/hash-versioned 上传并回填 URL／长度／大小。候选原件留在缓存；不修改 draft、不 stage、不 push。之后仍按雷达工作流执行全部发布检查和 Git 权限规则。

## 5. 内容指纹 v2 与旧清单迁移

内容指纹只包含标题、日期、语言、周期和规范化正文（不含条目配图展示块）。`audioUrl`、`coverImage`、音频长度／大小和 draft 等发布字段不使文案清单失效；正文事实变化仍失效。文件哈希是另一件事，用于辨认实际图片／音频字节。

旧 v1 文案不静默重新绑定，也不因新指纹重生已发布资产。确需继续使用未完成的旧清单时，保留原缓存 `brief.json`，执行：

```sh
npm run radar:infographic -- --file REPORT.md --brief-only --migrate-visual-copy
```

只有旧清单哈希与原缓存匹配，且全部栏目、条目、事实、日期、语言与周期不变才迁移，保留 `.legacy-v1.bak`。缺原缓存或事实不一致时停止，重新核对清单；该命令不会调用生成服务。预览与导入也不会重生已有资产。
