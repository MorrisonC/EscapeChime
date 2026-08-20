#!/usr/bin/env python3
"""
Parses Unity Test Framework's NUnit3-style XML output
(results-editmode.xml / results-playmode.xml) into a simple per-test-class
pass/fail summary, keyed by class name so targets.yaml's
lane_a_prerequisite entries (e.g. "LifeSystemTests") can be checked
directly.

Unity's UTF results are NUnit3 XML: nested <test-suite> elements, with
type="TestFixture" suites corresponding to each test class, and a
result="Passed"/"Failed" attribute (possibly on an ancestor suite if the
whole fixture errored before any test ran).
"""
import argparse
import os
import xml.etree.ElementTree as ET
import yaml


def extract_fixture_results(xml_path):
    """Returns {class_name: 'passed'|'failed'} for every TestFixture suite found."""
    results = {}
    if not os.path.exists(xml_path):
        return results
    tree = ET.parse(xml_path)
    for suite in tree.iter("test-suite"):
        if suite.get("type") == "TestFixture":
            name = suite.get("name", "unknown")
            result = suite.get("result", "Unknown").lower()
            results[name] = "passed" if result == "passed" else "failed"
    return results


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--editmode", required=True)
    p.add_argument("--playmode", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args()

    combined = {}
    combined.update(extract_fixture_results(args.editmode))
    combined.update(extract_fixture_results(args.playmode))

    if not combined:
        print(f"WARNING: no test results found in {args.editmode} or {args.playmode}. "
              "Did run_unity_tests.sh's Editor calls actually run? Check ./logs/.")

    with open(args.out, "w") as f:
        yaml.safe_dump({"classes": combined}, f, default_flow_style=False)

    failed = [k for k, v in combined.items() if v == "failed"]
    if failed:
        print(f"FAILED classes: {failed}")
    else:
        print(f"All {len(combined)} parsed test classes passed.")


if __name__ == "__main__":
    main()
