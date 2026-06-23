# Security

## Responsible Disclosure

Orbit Sentinel is a hackathon project and does not process production data. If you discover a security issue, please report it privately.

**Do not** open public issues for security vulnerabilities.

## Reporting

- **GitLab**: Create a confidential issue at https://gitlab.com/gitlab-ai-hackathon/transcend/orbit-sentinel/-/issues/new
- **Email**: Reach out to the project maintainer directly

## Scope

- The `engine/` directory contains API credential handling (GitLab tokens via environment variables)
- The `visualizer/` is a static client — no secrets are stored or transmitted
- `.env` files and `ORBIT_TOKEN` are gitignored

## Token Safety

- Orbit API tokens should use **project access tokens** with minimal required scopes
- Store tokens as **masked CI/CD variables** in GitLab
- Never commit tokens to the repository

## Fallback Token Handling

- When `GITLAB_ACCESS_TOKEN` is not set, the grep fallback fast-paths to empty data (no network calls)
- When token is set, fallback uses GitLab Repository Files API with Bearer auth — token sent once per file, discarded after use
- Tokens are never logged, cached, or persisted beyond the single analysis request
