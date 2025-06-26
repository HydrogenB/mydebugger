/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React from 'react';
import { Card } from '../src/design-system/components/layout/Card';
import { Collapsible } from '../src/design-system/components/layout/Collapsible';
import { Button, TextInput } from '../src/design-system/components/inputs';
import { usePushTester } from '../viewmodel/usePushTester';

export default function PushTester() {
  const {
    support,
    registration,
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
    copySubscription,
    cleanup,
  } = usePushTester();

  const steps = [
    { key: 'registered', label: 'Service Worker Registered' },
    { key: 'subscribed', label: 'Push Subscribed' },
    { key: 'notified', label: 'Notification Sent' },
  ];

  const statusIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="space-y-4">
      <Card shadowed>
        <Card.Header title="Setup Web Push" />
        <Card.Body className="space-y-4">
          <ul className="text-sm list-disc ml-4">
            <li>Secure Context: {support.secure ? '✅' : '❌'}</li>
            <li>Service Worker: {support.serviceWorker ? '✅' : '❌'}</li>
            <li>PushManager: {support.pushManager ? '✅' : '❌'}</li>
            <li>Notification: {support.notification ? '✅' : '❌'}</li>
          </ul>
          <TextInput
            id="vapid"
            label="VAPID Public Key"
            value={vapidKey}
            onChange={(e) => setVapidKey(e.target.value)}
            placeholder="Base64 encoded VAPID key"
            fullWidth
          />
          <div className="flex gap-2">
            <Button
              onClick={register}
              isDisabled={!support.serviceWorker || !!registration}
            >
              Register SW
            </Button>
            <Button
              onClick={subscribe}
              isDisabled={!registration || !!subscription}
            >
              Subscribe
            </Button>
          </div>
        </Card.Body>
      </Card>

      {subscription && (
        <Card shadowed>
          <Card.Header title="Send Test Notification" />
          <Card.Body className="space-y-4">
            <TextInput
              id="title"
              label="Notification Title"
              value={payload.title}
              onChange={(e) => setPayload({ ...payload, title: e.target.value })}
              fullWidth
            />
            <TextInput
              id="body"
              label="Notification Body"
              value={payload.body}
              onChange={(e) => setPayload({ ...payload, body: e.target.value })}
              fullWidth
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={sendPush}>Send push</Button>
              <Button variant="secondary" onClick={copySubscription}>
                Copy Subscription
              </Button>
            </div>
            <Collapsible title="View Subscription">
              <pre className="text-xs whitespace-pre-wrap break-all">
                {JSON.stringify(subscription, null, 2)}
              </pre>
            </Collapsible>
          </Card.Body>
        </Card>
      )}

      <Card shadowed>
        <Card.Header title="Status" />
        <Card.Body className="space-y-4">
          <ol className="space-y-1 text-sm ml-4">
            {steps.map((step, idx) => (
              <li key={step.key} className="flex items-center gap-2">
                <span>{statusIndex >= idx ? '✅' : '⬜'}</span>
                <span>{step.label}</span>
              </li>
            ))}
          </ol>
          <Button variant="secondary" onClick={cleanup}>Cleanup</Button>
          <Collapsible title="Logs">
            <pre className="text-xs whitespace-pre-wrap">
              {logs.join('\n')}
            </pre>
          </Collapsible>
        </Card.Body>
      </Card>
    </div>
  );
};

