---
name: web-acceptance-harness
description: Use when a web deliverable needs script-verifiable acceptance instead of subjective claims — building or repairing a headless-browser (puppeteer-core / Playwright) check script for responsive layout, WCAG contrast, animation state, reduced-motion and theme switching; also for diagnosing flaky or always-green assertions in such a script.
license: MIT
metadata:
  author: haomiaoyan
  version: "1.0.0"
---

# Web 验收脚本（可判定的交付证据）

## 核心原则

**「不卡顿」「观感好」「响应式没问题」不是验收标准，是愿望。** 每条验收标准必须能被一条脚本断言判定，并且这条断言必须**在实现出错时真的会失败**。

恒真的断言比没有断言更危险：它让团队以为有覆盖。

## 四层验收体系

| 层 | 工具 | 管什么 | 典型失效 |
|---|---|---|---|
| 类型 | `tsc --noEmit` | 类型完整性 | **单元测试全绿 ≠ 能构建**，esbuild 剥类型 |
| 单元 | `vitest` / `jest` | 纯函数、数据结构契约 | 用「快照」代替语义断言 |
| 运行时 | headless 浏览器脚本 | 布局、对比度、动画状态、降级分支 | 断言恒真、跨用例状态污染 |
| 交付 | `npm run build` | 真实产物可构建 | 只在 dev 下验过 |

四层缺一不可，谁都不能替代谁。

## 启动三前提

```js
// 1) 静态服务器要显式绑 IPv4：很多 preview 默认只听 IPv6，127.0.0.1 连不上
spawn(node, ['node_modules/vite/bin/vite.js', 'preview', '--host', '0.0.0.0', '--port', '4173', '--strictPort']);

// 2) Windows 上把临时目录指到项目内，否则打包工具随机 Access denied
const childEnv = { ...process.env, TEMP: tmpDir, TMP: tmpDir };

// 3) 浏览器从系统里找，不下载；找不到就 SKIP 而不是 FAIL
const executablePath = [process.env.SITE_CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean).find(existsSync);
```

## 断言必须能失败（最重要的一条纪律）

写完一条断言，**故意把被测代码改坏一次，确认它 FAIL**。不这么做你无法区分「断言通过」和「断言没在执行」。

已经见过的三种恒真形态：

1. 超时后返回一个恰好满足条件的默认值（`?? 0`、`?? false` 用反了方向）
2. 取不到元素时 `for` 循环零次迭代，`every()` 返回 `true`
3. 断言条件和被测实现共用同一个错误的常量

## 视口切换：唯一「单次全绿也证明不了」的坑

`setViewport(w)` 只保证视口尺寸已提交，**不保证 reflow 完成**。紧接着读 `scrollWidth` 会拿到缩窄前的旧值，表现为偶发 FAIL：

```
FAIL  overflow-375:light  scrollWidth 1280 ≤ 375+1   ← clientWidth 已是 375
```

```js
async function setViewportSettled(page, width, height = 800) {
  await page.setViewport({ width, height });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await new Promise((r) => setTimeout(r, 400));
  const read = () => page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  let prev = await read();
  for (let i = 0; i < 20; i += 1) {
    await new Promise((r) => setTimeout(r, 100));
    const cur = await read();
    if (cur.sw === prev.sw && cur.cw === prev.cw && cur.cw === width) return cur;
    prev = cur;
  }
  return prev;
}
```

**这类问题只有重复跑才暴露。单次全绿不能当验收证据。**

## 六种测量技术

| 测什么 | 怎么测 | 判据 |
|---|---|---|
| 横向溢出 | `documentElement.scrollWidth <= clientWidth + 1` | 多视口 × 多主题全组合 |
| 对比度 | 取 computed `color`，向上遍历找首个非透明背景，WCAG 公式 | 正文 ≥4.5、大字 ≥3.0，**两主题各算一遍** |
| 主题生效 | `documentElement.dataset.theme` + `body` 计算背景色 | 两主题背景必须不同 |
| 动画在动 | `canvas.toDataURL()` 两次采样比对 | 在场应不同；`i += 16` 抽稀否则堵主线程 |
| 动画该停 | 同上，条件换成「指针离开后 1.6s」 | 两次必须相同 |
| 帧率 | 页内 rAF 采集环 + CDP 鼠标移动，**弃前 1s 热身** | 中位间隔 ≤33ms（实测 16.7ms ≈ 60fps） |

## 五个状态隔离陷阱

| 陷阱 | 正确做法 |
|---|---|
| 截图坐标 | `boundingBox()` 是**视口**坐标，`screenshot({clip})` 是**页面**坐标，`clip.y += scrollY` |
| 持久化验证 | 用**新开 page**，不要在被注入过 `evaluateOnNewDocument` 的页面 reload（会再次注入覆盖） |
| 触摸模拟 | CDP `setTouchEmulationEnabled` **不可逆**，必须独立浏览器进程 |
| reduced-motion | 独立 page + `emulateMediaFeatures`，不要和主流程共用 |
| 滚动位置 | 同 URL `goto` 会恢复滚动位置，断言前显式 `scrollTo(0, 0)` |

## 程序化滚动一律 instant

全局 `scroll-behavior: smooth` 会让脚本里所有 `scrollIntoView` / `scrollTo` 变异步——等 500ms 后坐标仍错位、hover 落空、`elementFromPoint` 返回 none。

```js
el.scrollIntoView({ block: 'center', behavior: 'instant' });
```

`smooth` 是给用户点击锚点用的；脚本里出现 `smooth` 就是缺陷。

## 驱动受控组件

直接赋 `.value` 会被 React 的 value tracker 判为无变化：

```js
const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
setter.call(input, '100');
input.dispatchEvent(new Event('input', { bubbles: true }));
```

## 报告要落文件

```js
writeFileSync('.tmp/verify-report.json', JSON.stringify(results, null, 2));
process.on('exit', () => server.kill());
```

`detail` 字段里写**实测数值**（`pinTop=68.0`、`travel 偏差 0.0px`），不要写「通过」。落文件才能后续对照历史值，避免把估算值写进文档。

## 反模式

| 反模式 | 为什么错 |
|---|---|
| 「本地跑一遍都 PASS，可以交付」 | 偶发竞态只有重复跑才暴露 |
| 用截图 diff 测所有视觉变化 | headless 截图管线可能不捕获 DOM 重绘，只捕获 canvas 纹理。先做「注入已知可见变化 → 看 diff 是否非 0」的探针 |
| 固定 `sleep(500)` | 异步链路长度不定，要轮询到条件成立 |
| 断言里写「应该差不多」 | 阈值要显式（≤1px、≥4.5、≤33ms） |
