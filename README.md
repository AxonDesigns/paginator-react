# paginator-react

React bindings for [paginator](https://github.com/AxonDesigns/paginator), a
declarative print/PDF-style document pagination engine — hooks + a component
for mounting a paginated document into a React tree, plus zoom controls,
PDF/DOCX/XLSX export, and click/hover/drag interactions.

## Installing in another project

Like `paginator` itself, this package isn't published to npm. Install it
straight from the repo, with `paginator` and `react`/`react-dom` alongside it:

```bash
bun add github:<you>/paginator-react paginator@github:AxonDesigns/paginator react react-dom
```

`dist/` is committed to this repo (same as `paginator`'s own `dist/`), so no
build step runs on install.

## Usage

```tsx
import { usePaginator, useZoom, usePaginatorExport, downloadBytes, definePage, group, text } from "paginator-react";

const doc = definePage(
  { size: "Letter", margins: { top: 56, right: 56, bottom: 56, left: 56 } },
  group({ direction: "column", gap: 16 }, [
    text({ content: "Hello", fontFamily: "Helvetica", fontSize: 24, fontWeight: 700, lineHeight: 30 }),
  ]),
);

function Report() {
  const { hostRef, paginator, result } = usePaginator(doc);
  const zoom = useZoom(paginator, hostRef);
  const { exportPdf } = usePaginatorExport(paginator, doc, result);

  return (
    <div>
      <button onClick={() => zoom.zoomIn()}>Zoom in</button>
      <button onClick={async () => downloadBytes(await exportPdf(), "report.pdf", "application/pdf")}>
        Download PDF
      </button>
      <div ref={hostRef} />
    </div>
  );
}
```

Or use the `<PaginatorView>` component for the simple case (it wires up the
same hooks internally, and exposes them via `ref` for anything more advanced):

```tsx
import { PaginatorView } from "paginator-react";

<PaginatorView doc={doc} />;
```

See `src/lib/` for the full hook set (`usePaginator`, `useZoom`,
`usePaginatorExport`, `useInteractions`) and `src/App.tsx` /
`src/demo/sample-document.ts` for a complete working example (zoom toolbar,
export buttons, a clickable table driving a side panel).

## Developing this repo

To install dependencies:

```bash
bun install
```

To run the demo app:

```bash
bun run dev
```

To build the library (`dist/index.js` + `dist/index.d.ts`, what consumers
actually import):

```bash
bun run build
```

To build the demo app as a static site (output goes to `demo-dist/`, kept
separate from the library's own `dist/`):

```bash
bun run build:demo
```

To run tests:

```bash
bun test
```

This project was created using `bun init` in bun v1.3.13. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
