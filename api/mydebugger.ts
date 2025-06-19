/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import webpush from 'web-push';

export const config = { runtime: 'edge' };

const VAPID = {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
  subject: process.env.VAPID_SUBJECT || 'mailto:support@mydebugger.dev'
};

webpush.setVapidDetails(VAPID.subject, VAPID.publicKey, VAPID.privateKey);

export default async function handler(req: Request) {
  const { action, subscription, notification } = await req.json();
  if (action !== 'push-echo') {
    return new Response(JSON.stringify({ ok: false, error: 'Unknown action' }), { status: 400 });
  }
  try {
    await webpush.sendNotification(subscription, JSON.stringify(notification));
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}
