import { ArrowUpRight, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function DesertGoldArticleCard() {
  return (
    <Card className="relative overflow-hidden border-stone-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,250,249,0.98))] shadow-[0_24px_60px_rgba(24,24,27,0.08)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,170,93,0.14),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(122,93,54,0.06),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

      <CardHeader className="relative gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/60 bg-amber-100/80 text-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-stone-500">shadcn/ui Study</p>
              <p className="mt-1 text-sm text-stone-600">Desert Gold Accent</p>
            </div>
          </div>

          <Badge variant="desert">Featured Draft</Badge>
        </div>

        <CardTitle className="max-w-xl text-3xl leading-[1.05]">
          用“沙漠金”做一张更有温度的文章卡片，而不是继续堆冷白和荧光蓝。
        </CardTitle>
        <CardDescription className="max-w-2xl text-[15px] leading-7 text-stone-600">
          这张卡片用 shadcn/ui 的组件结构搭起来，把重点放在纸面质感、暖金色强调和更克制的内容层次上，适合做首页精选文章或专题入口。
        </CardDescription>
      </CardHeader>

      <CardContent className="relative grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.25rem] border border-stone-200/90 bg-stone-50/90 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Why It Works</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-700">
            <li>用暖灰底和米白面板替代大片纯白，眼睛会轻松很多。</li>
            <li>强调色只集中在徽标、分割线和状态标签上，不会满屏抢戏。</li>
            <li>标题和说明保留呼吸感，读起来更像编辑站而不是后台卡片。</li>
          </ul>
        </div>

        <div className="rounded-[1.25rem] border border-amber-300/50 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(250,244,232,0.98))] p-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Tokens</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">Stone Paper</Badge>
            <Badge variant="desert">Desert Gold</Badge>
            <Badge variant="outline">Editorial Serif</Badge>
          </div>
          <p className="mt-5 text-sm leading-7 text-stone-700">
            如果后面你愿意，我们可以继续把这套 token 扩成一整套浅色主题，让首页、标签页和文章页都沿着同一个方向走。
          </p>
        </div>
      </CardContent>

      <CardFooter className="relative justify-between gap-4 border-t border-stone-300/70 pt-5 text-sm text-stone-600">
        <span>Preview component for Astro + shadcn/ui</span>
        <span className="inline-flex items-center gap-2 font-medium text-stone-900">
          Read concept
          <ArrowUpRight className="h-4 w-4 text-amber-800" />
        </span>
      </CardFooter>
    </Card>
  );
}
