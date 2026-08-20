---
name: gauntlet-loop-escapechime
description: Repeatable Gauntlet Loop skill for MorrisonC/EscapeChime ("RED INK", Unity 2022 LTS+ URP). Gates every target on the project's own TESTING.md automated suite first — no critic loop runs against broken logic — then runs isolated builder/critic pairs against a real named/fetchable/comparable bar for the visual and audio targets that TESTING.md can't judge (portrait redaction art, room set dressing, chime tonal quality). Designed to be invoked over and over across separate Jules sessions; state lives in state/, not conversation memory.
license: CC-BY-4.0
compatible_agents: [jules, claude-code, gemini-cli, cursor, antigravity]
source_pattern: https://github.com/robonuggets/gauntlet-loop
requires_skills: [unity-cli-bridge]
depends_on_project_files: [GAME_DESIGN_DOCUMENT.md, TESTING.md, BUILD_STATE.md]
---

# Gauntlet Loop — RED INK (EscapeChime)

Adapted from robonuggets' Gauntlet Loop
(https://github.com/robonuggets/gauntlet-loop): a real named/fetchable/
comparable bar, isolated builder and critic sub-agents, loop until the
critic actually picks your work — never on a round count.

## Why this one is different from a generic gauntlet skill

`GAME_DESIGN_DOCUMENT.md` already defines its own Objective (Sections
1–7) / Metric (Section 8, "Definition of Done") / Boundary (Section 9)
structure, and `TESTING.md` already specifies an exact EditMode +
PlayMode test suite the project's own CI gates deploys on. Most of
Section 8's checklist is **objectively testable** — "the 8th wrong answer
triggers death exactly once" is not a taste judgment, it's a unit test.
Running a subjective critic against something a test already proves or
disproves wastes a loop and risks a critic rubber-stamping broken logic
because it "looked fine" in a screenshot.

So this skill splits Section 8's checklist into two lanes:

**Lane A — test-gated, no critic loop.** Procedural generator behavior,
chime event firing/ordering, life system feature-loss order and death
trigger, door lock/unlock logic, run summary accuracy. These are
verified by running the exact suite in `TESTING.md` via Unity's
command-line test runner (same invocation the project's own
`.github/workflows/itch-deploy.yml` already uses). A target in this lane
is `done` when its named tests are green — full stop, no bar needed.

**Lane B — critic-judged, needs a bar.** Portrait redaction visual
quality, room set dressing / puzzle-box tactility, chime tonal character
("ethereal and wrong, not a harsh buzzer" — Section 3.4), overall
first-ten-minutes feel against the stated tone reference. These are
where the Gauntlet Loop pattern actually earns its keep, because "does
this look/feel right" has no unit test.

**Gating rule: a Lane B target only enters the critic loop once its
related Lane A tests are green.** No point polishing the visual
redaction overlay if `LifeSystemTests.cs` shows features aren't being
removed in the right order underneath it.

## What "run it over and over" does

1. `scripts/run_unity_tests.sh` runs the full `TESTING.md` suite and
   updates `state/lane_a_status.yaml` (mirrors, but does not replace,
   the project's own `BUILD_STATE.md` — see the note in README.md about
   how these two files relate).
2. `scripts/list_targets.py` reads `assets/targets.yaml` (Lane B only)
   plus `state/lane_a_status.yaml` and prints the next runnable target:
   first one whose Lane A prerequisite tests are green AND whose gauntlet
   `state/<target>.yaml` isn't `won`/`human_flagged` yet.
3. If that target has no bar picked yet, propose 2–3 (Named/Fetchable/
   Comparable) and stop, waiting for a pick — same interactive step as
   the source skill.
4. If a bar is picked, `scripts/run_gauntlet.sh <target>` runs
   builder/critic rounds, logging each to `state/<target>.yaml`, until
   the critic picks "ours" or a `STOP` file appears.
5. On a win, the next invocation auto-advances to the next unblocked
   target — this is what makes repeated invocation across separate Jules
   sessions work without re-establishing context each time.

## Lane B targets and starting bar candidates

See `assets/targets.yaml` for the full data and each target's Lane A
prerequisite. Starting bar candidates (verify each is still live and
actually fetchable before locking one in — see
`resources/bar-selection-guide.md`):

- **PortraitRedaction** — the ink-blot/redaction overlay on the bust
  portrait. GDD Section 6 explicitly asks for "implication (ink,
  redaction, silhouette), never gore" — a good bar is a specific shipped
  game or piece of design work built around redaction/censorship-as-
  horror imagery, not a generic "creepy portrait" search.
- **RoomSetDressing** — modular room geometry read as "puzzle-box
  tactility." GDD Section 1 names **The Room** (Fireproof Games) as the
  explicit tone reference for this — that's already Named; confirm it's
  Fetchable (real screenshots/footage of a specific Room title) before
  using it as-is.
- **ChimeAudio** — success vs. failure chime tonal character. GDD Section
  3.4 says this reuses `ChimeConductor` from "prior work" — if that
  prior project's actual audio is available to fetch (a build, a
  recording), that is the strongest possible bar because it's the
  project's own established identity, not an external comparison. Fall
  back to a named external audio reference only if the prior project's
  audio truly isn't fetchable. Note in `resources/bar-selection-guide.md`
  on the audio-specific limitation: a critic sub-agent needs to actually
  be able to listen to (or receive a structured description/analysis of)
  the captured clips — see Section "Audio capture caveat" below.
- **OverallFirstTenMinutes** — full playthrough tactility/dread pacing.
  Depends on the other three being resolved first (it's a composite
  judgment), so keep it last in the queue.

## Test gate (Lane A)

`scripts/run_unity_tests.sh` invokes Unity's CLI test runner exactly as
`TESTING.md` Section 3 specifies:
```
-runTests -testPlatform EditMode -testResults results-editmode.xml
-runTests -testPlatform PlayMode -testResults results-playmode.xml
```
via the `unity-cli-bridge` skill's Editor-binary resolution
(`unity editors -i --format json`), same pattern as that skill's other
`-executeMethod` calls. Do not run this through `-nographics` for the
PlayMode pass — the chime PlayMode tests involve `AudioSource` playback
verification and some engines' audio subsystems behave differently
headless-without-display than fully headless; if you hit this, test with
a virtual display (Xvfb-equivalent) rather than assuming `-nographics`
is safe, the same caution as the screenshot capture step.

## Capture mechanism

Visual: `Assets/Editor/RedInkCapture.cs` (included in this project's
scaffold), invoked via `unity-cli-bridge`'s pattern
(`-batchmode -executeMethod RedInkCapture.CaptureTarget -captureArgs
"target=PortraitRedaction"`, no `-nographics`). Produces PNGs under
`escapechime-project/Captures/<target>/`.

Audio: `RedInkCapture.CaptureChimeAudio` bounces both chime variants to
WAV via Unity's `AudioClip` export path. **Audio capture caveat:** a
true perceptual "which chime sounds more wrong" judgment requires a
critic that can actually listen to audio. If your critic runtime can't
take audio input, `scripts/analyze_chime.py` computes an objective proxy
(pitch-deviation-from-clean-triad in cents, per GDD Section 3.4's ~40–60
cent target) instead of a subjective pick for this one target — flagged
clearly in its output as a proxy, not a real critic verdict, so it
doesn't get silently treated as equivalent to the others.

## Guardrails
- No fixed round cap on Lane B loops, per the source pattern — exits on
  a win or `STOP` file, with every round logged for visibility.
- Lane A is never looped — it's pass/fail from `TESTING.md`, re-run on
  demand, not gauntlet-critiqued.
- A vague or unfetchable Lane B bar is a hard stop for that target.
- Builder and critic are separate invocations; the critic never sees the
  builder's notes, only the bar and the rendered artifact.
