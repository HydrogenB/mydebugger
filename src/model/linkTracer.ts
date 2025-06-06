/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface TraceStep {
  url: string;
  status: number;
}

/**
 * Trace the redirect chain for a given URL.
 * @param url starting URL to trace
 * @param maxHops maximum redirects to follow
 */
export async function traceLink(url: string, maxHops = 10): Promise<TraceStep[]> {
  const steps: TraceStep[] = [];
  let currentUrl = url;
  let hops = 0;
  while (hops < maxHops) {
    const response = await fetch(currentUrl, { redirect: 'manual' });
    steps.push({ url: currentUrl, status: response.status });
    const location = response.headers.get('location');
    if (
      location &&
      response.status >= 300 &&
      response.status < 400
    ) {
      currentUrl = new URL(location, currentUrl).toString();
      hops += 1;
    } else {
      break;
    }
  }
  return steps;
}
