import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LinkButton from "@/view/ui/LinkButton";

describe("LinkButton", () => {
  it("renders link", () => {
    render(<LinkButton href="/test">Test</LinkButton>);
    const link = screen.getByRole("link", { name: /test/i });
    expect(link).toBeInTheDocument();
  });
});
