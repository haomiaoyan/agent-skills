# AI 视频

**说明**：视频生成、录屏取证、动效序列、实况照片与视频转卡片。

## 当前收录：0 个

如实记录，不是遗漏。本仓库来自 NEUROATLAS（神经信号科普可视化站）实战，那次交付是静态单页 + CSS/Canvas 动效，**没有视频生成、没有录屏取证、没有实况照片**，因此这类目下没有任何可提炼的实测经验。

`catalog.json` 里是 `"skills": []`。保留空类目作为以后的落点。

## 本地已有的相关能力（未收录）

| 技能 | 侧重 | 署名 |
|---|---|---|
| `guizang-social-card-skill` | Live Photo 动效卡片、单视频实况拼图、二/三/四宫格、长视频转 Live Photo | 未标注 |
| `pptx` / `pptx-generator` / `slides` / `guizang-ppt-skill` | 演示文稿与翻页动效（严格说是演示而非视频） | 部分 MIT / 部分未标注 |
| `browser-use` | 浏览器交互自动化（可用于录屏取证，但本身不是视频技能） | 未标注 |

还有运行时工具层面的录屏能力（例如 `oil_ui_shoot` 的 `record` / `frames` / `motion` 模式），属于工具而非 skill，不归本仓库管理。

## 与 `web-acceptance-harness` 的一点边界

[验收与验证](../../skills/verification/README.md) 里的 `web-acceptance-harness` 会做**动效判定**（`canvas.toDataURL()` 双采样判断「在动」与「该停时停了」、rAF 帧率中位数），但那是**验收断言**，不是视频生成或录制，所以没有归到本主题。

## 为什么没有直接收进来

与 [AI 绘图](../ai-image/README.md) 相同的三条：版权归属（多数第三方或未标注）、体积、以及本仓库当前的「Web 交付方法论」定位。`guizang-social-card-skill` 是这一类里最贴近的，但来源未标注，不能直接公开分发。

## 怎么补这一类

1. 收录已确认许可的第三方技能 → 放 `third-party/` 保留原 LICENSE → 在 [`catalog.json`](../catalog.json) 的 `ai-video.skills` 里加名字
2. 自己写一份：等有真实项目用到视频/实况照片后，把提示词、参数、实测坑整理成 skill，按阶段放进 `skills/delivery/` 或 `skills/verification/`，再挂到本主题
3. 保持空类目：不写没有实测支撑的空壳

改完跑 `node scripts/install.mjs --validate`。

## 按主题安装

当前无技能可装：

```bash
node scripts/install.mjs --topic ai-video
# 提示：主题 ai-video 当前没有收录任何技能
```
