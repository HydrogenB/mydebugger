import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import TrustBanner from "../view/TrustBanner";

test("renders trust message", () => {
  render(<TrustBanner />);
  expect(screen.getByText(/Trusted by 1,200\+ developers/i)).toBeInTheDocument();
});
