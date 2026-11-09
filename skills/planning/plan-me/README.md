# plan-me

`plan-sds-review` 的短入口。

## 这是什么

11 行的转发壳，不含任何流程逻辑：

```yaml
---
name: plan-me
description: Use when the user wants to start the plan and SDS review workflow — a short alias that the user types as /plan-me; it forwards to plan-sds-review.
license: MIT
disable-model-invocation: true
metadata:
  author: haomiaoyan
  version: "1.0.0"
---

Call the Skill tool with "plan-sds-review".
```

`disable-model-invocation: true` 意味着**只能由用户显式输入 `/plan-me` 触发**，代理不会自己调它。存在的意义是给 `plan-sds-review` 一个更短的入口，并避免代理在不需要审核流程时误触发八阶段流水线。

## 依赖关系

必须和 [`../plan-sds-review/`](../plan-sds-review/) 一起安装，否则转发目标不存在。安装器按目录名逐个复制、不解析依赖，所以：

```bash
node scripts/install.mjs --only plan-me,plan-sds-review
```

## 来源

作者 haomiaoyan，MIT。
