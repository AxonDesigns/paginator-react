import type { HTMLAttributes, Ref } from "react";
import type { AttachInteractionsOptions, InteractionController, PageDef, PaginatedResult, Paginator, ZoomOptions } from "paginator";
import type { FontDescriptor } from "./usePaginator";
import type { UseZoomResult } from "./useZoom";
export interface PaginatorViewProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    doc: PageDef | null;
    /** Fonts to register before pagination. Ignored if `paginator` is also given — register fonts
     *  on that instance yourself before passing it in. */
    fonts?: FontDescriptor[];
    /** Bring your own `Paginator` instance (e.g. to share a font registry across documents). */
    paginator?: Paginator;
    zoomOptions?: ZoomOptions;
    interactionOptions?: AttachInteractionsOptions;
    onPaginated?: (result: PaginatedResult) => void;
    ref?: Ref<PaginatorViewHandle>;
}
export interface PaginatorViewHandle {
    paginator: Paginator;
    result: PaginatedResult | null;
    zoom: UseZoomResult;
    interactions: InteractionController | null;
    host: HTMLDivElement | null;
}
/** Ergonomic component wrapping `usePaginator` + `useZoom` + `useInteractions`: renders the host
 *  div, keeps it in sync with `doc`, and exposes zoom/export/interaction handles via `ref`. */
export declare function PaginatorView(props: PaginatorViewProps): import("react").JSX.Element;
