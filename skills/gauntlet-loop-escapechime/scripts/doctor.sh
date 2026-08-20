#!/usr/bin/env bash
# Preflight check for gauntlet-loop-escapechime. Depends on unity-cli-bridge
# being installed alongside this skill for Editor resolution.
set -euo pipefail

SKILL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG="${SKILL_ROOT}/assets/config.yaml"
get_cfg () { yq -r ".$1" "$CONFIG"; }

echo "[doctor] Checking for unity CLI (from unity-cli-bridge)..."
command -v unity >/dev/null 2>&1 || {
  echo "[doctor] 'unity' not found. Install unity-cli-bridge's dependency first"
  echo "[doctor] (see that skill's scripts/doctor.sh) or run its provisioning."
  exit 1
}
unity --version

VERSION_PREFIX="$(get_cfg unity_editor_version)"
echo "[doctor] Checking an Editor matching '${VERSION_PREFIX}*' is installed..."
if ! unity editors -i --format json | jq -e --arg v "$VERSION_PREFIX" \
  '.[] | select(.version | startswith($v))' >/dev/null 2>&1; then
  echo "[doctor] No installed Editor starts with ${VERSION_PREFIX}."
  echo "[doctor] Run: unity install <exact version, e.g. 2022.3.XXf1>"
  exit 1
fi

echo "[doctor] Checking for yq and jq..."
command -v yq >/dev/null 2>&1 || { echo "[doctor] yq not found."; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "[doctor] jq not found."; exit 1; }

echo "[doctor] Checking TESTING.md and GAME_DESIGN_DOCUMENT.md are present..."
[[ -f "TESTING.md" ]] || echo "[doctor] WARNING: TESTING.md not found at repo root — run from the EscapeChime repo root."
[[ -f "GAME_DESIGN_DOCUMENT.md" ]] || echo "[doctor] WARNING: GAME_DESIGN_DOCUMENT.md not found at repo root."

echo "[doctor] Environment OK."
