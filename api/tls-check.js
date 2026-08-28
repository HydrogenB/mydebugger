/**
 * © 2025 MyDebugger Contributors – MIT License
 *
 * Serverless probe that negotiates individual TLS versions against the
 * requested host. SSL 2.0 and SSL 3.0 cannot be negotiated by modern
 * Node.js/OpenSSL builds, so they are reported as unsupported.
 */
import tls from 'node:tls';

const PORT = 443;
const PROBE_TIMEOUT_MS = 5000;
const OVERALL_BUDGET_MS = 9500;

const PROBE_VERSIONS = [
  { label: 'TLS 1.0', node: 'TLSv1' },
  { label: 'TLS 1.1', node: 'TLSv1.1' },
  { label: 'TLS 1.2', node: 'TLSv1.2' },
  { label: 'TLS 1.3', node: 'TLSv1.3' },
];

const DEPRECATED = new Set(['SSL 2.0', 'SSL 3.0', 'TLS 1.0', 'TLS 1.1']);
const DOMAIN_REGEX =
  /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?:\.[A-Za-z0-9-]{1,63})+$/;

function normalizeDomain(raw) {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const candidate = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    return new URL(candidate).hostname.toLowerCase();
  } catch {
    return trimmed.toLowerCase();
  }
}

function isValidDomain(value) {
  if (!value || value.length > 253) return false;
  if (value.startsWith('.') || value.endsWith('.')) return false;
  if (value.includes('..')) return false;
  return DOMAIN_REGEX.test(value);
}

function probeVersion(host, nodeVersion) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      try { socket.destroy(); } catch { /* noop */ }
      resolve(result);
    };

    let socket;
    try {
      socket = tls.connect({
        host,
        port: PORT,
        servername: host,
        minVersion: nodeVersion,
        maxVersion: nodeVersion,
        rejectUnauthorized: false,
        ALPNProtocols: ['http/1.1'],
      });
    } catch {
      resolve({ supported: false, reason: 'unsupported' });
      return;
    }

    socket.setTimeout(PROBE_TIMEOUT_MS);
    socket.once('secureConnect', () => finish({ supported: true }));
    socket.once('error', (err) => {
      const code = err && err.code ? String(err.code) : '';
      const connectionIssue =
        code === 'ENOTFOUND' ||
        code === 'EAI_AGAIN' ||
        code === 'ECONNREFUSED' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNRESET';
      finish({
        supported: false,
        reason: connectionIssue ? 'connection' : 'handshake',
      });
    });
    socket.once('timeout', () => finish({ supported: false, reason: 'timeout' }));
  });
}

async function probeHost(host) {
  const probes = await Promise.all(
    PROBE_VERSIONS.map((v) => probeVersion(host, v.node)),
  );

  const connectionFailures = probes.filter(
    (p) => !p.supported && p.reason === 'connection',
  ).length;
  const timeouts = probes.filter(
    (p) => !p.supported && p.reason === 'timeout',
  ).length;

  // If every probe failed at the connection layer, treat as unreachable.
  if (connectionFailures === PROBE_VERSIONS.length) {
    return { ok: false, error: 'CONNECTION_FAILED' };
  }
  if (
    timeouts === PROBE_VERSIONS.length ||
    (timeouts > 0 && timeouts + connectionFailures === PROBE_VERSIONS.length)
  ) {
    return { ok: false, error: 'TIMEOUT' };
  }

  const results = [
    { version: 'SSL 2.0', supported: false, deprecated: true },
    { version: 'SSL 3.0', supported: false, deprecated: true },
    ...PROBE_VERSIONS.map((v, i) => ({
      version: v.label,
      supported: probes[i].supported,
      deprecated: DEPRECATED.has(v.label),
    })),
  ];
  return { ok: true, results };
}

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'SERVER_ERROR' });
    return;
  }

  const body = readJsonBody(req);
  const domain = normalizeDomain(body?.domain ?? '');
  if (!isValidDomain(domain)) {
    res.status(400).json({ error: 'INVALID_DOMAIN' });
    return;
  }

  const budget = new Promise((resolve) =>
    setTimeout(() => resolve({ ok: false, error: 'TIMEOUT' }), OVERALL_BUDGET_MS),
  );

  try {
    const outcome = await Promise.race([probeHost(domain), budget]);
    if (!outcome.ok) {
      const status = outcome.error === 'TIMEOUT' ? 504 : 502;
      res.status(status).json({ error: outcome.error });
      return;
    }
    res.status(200).json({
      domain,
      results: outcome.results,
      scannedAt: new Date().toISOString(),
    });
  } catch {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
}
