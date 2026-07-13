import { chart, definePage, group, separator, table, text } from "paginator";
import type { PageDef, TextAlign } from "paginator";

export interface Product {
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export const PRODUCTS: Product[] = [
  { name: "Aurora Desk Lamp", category: "Lighting", unitsSold: 1240, revenue: 37200 },
  { name: "Nimbus Office Chair", category: "Seating", unitsSold: 860, revenue: 129000 },
  { name: "Basalt Standing Desk", category: "Desks", unitsSold: 540, revenue: 216000 },
  { name: "Halo Monitor Arm", category: "Accessories", unitsSold: 1980, revenue: 59400 },
  { name: "Cinder Bookshelf", category: "Storage", unitsSold: 410, revenue: 82000 },
];

const currency = (value: number) => `$${value.toLocaleString("en-US")}`;

function cellText(
  content: string,
  opts: { bold?: boolean; align?: TextAlign; interactive?: boolean; metadata?: Record<string, unknown>; id?: string } = {},
) {
  return text({
    content,
    fontFamily: "Helvetica",
    fontSize: 11,
    fontWeight: opts.bold ? 700 : 400,
    lineHeight: 15,
    align: opts.align ?? "left",
    color: opts.interactive ? "#1d4ed8" : "#0f172a",
    interactive: opts.interactive,
    metadata: opts.metadata,
    id: opts.id,
  });
}

const salesTable = table({
  columns: [
    { content: cellText("Product", { bold: true }), width: 3 },
    { content: cellText("Category", { bold: true }), width: 2 },
    { content: cellText("Units sold", { bold: true, align: "right" }), width: 1.4, align: "end" },
    { content: cellText("Revenue", { bold: true, align: "right" }), width: 1.4, align: "end" },
  ],
  headerBackground: "#f1f5f9",
  border: {
    inner: { mode: "horizontal", color: "#e2e8f0" },
    outer: { mode: "all", color: "#cbd5e1", thickness: 2 },
  },
  stripe: { even: "#ffffff", odd: "#f8fafc" },
  cellPadding: 8,
  rows: PRODUCTS.map((product, index) => ({
    cells: [
      {
        content: cellText(product.name, {
          interactive: true,
          id: `product-${index}`,
          metadata: { ...product },
        }),
      },
      { content: cellText(product.category) },
      { content: cellText(String(product.unitsSold), { align: "right" }) },
      { content: cellText(currency(product.revenue), { align: "right" }) },
    ],
  })),
});

const revenueChart = chart({
  chartKind: "categorical",
  title: "Revenue by product",
  categories: PRODUCTS.map((product) => product.name),
  series: [{ name: "Revenue ($)", data: PRODUCTS.map((product) => product.revenue), kind: "bar", color: "#2563eb" }],
  height: 220,
  legend: { show: false },
  axis: { tickFontSize: 10, categoryFontSize: 9 },
});

/** A multi-section document (header/footer, prose, an interactive table, a chart) used to
 *  exercise the wrapper end-to-end in the demo app. */
export const sampleDocument: PageDef = definePage(
  {
    size: "Letter",
    margins: { top: 64, right: 56, bottom: 64, left: 56 },
    headerGap: 20,
    footerGap: 16,
    header: () =>
      group({ direction: "row", mainAlign: "space-between", crossAlign: "center" }, [
        text({
          content: "Quarterly Sales Report",
          fontFamily: "Helvetica",
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 14,
          color: "#0f172a",
        }),
        text({
          content: "Acme Furnishings — Internal",
          fontFamily: "Helvetica",
          fontSize: 10,
          lineHeight: 13,
          color: "#64748b",
        }),
      ]),
    footer: ({ pageNumber, totalPages }) =>
      text({
        content: `Page ${pageNumber} of ${totalPages}`,
        fontFamily: "Helvetica",
        fontSize: 10,
        lineHeight: 13,
        color: "#64748b",
        align: "right",
      }),
  },
  group({ direction: "column", gap: 20 }, [
    text({
      content: "Q3 Product Performance",
      fontFamily: "Helvetica",
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 30,
      color: "#0f172a",
    }),
    text({
      content:
        "This report summarizes unit sales and revenue across the top five products for the third quarter. Click a product name in the table below to inspect it.",
      fontFamily: "Helvetica",
      fontSize: 12,
      lineHeight: 18,
      color: "#334155",
    }),
    separator({ thickness: 1, color: "#e2e8f0" }),
    salesTable,
    revenueChart,
  ]),
);
