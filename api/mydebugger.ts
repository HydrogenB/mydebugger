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

// Configure web-push with VAPID details
if (VAPID.publicKey && VAPID.privateKey) {
  webpush.setVapidDetails(VAPID.subject, VAPID.publicKey, VAPID.privateKey);
}

export async function POST(req: NextRequest) {
  try {
    const { action, ...payload } = await req.json();
    
    switch (action) {
      case 'push-echo':
        // Legacy support for existing basic push
        return pushEcho(payload as any);
      case 'push-web-push':
        // Enhanced web push with transport headers
        return pushWebPush(payload as any);
      case 'push-fcm-v1':
        // FCM v1 webpush envelope format
        return pushFCMv1(payload as any);
      case 'push-telemetry':
        // Handle telemetry from service worker
        return handleTelemetry(payload as any);
      default:
        return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// Legacy push echo for backwards compatibility
async function pushEcho({ subscription, notification }: { subscription: any; notification: any }) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(notification));
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Push echo error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// Enhanced web push with full transport headers support
async function pushWebPush({ 
  subscription, 
  notification, 
  headers = {} 
}: { 
  subscription: any; 
  notification: any; 
  headers?: any;
}) {
  try {
    console.log('Sending enhanced web push notification:', {
      endpoint: subscription.endpoint,
      notification: notification.title,
      headers
    });

    // Build web-push options with transport headers
    const options: any = {};
    
    // Set TTL (Time To Live)
    if (headers.ttl !== undefined) {
      options.TTL = headers.ttl;
    }
    
    // Set Urgency
    if (headers.urgency) {
      options.urgency = headers.urgency;
    }
    
    // Set Topic (collapse key)
    if (headers.topic) {
      options.topic = headers.topic;
    }

    // Additional headers can be set via headers object
    if (headers.headers) {
      options.headers = headers.headers;
    }

    const result = await webpush.sendNotification(
      subscription, 
      JSON.stringify(notification),
      options
    );

    console.log('Web push sent successfully:', result);
    
    return NextResponse.json({ 
      ok: true, 
      result: {
        statusCode: result.statusCode,
        headers: Object.fromEntries(result.headers?.entries() || [])
      }
    });
  } catch (err: any) {
    console.error('Enhanced web push error:', err);
    
    // Provide more detailed error information
    const errorInfo = {
      message: err.message,
      statusCode: err.statusCode,
      headers: err.headers ? Object.fromEntries(err.headers.entries()) : undefined,
      body: err.body
    };
    
    return NextResponse.json({ 
      ok: false, 
      error: err.message,
      details: errorInfo
    }, { status: err.statusCode || 500 });
  }
}

// FCM v1 webpush envelope support
async function pushFCMv1({ 
  subscription, 
  payload 
}: { 
  subscription: any; 
  payload: any;
}) {
  try {
    console.log('Sending FCM v1 webpush notification:', {
      endpoint: subscription.endpoint,
      notification: payload.notification?.title,
      headers: payload.headers,
      fcmOptions: payload.fcmOptions
    });

    // Extract notification and headers from FCM v1 envelope
    const { notification, headers = {}, fcmOptions = {} } = payload;
    
    // Build web-push options from FCM envelope
    const options: any = {};
    
    // Map FCM headers to web-push options
    if (headers.ttl !== undefined) {
      options.TTL = headers.ttl;
    }
    
    if (headers.urgency) {
      options.urgency = headers.urgency;
    }
    
    if (headers.topic) {
      options.topic = headers.topic;
    }

    // Handle FCM-specific options
    const enhancedNotification = {
      ...notification,
      // Add FCM click target if specified
      data: {
        ...notification.data,
        fcm_options: fcmOptions.link ? { link: fcmOptions.link } : undefined,
        analytics_label: fcmOptions.analyticsLabel
      }
    };

    // Clean up undefined values
    if (!enhancedNotification.data.fcm_options) {
      delete enhancedNotification.data.fcm_options;
    }
    if (!enhancedNotification.data.analytics_label) {
      delete enhancedNotification.data.analytics_label;
    }

    const result = await webpush.sendNotification(
      subscription, 
      JSON.stringify(enhancedNotification),
      options
    );

    console.log('FCM v1 webpush sent successfully:', result);
    
    return NextResponse.json({ 
      ok: true,
      format: 'fcm-v1',
      result: {
        statusCode: result.statusCode,
        headers: Object.fromEntries(result.headers?.entries() || [])
      }
    });
  } catch (err: any) {
    console.error('FCM v1 webpush error:', err);
    
    const errorInfo = {
      message: err.message,
      statusCode: err.statusCode,
      headers: err.headers ? Object.fromEntries(err.headers.entries()) : undefined,
      body: err.body
    };
    
    return NextResponse.json({ 
      ok: false, 
      error: err.message,
      format: 'fcm-v1',
      details: errorInfo
    }, { status: err.statusCode || 500 });
  }
}

// Handle telemetry from service worker
async function handleTelemetry({ 
  type, 
  data 
}: { 
  type: 'click' | 'close'; 
  data: any;
}) {
  try {
    console.log(`Push notification ${type} telemetry:`, {
      type,
      action: data.action,
      tag: data.notificationTag,
      timestamp: data.timestamp
    });
    
    // In a real application, you might want to:
    // 1. Store telemetry in a database
    // 2. Send to analytics service
    // 3. Update user engagement metrics
    // 4. Trigger follow-up actions
    
    // For now, just log and acknowledge
    return NextResponse.json({ 
      ok: true, 
      telemetry: {
        type,
        recorded: new Date().toISOString(),
        data: {
          action: data.action,
          tag: data.notificationTag,
          timestamp: data.timestamp
        }
      }
    });
  } catch (err: any) {
    console.error('Telemetry handling error:', err);
    return NextResponse.json({ 
      ok: false, 
      error: err.message 
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'mydebugger-push-api',
    features: [
      'push-echo',
      'push-web-push',
      'push-fcm-v1',
      'push-telemetry'
    ],
    vapid: {
      configured: !!(VAPID.publicKey && VAPID.privateKey),
      subject: VAPID.subject
    },
    timestamp: new Date().toISOString()
  });
}
