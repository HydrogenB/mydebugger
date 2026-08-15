/**
 * © 2025 MyDebugger Contributors – MIT License
 */

import { copyText } from '../../src/shared/utils/clipboard';

describe('copyText', () => {
  const originalClipboard = navigator.clipboard;
  const originalExecCommand = document.execCommand;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: originalClipboard,
    });
    document.execCommand = originalExecCommand;
    document.body.innerHTML = '';
  });

  it('resolves true and forwards the exact text when the async path succeeds', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    });

    const result = await copyText('hello world');

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith('hello world');
  });

  it('falls back to execCommand when the async path rejects', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: { writeText },
    });
    document.execCommand = jest.fn().mockReturnValue(true);

    const result = await copyText('fallback text');

    expect(result).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('uses execCommand when navigator.clipboard is entirely absent', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    document.execCommand = jest.fn().mockReturnValue(true);

    const result = await copyText('no clipboard api');

    expect(result).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('resolves false without throwing when both paths fail', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    document.execCommand = jest.fn().mockReturnValue(false);

    const result = await copyText('nope');

    expect(result).toBe(false);
  });

  it('resolves false and removes the temporary textarea when execCommand throws', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    document.execCommand = jest.fn().mockImplementation(() => {
      throw new Error('boom');
    });

    const result = await copyText('throws');

    expect(result).toBe(false);
    expect(document.body.querySelector('textarea')).toBeNull();
  });
});
