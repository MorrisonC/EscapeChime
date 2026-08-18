# BUILD_STATE

Last updated: (not yet started — session 0)

## Definition of Done status (mirrors GAME_DESIGN_DOCUMENT.md Section 8)
- [ ] Full run completable start to finish
- [ ] ProceduralRunGenerator: deterministic per seed, varied across seeds (tested)
- [ ] No repeated sentence+option-order within a single run
- [ ] Correct/incorrect answers reliably gate the door and trigger the right chime
- [ ] LifeSystem removes exactly one feature per wrong answer, in fixed order, dies on 8th
- [ ] Full TESTING.md suite passes (EditMode + PlayMode)
- [ ] Zero non-diegetic HUD beyond portrait + run summary
- [ ] All ASSET_GENERATION_BRIEF.md files imported at exact specified paths
- [ ] itch.io deploy via GitHub Action + butler succeeds

## Last known test status
EditMode: not yet run
PlayMode: not yet run

## What was completed this session
- Nothing yet — this is the starting state before session one.

## Current blockers (if any)
- none

## TODO (ordered — top item is literally the next thing to do)
1. Set up Unity project skeleton (URP template, folder structure matching ASSET_GENERATION_BRIEF.md
   paths, Tests.EditMode/Tests.PlayMode asmdefs per TESTING.md)
2. Build GrammarQuestionBank ScriptableObject + seed content set (minimum bar: 8 rule families ×
   5 categories × 3 templates, from GAME_DESIGN_DOCUMENT.md Section 3.1)
3. Build ProceduralRunGenerator + TrialResolver as pure C# classes, write and pass their EditMode
   tests from TESTING.md Section 1 before moving on
4. Build LifeSystem, write and pass its EditMode tests
5. Port/build ChimeConductor with PlaySuccessChime/PlayFailureChime, write and pass PlayMode tests
6. Build RoomController + DoorController + single reusable room prefab, verify a full run works
   end-to-end with placeholder (default Unity) art
7. Generate and import real assets per ASSET_GENERATION_BRIEF.md exact file manifest
8. Wire up itch.io GitHub Action, verify a real deploy

## Notes for future sessions
- (none yet)
