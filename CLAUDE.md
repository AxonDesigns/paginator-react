
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Project setup

This project wraps [paginator](https://github.com/AxonDesigns/paginator) (a
declarative print/PDF-style document pagination engine) for React.

- `react` and `react-dom` are installed normally.
- `paginator` is **not published to npm** (the `paginator` name on npm is an
  unrelated package). It's installed directly from GitHub via
  `bun add github:AxonDesigns/paginator`, which is why `package.json` lists it
  as `"paginator": "github:AxonDesigns/paginator"`. Its `dist/` build output is
  committed to that repo, so no build step is needed after install.
- `paginator`'s public API is the `Paginator` class (`paginate`, `mount`,
  `generatePdf`, etc. are instance methods, each scoped to that instance's own
  font registry) plus standalone node builders (`definePage`, `group`, `text`,
  `table`, `chart`, ...) and a top-level `ready()` helper. Import all of it
  from the `"paginator"` package.
- `paginator` touches DOM APIs (`DOMParser`, `document.fonts`) even at module
  load time, so it cannot be imported in a bare `bun test` environment.
  `@happy-dom/global-registrator` is installed as a dev dependency and
  registered as a global DOM before tests run via `bunfig.toml`'s
  `[test] preload = ["./happydom.ts"]`. Don't remove this preload — importing
  `paginator` (or anything that imports it) in a test will throw
  `ReferenceError: DOMParser is not defined` without it.
- `vite` (+ `@vitejs/plugin-react`) is used for the **dev server only**
  (`bun run dev`, config in `vite.config.ts`), not for testing — `bun test`
  (with the happy-dom preload above) still owns tests, per this file's
  Bun-first policy. Vite was pulled in specifically because `paginator`
  renders into real DOM via Shadow DOM and needs a browser to visually verify
  against, which `bun --hot index.ts` (a plain script entry, no HTML/browser
  target) doesn't provide. Entry point is `index.html` → `src/main.tsx` →
  `src/App.tsx`, which mounts a `Paginator` instance into a ref'd div — treat
  `App.tsx` as a scratch/demo harness for trying things visually, not
  production structure. `bun run build` / `bun run preview` (vite build/
  preview) are also available.
