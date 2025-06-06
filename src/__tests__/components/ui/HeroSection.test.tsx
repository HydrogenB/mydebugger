import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HeroSection from "@/components/ui/HeroSection";
import "@testing-library/jest-dom";

describe("HeroSection", () => {
  it("renders the hero title", () => {
    render(<HeroSection searchQuery="" onSearchChange={() => {}} />);

    const titleElement = screen.getByText(/MyDebugger/i);
    expect(titleElement).toBeInTheDocument();
    expect(
      screen.getByText(/open-source toolbox for web & mobile developers/i),
    ).toBeInTheDocument();
  });

  it("renders the search box with correct placeholder", () => {
    render(<HeroSection searchQuery="" onSearchChange={() => {}} />);

    const searchBox = screen.getByPlaceholderText(/Search tools.../i);
    expect(searchBox).toBeInTheDocument();
  });

  it("calls the onSearchChange handler when typing in the search box", () => {
    const mockOnSearchChange = jest.fn();

    render(<HeroSection searchQuery="" onSearchChange={mockOnSearchChange} />);

    const searchBox =
      screen.getByPlaceholderText<HTMLInputElement>(/Search tools.../i);
    fireEvent.change(searchBox, { target: { value: "jwt" } });

    expect(mockOnSearchChange).toHaveBeenCalledWith("jwt");
  });
});
