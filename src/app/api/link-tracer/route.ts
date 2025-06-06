/**
 * © 2025 MyDebugger Contributors – MIT License
 */
import { NextResponse } from 'next/server';
import { traceLink } from '@/model/linkTracer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }
  try {
    const steps = await traceLink(url);
    return NextResponse.json(steps);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
