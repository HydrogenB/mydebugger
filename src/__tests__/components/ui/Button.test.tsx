import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "@/view/ui/Button";

describe("Button", () => {
  it("handles click", () => {
    const fn = jest.fn();
    render(<Button onClick={fn}>Press</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalled();
  });

  it("shows loading", () => {
    render(<Button loading>Load</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  });
});
