# RED INK — Test Suite
### Unity Test Framework (com.unity.test-framework) — EditMode + PlayMode

This is a required deliverable, not optional polish — Section 8 of `GAME_DESIGN_DOCUMENT.md` will
not be marked complete until every test below exists and passes. Put EditMode tests under
`Assets/Tests/EditMode/` and PlayMode tests under `Assets/Tests/PlayMode/`, each in their own
assembly definition (`Tests.EditMode.asmdef`, `Tests.PlayMode.asmdef`) referencing
`UnityEngine.TestRunner` and `UnityEditor.TestRunner` per standard UTF setup.

---

## 1. EDITMODE TESTS (pure logic — no scene, no MonoBehaviour required)

### `ProceduralRunGeneratorTests.cs`

- `SameSeed_ProducesIdenticalRoomOrder` — generate a run twice with the same seed and room count,
  assert the resulting `Room[]` sequences are element-for-element identical
- `DifferentSeeds_ProduceDifferentRoomOrder` — generate runs across 20 distinct random seeds,
  assert that no two runs produce an identical full sequence (statistical, not absolute — flag if
  any pair matches, since with a small pool it's theoretically possible but should be rare given
  the minimum content bar from GDD Section 3.1)
- `NoDuplicateRuleFamilyWithinSingleRun` — for a generated run, assert no rule family/question ID
  appears twice in the initial room plan
- `RequestedRoomCount_MatchesGeneratedCount` — assert the generator returns exactly N rooms when
  asked for N, and fails gracefully (clear exception or fallback, not silent truncation) if N
  exceeds the available unique rule family pool
- `EveryGeneratedRoom_HasValidQuestionData` — assert every room's `GrammarQuestion` has a non-null
  correct answer, non-empty distractor list, and a sentence template containing the `{blank}` token

### `TrialResolverTests.cs`

- `CorrectAnswer_ReturnsCorrectOutcome` — submit the known-correct answer for a fixed question,
  assert outcome == Correct
- `IncorrectAnswer_ReturnsIncorrectOutcome` — submit any distractor, assert outcome == Incorrect
- `AfterIncorrectAnswer_NextQuestionIsSameRuleFamilyDifferentTemplate` — assert the follow-up
  question shares the rule family but not the exact template/option-order of the one just failed
- `AfterIncorrectAnswer_NeverRepeatsIdenticalQuestionConsecutively` — loop through several forced
  wrong answers in a row, assert no two consecutive presentations are identical

### `LifeSystemTests.cs`

- `WrongAnswer_RemovesExactlyOneFeature` — assert feature count decreases by exactly 1 per call
- `FeaturesAreLostInFixedOrder` — assert the order matches GDD Section 4 exactly (left ear → right
  ear → left eyebrow → right eyebrow → nose → left eye → right eye → mouth)
- `EighthWrongAnswer_TriggersDeath` — assert `OnDeath` fires exactly once, exactly on the 8th call,
  never earlier
- `CorrectAnswer_NeverRemovesAFeature` — assert feature count is unchanged after a Correct outcome

### `GrammarQuestionBankValidationTests.cs`

- `EveryQuestion_HasNonNullCorrectAnswer`
- `EveryQuestion_CorrectAnswerIsNotAlsoListedAsDistractor` — catches copy-paste data bugs
- `EveryRuleFamily_HasAtLeastMinimumTemplateCount` — enforce the "3 templates per rule family"
  minimum from GDD Section 3.1
- `EveryCategory_HasAtLeastMinimumRuleFamilyCount` — enforce the "8 rule families per category"
  minimum
- `NoDuplicateQuestionIDsInBank`

---

## 2. PLAYMODE TESTS (scene-driven — require a test scene with the core prefabs)

### `ChimeConductorPlayModeTests.cs`

- `PlaySuccessChime_FiresThreeNoteEventsInOrder` — subscribe to `OnNoteEntered`, call
  `PlaySuccessChime()`, assert events fire in order G→E→C with expected timing tolerance
  (±50ms) via `yield return` frame waits
- `PlayFailureChime_FiresThreeNoteEventsInOrder` — same assertion for the failure variant
- `SuccessAndFailureChimes_UseDistinctAudioClips` — assert the `AudioSource.clip` differs between
  the two calls (catches an easy copy-paste bug where failure accidentally plays the success clip)

### `DoorControllerPlayModeTests.cs`

- `CorrectAnswerSubmitted_DoorUnlocksAndOpens` — simulate a correct answer event, wait a few
  frames, assert the door's locked-state bool flips false and its open animation/state is active
- `IncorrectAnswerSubmitted_DoorRemainsLocked` — simulate an incorrect answer, assert locked state
  is unchanged
- `DoorUnlock_TriggersChimeConductorSuccessCall` — spy/mock on `ChimeConductor`, assert
  `PlaySuccessChime()` was called exactly once per unlock, never on a failed attempt

### `FullRunIntegrationTests.cs`

- `AllCorrectAnswers_CompletesRunAsWin` — drive a full simulated run answering every question
  correctly, assert the run ends in the Win state and `RunStateManager` reports 0 features lost
- `EightConsecutiveWrongAnswers_EndsRunAsDeath` — drive 8 forced-wrong answers (can be against
  different rooms/questions), assert the run ends in the Death state exactly on the 8th, and that
  gameplay is not able to continue past it
- `RunSummaryPayload_ReportsAccurateStats` — after a mixed-outcome run (some right, some wrong),
  assert the summary payload's rooms-cleared/mistakes/seed values match what actually happened
  during the simulated run

---

## 3. TEST EXECUTION IN CI

The GitHub Action (`.github/workflows/itch-deploy.yml`) should run this full suite via Unity's
command-line test runner BEFORE attempting a butler deploy, and abort the deploy if any test
fails:

```
-runTests -testPlatform EditMode -testResults results-editmode.xml
-runTests -testPlatform PlayMode -testResults results-playmode.xml
```

See the workflow file for the exact job step — deploy is gated on both test jobs succeeding.
