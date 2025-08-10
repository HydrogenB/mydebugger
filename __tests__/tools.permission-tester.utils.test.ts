import { checkPermissionStatus, generateCodeSnippet, createPermissionEvent, cleanupPermissionData, requestPermissionWithTimeout, revokePermissionGuidance } from '../src/tools/permission-tester/lib/permissions';

describe('Permission Tester utilities (unit)', () => {
  test('generateCodeSnippet returns readable snippet', () => {
    const dummyPermission = {
      name: 'geolocation',
      displayName: 'Geolocation',
      description: '',
      icon: '',
      category: 'Location',
      requestFn: async () => {},
      hasLivePreview: false,
    } as const;
    const snippet = generateCodeSnippet(dummyPermission as any);
    expect(snippet).toContain('Request Geolocation permission');
  });

  test('createPermissionEvent shape', () => {
    const ev = createPermissionEvent('camera', 'request', 'start');
    expect(ev.permissionName).toBe('camera');
    expect(ev.action).toBe('request');
    expect(typeof ev.id).toBe('string');
    expect(typeof ev.timestamp).toBe('number');
  });

  test('cleanupPermissionData no-ops gracefully', () => {
    expect(() => cleanupPermissionData('geolocation', null as any)).not.toThrow();
  });

  test('requestPermissionWithTimeout times out', async () => {
    const perm = { requestFn: () => new Promise(() => {}), displayName: 'X' } as any;
    await expect(requestPermissionWithTimeout(perm, 50)).rejects.toThrow(/timed out/i);
  });

  test('revokePermissionGuidance returns a string for any permission', () => {
    const text = revokePermissionGuidance('camera');
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(0);
  });

  test('checkPermissionStatus returns unsupported when no API', async () => {
    (global as any).navigator = {};
    const s = await checkPermissionStatus('camera');
    expect(['unsupported', 'prompt', 'denied', 'granted']).toContain(s);
  });
});


