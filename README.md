# Operations Console

Operations Console is an internal tool for monitoring and managing operational issues (incidents and warnings) across sites.

This repository contains the **Issue Management** screen. With it you can:

- see a summary of total, open and resolved issues
- filter issues by status and type, and search them by title
- mark an issue as resolved, or reopen it

The app talks to an in-memory mock API with simulated network latency, so no backend is needed.

> To check how the error state looks, open the app with `?simulateError=true` in the URL (for example `http://localhost:4200/?simulateError=true`).

## Start here

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NChapron-sic/frontend-architecture-challenge?quickstart=1)

👉 **[Read the challenge brief](https://nchapron-sic.github.io/frontend-architecture-challenge/challenge/)**. It explains the task, how the session works and what we look at.

You can also reach it from the **Challenge brief** link in the app's top bar, or at <http://localhost:4200/challenge/> when the app runs locally.

The ticket for this exercise is **[FE-124 — Refactor Issue Management Feature](https://github.com/NChapron-sic/frontend-architecture-challenge/issues/1)** (copy in [`recruitment/ISSUE.md`](recruitment/ISSUE.md)).

## Getting started

### In GitHub Codespaces (recommended)

Click **Open in GitHub Codespaces** above, or go to **Code → Codespaces → Create codespace on main**. Dependencies are installed automatically. Then run:

```bash
npm start
```

When port 4200 is forwarded, click **Open in Browser** in the notification (or open it from the **Ports** tab).

The Codespace runs on your own GitHub account. Your first `git push` will ask you to create a fork; accept it, then open your pull request from the fork to this repository's `main` branch.

### Locally

Requires Node.js **20.19+** or **22.12+** (an `.nvmrc` is provided: `nvm use`), npm **10+** and Git.

```bash
npm ci
npm start
```

Then open <http://localhost:4200>.

## Commands

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm start`            | Start the development server on port 4200 |
| `npm test`             | Run the unit test suite once (Vitest)     |
| `npm run test:watch`   | Run the tests in watch mode               |
| `npm run build`        | Create a production build in `dist/`      |
| `npm run lint`         | Lint TypeScript and templates (ESLint)    |
| `npm run format`       | Format source files (Prettier)            |
| `npm run format:check` | Check formatting without modifying files  |

## Project overview

```text
public/
└── challenge/      Challenge brief (static page, served at /challenge/)
src/
├── app/            Application source code
├── _tokens.scss    Design tokens (colours, spacing, typography)
├── styles.scss     Global styles
└── main.ts         Application bootstrap
```

[`AGENTS.md`](AGENTS.md) describes the team's engineering conventions.

The test suite checks behaviour through the rendered page: it finds elements by their accessible labels and `data-testid` attributes, and stubs the HTTP calls (`GET /api/issues`, `PATCH /api/issues/:id`). It shouldn't need major changes when the internal structure changes.

A CI workflow runs lint, tests and the build on every pull request.
