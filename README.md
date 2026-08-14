# demo-resolved-control-flow

Runnable reproduction of a **local Angular fork**: `resolved()`, async
`computed()`, and `@resolved` / `@loading` / `@error`.

Public npm Angular 22.1 cannot compile this syntax. The app vendors snapshot
tarballs (`vendor/*.tgz`) built from the fork so StackBlitz and a fresh clone
use that compiler/runtime.

Inspired by [Solid.js 2.0](https://www.solidjs.com/blog/solid-2-0-rc-the-big-reveal).

## Angular version

Fork snapshot `22.2.0-next.1` with local POC changes — not the public 22.1 release.

## How to observe

1. **Load Ada** — `@loading`, then `@resolved` with the name and greeting.
2. **Reload** — previous content stays (stale-while-revalidate).
3. **Load Grace** — `@loading` again, then the new name.
4. **Error** — `@error`. The effect does not log.
5. **Reset** — back to idle / `@loading`.

Reading `fullName()` outside `@resolved` is a **compile-time** error.

## Commands

```bash
pnpm install
pnpm start
pnpm build
```

## Refresh vendor tarballs from the Angular monorepo

```bash
cd /path/to/angular
pnpm build
BAZEL_BIN=$(pnpm --silent bazel --ignore_all_rc_files info bazel-bin)
VENDOR=/path/to/demo-resolved-control-flow/vendor
for pkg in core compiler compiler-cli common platform-browser; do
  (cd "$BAZEL_BIN/packages/$pkg/npm_package" && npm pack --silent --pack-destination "$VENDOR")
done
```

Rename the packed files to `vendor/angular-<pkg>.tgz`.

Official alternative for linking without tarballs (local only, not StackBlitz):

```bash
cd /path/to/angular
pnpm ng-dev misc build-and-link /path/to/demo-resolved-control-flow
cd /path/to/demo-resolved-control-flow
pnpm exec ng cache disable
node --preserve-symlinks --preserve-symlinks-main node_modules/@angular/cli/lib/init.js serve
```

## Links

- Solid 2.0 async data: https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/05-async-data.md
- Solid 2.0 RC: https://www.solidjs.com/blog/solid-2-0-rc-the-big-reveal
- StackBlitz: https://stackblitz.com/github/RomainDood/demo-resolved-control-flow
