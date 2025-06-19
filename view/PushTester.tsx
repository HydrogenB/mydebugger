/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { TOOL_PANEL_CLASS } from '../src/design-system/foundations/layout';
import { usePushTester } from '../viewmodel/usePushTester';

export default function PushTester() {
  const {
    support,
    subscription,
    payload,
    setPayload,
    vapidKey,
    setVapidKey,
    status,
    logs,
    register,
    subscribe,
    sendPush,
    cleanup,
  } = usePushTester();

  return (
    <div className="space-y-4">
      <div className={`${TOOL_PANEL_CLASS} space-y-2`}>
        <h2 className="font-semibold">Support</h2>
        <ul className="text-sm list-disc ml-4">
          <li>Secure Context: {support.secure ? '✅' : '❌'}</li>
          <li>Service Worker: {support.serviceWorker ? '✅' : '❌'}</li>
          <li>PushManager: {support.pushManager ? '✅' : '❌'}</li>
          <li>Notification: {support.notification ? '✅' : '❌'}</li>
        </ul>
      </div>

      <div className={`${TOOL_PANEL_CLASS} space-y-3`}>
        <label htmlFor="vapid" className="block text-sm font-medium">VAPID Public Key</label>
        <input
          id="vapid"
          type="text"
          className="w-full rounded-md border-gray-300 p-2"
          value={vapidKey}
          onChange={e => setVapidKey(e.target.value)}
          placeholder="Base64 encoded VAPID key"
        />
        <button type="button" onClick={register} className="px-3 py-1 bg-primary-500 text-white rounded-md">
          Register Service Worker
        </button>
        <button type="button" onClick={subscribe} className="px-3 py-1 bg-primary-500 text-white rounded-md">
          Subscribe
        </button>
      </div>

      {subscription && (
        <div className={`${TOOL_PANEL_CLASS} space-y-3`}>
          <label htmlFor="title" className="block text-sm font-medium">Notification Title</label>
          <input
            id="title"
            type="text"
            className="w-full rounded-md border-gray-300 p-2"
            value={payload.title}
            onChange={e => setPayload({ ...payload, title: e.target.value })}
          />
          <label htmlFor="body" className="block text-sm font-medium">Notification Body</label>
          <textarea
            id="body"
            className="w-full rounded-md border-gray-300 p-2"
            value={payload.body}
            onChange={e => setPayload({ ...payload, body: e.target.value })}
            rows={2}
          />
          <button type="button" onClick={sendPush} className="px-3 py-1 bg-primary-500 text-white rounded-md">
            Send test push
          </button>
        </div>
      )}

      <div className={`${TOOL_PANEL_CLASS} space-y-2`}>
        <h2 className="font-semibold">Status: {status}</h2>
        <button type="button" onClick={cleanup} className="px-3 py-1 bg-gray-200 rounded-md">
          Cleanup
        </button>
        <div className="text-xs text-gray-500 whitespace-pre-wrap">
          {logs.map((l, i) => (
            <div key={`${i}-${l}`}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

