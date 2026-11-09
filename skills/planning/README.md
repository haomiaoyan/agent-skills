# 立项与规划（planning）

**用在动手写代码之前**：把「一个模糊想法」变成「决策已确认、计划经对抗式审核、规格文档可交付」的状态。

## 本类技能

| 技能 | 形态 | 作用 |
|---|---|---|
| [`plan-sds-review/`](plan-sds-review/) | 实体（多文件） | 八阶段流水线：需求澄清 → 计划草稿 → 独立审核 #1 → 逐条核实 → 写 SDS → 独立审核 #2 + 实测校正 → 交接文档 → 实施。附审核 prompt 模板、失败模式清单、SDS 大纲、CDP 测量配方 |
| [`plan-me/`](plan-me/) | 转发壳 | `plan-sds-review` 的短入口，用户显式输入 `/plan-me` 触发。正文只有一句 `Call the Skill tool with "plan-sds-review".` |

## 归类在本阶段、但物理位置在别处的技能

| 技能 | 位置（相对仓库根） | 原因 |
|---|---|---|
| [`grilling`](../../third-party/mattpocock-skills/skills/grilling/) | `third-party/mattpocock-skills/skills/grilling/` | 决策树分轮提问，正是 `plan-sds-review` 第 1 阶段要调的能力；属 Matt Pocock 的 MIT 作品，按版权隔离放第三方目录 |
| [`grill-me`](../../third-party/mattpocock-skills/skills/grill-me/) | `third-party/mattpocock-skills/skills/grill-me/` | 指向 `grilling` 的转发壳，`plan-sds-review` 第 1 阶段要求用户输入的就是 `/grill-me` |

第三方目录不并入本文件夹，是因为版权归属不同（[`docs/structure.md`](../../docs/structure.md) 有分界规则）。安装器会同时扫描两处，安装后六个技能都平铺在目标目录里，跨目录调用不受影响。

## 成对依赖

两组都是「壳 + 实体」，壳单独安装会指向不存在的技能：

```bash
node scripts/install.mjs --only planning          # 本分类两个技能
node scripts/install.mjs --only grill-me,grilling # 第 1 阶段需要的提问能力
```

## 什么时候用这一类

- 多文件功能、重构、重设计
- 方向错了的返工代价超过一天
- 活要交给另一个 agent 或另一个会话

一行修复、改错字、用户已给精确指令的任务不用这一类，直接做。

## 与其它分类的衔接

```
planning/  →  delivery/  →  verification/
（决策与规格）  （实施与交付）  （验收证据）
```

`plan-sds-review` 第 6 阶段的「实测校正」会用到 `verification/` 里的测量口径；本分类产出的验收标准必须是 `verification/` 能写成脚本断言的形式。
