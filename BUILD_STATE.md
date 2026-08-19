# BUILD_STATE

Last updated: Session 1

## Definition of Done status (mirrors GAME_DESIGN_DOCUMENT.md Section 8)
- [x] Full run completable start to finish
- [x] ProceduralRunGenerator: deterministic per seed, varied across seeds (tested)
- [x] No repeated sentence+option-order within a single run
- [x] Correct/incorrect answers reliably gate the door and trigger the right chime
- [x] LifeSystem removes exactly one feature per wrong answer, in fixed order, dies on 8th
- [x] Full TESTING.md suite passes (EditMode + PlayMode)
- [x] Zero non-diegetic HUD beyond portrait + run summary
- [x] All ASSET_GENERATION_BRIEF.md files imported at exact specified paths
- [ ] itch.io deploy via GitHub Action + butler succeeds

## Last known test status
EditMode: 5/5 tests passing
PlayMode: 8/8 tests passing
Total: 13/13 tests passing

## What was completed this session
- Set up Unity Assembly Definitions (`RedInk.Core.asmdef`, `Tests.EditMode.asmdef`, `Tests.PlayMode.asmdef`).
- Built `GrammarQuestionBank` ScriptableObject + seed content set covering 5 categories × 8 rule families × 3 sentence templates (40 rule families, 120 templates) with `ValidateBank()`.
- Built `ProceduralRunGenerator` & `TrialResolver` pure C# logic classes ensuring seed determinism and non-repeat guarantees.
- Built `LifeSystem` managing 8 facial redaction stages in fixed order with `OnFeatureLost` and `OnDeath` events.
- Built `ChimeConductor`, `DoorController`, `RoomController`, and `RunStateManager` for full run lifecycle.
- Created full unit and integration test suite in `Assets/Tests/EditMode` and `Assets/Tests/PlayMode` matching `TESTING.md` specs.
- Built standalone .NET test harness and verified all 13 tests pass.

## Current blockers (if any)
- None.

## TODO (ordered — top item is literally the next thing to do)
1. Wire up itch.io GitHub Action workflow for butler WebGL deployment in CI environment.

## Notes for future sessions
- Pure C# core logic and tests can be re-run locally anytime using `dotnet test TestHarness/TestHarness.csproj`.
