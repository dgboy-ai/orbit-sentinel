# Orbit Sentinel — Methodology

## 9-Section Impact Report

Every MR analysis produces a structured report with these sections:

| # | Section | Description |
|---|---|---|
| 1 | **Risk Level** | Overall verdict: LOW / MEDIUM / HIGH / CRITICAL |
| 2 | **Blast Radius** | Changed files, dependency graph, downstream services affected |
| 3 | **Historical Context** | Past MRs and incidents on same files with similarity scores |
| 4 | **Failure Predictions** | Specific risks with code-level evidence and severity |
| 5 | **Reviewer Recommendations** | Suggested reviewers based on Orbit ownership data |
| 6 | **Required Tests** | Test plan ranked by priority (CRITICAL → RECOMMENDED) |
| 7 | **Rollback Strategy** | Step-by-step undo plan for each failure mode |
| 8 | **Suggested Mitigations** | Actionable fixes ranked by impact (Blocker → Recommended) |
| 9 | **Summary Scorecard** | Security, Reliability, Test Coverage, Code Quality, Merge Readiness |

## 4 Orbit Query Types

| Query | Purpose | What It Reveals |
|---|---|---|
| **NEIGHBORS** | Blast radius | Everything connected to changed files — downstream services, upstream dependencies, related entities |
| **PATH_FINDING** | Dependency chains | Propagation paths from changed files through to deployments |
| **TRAVERSAL** | Historical matches | Past MRs and incidents on the same files with similarity scoring |
| **AGGREGATION** | Pipeline risk | Pipeline failure counts grouped by project, trend analysis |

## Risk Scoring Rubric

| Score | Level | Criteria |
|---|---|---|
| 0.00–0.29 | LOW | Isolated change, tests pass, reviewers approved, no downstream impact |
| 0.30–0.59 | MEDIUM | Moderate downstream impact, some test gaps, or historical pattern concerns |
| 0.60–0.84 | HIGH | Broad downstream impact, repeated failures on same path, or critical security gaps |
| 0.85–1.00 | CRITICAL | Pipeline already failing, secret exposure risk, no rollback plan, or PCI-DSS violation risk |

**Confidence factors** are drawn from: MR history volume, pipeline success rate, reviewer engagement, test coverage, and Orbit graph completeness.

## Execution Order

1. `get_graph_schema()` — discover the ontology
2. `query_graph(NEIGHBORS)` — map blast radius
3. `query_graph(PATH_FINDING)` — trace dependency chains
4. `query_graph(TRAVERSAL)` — find historical matches
5. `query_graph(AGGREGATION)` — assess pipeline risk
6. Compose report from combined evidence
7. Post report as MR note

## Fallback Behavior

When Orbit API is unavailable, the engine degrades to **grep-based file analysis**:

1. Changed files are fetched via GitLab Repository Files API (`GET /api/v4/projects/:id/repository/files/:path/raw`)
2. JS/TS `import`/`require` and Python `import`/`from` statements are parsed
3. A dependency graph is built from the parsed relationships
4. Results are flagged with `fallback: true` so the visualizer shows a degraded-mode banner
5. Every section of the report notes the degraded origin

## Post-Merge Verification (Closed Loop)

Every prediction is tracked post-merge through a **7-day survival window**:

- **True Positive**: High-risk prediction (≥60%) → ship → failed within 7 days ✅
- **True Negative**: Low-risk prediction → ship → no incident in 7 days ✅
- **False Positive**: High-risk prediction → ship → no incident ❌
- **False Negative**: Low-risk prediction → ship → failed ❌

Accuracy = (TP + TN) / (TP + TN + FP + FN)
