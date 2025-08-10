/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { Button, TextInput } from '../../../design-system/components/inputs';
import { ProgressBar } from '../../../design-system/components/feedback';
import { InfoBox, Badge } from '../../../design-system/components/display';
import { getQualityScore } from '../lib/networkSuite';
// eslint-disable-next-line import/no-named-as-default
import Card from '../../../design-system/components/layout/Card';
import { UseNetworkSuiteReturn } from '../hooks/useNetworkSuite';

export function NetworkSuiteView({
  connection,
  tech,
  offline,
  connectionSupported,
  pingUrl,
  setPingUrl,
  pingResults,
  pingRunning,
  avgPing,
  jitter,
  startPing,
  speedUrl,
  setSpeedUrl,
  speedProgress,
  speedMbps,
  speedRunning,
  startSpeed,
  uploadUrl,
  setUploadUrl,
  uploadMbps,
  uploadRunning,
  startUpload,
  getReport,
  copyReport,
}: UseNetworkSuiteReturn) {
  const quality = getQualityScore({
    avgPingMs: avgPing || 0,
    jitterMs: jitter || 0,
    downloadMbps: speedMbps,
    uploadMbps: uploadMbps,
  });

  return (
    <div className="space-y-6">
      {offline && (
        <InfoBox variant="error" title="Offline">
          Network features are unavailable while offline.
        </InfoBox>
      )}
      {!connectionSupported && (
        <InfoBox variant="warning" title="Limited Support">
          This browser does not expose network connection details.
        </InfoBox>
      )}
      <div className="flex justify-center">
        <Button onClick={() => { startPing(); startSpeed(); startUpload(); }}>
          Run All Tests
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card isElevated>
          <Card.Header title="Quality" subtitle="Overall connection score" />
          <Card.Body className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-semibold">{quality.score}</div>
              <Badge variant="success" pill>Grade {quality.grade}</Badge>
            </div>
            <ProgressBar value={quality.score} />
          </Card.Body>
        </Card>
        <Card isElevated>
          <Card.Header title="Shareable Report" />
          <Card.Body className="space-y-3">
            <pre className="text-xs bg-black/5 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(getReport(), null, 2)}</pre>
            <Button size="sm" onClick={copyReport}>Copy JSON</Button>
          </Card.Body>
        </Card>
        <Card isElevated>
          <Card.Header title="Connection Info" />
          <Card.Body className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              <Badge variant="info" pill>{connection.type}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Tech:</span>
              <Badge variant="primary" pill>{tech}</Badge>
            </div>
          </Card.Body>
        </Card>
        <Card isElevated>
          <Card.Header title="Ping" />
          <Card.Body className="space-y-3">
            <div className="flex gap-2 items-end">
              <TextInput
                label="URL"
                value={pingUrl}
                onChange={(e) => setPingUrl(e.target.value)}
                fullWidth
              />
              <Button
                onClick={startPing}
                isDisabled={pingRunning}
                isLoading={pingRunning}
                size="sm"
              >
                Start Ping
              </Button>
            </div>
            {pingRunning && (
              <ProgressBar value={(pingResults.length / 4) * 100} />
            )}
            {pingResults.length > 0 && (
              <div className="text-sm">
                <p>Avg: {avgPing.toFixed(0)} ms · Jitter: {jitter.toFixed(0)} ms</p>
                <ul className="list-decimal list-inside">
                  {pingResults.map((r) => (
                    <li key={r.toString()}>{r.toFixed(0)} ms</li>
                  ))}
                </ul>
              </div>
            )}
          </Card.Body>
        </Card>
        <Card isElevated>
          <Card.Header title="Download Speed" />
          <Card.Body className="space-y-3">
            <div className="flex gap-2 items-end">
              <TextInput
                label="File URL"
                value={speedUrl}
                onChange={(e) => setSpeedUrl(e.target.value)}
                fullWidth
              />
              <Button
                onClick={startSpeed}
                isDisabled={speedRunning}
                isLoading={speedRunning}
                size="sm"
              >
                Start Test
              </Button>
            </div>
            {speedRunning && <ProgressBar value={speedProgress} />}
            {speedMbps !== null && (
              <p className="text-sm">Speed: {speedMbps.toFixed(2)} Mbps</p>
            )}
          </Card.Body>
        </Card>
        <Card isElevated>
          <Card.Header title="Upload Speed" />
          <Card.Body className="space-y-3">
            <div className="flex gap-2 items-end">
              <TextInput
                label="Endpoint"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                fullWidth
              />
              <Button
                onClick={startUpload}
                isDisabled={uploadRunning}
                isLoading={uploadRunning}
                size="sm"
              >
                Start Upload
              </Button>
            </div>
            {uploadMbps !== null && (
              <p className="text-sm">Upload: {uploadMbps.toFixed(2)} Mbps</p>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default NetworkSuiteView;
