import { useEffect, useState } from "react";
import type { RefObject } from "react";
import type { AttachInteractionsOptions, InteractionController, PaginatedResult, Paginator } from "paginator";

export interface UseInteractionsResult {
  controller: InteractionController | null;
}

/**
 * Wraps `Paginator.attachInteractions`, which requires `mount()` to have already run on `host` —
 * gating on `result` (only ever non-null once `usePaginator` has mounted content) guarantees that
 * ordering. Subscribe via `controller.on('click' | 'hover' | 'drag' | ..., handler)` yourself; it
 * already returns its own unsubscribe function.
 *
 * `options.zoom`, if provided, should be a referentially-stable "live getter" (reading from a ref)
 * rather than a fresh closure every render — it's intentionally excluded from this effect's
 * dependencies, same as the library's own doc comment on `AttachInteractionsOptions.zoom` implies.
 */
export function useInteractions(
  paginator: Paginator,
  result: PaginatedResult | null,
  hostRef: RefObject<HTMLElement | null>,
  options?: AttachInteractionsOptions,
): UseInteractionsResult {
  const [controller, setController] = useState<InteractionController | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !result) return;

    const nextController = paginator.attachInteractions(result, host, options);
    setController(nextController);

    return () => {
      nextController.destroy();
      setController(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginator, result, hostRef, options?.dragThreshold]);

  return { controller };
}
