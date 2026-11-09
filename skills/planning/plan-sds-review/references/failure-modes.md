# Failure modes

Every row here is a defect that actually shipped into a plan or SDS and was caught by review or measurement. Check a finished document against this list before declaring it done.

| Failure mode | What it looked like | Prevention |
|---|---|---|
| **Skipping requirement clarification** | Wrote the plan directly without the structured interview | Stage 1 needs the user to type `/grill-me`; prompt them, do not substitute |
| **Assertion instead of verification** | "Adding motion will fix the lint rule" — without reading how the rule is computed | For every technical assumption, find the code that proves it |
| **Arithmetic by estimation** | Particle counts, memory, and sizes all guessed from reading code | Measure with a headless browser (`measure-with-cdp.md`) |
| **Self-contradiction** | Decision said "prose sections stay still"; a later section animated the container those sections live in | After finishing, walk the decision table line by line and point at the task that honours each |
| **Invented rule names** | Cited a lint rule that does not exist (the real one had a different name) | Grep the tool's source for the rule id before citing it |
| **Assumed API names** | "Add `data-i18n` to the `aria-label`" — but that attribute writes `textContent` | Read the implementation of any attribute or helper you cite |
| **Batch omission** | A section existed in the design but appeared in no delivery batch, while batch 1 depended on it | Map every §4 subsection to exactly one batch |
| **Untestable acceptance** | "Smooth", "looks right", "no jank" | Rewrite as a script assertion with a number |
| **Over-promising** | Targeted "0 failures" against a baseline that had 8 | Count the baseline first, then do the arithmetic out loud |
| **Counting the wrong thing** | Counted 13 animated elements for a rule that only sees 6, because 7 required interaction the checker never performs | Read how the acceptance tool measures, not just what it measures |
| **Assuming a layering works** | "Absolutely position the layer between the canvas and the text" — the containers were all `position: static` | Read the CSS `position` of every ancestor, or measure |
| **Assuming a returned value is kept** | "Reuse the helper" — the call site discarded the return value | Open the call site |
| **Reading a buffer after it is cleared** | "Return the array" — the array was reset at the end of each pass | Read past the write, to the reset |
| **Trusting a mitigation that cannot fire** | Guarded against an observer callback that the trigger never causes | Verify the trigger mechanism, not just the symptom |
| **Dropping a decision** | A stated goal had no implementing task anywhere | Cross-check the decision table against §4 and §5 |
| **Correcting in the wrong direction** | A "fix" that dimmed a layer whose visibility was the whole point | For each fix, state what must remain true afterwards |
| **Stale cache assumption** | Assumed a repaint would happen on the next frame, but the loop was stopped | Trace who calls what, when |
| **Silent scope growth** | Adding a file to "modify" that needs no modification | List only files that actually change; note lookalikes explicitly |

---

## The meta-failure

Most of the rows above are one failure wearing different clothes: **stating a belief about the codebase without opening the codebase.**

The cheap defence is mechanical: every factual claim in the document gets a `file:line`. A claim you cannot cite is a claim you have not checked. If it turns out to be wrong later, the citation makes the error visible in seconds instead of after a day of implementation.

---

## Pre-flight checklist

Before declaring a plan or SDS finished:

- [ ] Every decision in the table has a task implementing it
- [ ] Every `file:line` citation has been opened and confirmed
- [ ] Every number is either measured or explicitly marked as an estimate
- [ ] Every section of the detailed design appears in exactly one batch
- [ ] Every acceptance criterion can be judged by a script or a number
- [ ] The "does not do" list is non-empty and specific
- [ ] A fresh-context reviewer has read it and found something
- [ ] Every reviewer finding has been independently verified
- [ ] The baseline was counted, not remembered
