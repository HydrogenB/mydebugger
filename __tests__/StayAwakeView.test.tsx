import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import StayAwakeView from '../view/StayAwakeView';

test('renders toggle when supported', () => {
  render(<StayAwakeView enabled supported toggle={async () => {}} />);
  expect(screen.getByRole('switch')).toBeInTheDocument();
  expect(screen.getByText('Stay Awake')).toBeInTheDocument();
});

test('shows unsupported message', () => {
  render(<StayAwakeView enabled={false} supported={false} toggle={async () => {}} />);
  expect(screen.getByText(/Wake Lock not supported/i)).toBeInTheDocument();
});
