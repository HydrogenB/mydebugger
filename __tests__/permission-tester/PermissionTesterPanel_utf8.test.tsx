/**
 * © 2025 MyDebugger Contributors – MIT License
 * UTF-8 encoded variant of PermissionTesterPanel tests.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PermissionTesterPanel } from '../../src/tools/permission-tester/components/PermissionTesterPanel';
import type { PermissionTesterVM, PermissionState } from '../../src/tools/permission-tester/hooks/usePermissionTester';
import type { PermissionDef } from '../../src/tools/permission-tester/lib/permissions';

function buildDef(overrides: Partial<PermissionDef> = {}): PermissionDef {
  return {
    id: 'microphone',
    displayName: 'Microphone',
    description: 'Access the device microphone.',
    category: 'media',
    icon: '🎤',
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

describe('PermissionTesterPanel (utf8)', () => {
  afterEach(jest.clearAllMocks);

  it('renders category filter buttons', () => {
    const vm = buildVm();
    render(<PermissionTesterPanel {...vm} />);
    expect(screen.getByRole('button', { name: /all/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /media/i })).toBeTruthy();
  });

  it('renders a permission card for each filtered permission', () => {
    const states = [
      buildPermissionState({ def: buildDef({ id: 'camera', displayName: 'Camera' }) }),
      buildPermissionState({ def: buildDef({ id: 'microphone', displayName: 'Microphone' }) }),
    ];
    const vm = buildVm({ permissions: states, filteredPermissions: states });

    render(<PermissionTesterPanel {...vm} />);

    expect(screen.getByText('Camera')).toBeTruthy();
    expect(screen.getByText('Microphone')).toBeTruthy();
  });

  it('shows unsupported badge for unsupported permissions', () => {
    const pState = buildPermissionState({ status: 'unsupported' });
    const vm = buildVm({ permissions: [pState], filteredPermissions: [pState] });

    render(<PermissionTesterPanel {...vm} />);

    expect(screen.getByText('Not Supported')).toBeTruthy();
  });
});
