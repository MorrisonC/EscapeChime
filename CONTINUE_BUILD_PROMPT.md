# RED INK — Continuation Prompt for AI Build Agents

Paste this prompt when starting or resuming any build session for RED INK.

---

## PROMPT TO PASTE

```
You are resuming the build loop for "RED INK", a procedural grammar-puzzle horror Unity game.

1. FIRST: Read BUILD_STATE.md to review the current status, Definition of Done progress, and the ordered TODO list.
2. SECOND: Read GAME_DESIGN_DOCUMENT.md, ASSET_GENERATION_BRIEF.md, and TESTING.md as needed for specifications.
3. THIRD: Run pure C# unit tests using `dotnet test TestHarness/TestHarness.csproj` to confirm system baseline health.
4. FOURTH: Pick the top unfinished item in BUILD_STATE.md and implement/verify it.
5. FIFTH: Run the full test suite and confirm all EditMode and PlayMode tests pass.
6. FINALLY: Update BUILD_STATE.md with the latest status, completed items, and remaining TODOs before concluding your session.
```
