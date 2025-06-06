/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface TraceStep {
  url: string;
  status?: number;
  error?: string;
}

/**
 * Trace the redirect chain for a given URL.
 * @param url starting URL to trace
 * @param maxHops maximum redirects to follow
 */
export async function traceLink(
  url: string,
  maxHops = 10,
): Promise<TraceStep[]> {
  const steps: TraceStep[] = [];
  try {
    // Validate starting URL
    // eslint-disable-next-line no-new
    new URL(url);
  } catch {
    throw new Error('Invalid URL');
  }

  const visited = new Set<string>();
  let currentUrl = url;
  let hops = 0;

  while (hops < maxHops) {
    if (visited.has(currentUrl)) {
      steps.push({ url: currentUrl, error: 'Redirect loop detected' });
      break;
    }
    visited.add(currentUrl);

    try {
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
        continue;
      }
    } catch (err) {
      steps.push({ url: currentUrl, error: (err as Error).message });
    }
    break;
  }

  if (hops === maxHops && visited.has(currentUrl)) {
    steps.push({ url: currentUrl, error: 'Maximum redirect limit reached' });
  }

  return steps;
}
