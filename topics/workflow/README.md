# 工程流程

**说明**：立项提问、计划与规格审核、验证纪律、交付闸门等跨项目方法论。这一类是「不绑定具体技术栈」的技能，任何项目都能用。

## 已收录（5 个）

| 技能 | 所在阶段 / 位置 | 作用 |
|---|---|---|
| [`plan-sds-review`](../../skills/planning/plan-sds-review/) | [立项与规划](../../skills/planning/README.md) | 八阶段流水线：需求澄清 → 计划 → 两轮独立审核 → SDS → 实测校正 → 交接 |
| [`plan-me`](../../skills/planning/plan-me/) | [立项与规划](../../skills/planning/README.md) | 上面的短入口（用户显式输入 `/plan-me`） |
| [`grilling`](../../third-party/mattpocock-skills/skills/grilling/) | 第三方（MIT, Matt Pocock） | 决策树分轮提问，把待定决策画成树、每轮只问前置条件已确定的 |
| [`grill-me`](../../third-party/mattpocock-skills/skills/grill-me/) | 第三方（MIT, Matt Pocock） | 上面的短入口（用户显式输入 `/grill-me`） |
| [`web-acceptance-harness`](../../skills/verification/web-acceptance-harness/) | [验收与验证](../../skills/verification/README.md) | 「断言必须能失败」「单次全绿不是证据」等验证纪律 |

## 贯穿这一类的三条原则

1. **需求有未证实假设时禁止写代码**：把待定决策画成树，每个问题附推荐答案 + 理由，能自己查证的不要问用户
2. **审核意见必须自己核实**：子代理会犯错，逐条去代码里验证，预设「预期有一条是它自己错的」
3. **验收标准必须脚本能判定**：「不卡顿」「观感好」是禁区；写完断言要故意改坏代码确认它 FAIL

这三条分别来自 `grilling` / `plan-sds-review` / `web-acceptance-harness`，在不同的技能里以不同形式出现，是这套方法论的一致性来源。

## 与阶段分类的重叠

这一类与 [立项与规划](../../skills/planning/README.md) 重叠最多，但两者视角不同：

| | 阶段分类 planning/ | 主题 workflow（本类） |
|---|---|---|
| 回答 | 「什么时候用」→ 写代码之前 | 「属于哪个领域」→ 跨项目方法论 |
| 范围 | 只含该阶段的物理目录 | 跨阶段捞取，还包含 `verification/` 的验证纪律与第三方提问技能 |

`web-acceptance-harness` 物理上在 `verification/`，但它的「断言纪律」是通用方法论，所以同时挂到本主题。

## 按主题安装

```bash
node scripts/install.mjs --topic workflow
```

注意这会装 5 个技能，其中包含两组「壳 + 实体」：`plan-me` + `plan-sds-review`、`grill-me` + `grilling`。
