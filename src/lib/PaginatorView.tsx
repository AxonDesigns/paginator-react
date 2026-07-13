import { useEffect, useImperativeHandle } from "react";
import type { HTMLAttributes, Ref } from "react";
import type { AttachInteractionsOptions, InteractionController, PageDef, PaginatedResult, Paginator, ZoomOptions } from "paginator";
import { usePaginator } from "./usePaginator";
import type { FontDescriptor } from "./usePaginator";
import { useZoom } from "./useZoom";
import type { UseZoomResult } from "./useZoom";
import { useInteractions } from "./useInteractions";

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
export function PaginatorView(props: PaginatorViewProps) {
  const { doc, fonts, paginator: paginatorProp, zoomOptions, interactionOptions, onPaginated, ref, ...rest } = props;

  const { hostRef, paginator, result } = usePaginator(doc, { paginator: paginatorProp, fonts });
  const zoom = useZoom(paginator, hostRef, zoomOptions);
  // Defaults hit-testing to this view's own live zoom factor — attachInteractions divides pointer
  // coordinates by it to recover unscaled page-content px, so this must track the actual applied
  // CSS scale or clicks drift out of alignment with what's on screen as soon as you zoom.
  const { controller } = useInteractions(paginator, result, hostRef, {
    zoom: zoom.getZoom,
    ...interactionOptions,
  });

  useEffect(() => {
    if (result) onPaginated?.(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (result) zoom.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useImperativeHandle(
    ref,
    () => ({
      paginator,
      result,
      zoom,
      interactions: controller,
      host: hostRef.current,
    }),
    [paginator, result, zoom, controller, hostRef],
  );

  return <div ref={hostRef} {...rest} />;
}
