# UI 设计

**说明**：界面视觉、组件规范、设计 tokens、排版与配色、反模板化审美。

## 已收录（1 个）

| 技能 | 所在阶段 | 为什么归到这里 |
|---|---|---|
| [`visual-narrative-site`](../../skills/delivery/visual-narrative-site/) | [实施与交付](../../skills/delivery/README.md) | 含双主题 tokens 模板（`assets/tokens.css`）、卡片发光/blur 组、渐变描边两层元素法、`mix-blend-mode` 随主题切换的实测规则；`references/pitfalls.md` 里 22 条坑有一半是布局与视觉问题 |

## 这个技能能给的 UI 能力

- 双主题 tokens：`--glow-blend` 浅色 multiply / 深色 screen、数据编码色独立于主题（Okabe-Ito 色板）
- 渐变描边：两层元素法，明确禁用 `mask-composite`（整卡变黑）与 `border-image`（丢圆角）
- 卡片交互：hover 上浮 `translateY(-4px)`、邻居卡 `blur(3px) saturate(.9) opacity .55`，全部走合成器路径
- 对比度与溢出：WCAG ≥4.5（两主题各算）、`scrollWidth ≤ clientWidth + 1` 多视口判定
- 反模板化：视觉判据写成阈值，不写「观感好」这类形容词

## 本地有、但本仓库未收录的相关能力

这些技能在 `~/.agents/skills`、`~/.workbuddy/skills` 等目录里，属于第三方或来源未标注，按[版权分界规则](../../docs/structure.md)没有并入本仓库：

| 技能 | 侧重 | 署名 |
|---|---|---|
| `design-taste-frontend` | 反「AI 味」的视觉方向库（247 个获奖网站） | 未标注 |
| `impeccable` | UX 评审、层级、排版、色彩、动效 | 未标注 |
| `ui-ux-pro-max` | 79 种风格、192 套配色、74 组字体搭配 | 未标注 |
| `ui-styling` | shadcn/ui + Tailwind 组件规范 | claudekit / MIT |
| `design-system` | 三层 token 架构、组件规格 | claudekit / MIT |
| `design` / `brand` | 综合设计与品牌识别 | claudekit / MIT |
| `hallmark` / `frontend-design` | 新建页面的设计判断 | 未标注 |

这些是更纯粹的 UI 设计技能；`visual-narrative-site` 是**交付流程**，UI 只是其中一部分。

## 想补齐这一类

把上面某个第三方技能收进来时：确认许可 → 放 `third-party/<vendor>/` 并保留原 LICENSE → 在 [`catalog.json`](../catalog.json) 的 `ui-design.skills` 里加名字 → 跑 `node scripts/install.mjs --validate`。

## 按主题安装

```bash
node scripts/install.mjs --topic ui-design
```
