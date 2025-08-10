/**
 * © 2025 MyDebugger Contributors – MIT License
 */
export interface DynamicLinkTrace {
  params: Record<string, string>;
  sourceUrl: string;
  timestamp: number;
}

export const parseQueryParams = (search: string): Record<string, string> => {
  try {
    const params = new URLSearchParams(
      search.startsWith("?") ? search : `?${search}`,
    );
    const obj: Record<string, string> = {};
    params.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  } catch {
    return {};
  }
};

export const storeTrace = (trace: DynamicLinkTrace): void => {
  try {
    sessionStorage.setItem("dynamic_link_trace", JSON.stringify(trace));
  } catch {
    // ignore storage errors
  }
};

export const loadTrace = (): DynamicLinkTrace | null => {
  try {
    const raw = sessionStorage.getItem("dynamic_link_trace");
    return raw ? (JSON.parse(raw) as DynamicLinkTrace) : null;
  } catch {
    return null;
  }
};
