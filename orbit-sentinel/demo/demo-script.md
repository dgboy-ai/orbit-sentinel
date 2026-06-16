# Orbit Sentinel — Demo Script (~3 minutes)

**Core message:** "GitHub Copilot predicts code. Orbit Sentinel predicts consequences."

**Do NOT show:** architecture, YAML, code, implementation details.
**DO show:** the MR, the prediction, the evidence, the decision.

---

## 0:00–0:15 — The Problem

**Screen:** GitLab MR !10 — `test-sentinel` branch, Draft status, empty diff

**Narrator:**
"A developer opens a merge request. No changes. No pipeline. Still in draft. Just like the 9 MRs before it from the same branch. Orbit Sentinel activates."

---

## 0:15–0:30 — Auto-Play Demo

**Screen:** Open visualizer with `?demo=true` — auto-cycles: Overview → Blast Radius → Risk → Simulation → History → Report

Overlay labels appear on each view explaining what's shown.

**Narrator:**
"Within seconds, Sentinel calls GitLab Orbit using all four query types — Traversal, Path Finding, Neighbors, and Aggregation — and builds an engineering digital twin. Watch the auto-demo cycle through all six analysis views."

---

## 0:30–0:50 — Evidence, Not Black Box

**Screen:** Orbit Evidence panel — 4 query cards animate in sequentially

- NEIGHBORS → 100 MR nodes, 100 Pipeline edges
- PATH_FINDING → No head pipeline for this MR
- TRAVERSAL → 50+ historical MRs, 90% abandonment rate
- AGGREGATION → 132k pipes in ecosystem, 17.8% failure rate

**Narrator:**
"Every conclusion has an evidence source. No black box AI. The judge can see exactly which query produced which result."

---

## 0:50–1:05 — Interactive What-If Simulation

**Screen:** Counterfactual panel — **click each mitigation bar as you narrate**

1. Click "Add File Changes" — risk drops from 55% to 35%
2. Click "Trigger Pipeline" — risk drops to 28%
3. Click "All Mitigations" — risk drops to 10%

**Narrator:**
"Sentinel answers the most important question: 'What if we apply mitigations?' Click any bar to see the risk animate down. From 55% to 10%."

---

## 1:05–1:20 — Future Timeline (Unique Differentiator)

**Screen:** Predicted Future panel — timeline showing D+0 through D+7

The timeline animates down showing each day's predicted outcome.

**Narrator:**
"Most AI tools describe the present. Orbit Sentinel predicts the future. A timeline forecast — D+0 through D+7 — based on historical patterns from the Orbit graph."

---

## 1:20–1:35 — History Repeats

**Screen:** Incident Intelligence panel — 3 incident cards with similarity badges

MR !9 — 90% match — Closed
MR !5 — 85% match — Closed
MR !2 — 78% match — Closed

**Narrator:**
"It finds MRs !2 through !9 — an almost identical pattern of abandoned test MRs from the same branch. This isn't speculation. It's institutional memory, powered by Orbit."

---

## 1:35–1:50 — Decision Center

**Screen:** Decision Center panel

Strategy: Add actual changes or close this MR
Reviewers: @trueboy1123 (Author), Reviewer needed
Tests: Add file changes, remove draft, trigger pipeline, assign reviewer

**Narrator:**
"Sentinel recommends adding actual file changes, removing draft status, and assigning a reviewer. Or simply close the MR."

---

## 1:50–2:05 — Interactive Digital Twin Graph

**Screen:** D3 force-directed graph — **click nodes as you narrate**

1. Click "MR !10" — detail shows high risk, empty diff, no pipeline
2. Click "Incident: Abandoned branch pattern" — shows links to closed MRs
3. Hover to see glow on critical nodes

**Narrator:**
"The digital twin shows the full picture: 19 nodes, 26 edges. Click any node — see its type, risk level, and connections. MR !10 at the center, connected to a history of abandoned iterations."

---

## 2:05–2:15 — Why This Is Unique

**Screen:** Tagline card — Traditional AI vs Orbit Sentinel comparison

**Narrator:**
"This is the key insight — traditional AI explains code. Orbit Sentinel predicts engineering consequences before they happen."

---

## 2:15–2:25 — Final Verdict

**Screen:** Back to Hero section — zoom on the recommendation

**Narrator:**
"Final verdict: MEDIUM risk. This MR has no changes and no pipeline — likely abandoned like the 9 before it. Add actual work or close it."

---

## 2:25–2:40 — The Full Report

**Screen:** Click to Report tab — scroll through sections

**Narrator:**
"The full report is posted on the MR — executive summary, blast radius, failure predictions, reviewer recommendations, rollback plan, test plan, and remediation suggestions."

---

## 2:40–3:00 — Closing & CTA

**Screen:** End card

Orbit Sentinel

"GitHub Copilot predicts code. Orbit Sentinel predicts consequences."

GitLab Orbit: Traversal | Aggregation | Path Finding | Neighbors
Duo Agent Platform | AI Catalog

Built for the GitLab Transcend Hackathon

**Narrator:**
"Most AI tools understand code. Orbit Sentinel understands the future state of a software system."

---

## 3:00–3:15 — End Card

**Screen:** Project title screen with links

Orbit Sentinel — Built for GitLab Transcend Hackathon
- AI Catalog: Publish from project Settings > General > AI Catalog
- Source: gitlab.com/gitlab-ai-hackathon/transcend/39251857
- Devpost: Submission page

**Narrator:**
"Published to the AI Catalog, available in Duo Chat, and ready to analyze your next merge request. This is Orbit Sentinel."

---

## Technical Notes

| Moment | Time | Judges See |
|--------|------|------------|
| MR + auto-play demo | 0:00–0:30 | Auto-cycle through all 6 views with labels |
| Evidence panel | 0:30–0:50 | Every claim cites a specific Orbit query |
| Interactive counterfactual | 0:50–1:05 | Click bars to animate risk changes |
| Incidents | 1:05–1:20 | Repository memory, similarity scoring |
| Decision center | 1:20–1:35 | Actionable output (reviewers, strategy, tests) |
| Interactive graph | 1:50–2:05 | Click nodes for detail panel, D3 visualization |
| Why unique | 2:05–2:15 | Tagline card — Traditional AI vs Orbit Sentinel |
| Final verdict | 2:15–2:25 | MEDIUM risk, recommendation |
| Report | 2:25–2:40 | Complete formatted MR comment |
| Closing | 2:40–3:00 | Summary + Devpost CTA |
| End card | 3:00–3:15 | Project links, AI Catalog callout |
