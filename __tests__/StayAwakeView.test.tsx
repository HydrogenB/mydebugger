import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import StayAwakeView from '../view/StayAwakeView';

test('renders timer and quick buttons when supported', () => {
  render(
    <StayAwakeView
      supported
      running={false}
      timeLeft={0}
      duration={0}
      toggle={async () => {}}
      start={async () => {}}
      stats={{ todayMin: 0, weekHr: 0, weekMin: 0 }}
      resetStats={() => {}}
    />,
  );
  expect(screen.getByLabelText('Toggle screen-awake session')).toBeInTheDocument();
  expect(screen.getByText('30 min')).toBeInTheDocument();
});

test('shows unsupported message', () => {
  render(
    <StayAwakeView
      supported={false}
      running={false}
      timeLeft={0}
      duration={0}
      toggle={async () => {}}
      start={async () => {}}
      stats={{ todayMin: 0, weekHr: 0, weekMin: 0 }}
      resetStats={() => {}}
    />,
  );
  expect(screen.getByText(/Wake Lock not supported/i)).toBeInTheDocument();
});
