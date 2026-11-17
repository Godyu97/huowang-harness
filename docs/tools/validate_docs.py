"""Validate the portable product document bundle; not application tests."""

import json
import math
from datetime import datetime, timedelta
from pathlib import Path
import re
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
errors = []


def check(condition, message):
    if not condition:
        errors.append(message)


def near(actual, expected, label):
    check(actual is None if expected is None else
          actual is not None and math.isclose(actual, expected, abs_tol=1e-9),
          f"{label}: {actual!r} != {expected!r}")


def ratio(n, d):
    return n / d if d else None


def read_json(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8"))


def main():
    mapping = read_json("product-map.json")
    features = mapping["features"]
    gates = mapping["gates"]
    check(len(features) == 26, "Expected 26 requirements")
    check([sum(f["level"] == level for f in features)
           for level in ("M0", "M1", "M2")] == [12, 8, 6],
          "Stage feature counts must be 12/8/6")
    prd = (ROOT / "02-产品需求文档-PRD.md").read_text(encoding="utf-8")
    trace = (ROOT / "06-需求追溯矩阵.md").read_text(encoding="utf-8")
    milestones = (ROOT / "05-里程碑与验收计划.md").read_text(encoding="utf-8")
    nodes = {f["task"]: f["dependencies"] for f in features}
    nodes.update({g["task"]: g["dependencies"] for g in gates})
    check(len(nodes) == 29, "Expected 29 unique tasks including gates")
    for field in ("requirement", "spec", "task"):
        check(len({f[field] for f in features}) == 26,
              f"Duplicate {field}")
    all_ac = {a["id"] for f in features for a in f["acceptance"]}
    check(len(all_ac) == 78, "Expected 78 unique functional acceptance IDs")
    for f in features:
        spec = (ROOT / f["spec_file"]).read_text(encoding="utf-8")
        task = (ROOT / f["task_file"]).read_text(encoding="utf-8")
        check(f["requirement"] in prd and f["requirement"] in trace,
              f"Requirement missing from PRD/trace: {f['requirement']}")
        check(f["spec"] in spec and f["task"] in task,
              f"Missing spec/task: {f['requirement']}")
        for ac in f["acceptance"]:
            check(all(ac.get(k) for k in ("id", "given", "when", "then")),
                  f"Incomplete acceptance: {ac}")
            check(ac["id"] in spec and ac["id"] in task and ac["id"] in trace,
                  f"Acceptance not fully traced: {ac['id']}")
        if f["level"] != "M0":
            previous = f"T-M{int(f['level'][1]) - 1}-GATE"
            check(previous in f["dependencies"],
                  f"Missing previous stage gate: {f['task']}")
    for g in gates:
        all_ac.add(g["acceptance"])
        check(g["acceptance"] in milestones, f"Missing gate: {g['acceptance']}")
    for node, deps in nodes.items():
        for dep in deps:
            check(dep in nodes, f"Unknown dependency: {node} -> {dep}")
            check(int(dep[3]) <= int(node[3]), f"Future-stage dependency: {node}")
    visited, active = set(), set()

    def visit(node):
        if node in active:
            errors.append(f"Cyclic task dependency at {node}")
            return
        if node in visited or node not in nodes:
            return
        active.add(node)
        for dep in nodes[node]:
            visit(dep)
        active.remove(node)
        visited.add(node)

    for node in nodes:
        visit(node)

    files = [p for p in ROOT.rglob("*.md") if "archive" not in p.relative_to(ROOT).parts]
    link_count = 0
    for p in files:
        content = p.read_text(encoding="utf-8")
        check("\ufffd" not in p.name and bool(content.strip()),
              f"Invalid filename or empty document: {p.name}")
        check("\ufffd" not in content and "\x00" not in content,
              f"Invalid text encoding: {p.name}")
        check(content.count("```") % 2 == 0, f"Unclosed code fence: {p.name}")
        for ac_id in set(re.findall(r"AC-M[012]-(?:\d{2}-\d+|GATE)", content)):
            check(ac_id in all_ac, f"Unknown acceptance reference {ac_id} in {p.name}")
        for target in re.findall(r"\[[^\]\n]*\]\(([^)\n]+)\)", content):
            if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", target):
                continue
            path_part, _, anchor = unquote(target).partition("#")
            dest = (p.parent / path_part).resolve() if path_part else p
            check(dest.is_relative_to(ROOT), f"Nonportable link: {p.name}: {target}")
            check(dest.exists(), f"Broken link: {p.name}: {target}")
            link_count += 1
            if anchor and dest.is_file():
                target_text = dest.read_text(encoding="utf-8")
                check(f'id="{anchor}"' in target_text, f"Missing explicit anchor: {target}")

    cases = read_json("fixtures/metric-cases.json")["cases"]
    for case in cases:
        exp, cid = case["expected"], case["id"]
        if "p" in case:
            check(0 <= case["e"] <= case["v"] <= case["p"], f"{cid}: invalid E/V/P")
            check(0 <= case["cited"] <= case["jc"] <= case["c"] <= case["e"],
                  f"{cid}: invalid citation sets")
            values = {
                "valid_coverage": ratio(case["v"], case["p"]),
                "eligible_coverage": ratio(case["e"], case["p"]),
                "recommendation_rate": ratio(case["recommended"], case["jr"]),
                "recommendation_unknown": ratio(case["e"] - case["jr"], case["e"]),
                "citation_coverage": ratio(case["c"], case["e"]),
                "official_citation_rate": ratio(case["cited"], case["jc"]),
                "ownership_judgable": ratio(case["jc"], case["c"]),
            }
            for k, value in exp.items():
                near(values[k], value, f"{cid}.{k}")
        elif cid == "question-equal-weight":
            rows = case["questions"]
            near(sum(r["numerator"]/r["denominator"] for r in rows)/len(rows),
                 exp["question_mean"], cid)
            near(sum(r["numerator"] for r in rows)/sum(r["denominator"] for r in rows),
                 exp["pooled"], cid)
        elif cid == "common-query-comparison":
            left = {(r["id"], r["version"]): r for r in case["before"]}
            right = {(r["id"], r["version"]): r for r in case["after"]}
            keys = left.keys() & right.keys()
            before = sum(left[k]["numerator"]/left[k]["denominator"] for k in keys)/len(keys)
            after = sum(right[k]["numerator"]/right[k]["denominator"] for k in keys)/len(keys)
            near(before, exp["before"], cid)
            near(after, exp["after"], cid)
            near((after-before)*100, exp["delta_pp"], cid)
            check(len(keys) == exp["common_count"], f"{cid}: common count")
            excluded = sorted({r["id"] for r in case["before"]} - {k[0] for k in keys})
            check(excluded == exp["excluded"], f"{cid}: excluded IDs")
        elif cid == "formal-coverage-fails":
            coverage = case["common_count"] / case["frozen_nonbrand_count"]
            near(coverage, exp["common_coverage"], cid)
            check((coverage >= 0.8) == exp["formal_allowed"], f"{cid}: gate")
        elif cid == "lead-dedup":
            priority = ["verified_ai_referral", "self_reported_ai",
                        "dedicated_page_association", "unknown"]
            events = {}
            for event in case["events"]:
                key = event["event_key"]
                events[key] = min(events.get(key, "unknown"), event["source"], key=priority.index)
            counts = {s: list(events.values()).count(s) for s in set(events.values())}
            check(len(events) == exp["unique_leads"] and counts == exp["primary_source_counts"],
                  f"{cid}: dedup")
        elif cid == "d7-window":
            day = datetime.fromisoformat(case["effective_at"]).replace(hour=0, minute=0, second=0)
            actual = {"baseline_start": day-timedelta(days=14),
                      "baseline_end_exclusive": day,
                      "observation_start": day+timedelta(days=1),
                      "observation_end_exclusive": day+timedelta(days=8)}
            check(all(v.isoformat() == exp[k] for k, v in actual.items()), f"{cid}: dates")
        else:
            check(bool(exp), f"{cid}: missing semantic fixture expectations")

    report = read_json("fixtures/report-example.json")
    check(report["is_demo"] is True and report["grade"] == "exploratory",
          "Report fixture must be demo/exploratory")
    rows = report["queries"]
    before = sum(q["before"]["numerator"]/q["before"]["jr"] for q in rows)/len(rows)
    after = sum(q["after"]["numerator"]/q["after"]["jr"] for q in rows)/len(rows)
    near(before, report["summary"]["before"], "report.before")
    near(after, report["summary"]["after"], "report.after")
    near((after-before)*100, report["summary"]["delta_pp"], "report.delta_pp")
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        raise SystemExit(1)
    print(f"PASS: {len(features)} requirements, 29 tasks, 81 acceptance IDs, acyclic dependencies")
    print(f"PASS: {len(files)} active Markdown files, {link_count} portable local links")
    print("PASS: 8 numeric/date fixture cases and report recalculation; 2 semantic fixture definitions")
    print("NOT RUN: application behavior, external channels, publication or business outcomes")


if __name__ == "__main__":
    main()
