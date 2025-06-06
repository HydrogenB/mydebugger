import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Textbox from "@/view/ui/Textbox";

describe("Textbox", () => {
  it("toggles password visibility", () => {
    render(<Textbox type="password" label="pwd" />);
    const btn = screen.getByRole("button");
    const input = screen.getByLabelText("pwd");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(btn);
    expect(input).toHaveAttribute("type", "text");
  });

  it("shows counter", () => {
    render(<Textbox value="abc" showCounter onChange={() => {}} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
