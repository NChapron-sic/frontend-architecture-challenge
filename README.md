# Operations Console

Operations Console is an internal tool for monitoring and managing operational issues (incidents and warnings) across sites.

This repository contains the **Issue Management** screen. With it you can:

- see a summary of total, open and resolved issues
- filter issues by status and type, and search them by title
- mark an issue as resolved, or reopen it

The app talks to an in-memory mock API with simulated network latency, so no backend is needed.

> To check how the error state looks, open the app with `?simulateError=true` in the URL (for example `http://localhost:4200/?simulateError=true`).

## Your task

Read the GitHub issue for this exercise: **[FE-124 — Refactor Issue Management Feature](https://github.com/NChapron-sic/frontend-architecture-challenge/issues/1)**.

Plan for **45–60 minutes**. We're not looking for a complete rewrite. We want to see your reasoning, your priorities, and how you communicate them.

## Prerequisites

- Node.js **20.19+** or **22.12+** (an `.nvmrc` is provided: `nvm use`)
- npm **10+**
- Git

## Getting started

```bash
npm ci
npm start
```

Then open <http://localhost:4200>.

## Commands

| Command                | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `npm start`            | Start the development server on port 4200       |
| `npm test`             | Run the unit test suite once (Vitest)           |
| `npm run test:watch`   | Run the tests in watch mode                     |
| `npm run build`        | Create a production build in `dist/`            |
| `npm run lint`         | Lint TypeScript and templates (ESLint)          |
| `npm run format`       | Format source files (Prettier)                  |
| `npm run format:check` | Check formatting without modifying files        |

## Project overview

```text
src/
├── app/            Application source code
├── _tokens.scss    Design tokens (colours, spacing, typography)
├── styles.scss     Global styles
└── main.ts         Application bootstrap
```

[`AGENTS.md`](AGENTS.md) describes the team's engineering conventions.

The test suite checks behaviour through the rendered page: it finds elements by their accessible labels and `data-testid` attributes, and stubs the HTTP calls (`GET /api/issues`, `PATCH /api/issues/:id`). It shouldn't need major changes when the internal structure changes.

A CI workflow runs lint, tests and the build on every pull request.

## Candidate workflow

1. **Read the GitHub issue.** Make sure you understand the context and the acceptance criteria.
2. **Clone or fork the repository.**
3. **Create a feature branch**, for example `feature/FE-124-refactor-issue-management`.
4. **Inspect the existing implementation.** Run the app and the tests, and read the code.
5. **Prepare a short architectural plan before coding.** A few bullet points in the PR description or a comment on the issue is enough. Describe what you intend to change, in what order, and what you will deliberately leave out.
6. **Implement the refactoring.** Commit in small, meaningful steps.
7. **Run the tests and review your changes.** `npm test`, `npm run lint` and `npm run build` should all pass. Re-read your diff as a reviewer would.
8. **Prepare a pull request.** Fill in the PR template. It asks about your decisions, trade-offs, validation and AI usage.

## Submission

- Push your feature branch to your fork, or to the repository you were given access to.
- Open a pull request against `main` using the provided template.
- Send us the pull request link.

You may use AI coding assistants. You remain responsible for the result and should be ready to explain and defend every change in the follow-up discussion.
