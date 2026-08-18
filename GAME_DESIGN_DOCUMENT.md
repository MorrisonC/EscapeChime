# RED INK
### A procedural grammar-puzzle horror game with hangman stakes
### Unity 2022 LTS+ / URP — Design doc formatted for AI agentic build loops (Gauntlet Loop pattern)

---

## 0. HOW TO USE THIS DOCUMENT

This is the seed document for an AI build agent (Claude Code, Codex, etc.). It pairs with three
companion files in this same repo:

- `ASSET_GENERATION_BRIEF.md` — every art/audio asset, with **exact file names** to generate and
  import
- `TESTING.md` — the unit/playmode test suite the build must pass
- `CONTINUE_BUILD_PROMPT.md` — the prompt you re-paste every session to resume the loop
  (keeps an AI agent's work continuous across sessions since it has no persistent memory of its
  own between calls)

Read Section 8 ("Definition of Done") as the **Metric**, Section 9 as the **Boundary**, and
everything before it as the **Objective**, per Gauntlet Loop structure. Section 10 is the kickoff
prompt for session one; after that, use `CONTINUE_BUILD_PROMPT.md` every time you come back.

**REFERENCE_IMAGE**: same convention as before — drop a reference image into the agent's context
and every `[STYLE]` tag in the asset brief should be replaced with a style summary extracted from
it before generating art.

---

## 1. HIGH CONCEPT

**Working title:** *RED INK*

A first-person procedural gauntlet. You wake in a corridor of locked doors — an editorial
purgatory. Behind each door is a single grammar trial: a sentence with a blank, and a choice of
words to fill it (*your* vs *you're*, *there* vs *their* vs *they're*, *its* vs *it's*, and so on).
Answer correctly, the door opens with a clean three-note chime — **G, E, C** — and you move to the
next room. Answer wrong, and the same chime plays back **detuned and wrong**, and you lose a piece
of your face.

You have a face. It's rendered, right there in the room, in a mirror or portrait frame. Every
mistake, red ink spreads across it — an ear, an eyebrow, your nose, an eye — until there's nothing
left to lose. The corridor is never the same layout, and the questions are never in the same
order twice: this is meant to be replayed.

- **Genre:** Procedural puzzle horror / trivia-gauntlet hybrid
- **Perspective:** First-person, single corridor of sequential rooms
- **Session length:** 10–25 minutes per run, designed for repeat runs
- **Tone reference:** *The Room* (puzzle-box tactility) × classic hangman dread × an oral exam you
  can't leave until you pass
- **Platform:** PC (Unity URP), deployed to itch.io

---

## 2. THE THREE PILLARS

1. **Every run is a different exam.** No two playthroughs present the same question sequence, the
   same phrasing, or the same wrong-answer set. Procedural generation is not a bonus feature —
   it's graded in the Definition of Done (Section 8).
2. **The chime is the verdict, not a sound effect.** Reuse the G-E-C motif from prior work as the
   universal "you were judged" signal: clean triad = correct, corrupted triad = wrong. The player
   should be able to close their eyes and know which just happened.
3. **The horror is in what you lose, not what chases you.** No entity, no chase, no jump-scare
   monster. The dread is entirely the slow, visual erosion of your own face and the countdown to
   having none left. Keep it restrained — this is body-horror through implication (ink, redaction,
   silhouette), never gore.

---

## 3. THE GRAMMAR TRIAL SYSTEM (core mechanic — build this first)

### 3.1 Question data model

```
GrammarQuestion {
  id: string
  category: enum { Homophones, Apostrophes, SubjectVerbAgreement, CommonlyConfused, Punctuation }
  sentenceTemplates: string[]   // 2–4 phrasings of the SAME rule, "{blank}" marks the gap
  correctAnswer: string
  distractors: string[]         // 2–3 wrong options, same rule family (its/it's, not its/dog)
  difficulty: int (1–3)
}
```

Seed content categories and example rule families (expand freely — more variety = better replay):

| Category | Example rule families |
|---|---|
| Homophones | your/you're · there/their/they're · to/too/two · whose/who's · its/it's |
| Commonly confused | affect/effect · then/than · accept/except · lose/loose · further/farther |
| Apostrophes | possessive vs. plural (dog's/dogs) · contractions vs. possessive pronouns |
| Subject-verb agreement | is/are, was/were, has/have with tricky collective/compound subjects |
| Punctuation | comma splices, its own mini rule-set: which of 3 punctuated versions is correct |

Minimum content bar: **at least 8 rule families per category, 3 sentence templates per rule
family, 2–3 distractors per question** — this gives the procedural generator enough of a pool to
avoid visible repeats across runs (see 3.3 for the exact non-repeat guarantee).

### 3.2 Room / trial flow

1. Player enters room → door behind them seals (no backtracking) → question renders on a wall
   plaque/terminal, diegetically (a typewriter-style reveal, not a UI popup)
2. Player selects an answer (world-space interactable buttons/levers, not a screen-space menu —
   keep the diegetic-everything feel from the chime game if you want visual/tonal continuity)
3. **Correct** → clean ascending G→E→C chime plays, door unlocks and swings open, brief warm light
   pulse, room count increments
4. **Incorrect** → corrupted/detuned chime plays (see 3.4), door stays locked, one facial feature
   is redacted (Section 4), a short "wrong" tell plays (portrait glass cracks slightly, red ink
   drips), then the SAME room re-presents a **different sentence from the same or a related rule
   family** (never the identical question twice in a row) so the player isn't stonewalled — they
   must keep answering until they get one right or run out of lives
5. Run ends when either: player reaches the final door (**win**) or loses their last facial
   feature (**death**)

### 3.3 Procedural generation — the non-repeat guarantee

- `RunSeed` = a fresh random seed (or timestamp+GUID) generated at the start of every run, logged
  for debugging/tests
- `ProceduralRunGenerator` builds the room order by: shuffling the full question pool with the
  seed, drawing N unique rule families for a run (N configurable, default 10–14 rooms), and for
  each room drawing one of its sentence template + option-order permutations
- **Guarantee to build and test for:** no single rule family's exact sentence+option combination
  should repeat within one run, and the room ORDER of rule families should differ across runs with
  different seeds with extremely high probability (verified in `TESTING.md` via a statistical
  test, not a hard proof)
- Same seed → same run, always (deterministic) — this is required for QA and for the automated
  tests, and is a nice secret-speedrun/seed-sharing feature for players later

### 3.4 The chime, success vs. failure (reuses prior ChimeConductor architecture)

| Outcome | Notes played | Treatment |
|---|---|---|
| **Correct** | G4 → E4 → C4, clean | Same rendering as the original chime game: real bell/vibraphone timbre, natural decay, warm room reverb, in tune |
| **Incorrect** | G4 → E4 → C4, corrupted | Same three notes, but pitch-bent flat by ~40–60 cents progressively through the phrase, a slight backward-reverb "pre-tail" before each note (makes it feel like it's arriving from the wrong direction in time), and a faint high-frequency ring-mod shimmer — **ethereal and wrong, not a harsh buzzer** |

Implementation: same `ChimeConductor` singleton pattern as before —
`PlaySuccessChime()` / `PlayFailureChime()` both drive the same three-note event timeline so all
downstream systems (lighting pulses, door animation triggers) can hook into `OnNoteEntered` /
`OnNoteExited` regardless of which variant is playing.

---

## 4. THE LIFE SYSTEM — FACIAL REDACTION (the "hangman")

Eight stages, in fixed order, before death — chosen to escalate readably at a glance:

1. Left ear
2. Right ear
3. Left eyebrow
4. Right eyebrow
5. Nose
6. Left eye
7. Right eye
8. Mouth → **this is the death stage**: with the mouth redacted, the portrait is fully covered,
   run ends, death screen

- Rendered as a single **portrait bust** (Section on assets) with **layered redaction overlays** —
  each wrong answer fades in one ink-blot/redaction-bar overlay over the corresponding feature.
  Build this as a stack of UI `Image` components (or world-space `SpriteRenderer`s if the portrait
  lives on a physical in-room mirror/frame prop) so features can be toggled independently.
- No numeric health bar. The portrait IS the health bar — diegetic, consistent with the philosophy
  of the first game in this series.
- Optional (cut-first if scope tight): the redaction ink very slightly seeps into subsequent
  rooms' visuals — a wall stain, a drip — so returning players feel cumulative dread even without
  a HUD.

---

## 5. WIN / LOSE STATES

- **Win — "Discharged":** player answers correctly through all N rooms in the run and reaches the
  final door, which opens onto plain daylight/an exit — deliberately anticlimactic, a relief not a
  fanfare, consistent with restrained horror tone
- **Lose — "Fully Redacted":** eighth wrong answer covers the mouth, screen fades through red ink
  to black, a single corrupted chime plays one last time, run summary shown (rooms cleared,
  mistakes made, seed, so the player can share/retry the exact seed)
- Both states route to a **run summary screen** showing seed, rooms cleared, accuracy, and a
  "new run" button that generates a fresh seed — this is the replay loop, make sure it's frictionless

---

## 6. ART & AUDIO DIRECTION (summary — exact file list in `ASSET_GENERATION_BRIEF.md`)

- Palette/style: derive from REFERENCE_IMAGE as before. Default assumption if none supplied: muted
  institutional tones (cream, oxblood red, aged paper), single warm light source per room, the red
  ink as the ONE saturated color allowed to pop against an otherwise desaturated palette
- The portrait/bust should read as a plain, generic bust (not a specific rendered "player
  character") — universal and a little uncanny, like an old formal photograph or a wax death mask
- Rooms should feel modular/reusable (same base geometry, swapped dressing) — this is a budget and
  procedural-generation-friendliness requirement, not just an art note: the SAME room prefab needs
  to work for any question, so keep room geometry question-agnostic and let only the
  plaque/terminal text and portrait state change

---

## 7. UNITY ARCHITECTURE SUMMARY

- `ChimeConductor` — reused/ported from the prior project, extended with `PlaySuccessChime()` /
  `PlayFailureChime()`
- `GrammarQuestionBank` (ScriptableObject) — holds the full `GrammarQuestion[]` pool, validated by
  a custom Editor inspector button ("Validate Bank") that checks for null fields, correct answer
  present in its own distractor set (i.e., not accidentally duplicated), and minimum
  template/distractor counts per rule family
- `ProceduralRunGenerator` — pure C# class (no MonoBehaviour dependency so it's directly unit
  testable), takes `(QuestionBank, seed, roomCount)` → returns an ordered `Room[]` plan
- `RoomController` — spawns a room's question UI/props, listens for the answer event, calls into
  `TrialResolver`
- `TrialResolver` — pure logic class: given a submitted answer and the current `GrammarQuestion`,
  returns `Correct`/`Incorrect` and, on incorrect, the next question to re-present (same rule
  family, different template) — also pure/testable, no MonoBehaviour
- `LifeSystem` — tracks the ordered feature-loss stack (Section 4), exposes `OnFeatureLost`,
  `OnDeath` events
- `DoorController` — subscribes to trial outcome, plays unlock/reject animation + calls
  `ChimeConductor`
- `RunStateManager` — owns current seed, room index, lives remaining, accuracy stats; produces the
  run summary payload

---

## 8. DEFINITION OF DONE (the "Metric")

- [ ] A full run is completable start to finish: enter corridor → answer N rooms → win or die
- [ ] `ProceduralRunGenerator` produces a different room/question order for at least 20 different
      random seeds in a batch test, and an IDENTICAL order when re-run with the same seed
      (deterministic reproducibility — tested in `TESTING.md`)
- [ ] No single room ever shows the exact same sentence+option-order twice within one run, even
      after multiple wrong answers on the same rule family
- [ ] Correct answers always play the clean chime and unlock the door; incorrect answers always
      play the corrupted chime and never unlock the door — 100% reliable, tested via forced
      correct/incorrect PlayMode test sequences
- [ ] `LifeSystem` removes exactly one feature per wrong answer, in the fixed order from Section 4,
      and triggers death exactly on the 8th
- [ ] Full test suite in `TESTING.md` passes (both EditMode and PlayMode)
- [ ] Zero non-diegetic HUD elements beyond the portrait itself and the run-summary screen
- [ ] All assets from `ASSET_GENERATION_BRIEF.md`'s manifest are imported under their exact
      specified file names/paths (no default Unity primitive materials in any shipped screenshot)
- [ ] Project builds clean for itch.io (WebGL or Windows/Mac/Linux — decide per Section 9) and the
      GitHub Action in `.github/workflows/itch-deploy.yml` successfully pushes a build via butler

---

## 9. SCOPE BOUNDARY

- **In scope:** Sections 3–8, minimum content bar from Section 3.1 (8 rule families × 5
  categories × 3 templates)
- **Target build platform:** default to **WebGL** for the itch.io deploy (fastest to test/share,
  no install friction) — fall back to Windows standalone only if WebGL hits a hard technical
  blocker (e.g. a required package incompatibility), and note the fallback in `BUILD_STATE.md` if
  it happens
- **Cut first if over budget, in this order:** (1) ink-seeps-into-later-rooms cumulative dread
  detail, (2) more than 5 question categories — ship with fewer categories at full depth rather
  than many categories shallow, (3) world-space diegetic answer props → fall back to a clean
  screen-space UI panel styled to match the art direction, (4) run-summary sharing/seed-copy
  polish
- **Never cut:** the non-repeat procedural guarantee (3.3) and the success/failure chime distinction
  (3.4) — these are the whole identity of the game, same principle as "never cut ChimeConductor" in
  the prior project
- **Stop condition:** Section 8 checklist 100% green, or budget exhausted — report status against
  every line either way, same as before

---

## 10. GAUNTLET LOOP KICKOFF PROMPT (session one — paste this to your build agent)

```
You are building the Unity game "RED INK" defined in GAME_DESIGN_DOCUMENT.md, with companion
files ASSET_GENERATION_BRIEF.md (exact asset manifest + generation prompts), TESTING.md (required
test suite), and .github/workflows/itch-deploy.yml (CI deploy target). Use REFERENCE_IMAGE
(attached, if provided) as the source of truth for art style.

OBJECTIVE: Produce a playable Unity build satisfying every checkbox in Section 8 of
GAME_DESIGN_DOCUMENT.md ("Definition of Done"), deployable to itch.io via the provided GitHub
Action.

METRIC: Run the full TESTING.md suite after each build pass. Additionally self-critique by
generating 3 full playthroughs with different seeds, logging room order/questions for each, and
confirming no repeats per the 3.3 non-repeat guarantee.

PROCESS:
1. Build core logic FIRST, with no art dependency: GrammarQuestionBank (with a seed content set
   covering the minimum bar), ProceduralRunGenerator, TrialResolver, LifeSystem — all as pure/
   testable C# classes per Section 7. Write and pass the EditMode tests in TESTING.md for these
   before touching any scene/UI work.
2. Then build ChimeConductor (ported/adapted from prior project pattern) with success/failure
   variants, and verify against the PlayMode tests in TESTING.md.
3. Then build RoomController + DoorController + a single reusable room prefab, wire to the logic
   layer, verify a full run is completable with placeholder art.
4. Only then pull in real assets per ASSET_GENERATION_BRIEF.md's exact file manifest.
5. Set up and verify the GitHub Action deploy to itch.io (Section 9 default: WebGL target).
6. At the end of THIS session, write/update BUILD_STATE.md (see CONTINUE_BUILD_PROMPT.md for its
   required format) so the next session can resume without re-reading your whole chat history.

Respect the Section 9 scope boundary and cut order if short on budget. Never cut the procedural
non-repeat guarantee or the success/failure chime distinction. Stop when Section 8 is 100% green
or budget is exhausted, and report final status against every line either way.
```
