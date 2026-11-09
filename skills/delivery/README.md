# 实施与交付（delivery）

**用在规格确定之后、验收之前**：把一个明确的需求实现成可交付的网站，并且每一批都能独立部署、可回滚。

## 本类技能

| 技能 | 形态 | 作用 |
|---|---|---|
| [`visual-narrative-site/`](visual-narrative-site/) | 实体（多文件：SKILL.md + 4 references + 4 assets） | 多章节长滚动 / 交互可视化网站的交付流程：立项提问 → 出计划 → 等确认 → 独立审核 → 自核实 → 实测校正 → 分批实施。含 22 条实测坑、13 种运行时测量配方、长舞台三层结构、双主题 tokens、验收脚本骨架 |

## 里面有什么

```
visual-narrative-site/
├── SKILL.md                      七阶段流程 + 11 问清单 + 审核 prompt 模板 + 三段落汇报格式
├── references/
│   ├── verify-recipes.md         13 种运行时测量技术 + 坐标/管线陷阱
│   ├── pitfalls.md               22 条坑（现象→根因→修复→通用规则）
│   ├── animation-components.md   第三方 canvas 组件集成套路
│   └── content-sourcing.md       数字必须有出处或标教学示意
└── assets/
    ├── long-stage.tsx / .css     长舞台 GSAP 驱动 + 三层结构
    ├── tokens.css                双主题 tokens
    └── verify-skeleton.mjs.md    验收脚本骨架
```

## 什么时候用这一类

- 多章节长滚动、首屏 canvas/WebGL、固定导航下的长舞台横向滚动
- 深浅双主题、reduced-motion 降级、科普/医学数据需要出处
- 交付要求「可脚本判定」而不是「看着差不多」

单页静态展示、没有滚动叙事、没有运行时动画的项目，这个技能的大部分内容用不上。

## 触发即读

SKILL.md 里给了映射：要接第三方动画组件读 `animation-components.md`；页面有具体数字或科学结论读 `content-sourcing.md`；其余按七阶段顺序读。

## 与其它分类的衔接

```
planning/  →  delivery/  →  verification/
（决策与规格）  （实施与交付）  （验收证据）
```

本技能第 2 阶段要求「验收标准必须脚本能判定」，第 6 阶段要求「写进文档的数字必须是实测值」——这两条都依赖 `verification/` 的测量口径。若只是想修一个验收脚本、并不做可视化网站，直接用 `verification/web-acceptance-harness` 更合适。
