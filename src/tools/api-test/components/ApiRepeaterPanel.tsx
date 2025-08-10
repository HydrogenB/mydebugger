/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../../../design-system/foundations/layout';
import { Button, TextInput } from '../src/design-system/components/inputs';
import { InfoBox } from '../src/design-system/components/display';
// eslint-disable-next-line import/no-named-as-default
import Card from '../src/design-system/components/layout/Card';
import type useApiRepeater from '../hooks/useApiRepeater';

interface Props extends ReturnType<typeof useApiRepeater> {}

export function ApiRepeaterView({
  curl,
  setCurl,
  delay,
  setDelay,
  parsed,
  reqLogs,
  resLogs,
  running,
  error,
  parse,
  start,
  stop,
  clearLogs,
  saveProfile,
  exportLogFile,
}: Props) {
  React.useEffect(() => { parse(); }, [curl, parse]);

  return (
    <div className={`${TOOL_PANEL_CLASS} space-y-4`}>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        API Request Repeater
      </h1>
      {error && (
        <InfoBox variant="error" title="Parse Error">
          {error}
        </InfoBox>
      )}
      <label htmlFor="curl" className="sr-only">
        Curl Command
        <textarea
          id="curl"
          className="w-full border p-2 rounded mb-2 dark:bg-gray-700 dark:text-gray-200"
          rows={3}
          placeholder="curl -X GET 'https://api.example.com'"
          value={curl}
          onChange={(e) => setCurl(e.target.value)}
        />
      </label>
      <TextInput
        id="delay"
        label="Delay (ms)"
        type="number"
        value={delay}
        onChange={(e) => setDelay(Number(e.target.value))}
        fullWidth
      />
      {parsed && (
        <Card isElevated>
          <Card.Header title="Parsed Request" />
          <Card.Body>
            <pre className="text-sm overflow-auto max-h-40">
{JSON.stringify(parsed, null, 2)}
            </pre>
          </Card.Body>
        </Card>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={start} isDisabled={running}>Start</Button>
        <Button onClick={stop} variant="secondary" isDisabled={!running}>Stop</Button>
        <Button variant="outline" onClick={clearLogs}>Clear Logs</Button>
        <Button variant="outline" onClick={saveProfile}>Save Profile</Button>
        <Button variant="outline" onClick={exportLogFile}>Export Logs</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card isElevated>
          <Card.Header title="Requests" />
          <Card.Body>
            <div className="h-48 overflow-y-auto text-sm space-y-1">
              {reqLogs.map((l) => (
                <div key={l} className="break-all">{l}</div>
              ))}
            </div>
          </Card.Body>
        </Card>
        <Card isElevated>
          <Card.Header title="Responses" />
          <Card.Body>
            <div className="h-48 overflow-y-auto text-sm space-y-1">
              {resLogs.map((l) => (
                <div key={l} className="break-all">{l}</div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

export default ApiRepeaterView;
