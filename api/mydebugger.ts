/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

export const runtime = 'edge';

const VAPID = {
  publicKey: process.env.VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
  subject: process.env.VAPID_SUBJECT || 'mailto:support@mydebugger.dev'
};

webpush.setVapidDetails(VAPID.subject, VAPID.publicKey, VAPID.privateKey);

export async function POST(req: NextRequest) {
  const { action, ...payload } = await req.json();
  switch (action) {
    case 'push-echo':
      return pushEcho(payload as any);
    default:
      return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  }
}

async function pushEcho({ subscription, notification }: { subscription: any; notification: any }) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(notification));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
