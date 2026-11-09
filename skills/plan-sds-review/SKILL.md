---
name: plan-sds-review
description: Use when a multi-file feature, refactor or redesign needs a reviewed plan and SDS before any code is written — eight-stage pipeline from requirement clarification through two adversarial reviews to a handoff document, with review prompts, failure-mode checklist and CDP measurement recipe.
license: MIT
metadata:
  author: haomiaoyan
  version: "1.0.0"
---

# Plan & SDS Review Workflow

An eight-stage pipeline for turning a rough idea into an implementation-ready spec: stages 1–7 produce the reviewed documents, stage 8 is the post-handoff implementation run in a fresh session. Built from the Synteny motion-layer project, where it found and fixed 32 defects before a single line of implementation code was written.

## When to use

Use this skill when:

- The task is a multi-file feature, refactor, or redesign
- Getting the direction wrong would cost more than a day of rework
- The user asks for a plan, a spec, an SDS, or says "先给计划" / "写个方案"
- The work will be handed to another agent or another session

Skip it for one-line fixes, typo corrections, or tasks where the user has already given exact instructions.

## The pipeline

```
1. Requirement clarification   ← user types /grill-me
   ↓
2. Plan draft
   ↓
3. Independent review #1       ← fresh subagent, adversarial
   ↓
4. Verify each finding, fix
   ↓
5. Write the SDS
   ↓
6. Independent review #2 + empirical correction
   ↓
7. Handoff document
   ↓
8. Implementation (new session, subagent-driven)
```

## Stage 1: Requirement clarification

**The user must type `/grill-me`.** It is a thin wrapper skill (`disable-model-invocation: true`) that calls `grilling`. You cannot trigger it yourself. If the user has not typed it, say:

> "This stage needs you to type `/grill-me` first — it runs the structured interview that produces the decision table every later document cites."

Do not substitute your own questions for it. The interview walks a decision tree in rounds, asking only questions whose prerequisites are settled, and gives a recommended answer with each so the user can reply "yes".

**Output**: a numbered decision table (D1, D2, …). Every later document cites these IDs. In Synteny there were 11 decisions from 24 questions across 5 rounds.

## Stage 2: Plan draft

Write the plan from the decision table.

Must include:
- Current-state analysis **with file:line citations**, not impressions
- Phased tasks
- Acceptance criteria
- Risks and mitigations

**The most common failure here is asserting things about the codebase without checking.** In Synteny the draft assumed three things that were false: that adding motion would fix a specific lint rule, that an absolutely-positioned layer would land where intended, and that an existing helper could be reused. All three were wrong and all three would have produced broken code.

## Stage 3: Independent review #1

Dispatch a **fresh-context subagent**. Its prompt must contain:

- The plan document path
- The real codebase path, with the specific files to read
- Any reference implementation path
- The acceptance tool path (linter, inspector, test harness)

Use the review prompt template in `references/review-prompt.md`.

**Critical line to include verbatim**: "Do not approve by default — a review that finds nothing is a failed review."

## Stage 4: Verify every finding

**Do not apply review feedback blindly.** The reviewer works from static reading and will be wrong sometimes.

For each finding:
1. Open the cited file and line
2. Confirm the claim
3. Only then fix

In Synteny one reviewer finding (about z-order) was wrong, and the reviewer itself sent a correction. Verifying costs minutes; reverting bad fixes costs hours.

## Stage 5: Write the SDS

**SDS differs from the plan**:

| | Plan | SDS |
|---|---|---|
| Reader | you, the reviewer | an implementer who has never seen this codebase |
| Content | what to do | what to do + exact interfaces + why each decision was made |
| Length | short | long (Synteny: 819 lines) |

Required sections are listed in `references/sds-outline.md`.

**Writing rules**:
- Every decision carries its reason, with evidence (code comment, measurement, spec doc)
- Interface signatures must be exact: parameter names, types, return types, optionality
- Every number must be measured, not estimated (see Stage 6)
- State explicitly what you are **not** doing — this prevents scope creep better than stating what you are

## Stage 6: Independent review #2 + empirical correction

Two things in parallel.

### 6a. Second review

Same template, but focus on:
- Whether each fix from round 1 actually landed
- What the revision newly broke
- The places where the spec is most likely to be self-deceiving

### 6b. Empirical correction — the highest-value step

**Measure with a headless browser. Do not infer from reading code.**

Static reading cannot produce runtime layout sizes, element counts, or memory figures. In Synteny this step found five errors the reviewer missed entirely:

| Claimed | Measured | Consequence |
|---|---|---|
| container 1000×780 | 905×926 | particle-count formula off |
| plot 660×660 | 565×565 | hit-test size wrong |
| ~60k seeds, 0.5 MB | 25,556, 0.22 MB | 2.3× over-estimate |
| "return the array" | must copy before reset | would return all-empty |
| repaint on return only | needs three fallbacks | permanently stale |

The measurement recipe is in `references/measure-with-cdp.md`.

## Stage 7: Handoff document

The SDS is long; an implementer needs an entry point. The handoff covers:

- Reading order (handoff → SDS → baseline data)
- Environment: project paths, git state, commands, tool commands
- Hard constraints as a table (constraint / consequence of violating)
- The measured numbers, marked "do not re-estimate"
- Batch list
- The five easiest mistakes, restated
- Acceptance summary
- **What to do when the SDS conflicts with the code**

That last one is essential: **when the SDS and the code disagree, the code wins.** An implementer must never write wrong code to satisfy a document.

## Stage 8: Implementation

Hand to a new session running subagent-driven development. The main session dispatches subagents to write code and other subagents to review, and keeps its own context for arbitration. This lets one session run for a day without exhausting context.

## Cost

Roughly five hours for a medium feature, excluding implementation. Returns 30+ defects found, of which 8+ would each have cost half a day of rework.

If time is short, merge the two review rounds — but **never skip Stage 6b**. It is the cheapest, highest-yield step in the pipeline.

## Files

| File | Read when |
|---|---|
| `references/review-prompt.md` | Dispatching either review round |
| `references/sds-outline.md` | Writing the SDS |
| `references/measure-with-cdp.md` | Stage 6b, measuring real layout and runtime values |
| `references/failure-modes.md` | Before finalising, to check the plan against known traps |
