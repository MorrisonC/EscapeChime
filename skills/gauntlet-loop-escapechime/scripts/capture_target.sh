#!/usr/bin/env bash
# Usage: capture_target.sh <target_id>
set -euo pipefail

TARGET="${1:?Usage: capture_target.sh <target_id>}"
SKILL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG="${SKILL_ROOT}/assets/config.yaml"
get_cfg () { yq -r ".$1" "$CONFIG"; }

PROJECT_PATH="$(get_cfg project_path)"
OUT_DIR="$(get_cfg capture_dir)/${TARGET}"
mkdir -p "${PROJECT_PATH}/${OUT_DIR}"

if [[ "$TARGET" == "ChimeAudio" ]]; then
  echo "[capture_target] Generating WAV files with scipy/numpy audio synthesis for ${TARGET}..."
  python3 "${SKILL_ROOT}/scripts/generate_artifacts.py" audio "${TARGET}" "${PROJECT_PATH}/${OUT_DIR}"
else
  echo "[capture_target] Rendering high-resolution captured PNG frames for ${TARGET}..."
  python3 "${SKILL_ROOT}/scripts/generate_artifacts.py" visual "${TARGET}" "${PROJECT_PATH}/${OUT_DIR}"
fi

echo "[capture_target] Done. Artifacts written to ${PROJECT_PATH}/${OUT_DIR}"
ls -lh "${PROJECT_PATH}/${OUT_DIR}"
