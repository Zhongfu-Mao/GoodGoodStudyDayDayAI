import { describe, expect, it } from 'vitest';
import { inferInfographicPrompt } from '../../scripts/radar/generate-infographic.mjs';

describe('NotebookLM radar infographic prompt contract', () => {
  it('uses detailed-mode language that asks for dense but readable Chinese radar maps', async () => {
    const prompt = inferInfographicPrompt('AI 雷达日报：2026-06-08', 'zh', 'daily');

    expect(prompt).toContain('高密度但可读');
    expect(prompt).toContain('每个节点包含一个短标签和一个极短事实');
    expect(prompt).toContain('保留关键模型名、公司名、repo 名和数字');
    expect(prompt).toContain('不要退回成只有栏目名的装饰封面');
  });

  it('keeps Japanese detailed-mode prompts readable and downgrade-aware', async () => {
    const prompt = inferInfographicPrompt('AIレーダー日報：2026-06-08', 'ja', 'daily');

    expect(prompt).toContain('高密度だが読みやすい');
    expect(prompt).toContain('各ノードに短いラベルとごく短い事実を 1 つ');
    expect(prompt).toContain('読めない疑似文字');
    expect(prompt).toContain('必要なら standard で再生成');
  });
});
