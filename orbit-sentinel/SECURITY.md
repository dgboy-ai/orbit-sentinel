# Security

## Responsible Disclosure

Orbit Sentinel is a hackathon project and does not process production data. If you discover a security issue, please report it privately.

**Do not** open public issues for security vulnerabilities.

## Reporting

- **GitLab**: Create a confidential issue at https://gitlab.com/gitlab-ai-hackathon/transcend/39251857/-/issues/new
- **Email**: Reach out to the project maintainer directly

## Scope

- The `engine/` directory contains API credential handling (GitLab tokens via environment variables)
- The `visualizer/` is a static client — no secrets are stored or transmitted
- `.env` files and `ORBIT_TOKEN` are gitignored

## Token Safety

- Orbit API tokens should use **project access tokens** with minimal required scopes
- Store tokens as **masked CI/CD variables** in GitLab
- Never commit tokens to the repository
