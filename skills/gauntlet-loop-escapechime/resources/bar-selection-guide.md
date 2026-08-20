# Bar Selection Guide — RED INK

Same three checks as the source pattern
(https://github.com/robonuggets/gauntlet-loop): every bar must be
**Named**, **Fetchable**, and **Comparable**. A vague bar is the single
most common way this pattern fails — the critic invents a comparison and
approves everything.

## Target-specific guidance

**PortraitRedaction** — GDD Section 6 explicitly wants restrained
"implication (ink, redaction, silhouette), never gore." A bar that's
just "a scary portrait" isn't Named. Look for a specific shipped game or
piece of visual design built around censorship/redaction as horror
imagery, with actual fetchable screenshots. If the critic ever picks a
gorier, more literal treatment as "better," that's a fail against the
GDD's own stated intent even if it wins the blind comparison — flag this
conflict rather than silently accepting the critic's pick (see "When the
critic and the GDD disagree" below).

**RoomSetDressing** — the GDD already names a bar: *The Room* (Fireproof
Games). This is a good starting point but "The Room" as a franchise name
isn't specific enough on its own — pick one actual title in the series
and confirm you can fetch real screenshots or footage of it before
locking it in.

**ChimeAudio** — prefer the prior project's own `ChimeConductor` audio
over an external comparison, since GDD 3.4 describes this as reused/
ported, not new. This makes it an internal-continuity bar, not an
external one — still needs to be genuinely fetchable (an actual audio
file or recording), not just remembered/described. If unavailable, name
a specific external audio reference and say so honestly rather than
skip the bar-selection step. See SKILL.md's audio capture caveat for
what happens if your critic runtime can't listen to it either way.

**OverallFirstTenMinutes** — run this one last (see `targets.yaml`'s
notes). A composite pacing/dread bar is harder to source than a single
visual — a specific let's-play or review of a comparable
horror-adjacent puzzle game's opening segment is a reasonable target,
timestamped to the relevant section rather than "the whole video."

## When the critic and the GDD disagree

Occasionally a blind comparison might favor something that technically
"wins" but violates an explicit constraint the GDD states (e.g., a
redaction treatment that reads as more polished but drifts toward gore).
When that happens: don't silently accept the critic's pick. Note the
conflict in `state/<target>.yaml` under a `flag` field and surface it —
the GDD's explicit intent is a boundary the loop shouldn't be allowed to
optimize past, even toward a "better" blind-comparison result.

## Proposal format
Same as the other skills in this family:
```
Target: PortraitRedaction

1. [Named work] — https://example.com/reference
   Why: closest match on restrained implication-over-gore treatment.

2. [Named work] — https://example.com/reference
   Why: different medium but the clearest example of redaction-as-dread
   without literal violence.
```
Wait for a pick. Write only the picked bar into `state/<target>.yaml`.
