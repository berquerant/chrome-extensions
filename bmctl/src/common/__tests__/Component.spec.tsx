import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import * as Component from "../Component";

afterEach(cleanup);

describe("Select Items", () => {
  const id = "ident";
  it("render the empty select", () => {
    const items = {} as { [key: string]: string };
    render(<Component.SelectItems id={id} items={items} />);
    const got = screen.getByRole("combobox");
    expect(got).toBeEmptyDOMElement();
  });
  it("render elements", () => {
    const items = {
      apple: "red",
      banana: "yellow",
      letus: "green",
    };
    render(<Component.SelectItems id={id} items={items} />);
    const got = screen.getByRole("combobox") as HTMLSelectElement;
    expect(got.length).toBe(3);
    Object.entries(items).forEach(([k, v], i) => {
      const e = got.children.item(i);
      expect(e.attributes.getNamedItem("value").value).toBe(v);
      expect(e.textContent).toBe(k);
    });
  });
});
