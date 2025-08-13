/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import React, { useState } from 'react';
import { Card } from '../../../design-system/components/layout/Card';
import { Collapsible } from '../../../design-system/components/layout/Collapsible';
import { Button, TextInput } from '../../../design-system/components/inputs';
import { usePushTester } from '../hooks/usePushTester';
import { getSupportedFields } from '../lib/pushTester';

export default function PushTester() {
  const {
    support,
    platform,
    registration,
    subscription,
    payload,
    headers,
    status,
    logs,
    vapidKey,
    validationErrors,
    sendMode,
    setVapidKey,
    setSendMode,
    updatePayloadField,
    updateHeaderField,
    register,
    subscribe,
    sendPush,
    copySubscription,
    copyPayload,
    generateCurlExample,
    resetToExample,
    cleanup,
    addAction,
    removeAction,
    updateAction,
  } = usePushTester();

  const [activeSection, setActiveSection] = useState<string>('setup');
  const supportedFields = getSupportedFields(platform);

  const sections = [
    { id: 'setup', label: 'Setup & Status', icon: '⚙️' },
    { id: 'basic', label: 'Basic Fields', icon: '📝' },
    { id: 'media', label: 'Media & Visuals', icon: '🖼️' },
    { id: 'behavior', label: 'Behavior', icon: '🎯' },
    { id: 'actions', label: 'Actions', icon: '🔘' },
    { id: 'headers', label: 'Transport Headers', icon: '📡' },
    { id: 'examples', label: 'Examples & Export', icon: '📋' },
  ];

  const getFieldSupport = (field: keyof typeof payload) => {
    if (supportedFields.includes(field)) return '✅';
    if (field === 'title' || field === 'body' || field === 'icon' || field === 'badge') return '✅';
    return '❌';
  };

  const renderPlatformInfo = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-medium text-blue-900 mb-2">Platform Detection</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Browser: <span className="font-mono">{platform.browser}</span></div>
        <div>OS: <span className="font-mono">{platform.os}</span></div>
        <div>Mobile: {platform.mobile ? '✅' : '❌'}</div>
        <div>Actions: {platform.supportsActions ? '✅' : '❌'}</div>
        <div>Images: {platform.supportsImage ? '✅' : '❌'}</div>
        <div>Vibration: {platform.supportsVibrate ? '✅' : '❌'}</div>
      </div>
      {platform.requiresClickForClose && (
        <div className="mt-2 text-orange-700 text-sm">
          ⚠️ Safari requires user interaction to close notifications
        </div>
      )}
      
      {/* iOS Safari specific instructions */}
      {platform.browser === 'safari' && platform.os === 'ios' && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h5 className="font-medium text-yellow-800 mb-2">📱 iOS Safari Setup Required</h5>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>For push notifications on iOS Safari, you must:</p>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Add this site to your Home Screen</li>
              <li>Open the app from the Home Screen icon</li>
              <li>Grant notification permissions when prompted</li>
            </ol>
            <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
              <strong>To add to Home Screen:</strong><br />
              1. Tap the Share button (□↑)<br />
              2. Scroll and tap "Add to Home Screen"<br />
              3. Tap "Add" to confirm
            </div>
          </div>
        </div>
      )}
      
      {/* Browser-specific warnings */}
      {platform.browser === 'safari' && platform.os !== 'ios' && (
        <div className="mt-2 text-blue-700 text-sm bg-blue-50 border border-blue-200 rounded p-2">
          ℹ️ Desktop Safari: Push notifications work but some advanced features may be limited
        </div>
      )}
      
      {platform.browser === 'firefox' && (
        <div className="mt-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded p-2">
          ✅ Firefox: Full Web Push support with all features
        </div>
      )}
      
      {(platform.browser === 'chrome' || platform.browser === 'edge') && (
        <div className="mt-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded p-2">
          ✅ {platform.browser === 'chrome' ? 'Chrome' : 'Edge'}: Full Web Push support with all features
        </div>
      )}
    </div>
  );

  const renderSetupSection = () => (
    <div className="space-y-4">
      <Card shadowed>
        <Card.Header title="Browser Support" />
        <Card.Body>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              <span>{support.secure ? '✅' : '❌'}</span>
              <span>Secure Context (HTTPS)</span>
              {!support.secure && <span className="text-red-600 text-xs">(Required for Web Push)</span>}
            </li>
            <li className="flex items-center gap-2">
              <span>{support.serviceWorker ? '✅' : '❌'}</span>
              <span>Service Worker API</span>
            </li>
            <li className="flex items-center gap-2">
              <span>{support.pushManager ? '✅' : '❌'}</span>
              <span>Push Manager API</span>
            </li>
            <li className="flex items-center gap-2">
              <span>{support.notification ? '✅' : '❌'}</span>
              <span>Notifications API</span>
            </li>
          </ul>
          {renderPlatformInfo()}
        </Card.Body>
      </Card>

      <Card shadowed>
        <Card.Header title="Notification Permissions" />
        <Card.Body className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Permission Status</p>
              <p className="text-sm text-gray-600">
                Status: <span className="font-mono">{typeof Notification !== 'undefined' ? Notification.permission : 'unavailable'}</span>
              </p>
            </div>
            {typeof Notification !== 'undefined' && Notification.permission === 'default' && (
              <Button
                onClick={async () => {
                  try {
                    const permission = await Notification.requestPermission();
                    console.log('Notification permission:', permission);
                  } catch (error) {
                    console.error('Permission request failed:', error);
                  }
                }}
                variant="secondary"
                size="sm"
              >
                Request Permission
              </Button>
            )}
          </div>
          
          {typeof Notification !== 'undefined' && Notification.permission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 text-sm">
                ❌ Notifications are blocked. To enable:
              </p>
              <ul className="text-red-600 text-xs mt-1 list-disc list-inside">
                <li>Click the 🔒 or ℹ️ icon in your browser's address bar</li>
                <li>Set "Notifications" to "Allow"</li>
                <li>Reload the page</li>
              </ul>
            </div>
          )}
          
          {typeof Notification !== 'undefined' && Notification.permission === 'granted' && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-green-700 text-sm">
                ✅ Notifications are enabled and ready to use!
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Card shadowed>
        <Card.Header title="VAPID Configuration" />
        <Card.Body className="space-y-4">
          <TextInput
            id="vapid"
            label="VAPID Public Key"
            value={vapidKey}
            onChange={(e) => setVapidKey(e.target.value)}
            placeholder="Base64 encoded VAPID public key"
            fullWidth
          />
          
          {!vapidKey && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-blue-700 text-sm mb-2">
                💡 Need a VAPID key for testing? Use this sample key:
              </p>
              <div className="flex gap-2">
                <code className="text-xs bg-white p-2 rounded border flex-1 break-all">
                  BEl62iUYgUivxIkv69yViEuiBIa40HI0DLzx-SaBhLNdsbT6nOEYRSqGhE03c9NXbM6Zg8YDGu9C0qNqx5R_EJw
                </code>
                <Button
                  onClick={() => setVapidKey('BEl62iUYgUivxIkv69yViEuiBIa40HI0DLzx-SaBhLNdsbT6nOEYRSqGhE03c9NXbM6Zg8YDGu9C0qNqx5R_EJw')}
                  variant="secondary"
                  size="sm"
                >
                  Use Sample
                </Button>
              </div>
              <p className="text-blue-600 text-xs mt-1">
                Note: This is for testing only. Generate your own keys for production use.
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={register}
              isDisabled={!support.serviceWorker || !!registration}
              variant={registration ? 'secondary' : 'primary'}
            >
              {registration ? '✅ Service Worker Registered' : 'Register Service Worker'}
            </Button>
            <Button
              onClick={subscribe}
              isDisabled={!registration || !!subscription || !vapidKey.trim()}
              variant={subscription ? 'secondary' : 'primary'}
            >
              {subscription ? '✅ Push Subscribed' : 'Subscribe to Push'}
            </Button>
          </div>
          
          {!support.secure && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 text-sm">
                ⚠️ Web Push requires a secure context (HTTPS). This may not work on HTTP.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );

  const renderBasicSection = () => (
    <Card shadowed>
      <Card.Header title="Basic Notification Fields" />
      <Card.Body className="space-y-4">
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span> {getFieldSupport('title')}
            </label>
            <TextInput
              value={payload.title}
              onChange={(e) => updatePayloadField('title', e.target.value)}
              placeholder="Notification title"
              fullWidth
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Body {getFieldSupport('body')}
            </label>
            <textarea
              value={payload.body || ''}
              onChange={(e) => updatePayloadField('body', e.target.value)}
              placeholder="Notification body text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Direction {getFieldSupport('dir')}
              </label>
              <select
                value={payload.dir || 'auto'}
                onChange={(e) => updatePayloadField('dir', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto</option>
                <option value="ltr">Left to Right</option>
                <option value="rtl">Right to Left</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Language {getFieldSupport('lang')}
              </label>
              <TextInput
                value={payload.lang || ''}
                onChange={(e) => updatePayloadField('lang', e.target.value)}
                placeholder="en-US"
                fullWidth
              />
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const renderMediaSection = () => (
    <Card shadowed>
      <Card.Header title="Media & Visual Elements" />
      <Card.Body className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Icon URL {getFieldSupport('icon')}
          </label>
          <TextInput
            value={payload.icon || ''}
            onChange={(e) => updatePayloadField('icon', e.target.value)}
            placeholder="https://example.com/icon.png"
            fullWidth
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Badge URL {getFieldSupport('badge')}
          </label>
          <TextInput
            value={payload.badge || ''}
            onChange={(e) => updatePayloadField('badge', e.target.value)}
            placeholder="https://example.com/badge.png"
            fullWidth
          />
        </div>
        
        {platform.supportsImage && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Image URL {getFieldSupport('image')}
            </label>
            <TextInput
              value={payload.image || ''}
              onChange={(e) => updatePayloadField('image', e.target.value)}
              placeholder="https://example.com/hero-image.jpg"
              fullWidth
            />
          </div>
        )}
      </Card.Body>
    </Card>
  );

  const renderBehaviorSection = () => (
    <Card shadowed>
      <Card.Header title="Notification Behavior" />
      <Card.Body className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Tag {getFieldSupport('tag')}
            </label>
            <TextInput
              value={payload.tag || ''}
              onChange={(e) => updatePayloadField('tag', e.target.value)}
              placeholder="notification-group"
              fullWidth
            />
          </div>
          
          {platform.supportsTimestamp && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Timestamp {getFieldSupport('timestamp')}
              </label>
              <TextInput
                type="datetime-local"
                value={payload.timestamp ? new Date(payload.timestamp).toISOString().slice(0, 16) : ''}
                onChange={(e) => updatePayloadField('timestamp', e.target.value ? new Date(e.target.value).getTime() : undefined)}
                fullWidth
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={payload.renotify || false}
              onChange={(e) => updatePayloadField('renotify', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Renotify {getFieldSupport('renotify')}</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={payload.silent || false}
              onChange={(e) => updatePayloadField('silent', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Silent {getFieldSupport('silent')}</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={payload.requireInteraction || false}
              onChange={(e) => updatePayloadField('requireInteraction', e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Require Interaction {getFieldSupport('requireInteraction')}</span>
          </label>
        </div>

        {platform.supportsVibrate && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Vibration Pattern {getFieldSupport('vibrate')}
            </label>
            <TextInput
              value={payload.vibrate?.join(',') || ''}
              onChange={(e) => updatePayloadField('vibrate', e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)))}
              placeholder="200,100,200"
              fullWidth
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated milliseconds (vibrate, pause, vibrate, ...)</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Custom Data (JSON)</label>
          <textarea
            value={JSON.stringify(payload.data || {}, null, 2)}
            onChange={(e) => {
              try {
                const data = JSON.parse(e.target.value);
                updatePayloadField('data', data);
              } catch {}
            }}
            placeholder='{"url": "https://example.com", "userId": 123}'
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows={4}
          />
        </div>
      </Card.Body>
    </Card>
  );

  const renderActionsSection = () => (
    <Card shadowed>
      <Card.Header title="Notification Actions" />
      <Card.Body className="space-y-4">
        {!platform.supportsActions ? (
          <div className="text-orange-600 bg-orange-50 border border-orange-200 rounded p-3">
            ⚠️ Actions are not supported on this platform
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Actions allow users to respond directly from the notification</p>
              <Button
                onClick={addAction}
                isDisabled={(payload.actions?.length || 0) >= 2}
                size="sm"
              >
                Add Action
              </Button>
            </div>
            
            {payload.actions?.map((action, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <h5 className="font-medium">Action {index + 1}</h5>
                  <Button
                    onClick={() => removeAction(index)}
                    variant="secondary"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <TextInput
                    label="Action ID"
                    value={action.action}
                    onChange={(e) => updateAction(index, 'action', e.target.value)}
                    placeholder="view"
                    fullWidth
                  />
                  <TextInput
                    label="Title"
                    value={action.title}
                    onChange={(e) => updateAction(index, 'title', e.target.value)}
                    placeholder="View Details"
                    fullWidth
                  />
                </div>
                
                <TextInput
                  label="Icon URL (optional)"
                  value={action.icon || ''}
                  onChange={(e) => updateAction(index, 'icon', e.target.value)}
                  placeholder="https://example.com/action-icon.png"
                  fullWidth
                />
              </div>
            ))}
          </>
        )}
      </Card.Body>
    </Card>
  );

  const renderHeadersSection = () => (
    <Card shadowed>
      <Card.Header title="Transport Headers & Protocol" />
      <Card.Body className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Send Mode</label>
          <div className="flex gap-2">
            <Button
              onClick={() => setSendMode('web-push')}
              variant={sendMode === 'web-push' ? 'primary' : 'secondary'}
              size="sm"
            >
              Raw Web Push
            </Button>
            <Button
              onClick={() => setSendMode('fcm-v1')}
              variant={sendMode === 'fcm-v1' ? 'primary' : 'secondary'}
              size="sm"
            >
              FCM v1 Envelope
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">TTL (seconds)</label>
            <TextInput
              type="number"
              value={headers.ttl?.toString() || ''}
              onChange={(e) => updateHeaderField('ttl', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="3600"
              fullWidth
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Urgency</label>
            <select
              value={headers.urgency || 'normal'}
              onChange={(e) => updateHeaderField('urgency', e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="very-low">Very Low</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Topic</label>
            <TextInput
              value={headers.topic || ''}
              onChange={(e) => updateHeaderField('topic', e.target.value)}
              placeholder="collapse-key"
              fullWidth
            />
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <h5 className="font-medium mb-2">Header Info</h5>
          <ul className="text-sm space-y-1">
            <li><strong>TTL:</strong> Time to live for message delivery</li>
            <li><strong>Urgency:</strong> Delivery priority hint</li>
            <li><strong>Topic:</strong> Collapse key for message replacement</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );

  const renderExamplesSection = () => (
    <div className="space-y-4">
      <Card shadowed>
        <Card.Header title="Send Notification" />
        <Card.Body className="space-y-4">
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <h5 className="font-medium text-red-800 mb-1">Validation Errors:</h5>
              <ul className="text-sm text-red-700 list-disc list-inside">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={sendPush}
              isDisabled={!subscription || validationErrors.length > 0}
              variant="primary"
            >
              🚀 Send Push Notification
            </Button>
            <Button
              onClick={copySubscription}
              isDisabled={!subscription}
              variant="secondary"
            >
              📋 Copy Subscription
            </Button>
            <Button
              onClick={copyPayload}
              variant="secondary"
            >
              📋 Copy Payload
            </Button>
            <Button
              onClick={resetToExample}
              variant="secondary"
            >
              🔄 Reset to Example
            </Button>
          </div>
        </Card.Body>
      </Card>

      {subscription && (
        <>
          <Collapsible title="🌐 cURL Example">
            <pre className="text-xs whitespace-pre-wrap break-all bg-gray-50 p-3 rounded border font-mono">
              {generateCurlExample()}
            </pre>
          </Collapsible>

          <Collapsible title="📱 Push Subscription">
            <pre className="text-xs whitespace-pre-wrap break-all bg-gray-50 p-3 rounded border font-mono">
              {JSON.stringify(subscription, null, 2)}
            </pre>
          </Collapsible>

          <Collapsible title="📦 Current Payload">
            <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded border font-mono">
              {JSON.stringify(sendMode === 'fcm-v1' ? {
                notification: payload,
                headers,
                fcmOptions: {
                  link: payload.data?.url || 'https://mydebugger.dev',
                  analyticsLabel: 'push_test'
                }
              } : { notification: payload, headers }, null, 2)}
            </pre>
          </Collapsible>
        </>
      )}
    </div>
  );

  const renderStatusSection = () => (
    <Card shadowed>
      <Card.Header title="Status & Logs" />
      <Card.Body className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className={`p-3 rounded ${registration ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="font-medium">{registration ? '✅' : '⬜'} Service Worker</div>
            <div className="text-xs text-gray-600">Registration Status</div>
          </div>
          <div className={`p-3 rounded ${subscription ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="font-medium">{subscription ? '✅' : '⬜'} Push Subscription</div>
            <div className="text-xs text-gray-600">Subscription Status</div>
          </div>
          <div className={`p-3 rounded ${status === 'notified' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="font-medium">{status === 'notified' ? '✅' : '⬜'} Notification Sent</div>
            <div className="text-xs text-gray-600">Send Status</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="secondary" onClick={cleanup}>
            🗑️ Cleanup & Reset
          </Button>
        </div>
        
        <Collapsible title="📋 Activity Logs">
          <div className="bg-gray-50 p-3 rounded border max-h-48 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {logs.length > 0 ? logs.join('\n') : 'No activity yet...'}
            </pre>
          </div>
        </Collapsible>
      </Card.Body>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {sections.map((section) => (
          <Button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            variant={activeSection === section.id ? 'primary' : 'secondary'}
            size="sm"
          >
            {section.icon} {section.label}
          </Button>
        ))}
      </div>

      {/* Content Sections */}
      {activeSection === 'setup' && renderSetupSection()}
      {activeSection === 'basic' && renderBasicSection()}
      {activeSection === 'media' && renderMediaSection()}
      {activeSection === 'behavior' && renderBehaviorSection()}
      {activeSection === 'actions' && renderActionsSection()}
      {activeSection === 'headers' && renderHeadersSection()}
      {activeSection === 'examples' && renderExamplesSection()}
      
      {/* Always show status at bottom */}
      {renderStatusSection()}
    </div>
  );
};

