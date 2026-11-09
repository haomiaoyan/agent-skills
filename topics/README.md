# 主题索引（第二维度）

本仓库有**两套并行的分类维度**：

| 维度 | 位置 | 作用 |
|---|---|---|
| 按阶段（主） | `skills/planning/`、`skills/delivery/`、`skills/verification/` | 物理归档，决定技能放在哪个文件夹 |
| 按主题（次） | `topics/` 本目录 | 逻辑标签，决定「按领域找技能」时怎么筛 |

**为什么主题不做成物理文件夹**：文件系统是树，一个技能目录无法同时位于 `delivery/` 和 `web-design/`。硬要做只能复制一份或建软链接，前者产生两份会不同步的副本，后者在 Windows/Git 上行为不一致。所以主题用索引实现，技能本体保持单份。

## 主题一览

| 主题 | 说明 | 已收录 | 索引文件 |
|---|---|---|---|
| [UI 设计](ui-design/README.md) | 界面视觉、组件规范、设计 tokens、配色排版、反模板化 | 1 | [`ui-design/`](ui-design/README.md) |
| [网页设计](web-design/README.md) | 网页/落地页/长滚动站构建、动效、响应式、验收 | 2 | [`web-design/`](web-design/README.md) |
| [AI 绘图](ai-image/README.md) | 文生图、图生图、社媒配图、素材检索 | 0 | [`ai-image/`](ai-image/README.md) |
| [AI 视频](ai-video/README.md) | 视频生成、录屏取证、动效序列、实况照片 | 0 | [`ai-video/`](ai-video/README.md) |
| [工程流程](workflow/README.md) | 立项提问、计划/SDS 审核、验证纪律、交付闸门 | 5 | [`workflow/`](workflow/README.md) |

**AI 绘图与 AI 视频目前是 0 个技能**，这是如实记录，不是遗漏。本仓库是从 NEUROATLAS 项目的方法论整理出来的，那次实战没有用到图像/视频生成能力。两份 README 里写清了本地已有的相关能力、为什么没有收录、以及以后怎么补。

## 映射数据源

[`catalog.json`](catalog.json) 是唯一数据源，安装器的 `--topic` 筛选和 `--validate` 的一致性检查都读它。加主题或改归属只改这一个文件，各 README 是给人看的说明。

```json
{
  "topics": [
    { "slug": "ui-design", "skills": ["visual-narrative-site"] },
    { "slug": "ai-image",  "skills": [] }
  ]
}
```

约束：

- `slug` 必须与 `topics/<slug>/` 目录名一致
- `skills` 里的名字必须能在阶段目录或 `third-party/` 下找到（由 `--validate` 检查，写错会报错）
- 一个技能可以出现在多个主题里（例如 `visual-narrative-site` 同时属于 UI 设计与网页设计）
- `skills: []` 合法，表示该类目当前为空

## 按主题安装

```bash
node scripts/install.mjs --topic web-design      # 装该主题下全部技能
node scripts/install.mjs --topic ui-design,workflow
node scripts/install.mjs --list-topics            # 列出主题与命中数
```

`--topic` 与 `--only` 可叠加使用（取交集），例如 `--topic workflow --only plan-sds-review`。

## 与阶段分类的关系

```
                  ┌─ planning/     plan-sds-review, plan-me
物理（阶段）──────┼─ delivery/     visual-narrative-site
                  └─ verification/ web-acceptance-harness

逻辑（主题）──────┬─ ui-design    → visual-narrative-site
                  ├─ web-design   → visual-narrative-site, web-acceptance-harness
                  ├─ workflow     → plan-sds-review, plan-me, grilling, grill-me, web-acceptance-harness
                  ├─ ai-image     → （空）
                  └─ ai-video     → （空）
```

两个维度不冲突：阶段回答「什么时候用」，主题回答「属于哪个领域」。
