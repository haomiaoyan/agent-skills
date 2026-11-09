# AI 绘图

**说明**：文生图、图生图、社媒配图、素材检索与图像生成流水线。

## 当前收录：0 个

这是**如实记录，不是遗漏**。本仓库的技能是从 NEUROATLAS（神经信号科普可视化站）项目的方法论整理出来的，那次实战没有用到图像生成能力——项目里的视觉全是 CSS / Canvas / SVG 手写实现的，没有 AI 出图环节。

四类主题里只有这一类目完全为空，`catalog.json` 里写的是 `"skills": []`。空类目保留在这里，是为了以后补技能时有个明确的落点。

## 本地已有的相关能力（未收录）

| 技能 | 侧重 | 署名 / 许可 |
|---|---|---|
| `banner-design` | 横幅 / 社媒配图，22 种风格、多平台尺寸 | claudekit / MIT |
| `guizang-social-card-skill` | 小红书图文、3:4 封面、Live Photo 卡片、公众号封面 | 未标注 |
| `design` | Logo 生成（55 种风格）、CIP 样机、图标（15 种风格） | claudekit / MIT |
| `brand` | 品牌视觉识别与素材管理 | claudekit |
| `pdf-converter` / `markitdown-skill` | 图片 OCR、文档转图 | 未标注 |

还有一层是运行时自带的生图能力（`generate_image` / `edit_image` 工具，当前默认 google gemini-3.1-flash-image），那是工具而非 skill，不归本仓库管理。

## 为什么没有直接收进来

| 原因 | 说明 |
|---|---|
| 版权归属 | 大部分是第三方作品，`design`/`brand`/`banner-design` 标 claudekit，其余未标注。按[版权分界规则](../../docs/structure.md)不能放进自有 `skills/` |
| 体积 | `hallmark` 6.9 MB、`ui-styling` 5.6 MB、`design-taste-frontend` 2.4 MB，整包会显著增大仓库 |
| 主题与仓库定位不符 | 这个仓库目前是「Web 交付方法论」，AI 绘图是独立领域 |

## 怎么补这一类

三种方式，按推荐顺序：

1. **收录已确认许可的第三方技能**：例如 `banner-design`（MIT, claudekit）→ 放 `third-party/<vendor>/skills/` 并保留原 LICENSE → 在 [`catalog.json`](../catalog.json) 的 `ai-image.skills` 里加名字
2. **自己写一份**：例如「配图生成流水线」——把需求拆解、prompt 编写、多方案对比、选中后落盘与署名记录整理成 skill，放 `skills/delivery/`（实施阶段），再挂到本主题
3. **保持空类目**：等真正用到 AI 绘图的项目做完，再从那次实战里提炼，而不是先写一个没有实测支撑的空壳

无论哪种，改完跑 `node scripts/install.mjs --validate` 确认映射一致性。

## 按主题安装

当前无技能可装：

```bash
node scripts/install.mjs --topic ai-image
# 提示：主题 ai-image 当前没有收录任何技能
```
