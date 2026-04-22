/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { Badge } from '../../../design-system/components/display/Badge';
import { Button } from '../../../design-system/components/inputs/Button';
import { Card } from '../../../design-system/components/layout/Card';
import { LoadingSpinner } from '../../../design-system/components/feedback/LoadingSpinner';
import {
  TLS_PROTOCOL_LABELS,
  TlsProbeResult,
  getProtocolSeverity,
} from '../lib/tlsChecker';
import { UseTlsCheckerState } from '../hooks/useTlsChecker';

type Props = UseTlsCheckerState;

const severityStyles: Record<
  'secure' | 'insecure' | 'disabled',
  { border: string; bg: string; label: string }
> = {
  secure: {
    border: 'border-green-300 dark:border-green-700',
    bg: 'bg-green-50 dark:bg-green-900/20',
    label: 'text-green-700 dark:text-green-300',
  },
  insecure: {
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50 dark:bg-red-900/20',
    label: 'text-red-700 dark:text-red-300',
  },
  disabled: {
    border: 'border-gray-300 dark:border-gray-700',
    bg: 'bg-gray-50 dark:bg-gray-800/40',
    label: 'text-gray-600 dark:text-gray-400',
  },
};

const skeletonItems = TLS_PROTOCOL_LABELS.map((label) => label);

const renderStatusBadge = (result: TlsProbeResult) => {
  const severity = getProtocolSeverity(result);
  if (severity === 'secure') {
    return (
      <Badge variant="success" pill>
        Supported
      </Badge>
    );
  }
  if (severity === 'insecure') {
    return (
      <Badge variant="danger" pill>
        Supported
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" pill>
      Not Supported
    </Badge>
  );
};

export const TlsCheckerView: React.FC<Props> = ({
  domain,
  setDomain,
  results,
  scannedDomain,
  scannedAt,
  loading,
  error,
  check,
  reset,
}) => {
  const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') check();
  };

  return (
    <div className="space-y-6">
      <Card isElevated>
        <div className="space-y-4">
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label
              htmlFor="tls-domain"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Domain
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="tls-domain"
                type="text"
                inputMode="url"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="flex-grow rounded-md sm:rounded-r-none border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900 focus:ring-opacity-50"
                placeholder="example.com"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                aria-invalid={Boolean(error) && !loading}
              />
              <div className="flex gap-2">
                <Button
                  onClick={check}
                  isLoading={loading}
                  disabled={loading || !domain.trim()}
                  className="sm:rounded-l-none"
                >
                  Test now
                </Button>
                {(results.length > 0 || error) && !loading && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setDomain('');
                      reset();
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Probes TLS 1.0 – 1.3 on port 443. SSL 2.0/3.0 cannot be
              negotiated by modern runtimes and are reported as disabled.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm"
            >
              {error}
            </div>
          )}

          {loading && (
            <div
              aria-label="Testing TLS protocols"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {skeletonItems.map((label) => (
                <div
                  key={label}
                  className="animate-pulse border border-gray-200 dark:border-gray-700 rounded-md p-4 h-28 bg-gray-50 dark:bg-gray-800/40"
                >
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                  <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
              <div className="col-span-full flex justify-center py-2">
                <LoadingSpinner />
              </div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Results for{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {scannedDomain}
                  </span>
                  {scannedAt && (
                    <span className="ml-2 text-xs text-gray-400">
                      {new Date(scannedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div
                role="list"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {results.map((result) => {
                  const severity = getProtocolSeverity(result);
                  const style = severityStyles[severity];
                  return (
                    <div
                      key={result.version}
                      role="listitem"
                      className={`border rounded-md p-4 flex flex-col gap-2 ${style.border} ${style.bg}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold ${style.label}`}>
                          {result.version}
                        </span>
                        {renderStatusBadge(result)}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {result.deprecated && (
                          <Badge variant="warning" pill size="xs">
                            Deprecated
                          </Badge>
                        )}
                        {!result.deprecated && (
                          <Badge variant="info" pill size="xs">
                            Modern
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {severity === 'secure' &&
                          'Modern protocol enabled on the server.'}
                        {severity === 'insecure' &&
                          'Deprecated protocol is enabled — disable it on the server.'}
                        {severity === 'disabled' &&
                          (result.deprecated
                            ? 'Not supported — this protocol is deprecated.'
                            : 'Not negotiated — consider enabling this modern protocol.')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            What is TLS?
          </h2>
          <p>
            TLS (Transport Layer Security) encrypts traffic between browsers
            and servers. Each protocol version is negotiated during the
            handshake. Older versions — SSL 2.0, SSL 3.0, TLS 1.0 and
            TLS 1.1 — have known weaknesses and are deprecated by the IETF.
          </p>
          <p>
            Servers should enable TLS 1.2 and TLS 1.3 and disable everything
            older. This tool connects to the host on port 443 and attempts
            each version in isolation to report which ones your server still
            accepts.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default TlsCheckerView;
