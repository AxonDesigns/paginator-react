import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Paginator, ZoomController, ZoomOptions } from "paginator";

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
export function useZoom(
  paginator: Paginator,
  hostRef: RefObject<HTMLElement | null>,
  options?: ZoomOptions,
): UseZoomResult {
  const controllerRef = useRef<ZoomController | null>(null);
  const rafRef = useRef<number | null>(null);
  const [zoom, setZoomState] = useState(options?.initial ?? 1);
  const optionsKey = JSON.stringify(options ?? {});

  // Polls getZoom() only while a zoom animation is actually in flight, instead of forever.
  const trackUntilSettled = useCallback(() => {
    const controller = controllerRef.current;
    if (!controller || rafRef.current !== null) return;
    let last = controller.getZoom();
    const step = () => {
      const current = controller.getZoom();
      setZoomState(current);
      if (current !== last) {
        last = current;
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const controller = paginator.createZoomController(host, options);
    controllerRef.current = controller;
    setZoomState(controller.getZoom());

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      controller.destroy();
      controllerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginator, hostRef, optionsKey]);

  return {
    zoom,
    setZoom: useCallback(
      (value: number) => {
        controllerRef.current?.setZoom(value);
        trackUntilSettled();
      },
      [trackUntilSettled],
    ),
    zoomIn: useCallback(() => {
      controllerRef.current?.zoomIn();
      trackUntilSettled();
    }, [trackUntilSettled]),
    zoomOut: useCallback(() => {
      controllerRef.current?.zoomOut();
      trackUntilSettled();
    }, [trackUntilSettled]),
    reset: useCallback(() => {
      controllerRef.current?.reset();
      trackUntilSettled();
    }, [trackUntilSettled]),
    fitWidth: useCallback(
      (pageWidth: number, availableWidth?: number) => {
        controllerRef.current?.fitWidth(pageWidth, availableWidth);
        trackUntilSettled();
      },
      [trackUntilSettled],
    ),
    refresh: useCallback(() => {
      controllerRef.current?.refresh();
    }, []),
  };
}
