import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { Paginator, ready } from "paginator";
import type { FontStyle, PageDef, PaginatedResult } from "paginator";

export type PaginatorStatus = "idle" | "loading" | "ready" | "error";

export interface FontDescriptor {
  family: string;
  url: string;
  weight?: number | string;
  style?: FontStyle;
}

export interface UsePaginatorOptions {
  /** Fonts to register on this hook's `Paginator` instance before every `paginate()` call. */
  fonts?: FontDescriptor[];
  /** Bring your own `Paginator` instance (e.g. to share one font registry across several
   *  documents) instead of letting the hook create and own one. */
  paginator?: Paginator;
}

export interface UsePaginatorResult {
  hostRef: RefObject<HTMLDivElement | null>;
  paginator: Paginator;
  result: PaginatedResult | null;
  status: PaginatorStatus;
  error: unknown;
}

/**
 * Owns the `paginator` library's imperative lifecycle: registers fonts, waits for `ready()`,
 * then `paginate()`s + `mount()`s `doc` into a host div on every change. `mount()` is idempotent
 * (safe to call repeatedly on the same host), so only the final unmount calls `paginator.unmount()`
 * — re-renders just re-mount into the same host.
 */
export function usePaginator(doc: PageDef | null, options?: UsePaginatorOptions): UsePaginatorResult {
  const hostRef = useRef<HTMLDivElement>(null);

  const ownPaginatorRef = useRef<Paginator | null>(null);
  if (!ownPaginatorRef.current) ownPaginatorRef.current = new Paginator();
  const paginator = options?.paginator ?? ownPaginatorRef.current;

  const [result, setResult] = useState<PaginatedResult | null>(null);
  const [status, setStatus] = useState<PaginatorStatus>("idle");
  const [error, setError] = useState<unknown>(null);

  const fontsKey = options?.fonts ? JSON.stringify(options.fonts) : "";

  useEffect(() => {
    // Captured eagerly, not read inside the cleanup itself — React nulls out refs before running
    // unmount cleanups, so a lazy `hostRef.current` read here would always see `null`.
    const host = hostRef.current;
    return () => {
      if (host) paginator.unmount(host);
    };
  }, [paginator]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !doc) return;

    let cancelled = false;
    setStatus("loading");
    setError(null);

    (async () => {
      if (options?.fonts) {
        await Promise.all(options.fonts.map((font) => paginator.registerFont(font)));
      }
      await ready();
      if (cancelled) return;

      const paginated = paginator.paginate(doc);
      paginator.mount(paginated, host);
      setResult(paginated);
      setStatus("ready");
    })().catch((err: unknown) => {
      if (cancelled) return;
      setError(err);
      setStatus("error");
    });

    return () => {
      cancelled = true;
    };
    // fontsKey stands in for options.fonts (by value, not identity); options.paginator is
    // already reflected via `paginator` itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc, paginator, fontsKey]);

  return { hostRef, paginator, result, status, error };
}
