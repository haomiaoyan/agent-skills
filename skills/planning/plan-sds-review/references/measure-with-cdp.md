# Measuring with a headless browser

Static reading cannot produce runtime layout sizes, element counts, or memory figures. This is the step that catches what reviewers miss.

In the Synteny project this step found five errors the review round had not: container dimensions off by 146px, a plot 27% smaller than assumed, a seed count over-estimated by 2.3×, an array that would be read after being cleared, and a repaint path that would never fire.

---

## When to use

- Any number in the SDS that describes layout: container sizes, element counts, grid column widths
- Any figure used in a formula: particle counts, cell counts, buffer sizes
- Any claim about what an element contains or how many of them exist
- Before writing any acceptance criterion that depends on a measured value

## Recipe

### 1. Start the dev server as a background job

```bash
cd <project root>
npx vite --port 5174
```

Run it as a managed background job, **not** with a trailing `&`. A shell-backgrounded server dies when the shell exits, and you will chase phantom connection errors.

Verify it responds:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5174/
# expect 200
```

### 2. Write a measurement page into the served directory

Put it under `public/` (or wherever the dev server serves static files) so it is reachable.

```html
<!doctype html><meta charset="utf-8">
<style>body{margin:0;font:14px monospace}</style>
<pre id="out">measuring…</pre>
<script type="module">
const frame = document.createElement('iframe');
frame.style.cssText = 'width:1000px;height:2000px;border:0';
frame.src = '/';
document.body.appendChild(frame);
frame.onload = () => setTimeout(() => {
  try {
    const d = frame.contentDocument;
    const r = s => {
      const e = d.querySelector(s);
      if (!e) return null;
      const b = e.getBoundingClientRect();
      return { w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top) };
    };
    document.getElementById('out').textContent = JSON.stringify({
      container: r('.head'),
      figure:    r('.hero-fig'),
      canvas:    r('#heroPlot'),
      counts: {
        items: d.querySelectorAll('.lg-item').length,
        specs: d.querySelectorAll('.spec').length,
      },
      // computed style checks belong here too
      transition: (() => {
        const m = d.querySelector('#method');
        return m ? getComputedStyle(m).transition : 'n/a';
      })(),
    }, null, 2);
  } catch (e) {
    document.getElementById('out').textContent = 'ERR ' + e.message;
  }
}, 2500);
</script>
```

Two things that matter:

- **Use an iframe at a fixed width.** The measurement page itself is a full window; embedding the app at a known width gives you reproducible numbers instead of whatever the headless default viewport happens to be.
- **Wait ~2500ms before measuring.** Fonts load, layout settles, and any script-driven sizing runs late. Measuring at `onload` gives wrong numbers.

### 3. Dump the DOM with headless Chrome

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" \
  --headless --disable-gpu \
  --window-size=1440,900 \
  --dump-dom \
  --virtual-time-budget=8000 \
  http://localhost:5174/__measure.html
```

- `--virtual-time-budget` must exceed your `setTimeout` plus page load time.
- On Windows, quote the Chrome path. On macOS it is typically `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- If Chrome is absent, look for Edge (`msedge.exe`), Chromium, or whatever the project's own tooling uses.

### 4. Extract the JSON

```bash
... | python -X utf8 -c "
import sys, re, html
t = sys.stdin.read()
m = re.search(r'<pre id=\"out\">(.*?)</pre>', t, re.S)
print(html.unescape(m.group(1)) if m else 'NOT FOUND')
"
```

`html.unescape` is required — `--dump-dom` HTML-escapes the text content, so `"` arrives as `&quot;`.

### 5. Delete the measurement page

```bash
rm public/__measure.html
```

It must not ship.

---

## What to measure

| Category | Examples |
|---|---|
| Container sizes | Every box a formula depends on |
| Element counts | Everything an acceptance criterion counts |
| Computed styles | Whether a rule actually applies, what its effective value is |
| Overflow | Whether anything exceeds its parent |
| Canvas backing size | `canvas.width` / `canvas.height` vs CSS size, for DPR arithmetic |

## What you cannot measure this way

- Frame timing under interaction — needs CDP with real event dispatch
- Anything requiring hover, click, drag, or focus — `--dump-dom` cannot interact
- Memory — estimate from array types and element counts instead, and say it is an estimate

For interaction-dependent behaviour, use a CDP-driven script instead. Check whether the project already has one under `tools/` before writing your own.

---

## Pitfalls

**The server dies mid-measurement.** Symptom: `ECONNREFUSED`. Cause: the server was started with `&` in a shell that exited, or a file watcher crashed. Restart it as a managed background job.

**Vite crashes with `EBUSY` on Windows.** A `.tmpdir` directory under `src/` can lock the file watcher. Add `--watch.usePolling`, or avoid the dev server and use `vite build && vite preview`.

**Numbers look like defaults.** If `getComputedStyle` returns `"all"` for `transition`, the stylesheet has not loaded yet. Increase the wait.

**Measurements disagree between runs.** Layout is not deterministic under font loading. Wait for `document.fonts.ready` before measuring if text affects sizes.

**The iframe is too small.** Content that is `100vh` inside a 2000px iframe measures 2000px, not the real viewport. Set the iframe height to the viewport you actually want to reason about.
