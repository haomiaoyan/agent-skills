# plan-me（转发壳，来源待确认）

## 这是什么

141 字节的转发壳，不含任何流程逻辑：

```yaml
---
name: plan-me
description: 计划与 SDS 审核流程。
disable-model-invocation: true
---

Call the Skill tool with "plan-sds-review".
```

`disable-model-invocation: true` 意味着**只能由用户显式输入 `/plan-me` 触发**，代理不会自己调它。它存在的意义是给 `/plan-sds-review` 一个更短的入口。

## 依赖关系

`plan-me` 必须和 [`../plan-sds-review/`](../plan-sds-review/) 一起安装，否则转发目标不存在。安装器按目录名逐个复制，不解析依赖，所以：

```bash
node scripts/install.mjs --only plan-me,plan-sds-review
```

## 来源

与 `plan-sds-review` 同源，**来源无法确认**，详见 [`../plan-sds-review/README.md`](../plan-sds-review/README.md)。

本仓库根目录的 MIT **不覆盖这个技能**。未添加 `license` / `author` 字段。
