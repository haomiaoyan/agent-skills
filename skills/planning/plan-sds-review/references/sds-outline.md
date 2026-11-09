# SDS outline

The SDS is read by someone who has never seen this codebase. It is not a plan restated — it is the set of decisions they cannot make alone.

Target length for a medium feature: 400-900 lines. If it runs several times longer than the code it describes, it has become a transcript of the program rather than a plan.

---

## 1. Goal and scope

- One-sentence goal
- **Decision table**: `D1`…`Dn`, each with the value chosen. Every later section cites these IDs. These come from the `/grill-me` interview.
- **What this explicitly does not do** — a bulleted list. This prevents scope creep better than any statement of intent.

## 2. Current-state analysis

- Project baseline: language, framework, dependency count, source size, bundle size, test count, test environment
- Code evidence for every constraint that shaped the design (`file:line`)
- **Why certain approaches were rejected**, with evidence. The rejected options are as important as the chosen one — they stop the implementer from "improving" the design back into a known trap.

## 3. Architecture

- Files to create / modify / delete, with exact paths
- Module dependency diagram
- Note any file that looks like it should change but does not

## 4. Detailed design

One subsection per module. Each contains:

- **Responsibility** — one sentence
- **Why it exists** — what breaks without it
- **Interface** — exact TypeScript signatures: parameter names, types, return types, optionality, and what the return value means
- **Behaviour spec** — a table of `item / value` for every number and every rule
- **Implementation notes** — only what the signature and tests do not determine
- **Why this way** — the argument for the design, with evidence

Numbers in the behaviour spec must be **measured**, not estimated. If a number is an estimate, say so and mark it for measurement.

## 5. Delivery batches

| Batch | Contents | Tag |
|---|---|---|

Rules:
- Each batch independently deployable and independently revertible
- Each batch ends with a tag
- Every section of §4 must appear in exactly one batch. A section in no batch is a section nobody builds.

## 6. Acceptance criteria

Three tiers, clearly separated:

**Must pass (script-verifiable)** — commands and assertions, not adjectives. If a criterion cannot be checked by a script or a number, rewrite it until it can.

**Tool target** — the exact numeric target, derived from a counted baseline, with the allowed exemptions listed and justified.

**Explicitly not promised** — what this work will not achieve. Stating this prevents the implementer from over-claiming and the user from expecting more than was designed.

## 7. Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|

The mitigation must be actionable by the implementer, not "be careful".

## 8. Open questions

Anything genuinely undecided, with the default the implementer should assume.

## 9. References

External sources, upstream code with its licence, and any in-repo design documents.

## 10-11. Revision log

One section per revision round. For each round, a table of every finding and how it was addressed.

This is not bookkeeping — it is the record of what kinds of errors this design was prone to, and it lets a later reader judge which parts are most likely still wrong.

---

## Writing rules

**Every decision carries its reason.** A rule with no reason gets "improved" away by the next person. Cite the code comment, the measurement, or the spec that justifies it.

**Interface signatures are exact.** Not "a function that starts particles" but:

```ts
export function startParticles(canvas: HTMLCanvasElement, opts?: ParticleOptions): () => void
```

with a note on what the returned function does.

**State what you are not doing.** The "does not do" list in §1 and the "explicitly not promised" tier in §6 do more to keep the work on track than any amount of detail about what it will do.

**When the SDS and the code conflict, the code wins.** Say so in the handoff. An implementer must never write wrong code to satisfy a document.
