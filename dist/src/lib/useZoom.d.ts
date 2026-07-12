import type { RefObject } from "react";
import type { Paginator, ZoomOptions } from "paginator";
export interface UseZoomResult {
    zoom: number;
    setZoom: (value: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
    fitWidth: (pageWidth: number, availableWidth?: number) => void;
    /** Re-measures the host after different content was mounted into it (e.g. `doc` changed) while
     *  this same controller is still in use. `PaginatorView` calls this automatically. */
    refresh: () => void;
}
/** Wraps `Paginator.createZoomController` — creates the controller once a host element exists,
 *  destroys it on cleanup, and mirrors its (animated) zoom factor into React state. */
export declare function useZoom(paginator: Paginator, hostRef: RefObject<HTMLElement | null>, options?: ZoomOptions): UseZoomResult;
