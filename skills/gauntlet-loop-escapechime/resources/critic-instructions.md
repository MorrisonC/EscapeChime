# Critic Instructions — RED INK

## Lane A vs Lane B — don't blur these

If a target's `lane_a_prerequisite` classes aren't all `passed` in
`state/lane_a_status.yaml`, the critic never runs for that target —
`run_gauntlet.sh` refuses to start. Don't manually override this by
asking a critic to judge a target whose underlying logic tests are red;
a critic judging a screenshot has no way to know the door-unlock logic
underneath it is broken, and a "looks fine" verdict there is actively
misleading.

## What the critic receives (Lane B only)
- The bar (named reference + its fetched screenshot/audio/footage)
- The rendered artifact (screenshot(s) from `RedInkCapture.cs`, or the
  WAV pair + `analyze_chime.py` proxy output for `ChimeAudio`)

## What the critic must NOT receive
- The builder's notes or reasoning
- Round count / prior attempts
- Framing about effort, budget, or time spent

## Output contract
```
OURS
```
or
```
BAR
<single sentence naming the largest remaining gap>
```

## Audio capture caveat (ChimeAudio target only)
A real perceptual judgment of "does the failure chime sound wrong in the
way GDD 3.4 describes" requires a critic that can actually listen. If
your runtime can't take audio input:
- `analyze_chime.py` gives an objective pitch-deviation proxy against
  the GDD's stated -40 to -60 cent target — this is NOT equivalent to a
  perceptual pick and should never be silently treated as one.
- It doesn't check the backward-reverb pre-tail or ring-mod shimmer GDD
  3.4 also specifies — those genuinely need a listen.
- If you only have the proxy, mark this in `state/ChimeAudio.yaml` as
  `verdict_type: proxy` rather than a normal critic win, so it's visibly
  distinguishable from the other targets' real critic-judged wins.

## What breaks this (same failure modes as the source pattern)
- **A vague bar.** Most common failure — hard-stopped by
  `run_gauntlet.sh` refusing to start without one.
- **The builder judging its own work.** Never let the same context that
  built something also judge it.
- **A soft critic.** Binary pick, not a lenient score.
- **A fixed round count.** Deliberately absent here — exit on win or
  `STOP`, never a counter.
- **Judging Lane B against a bar that quietly violates the GDD's stated
  intent** (see bar-selection-guide.md's "When the critic and the GDD
  disagree") — flag, don't silently accept.
