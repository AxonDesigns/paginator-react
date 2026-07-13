import { useEffect, useState } from "react";
import type { ClickEvent } from "./lib";
import { downloadBytes, useInteractions, usePaginator, usePaginatorExport, useZoom } from "./lib";
import type { Product } from "./demo/sample-document";
import { sampleDocument } from "./demo/sample-document";

/**
 * Demo of the paginator-react wrapper: renders `sampleDocument`, wires up zoom controls, PDF/
 * DOCX/XLSX export buttons, and a side panel driven by clicking a product row — one usage of
 * each of the four hooks in `src/lib`.
 */
export default function App() {
  const { hostRef, paginator, result, status, error } = usePaginator(sampleDocument);
  const zoom = useZoom(paginator, hostRef, { min: 0.5, max: 2, step: 0.25, initial: 1 });
  const { exportPdf, exportDocx, exportXlsx, isExporting } = usePaginatorExport(paginator, sampleDocument, result);
  // `zoom.getZoom` is a stable ref-backed getter (not the `zoom.zoom` state value) — attachInteractions
  // reads it on every pointer event to convert screen px back to unscaled page-content px, so it needs
  // to stay accurate as the user zooms in/out, not just reflect whatever zoom was active on first attach.
  const { controller } = useInteractions(paginator, result, hostRef, { zoom: zoom.getZoom });
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    if (!controller) return;
    return controller.on("click", (event: ClickEvent) => {
      const metadata = event.target.node.metadata;
      if (metadata) setSelected(metadata as unknown as Product);
    });
  }, [controller]);

  async function handleExport(kind: "pdf" | "docx" | "xlsx") {
    try {
      if (kind === "pdf") {
        downloadBytes(await exportPdf({ title: "Q3 Sales Report" }), "q3-sales-report.pdf", "application/pdf");
      } else if (kind === "docx") {
        downloadBytes(
          await exportDocx({ title: "Q3 Sales Report" }),
          "q3-sales-report.docx",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
      } else {
        downloadBytes(
          await exportXlsx({ title: "Q3 Sales Report" }),
          "q3-sales-report.xlsx",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
      }
    } catch (err) {
      console.error(`Failed to export ${kind}`, err);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 16px",
          borderBottom: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        <strong>paginator-react demo</strong>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <button onClick={zoom.zoomOut}>−</button>
          <span style={{ width: 48, textAlign: "center" }}>{Math.round(zoom.zoom * 100)}%</span>
          <button onClick={zoom.zoomIn}>+</button>
          <button onClick={() => result && zoom.fitWidth(result.pageSize.width)}>Fit width</button>
          <button onClick={zoom.reset}>Reset</button>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button disabled={isExporting} onClick={() => handleExport("pdf")}>
            Download PDF
          </button>
          <button disabled={isExporting} onClick={() => handleExport("docx")}>
            Download DOCX
          </button>
          <button disabled={isExporting} onClick={() => handleExport("xlsx")}>
            Download XLSX
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ flex: 1, overflow: "auto", background: "#f1f5f9", padding: 24 }}>
          {status === "error" && (
            <p style={{ color: "#dc2626" }}>Failed to render document: {String(error)}</p>
          )}
          <div ref={hostRef} />
        </div>

        <aside style={{ width: 260, flexShrink: 0, borderLeft: "1px solid #e2e8f0", padding: 16, background: "#ffffff" }}>
          <h3 style={{ marginTop: 0 }}>Selected product</h3>
          {selected ? (
            <dl style={{ margin: 0 }}>
              <dt style={{ fontWeight: 600 }}>Name</dt>
              <dd style={{ margin: "0 0 8px" }}>{selected.name}</dd>
              <dt style={{ fontWeight: 600 }}>Category</dt>
              <dd style={{ margin: "0 0 8px" }}>{selected.category}</dd>
              <dt style={{ fontWeight: 600 }}>Units sold</dt>
              <dd style={{ margin: "0 0 8px" }}>{selected.unitsSold.toLocaleString()}</dd>
              <dt style={{ fontWeight: 600 }}>Revenue</dt>
              <dd style={{ margin: 0 }}>${selected.revenue.toLocaleString()}</dd>
            </dl>
          ) : (
            <p style={{ color: "#64748b" }}>Click a product name in the table to see details here.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
