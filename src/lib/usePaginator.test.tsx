import { describe, expect, test } from "bun:test";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Paginator, definePage, group, text } from "paginator";
import type { PageDef, PaginatedResult } from "paginator";
import { usePaginator } from "./usePaginator";

// happy-dom has no Canvas 2D backend, and paginator's real `paginate()` measures text via
// `canvas.getContext('2d')` — so it can't actually run here. Instead of exercising the real
// measurement/render pipeline, this stubs `Paginator.paginate/mount/unmount` on a real instance
// (via `options.paginator`) and asserts THIS hook's own orchestration: register -> paginate ->
// mount on every doc change, and unmount exactly once on final teardown.
function createSpyPaginator() {
  const paginator = new Paginator();
  const calls = { paginate: [] as PageDef[], mount: [] as HTMLElement[], unmount: [] as HTMLElement[] };

  paginator.paginate = ((doc: PageDef) => {
    calls.paginate.push(doc);
    const result: PaginatedResult = {
      pageSize: { width: 100, height: 100 },
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
      headerHeight: 0,
      footerHeight: 0,
      headerGap: 0,
      footerGap: 0,
      pages: [],
    };
    return result;
  }) as Paginator["paginate"];

  paginator.mount = ((_result: PaginatedResult, host: HTMLElement) => {
    calls.mount.push(host);
    host.setAttribute("data-mount-count", String(calls.mount.length));
  }) as Paginator["mount"];

  paginator.unmount = ((host: HTMLElement) => {
    calls.unmount.push(host);
  }) as Paginator["unmount"];

  return { paginator, calls };
}

function makeDoc(content: string): PageDef {
  return definePage(
    { size: "Letter", margins: { top: 10, right: 10, bottom: 10, left: 10 } },
    group({ direction: "column" }, [text({ content, fontFamily: "Arial", fontSize: 12, lineHeight: 16 })]),
  );
}

function Harness({ doc, paginator }: { doc: PageDef; paginator: Paginator }) {
  const { hostRef } = usePaginator(doc, { paginator });
  return <div ref={hostRef} />;
}

/** Gives the hook's fire-and-forget `ready() -> paginate() -> mount()` chain a chance to flush,
 *  one macrotask + effect pass at a time. */
async function flush(times = 10) {
  for (let i = 0; i < times; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

describe("usePaginator", () => {
  test("paginates and (re)mounts on doc changes, then unmounts exactly once on teardown", async () => {
    const { paginator, calls } = createSpyPaginator();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<Harness doc={makeDoc("hello")} paginator={paginator} />);
    });
    await flush();

    const host = container.querySelector("div");
    expect(host).not.toBeNull();
    expect(calls.paginate.length).toBe(1);
    expect(calls.mount.length).toBe(1);
    expect(host!.getAttribute("data-mount-count")).toBe("1");

    await act(async () => {
      root.render(<Harness doc={makeDoc("goodbye")} paginator={paginator} />);
    });
    await flush();

    expect(calls.paginate.length).toBe(2);
    expect(calls.mount.length).toBe(2);
    expect(host!.getAttribute("data-mount-count")).toBe("2");
    // mount() is idempotent — re-rendering with a new doc must NOT unmount() the host in between.
    expect(calls.unmount.length).toBe(0);

    act(() => {
      root.unmount();
    });

    expect(calls.unmount.length).toBe(1);
    expect(calls.unmount[0]).toBe(host!);

    document.body.removeChild(container);
  });
});
