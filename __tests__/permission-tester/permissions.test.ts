/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { checkPermissionStatus, PERMISSIONS } from '../../src/tools/permission-tester/lib/permissions';

describe('permissions model helpers', () => {
  const originalPermissions = (navigator as any).permissions;
  const originalClipboard = (navigator as any).clipboard;
  const originalMediaDevices = (navigator as any).mediaDevices;

  afterEach(() => {
    if (originalMediaDevices === undefined) {
      Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
    } else {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true, writable: true, value: originalMediaDevices,
      });
    }

    if (originalPermissions === undefined) {
      Object.defineProperty(navigator, 'permissions', { configurable: true, value: undefined });
    } else {
      Object.defineProperty(navigator, 'permissions', { configurable: true, writable: true, value: originalPermissions });
    }

    if (originalClipboard === undefined) {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    } else {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, writable: true, value: originalClipboard });
    }
  });

  // display-capture has no permissionsApiName, so the Permissions API is never consulted —
  // checkPermissionStatus feature-detects getDisplayMedia instead.
  it('reports display-capture as promptable when getDisplayMedia exists', async () => {
    const query = jest.fn().mockResolvedValue({ state: 'granted' });

    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: { query },
    });

    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: { getDisplayMedia: jest.fn() },
    });

    const def = PERMISSIONS.find(p => p.id === 'display-capture')!;
    const status = await checkPermissionStatus(def);

    expect(status).toBe('prompt');
    expect(query).not.toHaveBeenCalled();
  });

  it('reports display-capture as unsupported when getDisplayMedia is absent', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: undefined,
    });

    const def = PERMISSIONS.find(p => p.id === 'display-capture')!;

    expect(await checkPermissionStatus(def)).toBe('unsupported');
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

    const def = PERMISSIONS.find(p => p.id === 'clipboard-read')!;
    const status = await checkPermissionStatus(def);

    expect(query).toHaveBeenCalled();
    expect(status).toBe('prompt');
  });
});
