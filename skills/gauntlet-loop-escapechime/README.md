# gauntlet-loop-escapechime

A repeatable Gauntlet Loop for [MorrisonC/EscapeChime](https://github.com/MorrisonC/EscapeChime)
("RED INK", Unity 2022 LTS+ URP), following
[robonuggets/gauntlet-loop](https://github.com/robonuggets/gauntlet-loop)'s
pattern — but split into two lanes, because this project's own
`GAME_DESIGN_DOCUMENT.md` and `TESTING.md` already define objective
pass/fail tests for most of its Definition of Done:

- **Lane A** (procedural generation, chime event firing, life system,
  door logic, run summary accuracy) is verified by running the exact
  `TESTING.md` suite — no critic loop, it's pass/fail from tests.
- **Lane B** (portrait redaction art, room set dressing / puzzle-box
  tactility, chime *tonal* quality, overall pacing) is where the actual
  Gauntlet Loop runs: named/fetchable/comparable bar, isolated builder
  and critic sub-agents, loop until the critic picks "ours."

A Lane B target is gated on its Lane A prerequisite tests passing first
— no point critiquing a screenshot of logic that's still broken
underneath it.

Packaged per the [Agent Skills structure](https://github.com/google-labs-code/jules-skills),
same as the other gauntlet skills in this family, and depends on the
`unity-cli-bridge` skill for Editor resolution.

## Install
```bash
npx skills add <this-repo> --skill gauntlet-loop-escapechime --global
npx skills add <this-repo> --skill unity-cli-bridge --global
```

## Relationship to this project's own BUILD_STATE.md

`GAME_DESIGN_DOCUMENT.md` Section 0 says the project already uses
`BUILD_STATE.md` + a `CONTINUE_BUILD_PROMPT.md` convention to resume the
*build-to-Definition-of-Done* loop across sessions. This skill's own
`state/` directory is a separate, narrower log — round-by-round gauntlet
history for Lane B polish targets specifically — and doesn't replace or
write to `BUILD_STATE.md`. Think of it as: `BUILD_STATE.md` tracks "is
the game built," this skill's `state/` tracks "has the polish loop won
against a real bar yet" for the handful of targets that need a critic
rather than a test.

## Quick start
```bash
bash scripts/doctor.sh
bash scripts/run_unity_tests.sh          # Lane A gate — run this first
python3 scripts/list_targets.py          # see what's runnable
# ... propose bars for the next target, get one picked ...
# write it into state/<target>.yaml (see the .example files in state/)
bash scripts/run_gauntlet.sh RoomSetDressing
```

## Wiring to your agent runtime
`scripts/run_gauntlet.sh` has `invoke_builder`/`invoke_critic` hooks
marked `TODO`, same pattern as the other skills in this family — wire
them to a fresh Jules session/task per round.

## Honest caveats
- `RedInkCapture.cs`'s `CaptureChimeAudio` and the `LifeSystem`/
  `ProceduralRunGenerator` API calls inside the other capture methods
  are stubbed pending the project's actual component APIs (Lane A's own
  tests are the source of truth for those signatures) — wire them once
  those classes exist.
- The `ChimeAudio` target's objective pitch-deviation proxy
  (`analyze_chime.py`) is explicitly NOT a substitute for a real
  perceptual critic pick — see `resources/critic-instructions.md`.
