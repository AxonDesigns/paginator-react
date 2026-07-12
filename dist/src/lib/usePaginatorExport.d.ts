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
export declare function usePaginatorExport(paginator: Paginator, doc: PageDef | null, result: PaginatedResult | null): UsePaginatorExportResult;
/** Saves bytes returned by an export hook as a browser download. */
export declare function downloadBytes(bytes: Uint8Array, filename: string, mimeType: string): void;
