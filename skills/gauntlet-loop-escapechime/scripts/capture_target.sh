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
  echo "[capture_target] Mocking audio capture WAV files for ${TARGET}..."
  # Create small dummy WAV files if not existing
  touch "${PROJECT_PATH}/${OUT_DIR}/success_chime.wav"
  touch "${PROJECT_PATH}/${OUT_DIR}/failure_chime.wav"
else
  echo "[capture_target] Mocking screenshot capture PNG files for ${TARGET}..."
  touch "${PROJECT_PATH}/${OUT_DIR}/stage_1.png"
  touch "${PROJECT_PATH}/${OUT_DIR}/stage_8.png"
fi

echo "[capture_target] Done. Artifacts written to ${PROJECT_PATH}/${OUT_DIR}"
ls "${PROJECT_PATH}/${OUT_DIR}"
