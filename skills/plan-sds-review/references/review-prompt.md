# Review prompt template

Copy this wholesale into a `subagent` call. Replace the `<…>` placeholders. Do not soften it — a review that finds nothing is a failed review.

---

You are reviewing a `<plan | Software Design Specification>` before any implementation code is written. Your job is to find problems, not to approve.

## Read these first

The document under review:
`<absolute path to the plan or SDS>`

The real codebase it describes — verify every claim against actual code, do not trust the document:
- Project root: `<absolute path>`
- Files to read: `<list the specific files>`
- `<any test / tooling files the document cites>`

Reference implementation being adapted, if any:
`<absolute path>`

The acceptance tool that defines "done":
`<path to linter / inspector / test harness>`
`<path to any saved baseline report>`

## Check in this order

### 1. Factual accuracy (highest value)

Every `file:line` citation in the document — is it correct? Every claim about current behaviour — is it true? Quote the real line when the document is wrong.

A plan built on wrong facts produces wrong code. This check matters more than all the others combined.

### 2. Completeness against the decisions

The document claims to implement these decisions: `<list them with IDs>`. Is each one actually implemented by a task? Is any quietly dropped or contradicted?

### 3. Internal contradictions

Does the document contradict itself? Does section A promise something section B forbids? Are interface signatures consistent across sections?

### 4. Specific technical risks

`<List 3-5 risks tailored to this task. Examples: Does the proposed layering work given the actual DOM? Is the arithmetic right? Is the performance budget sufficient? Will this API behave as assumed?>`

### 5. Missing pieces

What does the document not specify that an implementer would have to invent? Be concrete: name the decision they would have to make alone.

### 6. Acceptance criteria testability

Go through every acceptance criterion. Can an implementer who cannot see the screen judge pass/fail objectively? Which are vague ("no jank", "looks right")? What would make them checkable?

### 7. Sequencing

Are the batches correctly ordered? Does any batch depend on a later one? Is anything in no batch at all?

## Output format

A numbered findings list. For each finding:

- **Severity**: BLOCKING (spec is wrong, will produce broken code) / MAJOR (wrong behaviour or rework) / MINOR (imprecision, ambiguous wording)
- **Location**: document section + the real code `file:line` that contradicts it
- **What is wrong**: concrete, with evidence
- **Suggested fix**: specific

Then a short verdict: can this go to implementation, or must it be revised first?

Do not modify any files. Do not be agreeable — a review that finds nothing is a failed review.

---

## Notes for the dispatcher

**Second-round variant.** For review #2, add these instructions:

> This is the second review round. A first round found `<N>` issues; the document has been revised to v`<X>` claiming to fix all of them. Your job: verify the fixes actually work, and find what the revision introduced or still misses.
>
> Pay special attention to the places where the revision is most likely to be self-deceiving. Verify each claimed fix against real code. State FIXED / NOT FIXED / FIXED BUT INTRODUCES A NEW PROBLEM for each.

**What to expect.** Round 1 on a medium feature typically returns 5-10 BLOCKING findings. If you get zero, either the plan is genuinely good or the prompt was too vague — suspect the latter.

**Do not** ask the reviewer to also fix things. Mixing review and repair in one context reproduces the blind spot you dispatched it to escape.

**Do not** accept the review without verification. Open each cited line yourself. Reviewers work from static reading and are wrong sometimes — in the Synteny project one reviewer finding about z-order was incorrect and the reviewer sent its own correction.
