import { useCallback, useState } from "react";
import type { DocxMetadata, PageDef, PaginatedResult, Paginator, PdfMetadata, XlsxMetadata } from "paginator";

export interface UsePaginatorExportResult {
  exportPdf: (metadata?: PdfMetadata) => Promise<Uint8Array>;
  exportDocx: (metadata?: DocxMetadata) => Promise<Uint8Array>;
  exportXlsx: (metadata?: XlsxMetadata) => Promise<Uint8Array>;
  isExporting: boolean;
}

/** Thin async wrappers around `Paginator.generatePdf/generateDocx/generateXlsx` with a shared
 *  `isExporting` flag. PDF export needs a `PaginatedResult`; DOCX/XLSX export take the
 *  pre-pagination `PageDef` directly (per the library's own signatures). */
export function usePaginatorExport(
  paginator: Paginator,
  doc: PageDef | null,
  result: PaginatedResult | null,
): UsePaginatorExportResult {
  const [isExporting, setIsExporting] = useState(false);

  const run = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    setIsExporting(true);
    try {
      return await fn();
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportPdf = useCallback(
    (metadata?: PdfMetadata) =>
      run(() => {
        if (!result) {
          return Promise.reject(
            new Error("usePaginatorExport: cannot export a PDF before the document has been paginated"),
          );
        }
        return paginator.generatePdf(result, metadata);
      }),
    [paginator, result, run],
  );

  const exportDocx = useCallback(
    (metadata?: DocxMetadata) =>
      run(() => {
        if (!doc) {
          return Promise.reject(new Error("usePaginatorExport: cannot export DOCX without a document definition"));
        }
        return paginator.generateDocx(doc, metadata);
      }),
    [paginator, doc, run],
  );

  const exportXlsx = useCallback(
    (metadata?: XlsxMetadata) =>
      run(() => {
        if (!doc) {
          return Promise.reject(new Error("usePaginatorExport: cannot export XLSX without a document definition"));
        }
        return paginator.generateXlsx(doc, metadata);
      }),
    [paginator, doc, run],
  );

  return { exportPdf, exportDocx, exportXlsx, isExporting };
}

/** Saves bytes returned by an export hook as a browser download. */
export function downloadBytes(bytes: Uint8Array, filename: string, mimeType: string): void {
  const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
