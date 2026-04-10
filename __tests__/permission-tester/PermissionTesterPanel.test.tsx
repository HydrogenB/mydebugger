/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PermissionTesterPanel } from '../../src/tools/permission-tester/components/PermissionTesterPanel';
import type { PermissionTesterVM, PermissionState } from '../../src/tools/permission-tester/hooks/usePermissionTester';
import type { PermissionDef } from '../../src/tools/permission-tester/lib/permissions';

defineGlobalPolyfills();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildDef(overrides: Partial<PermissionDef> = {}): PermissionDef {
  return {
    id: 'camera',
    displayName: 'Camera',
    description: 'Access the device camera.',
    category: 'media',
    icon: '📷',
    requestFn: async () => undefined,
    hasLivePreview: true,
    ...overrides,
  };
}

function buildPermissionState(overrides: Partial<PermissionState> = {}): PermissionState {
  return {
    def: buildDef(),
    status: 'idle',
    showPreview: false,
    showCode: false,
    ...overrides,
  };
}

function buildVm(overrides: Partial<PermissionTesterVM> = {}): PermissionTesterVM {
  const permissions = overrides.permissions ?? [];
  const filteredPermissions = overrides.filteredPermissions ?? permissions;
  return {
    permissions,
    filteredPermissions,
    events: [],
    search: '',
    setSearch: jest.fn(),
    categoryFilter: 'all',
    setCategoryFilter: jest.fn(),
    stats: { granted: 0, denied: 0, unsupported: 0, total: filteredPermissions.length },
    requestPermission: jest.fn().mockResolvedValue(undefined),
    togglePreview: jest.fn(),
    toggleCode: jest.fn(),
    copyCode: jest.fn(),
    clearEvents: jest.fn(),
    copyEventLog: jest.fn(),
    exportResults: jest.fn(),
    retryDenied: jest.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('PermissionTesterPanel', () => {
  afterEach(jest.clearAllMocks);

  it('renders the title', () => {
    const vm = buildVm();
    render(<PermissionTesterPanel {...vm} />);
    expect(screen.getByText('Web Permission Tester')).toBeTruthy();
  });

  it('requests a permission when "Request Permission" is clicked', async () => {
    const user = userEvent.setup();
    const requestPermission = jest.fn().mockResolvedValue(undefined);
    const pState = buildPermissionState({ status: 'idle' });
    const vm = buildVm({ permissions: [pState], filteredPermissions: [pState], requestPermission });

    render(<PermissionTesterPanel {...vm} />);

    const btn = screen.getByRole('button', { name: /request permission/i });
    await user.click(btn);

    expect(requestPermission).toHaveBeenCalledWith('camera');
  });

  it('shows "Retry Request" when permission is denied', () => {
    const pState = buildPermissionState({ status: 'denied' });
    const vm = buildVm({ permissions: [pState], filteredPermissions: [pState] });

    render(<PermissionTesterPanel {...vm} />);

    expect(screen.getByRole('button', { name: /retry request/i })).toBeTruthy();
  });

  it('shows stat chips', () => {
    const vm = buildVm({
      stats: { granted: 2, denied: 1, unsupported: 0, total: 3 },
    });

    render(<PermissionTesterPanel {...vm} />);

    expect(screen.getByText('Granted')).toBeTruthy();
    expect(screen.getByText('Denied')).toBeTruthy();
    expect(screen.getByText('Total')).toBeTruthy();
  });

  it('calls retryDenied when "Retry All Denied" is clicked', async () => {
    const user = userEvent.setup();
    const retryDenied = jest.fn();
    const pState = buildPermissionState({ status: 'denied' });
    const vm = buildVm({
      permissions: [pState],
      filteredPermissions: [pState],
      stats: { granted: 0, denied: 1, unsupported: 0, total: 1 },
      retryDenied,
    });

    render(<PermissionTesterPanel {...vm} />);

    const btn = screen.getByRole('button', { name: /retry all denied/i });
    await user.click(btn);

    expect(retryDenied).toHaveBeenCalledTimes(1);
  });

  it('calls exportResults when "Export Results JSON" is clicked', async () => {
    const user = userEvent.setup();
    const exportResults = jest.fn();
    const vm = buildVm({ exportResults });

    render(<PermissionTesterPanel {...vm} />);

    const btn = screen.getByRole('button', { name: /export results json/i });
    await user.click(btn);

    expect(exportResults).toHaveBeenCalledTimes(1);
  });

  it('shows empty state text when filteredPermissions is empty', () => {
    const vm = buildVm({
      permissions: [buildPermissionState()],
      filteredPermissions: [],
      search: 'xyz',
    });

    render(<PermissionTesterPanel {...vm} />);

    expect(screen.getByText(/no permissions match/i)).toBeTruthy();
  });
});

function defineGlobalPolyfills() {
  class MockMediaStream {
    getTracks() { return []; }
  }
  // @ts-expect-error jsdom polyfill
  global.MediaStream = MockMediaStream;
}
