/*
 * Lightweight Google Analytics (GA4) helper for global click + page tracking
 */

// Type-safe window.gtag reference
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventParams = Record<string, unknown> & {
  page_path?: string;
  page_title?: string;
  page_location?: string;
};

let isAnalyticsInitialized = false;
let isClickListenerBound = false;
let isCopyListenerBound = false;

const getMeasurementId = (): string | undefined => {
  // Vite-style env var (must be prefixed with VITE_)
  const id = (import.meta as any)?.env?.VITE_GA_MEASUREMENT_ID as string | undefined;
  return id && id.trim().length > 0 ? id : undefined;
};

export const initAnalytics = (): void => {
  if (isAnalyticsInitialized) return;
  const measurementId = getMeasurementId();
  if (!measurementId) return;

  // Avoid running on localhost unless explicitly configured
  const isLocalhost = /localhost|127\.0\.0\.1/.test(window.location.hostname);
  if (isLocalhost && (import.meta as any)?.env?.VITE_GA_DISABLE_ON_LOCALHOST !== 'false') {
    return;
  }

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    (window.dataLayer as unknown[]).push(arguments);
  } as unknown as typeof window.gtag;

  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Configure GA4; disable auto page_view so we manually control SPA navigations
  if (typeof window.gtag === 'function') {
    window.gtag('js', new Date() as unknown as string);
    window.gtag('config', measurementId, { send_page_view: false });
  }

  isAnalyticsInitialized = true;
};

export const logEvent = (eventName: string, params: AnalyticsEventParams = {}): void => {
  if (!window.gtag) return;
  const merged = { ...getStoredUtmParams(), ...params } as AnalyticsEventParams;
  window.gtag('event', eventName, merged);
};

export const trackPageView = (pagePath?: string, pageTitle?: string): void => {
  const measurementId = getMeasurementId();
  if (!window.gtag || !measurementId) return;
  const path = pagePath ?? window.location.pathname + window.location.search;
  const title = pageTitle ?? document.title;
  logEvent('page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
};

export const updateUserProperties = (properties: Record<string, unknown>): void => {
  if (!window.gtag) return;
  window.gtag('set', 'user_properties', properties);
};

// Heuristic to extract a human-friendly label for the clicked element
const getElementLabel = (el: Element): string => {
  const datasetLabel = (el as HTMLElement).dataset?.analyticsLabel;
  if (datasetLabel) return datasetLabel;
  const aria = (el as HTMLElement).getAttribute('aria-label');
  if (aria) return aria;
  const title = (el as HTMLElement).getAttribute('title');
  if (title) return title;
  const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
  return text.length > 120 ? text.slice(0, 117) + '…' : text;
};

const findClickable = (start: Element | null): Element | null => {
  let node: Element | null = start;
  while (node) {
    const tag = node.tagName?.toLowerCase();
    const role = (node as HTMLElement).getAttribute?.('role');
    if (
      tag === 'a' ||
      tag === 'button' ||
      (role === 'button') ||
      (node as HTMLElement).dataset?.analyticsEvent
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

const handleGlobalClick = (evt: MouseEvent): void => {
  const target = evt.target as Element | null;
  const clickable = findClickable(target);
  if (!clickable) return;

  // Allow element to opt-out
  if ((clickable as HTMLElement).dataset?.analyticsIgnore === 'true') return;

  let eventName = (clickable as HTMLElement).dataset?.analyticsEvent || 'ui_click';
  const label = getElementLabel(clickable);
  const tag = clickable.tagName?.toLowerCase();

  const params: AnalyticsEventParams = {
    element_tag: tag,
    element_id: (clickable as HTMLElement).id || undefined,
    element_classes: (clickable as HTMLElement).className || undefined,
    element_text: label || undefined,
    page_path: window.location.pathname + window.location.search,
    page_title: document.title,
    page_location: window.location.href,
  } as AnalyticsEventParams;

  if (tag === 'a') {
    const anchor = clickable as HTMLAnchorElement;
    const href = anchor.href;
    if (href) (params as any).link_url = href;
    const url = (() => { try { return new URL(href); } catch { return null; } })();
    if (url) {
      const isExternal = url.origin !== window.location.origin;
      const isDownload = anchor.hasAttribute('download') || /\.(pdf|zip|csv|xlsx?|png|jpe?g|gif|webp|svg|mp4|mov|apk|exe|dmg)$/i.test(url.pathname);
      if (isDownload) {
        eventName = 'file_download';
        (params as any).file_extension = (url.pathname.split('.').pop() || '').toLowerCase();
      } else if (isExternal) {
        eventName = 'click_outbound';
        (params as any).link_domain = url.hostname;
      }
    }
  }

  logEvent(eventName, params);
};

export const bindGlobalClickTracking = (): void => {
  if (isClickListenerBound) return;
  document.addEventListener('click', handleGlobalClick, { capture: true });
  isClickListenerBound = true;
};

export const unbindGlobalClickTracking = (): void => {
  if (!isClickListenerBound) return;
  document.removeEventListener('click', handleGlobalClick, { capture: true } as any);
  isClickListenerBound = false;
};

// Copy tracking
const handleCopy = (): void => {
  try {
    const selection = document.getSelection?.()?.toString() || '';
    logEvent('copy', {
      selection_length: selection.length,
      page_path: window.location.pathname + window.location.search,
    });
  } catch {}
};

export const bindCopyTracking = (): void => {
  if (isCopyListenerBound) return;
  document.addEventListener('copy', handleCopy, true);
  isCopyListenerBound = true;
};

// Scroll depth tracking
let lastScrollBucketByPath: Record<string, number> = {};
const scrollBuckets = [25, 50, 75, 100];

const onScroll = (): void => {
  const doc = document.documentElement;
  const path = window.location.pathname + window.location.search;
  const scrollTop = window.scrollY || doc.scrollTop;
  const viewport = window.innerHeight;
  const fullHeight = Math.max(doc.scrollHeight, doc.offsetHeight);
  if (fullHeight <= viewport) return; // no scroll
  const percent = Math.min(100, Math.round(((scrollTop + viewport) / fullHeight) * 100));
  const reached = scrollBuckets.find((b) => percent >= b);
  if (!reached) return;
  const last = lastScrollBucketByPath[path] || 0;
  if (reached > last) {
    lastScrollBucketByPath[path] = reached;
    logEvent('scroll_depth', {
      percent: reached,
      page_path: path,
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

export const bindScrollDepthTracking = (resetForPath?: string): void => {
  if (resetForPath) {
    lastScrollBucketByPath[resetForPath] = 0;
  }
  window.removeEventListener('scroll', onScroll, true);
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  // fire once shortly after to capture small pages
  setTimeout(onScroll, 300);
};

// Error tracking
let errorBound = false;
export const bindErrorTracking = (): void => {
  if (errorBound) return;
  window.addEventListener('error', (e) => {
    try {
      logEvent('exception', {
        description: (e.error && (e.error.stack || e.message)) || e.message || 'unknown',
        fatal: true,
        page_path: window.location.pathname + window.location.search,
      });
    } catch {}
  });
  window.addEventListener('unhandledrejection', (e) => {
    try {
      const reason = (e as PromiseRejectionEvent).reason as any;
      const message = typeof reason === 'string' ? reason : (reason?.message || 'unhandledrejection');
      logEvent('exception', {
        description: message,
        fatal: false,
        page_path: window.location.pathname + window.location.search,
      });
    } catch {}
  });
  errorBound = true;
};

// UTM capture and persistence
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
type UtmKey = typeof UTM_KEYS[number];

export const captureAndStoreUtmParams = (): Record<string, string> => {
  const url = new URL(window.location.href);
  const found: Record<string, string> = {};
  UTM_KEYS.forEach((k) => {
    const v = url.searchParams.get(k);
    if (v) found[k] = v;
  });
  if (Object.keys(found).length > 0) {
    try { sessionStorage.setItem('ga_utms', JSON.stringify(found)); } catch {}
  }
  return found;
};

export const getStoredUtmParams = (): Record<string, string> => {
  try {
    const raw = sessionStorage.getItem('ga_utms');
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
};

// Basic Web Vitals (approx) without external deps
let webVitalsBound = false;
export const bindBasicWebVitals = (): void => {
  if (webVitalsBound || typeof PerformanceObserver === 'undefined') return;
  try {
    // CLS
    let clsValue = 0;
    const cls = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntryList) {
        const e = entry as any;
        if (!e.hadRecentInput) clsValue += e.value || 0;
      }
      logEvent('web_vital', { metric: 'CLS', value: Number(clsValue.toFixed(4)) });
    });
    // type cast guard
    try { cls.observe({ type: 'layout-shift', buffered: true } as any); } catch {}

    // LCP
    const lcp = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as any;
      if (last) logEvent('web_vital', { metric: 'LCP', value: Math.round(last.renderTime || last.loadTime || last.startTime) });
    });
    try { lcp.observe({ type: 'largest-contentful-paint', buffered: true } as any); } catch {}

    // FID (legacy first-input)
    const fid = new PerformanceObserver((list) => {
      const first = list.getEntries()[0] as any;
      if (first) logEvent('web_vital', { metric: 'FID', value: Math.round(first.processingStart - first.startTime) });
    });
    try { fid.observe({ type: 'first-input', buffered: true } as any); } catch {}

    webVitalsBound = true;
  } catch {
    // ignore
  }
};


