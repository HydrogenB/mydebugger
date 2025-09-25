/**
 * ? 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PermissionTesterView from '../../src/tools/permission-tester/components/PermissionTesterPanel';
import type { UsePermissionTesterReturn } from '../../src/tools/permission-tester/hooks/usePermissionTester';
import type { PermissionState, Permission } from '../../src/tools/permission-tester/lib/permissions';

defineGlobalPolyfills();
jest.mock('../../src/shared/components/StageWrapper', () => ({
  StageWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StageIndicator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

type PartialPermissionState = Partial<PermissionState> & { permission?: Partial<Permission> };

type VmOverrides = Partial<UsePermissionTesterReturn> & {
  permissions?: PermissionState[];
  filteredPermissions?: PermissionState[];
};

const basePermission: Permission = {
  name: 'camera',
  displayName: 'Camera',
  description: 'Access the camera',
  icon: 'Camera',
  category: 'Media',
  requestFn: async () => undefined,
  hasLivePreview: true,
};

function buildPermission(overrides: PartialPermissionState = {}): PermissionState {
  const permission = { ...basePermission, ...overrides.permission };

  return {
    permission,
    status: 'prompt',
    data: undefined,
    error: undefined,
    lastRequested: undefined,
    ...overrides,
    permission,
  };
}

function buildVm(overrides: VmOverrides = {}): UsePermissionTesterReturn {
  const permissions = overrides.permissions ?? [];
  const filteredPermissions = overrides.filteredPermissions ?? permissions;

  return {
    permissions,
    filteredPermissions,
    events: [],
    searchQuery: '',
    setSearchQuery: jest.fn(),
    requestPermission: jest.fn().mockResolvedValue(undefined),
    retryPermission: jest.fn().mockResolvedValue(undefined),
    copyCodeSnippet: jest.fn().mockResolvedValue(undefined),
    copyEventLog: jest.fn().mockResolvedValue(undefined),
    clearEvents: jest.fn(),
    testNotification: jest.fn(),
    getCodeSnippet: jest.fn().mockReturnValue('code snippet'),
    isLoading: jest.fn().mockReturnValue(false),
    getPermissionData: jest.fn(),
    clearPermissionData: jest.fn(),
    activePreview: null,
    setActivePreview: jest.fn(),
    previewStates: {},
    updatePreviewState: jest.fn(),
    isPreviewActive: jest.fn().mockReturnValue(false),
    startPreview: jest.fn().mockResolvedValue(undefined),
    stopPreview: jest.fn(),
    exportResults: jest.fn().mockResolvedValue(undefined),
    runBatchTest: jest.fn().mockResolvedValue(undefined),
    permissionStats: {
      granted: 0,
      denied: 0,
      unsupported: 0,
      total: filteredPermissions.length,
    },
    ...overrides,
    permissions,
    filteredPermissions,
  };
}

describe('PermissionTesterPanel', () => {
  afterEach(jest.clearAllMocks);

  it('requests a permission when the card action is triggered', async () => {
    const user = userEvent.setup();
    const permission = buildPermission();
    const requestPermission = jest.fn().mockResolvedValue(undefined);

    const vm = buildVm({
      permissions: [permission],
      filteredPermissions: [permission],
      requestPermission,
    });

    render(<PermissionTesterView {...vm} />);

    const requestButton = await screen.findByRole('button', { name: 'Request' });
    await user.click(requestButton);

    expect(requestPermission).toHaveBeenCalledWith('camera');
  });

  it('invokes quick action to request the next five pending permissions', async () => {
    const user = userEvent.setup();
    const permissions = Array.from({ length: 6 }).map((_, index) =>
      buildPermission({
        permission: {
          name: `perm-${index}`,
          displayName: `Permission ${index}`,
        },
      })
    );
    const requestPermission = jest.fn().mockResolvedValue(undefined);

    const vm = buildVm({
      permissions,
      filteredPermissions: permissions,
      requestPermission,
    });

    render(<PermissionTesterView {...vm} />);

    const quickAction = screen.getByRole('button', { name: 'Request Next 5 Pending' });
    await user.click(quickAction);

    expect(requestPermission).toHaveBeenCalledTimes(5);
    expect(requestPermission.mock.calls.map(([name]) => name)).toEqual([
      'perm-0',
      'perm-1',
      'perm-2',
      'perm-3',
      'perm-4',
    ]);
  });

  it('runs a batch test from the toolbar', async () => {
    const user = userEvent.setup();
    const permissions = [
      buildPermission({ permission: { name: 'geo', displayName: 'Geo', category: 'Location' }, status: 'prompt' }),
      buildPermission({ permission: { name: 'mic', displayName: 'Mic', category: 'Media' }, status: 'denied' }),
      buildPermission({ permission: { name: 'clip', displayName: 'Clipboard', category: 'System' }, status: 'granted' }),
    ];
    const runBatchTest = jest.fn().mockResolvedValue(undefined);

    const vm = buildVm({
      permissions,
      filteredPermissions: permissions,
      runBatchTest,
    });

    render(<PermissionTesterView {...vm} />);

    const button = screen.getByRole('button', { name: 'Test All' });
    await user.click(button);

    expect(runBatchTest).toHaveBeenCalledWith(['geo', 'mic']);
  });

  it('retries denied permissions via quick action', async () => {
    const user = userEvent.setup();
    const retryPermission = jest.fn().mockResolvedValue(undefined);
    const permissions = Array.from({ length: 6 }).map((_, index) =>
      buildPermission({
        permission: { name: `perm-${index}`, displayName: `Permission ${index}` },
        status: index < 3 ? 'denied' : 'granted',
      })
    );

    const vm = buildVm({
      permissions,
      filteredPermissions: permissions,
      retryPermission,
    });

    render(<PermissionTesterView {...vm} />);

    const button = screen.getByRole('button', { name: 'Retry 3 Denied' });
    await user.click(button);

    expect(retryPermission).toHaveBeenCalledTimes(3);
    expect(retryPermission.mock.calls.map(([name]) => name)).toEqual(['perm-0', 'perm-1', 'perm-2']);
  });

  it('exports results when the user clicks the export button', async () => {
    const user = userEvent.setup();
    const exportResults = jest.fn().mockResolvedValue(undefined);
    const permission = buildPermission();

    const vm = buildVm({
      permissions: [permission],
      filteredPermissions: [permission],
      exportResults,
    });

    render(<PermissionTesterView {...vm} />);

    const button = screen.getByRole('button', { name: 'Export' });
    await user.click(button);

    expect(exportResults).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when no permissions match the search query', () => {
    const vm = buildVm({
      permissions: [buildPermission()],
      filteredPermissions: [],
      searchQuery: 'something',
      permissionStats: {
        granted: 0,
        denied: 0,
        unsupported: 0,
        total: 0,
      },
    });

    render(<PermissionTesterView {...vm} />);

    expect(screen.getByText('No permissions found')).toBeInTheDocument();
    expect(screen.getByText('No permissions match "something". Try a different search term.')).toBeInTheDocument();
  });

  it('renders permission stats summary cards', () => {
    const permissions = [
      buildPermission({ status: 'granted' }),
      buildPermission({ status: 'denied', permission: { name: 'mic', displayName: 'Mic', category: 'Media' } }),
      buildPermission({ status: 'unsupported', permission: { name: 'geo', displayName: 'Geo', category: 'Location' } }),
    ];

    const vm = buildVm({
      permissions,
      filteredPermissions: permissions,
      permissionStats: {
        granted: 1,
        denied: 1,
        unsupported: 1,
        total: 3,
      },
    });

    render(<PermissionTesterView {...vm} />);

    expect(screen.getByText('Granted')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(3);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});

function defineGlobalPolyfills() {
  class MockMediaStream {
    getTracks() {
      return [];
    }
  }
  // @ts-expect-error jsdom polyfill
  global.MediaStream = MockMediaStream;
}
