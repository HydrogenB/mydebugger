/**
 * © 2025 MyDebugger Contributors – MIT License
 */

export type HeaderStatus = 'ok' | 'warning' | 'missing';

export interface HeaderAuditResult {
  name: string;
  value: string | null;
  status: HeaderStatus;
  fix: string;
}

interface Rule {
  check: (v: string | null) => boolean;
  fix: string;
}

const rules: Record<string, Rule> = {
  'x-frame-options': {
    check: (v) => ['deny', 'sameorigin'].includes((v ?? '').toLowerCase()),
    fix: 'Set X-Frame-Options to "DENY" or "SAMEORIGIN"',
  },
  'content-security-policy': {
    check: (v) => !!v,
    fix: 'Define a strong Content-Security-Policy',
  },
  'x-content-type-options': {
    check: (v) => (v ?? '').toLowerCase() === 'nosniff',
    fix: 'Add X-Content-Type-Options: nosniff',
  },
  'referrer-policy': {
    check: (v) => /no-referrer|same-origin|strict/.test((v ?? '').toLowerCase()),
    fix: 'Set Referrer-Policy to no-referrer, same-origin or strict-origin',
  },
  'strict-transport-security': {
    check: (v) => /max-age=\d+.*\bincludeSubDomains\b/i.test(v ?? ''),
    fix: 'Enable HSTS with max-age and includeSubDomains',
  },
};

const securityHeaders = Object.keys(rules);

export const analyzeHeaders = async (
  url: string,
): Promise<HeaderAuditResult[]> => {
  const target = url.startsWith('http') ? url : `https://${url}`;
  try {
    const res = await fetch(target, { method: 'GET', redirect: 'manual' });
    if (res.type === 'opaque') {
      return securityHeaders.map((name) => ({
        name,
        value: null,
        status: 'warning',
        fix: rules[name].fix,
      }));
    }
    return securityHeaders.map((name) => {
      const value = res.headers.get(name);
      if (!value) {
        return { name, value: null, status: 'missing' as const, fix: rules[name].fix };
      }
      return {
        name,
        value,
        status: rules[name].check(value) ? 'ok' : 'warning',
        fix: rules[name].fix,
      };
    });
  } catch {
    return securityHeaders.map((name) => ({
      name,
      value: null,
      status: 'warning',
      fix: rules[name].fix,
    }));
  }
};

