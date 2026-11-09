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
| `--only a,b` | 只装指定技能（逗号分隔，用技能目录名） |
| `--link` | 建符号链接而非复制（改仓库即时生效；Windows 建 junction，无需管理员） |
| `--force` | 覆盖已存在的同名技能 |

默认目标目录是 `~/.agents/skills`（跨运行时通用）。若你的运行时只认某个固定目录，用 `--dest` 指过去，例如：

```bash
node scripts/install.mjs --dest ~/.claude/skills
node scripts/install.mjs --dest "$DSH_HOME/skills"
```

**首次安装若目标目录里已有同名技能，脚本会跳过而不是覆盖**，加 `--force` 才会替换。

### 手工安装

不想用脚本就直接拷目录：

```bash
cp -r skills/visual-narrative-site ~/.agents/skills/
```

复制模式下改动本仓库不会同步，更新时重跑安装（加 `--force`）；用 `--link` 则不需要。

## 目录结构

```
agent-skills/
├── skills/                     技能本体，一个目录一个技能
│   ├── visual-narrative-site/
│   │   ├── SKILL.md            主文件（frontmatter + 流程正文）
│   │   ├── references/         按需加载的参考文档
│   │   └── assets/             可复制的代码模板
│   └── web-acceptance-harness/
│       └── SKILL.md            单文件技能
├── scripts/
│   └── install.mjs             安装 / 校验 / 列举（零依赖）
├── .github/workflows/
│   └── validate.yml            push 时自动校验
├── docs/
│   └── structure.md            技能目录约定与撰写规则
└── LICENSE
```

## 已有技能

| 技能 | 用途 | 形态 |
|---|---|---|
| [`visual-narrative-site`](skills/visual-narrative-site/) | 多章节长滚动 / 交互可视化网站的交付流程：立项提问 → 计划 → 独立审核 → 实测校正 → 分批实施；含 22 条实测坑与运行时测量配方 | 多文件（4 references + 4 assets） |
| [`web-acceptance-harness`](skills/web-acceptance-harness/) | 可判定的 Web 验收脚本：四层验收体系、六种测量技术、五个状态隔离陷阱、断言必须能失败的纪律 | 单文件 |

## 加一个新技能

1. 建 `skills/<kebab-case-name>/SKILL.md`
2. frontmatter 至少写 `name`（与目录名一致）和 `description`（以 `Use when...` 开头，说明**何时**用，不要复述流程）
3. 跑 `node scripts/install.mjs --validate`，通过后提交

细则见 [`docs/structure.md`](docs/structure.md)。

## 更新

```bash
cd agent-skills && git pull
node scripts/install.mjs --force     # 复制模式
# 或 --link 模式下直接 git pull 就生效
```

## License

MIT，见 [LICENSE](LICENSE)。
