# 验收与验证（verification）

**用在「声称做完了」之前**：把主观判断换成脚本能判定的证据，并且确保断言本身不是恒真的。

## 本类技能

| 技能 | 形态 | 作用 |
|---|---|---|
| [`web-acceptance-harness/`](web-acceptance-harness/) | 实体（单文件） | 可判定的 Web 验收脚本：四层验收体系、六种测量技术、五个状态隔离陷阱、断言必须能失败的纪律 |

## 它管什么

| 层 | 工具 | 典型失效 |
|---|---|---|
| 类型 | `tsc --noEmit` | 单元测试全绿但 esbuild 剥类型，构建其实过不了 |
| 单元 | `vitest` / `jest` | 用快照代替语义断言 |
| 运行时 | headless 浏览器脚本 | 断言恒真、跨用例状态污染、`setViewport` 后立刻读尺寸拿到旧值 |
| 交付 | `npm run build` | 只在 dev 下验过 |

## 核心纪律

**断言必须能失败。** 写完一条断言，故意把被测代码改坏一次确认它 FAIL。不这么做无法区分「通过」和「没在执行」。

**单次全绿不是验收证据。** 偶发竞态（例如 `setViewport` 后布局异步）只有重复跑才暴露，`setViewportSettled` 就是为此写的。

## 什么时候用这一类

- 要给一个 Web 交付物写或修验收脚本（puppeteer-core / Playwright）
- 响应式布局、WCAG 对比度、动画在动/该停、reduced-motion、双主题切换需要客观判据
- 验收脚本出现「偶发 FAIL」或「怎么改都 PASS」——后者更危险，说明断言恒真

## 与其它分类的衔接

```
planning/  →  delivery/  →  verification/
（决策与规格）  （实施与交付）  （验收证据）
```

- `planning/plan-sds-review` 第 6 阶段的「实测校正」用这里的测量口径
- `delivery/visual-narrative-site` 第 2 阶段要求验收标准可脚本判定、第 6 阶段要求数字来自实测，落地都靠这里

反过来，`verification/` 不绑定任何具体页面类型：修后台管理系统的验收脚本同样适用，不需要先读另外两类。
