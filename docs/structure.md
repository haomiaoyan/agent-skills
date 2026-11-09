# 技能目录约定

本仓库的每个技能遵循同一套结构约定。

## 一个技能 = 一个目录

自有技能放 `skills/<name>/`，第三方技能放 `third-party/<vendor>/skills/<name>/`。

```
skills/<name>/
├── SKILL.md              必需
├── references/           可选，按需加载的长文档
├── assets/               可选，可直接复制的模板/骨架
└── scripts/              可选，可执行脚本（用 `node scripts/x.mjs` 调用，不要裸路径）
```

目录名用 kebab-case，且**必须与 frontmatter 的 `name` 完全一致**。校验脚本会检查这一点。

### 自有 vs 第三方的分界

| | 自有 | 第三方 |
|---|---|---|
| 位置 | `skills/` | `third-party/<vendor>/skills/` |
| frontmatter | 需要 `license` / `metadata.author` | 保持上游原样，不改他人文案 |
| `description` 前缀 | 建议 `Use when...` | 不强制（不改原文） |
| LICENSE | 由根目录 MIT 覆盖 | 该 vendor 目录内单独放一份原文 |

判断依据是**版权归属**，不是文件来源。从别人仓库拉的一律不放 `skills/`；确属自己作品但此前来源未标注的，补上 `license` / `author` 后即可进 `skills/`。无法确认归属的，不要加 `license` / `author` 字段——写了就是伪造署名。

### 转发壳（alias）

转发壳是只含一句 `Call the Skill tool with "<实体名>".` 的技能，配合 `disable-model-invocation: true` 限制成只能由用户显式输入斜杠命令触发。

```
skills/<entity>/     ← 实体，有完整流程
skills/<alias>/      ← 壳，指向实体
```

- 壳的 `disable-model-invocation` 必须写在 frontmatter 顶层（不是 `metadata` 里），否则不生效
- 壳和实体必须同时安装，安装器不解析依赖
- 壳也要写 `license` / `author`（它的版权归属与实体一致）

## SKILL.md 的 frontmatter

```yaml
---
name: kebab-case-name
description: Use when ... （何时用，不是做什么）
license: MIT
metadata:
  author: haomiaoyan
  version: "1.0.0"
---
```

| 字段 | 要求 |
|---|---|
| `name` | 只含小写字母、数字、连字符；等于目录名 |
| `description` | ≤1024 字符；以 `Use when` 开头；写**触发条件与症状**，不写流程摘要 |
| `license` | 建议写；缺失只告警不报错 |
| `metadata.version` | 语义化版本，改了技能内容就递增 |

### 为什么 description 不能写流程

代理在按描述检索时会先看到 description。如果它里面已经写了「第一步…第二步…」，代理会照着描述做而不去读 SKILL.md 正文——流程细节就永远读不到。所以 description 只回答「什么时候该读我」。

## 正文写法

- **判据优先**：能写成阈值的写成阈值（`≤33ms`、`≥4.5`、`≤1px`），不写形容词
- **失效模式优先于正确路径**：先说清楚「什么条件下会坏」，再说「怎么做」
- **一条优秀示例胜过五个平庸示例**：示例要完整可运行，不要填空模板
- **不写叙事**：「某次会话我们发现了…」属于历史记录，不属于技能。把结论抽出来，去掉过程

## references/ 与 assets/ 的边界

| 目录 | 放什么 | 何时读 |
|---|---|---|
| `references/` | 长文档：API 参考、测量配方、失效清单 | 执行到对应步骤时按需读 |
| `assets/` | 可直接复制进项目的代码：模板、骨架、配置 | 需要动手搭结构时 |

两者都**不要**在 SKILL.md 里全文内联——正文只放触发条件与索引。

## 校验

```bash
node scripts/install.mjs --validate
```

检查项：

- 存在 `SKILL.md`
- 有 frontmatter，且有 `name` / `description`
- `name` 与目录名一致、格式合法
- `description` 未超长、以 `Use when` 开头（缺前缀只告警）
- 正文里 `` `references/xxx` `` / `` `assets/xxx` `` 形式的引用，文件真实存在
- 文件无 UTF-8 BOM（有则告警：部分运行时解析 frontmatter 会失败）

任一项失败则退出码非 0，CI 会拦住。

## 版本与变更

- 内容有实质改动 → 递增 `metadata.version`
- 破坏性改动（删字段、改语义）→ 主版本号 +1
- 在仓库根 `git tag` 打标记，便于回滚到某个稳定版本

## 什么不该进这个仓库

| 不该进 | 原因 |
|---|---|
| 项目业务代码 | 技能要能跨项目复用 |
| 他人作品未标注许可 | 版权问题；引用第三方技能须保留原 LICENSE 并在 README 注明来源 |
| 密钥、内网地址、个人隐私 | 公开仓库 |
| 只有本项目才成立的一次性参数 | 除非写清「这是量级参考，需按新项目重新标定」 |
