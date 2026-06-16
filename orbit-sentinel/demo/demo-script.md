# Orbit Sentinel — Demo Script (3 minutes)

**Core message:** "GitHub Copilot predicts code. Orbit Sentinel predicts consequences."

**Do NOT show:** architecture, YAML, code, implementation details.
**DO show:** the MR, the prediction, the evidence, the decision.

---

## 0:00–0:15 — The Problem

**Screen:** GitLab MR !184 — `fix(auth): validate JWT expiry before token refresh`

Changed files: auth_service.ts, permissions.ts

**Narrator:**
"A developer changes authentication logic. Before anyone hits merge, Orbit Sentinel activates."

---

## 0:15–0:30 — Auto-Play Demo

**Screen:** Open visualizer with `?demo=true` — auto-cycles: Overview → Blast Radius → Risk → Simulation → History → Report

Overlay labels appear on each view explaining what's shown.

**Narrator:**
"Within seconds, Sentinel calls GitLab Orbit using all four query types — Traversal, Path Finding, Neighbors, and Aggregation — and builds an engineering digital twin. Watch the auto-demo cycle through all six analysis views."

---

## 0:30–0:50 — Evidence, Not Black Box

**Screen:** Orbit Evidence panel — 4 query cards animate in sequentially

- TRAVERSAL → 8 downstream services
- PATH_FINDING → auth_service.ts → Production
- NEIGHBORS → 6 files, 3 services affected
- AGGREGATION → 2 historical incidents, 4 pipeline failures

**Narrator:**
"Every conclusion has an evidence source. No black box AI. The judge can see exactly which query produced which result."

---

## 0:50–1:05 — Interactive What-If Simulation

**Screen:** Counterfactual panel — **click each mitigation bar as you narrate**

1. Click "Feature Flag Added" — risk drops from 72% to 34%
2. Click "Integration Tests" — risk drops to 21%
3. Click "All Mitigations" — risk drops to 6%

**Narrator:**
"Sentinel answers the most important question: 'What if we apply mitigations?' Click any bar to see the risk animate down. From 72% to 6%."

---

## 1:05–1:20 — History Repeats

**Screen:** Incident Intelligence panel — 3 incident cards with similarity badges

MR #184 — 87% match — Production Outage
MR #142 — 65% match — Rollback
MR #118 — 58% match — Incident

**Narrator:**
"It finds MR #184 — an almost identical auth change that caused a production outage. This isn't speculation. It's institutional memory, powered by Orbit."

---

## 1:20–1:35 — Decision Center

**Screen:** Decision Center panel

Strategy: Feature flag rollout (5% → 25% → 50% → 100%)
Reviewers: @alice (Auth Owner), @bob (Platform Team)
Tests: auth integration, token validation, payment regression
Rollback: Instant rollback available

**Narrator:**
"Sentinel recommends @alice as primary reviewer, a staged rollout strategy, and has the rollback plan ready."

---

## 1:35–1:50 — Interactive Digital Twin Graph

**Screen:** D3 force-directed graph — **click nodes as you narrate**

1. Click "AuthService" — detail panel shows CRITICAL risk, connection count
2. Click "Incident #42" — shows relationship to auth_service.ts
3. Hover to see glow on critical nodes

**Narrator:**
"The digital twin shows the full picture: 20 nodes, 22 edges. Click any node — see its type, risk level, and connections. AuthService at the center, connected to six files, two pipelines, two deployments at risk."

---

## 1:50–2:00 — Final Verdict

**Screen:** Back to Hero section — zoom on the recommendation

**Narrator:**
"Final verdict: HIGH risk. Do not deploy directly to production. Use a feature flag rollout with staged traffic ramping."

---

## 2:00–2:15 — The Full Report

**Screen:** Click to Report tab — scroll through sections

**Narrator:**
"The full report is posted on the MR — executive summary, blast radius, failure predictions, reviewer recommendations, rollback plan, test plan, and remediation suggestions."

---

## 2:15–2:30 — Closing

**Screen:** End card

Orbit Sentinel

"GitHub Copilot predicts code. Orbit Sentinel predicts consequences."

GitLab Orbit: Traversal | Aggregation | Path Finding | Neighbors
Duo Agent Platform | AI Catalog

Built for the GitLab Transcend Hackathon

**Narrator:**
"Most AI tools understand code. Orbit Sentinel understands the future state of a software system."

---

## Technical Notes

| Moment | Time | Judges See |
|--------|------|------------|
| MR + auto-play demo | 0:00–0:30 | Auto-cycle through all 6 views with labels |
| Evidence panel | 0:30–0:50 | Every claim cites a specific Orbit query |
| Interactive counterfactual | 0:50–1:05 | Click bars to animate risk changes |
| Incidents | 1:05–1:20 | Repository memory, similarity scoring |
| Decision center | 1:20–1:35 | Actionable output (reviewers, strategy, tests) |
| Interactive graph | 1:35–1:50 | Click nodes for detail panel, D3 visualization |
| Report | 2:00–2:15 | Complete formatted MR comment |
