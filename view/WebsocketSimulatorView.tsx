/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import type useWebsocketSimulator from '../viewmodel/useWebsocketSimulator';

interface Props extends ReturnType<typeof useWebsocketSimulator> {}

export function WebsocketSimulatorView({
  curl,
  setCurl,
  payload,
  setPayload,
  payloads,
  addPayload,
  removePayload,
  hexMode,
  toggleMode,
  delay,
  setDelay,
  logs,
  connect,
  start,
  stop,
  clearLogs,
  saveProfile,
  exportLogFile,
}: Props) {
  return (
    <div className={TOOL_PANEL_CLASS}>
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">WebSocket PUB Simulator</h1>
      </header>
      <textarea
        className="w-full border p-2 mb-2 rounded"
        rows={3}
        placeholder="curl 'wss://example.com' -H 'Origin: https://site.com'"
        value={curl}
        onChange={(e) => setCurl(e.target.value)}
      />
      <div className="flex gap-2 mb-2">
        <button type="button" className="px-3 py-1 bg-primary-500 text-white rounded" onClick={connect}>
          Connect
        </button>
        <button type="button" className="px-3 py-1 bg-primary-500 text-white rounded" onClick={start}>
          Start
        </button>
        <button type="button" className="px-3 py-1 bg-primary-500 text-white rounded" onClick={stop}>
          Stop
        </button>
        <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={clearLogs}>
          Clear Logs
        </button>
        <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={saveProfile}>
          Save Profile
        </button>
        <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={exportLogFile}>
          Export Logs
        </button>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="number"
          className="border p-1 w-24"
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
        />
        <label htmlFor="hex-toggle" className="flex items-center gap-1">
          <input
            id="hex-toggle"
            type="checkbox"
            checked={hexMode}
            onChange={toggleMode}
          />
          HEX
        </label>
      </div>
      <textarea
        className="w-full border p-2 mb-2 rounded"
        rows={3}
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
      />
      <button type="button" className="px-3 py-1 bg-primary-500 text-white rounded mb-2" onClick={addPayload}>
        Add Payload
      </button>
      <ul className="mb-4 space-y-1">
        {payloads.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm">
            <span className="flex-1 break-all">{p}</span>
            <button type="button" className="text-red-600" onClick={() => removePayload(payloads.indexOf(p))}>
              remove
            </button>
          </li>
        ))}
      </ul>
      <div className="h-64 overflow-y-auto border p-2 rounded text-sm bg-gray-50 dark:bg-gray-900/20">
        {logs.map((l) => (
          <div key={l.time} className="break-all">
            <span className="mr-2 text-xs text-gray-500">
              {new Date(l.time).toLocaleTimeString()} {l.direction} ({l.size}b)
            </span>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WebsocketSimulatorView;
