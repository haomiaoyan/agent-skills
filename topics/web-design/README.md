# 网页设计

**说明**：网页 / 落地页 / 长滚动叙事站的构建、动效、响应式与可交付验收。

## 已收录（2 个）

| 技能 | 所在阶段 | 为什么归到这里 |
|---|---|---|
| [`visual-narrative-site`](../../skills/delivery/visual-narrative-site/) | [实施与交付](../../skills/delivery/README.md) | 多章节长滚动单页的完整交付流程：GSAP 长舞台（pin `'top 68px'`、行程 ×3.5、三层结构）、canvas/WebGL 双主题首屏、SVG 曲线随滚动描画、reduced-motion 降级、分批部署 |
| [`web-acceptance-harness`](../../skills/verification/web-acceptance-harness/) | [验收与验证](../../skills/verification/README.md) | 网页交付的验收证据：横向溢出、WCAG 对比度、帧率、动画在动/该停、双主题切换、触摸与 reduced-motion 的隔离断言 |

两者是配套的：前者第 2 阶段要求「验收标准必须脚本能判定」，落地靠后者；前者第 6 阶段要求「写进文档的数字必须是实测值」，测量口径也在后者。

## 这个组合覆盖了什么

- 立项提问 → 计划审核 → 实测校正 → 分批实施（七阶段）
- 13 种运行时测量技术、22 条实测坑（含 `setViewport` 竞态、StrictMode 下 `loseContext` 白块、markdown 围栏污染 CSS）
- 长舞台三层结构模板、双主题 tokens、验收脚本骨架（都在 `assets/`）
- 断言必须能失败的纪律：写完一条断言故意改坏代码确认它 FAIL

## 与 UI 设计的边界

| | [UI 设计](../ui-design/README.md) | 网页设计（本类） |
|---|---|---|
| 关心 | 组件、tokens、配色、视觉层级 | 页面结构、滚动叙事、动效编排、可验收性 |
| 产出 | 视觉规范与组件 | 可部署的网页 + 验收证据 |

`visual-narrative-site` 同时属于两者，因为它既有 tokens/卡片视觉规范，也有长滚动站的完整实现流程。

## 本地有、但本仓库未收录的相关能力

| 技能 | 侧重 | 署名 |
|---|---|---|
| `frontend-design` | 落地页/营销站的视觉方向 | zxh |
| `design-taste-frontend` | 反「AI 味」视觉方向库 | 未标注 |
| `hallmark` | 新建页面的设计判断 | 未标注 |
| `threeui` | 103 个 Three.js / WebGL 视觉特效组件 | 未标注 |
| `ui-styling` | shadcn/ui + Tailwind | claudekit / MIT |
| `oil-ui` / `oil-ui-pro` | 多风格同屏对比与截图打磨 | 未标注 |

未收录原因同上：第三方或来源未标注，按[版权分界规则](../../docs/structure.md)不并入自有目录。

## 按主题安装

```bash
node scripts/install.mjs --topic web-design
```
