import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { definePage, group, text, Paginator } from "paginator";

describe("dev environment smoke test", () => {
  test("react renders", () => {
    const html = renderToStaticMarkup(React.createElement("div", null, "hello"));
    expect(html).toBe("<div>hello</div>");
  });

  test("paginator node builders and Paginator class are importable", () => {
    const doc = definePage(
      { size: "Letter", margins: { top: 10, right: 10, bottom: 10, left: 10 } },
      group({ direction: "column" }, [text({ content: "hi", fontFamily: "Arial", fontSize: 12, lineHeight: 16 })]),
    );

    expect(doc).toBeDefined();
    expect(new Paginator()).toBeInstanceOf(Paginator);
  });
});
