import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import ProgressRing from '../src/design-system/components/feedback/ProgressRing';

test('renders progress ring with correct stroke offset', () => {
  const { container } = render(<ProgressRing progress={0.5} radius={50} stroke={10} />);
  const circle = container.querySelector('circle');
  expect(circle).toBeInTheDocument();
  const r = 50 - 5;
  const circumference = 2 * Math.PI * r;
  const expectedOffset = circumference * 0.5;
  expect(circle).toHaveAttribute('stroke-dashoffset', expect.stringContaining(expectedOffset.toFixed(2).slice(0,4)));
});
