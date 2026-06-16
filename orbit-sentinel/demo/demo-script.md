# Orbit Sentinel — Demo Script (3 minutes)

## Setup (0:00-0:15)

**Screen:** Browser showing GitLab merge request MR !184 — "Refactor auth token validation"

**Narrator:**
"This is MR !184. The developer is changing the authentication token validation logic. Before anyone hits merge, Orbit Sentinel automatically activates."

**[Action:** Click on MR to show it's been opened]

---

## Activation & Digital Twin Construction (0:15-0:45)

**Screen:** Split view — MR on left, Orbit Sentinel panel sliding in from right

**Narrator:**
"Sentinel is triggered by the MR creation event. It immediately calls GitLab Orbit to build an Engineering Digital Twin of the entire software system."

**[Action:** Show Orbit query logs appearing in real-time]
- `TRAVERSAL: Finding files that import auth_service.ts...`
- `NEIGHBORS: Computing blast radius (3 hops)...`
- `PATH_FINDING: Tracing deployment paths to production...`
- `AGGREGATION: Counting pipeline failures in payment-api...`

**Narrator:**
"Sentinel uses all four Orbit query types — traversal, neighbors, path_finding, and aggregation — to construct a complete digital twin with 20 nodes and 22 edges."

**[Action:** Show the digital twin graph appearing, nodes lighting up]

---

## Blast Radius Visualization (0:45-1:15)

**Screen:** Full-screen interactive digital twin graph — AuthService highlighted in red, connected services pulsing

**Narrator:**
"Here's the digital twin. AuthService is the center of a blast radius that spans three downstream services — UserService, PaymentService, and NotificationService. Six files are transitively impacted. Two deployment targets are in the chain."

**[Action:** Click on AuthService node → blast radius highlights in red]
**[Action:** Show dependency chain tracing from auth_service.ts → production deployment]

**Narrator:**
"What used to take a senior engineer 30 minutes of manual tracing happens in 3 seconds through Orbit."

---

## Historical Memory (1:15-1:40)

**Screen:** Historical matches panel slides up

**Narrator:**
"Here's where Sentinel separates itself from every other analysis tool. It doesn't just analyze the current code — it remembers the past."

**[Action:** Scroll through historical MR cards]
- MR !184: Auth token change → **caused production failure** (87% match)
- MR !156: Similar refactor → **successful** with feature flags (72% match)
- MR !118: OAuth migration → **Incident #42** (58% match)

**Narrator:**
"Sentinel found MR #184 — an almost identical authentication change that caused production failures in three downstream services. This isn't speculation. It's institutional memory, powered by Orbit."

---

## Failure Prediction & Risk Score (1:40-2:10)

**Screen:** Risk assessment panel appears with score bar and predictions

**Narrator:**
"Now Sentinel simulates the change and predicts what happens."

**[Action:** Show risk assessment sliding in]
- Risk Score: 72% — HIGH
- 4 failure modes predicted
- 3 services in critical path

**Narrator:**
"Four failure modes predicted, including a 72% probability of downstream breakage. The system recommends blocking this merge and adds a `risk-high` label to the MR."

---

## Remediation & Auto-Fix (2:10-2:40)

**Screen:** Remediation panel with action items

**Narrator:**
"But Sentinel doesn't just report problems — it fixes them. Here are the remediation suggestions:"

**[Action:** Scroll through remediations]
1. 🚩 Wrap behind feature flag (critical)
2. 🔧 Auto-generated fix MR for UserService compatibility
3. 🧪 Add regression tests for JWT validation
4. ⚙️ Add canary deployment stage

**Narrator:**
"Sentinel has already generated a fix MR that maintains backward compatibility for downstream consumers. The developer can review and merge it with one click."

---

## Full Report & Conclusion (2:40-3:00)

**Screen:** Final report posted as MR comment — scrollable, beautifully formatted

**Narrator:**
"The full report is posted on the merge request — executive summary, blast radius, failure predictions, historical context, reviewer recommendations, rollback plan, test plan, and remediations."

**[Action:** Scroll through the MR comment report quickly]

**Narrator:**
"Predicted before merge. Prevented before production."

---

## End Card

**Screen:**
```
🛰️ Orbit Sentinel
🏆 Autonomous Engineering Digital Twin

GitLab Orbit: Traversal | Aggregation | Path Finding | Neighbors
Duo Agent Platform: 7-Agent Flow | AI Catalog | Published
Built for the GitLab Transcend Hackathon
```

---

## Technical Notes for Judges

| Element | Shown At | What It Demonstrates |
|---------|----------|---------------------|
| Orbit queries (4 types) | 0:15-0:45 | Deep Orbit integration |
| Digital twin graph | 0:45-1:15 | Digital twin concept |
| Historical memory | 1:15-1:40 | Repository memory layer |
| Risk scoring | 1:40-2:10 | Simulation engine |
| Auto-remediation | 2:10-2:40 | Autonomous action |
| MR comment report | 2:40-3:00 | Full output |
