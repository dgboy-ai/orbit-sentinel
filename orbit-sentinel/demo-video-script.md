# Orbit Sentinel — 3-Minute Demo Video Script

**Goal:** Win Design & Usability 1st Prize ($2k). Judges see our UI the entire time.
**Style:** Confident, clear, fast-paced. No music. No competitor names.
**Important:** Do NOT use `?judge=true` auto-tour — record manually for full control.

---

## Scene 1: Problem, Solution & Impact (0:00 - 0:35)

**Visuals:**
* Start on Orbit Sentinel Dashboard (Overview view).
* Slowly scroll or zoom through the Problem → Solution → Impact 3-column card.

**Voiceover:**
> "Every time a developer opens a merge request, they face a silent gamble. Will this code break a downstream dependency? Did a similar change cause an incident last month? Most teams merge blind because manual analysis takes hours."

*Zoom to the Solution column:*
> "Orbit Sentinel is the solution — a digital twin for every merge request, powered by all four GitLab Orbit query types. No API keys, no setup. It tells you what breaks before you ship."

*Zoom to the Impact column (quantified metrics):*
> "The impact: hours saved per merge request. Fewer false alarms. One hundred thirty-nine thousand dollars per year for a typical team. Every number traces back to real Orbit graph data."

---

## Scene 2: Dashboard Flythrough — Three Scenarios (0:35 - 1:05)

**Visuals:**
* Dashboard overview — slowly scroll from top to bottom.
* Click the scenario selector: "Critical: Broken Deploy Path" → watch the verdict change.
* Click "Safe: Test Coverage Only" → verdict flips to Low Risk.
* Click "Medium: Dependency Shift" → verdict shows Medium Risk with confidence factors.
* Scroll further to the Digital Twin Graph (23 nodes, 43 edges). Hover over 2-3 nodes.

**Voiceover:**
> "Back on the dashboard — three pre-seeded scenarios show how the verdict changes in real time. Critical, safe, medium — each with a different risk level and confidence breakdown."

> "The digital twin graph maps every dependency, every connection, every historical incident. Built from Orbit's four query types: NEIGHBORS for blast radius, PATH_FINDING for dependency chains, TRAVERSAL for historical matches, AGGREGATION for pipeline fragility."

---

## Scene 3: Blast Radius & Risk Investigation (1:05 - 1:40)

**Visuals:**
* Navigate to Blast Radius Explorer tab.
* Drag a node. Watch connected edges highlight upstream and downstream.
* Navigate to Risk Investigation tab.
* Scroll through the pipeline failure heatmap, correlation gauges, and risk matrices.

**Voiceover:**
> "The Blast Radius Explorer lets you visually trace every ripple effect across your architecture. Click any node — see everything it touches."

> "Risk Investigation aggregates pipeline failure history, code coverage, and author metrics into a single fragility score. By combining NEIGHBORS, AGGREGATION, and TRAVERSAL, it pinpoints where new vulnerabilities emerge — before code ever reaches staging."

---

## Scene 4: The Moat — Closed-Loop Predictions (1:40 - 2:20)

**Visuals:**
* Navigate to Predictions Tracker tab.
* Mouse over each confusion matrix cell: TP, TN, FP, FN — one by one.
* Scroll to DualSparkline trend chart.
* Scroll to ROI Calculator. Drag the "Manual Analysis Hours" slider from 2.5h down to 5m.

**Voiceover:**
> "Here's what makes Orbit Sentinel different. Other tools predict risk before merge and stop. Orbit Sentinel verifies."

> "Every prediction is tracked through a seven-day survival window after merge. Did it stay shipped or did it fail? True positives we caught. True negatives that shipped clean. False positives we overcorrected on. False negatives we missed."

> "One point eight percent false negative rate. Eighty percent accuracy across five verified MRs."

> "The ROI calculator runs on real prediction data — not static estimates. For a typical team: one hundred thirty-nine thousand dollars per year saved. One hundred twenty-one percent net ROI."

---

## Scene 5: Setup & Wrap (2:20 - 2:50)

**Visuals:**
* Navigate to Setup Wizard tab.
* Scroll through the quick-start instructions.
* Toggle the "Degraded Mode" banner to show the grep fallback capability.

**Voiceover:**
> "Setup takes under a minute. If Orbit is unavailable, the grep fallback keeps working — same digital twin, built from file analysis instead."

> "Orbit Sentinel is published to the GitLab AI Catalog, open source, and ready to run. Fork it, install the skill, publish the flow."

---

## Scene 6: Outro (2:50 - 3:00)

**Visuals:**
* Orbit Sentinel logo on dark background.
* Text: orbit-sentinel.vercel.app | Source Code: gitlab.com/trueboy1123/orbit-sentinel
* GitLab Transcend 2026 — Design & Usability

**Voiceover:**
> "Stop guessing. Stop merging blind. Predict the consequences of your code with Orbit Sentinel. Design and Usability — GitLab Transcend 2026."

---

## Recording Guide

Record in separate takes and edit together:

| Take | What to Record | Est. Time |
|---|---|---|
| A | Open visualizer. Scroll overview slowly. Click all 3 scenarios. Hover digital twin graph. | 30s |
| B | Navigate to Blast Radius tab. Drag nodes. Then switch to Risk Investigation. Scroll heatmap. | 35s |
| C | Navigate to Predictions tab. Mouse over confusion matrix cells. Scroll to ROI calculator. Drag slider. | 40s |
| D | Navigate to Setup tab. Scroll instructions. Toggle degraded mode. | 30s |
| E | End screen — logo + URLs. | 10s |

**Assembly:** Overlay AI voiceover (videomule). Cut between takes at natural pauses. Clean cuts only — no transitions or effects.
