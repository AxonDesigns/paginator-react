import type { RefObject } from "react";
import { Paginator } from "paginator";
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
export declare function usePaginator(doc: PageDef | null, options?: UsePaginatorOptions): UsePaginatorResult;
