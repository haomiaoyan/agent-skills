# Agent Skills

我自用的 agent 技能集合。每个技能是一个自包含目录，可单独复制到任何支持 `SKILL.md` 约定的运行时（Claude Code、Codex、DeepSeek Harness 等）。

**设计取向**：技能里只放「判据、阈值、实测数据、失效模式」，不放项目业务细节。凡是能写成一条脚本断言的，就不写成一句形容词。

## 一键安装

```bash
git clone https://github.com/haomiaoyan/agent-skills.git
cd agent-skills
node scripts/install.mjs            # 复制安装到 ~/.agents/skills
node scripts/install.mjs --list     # 先看看有什么
```

不需要 `npm install`——脚本只用 Node 内置模块，Node ≥ 18 即可。

### 常用参数

| 命令 | 作用 |
|---|---|
| `node scripts/install.mjs` | 复制全部技能到默认目录 |
| `--list` | 列出技能与描述 |
| `--validate` | 只校验，不安装 |
| `--dest <dir>` | 指定目标目录 |
| `--only a,b` | 只装指定技能**或分类**（写分类名装整类，如 `--only planning`） |
| `--link` | 建符号链接而非复制（改仓库即时生效；Windows 建 junction，无需管理员） |
| `--force` | 覆盖已存在的同名技能 |

默认目标目录是 `~/.agents/skills`（跨运行时通用）。若你的运行时只认某个固定目录，用 `--dest` 指过去，例如：

```bash
node scripts/install.mjs --dest ~/.claude/skills
node scripts/install.mjs --dest "$DSH_HOME/skills"
```

**首次安装若目标目录里已有同名技能，脚本会跳过而不是覆盖**，加 `--force` 才会替换。

### 手工安装

不想用脚本就直接拷目录（**注意分类层级，装到目标目录时只拷最内层技能目录**）：

```bash
cp -r skills/delivery/visual-narrative-site ~/.agents/skills/
```

复制模式下改动本仓库不会同步，更新时重跑安装（加 `--force`）；用 `--link` 则不需要。

## 目录结构

```
agent-skills/
├── skills/                         自有技能，按「用在哪个阶段」分三类
│   ├── planning/                   【立项与规划】写代码之前
│   │   ├── README.md               分类说明 + 与其它分类的衔接
│   │   ├── plan-sds-review/       八阶段计划与 SDS 审核流水线（4 references）
│   │   └── plan-me/               指向 plan-sds-review 的转发壳
│   ├── delivery/                   【实施与交付】规格确定之后
│   │   ├── README.md
│   │   └── visual-narrative-site/ 长滚动可视化网站交付（4 references + 4 assets）
│   └── verification/               【验收与验证】声称完成之前
│       ├── README.md
│       └── web-acceptance-harness/ 可判定的 Web 验收脚本
├── third-party/                    第三方技能，保留原作者许可
│   └── mattpocock-skills/
│       ├── LICENSE                 MIT, Copyright (c) 2026 Matt Pocock
│       ├── README.md               来源与收录说明
│       └── skills/
│           ├── grilling/           决策树分轮提问（归 planning 阶段）
│           └── grill-me/           指向 grilling 的转发壳
├── scripts/
│   └── install.mjs                 安装 / 校验 / 列举（零依赖）
├── .github/workflows/
│   └── validate.yml                push 时自动校验
├── docs/
│   └── structure.md                技能目录约定与撰写规则
└── LICENSE                         MIT（覆盖 skills/ + scripts/ + docs/）
```

**分类是仓库里的组织方式，不是安装后的结构**：安装器把六个技能平铺到目标目录（运行时认技能名，不认分类）。分类目录本身只有 README.md，不含 SKILL.md，不会被误当成技能。

安装器同时遍历 `skills/<分类>/<技能>/` 和 `third-party/*/skills/`，对使用者没有区别；分目录只是为了让阶段归属与版权归属都清楚。

## 已有技能

| 技能 | 分类 | 用途 | 形态 | 许可 |
|---|---|---|---|---|
| [`plan-sds-review`](skills/planning/plan-sds-review/) | [立项与规划](skills/planning/README.md) | 八阶段计划与 SDS 审核流水线，含审核 prompt 模板、失败模式清单、SDS 大纲、CDP 测量配方 | 多文件（4 references） | MIT |
| [`plan-me`](skills/planning/plan-me/) | [立项与规划](skills/planning/README.md) | `plan-sds-review` 的短入口（用户显式输入 `/plan-me` 才会触发） | 转发壳 | MIT |
| [`visual-narrative-site`](skills/delivery/visual-narrative-site/) | [实施与交付](skills/delivery/README.md) | 多章节长滚动 / 交互可视化网站的交付流程：立项提问 → 计划 → 独立审核 → 实测校正 → 分批实施；含 22 条实测坑与运行时测量配方 | 多文件（4 references + 4 assets） | MIT |
| [`web-acceptance-harness`](skills/verification/web-acceptance-harness/) | [验收与验证](skills/verification/README.md) | 可判定的 Web 验收脚本：四层验收体系、六种测量技术、五个状态隔离陷阱、断言必须能失败的纪律 | 单文件 | MIT |
| [`grilling`](third-party/mattpocock-skills/skills/grilling/) | 立项与规划（第三方） | 针对计划/决策做 relentless 分轮提问，把决策画成树 | 单文件 | MIT (Matt Pocock) |
| [`grill-me`](third-party/mattpocock-skills/skills/grill-me/) | 立项与规划（第三方） | `grilling` 的短入口（用户显式输入 `/grill-me` 才会触发） | 转发壳 | MIT (Matt Pocock) |

按分类整类安装：

```bash
node scripts/install.mjs --only planning
node scripts/install.mjs --only delivery,verification
```

### 成对使用的技能

`plan-me` + `plan-sds-review`、`grill-me` + `grilling` 都是「转发壳 + 实体」的组合。壳的正文只有一句 `Call the Skill tool with "<实体名>".`，靠 `disable-model-invocation: true` 限制成只能由用户显式输入斜杠命令触发。

壳依赖实体，单独安装壳会指向不存在的技能。安装器不解析依赖，需要成对指定：

```bash
node scripts/install.mjs --only plan-me,plan-sds-review
node scripts/install.mjs --only grill-me,grilling
```

## 加一个新技能

1. 先判断它属于哪个阶段，选 `skills/planning/`、`skills/delivery/` 或 `skills/verification/`；确实跨阶段或不属于任何一类时，直接在 `skills/` 下平铺（安装器两种结构都认）
2. 建 `skills/<分类>/<kebab-case-name>/SKILL.md`
3. frontmatter 至少写 `name`（与目录名一致）和 `description`（以 `Use when...` 开头，说明**何时**用，不要复述流程）
4. 在该分类的 `README.md` 表格里补一行
5. 跑 `node scripts/install.mjs --validate`，通过后提交

细则见 [`docs/structure.md`](docs/structure.md)。

## 更新

```bash
cd agent-skills && git pull
node scripts/install.mjs --force     # 复制模式
# 或 --link 模式下直接 git pull 就生效
```

## License

根目录 MIT（见 [LICENSE](LICENSE)，Copyright (c) 2026 haomiaoyan）覆盖 `skills/` 下全部自有技能，以及 `scripts/`、`docs/`、`README.md`。

| 路径 | 许可 |
|---|---|
| `skills/` 下全部技能 | MIT，Copyright (c) 2026 haomiaoyan |
| `scripts/`、`docs/` | 同上 |
| `third-party/mattpocock-skills/` | MIT，Copyright (c) 2026 Matt Pocock（见该目录 [LICENSE](third-party/mattpocock-skills/LICENSE)） |

第三方技能保留原作者署名，不并入根目录版权。
