import { renderHook, act, waitFor } from '@testing-library/react';
import usePermissionTester from '../viewmodel/usePermissionTester';
import * as perms from '../model/permissions';

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
});
