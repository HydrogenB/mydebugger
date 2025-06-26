import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ProgressBar } from '../src/design-system/components/feedback/ProgressBar';

test('renders progress bar with correct width', () => {
  const { getByRole } = render(<ProgressBar value={50} />);
  const bar = getByRole('progressbar');
  expect(bar).toHaveAttribute('aria-valuenow', '50');
  const inner = bar.firstChild as HTMLElement;
  expect(inner).toHaveStyle('width: 50%');
});
