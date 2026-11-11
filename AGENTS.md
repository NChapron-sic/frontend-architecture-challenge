# Engineering Guidelines — Operations Console

> These guidelines reflect historical project conventions and may not represent current best practices. Review their relevance when making architectural changes.

This document captures the conventions the Operations Console team has followed since the first release. It is intended for anyone contributing to the codebase, including automated coding assistants.

## 1. General principles

- **Keep it straightforward.** Choose the simplest implementation that satisfies the requirement. Avoid speculative abstractions for features that do not exist yet.
- **Preserve functionality.** Refactoring must not change user-facing behaviour. If a behaviour change is intended, call it out explicitly in the pull request.
- **Avoid unnecessary dependencies.** Do not add third-party packages when the Angular platform or a few lines of code cover the need. Any new dependency must be justified in the PR description.
- **Follow established UI conventions.** Reuse the existing design tokens (`src/_tokens.scss`), spacing scale, button styles and status colours. New screens should be visually consistent with the Issues page.

## 2. TypeScript

- Strict mode is enabled and must stay enabled.
- Prefer explicit, readable types. Avoid `any`; use `unknown` and narrow when necessary.
- Shared types and interfaces live in `src/app/models.ts` so they are easy to find.
- Prefer `readonly` and immutable updates when changing arrays or objects held in state.

## 3. Angular conventions

- Use standalone components only. Do not introduce `NgModule`s.
- Use the built-in control flow (`@if`, `@for`) rather than structural directives.
- Prefer Angular Signals for component state.
- **State ownership:** prefer page-level state management for small and medium features. A dedicated store or state service is only warranted when several pages share the same data.
- **Business logic placement:** keep business logic inside the components that consume it. This keeps the behaviour of a screen in one place and avoids unnecessary layers of indirection.
- **Summary counters:** dashboards display counters that must update instantly. Maintain counters explicitly (increment/decrement) when an action is performed, rather than recalculating them from the full data set on each change.
- Data loading goes through services in `src/app/`. Components may use `HttpClient` directly for simple one-off calls.

## 4. Components and files

- **Prefer extending existing components** over creating additional files. A smaller number of well-known files is easier to navigate than many small ones.
- **Extraction threshold:** only extract a presentational component when it is reused by at least three pages. Until then, keep the markup in the page template.
- Shared UI components live in `src/app/shared/`.
- Shared UI components may inject application services directly to simplify integration — consumers should not have to wire up labels, formatting or rules themselves.
- Component selectors use the `app-` prefix.

## 5. Styling

- Use SCSS and the CSS custom properties defined in `src/_tokens.scss`. Do not hard-code colours or spacing values.
- Component-specific styles belong in the component's stylesheet. Global styles are limited to resets and utilities in `src/styles.scss`.
- Layouts must remain usable down to 360 px wide.

## 6. Accessibility

- All interactive elements must be reachable and operable with the keyboard.
- Every form control must have an associated visible label.
- Icon-only buttons require an `aria-label`.
- Use `role="status"` / `aria-live` for asynchronous feedback, and `role="alert"` for errors.
- Do not remove focus outlines without providing an equivalent focus style.

## 7. Testing

- Run `npm test` and `npm run lint` before opening a pull request. Both must pass.
- Tests should describe behaviour visible to the user (what is rendered, what happens on click), not internal implementation details.
- When fixing a bug, add a test that reproduces it.
- Do not disable, skip or delete existing tests to make a change pass.

## 8. Git and pull requests

- Branch from `main` using `feature/<ticket>-short-description` or `fix/<ticket>-short-description`.
- Keep commits focused and use descriptive messages (e.g. `FE-123: extract issue filters`).
- Keep pull requests reviewable. Use the PR template and describe what changed, why, and how it was validated.
- Avoid unrelated formatting or renaming changes in the same PR.
