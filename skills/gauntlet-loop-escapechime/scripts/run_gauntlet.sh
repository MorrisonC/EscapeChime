#!/usr/bin/env bash
# Usage: run_gauntlet.sh <target_id>
set -euo pipefail

TARGET="${1:?Usage: run_gauntlet.sh <target_id>}"
SKILL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

STATE_DIR="${SKILL_ROOT}/state"
STOP_FILE="${SKILL_ROOT}/STOP"
LANE_A_STATUS="${SKILL_ROOT}/state/lane_a_status.yaml"
STATE_FILE="${STATE_DIR}/${TARGET}.yaml"
mkdir -p "$STATE_DIR"

PREREQS="$(python3 -c "import yaml; data=yaml.safe_load(open('${SKILL_ROOT}/assets/targets.yaml')); t=[x for x in data['targets'] if x['id']=='${TARGET}'][0]; print('\n'.join(t['lane_a_prerequisite']))")"

if [[ -z "$PREREQS" ]]; then
  echo "[run_gauntlet] Unknown target '$TARGET'." >&2
  exit 1
fi

while IFS= read -r cls; do
  status="$(python3 -c "import yaml; data=yaml.safe_load(open('$LANE_A_STATUS')); print(data.get('classes', {}).get('$cls', 'unknown'))")"
  if [[ "$status" != "passed" ]]; then
    echo "[run_gauntlet] BLOCKED: $TARGET requires $cls to pass Lane A tests (currently: $status)." >&2
    exit 1
  fi
done <<< "$PREREQS"
echo "[run_gauntlet] Lane A gate clear for $TARGET."

if [[ ! -f "$STATE_FILE" ]]; then
  echo "[run_gauntlet] No state file for $TARGET yet." >&2
  exit 1
fi

BAR="$(python3 -c "import yaml; data=yaml.safe_load(open('$STATE_FILE')); print(data.get('bar', ''))")"
if [[ -z "$BAR" ]]; then
  echo "[run_gauntlet] $STATE_FILE has no 'bar' set." >&2
  exit 1
fi

CAPTURE_METHOD="$(python3 -c "import yaml; data=yaml.safe_load(open('${SKILL_ROOT}/assets/targets.yaml')); t=[x for x in data['targets'] if x['id']=='${TARGET}'][0]; print(t['capture_method'])")"

invoke_builder () {
  local target="$1" bar="$2" gap="$3"
  echo "[builder] $target — bar: $bar"
  bash "${SKILL_ROOT}/scripts/capture_target.sh" "$target"
}

invoke_critic () {
  local target="$1" bar="$2" capture_method="$3"
  local capture_dir="./Captures/${target}"
  mkdir -p "$capture_dir"
  echo "[critic] $target — judging blind against: $bar (method: $capture_method)"

  if [[ "$capture_method" == "audio" ]]; then
    python3 "${SKILL_ROOT}/scripts/analyze_chime.py" \
        --success "${capture_dir}/success_chime.wav" \
        --failure "${capture_dir}/failure_chime.wav" > "${capture_dir}/verdict.txt" 2>&1
    if grep -q "PROXY RESULT: within GDD 3.4's stated -40 to -60 cent target range." "${capture_dir}/verdict.txt"; then
      echo "OURS" > "${capture_dir}/verdict.txt"
    else
      echo "BAR" > "${capture_dir}/verdict.txt"
      echo "Failure chime pitch deviation is outside the target -40 to -60 cents range." >> "${capture_dir}/verdict.txt"
    fi
  else
    python3 "${SKILL_ROOT}/scripts/evaluate_visual.py" "$capture_dir" > "${capture_dir}/verdict.txt"
  fi
}

echo "[run_gauntlet] Starting/resuming $TARGET against bar: $BAR"

ROUND="$(python3 -c "import yaml; data=yaml.safe_load(open('$STATE_FILE')); print(data.get('rounds', 0))")"
GAP="$(python3 -c "import yaml; data=yaml.safe_load(open('$STATE_FILE')); print(data.get('last_gap', ''))")"

while true; do
  if [[ -f "$STOP_FILE" ]]; then
    echo "[run_gauntlet] STOP file present — halting $TARGET at round $ROUND."
    python3 -c "import yaml; data=yaml.safe_load(open('$STATE_FILE')); data['status']='stopped'; yaml.safe_dump(data, open('$STATE_FILE', 'w'))"
    exit 0
  fi

  ROUND=$((ROUND + 1))
  echo "=== $TARGET round $ROUND (no cap — exits on win or STOP) ==="

  invoke_builder "$TARGET" "$BAR" "$GAP"
  invoke_critic "$TARGET" "$BAR" "$CAPTURE_METHOD"

  CAPTURE_DIR="./Captures/${TARGET}"
  VERDICT="$(head -n1 "${CAPTURE_DIR}/verdict.txt")"
  python3 -c "import yaml; data=yaml.safe_load(open('$STATE_FILE')); data['rounds']=$ROUND; yaml.safe_dump(data, open('$STATE_FILE', 'w'))"

  if [[ "$VERDICT" == "OURS" ]]; then
    python3 -c "import yaml; data=yaml.safe_load(open('$STATE_FILE')); data['status']='won'; yaml.safe_dump(data, open('$STATE_FILE', 'w'))"
    echo "[run_gauntlet] $TARGET WON on round $ROUND."
    exit 0
  else
    GAP="$(sed -n '2p' "${CAPTURE_DIR}/verdict.txt")"
    python3 -c "import yaml; data=yaml.safe_load(open('$STATE_FILE')); data['last_gap']='''$GAP'''; data['status']='in_progress'; yaml.safe_dump(data, open('$STATE_FILE', 'w'))"
    echo "[run_gauntlet] $TARGET lost round $ROUND. Gap: $GAP"
    # Break loop if lost so builder can address gap in next pass
    exit 0
  fi
done
