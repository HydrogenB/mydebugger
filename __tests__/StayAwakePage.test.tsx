import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '../src/test-utils/test-utils';
import StayAwakePage from '../src/tools/stayawake/page';

jest.mock('../src/tools/stayawake/components/StayAwakePanel', () => ({
  __esModule: true,
  default: function DummyView() {
    return <div role="switch" />;
  },
}));

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

test('renders stay awake page on client', async () => {
  Object.defineProperty(global, 'navigator', {
    value: { wakeLock: { request: jest.fn().mockResolvedValue({ release: jest.fn() }) } },
    writable: true,
  });
  render(<StayAwakePage />);
  await waitFor(() => expect(screen.getByRole('switch')).toBeInTheDocument());
});
