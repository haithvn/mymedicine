# Project Rules

## Security & Anti-Virus Compliance

- **DO NOT** use `whoami` commands (e.g., `eas whoami`, `npx eas-cli whoami`) in scripts or agent tasks. These commands are often flagged as reconnaissance activity by security software like CrowdStrike Falcon.
- If authentication status needs to be checked, prefer relying on the primary command (like `eas build`) to fail or prompt the user directly.
