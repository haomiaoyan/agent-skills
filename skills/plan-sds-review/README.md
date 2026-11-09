# plan-sds-review（来源待确认）

## 状态

**这份技能的来源无法确认。** 发布前请注意。

已尝试的追溯：

| 追溯方式 | 结果 |
|---|---|
| GitHub 代码搜索 `"plan-sds-review"` | 0 命中 |
| `obra/superpowers`（MIT）技能清单 | 无此技能（15 个技能里没有） |
| `mattpocock/skills`（MIT）技能清单 | 无此技能（282 个文件里无 plan/sds 命中） |
| npm `superpowers-zh@1.8.0` 全包解包 | 无此技能（21 个技能里没有） |
| 本地是否有 LICENSE | 无 |

## 内容特征

正文提到 `Synteny motion-layer project` 与 `Synteny project`，并有中文触发词 `"先给计划" / "写个方案"`。这说明它是为某个具体项目定制的，且经过中文语境适配——很可能是原作者的私有技能，或由某个 agent 会话生成。

## 因此

- **未给这个技能添加 `license` 字段**，也未在 frontmatter 里写 `author`。写了就是伪造署名。
- 本仓库根目录的 MIT（Copyright 2026 haomiaoyan）**不覆盖这个技能**。
- 如果你不是这个技能的原始作者，公开分发前需要确认授权；否则建议把本目录从仓库移除，只在本地使用。

## 若确认了来源

在这个文件的「状态」一节补上来源 URL 与许可类型，并在 `SKILL.md` 的 frontmatter 里加：

```yaml
license: <确认的许可>
metadata:
  author: <原作者>
  source: <来源 URL>
```

然后跑 `node scripts/install.mjs --validate` 确认无报错。
