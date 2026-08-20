#!/usr/bin/env python3
"""
Prints Lane B targets with their gating status:
  - blocked: a lane_a_prerequisite class hasn't passed yet (or hasn't run)
  - ready: prerequisites green, gauntlet not started or in progress
  - won / human_flagged: gauntlet already resolved

Run scripts/run_unity_tests.sh first so lane_a_status.yaml is fresh --
this script doesn't run tests itself, it only reads the last result.
"""
import os
import yaml

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL_ROOT = os.path.dirname(HERE)


def load_yaml(path, default=None):
    if not os.path.exists(path):
        return default if default is not None else {}
    with open(path) as f:
        return yaml.safe_load(f) or {}


def main():
    cfg = load_yaml(os.path.join(SKILL_ROOT, "assets", "config.yaml"))
    targets = load_yaml(os.path.join(SKILL_ROOT, "assets", "targets.yaml"))["targets"]
    lane_a = load_yaml(cfg["lane_a_status_file"]).get("classes", {})
    state_dir = cfg["state_dir"]

    print(f"{'TARGET':<24} {'LANE A':<10} {'GAUNTLET':<14} ROUNDS")
    next_pick = None
    for t in targets:
        prereqs = t["lane_a_prerequisite"]
        prereq_ok = all(lane_a.get(cls) == "passed" for cls in prereqs)
        missing = [c for c in prereqs if lane_a.get(c) != "passed"]

        state_path = os.path.join(state_dir, f"{t['id']}.yaml")
        state = load_yaml(state_path, default={"status": "not_started", "rounds": 0})
        g_status = state.get("status", "not_started")
        rounds = state.get("rounds", 0)

        lane_a_label = "OK" if prereq_ok else f"BLOCKED({','.join(missing)})"
        print(f"{t['id']:<24} {lane_a_label:<10} {g_status:<14} {rounds}")

        if next_pick is None and prereq_ok and g_status not in ("won", "human_flagged"):
            next_pick = t["id"]

    print()
    if next_pick:
        print(f"NEXT TARGET: {next_pick}")
    else:
        print("Nothing runnable right now — either everything's resolved,")
        print("or remaining targets are blocked on Lane A tests. Run")
        print("run_unity_tests.sh and check ./logs/ if tests aren't green.")


if __name__ == "__main__":
    main()
