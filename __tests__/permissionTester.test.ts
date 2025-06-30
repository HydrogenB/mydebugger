import { renderHook, act, waitFor } from '@testing-library/react';
import usePermissionTester from '../viewmodel/usePermissionTester';
import * as perms from '../model/permissions';

class DummyMediaStream {
  tracks: { stop: jest.Mock }[];
  constructor(tracks: { stop: jest.Mock }[]) {
    this.tracks = tracks;
  }
  getTracks() {
    return this.tracks;
  }
}
(global as any).MediaStream = DummyMediaStream;

const originalPermissions = perms.PERMISSIONS.map(p => ({ ...p }));

afterEach(() => {
  perms.PERMISSIONS.splice(0, perms.PERMISSIONS.length, ...originalPermissions);
  jest.resetAllMocks();
});

describe('usePermissionTester', () => {
  it('marks permission granted when query unsupported but request succeeds', async () => {
    const permission = { ...originalPermissions[0], requestFn: jest.fn().mockResolvedValue('ok') };
  perms.PERMISSIONS.splice(0, perms.PERMISSIONS.length, permission);
  const checkSpy = jest
    .spyOn(perms, 'checkPermissionStatus')
    .mockImplementation(() => Promise.resolve('unsupported'));

  const { result } = renderHook(() => usePermissionTester());

  await act(async () => {
    await Promise.resolve();
  });
  await waitFor(() => result.current.permissions.length > 0 && checkSpy.mock.calls.length >= 1);

  // checkPermissionStatus already returns 'unsupported'

  await act(async () => {
    await result.current.requestPermission(permission.name);
  });

  await waitFor(() => permission.requestFn.mock.calls.length > 0);
  expect(permission.requestFn).toHaveBeenCalled();
  });

  it('stores returned data from request', async () => {
    const permission = {
      ...originalPermissions[0],
      requestFn: jest.fn().mockResolvedValue('data'),
    };
    perms.PERMISSIONS.splice(0, perms.PERMISSIONS.length, permission);
    jest.spyOn(perms, 'checkPermissionStatus').mockResolvedValue('prompt');

    const { result } = renderHook(() => usePermissionTester());
    await act(async () => { await Promise.resolve(); });
    await waitFor(() => result.current.permissions.length > 0);

    await act(async () => {
      await result.current.requestPermission(permission.name);
    });

    expect(result.current.getPermissionData(permission.name)).toBe('data');
  });

  it('stores window handle for window-management', async () => {
    const winMock = { closed: false, close: jest.fn() } as unknown as Window;
    const permission = {
      ...originalPermissions[0],
      name: 'window-management',
      requestFn: jest.fn().mockResolvedValue(winMock),
    };
    perms.PERMISSIONS.splice(0, perms.PERMISSIONS.length, permission);
    jest.spyOn(perms, 'checkPermissionStatus').mockResolvedValue('prompt');

    const { result } = renderHook(() => usePermissionTester());
    await act(async () => { await Promise.resolve(); });
    await waitFor(() => result.current.permissions.length > 0);

    await act(async () => {
      await result.current.requestPermission('window-management');
    });

    expect(result.current.getPermissionData('window-management')).toBe(winMock);
  });

  it('clears stored data when clearPermissionData is called', async () => {
    const permission = {
      ...originalPermissions[0],
      name: 'window-management',
      requestFn: jest.fn().mockResolvedValue({}),
    };
    perms.PERMISSIONS.splice(0, perms.PERMISSIONS.length, permission);
    jest.spyOn(perms, 'checkPermissionStatus').mockResolvedValue('prompt');

    const { result } = renderHook(() => usePermissionTester());
    await act(async () => { await Promise.resolve(); });
    await waitFor(() => result.current.permissions.length > 0);

    await act(async () => {
      await result.current.requestPermission('window-management');
    });
    expect(result.current.getPermissionData('window-management')).toBeDefined();

    act(() => {
      result.current.clearPermissionData('window-management');
    });

    expect(result.current.getPermissionData('window-management')).toBeUndefined();
  });

  it('retries permission and stops streams', async () => {
    const track1 = { stop: jest.fn() };
    const track2 = { stop: jest.fn() };
    const stream1 = new DummyMediaStream([track1]) as unknown as MediaStream;
    const stream2 = new DummyMediaStream([track2]) as unknown as MediaStream;
    const permission = {
      ...originalPermissions[0],
      name: 'camera',
      requestFn: jest
        .fn()
        .mockResolvedValueOnce(stream1)
        .mockResolvedValueOnce(stream2),
    };
    perms.PERMISSIONS.splice(0, perms.PERMISSIONS.length, permission);
    jest.spyOn(perms, 'checkPermissionStatus').mockResolvedValue('granted');

    const { result } = renderHook(() => usePermissionTester());
    await act(async () => { await Promise.resolve(); });
    await waitFor(() => result.current.permissions.length > 0);

    await act(async () => {
      await result.current.requestPermission('camera');
    });

    await act(async () => {
      await result.current.retryPermission('camera');
    });

    expect(track1.stop).toHaveBeenCalled();
    expect(track2.stop).toHaveBeenCalled();
    expect(permission.requestFn).toHaveBeenCalledTimes(2);
    expect(result.current.permissions[0].status).toBe('granted');
  });
});
