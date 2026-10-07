# 2026-10 框架与雷达工作流升级

规则入口统一为根目录 `AGENTS.md`；`CLAUDE.md` 导入同一文件，雷达任务通过薄 skill 按需读取 `docs/agents/`。模型、来源、栏目与历史案例分别维护，既有来源核验、双语事实清单、恢复与暂停约束继续生效。

## 版本与兼容性

| 组件 | 原版本 | 本次版本 |
| --- | --- | --- |
| Astro | 5.18.1 | 7.3.6 |
| TypeScript | 5.9.3 | 6.0.3 |
| Tailwind CSS | 4.2.4 | 4.3.3 |
| PDF.js | 5.7.284 | 6.4.299 |
| Pagefind integration | 1.8.6 | 2.0.1 |
| Vitest | 4.1.5 | 5.0.3 |
| Playwright | 1.59.1 | 1.63.0 |
| Biome | 2.4.14 | 2.5.15 |
| notebooklm-py | 0.8.3 | 0.8.4 |

其余直接依赖与锁文件一并更新。使用 Node.js 24 LTS，`.nvmrc` 与 CI 保持同一版本线；本机全局 Node/npm 不由仓库升级修改。TypeScript 暂留 6.x，因为当前 `@astrojs/check` 的 peerDependencies 尚不接受 7.x。

- 按 [Astro 6](https://docs.astro.build/en/guides/upgrade-to/v6/) 与 [Astro 7](https://docs.astro.build/en/guides/upgrade-to/v7/) 迁移：schema 使用 `astro/zod` 与 `z.url()`；显式保留 unified Markdown 插件及 HTML 空白规则，确保 Pages 子路径与图片 alt 逻辑继续工作。
- PDF.js 6 使用 `getDocument({ url })`，保留动态加载 worker；浏览器测试实际加载并渲染远端 PDF。
- TypeScript 路径别名使用相对路径；临时脚本、缓存和虚拟环境不进入网站类型检查。Biome 配置通过官方 migrate 更新。
- `@tailwindcss/typography` 仍固定使用有已知告警的旧解析器，暂用范围受限的 override 升到 `postcss-selector-parser@7.1.6`，处理 [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)。构建、页面和视觉基线验证其实际兼容性；上游修复依赖后移除此 override。
- NotebookLM 按 [PyPI 0.8.4](https://pypi.org/project/notebooklm-py/0.8.4/) 升级现有 `.venv`，版本入口为 `requirements-notebooklm.txt`。同步安装器提供的 agent skill；只读验证登录和现有 CLI 参数，不因升级重复生成资产。
- CI Actions 更新至核对过的稳定 tag：checkout 7.0.1、setup-node 7.0.0、cache 6.1.0、upload-pages-artifact 5.0.0、deploy-pages 5.0.1、lighthouse-ci-action 12.6.2；使用 GitHub 托管 runner 的 Node 24 运行时。

## 发布边界与检查

音频 / PDF 原件被 `.gitignore` 排除；即使 `git add -f`，pre-commit 仍检查整个索引并拒绝重媒体。非草稿 frontmatter 只接受配置允许的 HTTPS 媒体路径，音频必须填写实际字节数。pre-commit 读取暂存文件与暂存配置；pre-push 读取 Git 提供的待推送提交快照。

`npm run check:radar` 聚合 Newsletter、来源、schema、去重、媒体和编辑检查。CI 的 quality job 在 PR 与发布前执行该聚合检查及单元测试；构建后的 smoke check 继续验证最新页面、sitemap 与 feed。公开文案 / 栏目机械检查从 2026-10-07 生效，合法例外必须精确到文件、规则和理由；隐私与硬上限不得豁免。栏目内来源多样性及证据质量仍需要人工审阅。

静态检查不证明远端对象可用。本期发布前另运行 `check/radar-media.mjs --file ... --verify-remote`，验证状态、类型和字节数。临时 R2 开发主机仅按既有批准精确放行，`audit:r2-public-urls` 的迁移提醒保持生效；本次没有配置自定义域名、归档历史资产或改写 Git 历史。

## 验证与回退

本次本地验证涵盖类型、单元、六项雷达门槛、Pages 子路径构建、RSS / sitemap smoke、双语标签、桌面 / 手机交互及已有视觉基线。重点包括 Pagefind 搜索、音频播放器、图片和 PDF 预览。远端 GitHub Actions 与 Pages 部署须在获准推送后单独验证，不能把本地通过写成线上发布成功。

仓库升级通过 `package.json` 与 `package-lock.json` 一起回退，再执行 `npm ci`；不要只降某一个主依赖。需要回退 NotebookLM 时，将版本固定为已验证旧版并在现有 `.venv` 重新安装，随后同步其配套 skill。规则和脚本按本次差异分别撤销，保留用户原有未提交文章和图片。
