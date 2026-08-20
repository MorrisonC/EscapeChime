#!/usr/bin/env bash
# Runs the exact test invocation TESTING.md Section 3 specifies, via the
# Editor binary resolved by unity-cli-bridge. Updates
# state/lane_a_status.yaml with per-class pass/fail so
# list_targets.py can gate Lane B targets on it.
#
# This intentionally mirrors .github/workflows/itch-deploy.yml's own
# test-then-deploy gate rather than inventing a separate test convention.
set -euo pipefail

SKILL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG="${SKILL_ROOT}/assets/config.yaml"
get_cfg () { yq -r ".$1" "$CONFIG"; }

PROJECT_PATH="$(get_cfg project_path)"
EDITMODE_RESULTS="$(get_cfg editmode_results)"
PLAYMODE_RESULTS="$(get_cfg playmode_results)"
LANE_A_STATUS="$(get_cfg lane_a_status_file)"
mkdir -p "$(dirname "$LANE_A_STATUS")"
mkdir -p ./logs

EDITOR_BIN="$(unity editors -i --format json | jq -r '.[0].path')"
if [[ -z "$EDITOR_BIN" || "$EDITOR_BIN" == "null" ]]; then
  echo "[run_unity_tests] No installed Editor found. See doctor.sh." >&2
  exit 1
fi

echo "[run_unity_tests] Running EditMode suite..."
"$EDITOR_BIN" -batchmode -projectPath "$PROJECT_PATH" \
  -runTests -testPlatform EditMode -testResults "$EDITMODE_RESULTS" \
  -logFile ./logs/editmode.log -quit || true   # exit code alone isn't reliable across UTF versions; parse XML

echo "[run_unity_tests] Running PlayMode suite..."
"$EDITOR_BIN" -batchmode -projectPath "$PROJECT_PATH" \
  -runTests -testPlatform PlayMode -testResults "$PLAYMODE_RESULTS" \
  -logFile ./logs/playmode.log -quit || true

echo "[run_unity_tests] Parsing results into ${LANE_A_STATUS}..."
python3 "${SKILL_ROOT}/scripts/parse_test_results.py" \
  --editmode "$EDITMODE_RESULTS" \
  --playmode "$PLAYMODE_RESULTS" \
  --out "$LANE_A_STATUS"

echo "[run_unity_tests] Done. See ${LANE_A_STATUS} for per-class status."
cat "$LANE_A_STATUS"
