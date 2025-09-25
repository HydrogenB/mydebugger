/**
 * ? 2025 MyDebugger Contributors – MIT License
 */
import { checkPermissionStatus } from '../../src/tools/permission-tester/lib/permissions';

describe('permissions model helpers', () => {
  const originalPermissions = (navigator as Partial<Navigator>).permissions;
  const originalClipboard = (navigator as Partial<Navigator>).clipboard;

  afterEach(() => {
    if (originalPermissions === undefined) {
      delete (navigator as Partial<Navigator>).permissions;
    } else {
      Object.defineProperty(navigator, 'permissions', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: originalPermissions,
      });
    }

    if (originalClipboard === undefined) {
      delete (navigator as Partial<Navigator>).clipboard;
    } else {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: originalClipboard,
      });
    }
  });

  it('queries display-capture permissions when available', async () => {
    const query = jest.fn().mockResolvedValue({ state: 'granted' });

    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: { query },
    });

    const status = await checkPermissionStatus('display-capture');

    expect(query).toHaveBeenCalledWith({ name: 'display-capture' as PermissionDescriptor['name'] });
    expect(status).toBe('granted');
  });

  it('falls back to prompt for clipboard when Permissions API rejects the request', async () => {
    const query = jest.fn().mockRejectedValue(new Error('Unexpected failure'));

    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: { query },
    });

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: {},
    });

    const status = await checkPermissionStatus('clipboard-read');

    expect(query).toHaveBeenCalled();
    expect(status).toBe('prompt');
  });
});
