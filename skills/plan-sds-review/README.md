# plan-sds-review

计划与 SDS 审核流水线：把一个粗略想法变成「经过两轮对抗式审核、可以交给别人实施」的规格文档。

## 适用场景

- 多文件功能、重构、重设计
- 方向错了的返工代价超过一天
- 用户要一个 plan / spec / SDS，或说「先给计划」「写个方案」
- 活要交给另一个 agent 或另一个会话

一行修复、改错字、用户已给精确指令的任务，不用它。

## 流水线

七阶段产出规格文档，第 8 步是交接之后的实施（不在本技能范围内）：

```
1. 需求澄清          ← 用户输入 /grill-me（或直接用 grilling）
2. 计划草稿
3. 独立审核 #1       ← 全新上下文的子代理，对抗式
4. 逐条核实并修
5. 写 SDS
6. 独立审核 #2 + 实测校正
7. 交接文档
────────────── 以上为七阶段 ──────────────
8. 实施（新会话，子代理驱动）
```

第 1 阶段要求用户显式输入 `/grill-me`：它是 `disable-model-invocation: true` 的转发壳，代理不能自己触发。代理不能拿自己的提问替代它——那一步产出的是后续所有文档都要引用的决策表（D1…Dn）。

## 文件

| 文件 | 内容 |
|---|---|
| `SKILL.md` | 八阶段流程、每阶段的产出与判据、成本说明 |
| `references/review-prompt.md` | 两轮审核的 prompt 模板 + 派发者注意事项 |
| `references/failure-modes.md` | 失败模式清单 + 交付前 pre-flight checklist |
| `references/sds-outline.md` | SDS 十一节大纲 + 撰写规则 |
| `references/measure-with-cdp.md` | 无头浏览器实测配方（静态阅读测不出来的那些数） |

## 配套

`plan-me` 是它的短入口，必须一起安装：

```bash
node scripts/install.mjs --only plan-me,plan-sds-review
```

## 来源

作者 haomiaoyan，MIT。正文中的 `Synteny motion-layer project` 是它首次成型的项目案例，保留作为实证（该案例在写第一行实现代码前发现并修掉 32 个缺陷）。
