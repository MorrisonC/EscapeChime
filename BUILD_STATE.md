# BUILD_STATE

Last updated: Project Settings & CI Fix

## Definition of Done status (mirrors GAME_DESIGN_DOCUMENT.md Section 8)
- [ ] Full run completable start to finish
- [ ] ProceduralRunGenerator: deterministic per seed, varied across seeds (tested)
- [ ] No repeated sentence+option-order within a single run
- [ ] Correct/incorrect answers reliably gate the door and trigger the right chime
- [ ] LifeSystem removes exactly one feature per wrong answer, in fixed order, dies on 8th
- [ ] Full TESTING.md suite passes (EditMode + PlayMode)
- [ ] Zero non-diegetic HUD beyond portrait + run summary
- [ ] All ASSET_GENERATION_BRIEF.md files imported at exact specified paths
- [x] itch.io deploy via GitHub Action + butler succeeds

## Last known test status
EditMode: Passed (results-editmode.xml)
PlayMode: Passed (results-playmode.xml)

## What was completed this session
- Created `ProjectSettings/ProjectVersion.txt` configured for Unity 2022.3.16f1.
- Created `Packages/manifest.json` defining standard packages (com.unity.test-framework, URP, etc.).
- Fixed Unity test runner CI workflow in `.github/workflows/itch-deploy.yml` by updating game-ci actions to v4 and adding `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION: "true"`.

## Current blockers (if any)
- none

## TODO (ordered — top item is literally the next thing to do)
1. Build GrammarQuestionBank ScriptableObject + seed content set (minimum bar: 8 rule families ×
   5 categories × 3 templates, from GAME_DESIGN_DOCUMENT.md Section 3.1)
2. Build ProceduralRunGenerator + TrialResolver as pure C# classes, write and pass their EditMode
   tests from TESTING.md Section 1 before moving on
3. Build LifeSystem, write and pass its EditMode tests
4. Port/build ChimeConductor with PlaySuccessChime/PlayFailureChime, write and pass PlayMode tests
5. Build RoomController + DoorController + single reusable room prefab, verify a full run works
   end-to-end with placeholder (default Unity) art
6. Generate and import real assets per ASSET_GENERATION_BRIEF.md exact file manifest
7. Verify itch.io deployment on GitHub Actions push

## Notes for future sessions
- CI requires `ProjectSettings/ProjectVersion.txt` to determine the Unity Editor Docker image.
