import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

// Lets React's `act()` (used to flush effects in component tests) recognize happy-dom as a
// legitimate test environment instead of warning on every call.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// happy-dom doesn't implement the CSS Font Loading API at all (no `document.fonts`), but
// `paginator`'s `ready()` helper awaits `document.fonts.ready` unconditionally. Stub it so tests
// that mount a document don't throw before ever calling `paginate()`/`mount()`.
if (!document.fonts) {
  (document as unknown as { fonts: { ready: Promise<void> } }).fonts = { ready: Promise.resolve() };
}
