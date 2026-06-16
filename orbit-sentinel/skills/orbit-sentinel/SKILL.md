---
name: orbit-sentinel
description: >
  Build an autonomous engineering digital twin of any GitLab repository using
  GitLab Orbit. This skill teaches AI agents how to use Orbit's query DSL to
  construct a digital twin, simulate changes, predict failures, and generate
  remediation plans — all before code reaches production.
slash-command: sentinel
---

# Orbit Sentinel Skill

This skill gives AI coding agents the knowledge and query recipes needed to
build an Engineering Digital Twin using GitLab Orbit. It covers all four
Orbit query types — traversal, aggregation, path_finding, neighbors — with
ready-to-use JSON recipe files in the `recipes/` directory.

## Quick Start

```bash
# Install the skill
glab skills install --global orbit-sentinel

# Or reference it manually
glab orbit remote query ./recipes/blast-radius.json
```

## Available Query Recipes

| Recipe | File | Query Type | Use Case |
|--------|------|-----------|----------|
| Blast Radius | `recipes/blast-radius.json` | neighbors | Find everything connected to a changed file |
| Dependency Chain | `recipes/dependency-chain.json` | path_finding | Trace dependency paths between files |
| Deployment Impact | `recipes/deployment-impact.json` | traversal | Map files to their deployment targets |
| Historical Similarity | `recipes/historical-similarity.json` | traversal | Find past MRs that modified the same files |
| Ownership Discovery | `recipes/ownership-discovery.json` | neighbors | Find teams and users who own files |
| Pipeline Risk | `recipes/pipeline-risk.json` | aggregation | Count pipeline failures by project |

## Orbit Query DSL Reference

### Query Types

```
TRAVERSAL    — Fetch nodes and follow relationships. Best for:
               searching, filtering, exploring known paths.

AGGREGATION  — Count, sum, average, group, sort. Best for:
               pipeline failures, MR counts, risk scoring.

PATH_FINDING — Find shortest or all paths between two nodes. Best for:
               dependency chains, deployment traces, impact paths.

NEIGHBORS    — Find everything connected to one node within N hops. Best for:
               blast radius, ownership discovery, dependency mapping.
```

### Common Filters

```json
{"op": "eq", "value": "exact-match"}
{"op": "contains", "value": "partial-match"}
{"op": "starts_with", "value": "prefix"}
{"op": "ends_with", "value": "suffix"}
{"op": "gt", "value": 100}     {"op": "lt", "value": 100}
{"op": "gte", "value": 100}    {"op": "lte", "value": 100}
{"op": "in", "value": ["a", "b"]}
```

### Node Types (Key Entities)

| Entity | Description | Key Properties |
|--------|-------------|----------------|
| `Project` | GitLab project | `id`, `name`, `full_path`, `visibility` |
| `File` | Source code file | `id`, `path`, `name`, `language`, `content` |
| `Definition` | Function, class, method | `id`, `fqn`, `definition_type`, `content` |
| `MergeRequest` | Merge request | `iid`, `title`, `state`, `created_at` |
| `Pipeline` | CI/CD pipeline | `id`, `status`, `source`, `ref` |
| `Deployment` | Deployment to environment | `iid`, `status`, `environment_id` |
| `Incident` | Production incident | `iid`, `title`, `severity` |
| `User` | GitLab user | `id`, `username`, `name` |
| `Group` | GitLab group/subgroup | `id`, `full_path`, `name` |

### Relationship Types

| Relationship | From | To | Description |
|-------------|------|----|-------------|
| `IN_PROJECT` | MergeRequest, Pipeline, etc. | Project | Entity belongs to project |
| `CONTAINS` | Project, Directory | Branch, File | Container relationship |
| `ON_BRANCH` | File, Definition | Branch | Code lives on this branch |
| `MODIFIED_IN` | File, Definition | MergeRequest | Code was changed in this MR |
| `AUTHORED_BY` | MergeRequest | User | MR was created by user |
| `DEPENDS_ON` | File, Service | File, Service | Dependency relationship |
| `CAUSED_INCIDENT` | File, Change | Incident | Code caused an incident |
| `HAS_DIFF` | MergeRequest | MergeRequestDiff | MR diff snapshots |
| `HAS_FILE` | MergeRequestDiff | MergeRequestDiffFile | Files in diff |

## Building a Digital Twin

A complete digital twin requires multiple Orbit queries composed together:

1. **Start with the project** — Find the project and its top-level structure
2. **Map the change files** — Find each changed file in the Orbit graph
3. **Compute blast radius** — Use neighbors queries to find everything connected
4. **Trace dependencies** — Use path_finding to find dependency chains
5. **Check history** — Use traversal to find past changes to the same files
6. **Assess risk** — Use aggregation to count failures, incidents, open MRs

## Troubleshooting

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| 404 | Orbit feature flag not enabled | Enable `knowledge_graph` on your top-level group |
| 401 | Token expired | Run `glab auth login` |
| 403 | No accessible namespaces | Verify you have access to an Orbit-enabled group |
| Empty results | Files not indexed yet | Wait for the next index cycle |
| Too many results | Missing limit parameter | Add `"limit": 100` to your query |

## Security

- All Orbit queries respect GitLab permissions
- Results only include data the current user can access
- Use `traversal_path` property for authorization scoping
- API tokens should use minimal required scopes

## Related

- [Orbit Query Language Reference](https://docs.gitlab.com/orbit/remote/queries/query-language/)
- [Orbit Schema Reference](https://docs.gitlab.com/orbit/remote/schema/)
- [Orbit Cookbook](https://docs.gitlab.com/orbit/remote/cookbook/)
- [GitLab Duo Agent Platform](https://docs.gitlab.com/user/duo_agent_platform/)
