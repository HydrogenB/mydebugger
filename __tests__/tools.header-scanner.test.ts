import React from 'react';
import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import { analyzeHeaders, getSecurityScore } from '../src/tools/header-scanner/lib/headerScanner';
import useHeaderScanner from '../src/tools/header-scanner/hooks/useHeaderScanner';
import HeaderScannerView from '../src/tools/header-scanner/components/HeaderScannerPanel';

describe('Header Scanner', () => {
  test('analyzeHeaders with provided Headers object', async () => {
    const headers = new Headers({
      'x-frame-options': 'DENY',
      'content-security-policy': "default-src 'self'",
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
    });
    const results = await analyzeHeaders(headers);
    expect(results.every(r => r.status === 'ok')).toBe(true);
    expect(getSecurityScore(results)).toBe(100);
  });

  test('getSecurityScore handles empty', () => {
    expect(getSecurityScore([])).toBe(0);
  });
});

// Regression coverage for the per-row copy-feedback fix (Task 8 / finding U3):
// `useHeaderScanner` used to expose a single shared `copied` boolean with no
// reset, so clicking any row's copy button flipped every row's label to
// "Copied" for the rest of the session, and a denied clipboard looked like a
// silent no-op. These tests drive the real hook wired to the real panel (not
// a mock of `copy`/`copyStatus`), and drive clipboard failure through the
// real `navigator.clipboard.writeText` + `document.execCommand` paths (not a
// mock of `copyText`), so the per-row scoping, the reset timer, and the
// clipboard-denied path are all proven through the actual integration.

// A handful of native-Promise microtask ticks, enough to drain the
// `copy()` -> `copyText()` -> `navigator.clipboard.writeText()` await chain
// (or the `scan()` -> `analyzeHeaders()` -> `fetch()` chain) started by an
// un-awaited event handler, without depending on timers.
const flushPromises = async () => {
  for (let i = 0; i < 5; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

function Harness() {
  const vm = useHeaderScanner();
  return React.createElement(HeaderScannerView, vm);
}

const scanResponse = () => ({
  type: 'basic',
  headers: new Headers({
    'x-frame-options': 'DENY',
    'content-security-policy': "default-src 'self'",
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
  }),
});

async function renderScanned() {
  const view = render(React.createElement(Harness));
  fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'example.com' } });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Scan' }));
    await flushPromises();
  });
  // One row per known security header, each with its own "Copy ..." button.
  const buttons = screen.getAllByRole('button', { name: /^Copy/ });
  return { ...view, buttons };
}

const clickCopy = async (button: HTMLElement) => {
  await act(async () => {
    fireEvent.click(button);
    await flushPromises();
  });
};

describe('Header Scanner copy feedback (per-row, reset, failure)', () => {
  const originalClipboard = navigator.clipboard;
  const originalExecCommand = document.execCommand;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(scanResponse()) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
    });
    document.execCommand = originalExecCommand;
  });

  test('clicking one row copy button marks only that row', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    const { buttons } = await renderScanned();
    expect(buttons.length).toBeGreaterThan(1);

    await clickCopy(buttons[0]);

    expect(buttons[0].textContent).toBe('Copied');
    buttons.slice(1).forEach((button) => {
      expect(button.textContent).toBe('Copy value');
    });
  });

  test('copied feedback clears after the delay without affecting other rows', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    const { buttons } = await renderScanned();

    jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
    await clickCopy(buttons[0]);
    expect(buttons[0].textContent).toBe('Copied');

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(buttons[0].textContent).toBe('Copy value');
  });

  test('a second copy before the first timeout does not clear early', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    const { buttons } = await renderScanned();

    jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
    await clickCopy(buttons[0]);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    await clickCopy(buttons[1]);

    // Row 1's stale 2s timer (started at t=0) would fire around t=2000;
    // row 2 started its own timer at t=1000. Advancing 1100ms more
    // (t=2100 total) must not clear row 2's still-pending feedback early,
    // and must not re-affect row 1 (already cleared or not, its own
    // business — the point is row 2 owns its own timer).
    await act(async () => {
      jest.advanceTimersByTime(1100);
    });
    expect(buttons[1].textContent).toBe('Copied');

    await act(async () => {
      jest.advanceTimersByTime(900);
    });
    expect(buttons[1].textContent).toBe('Copy value');
  });

  test('a rejected copy surfaces failure instead of silently reverting', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    });
    document.execCommand = jest.fn().mockReturnValue(false);

    const { buttons } = await renderScanned();

    await clickCopy(buttons[0]);

    expect(buttons[0].textContent).toBe('Copy failed');
  });

  test('the reset timer is cleared on unmount so it cannot fire after teardown', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    const { buttons, unmount } = await renderScanned();

    jest.useFakeTimers({ doNotFake: ['queueMicrotask'] });
    await clickCopy(buttons[0]);

    const consoleErrorSpy = jest.spyOn(console, 'error');
    unmount();
    // Advancing time now must not trigger a state update against the
    // unmounted component's pending copy-reset timer (which would surface
    // as a React "state update on an unmounted component" console.error).
    jest.advanceTimersByTime(5000);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
