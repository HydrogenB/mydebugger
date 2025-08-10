import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
let TrustBanner: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  TrustBanner = require('../src/design-system/components/display/TrustBanner').default;
} catch {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    TrustBanner = require('../view/TrustBanner').default;
  } catch {
    test.skip('TrustBanner suite skipped (component not found)', () => {});
  }
}

test("renders trust message", () => {
  render(<TrustBanner />);
  expect(screen.getByText(/Trusted by 1,200\+ developers/i)).toBeInTheDocument();
});
