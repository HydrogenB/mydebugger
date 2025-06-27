/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { Button, TextInput } from '../src/design-system/components/inputs';
import { ProgressBar } from '../src/design-system/components/feedback';
import { InfoBox, Badge } from '../src/design-system/components/display';
// eslint-disable-next-line import/no-named-as-default
import Card from '../src/design-system/components/layout/Card';
import { UseNetworkSuiteReturn } from '../viewmodel/useNetworkSuite';

export function NetworkSuiteView({
  connection,
  tech,
  offline,
  pingUrl,
  setPingUrl,
  pingResults,
  pingRunning,
  avgPing,
  startPing,
  speedUrl,
  setSpeedUrl,
  speedProgress,
  speedMbps,
  speedRunning,
  startSpeed,
}: UseNetworkSuiteReturn) {
  return (
    <div className="space-y-6">
      {offline && (
        <InfoBox variant="error" title="Offline">
          Network features are unavailable while offline.
        </InfoBox>
      )}
      <div className="flex justify-center">
        <Button onClick={() => { startPing(); startSpeed(); }}>
          Run All Tests
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
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
                <p>Avg: {avgPing.toFixed(0)} ms</p>
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
      </div>
    </div>
  );
}

export default NetworkSuiteView;
