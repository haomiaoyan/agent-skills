# mattpocock/skills（第三方，MIT）

来源：<https://github.com/mattpocock/skills>
许可：MIT，Copyright (c) 2026 Matt Pocock，全文见本目录 [`LICENSE`](LICENSE)。

## 收录内容

| 本地目录 | 上游路径 | 本地与上游的关系 |
|---|---|---|
| `skills/grilling/` | `skills/productivity/grilling/` | 内容逐字节相同，仅换行符为 CRLF |
| `skills/grill-me/` | `skills/productivity/grill-me/` | 内容逐字节相同，仅换行符为 CRLF |

`grilling` 是实体技能（决策树分轮提问），`grill-me` 是指向它的转发壳（`disable-model-invocation: true`，只能由用户显式输入触发）。两者必须成对存在：`grill-me` 的正文只有一句 `Call the Skill tool with "grilling".`。

## 为什么单独放在 third-party/

版权归属不同。本仓库自有技能是 MIT（Copyright 2026 haomiaoyan），这两个是 Matt Pocock 的作品，保留原作者署名与许可原文，不混入根目录 `skills/`。

安装器会同时遍历 `skills/` 与 `third-party/*/skills/`，所以安装方式对使用者没有区别。

## 未收录的同上游技能

`brainstorming`、`writing-plans`、`executing-plans`、`systematic-debugging` 等 skill 与 `obra/superpowers`（同样 MIT）高度重合，本地副本已混入中文改动，无法逐字节确认来源。宁可不收，也不在来源不确定的情况下发布他人作品。

如需收录，请从上游对应仓库重新拉取原文，不要用本地已被改动过的副本。
