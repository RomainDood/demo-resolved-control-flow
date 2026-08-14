# demo-resolved-control-flow

Interactive reproduction for an Angular feature request: first-class async
`computed()` values and `@resolved` / `@loading` / `@error` control flow,
aligned with `resource()` statuses.

This is a **conceptual POC demo** on public Angular 22.1. The proposed compiler
syntax does not exist in this build. The left column runs today's
`resource()` + status checks. The right column shows the API a local Angular
fork compiled.

Inspired by [Solid.js 2.0](https://www.solidjs.com/blog/solid-2-0-rc-the-big-reveal)
async computations and `<Loading>`.

## Angular version

22.1.x (`@angular/core` / CLI 22.1)

## Constraints

- Standalone, CSS, no routing, no SSR, no tests
- Only `resource()`, `computed()`, and `effect()` from `@angular/core`
- No private Angular packages

## How to observe the scenario

1. Click **Load Ada** — user goes `loading`, then the name and a chained greeting appear.
2. Click **Reload** — the previous name stays visible (stale-while-revalidate).
3. Click **Load Grace** — a new load replaces the previous value after loading.
4. Click **Error** — the error branch is shown; the effect does not log.
5. Click **Reset** — back to `idle`.

## Commands

```bash
pnpm install
pnpm start
pnpm build
```

## Links

- Solid 2.0 async data: https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/05-async-data.md
- Solid 2.0 RC: https://www.solidjs.com/blog/solid-2-0-rc-the-big-reveal
- StackBlitz: https://stackblitz.com/github/RomainDood/demo-resolved-control-flow
