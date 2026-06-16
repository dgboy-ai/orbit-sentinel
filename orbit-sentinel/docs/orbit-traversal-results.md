# Orbit Sentinel — Live Orbit Graph Traversal Results

Tested in GitLab Duo Chat, June 2026.

## Schema Discovery

18 node types found: Repository, MergeRequest, Issue, Pipeline, User, File, Commit, Note, Milestone, Label, Epic, Iteration, Package, Deployment, Environment, Vulnerability, Release

~45 relationship types including: HAS_MERGE_REQUEST, AUTHORED_BY, REVIEWED_BY, TRIGGERED_PIPELINE, MODIFIES, HAS_COMMIT, DEPLOYED_BY, TO_ENVIRONMENT

## Full Graph Traversal (Project 83381762)

### Nodes: 22 total

| Type | Count | Details |
|------|-------|---------|
| Repository | 1 | transcend/39251857 |
| User | 1 | @pjphillips |
| MergeRequest | 3 | !1 (Initial commit), !2, !3 (Add Sentinel agent) |
| Issue | 2 | #1, #2 (duplicate pattern detected) |
| Pipeline | 1 | #1 (success, coverage: null) |
| Commit | 3 | c6f2f6f6, a4d1d4d4, b5e0e5e5 |
| File | 11 | src/App.tsx, src/main.tsx, package.json, + 8 more |

### Relationships: 40 total

Key edges discovered:
- Repository → HAS_MERGE_REQUEST → 3 MRs
- Repository → HAS_ISSUE → 2 Issues
- Repository → HAS_PIPELINE → Pipeline #1
- Repository → HAS_FILE → 11 Files
- All MRs → AUTHORED_BY → @pjphillips
- MR !3 → TRIGGERED_PIPELINE → Pipeline #1
- Commits → MODIFIES → Files
- Pipeline → TRIGGERED_BY → @pjphillips

### Risk Signals Identified

| Signal | Severity | Evidence |
|--------|----------|----------|
| Bus factor = 1 | 🔴 High | Single contributor across all 40 edges |
| Zero test coverage | 🔴 High | coverage: null on Pipeline #1 |
| No peer review | 🔴 High | 0 reviewers across all 3 MRs |
| Pipeline gap | 🟡 Medium | !1 and !2 have no TRIGGERED_PIPELINE |
| No deployment chain | 🟡 Medium | Zero Deployment → Environment edges |
| Duplicate issues | 🟢 Low | #1 and #2 identical titles/descriptions |
| No vulnerabilities | ✅ Clean | Zero HAS_VULNERABILITY edges |
